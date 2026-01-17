#! /bin/bash
set -e
mkdir -p dist
mkdir -p vite
echo "====================>>> Starting Docker in NODE_ENV:$NODE_ENV <<======================"

npm i

if [ "$NODE_ENV" = "development" ]; then
	npm run dev;
elif [ "$NODE_ENV" = "production" ]; then
	# npm run prod;
	 npm run prod
	exec node dist/backend/server.js

else
	echo "Unknown NODE_ENV: $NODE_ENV"
	exit 1
fi

