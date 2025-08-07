import { renderNav } from './nav';
import { renderBackgroundTop } from '../utils/layout';
import { getToken, validateLogin } from '../utils/auth';
import { wsManager } from '../websocket/ws-manager';

let currentTournamentId: string | null = null;

export async function renderTournament(root: HTMLElement) {
  const isValid = await validateLogin();
  if (!isValid) {
    location.hash = '#/login';
    return;
  }

  root.innerHTML = renderNav() + `
    <!-- Main Container with Background -->
    <div class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 overflow-hidden">

      <!-- Animated Background Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- PONG Ball Trail Animation -->
        <div class="pong-ball-trail"></div>

        <!-- Floating Trophy Particles -->
        <div class="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div class="absolute top-40 right-32 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed"></div>
        <div class="absolute bottom-32 left-1/3 w-28 h-28 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float-slow"></div>

        <!-- Championship Crown Effect -->
        <div class="championship-crown"></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-6xl w-full">

          <!-- Header Section -->
          <div class="text-center mb-12">
            <!-- Championship Icon -->
            <div class="inline-flex items-center justify-center mb-6">
              <div class="tournament-trophy-container">
                <div class="tournament-trophy">🏆</div>
                <div class="trophy-glow"></div>
              </div>
            </div>

            <!-- Main Title -->
            <h1 class="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl tournament-title">
              CHAMPIONSHIP
            </h1>
            <div class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <span>P</span><div class="tournament-ball"></div><span>NG</span> <span>ARENA</span>
            </div>
            <p class="text-xl md:text-2xl text-blue-100 font-light max-w-3xl mx-auto leading-relaxed">
              Battle through epic tournaments and claim your throne as the ultimate PONG champion
            </p>
          </div>

          <!-- Tournament Dashboard -->
          <div class="grid lg:grid-cols-2 gap-8 mb-12">

            <!-- Active Tournaments Section -->
            <div class="tournament-section">
              <div class="section-header">
                <div class="section-icon">⚔️</div>
                <h2 class="section-title">Active Tournaments</h2>
                <div class="section-divider"></div>
              </div>
              <div id="tournament-list" class="tournament-list"></div>
            </div>

            <!-- Tournament Creation Section -->
            <div class="tournament-section">
              <div class="section-header">
                <div class="section-icon">🎯</div>
                <h2 class="section-title">Create Tournament</h2>
                <div class="section-divider"></div>
              </div>
              <div class="tournament-creation-grid">
                <button id="create-tournament-4" class="tournament-create-btn tournament-create-4">
                  <div class="tournament-create-icon">
                    <span class="text-3xl">🏅</span>
                    <div class="create-btn-glow"></div>
                  </div>
                  <div class="tournament-create-content">
                    <h3 class="text-2xl font-bold text-white mb-2">Rapid Fire</h3>
                    <p class="text-yellow-200 text-sm mb-3">4 Player Tournament</p>
                    <div class="tournament-stats">
                      <div class="stat-item">
                        <span class="stat-value">15min</span>
                        <span class="stat-label">Duration</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">3</span>
                        <span class="stat-label">Rounds</span>
                      </div>
                    </div>
                  </div>
                  <div class="tournament-create-overlay"></div>
                </button>

                <button id="create-tournament-8" class="tournament-create-btn tournament-create-8">
                  <div class="tournament-create-icon">
                    <span class="text-3xl">👑</span>
                    <div class="create-btn-glow"></div>
                  </div>
                  <div class="tournament-create-content">
                    <h3 class="text-2xl font-bold text-white mb-2">Epic Battle</h3>
                    <p class="text-purple-200 text-sm mb-3">8 Player Tournament</p>
                    <div class="tournament-stats">
                      <div class="stat-item">
                        <span class="stat-value">30min</span>
                        <span class="stat-label">Duration</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">7</span>
                        <span class="stat-label">Rounds</span>
                      </div>
                    </div>
                  </div>
                  <div class="tournament-create-overlay"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Tournament Brackets Visualization -->
          <div class="tournament-bracket-container mb-8">
            <div class="bracket-header">
              <h3 class="text-2xl font-bold text-white mb-4 text-center">
                Live Tournament Brackets
              </h3>
            </div>
            <div id="tournament-brackets" class="tournament-brackets">
              <div class="brackets-placeholder">
                <div class="brackets-icon">🏆</div>
                <p class="brackets-text">Tournament brackets will appear here when matches begin</p>
                <div class="brackets-animation">
                  <div class="bracket-line"></div>
                  <div class="bracket-node bracket-node-1"></div>
                  <div class="bracket-node bracket-node-2"></div>
                  <div class="bracket-node bracket-node-3"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leaderboard Section -->
          <div class="leaderboard-container">
            <div class="leaderboard-header">
              <div class="leaderboard-icon">🏆</div>
              <h3 class="leaderboard-title">Championship Leaderboard</h3>
            </div>
            <div class="leaderboard-content">
              <div class="leaderboard-item leaderboard-gold">
                <div class="leaderboard-rank">1</div>
                <div class="leaderboard-player">Champion</div>
                <div class="leaderboard-score">2,450 pts</div>
              </div>
              <div class="leaderboard-item leaderboard-silver">
                <div class="leaderboard-rank">2</div>
                <div class="leaderboard-player">Runner-up</div>
                <div class="leaderboard-score">2,100 pts</div>
              </div>
              <div class="leaderboard-item leaderboard-bronze">
                <div class="leaderboard-rank">3</div>
                <div class="leaderboard-player">Third Place</div>
                <div class="leaderboard-score">1,850 pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      /* Tournament Ball Animation */
      .tournament-ball {
        width: 2.5rem;
        height: 2.5rem;
        background:
          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 40%),
          radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 30%),
          linear-gradient(45deg, #fbbf24 0%, #f59e0b 25%, #d97706 50%, #b45309 75%, #92400e 100%);
        border-radius: 50%;
        display: inline-block;
        position: relative;
        animation: tournament-ball-bounce 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        margin: 0 0.25rem;
        border: 3px solid rgba(255, 255, 255, 0.4);
        box-shadow:
          0 0 20px rgba(251, 191, 36, 0.8),
          0 0 40px rgba(245, 158, 11, 0.6),
          inset 0 0 20px rgba(255, 255, 255, 0.2);
      }

      @keyframes tournament-ball-bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-20px) scale(1.05); }
        50% { transform: translateY(0) scale(1); }
        75% { transform: translateY(-10px) scale(0.95); }
      }

      /* Tournament Trophy Animation */
      .tournament-trophy-container {
        position: relative;
        display: inline-block;
      }

      .tournament-trophy {
        font-size: 4rem;
        animation: trophy-float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8));
        position: relative;
        z-index: 2;
      }

      .trophy-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
        border-radius: 50%;
        animation: trophy-glow-pulse 2s ease-in-out infinite;
      }

      @keyframes trophy-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-10px) rotate(2deg); }
        50% { transform: translateY(-5px) rotate(0deg); }
        75% { transform: translateY(-15px) rotate(-2deg); }
      }

      @keyframes trophy-glow-pulse {
        0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
      }

      /* Championship Title Animation */
      .tournament-title {
        animation: championship-shine 3s linear infinite;
        position: relative;
      }

      @keyframes championship-shine {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

      /* PONG Ball Trail Animation */
      .pong-ball-trail {
        position: absolute;
        top: 20%;
        left: -50px;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #60a5fa 0%, #3b82f6 50%, transparent 70%);
        border-radius: 50%;
        animation: ball-trail 8s linear infinite;
        opacity: 0.8;
      }

      @keyframes ball-trail {
        0% {
          left: -50px;
          top: 20%;
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        25% {
          left: 25%;
          top: 60%;
        }
        50% {
          left: 75%;
          top: 30%;
        }
        75% {
          left: 50%;
          top: 70%;
        }
        90% {
          opacity: 1;
        }
        100% {
          left: calc(100% + 50px);
          top: 40%;
          opacity: 0;
        }
      }

      /* Championship Crown Effect */
      .championship-crown {
        position: absolute;
        top: 10%;
        right: 15%;
        font-size: 3rem;
        animation: crown-float 4s ease-in-out infinite;
        opacity: 0.3;
      }

      .championship-crown::before {
        content: '👑';
        filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
      }

      @keyframes crown-float {
        0%, 100% { transform: translateY(0) rotate(-5deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }

      /* Floating Animations */
      @keyframes animate-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(1deg); }
        66% { transform: translateY(-5px) rotate(-1deg); }
      }

      @keyframes animate-float-delayed {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-15px) rotate(-1deg); }
        66% { transform: translateY(-8px) rotate(1deg); }
      }

      @keyframes animate-float-slow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-12px) rotate(2deg); }
      }

      .animate-float { animation: animate-float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: animate-float-delayed 8s ease-in-out infinite 2s; }
      .animate-float-slow { animation: animate-float-slow 10s ease-in-out infinite 1s; }

      /* Tournament Section Styling */
      .tournament-section {
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        position: relative;
        overflow: hidden;
      }

      .tournament-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), transparent);
        animation: section-highlight 3s ease-in-out infinite;
      }

      @keyframes section-highlight {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .section-icon {
        font-size: 2rem;
        animation: icon-pulse 2s ease-in-out infinite;
      }

      @keyframes icon-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin: 0;
      }

      .section-divider {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.5), transparent);
        margin-left: 1rem;
      }

      /* Tournament List Styling */
      .tournament-list {
        min-height: 300px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* Tournament Creation Buttons */
      .tournament-creation-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tournament-create-btn {
        position: relative;
        padding: 2rem;
        border-radius: 1.5rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        backdrop-filter: blur(20px);
        transition: all 0.3s ease;
        cursor: pointer;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .tournament-create-btn:hover {
        transform: translateY(-5px) scale(1.02);
        border-color: rgba(251, 191, 36, 0.6);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(251, 191, 36, 0.3);
      }

      .tournament-create-4:hover {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
      }

      .tournament-create-8:hover {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
      }

      .tournament-create-icon {
        position: relative;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2));
      }

      .tournament-create-8 .tournament-create-icon {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.2));
      }

      .create-btn-glow {
        position: absolute;
        inset: -2px;
        border-radius: 1rem;
        background: linear-gradient(45deg, rgba(251, 191, 36, 0.5), rgba(245, 158, 11, 0.3));
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .tournament-create-btn:hover .create-btn-glow {
        opacity: 1;
        animation: glow-pulse 2s ease-in-out infinite;
      }

      @keyframes glow-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }

      .tournament-create-content {
        flex: 1;
      }

      .tournament-stats {
        display: flex;
        gap: 2rem;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-value {
        font-size: 1.25rem;
        font-weight: bold;
        color: #fbbf24;
      }

      .stat-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
      }

      .tournament-create-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
      }

      .tournament-create-btn:hover .tournament-create-overlay {
        transform: translateX(100%);
      }

      /* Tournament Brackets */
      .tournament-bracket-container {
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }

      .bracket-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .tournament-brackets {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }

      .brackets-placeholder {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
      }

      .brackets-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        animation: brackets-float 3s ease-in-out infinite;
      }

      @keyframes brackets-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .brackets-text {
        margin-bottom: 2rem;
        font-style: italic;
      }

      .brackets-animation {
        position: relative;
        width: 200px;
        height: 60px;
        margin: 0 auto;
      }

      .bracket-line {
        position: absolute;
        top: 50%;
        left: 20%;
        right: 20%;
        height: 2px;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.5), rgba(168, 85, 247, 0.5));
        transform: translateY(-50%);
        animation: bracket-glow 2s ease-in-out infinite;
      }

      @keyframes bracket-glow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }

      .bracket-node {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        top: 50%;
        transform: translateY(-50%);
        animation: bracket-pulse 2s ease-in-out infinite;
      }

      .bracket-node-1 {
        left: 15%;
        animation-delay: 0s;
      }

      .bracket-node-2 {
        left: 50%;
        transform: translate(-50%, -50%);
        animation-delay: 0.5s;
      }

      .bracket-node-3 {
        right: 15%;
        animation-delay: 1s;
      }

      @keyframes bracket-pulse {
        0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.6; }
        50% { transform: translateY(-50%) scale(1.3); opacity: 1; }
      }

      /* Leaderboard */
      .leaderboard-container {
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }

      .leaderboard-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .leaderboard-icon {
        font-size: 2rem;
        animation: trophy-spin 4s linear infinite;
      }

      @keyframes trophy-spin {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(10deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-10deg); }
        100% { transform: rotate(0deg); }
      }

      .leaderboard-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin: 0;
      }

      .leaderboard-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .leaderboard-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
      }

      .leaderboard-item:hover {
        transform: translateX(10px);
        border-color: rgba(251, 191, 36, 0.5);
      }

      .leaderboard-gold {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
      }

      .leaderboard-silver {
        background: linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(107, 114, 128, 0.1) 100%);
      }

      .leaderboard-bronze {
        background: linear-gradient(135deg, rgba(180, 83, 9, 0.2) 0%, rgba(146, 64, 14, 0.1) 100%);
      }

      .leaderboard-rank {
        font-size: 1.5rem;
        font-weight: bold;
        color: #fbbf24;
        min-width: 2rem;
        text-align: center;
      }

      .leaderboard-player {
        flex: 1;
        font-weight: semibold;
        color: white;
      }

      .leaderboard-score {
        font-weight: bold;
        color: #fbbf24;
      }

      /* Disabled State */
      .tournament-create-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .tournament-create-btn:disabled:hover {
        transform: none !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        box-shadow: none !important;
      }

      /* Tournament Cards */
      .tournament-card {
        position: relative;
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 1.5rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.4s ease;
        overflow: hidden;
      }

      .tournament-card:hover {
        transform: translateY(-5px);
        border-color: rgba(251, 191, 36, 0.5);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(251, 191, 36, 0.2);
      }

      .tournament-card-glow {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.1), transparent);
        transition: left 0.6s ease;
      }

      .tournament-card:hover .tournament-card-glow {
        left: 100%;
      }

      .tournament-card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .tournament-card-icon {
        font-size: 2rem;
        padding: 0.5rem;
        border-radius: 1rem;
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2));
        animation: icon-float 3s ease-in-out infinite;
      }

      @keyframes icon-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      .tournament-card-info {
        flex: 1;
      }

      .tournament-card-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: white;
        margin: 0 0 0.25rem 0;
      }

      .tournament-card-subtitle {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }

      .tournament-card-status {
        padding: 0.5rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .status-open {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2));
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.4);
      }

      .status-joined {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.4);
      }

      .status-full {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2));
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.4);
      }

      .tournament-card-body {
        margin-bottom: 1.5rem;
      }

      .tournament-host {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .host-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
      }

      .host-name {
        font-weight: semibold;
        color: #fbbf24;
      }

      .tournament-progress-section {
        space-y: 0.5rem;
      }

      .tournament-progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .progress-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
      }

      .progress-count {
        font-weight: bold;
        color: white;
      }

      .tournament-progress-bar-container {
        position: relative;
      }

      .tournament-progress-bar {
        width: 100%;
        height: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.25rem;
        overflow: hidden;
      }

      .tournament-progress-fill {
        height: 100%;
        border-radius: 0.25rem;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-gold {
        background: linear-gradient(90deg, #fbbf24, #f59e0b);
      }

      .progress-purple {
        background: linear-gradient(90deg, #a855f7, #8b5cf6);
      }

      .tournament-progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: progress-shine 2s ease-in-out infinite;
      }

      @keyframes progress-shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .tournament-card-footer {
        position: relative;
      }

      .tournament-join-btn {
        width: 100%;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        color: white;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .tournament-join-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      }

      .join-btn-gold:hover:not(:disabled) {
        border-color: rgba(251, 191, 36, 0.6);
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
      }

      .join-btn-purple:hover:not(:disabled) {
        border-color: rgba(168, 85, 247, 0.6);
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
      }

      .join-btn-text {
        position: relative;
        z-index: 2;
      }

      .join-btn-icon {
        font-size: 1.25rem;
        position: relative;
        z-index: 2;
      }

      .join-btn-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
      }

      .tournament-join-btn:hover:not(:disabled) .join-btn-shine {
        left: 100%;
      }

      .tournament-join-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      /* Tournament Status Card */
      .tournament-status-card {
        position: relative;
        backdrop-filter: blur(20px);
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%);
        border: 2px solid rgba(34, 197, 94, 0.3);
        border-radius: 1.5rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .tournament-status-icon {
        font-size: 2rem;
        animation: status-pulse 2s ease-in-out infinite;
      }

      @keyframes status-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .tournament-status-content {
        flex: 1;
      }

      .tournament-status-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: white;
        margin: 0 0 0.5rem 0;
      }

      .tournament-status-text {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 1rem 0;
      }

      .tournament-status-progress {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .tournament-progress-bar {
        flex: 1;
        height: 0.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 0.25rem;
        overflow: hidden;
      }

      .tournament-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        border-radius: 0.25rem;
        transition: width 0.3s ease;
      }

      .tournament-progress-text {
        font-size: 0.875rem;
        color: #22c55e;
        font-weight: semibold;
      }

      .tournament-quit-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        border: 2px solid rgba(239, 68, 68, 0.4);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%);
        color: white;
        font-weight: semibold;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .tournament-quit-btn:hover {
        transform: translateY(-2px);
        border-color: rgba(239, 68, 68, 0.6);
        box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
      }

      .quit-btn-icon {
        font-size: 1rem;
      }

      /* Empty State */
      .tournament-empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: rgba(255, 255, 255, 0.6);
      }

      .empty-state-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: empty-float 3s ease-in-out infinite;
      }

      @keyframes empty-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .empty-state-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin-bottom: 0.5rem;
      }

      .empty-state-text {
        margin-bottom: 2rem;
        color: rgba(255, 255, 255, 0.7);
      }

      .empty-state-animation {
        position: relative;
        width: 200px;
        height: 100px;
        margin: 0 auto;
      }

      .empty-ball {
        width: 10px;
        height: 10px;
        background: #60a5fa;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: empty-ball-bounce 2s ease-in-out infinite;
      }

      @keyframes empty-ball-bounce {
        0%, 100% { transform: translate(-50%, -50%) translateX(-80px); }
        50% { transform: translate(-50%, -50%) translateX(80px); }
      }

      .empty-paddle {
        width: 8px;
        height: 40px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 4px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      .empty-paddle-left {
        left: 20px;
        animation: empty-paddle-move 2s ease-in-out infinite;
      }

      .empty-paddle-right {
        right: 20px;
        animation: empty-paddle-move 2s ease-in-out infinite reverse;
      }

      @keyframes empty-paddle-move {
        0%, 100% { transform: translateY(-50%) translateY(-10px); }
        50% { transform: translateY(-50%) translateY(10px); }
      }
    </style>
  `;

  renderTournamentList();
  wsManager.subscribeToPresence(renderTournamentList);

  // Added event listeners for create tournament buttons
  document.getElementById('create-tournament-4')?.addEventListener('click', () => {
    if (!currentTournamentId) createTournament(4);
  });

  document.getElementById('create-tournament-8')?.addEventListener('click', () => {
    if (!currentTournamentId) createTournament(8);
  });

  function handleTournamentMessage(msg: any) {
    if (msg.type === 'matchStart') {
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

      if (msg.player1 === userId || msg.player2 === userId) {
        // 🎯 Player is part of this match – redirect to tournament-match
        sessionStorage.setItem('currentTournamentMatch', JSON.stringify(msg));
        location.hash = '#/tournament-match';
      } else {
        console.log('🎯 Spectating match in tournament bracket');
        // Optionally update bracket display live here
      }
    }
  }

  function renderTournamentList() {
    const list = document.getElementById('tournament-list')!;
    list.innerHTML = '';

    const tournaments = wsManager.onlineTournaments;
    const token = getToken();
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    const userTournament = tournaments.find(t => t.playerIds.includes(userId));
    currentTournamentId = userTournament ? userTournament.id : null;

    if (userTournament) {
      const infoBox = document.createElement('div');
      infoBox.className = 'tournament-status-card tournament-status-joined';
      infoBox.innerHTML = `
        <div class="tournament-status-icon">✅</div>
        <div class="tournament-status-content">
          <h3 class="tournament-status-title">Joined Tournament</h3>
          <p class="tournament-status-text">Tournament ${userTournament.id} • ${userTournament.joined}/${userTournament.size} players</p>
          <div class="tournament-status-progress">
            <div class="tournament-progress-bar">
              <div class="tournament-progress-fill" style="width: ${(userTournament.joined / userTournament.size) * 100}%"></div>
            </div>
            <span class="tournament-progress-text">${Math.round((userTournament.joined / userTournament.size) * 100)}% Full</span>
          </div>
        </div>
        <button id="quit-tournament-btn" class="tournament-quit-btn">
          <span>Leave</span>
          <div class="quit-btn-icon">🚪</div>
        </button>
      `;
      list.appendChild(infoBox);

      infoBox.querySelector('#quit-tournament-btn')?.addEventListener('click', () => {
        wsManager.quitTournament();
        currentTournamentId = null;
        alert('🚪 You left the tournament.');
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      });
    }

    if (tournaments.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'tournament-empty-state';
      emptyState.innerHTML = `
        <div class="empty-state-icon">🎮</div>
        <h3 class="empty-state-title">No Active Tournaments</h3>
        <p class="empty-state-text">Be the first to create an epic tournament!</p>
        <div class="empty-state-animation">
          <div class="empty-ball"></div>
          <div class="empty-paddle empty-paddle-left"></div>
          <div class="empty-paddle empty-paddle-right"></div>
        </div>
      `;
      list.appendChild(emptyState);
    }

    for (const t of tournaments) {
      const isFull = t.joined >= t.size;
      const userInTournament = t.playerIds.includes(userId);

      const tournamentCard = document.createElement('div');
      tournamentCard.className = `tournament-card ${isFull ? 'tournament-full' : ''} ${userInTournament ? 'tournament-joined' : ''}`;

      const progressPercentage = (t.joined / t.size) * 100;

      tournamentCard.innerHTML = `
        <div class="tournament-card-header">
          <div class="tournament-card-icon">
            ${t.size === 4 ? '🏅' : '👑'}
          </div>
          <div class="tournament-card-info">
            <h3 class="tournament-card-title">Tournament ${t.id}</h3>
            <p class="tournament-card-subtitle">${t.size === 4 ? 'Rapid Fire' : 'Epic Battle'} • ${t.size} Players</p>
          </div>
          <div class="tournament-card-status ${isFull ? 'status-full' : userInTournament ? 'status-joined' : 'status-open'}">
            ${isFull ? 'FULL' : userInTournament ? 'JOINED' : 'OPEN'}
          </div>
        </div>

        <div class="tournament-card-body">
          <div class="tournament-host">
            <span class="host-label">Host:</span>
            <span class="host-name">${t.hostId}</span>
          </div>

          <div class="tournament-progress-section">
            <div class="tournament-progress-info">
              <span class="progress-label">Players</span>
              <span class="progress-count">${t.joined}/${t.size}</span>
            </div>
            <div class="tournament-progress-bar-container">
              <div class="tournament-progress-bar">
                <div class="tournament-progress-fill ${t.size === 4 ? 'progress-gold' : 'progress-purple'}"
                     style="width: ${progressPercentage}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="tournament-card-footer">
          <button
            ${isFull || userTournament ? 'disabled' : ''}
            class="tournament-join-btn ${t.size === 4 ? 'join-btn-gold' : 'join-btn-purple'}"
            data-id="${t.id}"
            data-size="${t.size}"
          >
            <span class="join-btn-text">
              ${userInTournament ? 'Already Joined' : isFull ? 'Tournament Full' : 'Join Battle'}
            </span>
            <div class="join-btn-icon">
              ${userInTournament ? '✓' : isFull ? '⚠️' : '⚔️'}
            </div>
            <div class="join-btn-shine"></div>
          </button>
        </div>

        <div class="tournament-card-glow"></div>
      `;

      const button = tournamentCard.querySelector('button')!;
      if (!isFull && !userTournament && !userInTournament) {
        button.addEventListener('click', () => {
          joinTournament(t.id, t.size);
        });
      }

      list.appendChild(tournamentCard);
    }

    // Update create button states
    const createBtn4 = document.getElementById('create-tournament-4') as HTMLButtonElement;
    const createBtn8 = document.getElementById('create-tournament-8') as HTMLButtonElement;

    if (createBtn4) createBtn4.disabled = !!userTournament;
    if (createBtn8) createBtn8.disabled = !!userTournament;
  }

  function joinTournament(id: string, size: 4 | 8) {
    if (currentTournamentId) {
      alert(`⚠️ You're already in Tournament ${currentTournamentId}.`);
      return;
    }

    const socket = wsManager.connectTournamentSocket('join', size, id, (msg) => {
      handleTournamentMessage(msg);
      if (msg.type === 'tournamentJoined') {
        currentTournamentId = msg.id;
        alert('🎮 Joined tournament. Waiting for match...');
        renderTournamentList();
      } else if (msg.type === 'tournamentLeft') {
        currentTournamentId = null;
        renderTournamentList();
      } else if (msg.type === 'end') {
        alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
        currentTournamentId = null;
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      }
    });

    if (!socket) alert('Connection failed');
  }

  function createTournament(size: 4 | 8) {
    if (currentTournamentId) {
      alert(`⚠️ You're already in a tournament.`);
      return;
    }

    const socket = wsManager.connectTournamentSocket('create', size, undefined, (msg) => {
      handleTournamentMessage(msg);
      if (msg.type === 'tournamentJoined') {
        currentTournamentId = msg.id;
        alert(`🎉 Created Tournament ${msg.id}`);
        renderTournamentList();
      } else if (msg.type === 'end') {
        alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
        currentTournamentId = null;
        wsManager.disconnectTournamentSocket();
        renderTournamentList();
      }
    });

    if (!socket) alert('Failed to create tournament');
  }
}


