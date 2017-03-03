var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var userSchema = mongoose.Schema({ 
    name: String,
    username: { 
        type:String,
        required:true, 
        unique:true,
              },
    email: String, 
    password: { type:String ,
              required:true,
              }
})
userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};


var User = mongoose.model("myuser", userSchema);

module.exports = User;

module.exports.createUser = function(newuser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newuser.password, salt, function(err, hash) {
	        newuser.password = hash;
	        newuser.save(callback);
            
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}