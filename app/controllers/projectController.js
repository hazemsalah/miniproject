let Project = require('../models/Project');
let User = require('../models/User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router=require('../routes');
var curruser=router.curruser;
var current;
let projectController = {
    
   
    getAllProjects:function(req, res){
         console.log(current);
        Project.find(function(err, projects){
            
            if(err)
                res.send(err.message);
            else
                res.render('index', {projects});
        })
    },

    createProject:function(req, res){
        let project = new Project(req.body);
      
        project.save(function(err, project){
            if(err){
                res.send(err.message)
                console.log(err);
            }
            else{

                console.log(project);
                res.redirect('/portfolio');
            }
        })
    },
    home:function(req,res){
        res.render('home');
    },
    signup:function(req,res){
        res.render('signup');
    },
    signupsuccess:function(req,res){
        res.render('signupsuccess');
    },
    portfolio:function(req,res){
        res.render('index');
    }
   /* login:function(req,res){
  passport.authenticate('local', {successRedirect:'/portfolio', failureRedirect:'/',failureFlash: false}),
  function(req, res) {
    res.redirect('/portfolio');
  }},*/

    
     /*register:function(req, res){
        var name=req.body.name;
        var email=req.body.email;
         var username=req.body.username;
         var password = req.body.password;
         let user = new User();
         user.name=name;
         user.username=username;
         user.password=password;
         user.email=email;
              

        user.save(function(err, user){
            if(err){
                res.send(err.message)
                console.log(err);
            }
            else{

                console.log(user);
                res.redirect('/signupsuccess');
            }
        })
    }*/
}
   



module.exports = projectController;