// import { renderNav } from './nav';
// import { renderBackgroundTop } from '../utils/layout';
// import { getToken, validateLogin } from '../utils/auth';
// import { wsManager } from '../websocket/ws-manager';

// let currentTournamentId: string | null = null;

// export async function renderTournament(root: HTMLElement) {
//   const isValid = await validateLogin();
//   if (!isValid) {
//     location.hash = '#/login';
//     return;
//   }

//   root.innerHTML = renderNav() + renderBackgroundTop(`
//     <div class="max-w-3xl mx-auto mt-20 p-6 bg-white/10 rounded-xl shadow-lg backdrop-blur-md">
//       <h1 class="text-3xl font-bold mb-4 text-center text-white">🏆 Tournament Lobby</h1>
//       <p class="text-center text-gray-400 mb-6">Join a tournament and compete for glory!</p>
//       <div id="tournament-list" class="space-y-4 text-white"></div>
//     </div>
//   `);

//   renderTournamentList();
//   wsManager.subscribeToPresence(renderTournamentList);

//   function handleTournamentMessage(msg: any) {
//     if (msg.type === 'matchStart') {
//       const token = getToken();
//       const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

//       if (msg.player1 === userId || msg.player2 === userId) {
//         // 🎯 Player is part of this match – redirect to tournament-match
//         sessionStorage.setItem('currentTournamentMatch', JSON.stringify(msg));
//         location.hash = '#/tournament-match';
//       } else {
//         console.log('🎯 Spectating match in tournament bracket');
//         // Optionally update bracket display live here
//       }
//     }
//   }

