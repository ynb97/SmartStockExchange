#!/bin/bash


composer network install --card PeerAdmin@hlfv1 --archiveFile $1@$3.bna

composer network start --networkName $1 --networkVersion $3 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

composer card import --file networkadmin.card

composer network ping -c $2@$1