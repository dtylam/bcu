#!/bin/bash
KEY='"X-Access-Token:RzpgRMTAoNR1x7phFIr9j5Er2tF1MVDMHMQ7lk8EisxJzhOhK9EKL7uwVyQLUQ1e"'
MOOCONDIR=~/GitHub/moocon-beta

curl -X POST --header ${KEY} \
--data {"card": "@~/GitHub/moocon-beta/T01.card"} \
'http://localhost:3000/api/wallet/import'

curl -H ${KEY} -d '@'${MOOCONDIR}'/T01.card' -X POST http://localhost:3000/api/wallet/import

curl -H 'X-Access-Token:${KEY}' -d 
'{
  "$class": "org.moocon.core.CreateModule",
  "mod": {
    "$class": "org.moocon.core.CourseModule",
    "modId": "CM001",
    "teachers": [
      "resource:org.moocon.core.Teacher#T01"
    ],
    "modTitle": "Introduction to JavaScript",
    "cost": 10,
    "prerequisiteIds": [],
    "learningObjectives": [
    	"Using and selecting data structures such as arrays.",
    	"Using elementary programming constructs: conditions, loops."
    	],
    "units": [
    	{
    		"$class": "org.moocon.core.ModuleUnit",
    		"unitId": "CM001A",
    		"unitTitle": "Data Structures",
    		"materialMd": "https://www.youtube.com/watch?v=Ukg_U3CnJWI",
    		"assessment": {
    			"$class": "org.moocon.core.SelfAssessment",
    			"assessId": "CM001_TEST001",
    			"unit": "resource:org.moocon.core.ModuleUnit#CM001A",
    			"terminal": false,
    			"weighting": 0,
    			"knowledgeRequired": [
			    	"Primitive Data Types: What? When? How?",
			    	"Arrays: What? When? How?"
			    	],
    			"detailsMd": "Details"
    		}
    	},
    	{
    		"$class": "org.moocon.core.ModuleUnit",
    		"unitId": "CM001B",
    		"unitTitle": "Conditionals and Loops",
    		"materialMd": "https://www.youtube.com/watch?v=Ukg_U3CnJWI",
    		"assessment": {
    			"$class": "org.moocon.core.AutoAssessment",
    			"assessId": "CM001_TEST002",
    			"unit": "resource:org.moocon.core.ModuleUnit#CM001B",
    			"terminal": false,
    			"weighting": 40,
    			"knowledgeRequired": [
			    	"Conditionals: What? When? How?",
			    	"Loops: What? When? How?"
			    	],
			    "detailsMd": "Details",
    			"testType": "Equivalence",
    			"testFile": "data:text/plain;base64,SGVsbG8gV29ybGQhCg=="
    		}
    	},
    	{
    		"$class": "org.moocon.core.ModuleUnit",
    		"unitId": "CM001C",
    		"unitTitle": "Viva",
    		"materialMd": "",
    		"assessment": {
    			"$class": "org.moocon.core.AssessorAssessment",
    			"assessId": "CM001_TEST003",
    			"unit": "resource:org.moocon.core.ModuleUnit#CM001C",
    			"terminal": true,
    			"weighting": 60,
    			"knowledgeRequired": [
			    	"Understanding of previously authored code"
			    	],
			    "detailsMd": "Details"
    		}
    	}
    ]
  }
}' -X POST http://localhost:3000/api/wallet/T01%40moocon-beta/setDefault