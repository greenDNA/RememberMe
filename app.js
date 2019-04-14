const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
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

mongoose.connect("mongodb://localhost:27017/RememberMeDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


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

app.get("/profile", function(req, res){
    if(req.isAuthenticated()){
        res.render("profile");
    } else {
        //res.redirect("/login");
        res.send("Redirected from profile");
    }
})

app.post("/signup", function(req, res){
    console.log(req.body.userEmail, req.body.userPassword);
    User.register({username: req.body.userEmail}, req.body.userPassword, function(err, user){
        console.log("in register");
        if(err){
            console.log("error exists");
            console.log(err);
            res.redirect('/signup');
        } else {
            console.log("in else block");
            passport.authenticate("local")(req, res, function(){
                console.log("before redirect");
                res.redirect('/');
                console.log("after redirect");
                //   res.send("User found");
            });
            console.log("after authenticate");
        }
    })
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const email = req.body.userEmail;
    const password = req.body.userPassword;

    User.findOne({email: email}, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser.password === password){
                res.send("<h1>Found user successfully</h1>");
            } else {
                res.send("<h1>User was not found</h1>");
            }
        }
    });
});

app.listen(3000, function(){
    console.log("Listening on port 3000!");
});