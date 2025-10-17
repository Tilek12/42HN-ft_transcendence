export type Language = 'EN' | 'DE' | 'GR';





export function transelate_per_id( tr_array: Record<Language, {[key: string]: string | undefined}>, tr_key_string : string, lang : Language, element_id: string)
{
	let headerEl = document.getElementById(element_id) as HTMLElement || HTMLInputElement;
	// console.log("The Element: ", headerEl);
	if (tr_key_string.includes("placeholder") && headerEl) 
			headerEl.placeholder = tr_array[lang][tr_key_string]
	if (headerEl) headerEl.innerHTML = tr_array[lang][tr_key_string];
}



export const translations_profile: Record<Language, {[key: string]: string | undefined}> = 
{
	EN: {
		your_profile : 'Your Profile',
		update : 'Update',
		delete : 'Delete',
		edit : 'Edit',
		cancel : 'Cancel',
		logged_in : 'Logged in',
		username : 'Username:',
		email : 'Email:',
		wins : 'wins:',
		losses : 'losses:',
		trophies : 'trophies:',
		joined : 'Joined:',
		current_password_placeholder : 'Current password',
		new_password_placeholder: 'New Password',
		confirm_new_password_placeholder: 'Confirm New Passsword',
		new_password_btn : 'New Password',
		match_history : 'Match History',
		load_more : 'Load More',
		logout : 'Logout'
	},
	DE: {
		your_profile: 'Dein Profil',
		update: 'Aktualisieren',
		delete: 'Löschen',
		edit: 'Bearbeiten',
		cancel: 'Abbrechen',
		logged_in: 'Eingeloggt',
		username: 'Benutzername:',
		email: 'E-Mail:',
		wins: 'Siege:',
		losses: 'Niederlagen:',
		trophies: 'Trophäen:',
		joined: 'Beigetreten:',
		current_password_placeholder: 'Aktuelles Passwort',
		new_password_placeholder: 'Neues Passwort',
		confirm_new_password_placeholder: 'Neues Passwort bestätigen',
		new_password_btn: 'Neues Passwort',
		match_history: 'Spielverlauf',
		load_more: 'Mehr laden',
		logout: 'Abmelden'
	  },
	  GR: {
		your_profile: 'Το προφίλ σας',
		update: 'Ενημέρωση',
		delete: 'Διαγραφή',
		edit: 'Επεξεργασία',
		cancel: 'Ακύρωση',
		logged_in: 'Συνδεδεμένος',
		username: 'Όνομα χρήστη:',
		email: 'Ημέιλ: ',
		wins: 'Νίκες: ',
		losses: 'Ήττες: ',
		trophies: 'Τρόπαια: ',
		joined: 'Εγγράφηκε: ',
		current_password_placeholder: 'Τρέχων κωδικός',
		new_password_placeholder: 'Νέος κωδικός',
		confirm_new_password_placeholder: 'Επιβεβαίωση νέου κωδικού',
		new_password_btn: 'Νέος Κωδικός',
		match_history: 'Ιστορικό αγώνων',
		load_more: 'Περισσότερα Προφίλ',
		logout: 'Αποσύνδεση'
	  }
}

