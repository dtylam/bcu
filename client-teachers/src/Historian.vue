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
                    <md-table-head>Timestamp</md-table-head>
                    <md-table-head>Block Address</md-table-head>
                    <md-table-head>Transaction</md-table-head>
                    <md-table-head>Orderer</md-table-head>
                    <md-table-head>Details</md-table-head>                    
                </md-table-row>
                <md-table-row v-for="record in records" :key="record.transactionId">
                    <md-table-cell>{{ new Intl.DateTimeFormat('en-GB', { 
                      weekday: "short", year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
                      }).format(new Date(record.transactionTimestamp))}}</md-table-cell>
                    <md-table-cell>{{ record.transactionId }}</md-table-cell>
                    <md-table-cell>{{ record.transactionType.split('.')[3] }}</md-table-cell>
                    <md-table-cell>{{ record.participantInvoking.split('.')[3] }}</md-table-cell>     
                    <md-table-cell><a :href="'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record))"
                      target="_blank" :download="record.transactionId + '.json'"><md-button class="md-raised">View Raw</md-button></a></md-table-cell>                                                       
                </md-table-row>
            </md-table>
        </div>
    </div>
</template>

<script>
export default {
  name: "Historian",
  data: function() {
    return {
      offline: false,
      loading: true,
      records: []
    };
  },
  created: function() {
    this.loadHistorian();
  },
  methods: {
    loadHistorian: function() {
      const API = this.$config.API;
      const token = this.$config.Token;
      const uId = this.$config.uId;
      fetch("http://localhost:3000/api/system/historian", {
        method: "get",
        headers: new Headers({ "X-Access-Token": token })
      })
        .then(response => response.json())
        .then(json => {
          for (var record of json) {
            if (record.hasOwnProperty("participantInvoking")) {
              var id = record.participantInvoking.split("#")[1];
              if (id == uId) this.records.push(record);
            }
          }
          this.records.sort(function(a, b) {
            return (
              new Date(b.transactionTimestamp) -
              new Date(a.transactionTimestamp)
            );
          });
          this.loading = false;
        })
        .catch(error => {
          console.log(error.message);
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