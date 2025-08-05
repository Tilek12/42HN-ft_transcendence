"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = router;
const main_page_1 = require("./pages/main-page");
const tournament_1 = require("./pages/tournament");
const game_1 = require("./pages/game");
const profile_1 = require("./pages/profile");
const tournament_match_1 = require("./pages/tournament-match");
const login_1 = require("./pages/login");
const register_1 = require("./pages/register");
const friends_1 = require("./pages/friends");
const leaderboard_1 = require("./pages/leaderboard");
const settings_1 = require("./pages/settings");
const not_found_1 = require("./pages/not-found");
const auth_1 = require("./utils/auth");
async function router() {
    const root = document.getElementById('app');
    const route = location.hash || '#/';
    root.style.opacity = '0';
    setTimeout(() => {
        root.innerHTML = '';
        const protectedRoutes = ['#/profile', '#/friends', '#/game', '#/settings', '#/tournament'];
        if (protectedRoutes.includes(route) && !(0, auth_1.isLoggedIn)()) {
            location.hash = '#/login';
            return;
        }
        switch (route) {
            case '#/tournament': return (0, tournament_1.renderTournament)(root);
            case '#/tournament-match': return (0, tournament_match_1.renderTournamentMatch)(root);
            case '#/game': return (0, game_1.renderGame)(root);
            case '#/profile': return (0, profile_1.renderProfile)(root);
            case '#/login': return (0, login_1.renderLogin)(root);
            case '#/register': return (0, register_1.renderRegister)(root);
            case '#/friends': return (0, friends_1.renderFriends)(root);
            case '#/leaderboard': return (0, leaderboard_1.renderLeaderboard)(root);
            case '#/settings': return (0, settings_1.renderSettings)(root);
            case '#/':
            case '': return (0, main_page_1.renderMainPage)(root);
            default: return (0, not_found_1.renderNotFound)(root);
        }
    }, 100);
    setTimeout(() => {
        root.style.opacity = '1';
    }, 200);
}
//# sourceMappingURL=router.js.map