# bcu (blockchain university)
To run a local Hyperledger Fabric composer instance in Linux:

https://hyperledger.github.io/composer/tutorials/developer-tutorial.html

To start this blockchain network on Fabric and load participants:

```
cd {to your-clone-directory}
./start.sh
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

**Assets**
`Curriculum`
`CourseModule`
`ModuleUnit`
`Assessment`
`Submission`
`Certificate`

**Transactions**
`CreateModule`
`AddSubmission`
`SubmitResult`
`ProposeCurriculum`
`ApproveCurriculum`

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