import Vue from 'vue'
import AllCourses from './AllCourses.vue'
import MyCourses from './MyCourses.vue'
import Historian from './Historian.vue'
import Login from './Login.vue'
import MySubs from './MySubs.vue'
import Customiser from './Customiser.vue'
import AC from './AC.vue'
import MyCerts from './MyCerts.vue'


import VueMaterial from 'vue-material'
import VueYouTubeEmbed from 'vue-youtube-embed'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

const vueConfig = require('vue-config')
// REPLACE configs.Token with your own access token from localhost:3000/auth/github
const configs = {
    API: 'http://localhost:3000/api/',
    Token: 'ynlitfQkuRU6b7SyiGFFS4Zu4P1mqcUUSTEtMo2OycI0n3BW76NIE16THrsOO135',
    uId: null
}
Vue.use(vueConfig, configs)
Vue.use(VueMaterial)
Vue.use(VueYouTubeEmbed)

var EmptyState = {
    template: '<md-empty-state md-icon="add_to_queue" md-label="Start your first course today!" md-description="">' +
        '<md-button class="md-primary md-raised">Sign Up</md-button></md-empty-state>'
}

// router
// const routes = {
//     '/': AllCourses,
//     '/mycourses': MyCourses
// }

var vm = new Vue({
    el: '#app',
    data: {
        currentRoute: window.location.pathname,
        currentView: Login,
        toolbarText: "Good Afternoon!",
        loggedIn: false,
        // notif: false,
        refocusProgress: false,
        networkEvents: []
    },
    created: function () {
        var socket = new WebSocket("ws://localhost:3000");
        socket.onmessage = function (event) {
            // this.notif = true;
            var obj = JSON.parse(event.data);
            var listItem;
            switch (obj.$class) {
                case "org.moocon.core.CourseModuleCompleted":
                    break;
                case "org.moocon.core.NewCertificate":
                    listItem = {
                        icon: "card_membership",
                        title: "New Certificate! Congratulations!",
                        sub: "ID" + obj.certId,
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.BalanceChanges":
                    listItem = {
                        icon: "show_chart",
                        title: "New Credit Balance: " + obj.newBalance + " (" +
                            (obj.newBalance - obj.oldBalance) + ")",
                        sub: "Related Course(s): " + obj.details,
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.SubmissionUploaded":
                    listItem = {
                        icon: "note_add",
                        title: "New Submission for " + obj.unitId,
                        sub: "Submission ID: " + obj.submission.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.ResultAvailable":
                    listItem = {
                        icon: "assignment_turned_in",
                        title: "Result Available for " + obj.unitId,
                        sub: "Submission ID: " + obj.submission.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.CurriculumProposed":
                    listItem = {
                        icon: "school",
                        title: "Curriculum Proposed",
                        sub: "Curriculum ID: " + obj.curriculum.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.CurriculumApproved":
                    listItem = {
                        icon: "school",
                        title: "Curriculum Approved",
                        sub: "Curriculum ID: " + obj.curriculum.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                default:
                    listItem = {
                        icon: "info_outline",
                        title: "New Event",
                        sub: "Lipsum",
                        p: obj.eventId,
                    }
                    break;
            }

            vm.$data.networkEvents.unshift(listItem)
            console.log(obj);
        }
    },
    methods: {
        // Course Catalogue md-list-item
        selectAllCourses: function (event) {
            this.toolbarText = "Course Catalogue"
            this.currentView = AllCourses
            // this.loggedIn = true
        },
        // Ongoing Courses md-list-item
        selectMyCourses: function (event) {
            if (this.loggedIn) {
                this.toolbarText = "Ongoing Courses"
                this.currentView = MyCourses
            }
        },
        // My Submissions md-list-item
        selectMySubmissions: function (event) {
            this.toolbarText = "My Submissions"
            this.currentView = MySubs
        },
        // My Curriculum md-list-item        
        selectMyCurriculum: function (event) {
            this.toolbarText = "My Curriculum"
            this.currentView = Customiser
        },
        // My Certificates md-list-item
        selectMyCerts: function (event) {
            this.toolbarText = "My Certificates"
            this.currentView = MyCerts
        },
        selectAC: function (event) {
            this.toolbarText = "Access Control"
            this.currentView = AC
        },
        selectHistorian: function (event) {
            this.toolbarText = "My History"
            this.currentView = Historian
        },
        refocus: function (event) {
            this.refocusProgress = true;
            const API = this.$config.API;
            const token = this.$config.Token;
            const uId = this.$config.uId;
            fetch(
                API + "wallet/" + this.$config.uId + "%40moocon-beta/setDefault",
                {
                    method: "POST",
                    // body: formData,
                    headers: new Headers({
                        "X-Access-Token": token
                    })
                }
            ).then(function () {
                setTimeout(function () {
                    vm.$data.refocusProgress = false;
                    vm.$data.loggedIn = true
                }, 500);
            })
        },
        // Log Out md-list-item
        logOut: function (event) {
            this.currentView = Login
            this.loggedIn = false
        }
    }

})

global.vm = vm;

/*
   \\\\
 _  ||||
 \`-'''|
  \   /
   \  \
    \  \
     \@dtylam
*/