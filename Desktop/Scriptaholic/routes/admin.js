var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/database')
var Administrator = require('../models/Administrator')
var Moderator = require('../models/Moderator')
var Business = require('../models/Business')

//Register
router.post('/register', function(req, res, next) {
    let newAdmin = new Administrator({
        username: req.body.username,
        password: req.body.password,
        isSuper: req.body.isSuper
    });

    Administrator.addAdmin(newAdmin, (err, admin) => {
        if (err) {
            res.json({
                success: false,
                msg: 'Failed to register admin'
            });
        } else {
            res.json({
                success: true,
                msg: 'Admin registered'
            });
        }
    })
});

//Authenticate
router.post('/authenticate', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    Administrator.getAdministratorByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return res.json({
                success: false,
                msg: 'Admin not found'
            });
        }

        Administrator.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                var token = jwt.sign(admin, config.secret, {
                    expiresIn: 604800 //1 week
                });
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    admin: {
                        id: admin._id,
                        username: admin.username,
                        isSuper: admin.isSuper
                    }
                });
            } else {
                return res.json({
                    success: false,
                    msg: 'Wrong password'
                });
            }
        })
    })
});

//Get unregistered Moderators
router.get('/unregmoderators', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    Moderator.find({
        'status': 'unregistered'
    }, (err, moderators) => {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true,
                moderators: moderators
            })
        }
    })
})

//Update unregistered moderator status
router.post('/update/status', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    if (req.body.status == "accepted") {
        Moderator.findOne({
            'business_number': req.body.business_number
        }, (err, moderator) => {
            if (err) {
                res.json({
                    success: false
                })
            } else {
                let newBusiness = new Business({
                    username: moderator.business_name,
                    password: moderator.business_number,
                    email: moderator.email,
                    bank_account: moderator.bank_account,
                    name: moderator.business_name,
                    location: moderator.business_location,
                    business_number: moderator.business_number,
                    type: moderator.business_type,

                })
                console.log(newBusiness)
                
                Business.addBusiness(newBusiness, (err) => {
                    if (err) {
                        console.log(newBusiness);
                        res.json({
                            success: false
                        })
                    } else {
                        Moderator.update({
                            'business_number': req.body.business_number
                        }, {
                            $set: {
                                'status': 'accepted'
                            }
                        }, (err) => {
                            if (err) {
                                res.json({
                                    success: false
                                })
                            } else {
                                res.json({
                                    success: true
                                })
                            }
                        })
                    }
                })
            }
        })
    } else {
        Moderator.update({
            'business_number': req.body.business_number
        }, {
            $set: {
                'status': 'rejected'
            }
        }, (err) => {
            if (err) {
                res.json({
                    success: false
                })
            } else {
                res.json({
                    success: true
                })
            }
        })
    }
})

//Notify
router.post('/notify', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    for (i = 0; i < req.body.businesses.length; i++) {
        console.log(req.body.businesses[i])
        Business.update({
            'username': req.body.businesses[i]
        }, {
            $push: {
                notifications: req.body.notification
            }
        }, (err) => {
            if (err) {
                res.json({
                    success: false
                })
            } else {
                res.json({
                    success: true
                })
            }
        })
    }
})


module.exports = router;
