<template>
    <div id="page">
      <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
      <!-- Loading Data Spinner -->   
      <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
        <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
      </div>
      <div v-else>
      <!-- For no courses -->
        <md-empty-state v-if="myCourses.length == 0" md-icon="add_to_queue" md-label="No courses created yet!" md-description="">
            <md-button class="md-primary md-raised">Browse Courses</md-button>
        </md-empty-state>

        <!-- Cards View-->
        <div v-if="!open && myCourses.length > 0" class="md-layout md-gutter md-alignment-top-left">
          <div v-for="course in myCourses" :key="course.modId" class="md-layout-item md-size-33 md-medium-size-50 md-small-size-100">
            <md-card class="course-card">
              <md-card-media><img :src= "'img/'+course.modId+'.jpg'" alt="Course Image"></md-card-media>
              <md-card-header><div class="md-title">{{ course.modId }} {{ course.modTitle }}</div></md-card-header>
              <md-card-content>
                by <a>{{ course.teachers[0].firstName }} {{ course.teachers[0].lastName }}</a>, <a>{{ course.teachers[0].organisation }}</a> 
                <md-chip style="margin-left: 12px;">{{course.cost}} Credits</md-chip>
              </md-card-content>
              <md-card-actions>
                  <md-button>Edit</md-button>
                  <md-button>Stats</md-button>
                  <md-button v-on:click="openCourse(course.modId, $event)">View</md-button>
              </md-card-actions>
            </md-card>
          </div>
        </div>

        <!-- add new fab speed dial -->
          <md-speed-dial class="md-bottom-right">
            <!-- <md-speed-dial-content style="text-align: right; display: block;">
              <md-button class="md-raised">Direct Message</md-button><br/>
              <md-button class="md-raised">Class Forum</md-button>
            </md-speed-dial-content> -->
            <md-speed-dial-target @click="addnew = true;">
              <!-- <md-icon class="md-morph-initial">help</md-icon> -->
              <md-icon>add</md-icon>
            </md-speed-dial-target>
          </md-speed-dial>

        <!-- Course View -->
        <div v-if="open">
          <md-tabs class="md-primary" :md-active-tab="openedCourse.units[0].unitId">
            <md-tab id="tab-back" md-icon="arrow_back" v-on:click="open = false;"></md-tab>
            <md-tab v-for="unit in openedCourse.units" :key="unit.unitId" 
              :id="unit.unitId" :md-label="unit.unitId + ' ' + unit.unitTitle">
            <md-steppers md-alternative md-dynamic-height>
              <!-- Step 1 -->            
                <md-step md-label="Content / Materials">
                  <div class="md-layout md-gutter md-alignment-top-left">
                    <div class="md-layout-item md-large-size-50 md-medium-size-100">
                      <p><youtube :video-id="unit.materialMd" player-height="480" class="youtube"/></p>
                    </div>
                    <div class="md-layout-item md-large-size-50 md-medium-size-100">
                      <h3>Documents</h3>
                      <md-card md-with-hover class="doc-card">
                        <md-ripple>
                          <md-card-header>
                          <md-card-header-text>
                            <div class="md-title">Cheatsheet</div>
                            <div class="md-subhead">cheatsheet.docx</div>
                          </md-card-header-text>
                          <md-card-media><md-icon class="md-size-2x">description</md-icon></md-card-media>
                          </md-card-header>
                        </md-ripple>
                      </md-card>
                      <md-card md-with-hover class="doc-card">
                        <md-ripple>
                          <md-card-header>
                            <md-card-header-text>
                              <div class="md-title">Handout</div>
                              <div class="md-subhead">handout.pptx</div>
                            </md-card-header-text>
                            <md-card-media><md-icon class="md-size-2x">slideshow</md-icon></md-card-media>
                          </md-card-header>
                        </md-ripple>
                      </md-card>
                    </div>
                  </div>
                  
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias doloribus eveniet quaerat modi cumque quos sed, temporibus nemo eius amet aliquid, illo minus blanditiis tempore, dolores voluptas dolore placeat nulla.</p>
                </md-step>
              <!-- Step 2 -->
                <md-step md-label="Assessment Contract">
                  <div class="md-layout md-gutter md-alignment-top-left">
                    <div class="md-layout-item md-large-size-50 md-medium-size-100">
                      <p><b style="text-transform: uppercase;">Knowledge Required</b></p>
                        <ol>
                          <li v-for="kr in unit.assessment.knowledgeRequired" :key="kr"> {{ kr }}</li>
                        </ol>
                      <p><b style="text-transform: uppercase;">Weighting: {{unit.assessment.weighting}} %</b></p>
                      <div v-if="unit.assessment.$class.split('.')[3] == 'AutoAssessment'">
                        <p><b style="text-transform: uppercase;">Assessment Procedures: </b>{{unit.assessment.testType}}</p>
                        <a v-bind:href="unit.assessment.testFile" target="_blank">
                          <md-button class="md-raised">View Test Details</md-button></a>
                      </div>
                    </div>
                    <div class="md-layout-item md-large-size-50 md-medium-size-100">
                      <h3>Documents</h3>
                      <md-card md-with-hover class="doc-card">
                        <md-ripple>
                          <md-card-header>
                          <md-card-header-text>
                            <div class="md-title">Assignment Brief</div>
                            <div class="md-subhead">brief.docx</div>
                          </md-card-header-text>
                          <md-card-media><md-icon class="md-size-2x">description</md-icon></md-card-media>
                          </md-card-header>
                        </md-ripple>
                      </md-card>
                    </div>
                  </div>
                </md-step>
              <!-- Step 3 -->
                <!-- <md-step md-label="Submission">
                  <h3>New Submission</h3>
                  <form style="padding: 12px;">
                    <md-field>
                      <label for="comments">Comments</label>
                      <md-textarea v-model="submissionForm.comments">
                        Type your comments here.
                      </md-textarea> 
                    </md-field>
                    <md-field>
                      <label for="attachments">Attachments</label>
                      <md-file @change="processFile($event)"/>
                    </md-field>
                    <md-button class="md-raised md-accent" style="float: right;" 
                      v-on:click="addSubmission($event, unit.unitId)">Submit</md-button>
                  </form>
                </md-step> -->
              </md-steppers>
            </md-tab>
            <md-tab id="tab-forum" md-label="Class Forum" md-disabled></md-tab>
            <md-tab id="tab-dm" md-label="Direct Message" md-disabled></md-tab>
          </md-tabs>
        </div>
        <!-- Addnew Dialog -->
        <md-dialog :md-active.sync="addnew" style="padding: 12px; min-width: 42vw;">
          <md-dialog-title>Creating a New Course Module</md-dialog-title>
          <md-dialog-content>
            <md-field>
              <label for="attachments">Upload module definitions file (.json)</label>
              <md-file /><!--@change="processFile($event)"-->
            </md-field>
            <span>Only import mode has been implemented.<br/>
            <a href="src/assets/CM001.json" target="_blank">Download Template</a></span>            
          </md-dialog-content>
          <md-dialog-actions>
            <md-button class="md-primary" @click="addnew = false">Cancel</md-button>
            <md-button class="md-primary" @click="createModule">Create</md-button>
          </md-dialog-actions>
        </md-dialog>
        <!-- Posting Dialog -->
        <md-dialog :md-active.sync="postingDialog.posting" style="padding: 12px;">
          <div style="text-align: center;">
            <p><img src="img/insertion.gif" alt="blockchain insertion animation" style="height: 20vh;"></p>
            <p v-if="!postingDialog.success">Submitting to the Blockchain</p>
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
  name: "MyCourses",
  data: function() {
    return {
      offline: false,
      loading: true,
      open: false,
      addnew: false,
      openedCourse: {},
      postingDialog: { posting: false, success: false, message: "jNQXAC9IVRw" },
      // submissionForm: { comments: null, file: null },
      myCourses: []
    };
  },
  created: function() {
    this.fetchMyCourses();
  },
  methods: {
    // fetch learner and filter all courses
    fetchMyCourses: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      fetch(API + "org.moocon.core.Teacher/" + uId, {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          var myCourseCodes = [];
          for (var relationship of json.mods) {
            myCourseCodes.push(relationship.split("#")[1]);
          }
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
                  var myCourses = [];
                  for (var course of json) {
                    if (myCourseCodes.includes(course.modId)) {
                      // push teachers into course listing
                      var info = [];
                      for (var teacher of course.teachers) {
                        var id = teacher.split(/#/);
                        var thisTeacher = allTeachers.find(function(teacher) {
                          return teacher.uId == id[1];
                        });
                        info.push(thisTeacher);
                      }
                      course.teachers = info;
                      myCourses.push(course);
                    }
                  }
                  this.myCourses = myCourses;
                  this.loading = false;
                });
            });
        })
        .catch(error => {
          this.offline = true;
          // alert(error);
        });
    },
    openCourse: function(modId, event) {
      const API = this.$config.API;
      const token = this.$config.Token;
      //get targetted course
      var targetCourse = this.myCourses.find(function(course) {
        return course.modId == modId;
      });
      //changing Top toolbar text
      vm.$data.toolbarText = targetCourse.modId + " " + targetCourse.modTitle;
      this.open = true;
      this.openedCourse = targetCourse;
    },
    closeCourse: function(event) {
      //changing Top toolbar text
      vm.$data.toolbarText = "My Courses";
    },
    createModule: function(event){

    },
    // processFile: function(event) {
    //   this.submissionForm.file = event.target.files[0];
    // },
    // addSubmission: function(event, unitId) {
    //   const API = this.$config.API;
    //   const token = this.$config.Token;
    //   const uId = this.$config.uId;
    //   // error checking
    //   // if(form.comments == "")
    //   this.postingDialog = {
    //     message: "Working On It",
    //     posting: true,
    //     success: false
    //   };
    //   // convert file to string
    //   function getBase64(file) {
    //     return new Promise((resolve, reject) => {
    //       var reader = new FileReader();
    //       reader.readAsDataURL(file);
    //       reader.onload = function() {
    //         resolve(reader.result);
    //       };
    //       reader.onerror = function(error) {
    //         console.log("Error: ", error);
    //         reject(error);
    //       };
    //     });
    //   }
    //   getBase64(this.submissionForm.file).then(base64string => {
    //     // post
    //     var asObject = {
    //       $class: "org.moocon.core.AddSubmission",
    //       learner: "resource:org.moocon.core.Learner#" + uId,
    //       unit: "resource:org.moocon.core.ModuleUnit#" + unitId,
    //       content: base64string,
    //       comments: this.submissionForm.comments
    //     };
    //     console.log(asObject);
    //     fetch(API + "org.moocon.core.AddSubmission", {
    //       method: "POST",
    //       body: JSON.stringify(asObject),
    //       headers: new Headers({
    //         "Content-Type": "application/json",
    //         "X-Access-Token": token
    //       })
    //     }).then(response => {
    //       if (!response.ok) {
    //         response
    //           .json()
    //           .then(json => {
    //             throw Error(json.error.message);
    //           })
    //           .catch(error => {
    //             this.postingDialog = {
    //               message: error.message.split("(")[1].slice(0, -2),
    //               posting: true,
    //               success: false
    //             };
    //           });
    //         // throw Error(response.status + " " + response.statusText);
    //       } else {
    //         response.json().then(json => {
    //           this.postingDialog = {
    //             message: "Block Address:\n" + json.transactionId,
    //             posting: true,
    //             success: true
    //           };
    //           // console.log(json);
    //         });
    //       }
    //     });
    //   });
    // }
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
.doc-card {
  margin-bottom: 24px;
}
.my-fab {
  float: right;
}
iframe,
.youtube {
  min-height: 320px;
}
h3 {
  padding-left: 16px;
}
li {
  line-height: 200%;
}
</style>
