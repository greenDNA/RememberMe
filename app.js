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
    _id: Number,
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render('home', {});

})

app.get("/signup", function(req, res){
    res.render('signup');
});

app.post("/signup", function(req, res){
    res.send("<h1>Thank you for signing up!</h1>")
});

app.listen(3000, function(){
    console.log("Listening on port 3000!");
});