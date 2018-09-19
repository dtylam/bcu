<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <div v-else>
            <md-table>
                <md-table-row>
                    <md-table-head>Certificate ID</md-table-head>
                    <!-- <md-table-head>Submission Time</md-table-head>                     -->
                    <md-table-head>Submissions</md-table-head>
                    <md-table-head>Curriculum</md-table-head>
                    <md-table-head>Organisation</md-table-head>                    
                    <md-table-head>Overall Result</md-table-head>  
                    <md-table-head>Signed</md-table-head>  
                    <md-table-head></md-table-head>    
                </md-table-row>
                <md-table-row v-for="record in records" :key="record.subId">
                    <md-table-cell>{{ record.certId }}</md-table-cell>
                    <!-- <md-table-cell>{{ new Intl.DateTimeFormat('en-GB', { 
                      weekday: "short", year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
                      }).format(new Date(record.timeAdded))}}</md-table-cell> -->
                    <md-table-cell><a>{{ record.subIds }}</a></md-table-cell>
                    <md-table-cell>{{ record.curriculum.currId }}</md-table-cell>    
                    <md-table-cell>{{ record.organisation }}</md-table-cell>  
                    <md-table-cell>{{ record.overallResult }}</md-table-cell>     
                    <md-table-cell>
                      <span v-if="record.signatories.length == 0" style="text-transform: uppercase; color: grey;">pending</span>
                      <span v-else style="text-transform: uppercase; color: green;">signed</span>
                    </md-table-cell>                
                    <md-table-cell>
                      <md-button class="md-raised">Review</md-button>
                    </md-table-cell>                                                                                                                                       
                </md-table-row>
            </md-table>
        </div>
    </div>
</template>

<script>
export default {
  name: "SignCert",
  data: function() {
    return {
      offline: false,
      loading: true,
      records: []
    };
  },
  created: function() {
    this.loadCerts();
  },
  methods: {
    loadCerts: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      fetch(API + "org.moocon.core.Certificate", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          json = json.filter(c => c.visible == true).sort(function(a, b) {
            return (
              new Date(b.timeAdded) -
              new Date(a.timeAdded)
            );
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
</style>