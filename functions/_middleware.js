// Restricts staging.gridnova.pages.dev to admin. Any request without a valid
// session is redirected to /login (a dedicated page, not a browser Basic Auth
// popup). On success a signed, HttpOnly session cookie is set and the user is
// sent back to the page they originally requested. Credentials come from
// Cloudflare Pages env vars STAGING_BASIC_USER / STAGING_BASIC_PASS (set per
// "Preview" environment in the Pages dashboard, since staging is a branch
// deploy). Production (main branch / custom domain) is untouched.

const SESSION_COOKIE = 'staging_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h
const LOGIN_PATH = '/login';
const LOGOUT_PATH = '/logout';

async function hmac(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function isValidSession(cookieValue, secret) {
  if (!cookieValue) return false;
  const [expiryStr, sig] = cookieValue.split('.');
  if (!expiryStr || !sig) return false;
  if ((await hmac(secret, expiryStr)) !== sig) return false;
  const expiry = Number(expiryStr);
  return Number.isFinite(expiry) && Date.now() < expiry;
}

function safeRedirectTarget(raw) {
  // Only allow same-origin relative paths — never redirect off staging.
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

function loginPage(hasError, redirectTo) {
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>GridNova Staging</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .card {
    background: rgba(255,255,255,.08); backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,.18); border-radius: 16px;
    padding: 32px; width: 100%; max-width: 340px; color: #fff;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.sub { margin: 0 0 20px; font-size: 13px; opacity: .7; }
  label { display: block; font-size: 12px; margin-bottom: 6px; opacity: .8; }
  input {
    width: 100%; padding: 10px 12px; margin-bottom: 14px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,.25); background: rgba(0,0,0,.25); color: #fff; font-size: 14px;
  }
  input:focus { outline: 2px solid #fff; }
  button {
    width: 100%; padding: 11px; border: none; border-radius: 8px;
    background: #fff; color: #333; font-weight: 600; font-size: 14px; cursor: pointer;
  }
  button:active { transform: scale(.98); }
  .error { background: rgba(255,80,80,.2); border: 1px solid rgba(255,80,80,.4); color: #ffd7d7; font-size: 12px; padding: 8px 10px; border-radius: 8px; margin-bottom: 14px; }
</style>
</head>
<body>
  <form class="card" method="POST" action="${LOGIN_PATH}">
    <h1>🔒 GridNova Staging</h1>
    <p class="sub">Admin access only</p>
    ${hasError ? '<div class="error">Username or password incorrect</div>' : ''}
    <input type="hidden" name="redirect" value="${redirectTo.replace(/"/g, '&quot;')}" />
    <label for="u">Username</label>
    <input id="u" name="username" autocomplete="username" required autofocus />
    <label for="p">Password</label>
    <input id="p" name="password" type="password" autocomplete="current-password" required />
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;
}

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

  if (url.pathname === LOGOUT_PATH) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: LOGIN_PATH,
        'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  const existingSession = getCookie(request, SESSION_COOKIE);
  const alreadyLoggedIn = await isValidSession(existingSession, pass);

  if (url.pathname === LOGIN_PATH) {
    if (request.method === 'POST') {
      const form = await request.formData();
      const u = String(form.get('username') || '');
      const p = String(form.get('password') || '');
      const redirectTo = safeRedirectTarget(String(form.get('redirect') || '/'));

      if (u === user && p === pass) {
        const expiry = Date.now() + SESSION_TTL_SECONDS * 1000;
        const sig = await hmac(pass, String(expiry));
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectTo,
            'Set-Cookie': `${SESSION_COOKIE}=${expiry}.${sig}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
          },
        });
      }

      return new Response(loginPage(true, redirectTo), {
        status: 401,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // GET /login — already signed in? send them on. Otherwise show the form.
    const redirectTo = safeRedirectTarget(url.searchParams.get('redirect') || '/');
    if (alreadyLoggedIn) {
      return Response.redirect(url.origin + redirectTo, 302);
    }
    return new Response(loginPage(false, redirectTo), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (alreadyLoggedIn) return next();

  const dest = url.pathname + url.search;
  return Response.redirect(`${url.origin}${LOGIN_PATH}?redirect=${encodeURIComponent(dest)}`, 302);
}
