# Eval results

| Test Category     | Test Case                                                                                                                                      | Firefox   | Chrome   | Notes   |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------|:----------|:---------|:--------|
| **Preliminary tests** | Any credentials, API keys, environment variables must be set inside a .env file, no credentials, API keys in git repository and outside of .env file |✅| ✅|     secret_scan_audit_report.pdf    |
|	| Ensure the docker compose file is at the root of the repository.|✅|✅|	|
|	| Run the command docker-compose up --build.|❌|❌|`llacsivy@2-I-4 42HN-ft_transcendence % docker-compose up --build`<br>**WARNING:** The APP_MODE variable is not set. Defaulting to a blank string.<br>**ERROR:** The Compose file is invalid because:<br>Service backend has neither an image nor a build context specified. At least one must be provided. |
| **Basic checks** | The website is available. |✅| ✅|	|
|	| The user can subscribe on the website. |✅| ✅|	|
|	| Registered users can log in. |✅| ✅|	|
|	| The user can use the "Back" and "Forward" buttons of the web browser. The website is a Single Page Application. |✅| ✅|	|
|	| You can browse the website using the latest version of Chrome. |✅| ✅|	|
| **The website, Security concerns** | Ensure that the website is secure. |