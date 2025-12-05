import { Language, PlaceholderElement, TranslationSet } from '../types.js'



class LanguageStore {
	private _language: Language = 'EN';
	private _listeners: ((lang: Language) => void)[] = [];
	private _langSelect: HTMLSelectElement | undefined;

	contructor() {
		this._langSelect = undefined;
	}

	set language(lang: Language) {
		if (this._langSelect) {
			this._langSelect.value = lang;
		}
		localStorage.setItem('PongLanguage', lang);
		this._language = lang;
		this._listeners.forEach(cb => cb(lang));
	}

	get language() {
		return this._language;
	}

	subscribe(cb: (lang: Language) => void) {
		this._listeners.push(cb);
	}

	initLang() {
		const langSelect = document.getElementById('language-select') as HTMLSelectElement;
		if (langSelect) {
			this._langSelect = langSelect;
			langSelect.addEventListener('change', () => {
				console.log('clicked');
				const selected = langSelect.value as Language;
				languageStore.language = selected;
			})
		}
	}
}


export function transelate_per_id(tr_set: TranslationSet, key: string, lang: Language, element_id: string) {
	let headerEl = document.getElementById(element_id);
	if (headerEl) {
		let value = tr_set[lang][key];
		if (value) {
			if (key.includes("placeholder") && (headerEl instanceof HTMLInputElement || headerEl instanceof HTMLTextAreaElement)) {
				headerEl.placeholder = value;
			}
			else
				headerEl.innerText = value;
		}
	}
}



export const languageStore = new LanguageStore();
export const translations_nav: TranslationSet =
{
	EN: {
		game: 'Game',
		tournament: 'Tournament',
		leaderboard: 'Leaderboard',
		friends: 'Friends',
		profile: 'Profile',
		settings: 'Settings',
		online_users: 'Online Users',
		login: 'Login',
		logout: 'Logout',
	},
	DE: {
		game: 'Spiel',
		tournament: 'Turnier',
		leaderboard: 'Bestenliste',
		friends: 'Freunde',
		profile: 'Profil',
		settings: 'Einstellungen',
		online_users: 'Online Benutzer',
		login: 'Anmelden',
		logout: 'Abmelden',
	},
	GR: {
		game: 'Παιχνίδι',
		tournament: 'Τουρνουά',
		leaderboard: 'Κατάταξη',
		friends: 'Φίλοι',
		profile: 'Προφίλ',
		settings: 'Ρυθμίσεις',
		online_users: 'Ενεργοί',
		login: 'Σύνδεση',
		logout: 'Αποσύνδεση',
	}
};

