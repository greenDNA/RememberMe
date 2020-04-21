/**
 * @ALERT_SERIOUS
 * When working with passport, you must have the field being taken from an html form via body-parser be named
 * "username", any other name from "username" will result in "bad request" error after running
 * passport.authenticate() from within mongoose.model.register() function
 * Frustrating, have to google and search for answers and read documentation for
 * passport, passport-local, passport-local-mongoose, express-session
 * read documentation for the above ^^^
 * 
 * Saw this error in terminal
 * { MissingUsernameError: No username was given
    at Promise.resolve.then (/home/trayvont/Development/Websites/RememberMe/node_modules/passport-local-mongoose/index.js:232:17)
  name: 'MissingUsernameError',
  message: 'No username was given' }
 * I did supply a username, it just wouldnt acknowledge it for some reason
 * I submitted {username: req.body.name/email/userName}
 * If I don't submit {username: username} it gives an error
 * 
 * 
 * @Note
 * Setting a field to equal 'undefined' will remove it from displaying when console.log is performed
 */

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
//app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// for local database connection
// mongoose.connect("mongodb://localhost:27017/RememberMeDB", {useNewUrlParser: true});

// for mongodb atlas database connection
mongoose.connect("mongodb+srv://admin-york:Test-123@cluster0-bwaoj.mongodb.net/RememberMeDB", {useNewUrlParser: true});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    bio: String,
    name: String,
    phone: Number
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let userList; //list of users in database

app.get("/", function(req, res){
    userList = [];
    User.find(function(err, users){
        if(err){
            console.log(err);
        } else {
            users.forEach(user => {
                console.log(user);
                userList.push(user);
            });
            console.log(req.user);
            res.render('home', {list: userList, user: req.user});
        }
    });


});

app.get("/signup", function(req, res){
    res.render('signup');
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.get("/profile", function(req, res){
    if(req.isAuthenticated()){
        res.render("profile", {user: req.user});
    } else {
        res.redirect("/login");
    }
});

app.post("/signup", function(req, res){
    //username must be used in both fields, bug? bad request otherwise
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect('/signup');
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect('/profile');
                //   res.send("User found");
            });
        }
    })
});

/**
 * Error when user enters incorrect login information
 * How to handle that situation?
 */
app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    try {
        req.login(user, function(err){
            if(err){
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/profile");
                });
            }
        });
    } catch (error) {
        res.redirect("/login");
    }
    
});

app.post("/profile", function(req, res){
    const submitted = req.body.traitUpdater; // Rename this to submittedUpdate or so
    const button = req.body.biobutton;
    
    const updater = req.body.updateSelector; // Uses select and option tags to decide which field to update for a user

    console.log(button);
    console.log(updater); // value of select option menu here

    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                if(updater === 'bio'){
                    console.log('in bio selector');
                    if(submitted == ''){ // Rename submittedBio ti submittedUpdate or so
                        foundUser.bio = undefined; // Setting to undefined removes the value, and 'hides' data from displaying
                    } else {
                        foundUser.bio = submitted;
                    }
                } else if (updater === 'phone'){
                    console.log('in phone selector');
                    if(submitted == ''){ // Rename submittedBio ti submittedUpdate or so
                        foundUser.phone = undefined; // Setting to undefined removes the value, and 'hides' data from displaying
                    } else {
                        foundUser.phone = submitted;
                    }
                } else if (updater === 'name'){
                    console.log('in name selector');
                    if(submitted == ''){ // Rename submittedBio ti submittedUpdate or so
                        foundUser.name = undefined; // Setting to undefined removes the value, and 'hides' data from displaying
                    } else {
                        foundUser.name = submitted;
                    }
                }
                foundUser.save(function(){
                    res.redirect("/profile");
                });
            }
        }
    });
});

let port = process.env.PORT;

if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function(){
    console.log("Server has started successfully!");
});