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
|	| in database, passwords are hashed. |✅| ✅|	|
|	| Check validation and sanitization on any user inputs and forms. |✅|✅|**validation**<br>email: test4@@x.com invalid <br>password: 12345678 -> "statusCode": 400 <br>very long username (10 000 chars) ->  "limit": 30, "statusCode": 400 <br>**sanitization**<br> edit username in profile page to xss123<script>XSS_TEST_123</script>: xss123&lt;script&gt;XSS_TEST_123&lt;/script&gt; -> popup: Username must have atleast one lowercase letter and numbers, not sent to server -> XSS Cross-Site Scripting not possible, sanitazion not necessary -> secure
|	| security measures implemented and tested|✅|✅| profile pic upload .js, .php, .jpeg, .png, .pdf,.jpg, .gif -> as expected only .jpeg, .png, .jpg are accepted, rest is rejected (not possible to upload)