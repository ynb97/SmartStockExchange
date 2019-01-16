#!/bin/bash

# Setup the Environment variables for the REST Server

#1. Set up the card to be used
export COMPOSER_CARD=admin@stbc-network

#2. Set up the namespace usage    always |  never
export COMPOSER_NAMESPACES=always

#3. Set up the REST server Authhentcation    true | false
export COMPOSER_AUTHENTICATION=true

#4. Set up the Passport strategy provider
export COMPOSER_PROVIDERS='{
    "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "ce9371eebecc0a0bdaaa",
    "clientSecret": "8f0f0429e437690b6c878d659c79f7899706f10c",
    "authPath": "/auth/github",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "http://localhost:8081/",
    "failureRedirect": "http://localhost:8081/login"
  }
}'

#5. Execute the REST server
composer-rest-server