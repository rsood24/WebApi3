var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });


router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);

            res.json(movies);
        });
    });

router.route('/addAmovie')
    .post(authJwtController.isAuthenticated, function(req, res) {
    var count = req.body.Actors.length;
    if(!req.body.Title) {
        res = res.status(500);
        res.json({success: false, msg: 'Please pass a Title for the Movie'});
    }
    else if(!req.body.Year) {
        res = res.status(500);
        res.json({success: false, msg: 'Please pass a Year for the Movie'});
    }
    else if(!req.body.Genre) {
        res = res.status(500);
        res.json({success: false, msg: 'Please pass a Genre for the Movie'});
    }
    else if(count < 3) {
        res = res.status(500);
        res.json({success: false, msg: 'Invalid amount of actors'});
    }
    else {
        var movie = new Movie();
        movie.Title = req.body.Title;
        movie.Year = req.body.Year;
        movie.Genre = req.body.Genre;
        movie.Actors = req.body.Actors;

        movie.save(function(err) {
            if(err) {
                res = res.status(500);

                if(err.code == 11000)
                    return res.json({ success: false, message: 'A movie with that Title already exists.'});
                else
                    return res.json(err);
            }

            res.json({message: 'Movie inserted!'});
        });

    }
});

router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            var movieJson = JSON.stringify(movie);
            // return that user
            res.json(movie);
        });
    });

router.route('/movies/:movieId/:review')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        var review = req.params.review;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            if(review.equals("true"))
            {
                var obj = new Object();
                var query = {Title: movie.title};
                Review.find(query).toArray(function(err, result) {
                    if(err) res.send(err);

                    obj.movie = movie;
                    obj.reviews = result;
                    var retObj = JSON.stringify(obj);
                    res.send(retObj);
                });
            }
            else
            {
                var movieJson = JSON.stringify(movie);
                // return that user
                res.json(movie);
            }

        });
    });


router.route('/movies/:movieId')
    .put(authJwtController.isAuthenticated, function (req,res) {
    var id = req.params.movieId;
    Movie.findById(id, function (err, movie) {
        if (err) res.send(err);
        movie.Title = req.body.Title;
        movie.Year = req.body.Year;
        movie.Genre = req.body.Genre;
        movie.Actors = req.body.Actors;

        movie.save(function(err) {
            if(err) {

                if(err.code == 11000)
                    return res.json({ success: false, message: 'A movie with that Title already exists.'});
                else
                    return res.json(err);
            }

            res.json({message: 'Movie Updated!'});
        })
    });
});

router.route('/movies/:movieId')
    .delete(authJwtController.isAuthenticated, function (req,res) {
   var id = req.params.movieId;
   Movie.count({}, function (err, count) {

       if(count <= 5) {

           res.json({success: false, message: 'At least 5 movies must be in the database'});
       }
       else {
           Movie.findById(id, function (err, movie) {
               if (err) res.send(err);

               movie.remove(function (err) {
                   if(err)
                       return res.json(err);
                   else
                       res.json({message: 'Movie Deleted'});

               });

           });
       }
   });


});

router.route('/review/:movieId')
    .post(authJwtController.isAuthenticated, function (req,res) {
       var id = req.params.movieId;
       Movie.findById(id, function (err, movie) {
           if (err) res.send(err);

           var review = new Review();
           review.movieid = id;
           review.name = req.body.name;
           review.quote = req.body.quote;
           review.rating = req.body.rating;

           if(req.body.rating > 5)
           {
               res.json({message: 'Invalid Rating'});
           }

           review.save(function(err) {
               if(err) {
                   res = res.status(500);

                   return res.json(err);
               }

               res.json({message: 'Review inserted!'});
           });

           });

    });



router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);