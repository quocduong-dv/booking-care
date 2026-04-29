import db from '../models/index';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
const { Sequelize } = require('sequelize');
require("dotenv").config();
import passport from 'passport';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"

},
    async (accessToken, refeshToken, profile, done) => {
        try {
            let email = profile.emails[0].value;
            let [user, created] = await db.User.findOrCreate({
                where: { email: email },
                defaults: {
                    email: email,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    roleId: 'R3',
                    // password field might be needed or handled as nullable for google auth
                    password: 'google-auth-no-password',
                }
            });
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));