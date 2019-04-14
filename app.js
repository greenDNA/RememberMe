const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/RememberMeDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String
});

const User = mongoose.model("User", userSchema);

let userList; //list of users in database

app.get("/", function(req, res){
    userList = [];
    User.find(function(err, users){
        if(err){
            console.log(err);
        } else {
            users.forEach(user => {
                //console.log(user);
                userList.push(user);
            });
            console.log(userList);
            res.render('home', {list: userList});
        }
    });


});

app.get("/signup", function(req, res){
    res.render('signup');
});

app.post("/signup", function(req, res){
    const name = req.body.userName;
    const email = req.body.userEmail;
    const phone = req.body.userPhone;
    const password = req.body.userPassword;

    console.log(name, email, phone, password);

    const user = new User({
        name: name,
        email: email,
        phone: phone,
        password: password
    });

    user.save();

    res.send("<h1>Thank you for signing up!</h1>");
});

app.listen(3000, function(){
    console.log("Listening on port 3000!");
});