export const translations_profile: TranslationSet =
{
	EN: {
		your_profile: 'My Profile',
		user_list: 'Other Users',
		friends_list: 'My friends',
		request_list: 'My friend requests',
		logged_in: 'Logged in',
		opponent:'Opponent',
		score:'Score',
		result:'Result',
		played_at:'Date',
		total:'Total Games',
		rate:'Win Rate',
		tournament_games: 'Tournament games',
		username: 'Username:',
		wins: 'Wins',
		losses: 'Losses',
		trophies: 'Trophies',
		joined: 'Joined:',
		match_history: 'Match History',
		no_match_history: 'No Match History yet',
		no_friend_requests: 'No Friend Requests',
		load_more: 'Load More',
		logout: 'Logout'
	},
	DE: {
		your_profile: 'Mein Profil',
		user_list: 'Andere Spieler',
		friends_list: 'Meine Freunde',
		request_list: 'Meine Freundschaftsanfragen',
		logged_in: 'Eingeloggt',
		opponent:'Opponent',
		score:'Spielstand',
		result:'Ergebnis',
		played_at:'Zeitpunkt',
		total:'Gesamt Spiele',
		rate:'Gewinnrate',
		tournament_games: 'Turnier Spiele',
		username: 'Benutzername:',
		wins: 'Siege',
		losses: 'Niederlagen',
		trophies: 'Trophäen',
		joined: 'Beigetreten:',
		match_history: 'Spielverlauf',
		no_match_history: 'Keine Spielhistorie vorhanden',
		no_friend_requests: 'Keine Freundschaftsanfragen',
		load_more: 'Mehr laden',
		logout: 'Abmelden'
	},
	GR: {
		your_profile: 'Το προφίλ σας',
		user_list: 'Άλλοι χρήστες',
		friends_list: 'Οι φίλοι μου',
		request_list: 'Τα αιτήματα φιλίας μου',
		logged_in: 'Συνδεδεμένος',
		opponent:'Αντίπαλος',
		score:'Σκορ',
		result:'Αποτέλεσμα',
		played_at:'Παίχτηκε στις',
		total:'Σύνολο',
		rate:'Ποσοστό Νικών',
		tournament_games: 'Αγώνες τουρνουά',
		username: 'Όνομα χρήστη:',
		wins: 'Νίκες ',
		losses: 'Ήττες ',
		trophies: 'Τρόπαια ',
		joined: 'Εγγράφηκε: ',
		match_history: 'Ιστορικό αγώνων',
		no_match_history: 'Δεν υπάρχει ακόμα ιστορικό αγώνων',
		no_friend_requests: 'Δεν υπάρχουν αιτήσεις φίλων',
		load_more: 'Περισσότερα Προφίλ',
		logout: 'Αποσύνδεση'
	}
}

export const translations_settings: TranslationSet =
{
	EN: {
		tfa_header: '2 Factor Authentification:',
		password: 'Password',
		choose: 'Choose new picture',
		update: 'Update',
		delete: 'Delete',
		edit: 'Edit',
		cancel: 'Cancel',
		username: 'Username:',
		wins: 'wins:',
		losses: 'losses:',
		trophies: 'trophies:',
		joined: 'Joined:',
		current_password_placeholder: 'Current password',
		new_password_placeholder: 'New Password',
		confirm_new_password_placeholder: 'Confirm New Passsword',
		new_password_btn: 'New Password',
		security: 'Security',
		profile_settings_header: 'Profile Settings',
		tfa_status_enabled: 'Enabled',
		tfa_status_disabled: 'Disabled',
		tfa_enable_header: 'Enable TOTP 2 Factor Authentification',
		tfa_disable_header: 'Disable 2 Factor Authentifiation',
		tfa_disable_headline: 'To disable 2FA enter your password and TOTP from authenticator',
		tfa_enable_headline: 'To enable 2FA scan this QR code with your autheticator and enter the TOTP code',
		tfa_token_placeholder: '6 digit code',
		password_placeholder: 'Password',
		tfa_submit: 'Submit',
	},
	DE: {
		tfa_header: '2 Faktor Authentifizierung:',
		password: 'Passwort',
		choose: 'Neues Bild Wählen',
		update: 'Aktualisieren',
		delete: 'Löschen',
		edit: 'Name ändern',
		cancel: 'Abbrechen',
		username: 'Benutzername:',
		joined: 'Beigetreten:',
		current_password_placeholder: 'Aktuelles Passwort',
		new_password_placeholder: 'Neues Passwort',
		confirm_new_password_placeholder: 'Neues Passwort bestätigen',
		new_password_btn: 'Neues Passwort',
		security: 'Sicherheit',
		profile_settings_header: 'Profil Einstellungen',
		tfa_status_enabled: 'Aktiviert',
		tfa_status_disabled: 'Deaktiviert',
		tfa_enable_header: 'Aktiviere TOTP 2 Faktor Authentifizierung',
		tfa_disable_header: 'Deaktiviere 2 Faktor Authentifizierung',
		tfa_disable_headline: 'Um 2FA zu deaktivieren gib bitte dein Passwort und den TOTP Code aus dem Authenticator ein.',
		tfa_enable_headline: 'Um 2FA zu aktivieren scanne diesen QR code mit dem Authenticator und gib den TOTP Code daraus ein.',
		tfa_token_placeholder: '6 stelliger Code',
		password_placeholder: 'Passwort ',
		tfa_submit: 'Bestätigen',

	},
	GR: {
		tfa_header: 'Επαλήθευση δύο παραγόντων:',
		password: 'Κωδικός',
		choose: 'Επιλέξτε νέα εικόνα',
		update: 'Ενημέρωση',
		delete: 'Διαγραφή',
		edit: 'Επεξεργασία',
		cancel: 'Ακύρωση',
		username: 'Όνομα χρήστη:',
		joined: 'Εγγράφηκε: ',
		current_password_placeholder: 'Τρέχων κωδικός',
		new_password_placeholder: 'Νέος κωδικός',
		confirm_new_password_placeholder: 'Επιβεβαίωση νέου κωδικού',
		new_password_btn: 'Νέος Κωδικός',
		security: 'Ασφάλεια',
		profile_settings_header: 'Ρυθμίσεις Προφίλ',
		tfa_status_enabled: 'Ενεργοποιημένο',
		tfa_status_disabled: 'Απενεργοποιημένο',
		tfa_enable_header: 'Ενεργοποίηση επαλήθευσης δύο παραγόντων (TOTP)',
		tfa_disable_header: 'Απενεργοποίηση επαλήθευσης δύο παραγόντων (TOTP)',
		tfa_disable_headline: 'Για να απενεργοποιήσετε την 2FA, εισαγάγετε τον κωδικό σας και τον TOTP από την εφαρμογή επαλήθευσης.',
		tfa_enable_headline: 'Για να ενεργοποιήσετε την 2FA, σκανάρετε αυτό το QR κώδικα με την εφαρμογή αυθεντικοποίησης σας και εισαγάγετε τον κωδικό TOTP.',
		tfa_token_placeholder: '6ψήφιος κωδικός',
		password_placeholder: 'Κωδικός',
		tfa_submit: 'Υποβολή',
	}
}

