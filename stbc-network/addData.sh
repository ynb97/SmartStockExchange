#!/bin/bash
# Participant Company
if [ $1 == "cp" ]
then
composer participant add -d '{"$class": "org.yky.stbc.Company","issuedShareCount": 0,"owner": "resource:org.yky.stbc.Trader#owner@abc.com","email": "company@abc.com","name": "ABC Corporation"}' -c admin@stbc-network

composer participant add -d '{"$class": "org.yky.stbc.Company","issuedShareCount": 0,"owner": "resource:org.yky.stbc.Trader#owner@xyz.com","email": "company@xyz.com","name": "XYZ"}' -c admin@stbc-network

# <!-- Participant Trader -->
elif [ $1 == "ct" ]
then

composer participant add -d '{"$class": "org.yky.stbc.Trader","balance": 10000,"email": "owner@abc.com","name": "Owner ABC"}' -c admin@stbc-network

composer participant add -d '{"$class": "org.yky.stbc.Trader","balance": 50000,"email": "owner@xyz.com","name": "Owner XYZ"}' -c admin@stbc-network

# <!-- Transaction ShareIssue -->
elif [ $1 == "si" ]
then
composer '{"$class": "org.yky.stbc.ShareIssue","detail": "First Share Issue of ABC","count": 3,"price": 10,"company": "resource:org.yky.stbc.Company#company@abc.com"},

{
  "$class": "org.yky.stbc.ShareIssue",
  "detail": "First Share Issue of XYZ",
  "count": 3,
  "price": 10,
  "company": "resource:org.yky.stbc.Company#company@xyz.com"
}'
fi
# <!-- Transaction PlaceOrder -->

# <!-- Transaction ModifyOrder -->