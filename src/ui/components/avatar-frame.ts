import { avatarFrameArt, avatarFrameStyle } from '@lib/avatar-frames';
import { avatarArtHTML } from './avatar-art';

export function framedAvatarHTML(content: string, frameId: string | null | undefined, size: number): string {
  const style = avatarFrameStyle(frameId);
  if (!style) return content;
  const art = avatarFrameArt(frameId);
  if (art) return `<span class="avatar-frame avatar-frame--illustrated" style="--avatar-size:${size}px"><span class="avatar-frame-content">${content}</span><img class="avatar-frame-art" src="${art}" alt="" aria-hidden="true" decoding="async"></span>`;
  return `<span class="avatar-frame avatar-frame--${style}" style="--avatar-size:${size}px"><span class="avatar-frame-content">${content}</span><span class="avatar-frame-ring" aria-hidden="true"></span><span class="avatar-frame-gem" aria-hidden="true"></span></span>`;
}

export function framePreviewHTML(frameId: string, avatarId: string | null | undefined): string {
  return framedAvatarHTML(avatarArtHTML(avatarId, 76), frameId, 76);
}
