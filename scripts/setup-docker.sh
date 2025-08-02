#! /bin/bash

cd /app
# tail -f /dev/null

npm install -g tsx vite tsc
# npm install
# npm i -g typescript tsx concurrently

if [ "$APP_MODE" = "development" ]; then
	echo "Starting in DEVELOPMENT mode!"
	vite --config vite.config.mts &
	tsx watch src/backend/server.ts
elif [ "$APP_MODE" = "production" ]; then
	echo "Starting in PRODUCTION mode!"
	npm run prod;
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi
