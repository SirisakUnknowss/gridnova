from pathlib import Path
import re
from PIL import Image
root = Path.cwd()
art = root / 'assets/space/generated'
out = root / 'src/images/space'
out.mkdir(parents=True, exist_ok=True)
icons = {
'easyIcon':'illustrations/08_planets_asset_set_easy', 'mediumIcon':'illustrations/08_planets_asset_set_medium',
'hardIcon':'illustrations/08_planets_asset_set_hard', 'expertIcon':'illustrations/08_planets_asset_set_expert',
'dailyIcon':'illustrations/12_daily_puzzle_card_art', 'diceIcon':'illustrations/13_random_mode_card_art',
'bookModeIcon':'illustrations/14_book_mode_card_art', 'trophyIcon':'illustrations/15_leaderboard_trophy',
'streakIcon':'illustrations/16_streak_flame', 'questIcon':'icons/09_icon_set_navigation_quests',
'statsIcon':'icons/09_icon_set_navigation_statistics', 'badgeIcon':'icons/09_icon_set_navigation_achievements',
'emptyIcon':'illustrations/22_empty_state_illustration', 'userIcon':'icons/09_icon_set_navigation_profile',
'guestIcon':'illustrations/07_mascot_helper_bot', 'puzzleIcon':'illustrations/08_planets_asset_set_easy',
'gamepadIcon':'illustrations/13_random_mode_card_art', 'playIcon':'icons/10_icon_set_gameplay_resume',
'homeIcon':'icons/09_icon_set_navigation_home', 'undoIcon':'icons/10_icon_set_gameplay_undo',
'redoIcon':'icons/10_icon_set_gameplay_redo', 'eraseIcon':'icons/10_icon_set_gameplay_erase',
'notesIcon':'icons/10_icon_set_gameplay_notes', 'hintIcon':'icons/10_icon_set_gameplay_hint',
}
exports = {name:(src, 160) for name,src in icons.items()}
exports.update({'mascot':('illustrations/06_mascot_astronaut',320), 'loading':('illustrations/23_loading_illustration',240), 'celebration':('illustrations/27_game_completion_celebration',480), 'bg-home':('backgrounds/02_background_home',800), 'bg-game':('backgrounds/bg_gameplay_space_light',800)})
exports.update({
    'time-attack':('illustrations/35_time_attack_stopwatch',320),
    'shop-capsule':('illustrations/29_shop_theme_asset',320),
    'page-medals':('badges/11_achievement_badges_daily_champion',320),
    'page-quests':('icons/09_icon_set_navigation_quests',320),
    'page-stats':('icons/09_icon_set_navigation_statistics',320),
    'page-settings':('icons/09_icon_set_navigation_settings',320),
    'badge-first':('badges/11_achievement_badges_first_solve',320),
    'badge-streak':('badges/11_achievement_badges_7_day_streak',320),
    'badge-flawless':('badges/11_achievement_badges_no_mistakes',320),
    'badge-speed':('badges/11_achievement_badges_under_5_minutes',320),
    'badge-pure':('badges/11_achievement_badges_no_hints',320),
})
exports.update({
    'replacements/coin':('replacements/coin',320),
    'replacements/heart':('replacements/heart',320),
    'replacements/star':('replacements/star',320),
    'replacements/target-icon':('replacements/target-icon',320),
    'replacements/warning-icon':('replacements/warning-icon',320),
    'replacements/lock-quest':('replacements/lock-quest',320),
    'replacements/information':('replacements/information',320),
    'replacements/mistake-icon':('replacements/mistake-icon',320),
    'replacements/gift-icon':('replacements/gift-icon',320),
    'replacements/celebrate-icon':('replacements/celebrate-icon',320),
    'replacements/level-up':('replacements/level-up',320),
    'replacements/brain-icon':('replacements/brain-icon',320),
    'replacements/zap-icon':('replacements/zap-icon',320),
    'replacements/repeat-icon':('replacements/repeat-icon',320),
    'replacements/turtle-icon':('replacements/turtle-icon',320),
    'replacements/clock-icon':('replacements/clock-icon',320),
    'replacements/globe':('replacements/globe',320),
    'replacements/bell-icon':('replacements/bell-icon',320),
    'replacements/rocket-icon':('replacements/rocket-icon',320),
    'replacements/cloud-icon':('replacements/cloud-icon',320),
    'replacements/sparkle-icon':('replacements/sparkle-icon',320),
    'replacements/wave-icon':('replacements/wave-icon',320),
    'replacements/soundOn-icon':('replacements/soundOn-icon',320),
    'replacements/soundOff-icon':('replacements/soundOff-icon',320),
    'replacements/sharing-icon':('replacements/sharing-icon',320),
    'replacements/share-icon':('replacements/share-icon',320),
    'replacements/download-icon':('replacements/download-icon',320),
    'replacements/1st-prize':('replacements/1st-prize',320),
    'replacements/2nd-place':('replacements/2nd-place',320),
    'replacements/3rd-place':('replacements/3rd-place',320),
    'replacements/trophy-2':('replacements/trophy-2',320),
    'replacements/bronze-lv-1':('replacements/bronze-lv-1',320),
    'replacements/bronze-lv-2':('replacements/bronze-lv-2',320),
    'replacements/bronze-lv-3':('replacements/bronze-lv-3',320),
    'replacements/silver-lv-1':('replacements/silver-lv-1',320),
    'replacements/silver-lv-2':('replacements/silver-lv-2',320),
    'replacements/silver-lv-3':('replacements/silver-lv-3',320),
    'replacements/gold-lv-1':('replacements/gold-lv-1',320),
    'replacements/gold-lv-2':('replacements/gold-lv-2',320),
    'replacements/gold-lv-3':('replacements/gold-lv-3',320),
    'replacements/max-level':('replacements/max-level',320),
})
exports.update({name:('controls/'+name.split('/')[-1],160) for name in ['controls/close','controls/back','controls/volume']})
exports.update({
  'avatars/lunar-fox':('avatars/lunar-fox',240),
  'avatars/nebula-cat':('avatars/nebula-cat',240),
  'avatars/comet-panda':('avatars/comet-panda',240),
  'avatars/cosmo-owl':('avatars/cosmo-owl',240),
  'avatars/nova-dragon':('avatars/nova-dragon',240),
  'avatars/astra-knight':('avatars/astra-knight',240),
  'avatars/orbit-bunny':('avatars/orbit-bunny',240),
  'avatars/solar-lion':('avatars/solar-lion',240),
})
for name,(src,size) in exports.items():
    with Image.open(art / (src+'.png')) as image:
        image.thumbnail((size, size if not name.startswith('bg-') else 1422), Image.Resampling.LANCZOS)
        (out / name).parent.mkdir(parents=True, exist_ok=True)
        image.save(out / (name+'.webp'), 'WEBP', quality=82, method=6)

print(f'Exported {len(exports)} optimized WebP assets')

