#!/bin/bash


docker build -t pong-backend-tester .

docker run -p 7060:7060 pong-backend-tester