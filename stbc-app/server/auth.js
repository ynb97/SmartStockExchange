var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
            clientID: "276663469810-2rn481blntu7sb6nnsqn252bjsulq23r.apps.googleusercontent.com",
            clientSecret:"XDkPsSkNKKIU0kQC9ColXR_c",
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