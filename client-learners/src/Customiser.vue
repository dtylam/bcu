<template>
    <div>
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        
        <div class="md-layout">
            <div class="md-layout-item">
                <!-- Loading Data Spinner -->   
                <div v-if="loading" style="width: 100%; height: 100%; display: table;">
                    <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
                </div>
                <div v-else>
                  <div class="headers">
                    <h2 class="md-title">All Courses</h2>
                    <md-field>
                        <label>Search</label>
                        <md-input></md-input> <!-- v-model="search" -->
                        <md-icon>search</md-icon>
                    </md-field>
                  </div>
                    <!-- Cards -->
                    <div id="courselist">
                      <div v-for="course in allCourses" :key="course.modId" 
                          v-on:click="viewModule(course.modId, $event)">
                          <md-card class="course-card-mini">
                          <md-ripple>
                          <md-card-media><img :src= "'img/'+course.modId+'.jpg'" alt="Course Image"></md-card-media>
                          <md-card-header>
                              <div class="md-subheading"><b>{{ course.modId }} {{ course.modTitle }}</b></div>
                          </md-card-header>
                          <md-card-content>
                              <a>{{ course.teachers[0].firstName }} {{ course.teachers[0].lastName }}</a>, <a>{{ course.teachers[0].organisation }}</a>
                              <md-chip class="md-accent" style="float: right;">{{course.cost}} Credits</md-chip>                            
                          </md-card-content>
                          </md-ripple>
                          </md-card>
                      </div>
                  </div>
              </div>
            </div>
            <div class="md-layout-item">
              <div class="headers">
                  <h2 class="md-title">My Term</h2>
              </div>
              <div id="termbuilder">
                  <!-- For no courses -->
                  <md-empty-state v-if="curriculum.length == 0" md-icon="add_to_queue" md-label="" md-description="Select Courses from All Courses list">
                  </md-empty-state>
                  <div v-else>
                      <md-card class="course-card-mini" v-for="course in curriculum" :key="course.modId">
                          <md-card-header>
                              <div class="md-subheading"><b>{{ course.modId }} {{ course.modTitle }}</b>
                              <md-button class="md-icon-button" style="float: right;" v-on:click="rmModule(course.modId, $event)">
                                  <md-icon>cancel</md-icon>
                              </md-button>
                              </div>
                          </md-card-header>
                          <md-card-content>
                              <a>{{ course.teachers[0].firstName }} {{ course.teachers[0].lastName }}</a>, <a>{{ course.teachers[0].organisation }}</a>
                              <md-chip style="float: right;">{{course.cost}} Credits</md-chip>                            
                          </md-card-content>
                      </md-card>
                  </div>
                  <div class="headers">
                    <md-divider style="margin: 16px 0;"></md-divider>
                    <md-chip class="md-primary">{{creditSum}} / 60 Credits</md-chip>
                    <md-button class="md-raised md-primary" style="float: right;" 
                      :disabled="creditSum != 60" v-on:click="proposeCurriculum">Propose</md-button>
                  </div>
              </div>
            </div>
            <div class="md-layout-item" id="dmwindow">
                <h2 class="md-title">Direct Message</h2>
                <div style="float: left;">
                    <md-avatar>
                        <img src="https://placeimg.com/40/40/people/2" alt="Avatar">
                        <md-tooltip md-direction="bottom">Personal Tutor</md-tooltip>
                    </md-avatar>
                    <md-avatar class="md-avatar-icon md-primary">MA
                        <md-tooltip md-direction="bottom">Career Advisor</md-tooltip>
                    </md-avatar>
                    <md-avatar>
                        <md-icon>add_circle_outline</md-icon>
                        <md-tooltip md-direction="bottom">Open Address Book</md-tooltip>
                    </md-avatar> 
                </div>
                <div style="width: 100%; height: 66vh; display: table;">
                  <p style="text-align: center; vertical-align: middle; display:table-cell;" class="md-body-1">
                    Start a conversation with your advisor today!</p>
                </div>
                <md-field>
                  <md-icon class="md-primary">mode_comment</md-icon>
                  <label>Your Message</label>
                  <md-input></md-input>
                  <md-icon>cancel</md-icon>
                </md-field>
            </div>
        </div>

        <!-- Enroll Dialog -->
        <md-dialog :md-active.sync="showAddDialog">
        <md-dialog-title>
          Add {{ selectedCourse.modId }} {{ selectedCourse.modTitle }} to Curriculum
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
            <md-button class="md-primary" v-on:click="showAddDialog = false">Back</md-button>
            <md-button class="md-primary" v-on:click="addModule">
                Add</md-button>
        </md-dialog-actions>
        </md-dialog>

        <!-- Posting Dialog -->
        <md-dialog :md-active.sync="postingDialog.posting" style="padding: 12px;">
          <div style="text-align: center;">
            <p><img src="img/insertion.gif" alt="blockchain insertion animation" style="height: 20vh;"></p>
            <p v-if="!postingDialog.success">Updating Curriculum on the Blockchain</p>
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

