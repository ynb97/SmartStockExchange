#!/bin/bash
# $1: NetworkName
# $2: Card Name
# $3: Version Number

composer network install --card PeerAdmin@hlfv1 --archiveFile $1@$3.bna

composer network start --networkName $1 --networkVersion $3 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

composer card import --file networkadmin.card

composer network ping -c $2@$1

composer-rest-server -c $2@$1 -p 3001