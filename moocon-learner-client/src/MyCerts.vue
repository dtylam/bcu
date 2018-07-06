<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <div v-else>
            
        </div>
    </div>
</template>

<script>
export default {
  name: "MyCerts",
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
          json.sort(function(a, b) {
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