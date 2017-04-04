var express = require('express');
var Business = require('../models/Business')
var Activity = require('../models/Activity')
var Event = require('../models/Event')
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/database')
var Moderator = require('../models/Moderator');
var Business = require('../models/Business')
var multer = require('multer');
var upload = multer({
    dest: 'public/uploads/'
});
var path = require('path');
var async = require('async');


//Request an account
router.post('/register', (req, res) => {
    let newModerator = new Moderator({
        email: req.body.email,
        bank_account: req.body.bank_account,
        business_name: req.body.business_name,
        business_location: req.body.business_location,
        business_number: req.body.business_number,
        status: 'unregistered'
    })
    newModerator.save((err, moderator) => {
        if (err) {
            res.json({
                success: false,
                msg: 'Failed to register moderator'
            });
        } else {
            res.json({
                success: true,
                msg: 'Moderator registered'
            });
        }
    })
})

//Authenticate
router.post('/authenticate', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;


    Business.getBusinessByUsername(username, (err, business) => {
        if (err) throw err;
        if (!business) {
            return res.json({
                success: false,
                msg: 'Business not found'
            });
        }

        Business.comparePassword(password, business.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                var token = jwt.sign(business, config.secret, {
                    expiresIn: 604800 //1 week
                });
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    business: {
                        business
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
})

//Confirm Moderator
router.post('/confirm', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let business = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        business_name: req.body.business_name,
        location: req.body.business_location,
    }
    Business.updateBusiness(req.user.username, business, (err) => {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }

    });
});

/*
router.get('/locations', function(req, res) {

    async.series([
        function(callback) {
            currentbusiness = Business.findOne({
                business_name: business_name
            }, function(err, result) {
                if (err) {
                    callback(err);
                }
                currentbusiness = result;
                locations = result.location;
                callback();
            });

        },
        function(callback) {
            //console.log(locations);
            res.render('locations', {
                locations
            });
            callback();
        },

    ], function(err) {
        if (err) res.send(err.message);
        // res.render('index',{projects,img,currentuser});
    });


});
router.post('/addlocation',function(req,res){
   if (req.body.location.length==0){
       res.redirect('/moderator/locations');
   }
    else {*/
router.post('/addLocation', passport.authenticate('jwt', {
    session: false
}), function(req, res) {

    username = req.user.username;
    location: req.body.location;


    if (req.body.location.length == 0) {} else {

        Business.update({
            username: username
        }, {
            $addToSet: {
                location: req.body.location
            }
        }, function(err, result) {});

        res.json(req.body);
        //res.redirect('/moderator/locations');
    }
    res.json(req.body.location);

});

router.post('/deleteLocation', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    username = req.user.username;
    location: req.body.location;
    async.series([
        function(callback) {
            Business.findOne({
                username: username
            }, function(err, result) {
                if (err) {
                    callback(err);
                }
                currentbusiness = result;
                locations = result.location;
                callback();
            });

        },
        function(callback) {

            if (locations.length > 1)
                Business.update({
                    username: username
                }, {
                    $pull: {
                        location: req.body.location
                    }
                }, function(err, result) {});
        }
    ], function(err) {
        if (err) res.send(err.message);
        // res.render('index',{projects,img,currentuser});
    });



});
router.post('/editLocation', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    username = req.user.username;
    location: req.body.location;
    Business.update({
        username: username,
        location: req.body.location
    }, {
        $set: {
            "location.$": req.body.newlocation
        }
    }, function(err, result) {
        console.log(result);
    });
});

router.post('/setPayment', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    username = req.user.username;
    payment = req.body.payment;
    console.log(payment);
    console.log(username);
    Business.update({
        username: username
    }, {
        $addToSet: {
            payment_methods: {
                $each: payment
            }
        }
    }, function(err, result) {

    });


});
//--------------View All businesses and activities (NOT userstories)---------

router.get('/businesses', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Business.find({}, function(err, businesses) {
        var businessMap = {};

        businesses.forEach(function(business) {
            business.populate("theBusiness");
            businessMap[business._id] = business;
        });

        res.send(businessMap);
    });
});


router.get('/activities', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Activity.find({}, function(err, activities) {
        var activityMap = {};

        activities.forEach(function(activity) {
            activity.populate("theActivity");
            activityMap[activity._id] = activity;
        });

        res.send(activityMap);
    });
});


//-----------------View Moderator's business and activities----------------

router.post('/modBusiness', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Business.findOne({
        username: req.user.username
    }, function(err, business) {
        console.log(business);
        return res.send(business);
    });
})

router.post('/modActivities', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Activity.find({
        "modusername": req.user.username
    }, function(err, activity) {
        console.log(activity);
        return res.send(activity);
    });
})


