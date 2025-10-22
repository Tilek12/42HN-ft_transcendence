# Things to fix for eval
------------------------
- tailwind in production mode
- why are profiles not in users table?
- route schemas need to be updated and implemented properly, presence is authenticated with jwtoken in querystring???
- register page should login on success
- check all languages.
- fix login/logout button
- use delete method to delete and put to change and general correct methods for things
- fix prfile delete button
- why is the profile rendering? for user list updates ok
- fix the layout issues, its putting the body until the end of the screen. add a footer, 

- logincheck is double in router and every route

- why is router rendering every 100ms? //fixed

- auth.ts line 5/6 ? what is this added for?

- Add auth roles to have control from commandline for pong - routes need to be thought of how to do it

- change verify logged in status route

- why 2 database plugins?

- is it injectionsafe?

- validate login is a real mess!! cleaned up..

- implement "remember_me" feature? or get rid of it.

- cleanup production mode: make setup-local script better, vite is not needed/turned off?

- Allow users to set their preferred language as the default for subsequent !! -> put in jwt payload

- production mode with fastify static

- all websockt routes are not validated with the prehandler hook..

- add explanation to register qrcode page

- fix languages -> make it available in register and login site -> independent from navbarq

- add settings to enable /disable 2fa


- set a notfound handler like in demo

- WHY does the presence websocket route have the token in the url???? WTF literally fix this

- Why are certs in the fucking commit history?

wokrflow 2fa auth:

- fastify.post('/check-given-old-password => rework

- fastify.post('/update-password'

- register logic rewortk, get logged in only when 2fa is verifed

- private jwt verify hook should check for tmp token or normal token.

endpoints:	
-			/api/2fa/enable		POST	//sends qrcode		needs tmp token / token
-			/api/2fa/disable	POST	//sends nothing		needs jwt username password 2fatoken 
-			/api/2fa/status		GET		//semnds bool		needs jwt
-			/api/2fa/verify		POST	//sends jwt			needs tmp token
-			/api/login			POST	//sends tmp token	needs username password 2fatoken
-			/api/register		POST	//sends tmp token	needs username email password

#### register with 2fa
first you register, client passes email username and password in the form and enable 2fa.
the request to /api/register creates the user if its available and the server sends a temp token back.
this token may have the info register in it or something similar. so it can be used only to generate the qrcode for 2fa.
the client fetches to /api/enable passes the tmp token.
the server validates the tmp token through id and user is not logged in, sends back qrcode. if token is expirted, send specific message.
client recieves qrcode and sends a fetch to /api/login including the current 2fa token.
the server recieves sername and password and also the 2fa toke, sets login status and returns the jwt.
the client recieves the jwt, stores it in session and then gets redirected to profile.

#### register without 2fa and enable it after
the fetch to /api/register contains username, email and password, and a false for 2fa.
the server recieves this, creates a new user, and returns a valid jwt.
the cient recieves the jwt and gets redirected to #/profile.
the client sends a request to /api/2fa/status including its jwt to decide which button to render.
the server recieves this request, verifies the jwt, queries the db and sends false back.
the client can now render the enable 2fa button. this fetches to /api/enable sending with it the jwt.
the server recieves the jwt and queries db for user. if user is logged in and 2fa is still disabled, it generates a new secret, stores it in the db and sends it in the qrcode.
the client recieves the qrcode, renders the qrcode, retrieves the code to make sure it has been put into authenticator. and sends it to /api/2fa/verify to double check.
the server recieves verify request checks the token and the jwt, and sends a new one back.. switch the tokens?
the client can continue.

the client sends the jwt, username, password, token to /api/2fa/disable.
the server checks if all is correct, deletes 2fa_secret and bool, and returns 200.





-	```
	There must be a matchmaking system: the tournament system should
	organize the matchmaking of the participants, and announce the next match
	```
-	```
	The tournament system must work with or without user
	registration
	With the module: aliases are linked to registered
	accounts, allowing persistent stats and friend lists.
	```
-	```
	You must implement validation mechanisms for forms and any user input,either on the base page if no backend is used, or on the server side if a backend is employed.
	```
	-> schemas for validation refer to route schemas and validation
-	`Please make sure you use a strong password hashing algorithm`
> - serverside pong:  
> 	Create an API that exposes the necessary resources and endpoints to interact with the Pong game, allowing partial usage of the game via the Command-Line Interface (CLI) and web interface.
> - Design and implement the API endpoints to support game initialization, player
controls, and game state updates.



# 2Fa topic
-----------
### requirements from subject:

```
Implement Two-Factor Authentication (2FA) as an additional layer of security
for user accounts, requiring users to provide a secondary verification method,
such as a one-time code, in addition to their password.
```
```
◦ Utilize JSON Web Tokens (JWT) as a secure method for authentication and
authorization, ensuring that user sessions and access to resources are managed
securely.
```
```
◦ Provide a user-friendly setup process for enabling 2FA, with options for SMS
codes, authenticator apps, or email-based verification.
```
```
◦ Ensure that JWT tokens are issued and validated securely to prevent unau-
thorized access to user accounts and sensitive data.
```
https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en

https://datatracker.ietf.org/doc/html/rfc6238

https://medium.com/@pdlsandesh144/a-step-by-step-guide-on-using-node-js-to-implement-two-factor-authentication-059c7bcb220c

### routes:
> - POST 


Im absoloutely stunned what amazing event you put together and made it happen. im really happy i attended it, i even took vacation for it and dont regret it at all. i love the effort you put into it and the overall vibe. i was happy that so many 42 students participated, as im at the end of my curriculum/ in internship and not at campus often anymore. so it was good to connect to the community again. 
There are two major things that i disliked and i think that should be improved for the next time: 
First: the end of the Hackathon. The Idea of splitting up the main project to incorporate a hardware workshop as a sidequest in general i think is a great idea, as it ofers an alternative for people not ready or willing to commit to a complete webapp or more interested in hardware building. But the fact that it was almost a complete second independent Event was a bit wierd. As it took also the whole hackaton time to do this project it, afterward it being a sidequest 