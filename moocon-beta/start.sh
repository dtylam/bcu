#!/bin/bash
# A script to start moocon and load participant into it

PURPLE='\033[0;35m'
NC='\033[0m' # No Color
FABRICDIR=~/fabric-tools # REPLACE with your Fabric installation's tools dir 
MOOCONDIR=~/GitHub/bcu/moocon-beta # REPLACE with your blockchain definitions working dir 

echo -e "${PURPLE}starting local Hyperledger Fabric${NC}"
cd $FABRICDIR
#./downloadFabric.sh
./startFabric.sh
#./createPeerAdminCard.sh

echo -e "${PURPLE}re-generating and installing the .bna file${NC}"
cd $MOOCONDIR
composer archive create -t dir -n .
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName moocon-beta

echo -e "${PURPLE}starting network and pinging with admin identity${NC}"
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile moocon-beta@0.1.3.bna --file networkadmin.card

#import admin identity
composer card import --file networkadmin.card

composer network ping --card admin@moocon-beta

# load participants for network, comment out if you want an empty network instead
./load_participant.sh

echo -e "${PURPLE}starting the rest server as admin authed with GitHub${NC}"

export COMPOSER_PROVIDERS='{
  "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "7a7e96a04ef3f68ef144",
    "clientSecret": "39eb8a7aa598829b2cde39e5b2b4b142afe04ae8",
    "authPath": "/auth/github",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "/",
    "failureRedirect": "/"
  }
}'

composer-rest-server -c admin@moocon-beta -n always -w true -a true -m true