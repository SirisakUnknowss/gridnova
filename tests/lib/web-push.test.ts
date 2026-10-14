import { beforeAll, describe, expect, it } from 'vitest';
import { webcrypto, createECDH, hkdfSync, createDecipheriv } from 'node:crypto';
import { allowedPushEndpoint, encryptPush, vapidAuthorization } from '../../supabase/functions/_shared/web-push';
beforeAll(() => { Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true }); });
describe('RFC 8291 push encryption', () => {
  it('decrypts with independent Node ECDH/HKDF/AES implementation', async () => {
    const receiver = createECDH('prime256v1'); receiver.generateKeys();
    const auth = Buffer.alloc(16, 8);
    const encrypted = Buffer.from(await encryptPush(receiver.getPublicKey().toString('base64url'), auth.toString('base64url'), '{"title":"Daily"}'));
    expect(encrypted.readUInt32BE(16)).toBe(4096);
    const sender = encrypted.subarray(21, 21 + encrypted[20]);
    const ikm = hkdfSync('sha256', receiver.computeSecret(sender), auth, Buffer.concat([Buffer.from('WebPush: info\0'), receiver.getPublicKey(), sender]), 32);
    const salt = encrypted.subarray(0, 16);
    const key = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
    const iv = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: nonce\0'), 12);
    const ciphertext = encrypted.subarray(21 + encrypted[20]);
    const decipher = createDecipheriv('aes-128-gcm', Buffer.from(key), Buffer.from(iv));
    decipher.setAuthTag(ciphertext.subarray(-16));
    expect(Buffer.concat([decipher.update(ciphertext.subarray(0, -16)), decipher.final()]).toString()).toBe('{"title":"Daily"}\x02');
  });
  it('signs VAPID JWT for the push service audience', async () => {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const header = await vapidAuthorization('https://fcm.googleapis.com/test', 'public', await crypto.subtle.exportKey('jwk', pair.privateKey));
    const jwt = header.split('t=')[1].split(',')[0]; const [h,p,s] = jwt.split('.');
    expect(JSON.parse(Buffer.from(p, 'base64url').toString()).aud).toBe('https://fcm.googleapis.com');
    expect(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},pair.publicKey,Buffer.from(s,'base64url'),Buffer.from(`${h}.${p}`))).toBe(true);
  });
  it('rejects private network, redirects and fake push hosts', () => {
    for (const url of ['http://fcm.googleapis.com', 'https://127.0.0.1', 'https://fcm.googleapis.com.evil.test', 'https://user@fcm.googleapis.com', 'https://fcm.googleapis.com:444']) expect(allowedPushEndpoint(url)).toBe(false);
    expect(allowedPushEndpoint('https://web.push.apple.com/Q')).toBe(true);
  });
});

