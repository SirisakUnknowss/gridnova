// =====================================================================
// Main entry point
// =====================================================================
import './ui/styles/main.css';
import { getCurrentUser, onAuthChange } from './lib/auth';
import { useStore } from './state/store';
import * as api from './lib/api';
import { initAnalytics, captureError } from './lib/analytics';
import { migrateFromV1, shouldMigrate } from './lib/migrate-v1';
import { generatePuzzle, generateDailyPuzzle } from './engine/generator';
import type { Difficulty } from './engine/types';
import { DIFFICULTIES } from './engine/types';
import { todayUtc } from './lib/format';
import { mountHomeView } from './ui/views/home';
import { mountPlayModeView } from './ui/views/play-mode';
import { mountPracticeView } from './ui/views/practice';
import { mountDailyDetailView } from './ui/views/daily-detail';
import { mountRandomModeDetailView } from './ui/views/random-mode-detail';
import { mountRandomLeaderboardView } from './ui/views/random-leaderboard';
import { mountGameView, type GameResult } from './ui/views/game';
import { showWinModal } from './ui/views/win-modal';
import { showShareModal } from './ui/views/share-modal';
import { mountSplash } from './ui/views/splash';
import { showAuthModal } from './ui/views/auth-modal';
import { mountLeaderboardView } from './ui/views/leaderboard';
import { hasCompletedOnboarding, showOnboarding } from './ui/views/onboarding';
import { mountQuestsView, getQuestsSummary } from './ui/views/quests';
import { mountProfileView } from './ui/views/profile';
import { mountAchievementsView } from './ui/views/achievements';
import { mountStatsView } from './ui/views/stats';
import { mountGlobalStatsView } from './ui/views/global-stats';
import { mountRecapView } from './ui/views/recap';
import { mountCalendarView } from './ui/views/calendar';
import { mountLedgerView } from './ui/views/ledger';
import { mountSettingsView } from './ui/views/settings';
import { mountHowToPlayView } from './ui/views/how-to-play';
import { mountContactSupportView } from './ui/views/contact-support';
import { mountPrivacyPolicyView } from './ui/views/privacy-policy';
import { mountTermsOfServiceView } from './ui/views/terms-of-service';
import { showWhatsNew, shouldAutoShowWhatsNew } from './ui/views/whats-new';
import { showLevelUpModal } from './ui/views/level-up';
import { applyTheme, loadCachedThemeId } from './lib/themes';
import { applyBackground, loadCachedBgId } from './lib/backgrounds';
import { applyBoardColorFromItem } from './lib/board-colors';
import { initPurchases, isPremiumEntitled } from './lib/purchases';
import { setPremium } from './lib/premium';
import { applyXpGain } from './lib/level';
import { initSound, playBgMusic, sfxCoin, sfxStreakMilestone, sfxLevelUp } from './lib/sound';
import { signOut } from './lib/auth';
import { computeDailyCoinReward, computePracticeCoinReward, computeXpReward } from './engine/scoring';
import { trackVisit, heartbeat, leaveOnline, getVisitorStats, submitGuestScore, migrateGuestScores, logView } from './lib/api';
import { useVisitorStore } from './state/visitor-store';
import { type GameInProgress, listGames, deleteGame } from './lib/local-db';

// Show update banner when a new service worker takes control
if ('serviceWorker' in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  // Force SW to check for updates every time user opens the app (critical for PWA on home screen)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.ready.then(reg => reg.update()).catch(() => {});
    }
  });
}

const root = document.getElementById('app')!;
let currentUnmount: (() => void) | null = null;

function clearView(view?: string) {
  if (currentUnmount) {
    currentUnmount();
    currentUnmount = null;
  }
  root.innerHTML = '';
  window.scrollTo(0, 0);
  if (view) {
    void logView(view, useStore.getState().user?.id);
  }
}

