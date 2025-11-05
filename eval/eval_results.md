# Eval results

| Test Category     | Test Case                                                                                                                                      | Firefox   | Chrome   | Notes   |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------|:----------|:---------|:--------|
| **Preliminary tests** | Any credentials, API keys, environment variables must be set inside a .env file, no credentials, API keys in git repository and outside of .env file |✅| ✅|     secret_scan_audit_report.pdf    |
|	| Ensure the docker compose file is at the root of the repository.|✅|✅|	|
|	| Run the command docker-compose up --build.|❌|❌|`llacsivy@2-I-4 42HN-ft_transcendence % docker-compose up --build`<br>**WARNING:** The APP_MODE variable is not set. Defaulting to a blank string.<br>**ERROR:** The Compose file is invalid because:<br>Service backend has neither an image nor a build context specified. At least one must be provided. |
| **Basic checks** | The website is available. |✅| ✅|	|
|	| The user can subscribe on the website. |✅| ✅|	clarify if subscribe means register???|
|	| Registered users can log in. |✅| ✅|	|
|	| The user can use the "Back" and "Forward" buttons of the web browser. The website is a Single Page Application. |✅| ✅|	|
|	| You can browse the website using the latest version of Chrome. |✅| ✅|	|
| **The website, Security concerns** | Ensure that the website is secure. |❌|❌| missing redirect HTTP → HTTPS
|	| Be careful about TLS. If there is a backend or any other features, it must be available. |✅| ✅|llacsivy@2-F-6 ~ % curl -vk https://10.12.6.6:8080/<br>* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256ECDHE-RSA-AES128-GCM-SHA256
|	| Check if there is a database — passwords must be hashed. |✅| ✅|	|
|	| Check the server for server-side validation/sanitization on any user inputs and forms. |||**validation**<br>email: test4@@x.com invalid <br>password: 12345678 -> "statusCode": 400 <br>very long username (10 000 chars) ->  "limit": 30, "statusCode": 400 <br>**sanitization**<br>|