export const translations_friends: Record<Language, { [key: string]: string }> = {
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

export const translations_register_page: Record<Language, { [key: string]: string }> = {
	EN: {
		register_header: 'Create Account',
		username_label: 'Username',
		email_label: 'Email',
		password_label: 'Password',
		username_placeholder: 'Enter your username',
		email_placeholder: 'Enter your email',
		password_placeholder: 'Enter your password',
		tfa_label: 'Enable 2 Factor Authentification',
		tfa_placeholder: '6 digit code',
		register_btn: 'Register',
		register_error: 'Registration failed. Please check your details.',
		already_have_account: 'Already have an account?',
		sign_in: 'Sign In'
	},
	DE: {
		register_header: 'Konto erstellen',
		username_label: 'Benutzername',
		email_label: 'E-Mail',
		password_label: 'Passwort',
		username_placeholder: 'Geben Sie Ihren Benutzernamen ein',
		email_placeholder: 'Geben Sie Ihre E-Mail ein',
		password_placeholder: 'Geben Sie Ihr Passwort ein',
		tfa_label: '2FA aktivieren',
		tfa_placeholder: '6 stelliger code',
		register_btn: 'Registrieren',
		register_error: 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.',
		already_have_account: 'Haben Sie bereits ein Konto?',
		sign_in: 'Anmelden'
	},
	GR: {
		register_header: 'Δημιουργία λογαριασμού',
		username_label: 'Όνομα χρήστη',
		email_label: 'Email',
		password_label: 'Κωδικός',
		username_placeholder: 'Εισάγετε το όνομα χρήστη σας',
		email_placeholder: 'Εισάγετε το email σας',
		password_placeholder: 'Εισάγετε τον κωδικό σας',
		tfa_label: '2FA ενεργοποιώ',
		tfa_placeholder: '6ψήφιος κωδικός',
		register_btn: 'Εγγραφή',
		register_error: 'Η εγγραφή απέτυχε. Ελέγξτε τα στοιχεία σας.',
		already_have_account: 'Έχετε ήδη λογαριασμό;',
		sign_in: 'Σύνδεση'
	}
};

export const translations_main_page: Record<Language, { [key: string]: string }> = {
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

export const translations_login_page: Record<Language, { [key: string]: string }> = {
	EN: {
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
		dont_have_account: "Don't have an account?",
		create_account: 'Create account',
		error_message: 'Invalid username or password'
	},
	DE: {
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
		dont_have_account: 'Sie haben kein Konto?',
		create_account: 'Konto erstellen',
		error_message: 'Ungültiger Benutzername oder Passwort'
	},
	GR: {
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
		dont_have_account: 'Δεν έχετε λογαριασμό;',
		create_account: 'Δημιουργία λογαριασμού',
		error_message: 'Λανθασμένο όνομα χρήστη ή κωδικός'
	}
};

export const translations_game_render: Record<Language, { [key: string]: string }> = {
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

export const translations_friends_render: Record<Language, { [key: string]: string }> = {
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

export const translations_tournament_render: Record<Language, { [key: string]: string }> = {
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

export const translations_leaderboards: Record<Language, { [key: string]: string }> = {
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

export const translations_errors: Record<Language, { [key: string]: string }> = {
	EN: {
		error_invalid_password: 'The Password must be 8-64 characters, contain at least one uppercase, one lowercase, one number and one special charracter',
		error_invalid_email: 'Invalid Email',
	},
	DE: {
		error_invalid_password: 'Password muss 8-64 Zeichen und mindestens einen Großbuchstaben, einen Kleinbuchstaben, ene Zahl und einen Spezialzeichen enthalten',
		error_invalid_email: 'Email nicht korrekt',
	},
	GR: {
		error_invalid_password: 'Ο κωδικός πρέπει να έχει 8–64 χαρακτήρες, με τουλάχιστον ένα κεφαλαίο, ένα πεζό, έναν αριθμό και έναν ειδικό χαρακτήρα.',
		error_invalid_email: 'μη έγκυρο emailQ',
	},
};

class LanguageStore {
	private _language: Language = 'EN';
	private listeners: ((lang : Language) => void)[] = [];
	private _clicked: number = 0;

	set language(lang: Language)
	{
		this._language = lang;
		this.listeners.forEach(cb => cb(lang));
	}

	get language()
	{
		return this._language;
	}
	set clicked(cl: number)
	{
		this._clicked = cl;
	}
	get clicked()
	{
		return this._clicked;
	}
	subscribe(cb: (lang: Language) => void)
	{
		this.listeners.push(cb);
	}
} 

export const languageStore = new LanguageStore();