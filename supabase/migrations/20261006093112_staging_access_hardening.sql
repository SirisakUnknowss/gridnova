-- Purchases and equipping go through Edge Functions that validate the member JWT.
REVOKE EXECUTE ON FUNCTION public.equip_item(uuid, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.equip_item(uuid, text, text, text, jsonb) TO service_role;
REVOKE EXECUTE ON FUNCTION public.purchase_item(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_item(uuid, text) TO service_role;
ALTER FUNCTION public.increment_view(text) SET search_path = public;
