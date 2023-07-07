
const getDb = require('../mongodb/mongodb').getDb;
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');
const isAuth = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    app.get('/books', async (req, res) => {
        const db = getDb();

        try {
            let arrBooks = await db.collection('Books').find().toArray();
            console.log("arrBooks", arrBooks);
            res.send(arrBooks);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    });


    app.post('/addBook', isAuth, async (req, res) => {
        const db = getDb();

        db.collection('Books').insertOne(req.body).then(() => {
            res.status(200).send(req.body);
        }).catch(() => {
            res.status(500).send("internal error while adding book");
        });

    });

    app.post('/deleteBook', isAuth, async (req, res) => {
        const db = getDb();
        console.log("book", req.body);
        db.collection('Books').deleteOne({ name: req.body.name }).then(() => {
            res.status(200).send(req.body);
        }).catch(() => {
            res.status(500).send("internal error while adding book");
        });

    });

    app.post('/signup', async (req, res) => {
        const db = getDb();
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            username,
            password: hashedPassword
        };
        db.collection('Users').insertOne(newUser).then(() => {
            let token = "";
            token = jwt.sign({ username: username }, 'secret-key');
            res.status(200).send({ username: username, token });
        }).catch((err) => {
            console.log("error", err);
            res.status(500).send("Internal error while adding user");
        })
    });


    app.post('/login', async (req, res) => {
        const db = getDb();

        const { username, password } = req.body;
        let existingUser = null;
        try {
            existingUser = await db.collection('Users').find({ username: username }).toArray();
            console.warn("existingUser", existingUser);
            if (!existingUser) {
                res.status(501).send("Invalid credentials");
                return;
            }
        } catch (err) {
            res.status(500).send(err);
            return;
        }

        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, existingUser[0].password);
        }
        catch (err) {
            res.status(500).send(err);
            return;
        }

        if (!isValidPassword) {
            res.status(501).send("Invalid Credentials");
            return;
        }

        let token;
        try {
            token = jwt.sign(
                { username: username },
                'secret-key'
            );
        } catch (err) {
            res.status(501).send(err);
        }

        res.status(200).send({
            username: username,
            token: token
        });
    });
}

