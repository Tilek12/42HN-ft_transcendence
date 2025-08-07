#! /bin/bash

cd /app

if [ "$APP_MODE" = "development" ]; then
	echo "Starting in DEVELOPMENT mode!"
	npm run dev
	
elif [ "$APP_MODE" = "production" ]; then
	echo "Starting in PRODUCTION mode!"
	npm run prod;
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi
