var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
            clientID: "449924219156-jfirj3m00j10bsk3s76va5o0os3j7mvu.apps.googleusercontent.com",
            clientSecret:"YpYqdTsltUXtMTGDVnFVaIN_",
            callbackURL: "/login/google/callback",
            passReqToCallback   : true
        },
        function(request, accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                return done(null, profile);
            });
          }
        ));
          
};