-- News layouts: words only, picture only, or picture with words.

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'text'
    CHECK (layout IN ('text', 'image', 'image_text'));

-- A picture layout without a picture would render an empty card.
ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_image_layout_needs_image
    CHECK (layout = 'text' OR image_url IS NOT NULL);

CREATE OR REPLACE FUNCTION public.get_announcements(p_env text)
RETURNS SETOF json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'id', a.id, 'title', a.title, 'body', a.body, 'layout', a.layout, 'image_url', a.image_url,
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

DROP FUNCTION IF EXISTS public.admin_save_announcement(uuid, text, text, text, text, text, text, boolean, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.admin_save_announcement(
  p_id        uuid,
  p_title     text,
  p_body      text,
  p_layout    text,
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
      (title, body, layout, image_url, cta_label, cta_url, env, published, starts_at, ends_at)
    VALUES
      (p_title, COALESCE(p_body, ''), COALESCE(p_layout, 'text'), NULLIF(p_image_url, ''),
       NULLIF(p_cta_label, ''), NULLIF(p_cta_url, ''), p_env, p_published, COALESCE(p_starts_at, now()), p_ends_at)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.announcements SET
      title = p_title, body = COALESCE(p_body, ''), layout = COALESCE(p_layout, 'text'),
      image_url = NULLIF(p_image_url, ''), cta_label = NULLIF(p_cta_label, ''),
      cta_url = NULLIF(p_cta_url, ''), env = p_env, published = p_published,
      starts_at = COALESCE(p_starts_at, starts_at), ends_at = p_ends_at, updated_at = now()
    WHERE id = p_id
    RETURNING id INTO v_id;
  END IF;

  RETURN json_build_object('ok', v_id IS NOT NULL, 'id', v_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_save_announcement(uuid, text, text, text, text, text, text, text, boolean, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_save_announcement(uuid, text, text, text, text, text, text, text, boolean, timestamptz, timestamptz) TO authenticated;
