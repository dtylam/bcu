<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <!-- Table of Curriculum -->
        <div v-else>
            <md-table>
                <md-table-row>
                    <md-table-head>Curriculum ID</md-table-head>
                    <md-table-head>Curriculum Title</md-table-head>                                        
                    <md-table-head>Learner</md-table-head>
                    <md-table-head>Courses</md-table-head>
                    <md-table-head>Notes</md-table-head>
                    <md-table-head>Approval</md-table-head>
                    <md-table-head>Action</md-table-head>                                                      
                </md-table-row>
                <md-table-row v-for="curr in curricula" :key="curr.currId">
                    <md-table-cell>{{ curr.currId }}</md-table-cell>
                    <md-table-cell>
                        <div v-if="curr.hasOwnProperty('currTitle')">{{ curr.currTitle }}</div>
                        <div v-else>undefined</div>
                    </md-table-cell>
                    <md-table-cell><a>{{ curr.learner.split("#")[1] }}</a></md-table-cell>
                    <md-table-cell>{{ curr.modIds }}</md-table-cell>
                    <md-table-cell>
                        <div v-if="curr.hasOwnProperty('notes')">{{ curr.notes }}</div>
                    </md-table-cell>
                    <md-table-cell>
                        <div v-if="curr.approved">
                            <b style="text-transform: uppercase; color: green;">APPROVED</b>
                        </div>
                        <div v-else>
                            <b style="text-transform: uppercase; color: orange;">PENDING</b>
                        </div>
                    </md-table-cell>
                    <md-table-cell>
                        <div v-if="!curr.approved">
                            <md-button class="md-raised" @click="editCurr(curr.currId, $event)">Edit</md-button>
                        </div>  
                    </md-table-cell>                                                                                                                         
                </md-table-row>
            </md-table>
        </div>
        <!-- edit curr dialog -->
        <md-dialog :md-active.sync="editing" style="min-width: 48vw;">
            <md-dialog-title>Curriculum {{editingCurr.currId}}</md-dialog-title>
            <div>
                <div style="width: 48%; float: left; padding: 0% 3%; margin: 0 1%;">
                    <div class="md-subheading">Details</div>
                    <div style="max-height: 320px; overflow: scroll;">
                        <md-field>
                            <!-- <label for="currTitle">{{editingCurr.currTitle}}</label> -->
                            <md-input name="currTitle" id="currTitle" v-model="editingCurr.currTitle"/>
                            <span class="md-helper-text">Curriculum Title</span>
                        </md-field>
                        <md-field>
                            <!-- <label for="programmeOutcome">{{editingCurr.programmeOutcome}}</label> -->
                            <md-textarea name="programmeOutcome" id="programmeOutcome" v-model="editingCurr.programmeOutcome"/>
                            <span class="md-helper-text">Programme Outcomes</span>
                        </md-field>
                        <md-field>
                            <!-- <label for="notes">{{editingCurr.notes}}</label> -->
                            <md-input name="notes" id="notes" v-model="editingCurr.notes"/>
                            <span class="md-helper-text">Notes</span>
                        </md-field>
                    </div>
                </div>
                <div style="width: 48%; float: left; padding: 0% 3%; margin: 0 1%;">
                    <div class="md-subheading">Chosen Course Modules</div>
                    <div style="max-height: 320px; overflow: scroll;">
                    <md-card class="course-card-mini" v-for="course in mods" :key="course.modId">
                        <md-card-header>
                            <div class="md-subheading"><b>{{ course.modId }} {{ course.modTitle }}</b></div>
                            <p><a>{{ course.teachers.firstName }} {{ course.teachers.lastName }}</a>, <a>{{ course.teachers.organisation }}</a></p>                            
                        </md-card-header>
                        <md-card-content>
                            <li v-for="unit in course.units" :key="unit.unitId" style="margin-left: 8px;">
                                {{ unit.unitTitle }}</li>
                            <md-chip style="float: right; margin-bottom: 8px;">{{course.cost}} Credits</md-chip>                            
                        </md-card-content>
                    </md-card>
                    </div>
                </div> 
            </div>
            <md-dialog-actions>
                <md-button class="md-primary" @click="editing = false">Close</md-button>
                <md-button class="md-accent" @click="approve">Approve</md-button>                
                <md-button class="md-primary">Propose Changes</md-button>                
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
            <md-button v-if="postingDialog.success" class="md-primary" v-on:click="postingDialog.posting = false; loadCurrs();">Ok</md-button>
            <md-button v-else class="md-primary" v-on:click="postingDialog.posting = false;">Cancel</md-button>            
          </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
export default {
  name: "MySubs",
  data: function() {
    return {
      offline: false,
      loading: true,
      editing: false,
      allTeachers: [],
      // currTeachers: {},
      editingCurr: {
        currId: null,
        currTitle: null,
        notes: null,
        programmeOutcome: null,
        modIds: []
      },
      mods: [],
      postingDialog: { posting: false, success: false, message: "NA" },
      curricula: []
    };
  },
  computed: {},
  created: function() {
    this.loadCurrs();
  },
  methods: {
    loadCurrs: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      // fetch full teacher listing
      fetch(API + "org.moocon.core.Teacher/", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          this.allTeachers = json;
        });

      // fetch all curricula
      fetch(API + "org.moocon.core.Curriculum", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          json.reverse();
          this.curricula = json;
          this.loading = false;
        })
        .catch(error => {
          this.offline = true;
        });
    },
    editCurr: function(currId, event) {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      this.mods = [];
      this.editingCurr = this.curricula.find(function(curr) {
        return curr.currId == currId;
      });
      for (var modId of this.editingCurr.modIds) {
        fetch(API + "org.moocon.core.CourseModule/" + modId, {
          method: "get",
          headers: new Headers({ "X-Access-Token": token })
        })
          .then(response => response.json())
          .then(json => {
            json.teachers = this.allTeachers.find(function(teacher) {
              return teacher.uId == json.teachers[0].split("#")[1];
            });
            this.mods.push(json);
          });
        // .then(function(json) {
        // });
      }
      this.editing = true;
    },
    approve: function(event) {
      this.editing = false;
      this.postingDialog = {
        message: "Working On It",
        posting: true,
        success: false
      };
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      //posting
      var acObject = {
        $class: "org.moocon.core.ApproveCurriculum",
        curriculum: this.editingCurr
      };
      fetch(API + "org.moocon.core.ApproveCurriculum", {
        method: "POST",
        body: JSON.stringify(acObject),
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
.md-table-cell {
  max-width: 240px;
  word-wrap: break-word;
}
.course-card-mini {
  margin: 4px 4px 12px 4px !important;
}
</style>