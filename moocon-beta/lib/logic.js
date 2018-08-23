'use strict';

/**
 * Tx0 Creating a Course
 * @param {org.moocon.core.CreateModule} ncmtx - transaction object ncmtx
 * @transaction
 */
function createModule(ncmtx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    var mod = ncmtx.mod;

    //create the assets on the blockchain
    return getAssetRegistry(NS + '.CourseModule')
        .then(function (modRegistry) {
            return modRegistry.add(mod);
        }).then(function () {
            return getAssetRegistry(NS + '.ModuleUnit')
        }).then(function (unitRegistry) {
            return unitRegistry.addAll(mod.units);
        })
        // .then(function () {
        //     return getAssetRegistry(NS + '.Assessment')
        // }).then(function (aRegistry) {
        //     mod.units.forEach(function (unit) {
        //         aRegistry.add(unit.assessment);
        //     })
        //     return;
        // })
        .then(function () {
            return getParticipantRegistry(NS + '.Teacher');
        }).then(function (teacherRegistry) {
            // throw new Error(teacherRegistry.get(mod.teachers[0].getIdentifier()));
            return teacherRegistry.get(mod.teachers[0].getIdentifier())
                .then(function (leadTeacher) {
                    leadTeacher.mods.push(factory.newRelationship(
                        NS, 'CourseModule', mod.modId));
                    return teacherRegistry.update(leadTeacher);
                });
        })
}

/* 
 * The Curriculum Personalisation Smart Contract:
 * 
 * Tx1 ProposeCurriculum: ordered by either a learner or a teacher to propose a new curriculum, 
 * or to proposed edits to an existing curriculum on the blockchain.
 * 
 * Tx2 ApproveCurriculum: ordered by a teacher to accept a proposed curriculum and 
 * it automatically enrols the learner to the courses and updates relevant records.
 */

/**
 * Tx1 ProposeCurriculum
 * @param {org.moocon.core.ProposeCurriculum} pctx - transaction object pctx
 * @transaction
 */
function proposeCurriculum(pctx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    var date = new Date();
    if (pctx.hasOwnProperty("existingCurrId")) {
        throw new Error('updating curriculum not implemented');
    }
    else {
        var curriculum = factory.newResource(NS, 'Curriculum',
            pctx.learner.uId + "_" + date.getFullYear() + date.getMonth());
        curriculum.teacher = pctx.teacher;
        curriculum.learner = pctx.learner;
        curriculum.modIds = pctx.modIds;
        return getAssetRegistry(NS + '.Curriculum')
            .then(function (curriculumRegistry) {
                return curriculumRegistry.add(curriculum).then(function () {
                    // Emit an event for the modified learner.
                    var event = getFactory().newEvent(NS, 'CurriculumProposed');
                    event.curriculum = curriculum;
                    emit(event);
                });
            })
    }
}

/**
 * Tx2 ApproveCurriculum
 * @param {org.moocon.core.ApproveCurriculum} actx - transaction object actx
 * @transaction
 */
