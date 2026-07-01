// Restricts staging.gridnova.pages.dev to admin via HTTP Basic Auth.
// Credentials come from Cloudflare Pages env vars STAGING_BASIC_USER / STAGING_BASIC_PASS
// (set per "Preview" environment in the Pages dashboard, since staging is a branch deploy).
// Production (main branch / custom domain) is untouched.
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  const isStaging = url.hostname.includes('staging');
  if (!isStaging) return next();

  const user = env.STAGING_BASIC_USER;
  const pass = env.STAGING_BASIC_PASS;

  // Fail closed: if credentials aren't configured yet, block access rather than leave it open.
  if (!user || !pass) {
    return new Response('Staging access is not configured yet.', { status: 503 });
  }

  const expected = 'Basic ' + btoa(`${user}:${pass}`);
  const auth = request.headers.get('Authorization');

  if (auth === expected) return next();

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="GridNova Staging"' },
  });
}
