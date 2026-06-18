-- Migration to soften board color pack highlights and cell backgrounds by 50%

UPDATE shop_items SET metadata = '{"css_vars":{"--board-cell-bg":"rgba(108,92,231,0.03)","--board-cell-given":"rgba(108,92,231,0.09)","--board-highlight":"rgba(108,92,231,0.06)"}}'
WHERE id = 'board_default';

UPDATE shop_items SET metadata = '{"css_vars":{"--board-cell-bg":"rgba(14,165,233,0.03)","--board-cell-given":"rgba(14,165,233,0.09)","--board-highlight":"rgba(14,165,233,0.06)"}}'
WHERE id = 'board_ocean';

UPDATE shop_items SET metadata = '{"css_vars":{"--board-cell-bg":"rgba(16,185,129,0.03)","--board-cell-given":"rgba(16,185,129,0.09)","--board-highlight":"rgba(16,185,129,0.06)"}}'
WHERE id = 'board_forest';

UPDATE shop_items SET metadata = '{"premium":true,"css_vars":{"--board-cell-bg":"rgba(244,114,182,0.03)","--board-cell-given":"rgba(244,114,182,0.09)","--board-highlight":"rgba(244,114,182,0.06)"}}'
WHERE id = 'board_sakura';

UPDATE shop_items SET metadata = '{"premium":true,"css_vars":{"--board-cell-bg":"rgba(100,116,139,0.04)","--board-cell-given":"rgba(100,116,139,0.11)","--board-highlight":"rgba(100,116,139,0.07)"}}'
WHERE id = 'board_midnight';

UPDATE shop_items SET metadata = '{"css_vars":{"--board-cell-bg":"rgba(249,115,22,0.03)","--board-cell-given":"rgba(249,115,22,0.09)","--board-highlight":"rgba(249,115,22,0.06)"}}'
WHERE id = 'board_ember';