function approveCurriculum(actx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    actx.curriculum.approved = true;
    var learner = actx.curriculum.learner;

    return getAssetRegistry(NS + '.Curriculum')
        .then(function (curriculumRegistry) {
            return curriculumRegistry.update(actx.curriculum).then(function () {
                // Emit an event for the modified learner.
                var event = getFactory().newEvent(NS, 'CurriculumApproved');
                event.curriculum = actx.curriculum;
                emit(event);
            }).then(function () {
                var currCost = 0;
                var oldBalance = learner.balance;
                var currMods = [];
                return getAssetRegistry(NS + '.CourseModule').then(
                    function (modRegistry) {
                        var promises = []
                        for (var i = 0; i < actx.curriculum.modIds.length; i++) {
                            var modId = actx.curriculum.modIds[i];
                            var mod = modRegistry.get(modId);
                            promises.push(mod);
                        }
                        Promise.all(promises).then(function (mods) {
                            currMods = mods;
                            for (var i = 0; i < currMods.length; i++) {
                                // check if user has already purchased the module
                                if (learner.mods.includes(currMods[i])) {
                                    throw new Error('Student has already started one of the modules.');
                                }
                                currCost = currCost + currMods[i].cost;
                            }
                            //check if can afford
                            if (oldBalance < currCost) {
                                throw new Error('Your credit balance is not enough for the module!');
                            }
                            // Update the balance of the learner.
                            learner.balance = oldBalance - currCost;
                            //add it to learner's ongoing modules list
                            for (var i = 0; i < currMods.length; i++) {
                                var mod = currMods[i];
                                learner.mods.push(mod);
                            }
                            // throw new Error("mods length is " + learner.mods.length)
                            // Get the participant registry for the learner.
                            return getParticipantRegistry(NS + '.Learner')
                                .then(function (learnerRegistry) {
                                    // Update the participant in the participant registry.
                                    return learnerRegistry.update(learner);
                                })
                                .then(function () {
                                    // Emit an event for the modified learner.
                                    var event = getFactory().newEvent(NS, 'BalanceChanges');
                                    event.user = learner;
                                    event.oldBalance = oldBalance;
                                    event.newBalance = learner.balance;
                                    event.details = actx.curriculum.currId;
                                    emit(event);
                                });
                        })

                        // throw new Error("currMods length is " + currMods.length)
                    })
            })
        });
}


/* 
 * The Assessment Smart Contract:
 * 
 * Tx3 AddSubmission: ordered by a learner to store a submission (assessment attempt) on the blockchain, 
 * this could return the result of the assessment immediately if marked by an automated marking service.
 * 
 * Tx4 SubmitResult: ordered by the teacher of the course to update the assessment result 
 * of a submission on the blockchain for manually marked assessments
 */

/**
 * Tx3 AddSubmission
 * @param {org.moocon.core.AddSubmission} nsubtx - transaction object nsubtx
 * @transaction
 */
function addSubmission(nsubtx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    var date = new Date();

    //create submission id
    var subId = nsubtx.unit.unitId + "_" + nsubtx.learner.uId + "_" +
        Math.random().toString(36).substring(3)
    //create new Submission asset
    var submission = factory.newResource(NS, 'Submission', subId);
    //mapping fields
    submission.learner = nsubtx.learner;
    submission.teacherAssigned = factory.newRelationship(
        NS, 'Teacher', nsubtx.unit.mod.teachers[0].getIdentifier());
    submission.unit = nsubtx.unit;
    submission.content = nsubtx.content;
    submission.comments = nsubtx.comments;
    submission.timeAdded = date;

    submission.learner.subs.push(factory.newRelationship(
        NS, 'Submission', subId));

    var assessment = nsubtx.unit.assessment;
    // do extra for auto assessments
    if (assessment.instanceOf(NS + '.AutoAssessment')) {
        //create new AutoAssessRequest asset
        var request = factory.newResource(
            NS, 'AutoAssessRequest', submission.subId);
        request.submission = factory.newRelationship(
            NS, 'Submission', submission.subId);
        request.content = submission.content;
        request.testFile = submission.unit.assessment.testFile;

        //post(url,data)
        var url = "https://moocon-js-marking.herokuapp.com/equivalence/";
        return post(url, request).then(function (resp) {
            console.log('@debug assess ext resp ', JSON.stringify(resp));
            request.response = resp.body;
            getAssetRegistry(NS + '.AutoAssessRequest')
                .then(function (reqRegistry) {
                    return reqRegistry.add(request);
                });
            //update result of submission record    
            var result = factory.newConcept(NS, 'PassFailResult');
            result.passed = request.response;
            result.feedbackMd = "Automatic Testing Service has no feedback messages for this submission."
            result.gradeDescriptors = assessment.gradeDescriptors;
            submission.result = result;
            submission.timeAssessed = date;

            return getAssetRegistry(NS + '.Submission')
                .then(function (submissionRegistry) {
                    return submissionRegistry.add(submission);
                })
                // update learner's list of submissions
                .then(function () {
                    return getParticipantRegistry(NS + '.Learner');
                })
                .then(function (learnerRegistry) {
                    learnerRegistry.update(submission.learner);
                }).then(function () {
                    // Emit an ResultAvailable event.
                    var event = getFactory().newEvent(NS, 'ResultAvailable');
                    event.submission = submission;
                    event.unitId = submission.unit.unitId;
                    event.details = result.passed.toString();
                    emit(event);
                });
        });
    }
    else if (assessment.instanceOf(NS + '.PeerAssessment')) {
        throw new Error('Peer Assessment not implemented');
    }
    // do nothing AssessorAssessment / SelfAssessment
    else {
        //add new Submission asset
        return getAssetRegistry(NS + '.Submission')
            .then(function (submissionRegistry) {
                return submissionRegistry.add(submission);
            })
            // update learner's list of submissions
            .then(function () {
                return getParticipantRegistry(NS + '.Learner');
            })
            .then(function (learnerRegistry) {
                learnerRegistry.update(submission.learner);
            })
            .then(function () {
                // Emit an event for a new submission.
                var event = getFactory().newEvent(NS, 'SubmissionUploaded');
                event.submission = submission;
                event.unitId = submission.unit.unitId;
                if (assessment.instanceOf(NS + '.AssessorAssessment'))
                    event.teacherId = submission.unit.mod.teachers[0].uId;
                emit(event);
            });
    }
}

