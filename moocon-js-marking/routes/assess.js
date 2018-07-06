var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());

/* POST */
router.post('/', function(req, res) {
  bodyParser
  // res.sendStatus(418);
});

/* GET: not allowed */
router.get('/', function(req, res) {
  res.sendStatus(405);
});

/* PUT: not allowed */
router.put('/', function (req, res) {
  res.sendStatus(405);
})

/* DELETE: not allowed */
router.delete('/', function (req, res) {
  res.sendStatus(405);
})

module.exports = router;
