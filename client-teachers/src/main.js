//npm installs
import Vue from 'vue'
import VueMaterial from 'vue-material'
// import VueRouter from 'vue-router';
import VueYouTubeEmbed from 'vue-youtube-embed'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/black-green-light.css'

// import self defined components
import MyCourses from './MyCourses.vue'
import Approver from './Approver.vue'
import Historian from './Historian.vue'
import Login from './Login.vue'
import AllCourses from './AllCourses.vue'
import MySubs from './MySubs.vue'
import SignCert from './SignCert.vue'

const vueConfig = require('vue-config')
// REPLACE configs.Token with your own access token from localhost:3000/auth/github
const configs = {
    API: 'http://localhost:3000/api/',
    Token: 'SnEJ8tX7Jwo2B8hEDDm1js1jcsjy9GgGWktyrC55L77NMKYADKUDaBOJB2M5ZQYF',
    uId: "T01"
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
                case "org.moocon.core.BalanceChanges":
                case "org.moocon.core.ResultAvailable":
                    break;
                case "org.moocon.core.NewCertificate":
                    listItem = {
                        icon: "card_membership",
                        title: "New Certificate awaiting signature",
                        sub: "ID" + obj.certId,
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    break;
                case "org.moocon.core.SubmissionUploaded":
                    if (obj.teacherId == vm.$config.uId) {
                        listItem = {
                            icon: "note_add",
                            title: "New Marking Request for " + obj.unitId,
                            sub: "Submission ID: " + obj.submission.split("#")[1],
                            p: obj.timestamp + "; Address: " + obj.eventId,
                        }
                        vm.$data.networkEvents.unshift(listItem)
                    }
                    break;
                case "org.moocon.core.CourseModuleCompleted":
                    listItem = {
                        icon: "card_membership",
                        title: "Certificate Pending for " + obj.modId,
                        sub: "Submission ID: " + obj.submission.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    vm.$data.networkEvents.unshift(listItem)
                    break;
                case "org.moocon.core.CurriculumProposed":
                    listItem = {
                        icon: "school",
                        title: "Curriculum Proposed",
                        sub: "Curriculum ID: " + obj.curriculum.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    vm.$data.networkEvents.unshift(listItem)
                    break;
                case "org.moocon.core.CurriculumApproved":
                    listItem = {
                        icon: "school",
                        title: "Curriculum Approved",
                        sub: "Curriculum ID: " + obj.curriculum.split("#")[1],
                        p: obj.timestamp + "; Address: " + obj.eventId,
                    }
                    vm.$data.networkEvents.unshift(listItem)
                    break;
                default:
                    listItem = {
                        icon: "info_outline",
                        title: "New Event",
                        sub: "Lipsum",
                        p: obj.eventId,
                    }
                    vm.$data.networkEvents.unshift(listItem)
                    break;
            }

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
                this.toolbarText = "My Courses"
                this.currentView = MyCourses
            }
        },
        // My Submissions md-list-item
        selectMySubmissions: function (event) {
            this.toolbarText = "Marking Requests"
            this.currentView = MySubs
        },
        // My Curriculum md-list-item        
        selectApprover: function (event) {
            this.toolbarText = "Curriculum Requests"
            this.currentView = Approver
        },
        // Gen Certificates md-list-item
        selectGenCert: function (event) {
            this.toolbarText = "Review Certificates"
            this.currentView = SignCert
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
            // var self = this;
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
        },

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