export const translations_friends: TranslationSet = {
	EN: {
		unlink: 'Unlink',
		link: 'Link',
		pending: 'Pending...',
		block: 'Block',
		unblock: 'Unblock',
		online: 'online',
		offline: 'offline'
	},
	DE: {
		unlink: 'Entfernen',
		link: 'Verbinden',
		pending: 'Ausstehend...',
		block: 'Blockieren',
		unblock: 'Entsperren',
		online: 'online',
		offline: 'offline'
	},
	GR: {
		unlink: 'Αποσύνδεση',
		link: 'Σύνδεση',
		pending: 'Εκκρεμεί...',
		block: 'Μπλοκάρισμα',
		unblock: 'Ξεμπλοκάρισμα',
		online: 'ενεργός',
		offline: 'ανενεργός'
	}
};

export const translations_register_page: TranslationSet = {
	EN: {
		register_tab: 'Sign up',
		register_header: 'Create Account',
		register_subtitle: 'Join us today!',
		username_label: 'Username',
		password_label: 'Password',
		username_placeholder: 'Choose a username',
		password_placeholder: 'Choose a strong password',
		qrcode_label: 'Enable 2 Factor Authentification by scanning this QR code with an authenticator app',
		tfa_label: 'Enable 2FA',
		tfa_placeholder: '6 digit code',
		register_btn: 'Register',
		already_have_account: 'Already have an account?',
		success: 'Success'
	},
	DE: {
		register_tab: 'Registrieren',
		register_header: 'Konto erstellen',
		register_subtitle: 'Kommen sie dazu!',
		username_label: 'Benutzername',
		password_label: 'Passwort',
		username_placeholder: 'Wählen Sie einen Benutzernamen',
		password_placeholder: 'Wählen Sie ein starkes Passwort',
		qrcode_label: 'Zum aktivieren scanne diesen QR Code mit einer Authenticator App',
		tfa_label: '2FA Aktivieren',
		tfa_placeholder: '6 stelliger code',
		register_btn: 'Registrieren',
		already_have_account: 'Haben Sie bereits ein Konto?',
		success: 'Erfolgreich!'
	},
	GR: {
		register_tab: 'Εγγραφή',
		register_header: 'Δημιουργία λογαριασμού',
		register_subtitle: 'Γίνετε μέλος σήμερα!',
		username_label: 'Όνομα χρήστη',
		password_label: 'Κωδικός',
		username_placeholder: 'Εισάγετε το όνομα χρήστη σας',
		password_placeholder: 'Εισάγετε τον κωδικό σας',
		qrcode_label: 'Ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων σαρώνοντας αυτόν τον κωδικό QR με μια εφαρμογή ελέγχου ταυτότητας.',
		tfa_label: 'Ενεργοποίηση 2FA',
		tfa_placeholder: '6ψήφιος κωδικός',
		register_btn: 'Εγγραφή',
		already_have_account: 'Έχετε ήδη λογαριασμό;',
		success: 'επιτυχία'
	}
};