/**
 * Tx4 SubmitResult
 * @param {org.moocon.core.SubmitResult} srtx - transaction object srtx
 * @transaction
 */
function submitResult(srtx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    var date = new Date();

    var submission = srtx.submission;
    var aa = srtx.submission.unit.assessment;

    if (!aa.instanceOf(NS + '.AssessorAssessment'))
        throw new Error("The assessment mode is not assessor assessment!");
    if (srtx.assessor != submission.teacherAssigned)
        throw new Error("The assessor " + srtx.assessor +
            " is not the teacher " + submission.teacherAssigned +
            " assigned to assess this submission!");

    var gd = aa.gradeDescriptors;
    var criteria = aa.criteria;
    var marks = srtx.marks;

    if (marks.length != criteria.length)
        throw new Error("number of criteria of submission disagree with committed criteria!")

    var result = factory.newConcept(NS, aa.resultType);
    result.gradeDescriptors = gd;
    result.feedbackMd = srtx.feedbackMd;

    switch (aa.resultType) {
        case "GradeResult":
        case "ScoreResult":
            var weightSum = criteria
                .map(function (c) { return c.weighting })
                .reduce(function (w1, w2) { return w1 + w2 }, 0);
            var weightedMarkSum = 0;
            for (var i = 0; i < marks.length; i++) {
                weightedMarkSum = weightedMarkSum +
                    ((gd.length - marks[i]) * criteria[i].weighting / weightSum);
            }
            var scale = gd.length - Math.round(weightedMarkSum);
            // throw new Error(scale)
            result.grade = gd[scale].grade;
            if (scale <= aa.passingStandard) {
                result.passed = true;
            }
            else { result.passed = false; }
            break;
        case "PassFailResult":
            if (marks.includes(1)) result.passed = false;
            else result.passed = true;
            break;
        default:
            throw new Error('not implemented');
            break;
    }

    //update result of submission record    
    submission.result = result;
    submission.timeAssessed = date;

    return getAssetRegistry(NS + '.Submission')
        .then(function (submissionRegistry) {
            return submissionRegistry.update(submission);
        }).then(function () {
            // Emit an ResultAvailable event.
            var event = getFactory().newEvent(NS, 'ResultAvailable');
            event.submission = submission;
            event.unitId = submission.unit.unitId;
            event.details = submission.result.passed.toString();
            emit(event);
        }).then(function () {
            if (submission.result.passed && submission.unit.assessment.terminal) {
                // Emit an CourseModuleCompleted event.
                var event = getFactory().newEvent(NS, 'CourseModuleCompleted');
                event.teacherAssigned = submission.teacherAssigned;
                event.submission = submission;
                event.modId = submission.unit.mod.modId;
                emit(event);
            }
        });
}


