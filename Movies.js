var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/movies');

// movie schema

var ActorSchema = new Schema({
    ActorName: { type: String, required: true},
    CharacterName: { type: String, required: true}
});

var MovieSchema = new Schema({
    Title: { type: String, required: true },
    Year: {type: Number, required: true },
    Genre: { type: String, required: true },
    Actors: [ActorSchema],
    

});