<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <div v-else>
            <!-- <div style="padding: 2%;">
              <tx-graph
                :data="lineChartData"
                :options="{responsive: true, maintainAspectRatio: false}"
                :width="400" :height="200"></tx-graph>
            </div> -->
            <md-table>
                <md-table-row>
                    <md-table-head>Submission Time</md-table-head>           
                    <md-table-head>Submission ID</md-table-head>                             
                    <!-- <md-table-head>Module Unit</md-table-head> -->
                    <md-table-head>Comments</md-table-head>
                    <md-table-head>Attachment</md-table-head>                    
                    <md-table-head>Grade</md-table-head>    
                    <md-table-head>Feedback</md-table-head>
                    <md-table-head>Results Released</md-table-head>
                    <md-table-head>Action</md-table-head>                    
                </md-table-row>
                <md-table-row v-for="record in records" :key="record.transactionId">
                    <!-- <md-table-cell>{{ record.subId }}</md-table-cell> -->
                    <md-table-cell>{{ new Intl.DateTimeFormat('en-GB', { 
                      weekday: "short", year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
                      }).format(new Date(record.timeAdded))}}</md-table-cell>
                    <md-table-cell><a>{{ record.subId }}</a></md-table-cell>
                    <md-table-cell>{{ record.comments }}</md-table-cell>    
                    <md-table-cell>{{ record.content }}</md-table-cell>     
                    <md-table-cell>
                      <div v-if="record.hasOwnProperty('result')">
                        <b v-if="record.result.passed" style="text-transform: uppercase; color: green;">
                          <span v-if="record.result.hasOwnProperty('grade')">{{record.result.grade}}</span>
                          <span v-else-if="record.result.hasOwnProperty('score')">{{record.result.score}}/{{record.result.maxScore}}</span>
                          <span v-else>PASSED</span>                  
                        </b>
                        <b v-else style="text-transform: uppercase; color: orangered;">FAILED</b>
                      </div>
                      <b v-else style="text-transform: uppercase; color: grey;">PENDING</b>
                    </md-table-cell>
                    <md-table-cell>
                      <a v-if="record.hasOwnProperty('result')" :href="'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record))"
                        target="_blank"><md-button class="md-raised">View</md-button></a>
                      <b v-else style="text-transform: uppercase; color: grey;">PENDING</b>                      
                    </md-table-cell>             
                    <md-table-cell><span v-if="record.hasOwnProperty('timeAssessed')">{{ new Intl.DateTimeFormat('en-GB', { 
                      weekday: "short", year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
                      }).format(new Date(record.timeAssessed)) }}</span></md-table-cell>
                    <md-table-cell><md-button @click="startMarking(record.subId, $event)" class="md-icon-button md-dense md-raised md-accent"
                      v-if="!record.hasOwnProperty('result')">
                      <md-icon>mode_edit</md-icon>
                    </md-button></md-table-cell>                                                                                                                                                           
                </md-table-row>
            </md-table>
        </div>
        <!-- SubmitResult Dialog -->
        <md-dialog :md-active.sync="marking" style="min-width: 52vw; overflow: scroll;">
          <md-dialog-title>Submission {{selectedSubmission.subId}}</md-dialog-title>
          <md-dialog-content style="padding: 0 24px;">
            <div v-if="selectedSubmission.comments != 'Viva'">
              <p><b style="text-transform: uppercase;">Submission File:</b>
                <md-button class="md-raised md-primary" style="vertical-align: middle;">Download</md-button></p>
              <p><b style="text-transform: uppercase;">Learner Comments:</b></p>
              <md-field>
                {{selectedSubmission.comments}}
              </md-field>
            </div>
            <div v-else>
              <div style="background: black; width: 420px; height: 240px; display: table; margin: 24px auto;">
                <md-icon class="md-size-2x" style="color: lightgrey; display: table-cell; text-align: center;">videocam_off</md-icon>
              </div>
            </div>
            <div style="background: lightpink; padding: 12px;">
              <p><b style="text-transform: uppercase;">Marking Scheme:</b></p>
              <md-table>
                <md-table-row>
                  <md-table-head>Criteria</md-table-head>                             
                  <md-table-head v-for="gd in selectedSubmission.unit.assessment.gradeDescriptors" :key="gd.grade">{{gd.grade}}</md-table-head>                        
                </md-table-row>
                <md-table-row v-for="criterion in selectedSubmission.unit.assessment.criteria" :key="criterion.heading">
                  <md-table-head>{{criterion.heading}} ({{criterion.weighting}}%)</md-table-head>
                  <md-table-cell v-for="gd in selectedSubmission.unit.assessment.gradeDescriptors" :key="gd.grade">
                    <md-checkbox v-model="gradesDict[criterion.heading + '_' + gd.grade]" style="margin: 0;"></md-checkbox>
                  </md-table-cell>
                </md-table-row>
              </md-table>
              <md-field>
                <label>Feedback</label>
                <md-input v-model="feedback"></md-input>
              </md-field>
            </div>
          </md-dialog-content>
          <md-dialog-actions>
            <md-button class="md-primary" @click="marking = false">Close</md-button>
            <md-button class="md-accent" @click="postResults">Submit Marks</md-button>
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
</template>

