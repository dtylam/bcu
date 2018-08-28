<template>
    <div id="page">
      <!-- Offline Dialog -->
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
      <!-- Loading Data Spinner -->   
      <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
        <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
      </div>
      <div v-else>
        <div style="margin: 0 5%;">
          <md-field>
              <label>Search</label>
              <md-input></md-input> 
              <md-icon>search</md-icon>
          </md-field>
        </div>
        <!-- Cards -->
        <div class="md-layout md-gutter md-alignment-top-left">
          <div v-for="course in allCourses" :key="course.modId" class="md-layout-item md-size-33 md-medium-size-50 md-small-size-100">
            <md-card class="course-card">
              <md-card-media><img :src= "'img/'+course.modId+'.jpg'" alt="Course Image"></md-card-media>
              <md-card-header>
                <div class="md-title">{{ course.modId }} {{ course.modTitle }}</div>
              </md-card-header>
              <md-card-content>
                  by <a>{{ course.teachers[0].firstName }} {{ course.teachers[0].lastName }}</a>, <a>{{ course.teachers[0].organisation }}</a> 
                  <md-chip class="md-accent" style="margin-left: 12px;">{{course.cost}} Credits</md-chip>                
              </md-card-content>
              <md-card-actions>
                  <md-button v-on:click="enroll(course.modId, $event)" class="md-primary">Detail</md-button>
              </md-card-actions>
            </md-card>
          </div>
        </div>
        
        <!-- Enroll Dialog -->
        <md-dialog :md-active.sync="showEnrollDialog">
        <md-dialog-title>
          {{ selectedCourse.modId }} {{ selectedCourse.modTitle }}
          <md-chip class="md-accent" style="margin-left: 12px;">{{selectedCourse.cost}} Credits</md-chip>
        </md-dialog-title>
        <div>
        <md-tabs md-dynamic-height style="width: 70%; float: left; padding: 8px;">
            <md-tab md-label="Course Details">
                <div>
                    This course is offered by <a>{{ selectedCourse.teachers[0].firstName }} {{ selectedCourse.teachers[0].lastName }}</a> from <a>{{ selectedCourse.teachers[0].organisation }}</a>.
                    <p><b style="text-transform: uppercase;">Learning Objectives</b></p>
                    <ol style="padding-left:16px;">
                        <li v-for="lo in selectedCourse.learningObjectives" :key="lo"> {{ lo }}</li>
                    </ol>
                </div>
            </md-tab>
            <md-tab md-label="Module Units">
                <div>
                    <ul style="list-style-type: none; padding-left:8px;">
                        <li v-for="unit in selectedCourse.units" :key="unit.unitId"> 
                          {{ unit.unitId }}  {{ unit.unitTitle }}  <a><small>more</small></a>
                        </li>
                    </ul>
                </div>
            </md-tab>
            <md-tab md-label="Assessments">
                <div>
                  <md-steppers md-vertical>
                    <md-step v-for="unit in selectedCourse.units" :key="unit.unitId" 
                      :md-label="unit.assessment.$class.split('.')[3].replace(/([A-Z])/g, ' $1')" 
                      :md-description="unit.assessment.weighting + '%'">
                      <p><u>Knowledge Required:</u></p>
                      <li v-for="kr in unit.assessment.knowledgeRequired" :key="kr">{{kr}}</li>
                      <div v-if="unit.assessment.$class.split('.')[3] == 'AutoAssessment'">
                        <p>Automatic Marking Service: {{unit.assessment.testType}}</p>
                        <a :href="unit.assessment.testFile" target="_blank">View Test Details</a>
                      </div>
                    </md-step>
                  </md-steppers>
                </div>
            </md-tab>
            <md-button class="md-icon-button">
              <md-icon>home</md-icon>
            </md-button>
        </md-tabs>
        <md-content style="width: 24%; float: left; margin: 16px 0 0 16px; padding: 16px; text-align: center;" class="md-primary">
            <b style="text-transform: uppercase;">Prerequisites</b>
            <p v-if="selectedCourse.prerequisites.length == 0">None required</p>
            <p v-for="prereqs in selectedCourse.prerequisites" :key="prereqs">
              <md-button class="md-raised">{{ prereqs.split('#')[1] }}</md-button>
            </p>
        </md-content>
        </div>
        <md-dialog-actions>
            <md-button class="md-primary" v-on:click="postBeginModule">Enroll (dev)</md-button>
            <md-button class="md-primary" v-on:click="showEnrollDialog = false">Back</md-button>
        </md-dialog-actions>
        </md-dialog>
        <!-- Posting Dialog -->
        <md-dialog :md-active.sync="postingDialog.posting" style="padding: 12px;">
          <div style="text-align: center;">
            <p><img src="img/insertion.gif" alt="blockchain insertion animation" style="height: 20vh;"></p>
            <p v-if="!postingDialog.success">Registering on the Blockchain</p>
            <p v-else style="color: green;">Success!</p>
            <p v-if="!postingDialog.success"><md-progress-bar md-mode="indeterminate" style="width: 100%;"></md-progress-bar></p>
            <p v-else style="color: green;"><md-progress-bar md-mode="determinate" style="width: 100%;" :md-value="100"></md-progress-bar></p>
            <p style="color: brown;">{{ postingDialog.message }}</p>        
          </div>
          <md-dialog-actions>
            <md-button v-if="postingDialog.success" class="md-primary" v-on:click="postingDialog.posting = false">Ok</md-button>
            <md-button v-else class="md-primary" v-on:click="postingDialog.posting = false">Cancel</md-button>            
          </md-dialog-actions>
        </md-dialog>
      </div>
    </div>
