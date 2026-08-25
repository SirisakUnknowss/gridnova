-- Admin "Game Mode" tab: overview (pie chart + summary cards) and per-mode
-- player drill-down.
--
-- Data-model caveat (see CLAUDE.md / conversation): Book Mode reuses the same
-- practice game engine and is submitted to the server as mode='practice' —
-- there is no server-side field distinguishing Book from ordinary Practice,
-- so historical score stats can't separate them. Random Mode has no per-game
-- score history at all (by design — win/loss streak only, see
-- record_random_mode_result()). Both gaps are covered using what data does
-- exist: session_views navigation counts (accurate per-mode in real time,
-- including Book) stand in for "engagement" where score history can't help.
--
-- hints_used >= 0 filters out a handful of corrupted legacy rows (a single
-- account's test session from 2026-06-30, hints_used as low as -9999960,
-- pre-dating the 2026-07-16 economy reset) that would otherwise blow up
-- avg/top score with a nonsense billion-point outlier.

CREATE OR REPLACE FUNCTION public.get_admin_game_mode_overview()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  DELETE FROM online_sessions WHERE last_seen < now() - interval '2 minutes';

  RETURN (
    SELECT json_agg(m ORDER BY m.sort_order)
    FROM (
      WITH view_map(mode_key, view_name, sort_order) AS (
        VALUES ('daily','game_daily',1), ('practice','game_practice',2),
               ('random','game_random',3), ('time_attack','game_time_attack',4),
               ('book','game_book',5)
      ),
      views_agg AS (
        SELECT vm.mode_key,
          count(*) FILTER (WHERE sv.visited_date = CURRENT_DATE) AS views_today,
          count(*) FILTER (WHERE sv.visited_date = CURRENT_DATE - 1) AS views_yesterday,
          count(*) AS views_total,
          count(DISTINCT sv.session_id) FILTER (WHERE sv.visited_date = CURRENT_DATE) AS active_sessions_today,
          count(DISTINCT sv.session_id) AS active_sessions_total
        FROM view_map vm
        LEFT JOIN session_views sv ON sv.view = vm.view_name
        GROUP BY vm.mode_key
      ),
      latest_view AS (
        SELECT os.session_id,
          (SELECT view FROM session_views sv WHERE sv.session_id = os.session_id
           ORDER BY sv.created_at DESC LIMIT 1) AS view
        FROM online_sessions os
      ),
      online_agg AS (
        SELECT view AS view_name, count(*) AS currently_playing
        FROM latest_view
        WHERE view IS NOT NULL
        GROUP BY view
      ),
      game_stats AS (
        SELECT 'daily' AS mode_key,
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE) AS games_today,
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE - 1) AS games_yesterday,
          count(*) AS games_total,
          round(avg(score))::int AS avg_score,
          max(score) AS top_score
        FROM (
          SELECT completed_at, score FROM user_game_history WHERE mode='daily' AND hints_used >= 0
          UNION ALL
          SELECT completed_at, score FROM guest_game_history WHERE mode='daily' AND hints_used >= 0
        ) t
        UNION ALL
        SELECT 'practice',
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE),
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE - 1),
          count(*),
          round(avg(score))::int,
          max(score)
        FROM (
          SELECT completed_at, score FROM user_game_history WHERE mode='practice' AND hints_used >= 0
          UNION ALL
          SELECT completed_at, score FROM guest_game_history WHERE mode='practice' AND hints_used >= 0
        ) t
        UNION ALL
        SELECT 'time_attack',
          count(*) FILTER (WHERE created_at::date = CURRENT_DATE),
          count(*) FILTER (WHERE created_at::date = CURRENT_DATE - 1),
          count(*),
          round(avg(score))::int,
          max(score)
        FROM time_attack_leaderboard
      ),
      random_stats AS (
        SELECT coalesce(sum(total_played),0) AS total_played, count(*) AS players, max(longest_win_streak) AS top_streak
        FROM random_mode_stats
      )
      SELECT
        vm.mode_key, vm.sort_order,
        coalesce(va.views_today,0) AS views_today,
        coalesce(va.views_yesterday,0) AS views_yesterday,
        coalesce(va.views_total,0) AS views_total,
        coalesce(va.active_sessions_today,0) AS active_sessions_today,
        coalesce(va.active_sessions_total,0) AS active_sessions_total,
        coalesce(oa.currently_playing,0) AS currently_playing,
        gs.games_today, gs.games_yesterday, gs.games_total, gs.avg_score, gs.top_score,
        CASE WHEN vm.mode_key='random' THEN rs.total_played END AS random_total_played,
        CASE WHEN vm.mode_key='random' THEN rs.players END AS random_players,
        CASE WHEN vm.mode_key='random' THEN rs.top_streak END AS random_top_streak
      FROM view_map vm
      LEFT JOIN views_agg va ON va.mode_key = vm.mode_key
      LEFT JOIN online_agg oa ON oa.view_name = vm.view_name
      LEFT JOIN game_stats gs ON gs.mode_key = vm.mode_key
      LEFT JOIN random_stats rs ON vm.mode_key='random'
    ) m
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_game_mode_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_game_mode_overview() TO authenticated;


