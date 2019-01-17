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
    "google": {
        "provider": "google",
        "module": "passport-google-oauth2",
        "clientID": "1088454258427-cvetgr7voh31f323krt8fha7rpbs1vd3.apps.googleusercontent.com",
        "clientSecret": "MywMZWsr6dHmTt7ZhbrCHGYt",
        "authPath": "/auth/google",
        "callbackURL": "/auth/google/callback",
        "scope": "https://www.googleapis.com/auth/plus.login",
        "successRedirect": "http://localhost:8081/",
        "failureRedirect": "http://localhost:8081/login"
    }
}'

#5. Execute the REST server
composer-rest-server