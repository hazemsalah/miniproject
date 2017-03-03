var mongoose = require('mongoose');

var Project= require('./Project');

var portfolioSchema = mongoose.Schema({
   username:{
        type:String,
        required:true, 
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    imgpath:String,
    count:Number,
    work:[{
    title:{
        type:String,
        required:true, 
        unique:true
    },
    work:{
        type:String,
        required:true
    }
   
}]
    
});


var Portfolio = mongoose.model("portfolio", portfolioSchema);

module.exports = Portfolio;