/**
 * Tx5 Signing a completed Certificate
 * @param {org.moocon.core.SignCertificate} sctx - transaction object sctx
 * @transaction
 */
function signCertificate(sctx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();
    if (sctx.hasOwnProperty('curriculum')) {
        throw new Error("curriculum certificate not implemented")
    }
    else {
        var lastSubmission = sctx.subs[sctx.subs.length - 1]
        // asset only one mod is involved!
        var thisMod = lastSubmission.unit.mod;
        var cert = factory.newResource(NS, 'Certificate',
            lastSubmission.learner.uId + "_" + thisMod.modId +
            + date.getFullYear() + date.getMonth());
        cert.learner = lastSubmission.learner;
        cert.teacher = sctx.orderer;
        cert.mods = [factory.newRelationship(
            NS, 'CourseModule', thisMod.modId)]
        // asset that no further pass checking is required
        cert.subs = sctx.subs;
        cert.fineprintMd = "Blockchain University is not a real university. These course are not real taught courses. All names and characters are fictional. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque diam turpis, consectetur.";

        // var passedSubs = sctx.subs.filter(sub => sub.result.passed);
        // var highestSubs = {};
        // thisMod.units.forEach(function (unit) {
        //     passedSubs.forEach(

        //     )
        // })
        // TODO: cert.overallResult

        return getAssetRegistry(NS + '.Certificate')
            .then(function (certificateRegistry) {
                certificateRegistry.add(cert);
            })// update learner's list of submissions
            .then(function () {
                return getParticipantRegistry(NS + '.Learner');
            })
            .then(function (learnerRegistry) {
                cert.learner.certs.push(cert)
                return learnerRegistry.update(cert.learner);
            }).then(function () {
                // Emit an event for the new cert.
                var event = getFactory().newEvent(NS, 'NewCertificate');
                event.mod = thisMod;
                event.cert = cert;
                emit(event);
            })
    }

}
// legacy functions

/**
 * Begin module processor function.
 * @param {org.moocon.core.BeginModule} bmtx - new module beginning
 * @transaction
 */
function beginModule(bmtx) {
    var NS = 'org.moocon.core';
    var factory = getFactory();

    // get module id
    var modId = bmtx.mod.modId;
    // proposed new relationship
    var relationship = factory.newRelationship(
        NS, 'CourseModule', modId);

    // check if user has already purchased the module
    if (bmtx.learner.mods.includes(bmtx.mod)) {
        throw new Error('You have already started the module.');
    }

    // Save the cost of the module.
    var cost = bmtx.mod.cost;
    // Save the old balance of the learner.
    var balance = bmtx.learner.balance;
    //check if can afford
    if (balance < cost) {
        throw new Error('Your credit balance is not enough for the module!');
    }

    //add it to learner's ongoing modules list
    bmtx.learner.mods.push(bmtx.mod);
    // Update the balance of the learner.
    bmtx.learner.balance = balance - cost;

    // Get the participant registry for the learner.
    return getParticipantRegistry('org.moocon.core.Learner')
        .then(function (learnerRegistry) {
            // Update the participant in the participant registry.
            return learnerRegistry.update(bmtx.learner);
        })
        .then(function () {
            // Emit an event for the modified learner.
            var event = getFactory().newEvent(NS, 'BalanceChanges');
            event.user = bmtx.learner;
            event.oldBalance = balance;
            event.newBalance = bmtx.learner.balance;
            event.details = modId;
            emit(event);
        });
}
