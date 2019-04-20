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
    password: String
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
            res.render('home', {list: userList});
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
        res.render("profile", {username: req.user.username});
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

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/profile");
            });
        }
    });


    // const email = req.body.username;
    // const password = req.body.password;

    // User.findOne({email: email}, function(err, foundUser){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         if(foundUser.password === password){
    //             res.send("<h1>Found user successfully</h1>");
    //         } else {
    //             res.send("<h1>User was not found</h1>");
    //         }
    //     }
    // });
});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function(){
    console.log("Server has started successfully!");
});