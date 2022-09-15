const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const ROLE = {
    ADMIN: "admin",
    BASIC: "basic"
};


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    role: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const checkIsInRole = (...roles) => (req, res, next) => {
    if (!req.user) {
    return res.redirect('/login')
    }
    const hasRole = roles.find(role => req.user.role === role)
    if (!hasRole) {
    return res.redirect('/login')
    }

    return next()
}

module.exports = {
    ROLE: ROLE,
    User: new mongoose.model("User", userSchema),
    checkIsInRole: checkIsInRole
};