CREATE OR REPLACE FUNCTION public.get_admin_game_mode_players(p_mode text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_mode IN ('daily', 'practice') THEN
    RETURN (
      WITH combined AS (
        SELECT h.user_id::text AS identity, false AS is_guest,
               h.completed_at, h.score
        FROM user_game_history h WHERE h.mode = p_mode AND h.hints_used >= 0
        UNION ALL
        SELECT g.session_id::text, true,
               g.completed_at, g.score
        FROM guest_game_history g WHERE g.mode = p_mode AND g.hints_used >= 0
      ),
      agg AS (
        SELECT identity, is_guest,
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE) AS games_today,
          count(*) FILTER (WHERE completed_at::date = CURRENT_DATE - 1) AS games_yesterday,
          count(*) AS games_total,
          round(avg(score))::int AS avg_score,
          max(score) AS top_score,
          max(completed_at) AS last_played
        FROM combined
        GROUP BY identity, is_guest
      )
      SELECT json_agg(row ORDER BY row.games_total DESC)
      FROM (
        SELECT a.*,
          CASE WHEN NOT a.is_guest THEN COALESCE(p.display_name, p.username, 'Member') END AS display_name,
          CASE WHEN NOT a.is_guest THEN p.username END AS username,
          CASE WHEN a.is_guest THEN gg.guest_display_id END AS guest_display_id
        FROM agg a
        LEFT JOIN profiles p ON NOT a.is_guest AND p.id = a.identity::uuid
        LEFT JOIN LATERAL (
          SELECT guest_display_id FROM guest_game_history
          WHERE session_id = a.identity::uuid ORDER BY completed_at DESC LIMIT 1
        ) gg ON a.is_guest
        LIMIT 500
      ) row
    );

  ELSIF p_mode = 'random' THEN
    RETURN (
      SELECT json_agg(row ORDER BY row.longest_win_streak DESC)
      FROM (
        SELECT r.user_id, COALESCE(p.display_name, p.username, 'Member') AS display_name, p.username,
          r.current_win_streak, r.longest_win_streak, r.total_played, r.updated_at AS last_played
        FROM random_mode_stats r
        LEFT JOIN profiles p ON p.id = r.user_id
        LIMIT 500
      ) row
    );

  ELSIF p_mode = 'time_attack' THEN
    RETURN (
      WITH agg AS (
        SELECT user_id,
          count(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS games_today,
          count(*) FILTER (WHERE created_at::date = CURRENT_DATE - 1) AS games_yesterday,
          count(*) AS games_total,
          round(avg(score))::int AS avg_score,
          max(score) AS top_score,
          max(created_at) AS last_played
        FROM time_attack_leaderboard
        GROUP BY user_id
      )
      SELECT json_agg(row ORDER BY row.top_score DESC)
      FROM (
        SELECT a.*, COALESCE(p.display_name, p.username, 'Member') AS display_name, p.username
        FROM agg a LEFT JOIN profiles p ON p.id = a.user_id
        LIMIT 500
      ) row
    );

  ELSIF p_mode = 'book' THEN
    RETURN (
      WITH agg AS (
        SELECT sv.session_id, sv.user_id,
          count(*) FILTER (WHERE sv.visited_date = CURRENT_DATE) AS visits_today,
          count(*) FILTER (WHERE sv.visited_date = CURRENT_DATE - 1) AS visits_yesterday,
          count(*) AS visits_total,
          max(sv.created_at) AS last_seen
        FROM session_views sv
        WHERE sv.view = 'game_book'
        GROUP BY sv.session_id, sv.user_id
      )
      SELECT json_agg(row ORDER BY row.visits_total DESC)
      FROM (
        SELECT a.*,
          CASE WHEN a.user_id IS NOT NULL THEN COALESCE(p.display_name, p.username, 'Member') END AS display_name,
          CASE WHEN a.user_id IS NOT NULL THEN p.username END AS username
        FROM agg a
        LEFT JOIN profiles p ON p.id = a.user_id
        LIMIT 500
      ) row
    );

  ELSE
    RAISE EXCEPTION 'invalid mode';
  END IF;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_game_mode_players(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_game_mode_players(text) TO authenticated;
