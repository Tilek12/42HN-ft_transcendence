#! /bin/bash

mkdir -p dist
mkdir -p vite
echo "====================>>> Starting Docker in NODE_ENV:$NODE_ENV <<======================"

npm i

if [ "$NODE_ENV" = "development" ]; then
	npm run dev;
elif [ "$NODE_ENV" = "production" ]; then
	npm run prod;
else
	echo "Unknown NODE_ENV: $NODE_ENV"
	exit 1
fi

tail -f /dev/null #remove before eval
