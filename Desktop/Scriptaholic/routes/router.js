var express = require('express');
var moderator = require('./moderator.js');
var user = require('./user.js');
var admin = require('./admin.js');

var router = express.Router();

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})


router.get('/', (req, res) => {
    res.send('HOME');
});

router.use('/moderator', moderator);
router.use('/user', user);
router.use('/admin', admin);

module.exports = router;
