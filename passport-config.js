const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const getDb = require('./mongodb/mongodb').getDb;


module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: 'username' }, // Assuming the username field in the form is named 'username'
            async (username, password, done) => {
                const db = getDb();
                try {
                    const user = await db.collection('Users').findOne({username});


                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // how the users are stored in the session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // how the users are desirealized from the session

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.collection('Users').findOne({ _id: id }); // Assuming the ID is stored as _id in the table
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};