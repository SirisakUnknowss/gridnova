-- In-game announcements (News). Shown as a full-screen popup on launch and
-- listed in the Inbox. Some announcements ship in client code; these rows are
-- the ones the admin panel posts without a release.
--
-- Staging shares this database with production, so every row says which
-- builds may show it ('staging', 'production' or 'all').

CREATE TABLE IF NOT EXISTS public.announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body        text NOT NULL DEFAULT '' CHECK (char_length(body) <= 2000),
  image_url   text CHECK (image_url IS NULL OR image_url ~ '^https://'),
  cta_label   text CHECK (cta_label IS NULL OR char_length(cta_label) <= 40),
  cta_url     text CHECK (cta_url IS NULL OR cta_url ~ '^https://'),
  env         text NOT NULL DEFAULT 'staging' CHECK (env IN ('staging', 'production', 'all')),
  published   boolean NOT NULL DEFAULT false,
  starts_at   timestamptz NOT NULL DEFAULT now(),
  ends_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_live_idx
  ON public.announcements (published, starts_at DESC);

-- No direct table access; everything goes through the functions below.
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public read: published, in its time window, and meant for this build.
-- Guests call this with the anon key (they have no auth session).
CREATE OR REPLACE FUNCTION public.get_announcements(p_env text)
RETURNS SETOF json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'id', a.id, 'title', a.title, 'body', a.body, 'image_url', a.image_url,
    'cta_label', a.cta_label, 'cta_url', a.cta_url, 'starts_at', a.starts_at
  )
  FROM public.announcements a
  WHERE a.published
    AND a.starts_at <= now()
    AND (a.ends_at IS NULL OR a.ends_at > now())
    AND (a.env = 'all' OR a.env = CASE WHEN p_env = 'production' THEN 'production' ELSE 'staging' END)
  ORDER BY a.starts_at DESC
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public._is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.admin_list_announcements()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public._is_admin() THEN
    RETURN json_build_object('error', 'forbidden');
  END IF;
  RETURN COALESCE(
    (SELECT json_agg(row_to_json(a) ORDER BY a.starts_at DESC) FROM public.announcements a),
    '[]'::json
  );
END;
$$;

-- Insert when p_id is null, otherwise update that row.
CREATE OR REPLACE FUNCTION public.admin_save_announcement(
  p_id        uuid,
  p_title     text,
  p_body      text,
  p_image_url text,
  p_cta_label text,
  p_cta_url   text,
  p_env       text,
  p_published boolean,
  p_starts_at timestamptz,
  p_ends_at   timestamptz
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public._is_admin() THEN
    RETURN json_build_object('ok', false, 'error', 'forbidden');
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.announcements
      (title, body, image_url, cta_label, cta_url, env, published, starts_at, ends_at)
    VALUES
      (p_title, COALESCE(p_body, ''), NULLIF(p_image_url, ''), NULLIF(p_cta_label, ''),
       NULLIF(p_cta_url, ''), p_env, p_published, COALESCE(p_starts_at, now()), p_ends_at)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.announcements SET
      title = p_title, body = COALESCE(p_body, ''), image_url = NULLIF(p_image_url, ''),
      cta_label = NULLIF(p_cta_label, ''), cta_url = NULLIF(p_cta_url, ''), env = p_env,
      published = p_published, starts_at = COALESCE(p_starts_at, starts_at), ends_at = p_ends_at,
      updated_at = now()
    WHERE id = p_id
    RETURNING id INTO v_id;
  END IF;

  RETURN json_build_object('ok', v_id IS NOT NULL, 'id', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_announcement(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public._is_admin() THEN
    RETURN json_build_object('ok', false, 'error', 'forbidden');
  END IF;
  DELETE FROM public.announcements WHERE id = p_id;
  RETURN json_build_object('ok', FOUND);
END;
$$;

REVOKE EXECUTE ON FUNCTION public._is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_announcements() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_save_announcement(uuid, text, text, text, text, text, text, boolean, timestamptz, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_announcement(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_announcements(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_announcements() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_announcement(uuid, text, text, text, text, text, text, boolean, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_announcement(uuid) TO authenticated;
