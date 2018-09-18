<template>
    <div id="page">
        <!-- Offline Dialog -->        
        <md-dialog-alert :md-active.sync="offline" md-title="Blockchain Network Lost!" md-content="Please check if the Composer REST API server is online."/>
        <!-- Loading Data Spinner -->   
        <div style="width: 100%; height: 90vh; display: table;" v-if="loading">
            <p style="text-align: center; vertical-align: middle; display:table-cell;"><md-progress-spinner md-mode="indeterminate"></md-progress-spinner></p>
        </div>
        <div v-if="!welcome" class="login">
            <form>
                <md-card>
                    <md-card-header>
                    <div class="md-title my-center"><md-icon class="md-size-3x">credit_card</md-icon> Login</div>
                    </md-card-header>

                    <md-card-content>    
                        <md-field>
                            <label for="card">Upload your staff card (.card) file here</label>
                            <md-file @change="processFile($event)"/>
                        </md-field>
                        <md-checkbox>Remember Me</md-checkbox>
                        <md-button class="md-raised md-primary" style="float: right;" v-on:click="submitCard">Login</md-button>
                        <p>DEV: Do not use this form if you have already imported the cards with a script.</p>
                    </md-card-content>
                </md-card>    
            </form>
        </div>
        <div v-else class="login">
            <md-card>
                <md-card-header>
                    <div class="md-title my-center"><md-icon class="md-size-3x">credit_card</md-icon> Welcome, Gee Money</div>
                </md-card-header>
            </md-card>   
        </div>
        <hr/>
        <div class="md-layout md-gutter md-alignment-center">
            <div class="md-layout-item md-medium-size-33 md-small-size-100">
                <div class="infobox">
                    <md-icon class="md-size-2x">verified_user</md-icon>
                    <h3>Trustworthy Educational Marketplace</h3>
                    <p>All records are immutable and publicly verifiable,
                        enforced and governed by digital contracts.
                    </p>
                </div>
            </div>
            <div class="md-layout-item md-medium-size-33 md-small-size-100">
                <div class="infobox">
                    <md-icon class="md-size-2x">supervisor_account</md-icon>
                    <h3>Personalised Curriculum</h3>
                    <p>Offer your students personalised, multi-disciplinary, cross-institutional curricula.
                        Sky is the limit.
                    </p>
                </div>
            </div>
            <div class="md-layout-item md-medium-size-33 md-small-size-100">
                <div class="infobox">
                    <md-icon class="md-size-2x">assignment_turned_in</md-icon>
                    <h3>Frictionless Evaluation and Feedback</h3>
                    <p>Peer execution of 
                        automatic assessments and marking schemes 
                        with clear learning objectives
                        </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "Login",
  data: function() {
    return {
      offline: false,
      cardFile: null,
      loading: false,
      welcome: false
    };
  },
  created: function() {},
  methods: {
    processFile: function(event) {
      this.cardFile = event.target.files[0];
    },
    submitCard: function(event) {
      const API = this.$config.API;
      const token = this.$config.Token;
      // spinner appears
      this.loading = true;
      // making formdata obj to post
      var formData = new FormData();
      formData.append("card", this.cardFile);
      // post
      fetch(API + "wallet/import", {
        method: "POST",
        body: formData,
        headers: new Headers({
          "X-Access-Token": token
        })
      })
        .then(response => {
          if (!response.ok)
            throw Error(response.status + " " + response.statusText);
          else {
            // set config uId
            this.$config.uId = this.cardFile.name.split(".")[0];

            fetch(
              API + "wallet/" + this.$config.uId + "%40moocon-beta/setDefault",
              {
                method: "POST",
                body: formData,
                headers: new Headers({
                  "X-Access-Token": token
                })
              }
            );
            vm.$data.loggedIn = true;
            // vm.$data.currentView = MyCourses;
            this.loading = false;
            this.welcome = true;
          }
        })
        .catch(error => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss">
.my-center {
  text-align: center;
}
#page {
}
.login {
  margin: 2% auto 5% auto;
  vertical-align: middle;
  max-width: 480px;
}
.infobox {
  text-align: center;
  padding: 32px;
}
</style>