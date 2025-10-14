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

- Allow users to set their preferred language as the default for subsequent visits

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
