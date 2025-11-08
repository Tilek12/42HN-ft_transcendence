#! /bin/bash

cd /app

npm i
npm install vite -g
npm install concurrently -g
# npm install vite -g
# npm install vite -g



if [ "$APP_MODE" = "development" ]; then
	echo "=========================>>> Starting in DEVELOPMENT mode! <<========================="
	npm run dev;
	
elif [ "$APP_MODE" = "production" ]; then
	echo "=========================>>> Starting in PRODUCTION mode! <<========================="
	npm run prod;
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi

tail -f /dev/null #remove before eval
