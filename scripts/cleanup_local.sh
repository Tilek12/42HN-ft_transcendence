#!/bin/bash

ENV_FILE="./.env"

if [ ! -f "$ENV_FILE" ]; then 
	echo "OOPS no .env file fount in project. aborting.."
	exit 1
fi

remove_line_from_env () {
	local file="$2"
	local content="$1"
	
	sed "/$content/d" $ENV_FILE > tmp && mv tmp $ENV_FILE
}

remove_line_from_env "LOCAL_IP" 
remove_line_from_env "VITE_BACKEND_URL"