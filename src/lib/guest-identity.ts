const gods = ['Apollo', 'Artemis', 'Athena', 'Astraeus', 'Helios', 'Nyx', 'Orion', 'Selene', 'Thor', 'Freya'];
const space = ['Nova', 'Cosmos', 'Nebula', 'Stellar', 'Lunar', 'Astral', 'Comet', 'Orbit'];
const KEY = 'gn_guest_identity_v1';
interface GuestIdentity { name: string; emoji: string; generated?: boolean }
let identity: GuestIdentity | undefined;
export function getGuestIdentity(): GuestIdentity {
  if (identity) return identity;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (saved && typeof saved === 'object' && 'name' in saved && typeof saved.name === 'string' && saved.name.trim()) {
      identity = { name: saved.name.slice(0, 20), emoji: 'emoji' in saved && typeof saved.emoji === 'string' ? saved.emoji : '👤' };
      const generated = !('generated' in saved) || saved.generated === true;
      identity.generated = generated;
      if (generated) {
        const prefix = space.find(word => gods.some(god => identity!.name === word + god));
        if (prefix) {
          identity = { ...identity, name: prefix, generated: true };
          saveGuestIdentity(identity);
        }
      }
      return identity;
    }
  } catch { /* Storage can be unavailable in private browsing. */ }
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  identity = { name: [...space, ...gods][random[0] % (space.length + gods.length)], emoji: '👤', generated: true };
  saveGuestIdentity(identity);
  return identity;
}
export function saveGuestIdentity(next: GuestIdentity): void {
  identity = { ...next, generated: next.generated ?? false };
  try { localStorage.setItem(KEY, JSON.stringify(identity)); } catch { /* Keep this session usable without storage. */ }
}
