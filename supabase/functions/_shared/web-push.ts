const enc = new TextEncoder();
export const encode64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
export const decode64 = (value: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
const join = (...parts: Uint8Array[]): Uint8Array<ArrayBuffer> => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let offset = 0; for (const p of parts) { out.set(p, offset); offset += p.length; } return out; };
async function hkdf(secret: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, info: Uint8Array<ArrayBuffer>, length: number): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8));
}
export async function encryptPush(p256dh: string, auth: string, payload: string): Promise<Uint8Array<ArrayBuffer>> {
  const plaintext = enc.encode(payload);
  if (plaintext.length > 3993) throw new Error('Push payload too large');
  const receiver = decode64(p256dh);
  const receiverKey = await crypto.subtle.importKey('raw', receiver, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const sender = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: receiverKey }, pair.privateKey, 256));
  const ikm = await hkdf(shared, decode64(auth), join(enc.encode('WebPush: info\0'), receiver, sender), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(ikm, salt, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(ikm, salt, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, join(plaintext, new Uint8Array([2]))));
  const header = new Uint8Array(5); new DataView(header.buffer).setUint32(0, 4096); header[4] = sender.length;
  return join(salt, header, sender, ciphertext);
}
export async function vapidAuthorization(endpoint: string, publicKey: string, privateJwk: JsonWebKey): Promise<string> {
  const header = encode64(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = encode64(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 3600, sub: 'mailto:gridnova.sudokuth@gmail.com' })));
  const key = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${payload}`)));
  return `vapid t=${header}.${payload}.${encode64(signature)},k=${publicKey}`;
}
export function allowedPushEndpoint(endpoint: string): boolean {
  try { const url = new URL(endpoint); return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') && ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname); } catch { return false; }
}
