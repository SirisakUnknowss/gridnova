import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), in: vi.fn() }));
vi.mock('../../src/lib/supabase', () => ({ supabase: { from: mocks.from } }));
import { getCollectionItems } from '../../src/lib/api';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq, in: mocks.in });
  mocks.eq.mockReturnValue({ order: mocks.order });
});
it('keeps retired owned cosmetics without exposing other retired items or duplicating live ones', async () => {
  mocks.order.mockResolvedValue({ data: [{ id: 'theme_classic' }, { id: 'board_forest' }], error: null });
  mocks.in.mockResolvedValue({ data: [{ id: 'board_forest' }, { id: 'bg_solid_navy', available: false }], error: null });
  const items = await getCollectionItems(['board_forest', 'bg_solid_navy']);
  expect(items.map(item => item.id)).toEqual(['theme_classic', 'board_forest', 'bg_solid_navy']);
  expect(mocks.in).toHaveBeenCalledWith('id', ['board_forest', 'bg_solid_navy']);
});
it('skips retired metadata lookup when inventory is empty and surfaces lookup failures', async () => {
  mocks.order.mockResolvedValue({ data: [], error: null });
  expect(await getCollectionItems([])).toEqual([]);
  expect(mocks.in).not.toHaveBeenCalled();
  const error = new Error('Unavailable');
  mocks.in.mockResolvedValue({ data: null, error });
  await expect(getCollectionItems(['owned'])).rejects.toThrow('Unavailable');
});