//   function renderTournamentList() {
//     const list = document.getElementById('tournament-list')!;
//     list.innerHTML = '';

//     const tournaments = wsManager.onlineTournaments;
//     const token = getToken();
//     const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

//     const userTournament = tournaments.find(t => t.playerIds.includes(userId));
//     currentTournamentId = userTournament ? userTournament.id : null;

//     if (userTournament) {
//       const infoBox = document.createElement('div');
//       infoBox.innerHTML = `
//         <div class="text-center text-green-400 mb-4">
//           ✅ You have joined Tournament <strong>${userTournament.id}</strong> (${userTournament.joined}/${userTournament.size})
//         </div>
//         <div class="text-center mb-4">
//           <button id="quit-tournament-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
//             Quit Tournament
//           </button>
//         </div>
//       `;
//       list.appendChild(infoBox);

//       infoBox.querySelector('#quit-tournament-btn')?.addEventListener('click', () => {
//         wsManager.quitTournament();
//         currentTournamentId = null;
//         alert('🚪 You left the tournament.');
//         wsManager.disconnectTournamentSocket();
//         renderTournamentList();
//       });
//     }

//     if (tournaments.length === 0) {
//       const emptyMsg = document.createElement('p');
//       emptyMsg.className = 'text-center text-gray-400';
//       emptyMsg.textContent = 'No active tournaments yet.';
//       list.appendChild(emptyMsg);
//     }

