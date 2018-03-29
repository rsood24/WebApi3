var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.connect(process.env.DB);

// movie schema

var ActorSchema = new Schema({
    ActorName: { type: String, required: true},
    CharacterName: { type: String, required: true}
});

var ReviewSchema = new Schema({
    title: { type: String, required: true},
    name: String,
    quote: String,
    rating: {type: Number, required: true}
});

var MovieSchema = new Schema({
    Title: { type: String, required: true },
    Year: { type: Number, required: true },
    Genre: {
        type: String,
        enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'],
        required: true
    },
    Actors: [ActorSchema]
});

/*
MovieSchema.pre('save', function(next) {

    var movie = this;

    var size = movie.Actors.length;

    if(size > 3 || size < 3)
    {
        var err = new Error({message:'Invalid actor count'});
        return next(err);
    }

    return next();
});
*/

module.exports = mongoose.model('Movie', MovieSchema);