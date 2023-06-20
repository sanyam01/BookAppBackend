
const getDb = require('../mongodb/mongodb').getDb;
const mongodb = require('mongodb');

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


    app.post('/addBook', async (req, res) => {
        const db = getDb();

        db.collection('Books').insertOne(req.body).then(() => {
            res.status(200).send(req.body);
        }).catch(() => {
            res.status(500).send("internal error while adding book");
        });

    });

    app.post('/deleteBook', async (req, res) => {
        const db = getDb();
        console.log("book", req.body);
        db.collection('Books').deleteOne({name:req.body.name}).then(() => {
            res.status(200).send(req.body);
        }).catch(() => {
            res.status(500).send("internal error while adding book");
        });

    });
}

