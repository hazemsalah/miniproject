var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var autoIncrement = require('mongoose-auto-increment');
var server = require('../../server');
var connection = server.connection;
autoIncrement.initialize(server.connection);



var BookingSchema = new Schema({
    email: { //            change to client username
        type: String,
        required: true,
        unique: true
    },
    business_username: {
        type: String,
        required: true
    },
    booking_number: {
        type: Number
    },
    activity: {
        type: String,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    number_of_persons: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    }
    time: {
        Date
    },
    isEvent: {
        type: Boolean
    },

});

BookingSchema.plugin(autoIncrement.plugin, {
    model: 'Booking',
    field: 'booking_number'
})



module.exports = mongoose.model('Booking', BookingSchema);
