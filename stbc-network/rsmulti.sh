#!/bin/sh

# This script sets up the environment property for 
# Mongo DB loopback connector. This property is used
# by REST server for connecting with the MongoDB 
# instance in the cloud | local

#1. Set up the REST server to multi user mode    true | false
export COMPOSER_MULTIUSER=true

# PLEASE CHANGE THIS TO point to your DB instance
# ================================================
# HOST = DB Server host,   PORT = Server port#
# database = Name of the database
# Credentials =>    user/password 
# connector   =>    We are using mongodb, it can be 
#                   any nosql database


# Selecting the MongoDB instance
option1="${1}" 
case ${option1} in 
   -d) database="${2}" 
      echo "You have set database instance as $database."
      ;;  
   *)  
      echo "`basename ${0}`:usage: [-d local/cloud] | [-a github/google]" 
      exit 1 # Command to come out of the program with status 1
      ;; 
esac 

# Selecting the Passport strategy provider
option2="${3}" 
case ${option2} in 
   -a) authStrategy="${4}" 
      echo "Authentication strategy used is $authStrategy."
      ;; 
   *)  
      echo "`basename ${0}`:usage: [-d local/cloud] | [-a github/google]" 
      exit 1 # Command to come out of the program with status 1
      ;; 
esac

# Set up the MongoDB instance
case ${database} in 
   local) 

   export COMPOSER_DATASOURCES='{
            "db": {
                "name": "stbdb",
                "host": "localhost",
                "port": 27017,
                "database": "stbc_db",
                "connector": "mongodb"  
            }
        }'

      ;;
   cloud) 

   export COMPOSER_DATASOURCES='{
            "db": {
                "name": "stbdb",
                "host": "ds141294.mlab.com",
                "port": 41294,
                "database": "stbc_db",
                "user": "yky",
                "password": "yky123",
                "connector": "mongodb"  
            }
        }'

      ;; 
esac

# Execute the script for enabling authentication
#1. Set up the card to be used
export COMPOSER_CARD=admin@stbc-network

#2. Set up the namespace usage    always |  never
export COMPOSER_NAMESPACES=always

#3. Set up the REST server Authhentcation    true | false
export COMPOSER_AUTHENTICATION=true


# Set up Passport Strategy
case ${authStrategy} in 
   github) 

   export COMPOSER_PROVIDERS='{
                "github": {
                "provider": "github",
                "module": "passport-github",
                "clientID": "ce9371eebecc0a0bdaaa",
                "clientSecret": "8f0f0429e437690b6c878d659c79f7899706f10c",
                "authPath": "/auth/github",
                "callbackURL": "/auth/github/callback",
                "successRedirect": "http://localhost:8081/profile",
                "failureRedirect": "http://localhost:8081/login"
            }
         }'
      ;;
   google) 

   export COMPOSER_PROVIDERS='{
                "google": {
                    "provider": "google",
                    "module": "passport-google-oauth2",
                    "clientID": "1088454258427-cvetgr7voh31f323krt8fha7rpbs1vd3.apps.googleusercontent.com",
                    "clientSecret": "MywMZWsr6dHmTt7ZhbrCHGYt",
                    "authPath": "/auth/google",
                    "callbackURL": "/auth/google/callback",
                    "scope": "https://www.googleapis.com/auth/plus.login",
                    "successRedirect": "http://localhost:8081/profile",
                    "failureRedirect": "http://localhost:8081/login"
                }
            }'
      ;; 
esac

#5. Execute the REST server
composer-rest-server