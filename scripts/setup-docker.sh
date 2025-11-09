#! /bin/bash

cd /app

echo $APP_MODE "|" $NODE_ENV



if [ "$APP_MODE" = "development" ]; then
	# export $NODE_ENV=development
	npm i
	npm install vite -g
	npm install concurrently -g
	npm install tsx -g
	echo "=========================>>> Starting in DEVELOPMENT mode! <<========================="
	npm run dev;
	
elif [ "$APP_MODE" = "production" ]; then
	npm i 
	echo "=========================>>> Starting in PRODUCTION mode! <<========================="
	mkdir -p dist
	npm run prod;
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi

tail -f /dev/null #remove before eval
