#!/bin/bash
# A script to start moocon and load data into it

PURPLE='\033[0;35m'
NC='\033[0m' # No Color
FABRICDIR=~/fabric-tools # replace with your Fabric installation's tools dir 
MOOCONDIR=~/GitHub/moocon-beta # replace with your blockchain definitions working dir 
cd $MOOCONDIR

echo -e "${PURPLE}creating learner user L01${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Learner",
  "uId": "L01",
  "firstName": "Jo",
  "lastName": "Smith",
  "nid": "SMITH753116SM9IJ",
  "mods": [],
  "subs": [],
  "certs": [],
  "balance": 360,
  "acLevels": ["4", "7"],
  "privilledgedReaders": ["R01"]
}'

# issuing card to above learner user
composer identity issue -c admin@moocon-beta -f L01.card -u L01 -a "resource:org.moocon.core.Learner#L01"
# importing card to network
composer card import -f L01.card

echo -e "${PURPLE}creating learner user L02${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Learner",
  "uId": "L02",
  "firstName": "Alex",
  "lastName": "Brown",
  "nid": "BROWN753116SM9IJ",
  "mods": [],
  "subs": [],
  "certs": [],
  "balance": 480,
  "acLevels": ["4", "7"],
  "privilledgedReaders": []
}'

# issuing card to above Learner user
composer identity issue -c admin@moocon-beta -f L02.card -u L02 -a "resource:org.moocon.core.Learner#L02"
# importing card to network
composer card import -f L02.card

echo -e "${PURPLE}creating learner user L03${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Learner",
  "uId": "L03",
  "firstName": "Ashley",
  "lastName": "Wease",
  "nid": "WEASE753116SM9IJ",
  "mods": [],
  "subs": [],
  "certs": [],
  "balance": 360,
  "acLevels": ["4", "7"],
  "privilledgedReaders": []
}'

# issuing card to above Learner user
composer identity issue -c admin@moocon-beta -f L03.card -u L03 -a "resource:org.moocon.core.Learner#L03"
# importing card to network
composer card import -f L03.card

echo -e "${PURPLE}creating teacher user T01${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Teacher",
  "uId": "T01",
  "firstName": "Gee",
  "lastName": "Money",
  "nid": "MONEY753116SM9IJ",
  "mods": [],
  "organisation": "Brunel University"
}'

# issuing card to above teacher user
composer identity issue -c admin@moocon-beta -f T01.card -u T01 -a "resource:org.moocon.core.Teacher#T01"
# importing card to network
composer card import -f T01.card

echo -e "${PURPLE}creating teacher user T02${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Teacher",
  "uId": "T02",
  "firstName": "See",
  "lastName": "Swift",
  "nid": "SWIFT753116SM9IJ",
  "mods": [],  
  "organisation": "Open University"
}'

# issuing card to above Teacher user
composer identity issue -c admin@moocon-beta -f T02.card -u T02 -a "resource:org.moocon.core.Teacher#T02"
# importing card to network
composer card import -f T02.card

echo -e "${PURPLE}creating teacher user T03${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Teacher",
  "uId": "T03",
  "firstName": "Em",
  "lastName": "Leung",
  "nid": "LEUNG753116SM9IJ",
  "mods": [],  
  "organisation": "The University of Hong Kong"
}'

# issuing card to above Teacher user
composer identity issue -c admin@moocon-beta -f T03.card -u T03 -a "resource:org.moocon.core.Teacher#T03"
# importing card to network
composer card import -f T03.card

echo -e "${PURPLE}creating teacher user T04${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Teacher",
  "uId": "T04",
  "firstName": "Carol",
  "lastName": "Watson",
  "nid": "WATSO753116SM9IJ",
  "mods": [],  
  "organisation": "Curtin University"
}'

# issuing card to above Teacher user
composer identity issue -c admin@moocon-beta -f T04.card -u T04 -a "resource:org.moocon.core.Teacher#T04"
# importing card to network
composer card import -f T04.card

echo -e "${PURPLE}creating reader user R01${NC}"
composer participant add -c admin@moocon-beta -d '
{
  "$class": "org.moocon.core.Reader",
  "uId": "R01",
  "firstName": "Mo",
  "lastName": "Ramen",
  "nid": "RAMEN753116SM9IJ",
  "organisation": "PDC"
}'

# issuing card to above Teacher user
composer identity issue -c admin@moocon-beta -f R01.card -u R01 -a "resource:org.moocon.core.Reader#R01"
# importing card to network
composer card import -f R01.card