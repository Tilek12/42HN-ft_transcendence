# Preeval results

| Test Category     | Test Case                                                                                                                                      | Firefox   | Chrome   | Notes   |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------|:----------|:---------|:--------|
| **Pre tests** | credentials, API keys, environment variables are in a .env file. no credentials, API keys in git repository and outside of .env file |✅| ✅|     secret_scan_audit_report.pdf    |
|	| docker-compose.yml at repository-root |✅|✅|	|
|	| Run: docker-compose up --build |❌|❌|`llacsivy@2-I-4 42HN-ft_transcendence % docker-compose up --build`<br>**WARNING:** The APP_MODE variable is not set. Defaulting to a blank string.<br>**ERROR:** The Compose file is invalid because:<br>Service backend has neither an image nor a build context specified. At least one must be provided. |
| **Basic checks** | website available. |✅| ✅|	|
|	| user can register. |✅| ✅|	|
|	| Registered user can log in. |✅| ✅|	|
|	| Single Page Application. user can use the "Back" and "Forward" buttons. |✅| ✅|	|
| **website Security** | website is secure. |❌|❌| missing redirect HTTP → HTTPS
|	| TLS available. |✅| ✅|llacsivy@2-F-6 ~ % curl -vk https://10.12.6.6:8080/<br>* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256ECDHE-RSA-AES128-GCM-SHA256
|	| in database, passwords are hashed. |✅| ✅|
|	| Check validation and sanitization on any user inputs and forms. |✅|✅|**validation**<br>email: test4@@x.com invalid <br>password: 12345678 -> "statusCode": 400 <br>very long username (10 000 chars) ->  "limit": 30, "statusCode": 400 <br>**sanitization**<br> edit username in profile page to xss123<script>XSS_TEST_123</script>: xss123&lt;script&gt;XSS_TEST_123&lt;/script&gt; -> popup: Username must have atleast one lowercase letter and numbers, not sent to server -> XSS Cross-Site Scripting not possible, sanitazion not necessary -> secure
|	| security measures implemented and tested|✅|✅| profile pic upload .js, .php, .jpeg, .png, .pdf,.jpg, .gif -> as expected only .jpeg, .png, .jpg are accepted, rest is rejected (not possible to upload)
| **local game** | play on one computer on keyboard|✅|✅|| click play alone button -> game works
|	| Initiate a tournament, and the tournament should offer a matchmaking system to connect local players. | ❌|❌|I can initiate tournament, and join, but no tournament is started after 4 players joined
| **online gameplay**	| playable game like original Pong game |❌|❌| click play online button-> very often when the paddle hits the ball, the game reacts if I did not hit the ball and the ball starts from the middle of the game 
|	| Controls explained below game |✅|✅| appearing: "Online mode: Use W/S for left paddle, ↑/↓ for right paddle"
|	| when game over, there is a end-game screen |❌|❌| always showing "🏁 Game over! ❌ Unknown wins!" even though linda1 won
| **lags (=Verzögerungen) and disconnects**	|  pause the game|❌|❌|paused only stops game object updates (ball, paddles), not network or input handling. do not use sleep(), do not only freeze the program.
|	| Disconnected users can reconnect to a game.|❌|❌|
|	| after a lag, the player must instantly see the current match state — not old delayed state — and be fully synced with the server.|✅|✅| simulate a lag: right click Inspect -> Network -> No throttling -> Regular 3G (Firefox), Slow 4G (Chrome) -> Play the game for ~10 seconds -> switch back to No throttling. the paddles do not move anymore after lag
|	| no crash when user is experiencing lags or is disconnected|❌|❌|not tested yet
|**web modules**|**major module (1): fastify framework with Node.js for backend**|✅|✅| backend->server.ts initializes a Fastify instance:<br>`import Fastify from 'fastify';`<br>`const server = Fastify({`<br>`  logger: {`
|	| **minor module (0.5): Tailwind CSS framework and typescript for frontend** |✅|✅| src->index.html available and has tailwind class: <br>class="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white text-center text-xl min-h-screen flex flex-col";<br><br>Verify tech stack in apps->package.json:<br>`"dependencies": {`<br>`  "tailwindcss": "^4.1.17",`<br>`  "typescript": "^5.9.3",`<br>`  "postcss": "^8.5.6",`<br>`  "autoprefixer": "^10.4.21",` <br><br> apps->tsconfig.frontend.json, tailwind.config.ts available <br><br>src->frontend->styles.css available and content:<br>@tailwind base; <br>@tailwind components; <br>@tailwind utilities;<br><br>src->frontend->main.ts, styles.css<br><br>*.ts files in frontend
|	| **minor module (0.5): database SQLite** |✅|✅| apps->package.json:<br>"dependencies": {<br>"sqlite": "^5.1.1",<br>"sqlite3": "^5.1.7",<br><br>backend->database->client.ts:<br>import sqlite3 from 'sqlite3';<br>import { open, Database } from 'sqlite';<br>export let db: Database;<br>export async function connectToDB() {<br>db = await open({<br>filename: './database/pong.db',<br>driver: sqlite3.Database,<br>});<br><br>sqlite3 is the Native low-level driver, sqlite is a wrapper for sqlite3






**More Issues:**
- after changing profile pic, nav bar is not showing, I can not leave the profile page, I can not play the game -> refresh the page make the nav bar appearing again
- after registering a new user, nav bar is not showing, I can not leave the profile page, I can not play the game -> refresh the page make the nav bar appearing again