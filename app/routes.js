// require dependincies 
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var projectController = require('./controllers/projectController');
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
var currentuser;
let Project = require('./models/Project');
let User = require('./models/User');
let Portfolio = require('./models/Portfolio');
var multer  = require('multer')
var path = require('path');
var crypto=require('crypto');
var flash=require('flash');
var mime=require('mime');
var imgpath;
var img;
var portfolioName;
var firstprojectT;
var firstprojectW;
var projectT;
var projectW;


var async=require('async');
var storage = multer.diskStorage({
    
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
var upload = multer({ storage: storage });
//var upload = multer({ dest: 'app/uploads/' })

// add routes
router.get('/portfolio',ensureAuthenticated,function(req, res){
         console.log(currentuser);

    console.log('found');
  var tmp;
  async.series([ 
     function(callback){
         console.log(currentuser);
         Portfolio.findOne({username:currentuser},function(err,result){
        console.log(currentuser);

       console.log(result);
       tmp=result;
       
        if (err)
            return callback(err);
            // res.send(err.message);
  callback();  });
                       },

  function(callback){ 
      Project.find({username:currentuser},function(err, projects){
            if(err)
                return callback(err);
            // res.send(err.message);
            else
              
            {
                console.log(tmp);
               img= tmp.imgpath;
                console.log('ok');
             console.log(img);
               res.render('index',{projects,img,currentuser});
            
        }
          callback();});
      }],
      function(err){
      if (err)res.send(err.message);
     // res.render('index',{projects,img,currentuser});
  });
    });

router.get('/client',function(req, res){
    var check=0;
    var tmp;
    
        
        Portfolio.count(function (err, count) {
            if (count==0){
                res.render('Client2')
            }else
                {Portfolio.find(function(err, portfolios){

            if(err)
                res.send(err.message);
            else
                res.render('Client',{portfolios});
        });}
});

           });

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
        currentuser=req.user.username;
        projectController.current=req.user.username;
        console.log(currentuser);
		return next();
        
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/');
       
	}}


router.get('/', function(req,res){
        res.render('home',{ message: req.flash('loginMessage') });
    });
router.post('/project',upload.single('fileInput'),function(req, res){
        var project = new Project();
    var title = req.body.title;
    projectT=title;
    if (req.body.URL===undefined && req.file=== undefined ){
        return res.redirect('/portfolio')
    }
    if(req.body.URL===undefined){
        var work='uploads/'+req.file.filename;
        project.work=work;
        projectW=work;
    }
    else {if(req.file=== undefined){
        var URL= req.body.URL;
        project.work=URL;
        projectW=URL;
    }
         }
    
    project.title=title;
    project.username=currentuser;
    project.save(function(err, project){
            if(err){
                res.send(err.message)
                console.log(err);
            }
            else{
   console.log(project);
                console.log(currentuser);
               async.series([
                   function(callback){
                   Portfolio.update({username:currentuser},{$inc:{count:1}},function(err,result){
                       console.log("here");
                       console.log(result);
                   });
                       
                       callback();
                   },
                   
                     function (callback){ 
                     console.log(currentuser);
                     Portfolio.update({username:currentuser},{$push:{work:{title:projectT,work:projectW}}},function(err,result){
                       console.log("here===");
                        console.log(firstprojectT);
                        console.log(firstprojectW);
                       console.log(result);
                                  
                     
                   }); callback();
                         },
                   function(callback){console.log("hel")
                res.redirect('/portfolio');
                   callback();},
                
               ]) 
               
            }
        })
    
    });
router.get('/signup', function(req,res){
   var errors= [];
    console.log(errors);
        res.render('signup',{errors});
    });
router.post('/register', function(req, res){
     req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
    
	req.checkBody('password', 'Password is required').notEmpty();
    var errors = req.validationErrors();
    if(errors .length>0){
     return res.render('signup',{
			errors
		});
	
	}
    else{
        var name=req.body.name;
        var email=req.body.email;
         var username=req.body.username;
         var password = req.body.password;
         let newuser = new User();
         newuser.name=name;
         newuser.username=username;
         newuser.password=password;
         newuser.email=email;   
          User.createUser(newuser, function(err, user){
			if(err) 
            {
             return res.render('signup2',{
			message:"username Taken"
		});;}
			else {console.log(user);
                  res.redirect('/signupsuccess');}
		});
    
            
}
    });

router.get('/signupsuccess', projectController.signupsuccess);

