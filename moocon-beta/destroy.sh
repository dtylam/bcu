#!/bin/bash

FABRICDIR=~/fabric-tools # replace with your Fabric installation's tools dir 
MOOCONDIR=~/GitHub/moocon-beta  # replace with your blockchain definitions working dir 

# delete cards that will be old
cd $MOOCONDIR
composer card delete -n admin@moocon-beta
composer card delete -n L01@moocon-beta
composer card delete -n L02@moocon-beta
composer card delete -n L03@moocon-beta
composer card delete -n L04@moocon-beta
composer card delete -n L05@moocon-beta

composer card delete -n T01@moocon-beta
composer card delete -n T02@moocon-beta
composer card delete -n T03@moocon-beta
composer card delete -n T04@moocon-beta
composer card delete -n T05@moocon-beta

composer card delete -n R01@moocon-beta
composer card delete -n R02@moocon-beta

# to stop local Hyperledger Fabric
cd $FABRICDIR
./stopFabric.sh
./teardownFabric.sh