async function loadUserData(): Promise<void> {
  try {
    const [wallet, progression, profile, equipped, inventory] = await Promise.all([
      api.getWallet(),
      api.getProgression(),
      useStore.getState().user ? api.getProfile(useStore.getState().user!.id) : Promise.resolve(null),
      api.getEquipped().catch(() => null),
      api.getInventory().catch(() => []),
    ]);
    const set = useStore.setState;
    if (wallet) set({ coins: wallet.coins });
    if (progression) set({
      xp: Number(progression.xp),
      level: progression.level,
      currentStreak: progression.current_streak,
      longestStreak: progression.longest_streak ?? 0,
    });
    if (profile) set({ profile });
    if (equipped) {
      useStore.getState().setEquipped({
        theme_id: equipped.theme_id ?? null,
        background_id: equipped.background_id ?? null,
        board_color_id: (equipped as any).board_color_id ?? null,
        avatar: equipped.avatar ?? { emoji: '👤' },
      });
      if (equipped.theme_id) applyTheme(equipped.theme_id);
      if (equipped.background_id) applyBackground(equipped.background_id);
      if ((equipped as any).board_color_id) {
        api.getShopItem((equipped as any).board_color_id)
          .then((item) => applyBoardColorFromItem(item))
          .catch(() => {});
      }
    }
    if (inventory) {
      useStore.getState().setInventory((inventory as any[]).map((r) => r.item_id));
    }

    // Init RevenueCat and sync premium entitlement
    const userId = useStore.getState().user?.id;
    if (userId) {
      initPurchases(userId).then(() =>
        isPremiumEntitled().then((entitled) => setPremium(entitled))
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('Failed to load user data:', err);
  }
}

// =====================================================================
// Routing
// =====================================================================
// Shared callbacks for the bottom nav — same in every view
const navCb = {
  onHome:         () => showHome(),
  onAchievements: () => showAchievements(),
  onProfile:      () => showProfile(),
};

async function playDailyResume(saved: GameInProgress) {
  const date = saved.date!;
  let puzzleData: { puzzle: number[][]; solution: number[][]; difficulty: import('./engine/types').Difficulty };
  try {
    const resp = await api.getDailyPuzzle(date);
    if (resp) {
      puzzleData = {
        puzzle: (resp.puzzle as string).split('').map(Number).reduce((acc: number[][], v, i) => {
          if (i % 9 === 0) acc.push([]); acc[acc.length - 1].push(v); return acc;
        }, []),
        solution: (resp.solution as string).split('').map(Number).reduce((acc: number[][], v, i) => {
          if (i % 9 === 0) acc.push([]); acc[acc.length - 1].push(v); return acc;
        }, []),
        difficulty: resp.difficulty as import('./engine/types').Difficulty,
      };
    } else throw new Error('no puzzle');
  } catch {
    puzzleData = generateDailyPuzzle(date);
  }
  clearView('game_daily');
  const view = mountGameView(root, {
    mode: 'daily',
    difficulty: puzzleData.difficulty,
    puzzle: puzzleData.puzzle as import('./engine/types').Board,
    solution: puzzleData.solution as import('./engine/types').Board,
    date,
    resume: saved,
    onWin: (result) => handleWin(result, date),
    onExit: showDailyDetail,
  });
  currentUnmount = view.unmount;
}

function playPracticeResume(saved: GameInProgress) {
  const level = saved.level as Difficulty;
  const stage = saved.stage ?? 1;
  const seed = `practice:${level}:${stage}`;
  const puzzleData = generatePuzzle({ difficulty: level, seed });
  clearView('game_practice');
  const view = mountGameView(root, {
    mode: 'practice',
    difficulty: level,
    puzzle: puzzleData.puzzle,
    solution: puzzleData.solution,
    stage,
    resume: saved,
    onWin: (result) => handleWin(result),
    onExit: showPractice,
    onNewGame: () => void playPractice(level),
  });
  currentUnmount = view.unmount;
}

function showHome() {
  clearView('home');
  const view = mountHomeView(root, {
    onEnterPlayMode: showPlayMode,
    onOpenPractice: showPractice,
    onOpenQuests: showQuests,
    onAuthAction: openAuthAction,
    nav: navCb,
  });
  currentUnmount = view.unmount;

  // Best-effort: fill in the Quests row progress once loaded, so the
  // row hints at what's waiting before the player taps into it.
  void getQuestsSummary().then((summary) => {
    if (!summary || summary.total === 0) return;
    const subEl = document.getElementById('quests-sub');
    const badgeEl = document.getElementById('quests-claim-badge');
    const progressEl = document.getElementById('quests-progress');
    const progressFillEl = document.getElementById('quests-progress-fill');
    if (subEl) subEl.textContent = `${summary.completed}/${summary.total} done today`;
    if (progressEl && progressFillEl) {
      progressEl.style.display = 'block';
      progressFillEl.style.width = `${Math.round((summary.completed / summary.total) * 100)}%`;
    }
    if (badgeEl && summary.claimable > 0) {
      badgeEl.textContent = `${summary.claimable} to claim`;
      badgeEl.style.display = 'inline-block';
    }
  });
}

function showQuests() {
  clearView('quests');
  const view = mountQuestsView(root, { onBack: showHome, nav: navCb, onToast: toast });
  currentUnmount = view.unmount;
}

function showPlayMode() {
  clearView('play_mode');
  const view = mountPlayModeView(root, {
    onBack: showHome,
    onOpenDaily: showDailyDetail,
    onOpenRandom: showRandomDetail,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showDailyDetail() {
  clearView('daily_detail');
  const view = mountDailyDetailView(root, {
    onBack: showPlayMode,
    onPlayDaily: playDaily,
    onContinueDaily: (saved) => void playDailyResume(saved),
    onLeaderboard: showLeaderboard,
    onOpenCalendar: showCalendar,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showRandomDetail() {
  clearView('random_detail');
  const view = mountRandomModeDetailView(root, {
    onBack: showPlayMode,
    onPlayRandom: playRandom,
    onLeaderboard: showRandomLeaderboard,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showRandomLeaderboard() {
  clearView('random_leaderboard');
  const view = mountRandomLeaderboardView(root, { onBack: showRandomDetail, nav: navCb });
  currentUnmount = view.unmount;
}

function showPractice() {
  clearView('practice');
  const view = mountPracticeView(root, {
    onBack: showHome,
    onPlayPractice: (level) => playPractice(level as Difficulty),
    onContinuePractice: (saved) => playPracticeResume(saved),
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showLeaderboard() {
  clearView('leaderboard');
  const view = mountLeaderboardView(root, { onBack: showDailyDetail, nav: navCb });
  currentUnmount = view.unmount;
}

function handleSignOut() {
  if (confirm('Sign out?')) {
    void signOut().then(() => {
      useStore.setState({ user: null, profile: null, coins: 0, xp: 0, level: 1, currentStreak: 0 });
      applyBackground('bg_default');
      applyTheme('theme_classic');
      void boot();
    });
  }
}

function showProfile() {
  clearView('profile');
  const view = mountProfileView(root, {
    onBack: showHome,
    onOpenStats: showStats,
    onOpenAchievements: () => showAchievements(true),
    onOpenRecap: showRecap,
    onOpenLedger: showLedger,
    onOpenSettings: showSettings,
    onSignOut: handleSignOut,
    onUpgradeAccount: openAuthAction,
    onToast: toast,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showSettings() {
  clearView('settings');
  const view = mountSettingsView(root, {
    onBack: showProfile,
    onSignOut: handleSignOut,
    onUpgradeAccount: openAuthAction,
    onOpenHowToPlay: showHowToPlay,
    onOpenContactSupport: showContactSupport,
    onOpenPrivacyPolicy: showPrivacyPolicy,
    onOpenTermsOfService: showTermsOfService,
    onToast: toast,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function showHowToPlay() {
  clearView('how_to_play');
  const view = mountHowToPlayView(root, { onBack: showSettings, nav: navCb });
  currentUnmount = view.unmount;
}

function showContactSupport() {
  clearView('contact_support');
  const view = mountContactSupportView(root, { onBack: showSettings, nav: navCb });
  currentUnmount = view.unmount;
}

function showPrivacyPolicy() {
  clearView('privacy_policy');
  const view = mountPrivacyPolicyView(root, { onBack: showSettings, nav: navCb });
  currentUnmount = view.unmount;
}

function showTermsOfService() {
  clearView('terms_of_service');
  const view = mountTermsOfServiceView(root, { onBack: showSettings, nav: navCb });
  currentUnmount = view.unmount;
}

function showAchievements(fromProfile = false) {
  clearView('achievements');
  const view = mountAchievementsView(root, { onBack: fromProfile ? showProfile : showHome, nav: navCb });
  currentUnmount = view.unmount;
}

function showStats() {
  clearView('stats');
  const view = mountStatsView(root, { onBack: showProfile, nav: navCb, onGlobalStats: showGlobalStats });
  currentUnmount = view.unmount;
}

function showGlobalStats() {
  clearView('global_stats');
  const view = mountGlobalStatsView(root, { onBack: showStats, nav: navCb });
  currentUnmount = view.unmount;
}

function showRecap() {
  clearView('recap');
  const view = mountRecapView(root, { onBack: showProfile, onToast: toast, nav: navCb });
  currentUnmount = view.unmount;
}

function showLedger() {
  clearView('ledger');
  const view = mountLedgerView(root, { onBack: showProfile, nav: navCb });
  currentUnmount = view.unmount;
}

function showCalendar() {
  clearView('calendar');
  const view = mountCalendarView(root, {
    onBack: showDailyDetail,
    nav: navCb,
  });
  currentUnmount = view.unmount;
}

function openAuthAction() {
  const user = useStore.getState().user;
  if (user?.is_anonymous) {
    showAuthModal({
      isUpgrade: true,
      onSuccess: async () => {
        const migrated = await migrateGuestScores();
        await loadUserData();
        showHome();
        const msg = migrated > 0
          ? `Progress saved! ${migrated} game${migrated > 1 ? 's' : ''} transferred to your account.`
          : 'Progress saved! Sign in from any device to continue.';
        toast(msg, 3500);
      },
      onCancel: () => {},
    });
  } else if (user) {
    // Already signed in → go to profile
    showProfile();
  } else {
    showAuthModal({
      onSuccess: async () => {
        const migrated = await migrateGuestScores();
        await loadUserData();
        showHome();
        if (migrated > 0) toast(`Welcome back! ${migrated} guest game${migrated > 1 ? 's' : ''} imported.`, 3500);
        // Claim referral if user arrived via invite link
        const pendingRef = localStorage.getItem('gridnova_ref');
        if (pendingRef) {
          try { await api.claimReferral(pendingRef); } catch { /* ignore */ }
          localStorage.removeItem('gridnova_ref');
        }
      },
      onCancel: () => {},
    });
  }
}

// (profile menu now lives in mountProfileView)

async function playDaily() {
  const date = todayUtc();
  let puzzleData;
  // Try fetch from server; fallback to local generation
  try {
    const remote = await api.getDailyPuzzle(date);
    if (remote) {
      const puzzleStr = remote.puzzle as string;
      const board = stringToBoard(puzzleStr);
      // Solution comes from local gen (same seed)
      const local = generateDailyPuzzle(date);
      puzzleData = {
        puzzle: board,
        solution: local.solution,
        difficulty: remote.difficulty,
      };
    } else {
      throw new Error('No daily on server');
    }
  } catch {
    // Local fallback (deterministic via date seed)
    const local = generateDailyPuzzle(date);
    puzzleData = local;
  }

  clearView('game_daily');
  const view = mountGameView(root, {
    mode: 'daily',
    difficulty: puzzleData.difficulty,
    puzzle: puzzleData.puzzle,
    solution: puzzleData.solution,
    date,
    onWin: (result) => handleWin(result, date),
    onExit: showDailyDetail,
  });
  currentUnmount = view.unmount;
}

async function playPractice(level: Difficulty) {
  // Delete any stale saved games for this difficulty so the continue banner
  // never shows a finished or abandoned game after starting fresh.
  const stale = await listGames();
  for (const g of stale.filter(g => g.mode === 'practice' && g.level === level)) {
    await deleteGame(g.game_id);
  }

  // For MVP, use a random seed; later use stage system
  const stage = Math.floor(Math.random() * 100) + 1;
  const seed = `practice:${level}:${stage}`;
  const puzzleData = generatePuzzle({ difficulty: level, seed });

  clearView('game_practice');
  const view = mountGameView(root, {
    mode: 'practice',
    difficulty: level,
    puzzle: puzzleData.puzzle,
    solution: puzzleData.solution,
    stage,
    onWin: (result) => handleWin(result),
    onExit: showPractice,
    onNewGame: () => void playPractice(level),
  });
  currentUnmount = view.unmount;
}

function playRandom() {
  const level = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
  const seed = `random:${Date.now()}:${Math.floor(Math.random() * 1_000_000)}`;
  const puzzleData = generatePuzzle({ difficulty: level, seed });

  clearView('game_random');
  const view = mountGameView(root, {
    mode: 'practice',
    origin: 'random',
    difficulty: level,
    puzzle: puzzleData.puzzle,
    solution: puzzleData.solution,
    onWin: (result) => {
      handleWin(result);
      void api.recordRandomModeResult(true).catch(() => {});
    },
    onLose: () => {
      void api.recordRandomModeResult(false).catch(() => {});
    },
    onExit: showRandomDetail,
    onNewGame: () => playRandom(),
  });
  currentUnmount = view.unmount;
}

function showLoadingOverlay(text = 'Saving your score...'): () => void {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <p style="font-weight: 600; font-size: 15px; text-align: center;">${text}</p>
  `;
  document.body.appendChild(overlay);
  return () => overlay.remove();
}

async function handleWin(result: GameResult, date?: string) {
  const scoreInput = {
    difficulty: result.difficulty,
    timeSeconds: result.timeSeconds,
    mistakes: result.mistakes,
    hintsUsed: result.hintsUsed,
  };
  const coins = result.mode === 'daily'
    ? computeDailyCoinReward(scoreInput)
    : computePracticeCoinReward(result.difficulty);
  const xp = computeXpReward(scoreInput, result.mode);
  const prevLevel = useStore.getState().level;

  // Coins are a simple additive balance — safe to reflect immediately.
  useStore.setState({ coins: useStore.getState().coins + coins });

  let rank: number | undefined;
  let totalPlayers: number | undefined;

  const isGuest = !useStore.getState().user || !!useStore.getState().user?.is_anonymous;

  const hideLoading = showLoadingOverlay(
    result.mode === 'daily'
      ? 'Submitting daily score...'
      : 'Saving practice progress...'
  );

  try {
    if (isGuest) {
      // Guest path — save to guest_game_history (no auth needed). There is no
      // server-side XP/level for guests, so this is the only source of truth.
      await submitGuestScore({
        mode: result.mode,
        daily_date: date,
        level: result.difficulty,
        time_seconds: result.timeSeconds,
        mistakes: result.mistakes,
        hints_used: result.hintsUsed,
        score: result.score,
      });
      const state = useStore.getState();
      const { level: newLevel, xp: newXp } = applyXpGain(state.level, state.xp, xp);
      useStore.setState({ xp: newXp, level: newLevel });
      maybeShowLevelUp(prevLevel, newLevel);
    } else if (result.mode === 'daily' && date) {
      // Signed-in member — submit to real leaderboard
      try {
        const { data } = await api.submitDailyScore({
          date,
          started_at: result.startedAt,
          completed_at: result.completedAt,
          time_seconds: result.timeSeconds,
          mistakes: result.mistakes,
          hints_used: result.hintsUsed,
          moves: result.moves,
        });
        if (data?.rank) {
          rank = data.rank;
          totalPlayers = data.total_players;
        }
        await refreshStreakAndToast();
        // grant_xp uses a different curve than any client-side formula —
        // always trust the server's post-submit level, never guess locally.
        maybeShowLevelUp(prevLevel, useStore.getState().level);
      } catch (err) {
        console.warn('Submit failed (offline?):', err);
      }
    } else if (result.mode === 'practice' && !isGuest) {
      try {
        await api.submitPracticeScore({
          level: result.difficulty,
          stage: 1,
          time_seconds: result.timeSeconds,
          mistakes: result.mistakes,
          hints_used: result.hintsUsed,
        });
        const prog = await api.getProgression();
        if (prog) {
          useStore.setState({ xp: Number(prog.xp ?? 0), level: prog.level ?? prevLevel });
          maybeShowLevelUp(prevLevel, prog.level ?? prevLevel);
        }
      } catch (err) {
        console.warn('Practice submit failed:', err);
      }
    }
  } finally {
    hideLoading();
  }

  showWinModal({
    result,
    rank,
    totalPlayers,
    coinsEarned: coins,
    xpEarned: xp,
    isGuest,
    onContinue: showHome,
    onShare: date ? () => shareResult(result, date, rank, totalPlayers) : undefined,
    onSignUp: isGuest ? () => showAuthModal({ mode: 'signup', onSuccess: showHome, onCancel: showHome }) : undefined,
  });
}

function maybeShowLevelUp(prevLevel: number, newLevel: number) {
  if (newLevel <= prevLevel) return;
  setTimeout(() => {
    sfxLevelUp();
    showLevelUpModal({ newLevel, rewardCoins: 50 * (newLevel - prevLevel) });
  }, 600);
}

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 60, 100, 365]);

async function refreshStreakAndToast() {
  try {
    const prevStreak = useStore.getState().currentStreak;
    const prog = await api.getProgression();
    if (!prog) return;
    const newStreak = prog.current_streak ?? 0;
    useStore.setState({
      xp: Number(prog.xp ?? useStore.getState().xp),
      level: prog.level ?? useStore.getState().level,
      currentStreak: newStreak,
    });
    if (newStreak > prevStreak) {
      if (STREAK_MILESTONES.has(newStreak)) {
        sfxStreakMilestone();
        toast(`🔥 ${newStreak}-day streak! Keep it up!`, 4000);
      } else {
        sfxCoin();
        toast(`🔥 Streak saved — ${newStreak} day${newStreak === 1 ? '' : 's'}!`);
      }
    }
  } catch (err) {
    console.warn('Streak refresh failed:', err);
  }
}

async function shareResult(result: GameResult, date: string, rank?: number, total?: number) {
  const state = useStore.getState();
  const profile = state.profile;
  const userId = state.user?.id;

  let referralCode = '';
  try {
    if (userId) referralCode = await api.getReferralCode(userId);
  } catch { /* ignore */ }

  showShareModal({
    win: {
      result,
      date,
      rank,
      totalPlayers: total,
      streak: state.currentStreak,
    },
    profile: profile && userId ? {
      displayName: profile.display_name || profile.username || 'Player',
      avatarUrl: profile.avatar_url,
      avatarEmoji: (state.equipped.avatar?.emoji as string) || '👤',
      level: state.level,
      bestStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      coins: state.coins,
      referralCode,
    } : undefined,
    onToast: toast,
  });
}

// =====================================================================
// Visitor count formatter  e.g. 1200 → "1.2K"
// =====================================================================
function formatVisitorCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

async function refreshVisitorStats() {
  const stats = await getVisitorStats();
  if (!stats) return;
  useVisitorStore.getState().setStats(stats);
  // Live-patch DOM without re-rendering the whole view
  const patch = (id: string, val: number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatVisitorCount(val);
  };
  patch('vs-online',         stats.online);
  patch('vs-online-guests',  stats.online_guests);
  patch('vs-online-members', stats.online_members);
  patch('vs-today',          stats.today);
  patch('vs-today-guests',   stats.today_guests);
  patch('vs-today-members',  stats.today_members);
  patch('vs-total',          stats.total);
}

// =====================================================================
// Toast
// =====================================================================
function toast(msg: string, durationMs = 2500) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), durationMs);
}

// =====================================================================
// Utilities
// =====================================================================
function stringToBoard(s: string): number[][] {
  const board: number[][] = [];
  for (let r = 0; r < 9; r++) {
    board.push([]);
    for (let c = 0; c < 9; c++) {
      board[r].push(parseInt(s[r * 9 + c], 10));
    }
  }
  return board;
}

// =====================================================================
// Boot
// =====================================================================
async function boot() {
  // Apply cached theme + background before first paint to avoid flicker
  const cachedTheme = loadCachedThemeId();
  if (cachedTheme) applyTheme(cachedTheme);
  const cachedBg = loadCachedBgId();
  if (cachedBg) applyBackground(cachedBg);

  // Init sound (loads mute + volume preferences), then start looping
  // background music — autoplay policy is handled inside (retries on first
  // user gesture if the browser blocks the initial play).
  initSound();
  void playBgMusic();

  // Capture referral code from URL before any redirect
  const refCode = new URLSearchParams(window.location.search).get('ref');
  if (refCode) localStorage.setItem('gridnova_ref', refCode);

  // Init analytics first — safe even with empty keys
  initAnalytics();

  // Show animated splash immediately
  root.innerHTML = '';
  const splash = mountSplash(root);
  const minSplashDuration = new Promise<void>((resolve) => setTimeout(resolve, 1800));

  const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (hasSupabase) {
    try {
      onAuthChange((user) => {
        useStore.setState({ user });
      });
      // Use getCurrentUser() only — never auto-sign-in anonymously at boot.
      // signInAnonymously() on a project without anonymous auth enabled
      // invalidates the supabase-js auth state, which strips the Bearer token
      // from subsequent REST requests and causes 401 on visitor_sessions.
      const user = await Promise.race([
        getCurrentUser(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);

      // Clean up OAuth redirect URL fragments/params after Supabase picks up the session
      // e.g. #access_token=... (implicit flow) or ?code=... (PKCE flow)
      const hasOAuthCallback =
        window.location.hash.includes('access_token') ||
        window.location.search.includes('code=') ||
        window.location.search.includes('error=');
      if (hasOAuthCallback) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (user) {
        useStore.setState({ user });
        // Run v1 migration if applicable
        if (shouldMigrate()) {
          const result = await migrateFromV1();
          if (result.ran && result.imported) {
            console.info('[Boot] Migrated v1 data:', result.imported);
          }
        }
        // Migrate any local guest scores (handles Google OAuth redirect login)
        // migrateGuestScores() is idempotent — safe to call on every boot when user exists
        if (localStorage.getItem('sudoku_guest_display_id_v1')) {
          const migrated = await migrateGuestScores();
          if (migrated > 0) {
            console.info(`[Boot] Migrated ${migrated} guest score(s) from local session`);
          }
        }
        await loadUserData();
      } else {
        // No existing session → run as guest (visitor tracking still works via anon key)
        useStore.setState({ profile: { display_name: 'Guest' }, coins: 100 });
      }
    } catch (err) {
      captureError(err, { phase: 'boot' });
      console.warn('[Boot] Supabase error — offline demo mode:', err);
      useStore.setState({ profile: { display_name: 'Guest' }, coins: 100 });
    }
  } else {
    console.info('[Boot] No Supabase config — running in offline demo mode');
    useStore.setState({ profile: { display_name: 'Guest' }, coins: 100 });
  }

  // Wait for splash min duration, then unmount with exit animation
  await minSplashDuration;
  await splash.unmount();

  showHome();

  // Track visit + start heartbeat loop (best-effort, non-blocking)
  void (async () => {
    const u = useStore.getState().user;
    const isGuest = !u || !!u.is_anonymous;
    await trackVisit(isGuest);
    await heartbeat(isGuest, isGuest ? undefined : u?.id);
    await refreshVisitorStats();
  })();

  // Heartbeat every 30s — keeps "online now" count accurate
  // Also re-records visit if the user left the tab open past midnight
  let lastVisitDate = new Date().toISOString().slice(0, 10);
  const heartbeatInterval = setInterval(async () => {
    const u = useStore.getState().user;
    const isGuest = !u || !!u.is_anonymous;
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastVisitDate) {
      lastVisitDate = today;
      await trackVisit(isGuest);
    }
    await heartbeat(isGuest, isGuest ? undefined : u?.id);
    await refreshVisitorStats();
  }, 30_000);

  // Leave online on tab close
  window.addEventListener('beforeunload', () => {
    void leaveOnline();
    clearInterval(heartbeatInterval);
  });

  // Show onboarding once per device (after home is mounted so it has a backdrop)
  if (!hasCompletedOnboarding()) {
    showOnboarding({ onFinish: () => { /* user is on home; quest list will pick up name on next render */ showHome(); } });
  } else if (shouldAutoShowWhatsNew()) {
    // Returning player who just updated — surface what changed (important
    // this release since coins/level were rebalanced under them).
    showWhatsNew();
  }
}

boot().catch((err) => {
  console.error('Boot failed:', err);
  root.innerHTML = `<div class="loading-screen"><h1>⚠️ Error</h1><p>${err.message}</p></div>`;
});
