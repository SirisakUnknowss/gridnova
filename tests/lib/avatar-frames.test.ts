import { expect, it } from 'vitest';
import { avatarFrameStyle } from '../../src/lib/avatar-frames';

it('does not turn unknown catalog or user values into CSS classes', () => {
  expect(avatarFrameStyle('frame_star_halo')).toBe('star');
  expect(avatarFrameStyle('" onclick="alert(1)')).toBeNull();
  expect(avatarFrameStyle(null)).toBeNull();
});
