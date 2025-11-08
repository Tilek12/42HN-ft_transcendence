#! /bin/bash

cd /app

npm install

npm install -g typescript
npm install -g concurrently
npm install -g tsx
npm install -g vite


if [ "$APP_MODE" = "development" ]; then
	echo "=========================>>> Starting in DEVELOPMENT mode! <<========================="
	vite --config /app/src/vite.config.mts &
	tsx watch /app/src/backend/server.ts 
	
elif [ "$APP_MODE" = "production" ]; then
	echo "=========================>>> Starting in PRODUCTION mode! <<========================="
	npm run prod;
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi

tail -f /dev/null