//-----------------View a business' activities----------------
//---------------

router.post('/editBusiness', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Business.findOne({
        username: req.user.username
    }, function(err, business) {
        business.location = req.body.newLocation
        business.description = req.body.newDescription;
        business.business_name = req.body.newName;
        business.pictures = req.body.newPictures;
        business.website = req.body.newWebsite;
        //    console.log(req.body.newDescription);
        business.save(function(err) {
            if (err) {
                console.error('Error saving the new business information.');
                return res.send('Error saving the new business information.');
            }
            return res.send(business);
        });
    });
})


router.post('/addActivity', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var activity = new Activity();
    activity.modusername = req.user.username;
    activity.name = req.body.ActivityName;
    activity.capacity = req.body.ActivityCapacity;
    activity.images = req.body.ActivityImages;
    activity.payment = req.body.ActivityPayment;
    activity.discount.originalPrice = req.body.ActivityPayment;
    console.log("Activity created.");
    activity.save(function(err, activity) {
        if (err) {
            console.error('Error creating the activity.');
            return res.send('Error creating the activity.');
        }
        return res.send(activity);
    });

})


router.post('/editActivity', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Activity.findOne({
        "modusername": req.user.username,
        "name": req.body.ActivityName
    }, function(err, activity) {
        activity.name = req.body.newActivityName;
        activity.capacity = req.body.newCapacity;
        activity.images = req.body.newActivityImages;
        activity.payment = req.body.newActivityPayment;
        activity.discount.actualDiscount = 0;
        activity.discount.originalPrice = req.body.newActivityPayment;
        activity.save(function(err) {
            if (err) {
                console.error('Error saving the new activity information');
                return res.send('Error saving the new activity information');
            }
            return res.send(activity);
        })
    })
    res.render('test');
    console.log(email);

});
router.post('/discount', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    Activity.findOne({
        modusername: req.user.username,
        name: req.body.ActivityName
    }, function(err, activity) {
        theNewDiscount = req.body.newDiscount;
        activity.discount.actualDiscount = theNewDiscount;
        activity.payment = activity.discount.originalPrice - (activity.discount.originalPrice * (theNewDiscount / 100));
        activity.save(function(err) {
            if (err) {
                console.error('Error adding the discount.');
                return res.send('Error adding the discount.');
            }
            return res.send(activity);
        })
    })

});

router.get('/picturetest', function(req, res) {
    res.render('picturetest');

})


router.post('/addPicture', passport.authenticate('jwt', {
    session: false
}), upload.any(), function(req, res) {

    for (var i = 0; i < req.files.length; i++) {
        var str = req.files[i].path;

        Business.update({
            username: req.user.username
        }, {
            $addToSet: {
                pictures: str
            }
        }, function(err, result) {});

    }






});

/*
router.get('/logintry', notensureAuthenticated, function(req, res){
        res.render('logintry');


    });
    */

router.post('/addEvent', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let event = new Event({
        moderator_username: req.user.username,
        event_type: req.body.event_type,
        event_name: req.body.event_name,
        event_date: req.body.event_date
    })

    event.save((err) => {
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
})

router.get('/getAllEvents', passport.authenticate('jwt', {
    session: false
}), (req, res) => {


    Event.find(function(err, events) {

        if (err) {
            res.send(err.message);
        } else {
            res.send(events);
            console.log(events);
        }
    })


});


module.exports = router;

router.get('/picturetest', function(req, res) {
    res.render('picturetest');

})


router.post('/addPicture', passport.authenticate('jwt', {
    session: false
}), upload.any(), function(req, res) {

    for (var i = 0; i < req.files.length; i++) {
        var str = req.files[i].path;

        Business.update({
            username: req.user.username
        }, {
            $addToSet: {
                pictures: str
            }
        }, function(err, result) {});

    }


});

router.post('/viewReservations', function(req, res) {
    Booking.find({
        'mod_username': req.user.username
    }, function(err, bookings) {
        console.log(req.body)
        res.send(bookings);
    });
});

router.post('/viewRating', function(req, res) {

    Business.findOne({
        'username': req.user.username
    }, function(err, business) {
        totalNumberRating = business.rating.length;
        var Sum = 0;
        for (var i = 0; i < totalNumberRating; i++) {
            Sum = Sum + business.rating[i];
        }
        rating = Sum / totalNumberRating;
        res.send(rating);

        console.log(business.rating);
    });

});

router.post('/viewReviews', function(req, res) {

    Business.findOne({
        'username': req.user.username
    }, function(err, business) {

        res.send(business.reviews);
    });
});



module.exports = router;
