//jshint esversion:6
require("dotenv").config();
const express = require("express");
const articleRouter = require("./routes/articles");
const listRouter = require("./routes/todolist");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Article = require("./models/article");
const { ROLE, User, checkIsInRole } = require("./models/user");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();

app.use(express.static(__dirname + "/public/"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));




app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-kirmor:admin@cluster0.ka8dy5z.mongodb.net/blogDB");


passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  User.findById( _id, (err, user) => {
    if(err){
        done(null, false, {error:err});
    } else {
        done(null, user);
    }
  });
});

const homeStartingContent = "This is the greatest blog website that the humankind has ever created. Here you'll be able to find enchanting article and you'll even have a chance to write your own article! Try ot out. Developed by Bazvel.";


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id, role: ROLE.BASIC }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use("/articles", articleRouter);
app.use("/to-do-list", listRouter);

app.get("/", async (req, res)=>{
    const articles = await Article.find().sort({
        createdAt: 'desc'});
    if (!req.user) {req.user = ''; req.user.role = '';}
    res.render("articles/home", {articles: articles, startingContent: homeStartingContent, role: req.user.role});
});

app.get("/auth/google",
    passport.authenticate("google", { scope: ['profile'] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect
    req.session.loggedin = true
    res.redirect('/');
  });

app.get("/login", (req, res)=>{
    res.render("signin");
});

app.get("/register", (req, res)=>{
    res.render("signup");
});

app.get("/secrets" , checkIsInRole(ROLE.ADMIN), (req, res)=>{
    if (req.isAuthenticated()) res.render("secrets");
    else res.redirect("/login");
});

app.get("/logout", (req, res)=>{
    req.logout((err)=>{if(err) console.log(err);});
    res.redirect("/");
});

app.get("/todolist", (req, res)=>{
    if (req.isAuthenticated()) res.render("todolist");
    else res.redirect("/login");
});

app.post("/register", (req, res)=>{
    User.register({username: req.body.username, role: ROLE.BASIC}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, ()=>{
                req.session.loggedin = true
                res.redirect("/");
            });
        }
    })

});

app.post("/login", (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err)=>{
        if(err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, ()=>{
                
                req.session.loggedin = true
                res.redirect("/");
            });
        }
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started.");
});