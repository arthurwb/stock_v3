#!/bin/bash
cd server && yarn dev &
cd client && yarn dev &
cd worker && go run src/main.go &
wait