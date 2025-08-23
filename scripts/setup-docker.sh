#! /bin/bash

cd /app

npm install

npm install -g typescript
npm install -g concurrently
npm install -g tsx
npm install -g vite

if [ "$APP_MODE" = "development" ]; then

	echo "Starting in DEVELOPMENT mode!"
	vite --config /app/src/vite.config.mts & #start vite in background
	VITE_PID=$!
	tsx watch /app/src/backend/server.ts & # start backend in background
	TSX_PID=$!
	trap "kill $TSX_PID; sleep 1; kill $VITE_PID" SIGTERM SIGINT

elif [ "$APP_MODE" = "production" ]; then
	echo "Starting in PRODUCTION mode!"
	# npm run prod;
	tail -f /dev/null
else
	echo "Unknown APP_MODE: $APP_MODE"
	exit 1
fi
# wait