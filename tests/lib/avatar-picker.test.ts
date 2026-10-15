import { expect,it } from 'vitest';
import { avatarItemId,avatarPickerOptions } from '../../src/ui/components/avatar-art';

const monthly = ['avatar_monthly_lotus_otter','avatar_monthly_moon_rabbit'];
it('includes earned monthly avatars in the profile picker without exposing them as free avatars',() => {
  expect(avatarPickerOptions(monthly,false).filter(item => monthly.includes(item.id)).map(item => item.name)).toEqual(['Lotus Girl','Moonlit Boy']);
  expect(avatarPickerOptions([],false).some(item => monthly.includes(item.id))).toBe(false);
  expect(avatarPickerOptions(monthly,true).some(item => monthly.includes(item.id))).toBe(false);
  expect(avatarPickerOptions([monthly[0]],false).filter(item => monthly.includes(item.id))).toHaveLength(1);
});
it('equips monthly avatars through the inventory item path used by purchased avatars',() => {
  for (const id of monthly) expect(avatarItemId(id)).toBe(id);
  expect(avatarItemId('avatar_rare_classic')).toBe('avatar_rare_classic');
  expect(avatarItemId('space_lunar-fox')).toBe('avatar_pet_dog');
  expect(avatarItemId('👤')).toBeNull();
});
