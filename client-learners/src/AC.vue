<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <div v-else>
            <div class="settingsDiv">
              <p class="md-title">All Readers</p>
              <md-switch v-model="acArray" value="4">Certificates</md-switch>
              <md-switch v-model="acArray" value="2">Submissions</md-switch>
              <md-switch v-model="acArray" value="1">Registered Modules</md-switch>
              <p class="md-subheading">Preview</p>
              <md-card class="previewCard" v-if="acArray.includes('4')">
                <md-card-header>
                  <div v-if="acArray.includes('1')" class="md-subheading">Learning Profile</div>
                  <div v-else class="md-subheading">Certificate of Completion</div>                  
                </md-card-header>
                <md-card-content>
                  <div class="md-layout md-gutter md-gutter-dense">
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="acArray.includes('1')">Learner</label>                        
                        <label v-else>Completed Module</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="acArray.includes('1')">Curriculum Result (if available)</label>                        
                        <label v-else>Module Result (if available)</label>                        
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="acArray.includes('1')">Earned Certificates / Registered Modules</label>                         
                        <label v-else-if="acArray.includes('2')">Units - Submissions - Date - Grades</label>
                        <label v-else>Units</label>                        
                        <md-textarea disabled/>
                      </md-field>
                    </div>
                    <div v-if="acArray.includes('1')" class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="acArray.includes('2')">Completed Modules:<br/> Units - Submissions - Grades - Dates</label>
                        <label v-else>Completed Modules: Units </label>                        
                        <md-textarea disabled/>
                      </md-field>
                    </div>
                    <div v-else class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label>Learner</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label>Date</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="acArray.includes('1')">Personal Tutor (Teacher)</label>                        
                        <label v-else>Module Leader (Teacher)</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                  </div>
                </md-card-content>
              </md-card>
              <p v-else class="md-body-2">None of your data is visible to all readers.</p>
            </div>
            <md-divider></md-divider>
            <div class="settingsDiv">            
              <p class="md-title">Privilledged Readers</p>
              <md-switch v-model="pacArray" value="4">Certificates</md-switch>
              <md-switch v-model="pacArray" value="2">Submissions</md-switch>
              <md-switch v-model="pacArray" value="1">Registered Modules</md-switch>
              <p>Privilledged Readers: &emsp;
                <md-chip class="md-primary" md-deletable>Mo Ramen, PDC</md-chip>
                <md-chip class="md-primary" md-deletable>Graham Norton, BBC</md-chip>&ensp;
                <md-icon>add_circle_outline
                  <md-tooltip md-direction="bottom">Add from Readers Registry</md-tooltip>
                </md-icon>
              </p>
              <p class="md-subheading">Preview</p>   
              <md-card class="previewCard" v-if="pacArray.includes('4')">
                <md-card-header>
                  <div v-if="pacArray.includes('1')" class="md-subheading">Learning Profile</div>
                  <div v-else class="md-subheading">Certificate of Completion</div>       
                </md-card-header>
                <md-card-content>
                  <div class="md-layout md-gutter md-gutter-dense">
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="pacArray.includes('1')">Learner</label>                        
                        <label v-else>Completed Module</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="pacArray.includes('1')">Curriculum Result (if available)</label>                        
                        <label v-else>Module Result (if available)</label>                        
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="pacArray.includes('1')">Earned Certificates / Registered Modules</label>                         
                        <label v-else-if="pacArray.includes('2')">Units - Submissions - Date - Grades</label>
                        <label v-else>Units</label>                        
                        <md-textarea disabled/>
                      </md-field>
                    </div>
                    <div v-if="pacArray.includes('1')" class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="pacArray.includes('2')">Completed Modules:<br/> Units - Submissions - Grades - Dates</label>
                        <label v-else>Completed Modules: Units </label>                        
                        <md-textarea disabled/>
                      </md-field>
                    </div>
                    <div v-else class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label>Learner</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label>Date</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-50 md-small-size-100">
                      <md-field>
                        <label v-if="pacArray.includes('1')">Personal Tutor (Teacher)</label>                        
                        <label v-else>Module Leader (Teacher)</label>
                        <md-input disabled/>
                      </md-field>
                    </div>
                  </div>
                </md-card-content>
              </md-card>           
              <p v-else class="md-body-2">None of your data is visible to privilledged readers.</p>
                           
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "AC",
  data: function() {
    return {
      offline: false,
      loading: true,
      learner: {},
      acArray: ["4"],
      pacArray: ["4", "2", "1"]
    };
  },
  created: function() {
    // this.loadLearner();
    this.loading = false;
  },
  methods: {
    loadSubs: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      fetch(API + "org.moocon.core.Learner", {
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
    }
  }
};
</script>

<style lang="scss">
.md-table-cell {
  max-width: 240px;
  word-wrap: break-word;
}
.settingsDiv {
  padding: 2% 3%;
}
.previewCard {
  margin: 0 !important;
}
.md-gutter-dense {
  padding: 0 2% !important;
}
</style>