passport.use(new LocalStrategy({
    passReqToCallback: true
},
  function(req,username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
       var message;
   	if(!user){
        console.log('ok');
         message="Unknown User";
        console.log(message);
   		return done(null, false,req.flash('loginMessage','Invalid Username'));
   	}
       

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
            curruser=user;
            console.log(user);
            req.login();
            
   		} else {
             console.log('dfok');
            message="Invalid password";
            console.log(message);
   			return done(null, false,req.flash('loginMessage','Invalid password'));
   		}
   	});
   });
  }));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
router.post('/login',
  passport.authenticate('local', {successRedirect:'/check', failureRedirect:'/',failureFlash: true}),
  function(req, res) {
    res.redirect('/check');
     req.login();
    
    req.isAuthenticated()=true;
   
    console.log(currentuser);
   
  });
router.get('/login', function(req, res){
	res.render('portfolio');
});
router.get('/welcome', ensureAuthenticated,function(req, res){
	res.render('welcome');
});
router.get('/logout', function(req, res){
	req.logout();
currentuser=null;

router.get('')
	res.redirect('/');
});
	router.get('/test1', function(req, res){
	res.render('test');
});

	router.post('/test', upload.any(),function(req, res){
	res.send(req.files);
    console.log(req.files);
});



router.get('/check',ensureAuthenticated,function(req,res){
    var checkeduser =  Portfolio.findOne({username:currentuser},function(err,result){
        console.log(currentuser);
         console.log(result);
        if (err){
             res.send(err.message);
        }
        if (result){
            console.log('a portfolio exists');
            res.redirect('/portfolio');
            
        }
        else {
            res.redirect('/welcome')
            console.log('no portfolio');
        }
    })});

router.post('/upload',upload.single('images'),  function(req, res) {

    portfolioName=req.body.name;
    if(req.file != undefined)
    imgpath = 'uploads/'+req.file.filename;
    else 
       imgpath = 'hantsuki-avatar.jpg';
   res.render('addProject');
});
    router.post('/addProject',upload.single('fileInput'),function(req,res){
        console.log('hell');
        console.log(req.body.link);
        
        console.log(req.file);
        
     
       console.log("test");
    console.log(req.file);
    console.log(img);
        var project = new Project();
    var title = req.body.title;
        
      if (req.body.link===undefined && req.file=== undefined ){
             console.log('====l===');
          return res.render('addProject');
           
    }
    if(req.body.link===undefined){
        var work='uploads/'+req.file.filename;
        firstprojectW=work;
        project.work=work;
        console.log('ok');
    }
    else {if(req.file=== undefined){
        var URL= req.body.link;
        project.work=URL;
        firstprojectW=URL;
    }
         }
    var title = req.body.projectTitle;
        firstprojectT=title;
      project.title=title;
    project.username=currentuser;
      
    project.save(function(err, project){
            if(err){
                return res.send(err.message)
                console.log(err);
            }
            else{
   console.log(project);
                  res.redirect('/addingsuccess');
            }
    })
  
}),
    router.post('/create',ensureAuthenticated,function(req,res){
   console.log('======');
        console.log(firstprojectT);
        console.log(firstprojectW);
    var portfolio=new Portfolio();
        portfolio.username=currentuser;
        portfolio.name=portfolioName;
     portfolio.work.title=firstprojectT;
 
        
        portfolio.imgpath= imgpath;
    portfolio.count=1;
    console.log(portfolio.count);
         console.log(portfolio.username);
    console.log(portfolio.name);
    console.log(portfolio.imgpath);
    
     async.series([ function (callback){
         portfolio.save(function(err, portfolio){
            if(err){
                return res.send(err.message);
                console.log(err);
            }
            else{
   console.log(portfolio);
              callback();    
               
            }
    });
     },
                 function (callback){ 
                     console.log(currentuser);
                     Portfolio.update({username:currentuser},{$push:{work:{title:firstprojectT,work:firstprojectW}}},function(err,result){
                       console.log("here===");
                        console.log(firstprojectT);
                        console.log(firstprojectW);
                       console.log(result);
                          res.redirect('/portfoliosuccess');            
                     
                   }); callback();
                         }
                  ]);
    
    
    });

router.get('/portfoliosuccess',ensureAuthenticated,function(req,res){
    res.render('portfoliosuccess');
});
router.get('/addingsuccess',ensureAuthenticated,function(req,res){
    res.render('addingsuccess');
});
router.get('/createPortfolio',ensureAuthenticated,function(req,res){
    res.render('createPortfolio');
   
    });//momken tetcheck 3ala kda fel login 3ashan teshoof tefta7lo anhy page 
  
    


// export router

module.exports = router;