</template>

<script>
export default {
  name: "Customiser",
  data: function() {
    return {
      offline: false,
      loading: true,
      showAddDialog: false,
      postingDialog: { posting: false, success: false, message: "NA" },
      // allCoursesRaw: [],
      allCourses: [],
      selectedCourse: {
        teachers: ["NA"],
        prerequisites: ["NA"],
        assessmentTest: "NA"
      },
      curriculum: [],
      creditSum: 0
    };
  },
  created: function() {
    this.fetchAllCourses();
  },
  watch: {
    // whenever curriculum changes, this function will run
    curriculum: function(ncurriculum, ocurriculum) {
      var sum = 0;
      for (var course of ncurriculum) {
        sum = sum + course.cost;
      }
      this.creditSum = sum;
    }
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
              // this.allCoursesRaw = json;
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
        });
    },
    // dialog for enroll button
    viewModule: function(modId, event) {
      this.selectedCourse = this.allCourses.find(function(course) {
        return course.modId == modId;
      });
      this.showAddDialog = true;
    },
    addModule: function(event) {
      this.curriculum.push(this.selectedCourse);
      this.showAddDialog = false;
    },
    rmModule: function(modId, event) {
      var courseToRm = this.curriculum.find(function(course) {
        return course.modId == modId;
      });
      var index = this.curriculum.indexOf(courseToRm);
      // console.log(index);
      this.curriculum.splice(index, 1);
    },
    proposeCurriculum: function(event) {
      this.postingDialog = {
        message: "Working On It",
        posting: true,
        success: false
      };
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      var modIds = [];
      for (var mod of this.curriculum){
        modIds.push(mod.modId);
      }
      console.log(modIds);
      var pcObject = {
        $class: "org.moocon.core.ProposeCurriculum",
        learner: "resource:org.moocon.core.Learner#" + uId,
        teacher: "resource:org.moocon.core.Teacher#T01",
        modIds: modIds
      };
      fetch(API + "org.moocon.core.ProposeCurriculum", {
        method: "POST",
        body: JSON.stringify(pcObject),
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
        } else {
          response.json().then(json => {
            this.postingDialog = {
              message: "Block Address:\n" + json.transactionId,
              posting: true,
              success: true
            };
          });
        }
      });
    }
  }
};
</script>

<style lang="scss">
div .headers {
  padding: 0 24px;
}
div #courselist {
  width: 100%;
  height: 77vh;
  overflow: scroll;
}
div #termbuilder {
  border-style: solid;
  border-color: lightgrey;
  border-width: 0 0 0 1px;
  width: 100%;
  height: 88vh;
  overflow: scroll;
}
div #dmwindow {
  border-style: solid;
  border-color: lightgrey;
  border-width: 0 0 0 1px;
  padding: 0 24px;
  width: 100%;
  height: 96vh;
}
.course-card-mini {
  margin: 0 24px 16px 24px !important;
}
.md-table-cell {
  max-width: 240px;
  word-wrap: break-word;
}
</style>