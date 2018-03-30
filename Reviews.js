var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.connect(process.env.DB);

var ReviewSchema = new Schema({
    movieid: { type: String },
    name: String,
    quote: String,
    rating: {type: Number, required: true}
});

module.exports = mongoose.model('Review', ReviewSchema);