<script>
// import TransactionGraph from "./TransactionGraph.vue";

export default {
  name: "MySubs",
  data: function() {
    return {
      offline: false,
      loading: true,
      records: [],
      marking: false,
      selectedSubmission: {
        unit: { assessment: { criteria: {}, gradeDescriptors: {} } }
      },
      gradesDict: {},
      feedback: "",
      postingDialog: { posting: false, success: false, message: "NA" }
    };
  },
  // components: {
  //   "tx-graph": TransactionGraph
  // },
  created: function() {
    this.loadSubs();
  },
  computed: {
    gradesDict: function() {
      var dict = {};
      var cArray = this.selectedSubmission.unit.assessment.criteria;
      var gArray = this.selectedSubmission.unit.assessment.gradeDescriptors;
      cArray.forEach(function(c) {
        gArray.forEach(function(g) {
          dict[c.heading + "_" + g.grade] = false;
        });
      });
      return dict;
    }
  },
  methods: {
    loadSubs: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      fetch(API + "org.moocon.core.Submission", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          json.sort(function(a, b) {
            return new Date(b.timeAdded) - new Date(a.timeAdded);
          });
          this.records = json;
          this.loading = false;
        })
        .catch(error => {
          this.offline = true;
        });
    },
    startMarking: function(subId, event) {
      const API = this.$config.API;
      const token = this.$config.Token;
      // const uId = this.$config.uId;
      this.selectedSubmission = this.records.find(function(record) {
        return record.subId == subId;
      });
      // console.log(this.selectedSubmission.unit);
      if (this.selectedSubmission.unit.hasOwnProperty("unitId")) {
        var unitId = this.selectedSubmission.unit.unitId;
      } else {
        var unitId = this.selectedSubmission.unit.split("#")[1];
      }
      fetch(API + "org.moocon.core.ModuleUnit/" + unitId, {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          this.selectedSubmission.unit = json;
          this.marking = true;
        })
        .catch(error => {
          this.offline = true;
        });
    },
    postResults: function(event) {
      this.marking = false;
      this.postingDialog = {
        message: "Working On It",
        posting: true,
        success: false
      };
      var gradesGivenStrs = [];
      for (var i in this.gradesDict) {
        if (this.gradesDict[i]) gradesGivenStrs.push(i);
      }
      if (
        gradesGivenStrs.length !=
        this.selectedSubmission.unit.assessment.criteria.length
      ) {
        this.postingDialog = {
          message: "Please check one grade per criteria!",
          posting: false,
          success: false
        };
      } else {
        var grades = this.selectedSubmission.unit.assessment.gradeDescriptors.map(
          gd => gd.grade
        );
        var uploadableGrades = [];
        gradesGivenStrs.forEach(function(str) {
          uploadableGrades.push(grades.indexOf(str.split("_")[1]));
        });
        console.log("uploadableGrades", uploadableGrades);
        //post
        const API = this.$config.API;
        const token = this.$config.Token;
        const uId = this.$config.uId;

        var srObject = {
          $class: "org.moocon.core.SubmitResult",
          submission:
            "resource:org.moocon.core.Submission#" +
            this.selectedSubmission.subId,
          assessor: "resource:org.moocon.core.Teacher#" + uId,
          marks: uploadableGrades,
          feedbackMd: this.feedback
        };
        // feedbackMd can't be empty
        if (srObject.feedbackMd == "") srObject.feedbackMd = "NA";

        fetch(API + "org.moocon.core.SubmitResult", {
          method: "POST",
          body: JSON.stringify(srObject),
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
              this.loadSubs();
            });
          }
        });
      }
    }
  }
};
</script>

<style lang="scss">
.md-table-cell {
  max-width: 240px;
  word-wrap: break-word;
}
</style>