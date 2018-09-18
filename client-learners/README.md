# moocon_learner_client

> Demonstration purposes ONLY, built with Vue.js
> It is understood that the login protocols of this application is not necessarily securely built.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

Copied from the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Helpful browser console commands

Force the full navbar to show:
```
vm.$data.loggedIn = true
```

Force login skipping the login page (equiv to API call of post /wallet/{name}/setDefault):
```
vm.$config.uId = "T01"
```
Then click the "Refocus Session (dev)" button on the side navbar.