export const translations_main_page: TranslationSet = {
	EN: {
		main_welcome_header: 'Welcome to Pong Game!',
		main_subtitle: 'Start the game and prove your skills.',
		main_view_game_btn: 'View Game'
	},
	DE: {
		main_welcome_header: 'Willkommen beim Pong-Spiel!',
		main_subtitle: 'Starte das Spiel und zeige dein Können.',
		main_view_game_btn: 'Spiel anzeigen'
	},
	GR: {
		main_welcome_header: 'Καλώς ήρθες στο παιχνίδι Pong!',
		main_subtitle: 'Ξεκίνα το παιχνίδι και δείξε τις ικανότητές σου.',
		main_view_game_btn: 'Προβολή Παιχνιδιού'
	}
};

export const translations_login_page: TranslationSet = {
	EN: {
		login_tab: 'Log in',
		login_header: 'Welcome Back',
		login_subtitle: 'Sign in to continue to your account',
		google_btn: 'Continue with Google',
		or_continue: 'Or continue with email',
		username_label: 'Username',
		username_placeholder: 'Enter your username',
		password_label: 'Password',
		password_placeholder: 'Enter your password',
		remember_me: 'Remember me',
		forgot_password: 'Forgot password?',
		sign_in_btn: 'Sign In',
		tfa_placeholder: '6 digit code',
		dont_have_account: "Don't have an account?",
		create_account: 'Create account',
		signing_in: 'Signing in...',
		tfa_label: 'Please enter your TOTP code from your authenticator',
	},
	DE: {
		login_tab: 'Anmelden',
		login_header: 'Willkommen zurück',
		login_subtitle: 'Melden Sie sich an, um fortzufahren',
		google_btn: 'Mit Google fortfahren',
		or_continue: 'Oder weiter mit E-Mail',
		username_label: 'Benutzername',
		username_placeholder: 'Geben Sie Ihren Benutzernamen ein',
		password_label: 'Passwort',
		password_placeholder: 'Geben Sie Ihr Passwort ein',
		remember_me: 'Angemeldet bleiben',
		forgot_password: 'Passwort vergessen?',
		sign_in_btn: 'Anmelden',
		tfa_placeholder: '6 stelliger code',
		dont_have_account: 'Sie haben kein Konto?',
		create_account: 'Konto erstellen',
		signing_in: 'Anmelden ...',
		tfa_label: 'Bitte geben sie den Code aus ihrem TOTP Authenticator ein',
	},
	GR: {
		login_tab: 'Σύνδεση',
		login_header: 'Καλώς ήρθες ξανά',
		login_subtitle: 'Συνδεθείτε για να συνεχίσετε',
		google_btn: 'Συνέχεια με Google',
		or_continue: 'Ή συνεχίστε με email',
		username_label: 'Όνομα χρήστη',
		username_placeholder: 'Εισάγετε το όνομα χρήστη σας',
		password_label: 'Κωδικός πρόσβασης',
		password_placeholder: 'Εισάγετε τον κωδικό πρόσβασης',
		remember_me: 'Να με θυμάσαι',
		forgot_password: 'Ξεχάσατε τον κωδικό;',
		sign_in_btn: 'Σύνδεση',
		tfa_placeholder: '6ψήφιος κωδικός',
		dont_have_account: 'Δεν έχετε λογαριασμό;',
		create_account: 'Δημιουργία λογαριασμού',
		signing_in: 'Γίνεται σύνδεση...',
		tfa_label: 'Παρακαλώ εισάγετε τον κωδικό TOTP από την εφαρμογή αυθεντικοποίησης',
	}
};

