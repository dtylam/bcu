# bcu (blockchain university)
To run a local Hyperledger Fabric composer instance in Linux:

https://hyperledger.github.io/composer/tutorials/developer-tutorial.html

To start this blockchain network on Fabric and create the blockchain peers:

```
cd <your-clone-directory>
./start.sh
```

Then, import the participant login cards, and the example course data:
```
cd <your-clone-directory>/newman
newman run import_cards.json -e moocon_envir_vars.json
newman run import_courses.json -e moocon_envir_vars.json
```

To stop this blockchain network and clean-up (essential or your next runs would not work):

```
cd {to your-clone-directory}
./destroy.sh
```

### This peer network defines:

**Participants**
`Learner`
`Teacher`
`Reader`

![class diagram of participants](out/plantuml/participants/participants.png)

**Assets**
`Curriculum`
`CourseModule`
`ModuleUnit`
`Assessment`
`Submission`
`Certificate`

See bottom for class diagram of assets.

**Transactions**
`CreateModule`
`AddSubmission`
`SubmitResult`
`ProposeCurriculum`
`ApproveCurriculum`
`SignCertificate`

**Events**
`SubmissionUploaded`
`ResultAvailable`
`CourseModuleCompleted`
`NewCertificate`
`CurriculumProposed`
`CurriculumApproved`
`BalanceChanges`

### Other helpful commands:

```
# starting the rest server as admin
composer-rest-server -c admin@moocon-beta -n always -w true

# regen the .bna
composer archive create -t dir -n .

# update the .bna used when the blockchain is already running
composer network update -c admin@moocon-beta -a moocon-beta@0.1.3.bna

# debug events emitted on websockets
wscat -c localhost:3000
```

![class diagram of assets](out/plantuml/assets/assets.png)