//     for (const t of tournaments) {
//       const isFull = t.joined >= t.size;
//       const userInTournament = t.playerIds.includes(userId);

//       const div = document.createElement('div');
//       div.className =
//         'border border-white/20 p-4 rounded-lg bg-black/30 flex justify-between items-center';

//       div.innerHTML = `
//         <div>
//           <h2 class="font-semibold text-lg">Tournament ${t.id}</h2>
//           <p class="text-sm text-gray-300">Host: ${t.hostId}</p>
//           <p class="text-sm text-gray-300">${t.joined}/${t.size} players joined</p>
//         </div>
//         <button
//           ${isFull || userTournament ? 'disabled' : ''}
//           class="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium"
//           data-id="${t.id}"
//           data-size="${t.size}"
//         >
//           ${userInTournament ? 'Joined' : isFull ? 'Full' : 'Join'}
//         </button>
//       `;

//       const button = div.querySelector('button')!;
//       if (!isFull && !userTournament && !userInTournament) {
//         button.addEventListener('click', () => {
//           joinTournament(t.id, t.size);
//         });
//       }

//       list.appendChild(div);
//     }

//     const createDiv = document.createElement('div');
//     createDiv.className = 'text-center mt-6';

//     createDiv.innerHTML = `
//       <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold"
//         id="create-tournament-4" ${userTournament ? 'disabled' : ''}>
//         Create 4-Player Tournament
//       </button>
//       <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold ml-4"
//         id="create-tournament-8" ${userTournament ? 'disabled' : ''}>
//         Create 8-Player Tournament
//       </button>
//     `;