export const translations_game_render: TranslationSet = {
	EN: {
		pong_game_header: 'Pong Game',
		play_alone: 'Play Alone',
		play_online: 'Play Online (1v1)',
		play_tournament: 'Play Tournament',
		info: 'Choose a game mode to begin'
	},
	DE: {
		pong_game_header: 'Pong-Spiel',
		play_alone: 'Alleine spielen',
		play_online: 'Online spielen (1v1)',
		play_tournament: 'Turnier spielen',
		info: 'Wähle einen Spielmodus, um zu beginnen'
	},
	GR: {
		pong_game_header: 'Παιχνίδι Pong',
		play_alone: 'Παίξε Μόνος',
		play_online: 'Παίξε Online (1v1)',
		play_tournament: 'Παίξε Τουρνουά',
		info: 'Επίλεξε λειτουργία παιχνιδιού για να ξεκινήσεις'
	}
};

export const translations_friends_render: TranslationSet = {
	EN: {
		friends_list_header: 'Friends List',
		request_list_header: 'Requests List'
	},
	DE: {
		friends_list_header: 'Freundesliste',
		request_list_header: 'Anfragenliste'
	},
	GR: {
		friends_list_header: 'Λίστα Φίλων',
		request_list_header: 'Λίστα Αιτημάτων'
	}
};

export const translations_tournament_render: TranslationSet = {
	EN: {
		tournament_lobby_header: '🏆 Tournament Lobby',
		glory_header: 'Join a tournament and compete for glory!',
		create_four_header: 'Create 4-Player Tournament',
		create_eight_header: 'Create 8-Player Tournament',
		empty_p_msg: 'No active tournaments yet.'
	},
	DE: {
		tournament_lobby_header: '🏆 Turnierlobby',
		glory_header: 'Tritt einem Turnier bei und kämpfe um Ruhm!',
		create_four_header: '4-Spieler-Turnier erstellen',
		create_eight_header: '8-Spieler-Turnier erstellen',
		empty_p_msg: 'Noch keine aktiven Turniere.'
	},
	GR: {
		tournament_lobby_header: '🏆 Λόμπι Τουρνουά',
		glory_header: 'Μπες σε ένα τουρνουά και αγωνίσου για τη δόξα!',
		create_four_header: 'Δημ. Τουρνουά 4 Παικτών',
		create_eight_header: 'Δημ. Τουρνουά 8 Παικτών',
		empty_p_msg: 'Δεν υπάρχουν ενεργά τουρνουά ακόμα.'
	}
};