</template>

<script>
export default {
  name: "AllCourses",
  data: function() {
    return {
      offline: false,
      loading: true,
      postingDialog: { posting: false, success: false, message: "jNQXAC9IVRw" },
      showEnrollDialog: false,
      allCourses: [],
      selectedCourse: {
        teachers: ["NA"],
        prerequisites: ["NA"],
        assessmentTest: "NA"
      }
    };
  },
  created: function() {
    this.fetchAllCourses();
  },
  methods: {
    // fetch full course listing
    fetchAllCourses: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      // fetch full teacher listing
      fetch(API + "org.moocon.core.Teacher/", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          var allTeachers = json;
          // fetch full course listing
          fetch(API + "org.moocon.core.CourseModule", {
            method: "get",
            headers: new Headers({ "X-Access-Token": token })
          })
            .then(response => response.json())
            .then(json => {
              for (var course of json) {
                // push teachers into course listing
                var info = [];
                for (var teacher of course.teachers) {
                  var id = teacher.split(/#/)[1];
                  var thisTeacher = allTeachers.find(function(teacher) {
                    return teacher.uId == id;
                  });
                  info.push(thisTeacher);
                }
                course.teachers = info;
              }
              this.allCourses = json;
              this.loading = false;
            });
        })
        .catch(error => {
          this.offline = true;
          // alert(error);
        });
    },
    // dialog for enroll button
    enroll: function(modId, event) {
      this.selectedCourse = this.allCourses.find(function(course) {
        return course.modId == modId;
      });
      this.showEnrollDialog = true;
    },
    // post begin module transaction
    postBeginModule: function(event) {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      this.showEnrollDialog = false;
      this.postingDialog = {
        message: "Working On It",
        posting: true,
        success: false
      };
      var bmObject = {
        $class: "org.moocon.core.BeginModule",
        learner: "resource:org.moocon.core.Learner#" + uId,
        mod:
          "resource:org.moocon.core.CourseModule#" + this.selectedCourse.modId
      };

      fetch(API + "org.moocon.core.BeginModule", {
        method: "POST",
        body: JSON.stringify(bmObject),
        headers: new Headers({
          "Content-Type": "application/json",
          "X-Access-Token": token
        })
      }).then(response => {
        if (!response.ok) {
          response
            .json()
            .then(json => {
              throw Error(json.error.message);
            })
            .catch(error => {
              this.postingDialog = {
                message: error.message,
                posting: true,
                success: false
              };
            });
          // throw Error(response.status + " " + response.statusText);
        } else {
          response.json().then(json => {
            this.postingDialog = {
              message: "Block Address:\n" + json.transactionId,
              posting: true,
              success: true
            };
            // console.log(json);
          });
        }
      });
    }
  }
};
</script>

<style lang="scss">
.md-gutter {
  padding: 2%;
}
.course-card {
  margin-bottom: 24px;
  min-width: 16vw;
  max-width: 600px;
}
li {
  line-height: 200%;
}
</style>