//     createDiv.querySelector('#create-tournament-4')?.addEventListener('click', () => {
//       if (!userTournament) createTournament(4);
//     });

//     createDiv.querySelector('#create-tournament-8')?.addEventListener('click', () => {
//       if (!userTournament) createTournament(8);
//     });

//     list.appendChild(createDiv);
//   }

//   function joinTournament(id: string, size: 4 | 8) {
//     if (currentTournamentId) {
//       alert(`⚠️ You're already in Tournament ${currentTournamentId}.`);
//       return;
//     }

//     const socket = wsManager.connectTournamentSocket('join', size, id, (msg) => {
//       handleTournamentMessage(msg);
//       if (msg.type === 'tournamentJoined') {
//         currentTournamentId = msg.id;
//         alert('🎮 Joined tournament. Waiting for match...');
//         renderTournamentList();
//       } else if (msg.type === 'tournamentLeft') {
//         currentTournamentId = null;
//         renderTournamentList();
//       } else if (msg.type === 'end') {
//         alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
//         currentTournamentId = null;
//         wsManager.disconnectTournamentSocket();
//         renderTournamentList();
//       }
//     });

//     if (!socket) alert('Connection failed');
//   }

//   function createTournament(size: 4 | 8) {
//     if (currentTournamentId) {
//       alert(`⚠️ You're already in a tournament.`);
//       return;
//     }

//     const socket = wsManager.connectTournamentSocket('create', size, undefined, (msg) => {
//       handleTournamentMessage(msg);
//       if (msg.type === 'tournamentJoined') {
//         currentTournamentId = msg.id;
//         alert(`🎉 Created Tournament ${msg.id}`);
//         renderTournamentList();
//       } else if (msg.type === 'end') {
//         alert(`🏁 Tournament finished! Winner: ${msg.winner}`);
//         currentTournamentId = null;
//         wsManager.disconnectTournamentSocket();
//         renderTournamentList();
//       }
//     });

//     if (!socket) alert('Failed to create tournament');
//   }
// }