export const translations_leaderboards: TranslationSet = {
	EN: {
		leaderboard_ld_header: 'Leaderboard',
		top_player_ld_header: 'Top players.',
		username_ld_header: 'Username',
		wins_ld_header: 'Wins',
		losses_ld_header: 'Losses',
		trophies_ld_header: 'Trophies',
		matches_played_ld_header: 'Matches Played',
		wins_in_tour_ld_header: 'Wins in Tournament',
		failed_ld_header: 'Failed to load leaderboard',
	},
	DE: {
		leaderboard_ld_header: 'Bestenliste',
		top_player_ld_header: 'Top-Spieler.',
		username_ld_header: 'Benutzername',
		wins_ld_header: 'Siege',
		losses_ld_header: 'Niederlagen',
		trophies_ld_header: 'Trophäen',
		matches_played_ld_header: 'Gespielte Spiele',
		wins_in_tour_ld_header: 'Siege im Turnier',
		failed_ld_header: 'Fehler beim Laden der Bestenliste',

	},
	GR: {
		leaderboard_ld_header: 'Πίνακας Κατάταξης',
		top_player_ld_header: 'Κορυφαίοι παίκτες.',
		username_ld_header: 'Όνομα Χρήστη',
		wins_ld_header: 'Νίκες',
		losses_ld_header: 'Ήττες',
		trophies_ld_header: 'Τρόπαια',
		matches_played_ld_header: 'Αγώνες που παίχτηκαν',
		wins_in_tour_ld_header: 'Νίκες στο Τουρνουά',
		failed_ld_header: 'Αποτυχία φόρτωσης πίνακα κατάταξης',

	}
};

export const translations_errors: TranslationSet = {
	EN: {
		error_invalid_password: 'The Password must be 8-64 characters, contain at least one uppercase, one lowercase, one number and one special charracter',
		error_invalid_email: 'Invalid Email',
		error_invalid_user: 'User doesnt exist',
		error_no_token: 'No 2fa token submitted',
		error_logged_in: 'Already logged in',
		error_invalid_token: 'Invalid 2fa code supplied',
		error_username_taken: 'This username has already been taken',
		error_username_min_len: 'Username has to be at least 3 characters long',
		error_internal: 'Internal server error',
		error_2fa_enable: 'Enabling 2FA went wrong',
		error_2fa_verify: 'Wrong 2fa Code',
		error_default: "Error",
	},
	DE: {
		error_invalid_password: 'Password muss 8-64 Zeichen und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und einen Spezialzeichen enthalten',
		error_invalid_email: 'Email nicht korrekt',
		error_invalid_user: 'Benutzer existiert nicht',
		error_no_token: 'Kein 2fa code gesendet',
		error_logged_in: 'Bereits eingeloggt',
		error_invalid_token: 'Ungültiger 2fa code',
		error_username_taken: 'Dieser Username wird bereits benutzt',
		error_username_min_len: 'Username muss mind. 3 Buchstaben enthalten',
		error_internal: 'Interner Server Fehler',
		error_2fa_enable: 'Fehler beim 2Fa erstellen',
		error_2fa_verify: 'Falscher 2FA Code',
		error_default: "Fehler",
	},
	GR: {
		error_invalid_password: 'Ο κωδικός πρέπει να έχει 8–64 χαρακτήρες, με τουλάχιστον ένα κεφαλαίο, ένα πεζό, έναν αριθμό και έναν ειδικό χαρακτήρα.',
		error_invalid_email: 'μη έγκυρο emailQ',
		error_invalid_user: 'Ο χρήστης δεν υπάρχει',
		error_no_token: 'Δεν υποβλήθηκε κωδικός 2FA',
		error_logged_in: 'Έχετε ήδη συνδεθεί',
		error_invalid_token: 'Ο κωδικός 2FA που δόθηκε δεν είναι έγκυρος',
		error_username_taken: 'Αυτό το όνομα χρήστη χρησιμοποιείται ήδη.',
		error_username_min_len: 'Το όνομα χρήστη πρέπει να έχει τουλάχιστον 3 χαρακτήρες.',
		error_internal: 'Εσωτερικό σφάλμα διακομιστή',
		error_2fa_enable: 'Η ενεργοποίηση του 2FA απέτυχε',
		error_2fa_verify: 'Λάθος κωδικός 2FA',
		error_default: "Σφάλμα",
	},
};

