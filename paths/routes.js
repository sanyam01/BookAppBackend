
const getDb = require('../mongodb/mongodb').getDb;
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');
const isAuth = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = function (app, upload) {

    app.get('/books', async (req, res) => {
        const db = getDb();

        try {
            let arrBooks = await db.collection('Books').find().toArray();
            res.send(arrBooks);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    });

    app.get('/orders', isAuth, async (req, res) => {
        const db = getDb();
        const { userID } = req.query;
        try {
            let arrOrders = await db.collection('Orders').find({ userID: userID }).toArray();
            res.send(arrOrders);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    });

    app.get('/images', async (req, res) => {
        const db = getDb();
        const { userID } = req.query;
        try {
            let arrImages = await db.collection('Images').find().toArray();

            // Map the image paths to base64 encoded data
            const imagesData = await Promise.all(
                arrImages.map(async (image) => {
                    const imagePath = path.join(__dirname, image.imagePath);
                    const imageBuffer = await fs.promises.readFile(imagePath);
                    const base64Data = imageBuffer.toString('base64');
                    return { id: image.id, image: base64Data };
                })
            );

            res.send(imagesData);
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

    app.post('/addImage', isAuth, upload.single('file'), async (req, res) => {

        if (!req.file) {
            return res.status(400).json({ error: 'Image file not received.' });
        }

        const imagePath = '/uploads/' + req.file.filename;

        // Assuming you want to save the image data to the 'Images' collection in MongoDB
        try {
            const db = getDb();
            const imageEntry = { id: req.body.id, imagePath: imagePath };
            await db.collection('Images').insertOne(imageEntry);
            res.status(200).json({ message: 'Image uploaded and saved successfully.', image: imageEntry });
        } catch (error) {
            console.error("Error saving image to database:", error);
            res.status(500).json({ error: 'Internal error while saving image to the database.' });
        }
    });

    app.post('/addOrder', isAuth, async (req, res) => {
        const db = getDb();

        db.collection('Orders').insertOne(req.body).then(() => {
            res.status(200).send(req.body);
        }).catch(() => {
            res.status(500).send("internal error while adding order");
        });

    });



    app.post('/editBook', isAuth, async (req, res) => {
        const db = getDb();
        console.log("req.body", req.body);
        db.collection('Books').updateOne({ id: req.body.id }, {
            $set: {
                name: req.body.name,
                author: req.body.author,
                image: req.body.image,
                description: req.body.description,
                price: req.body.price,
                categoryID: req.body.categoryID,

            }
        }).then(() => {
            res.status(200).send(req.body);
        }).catch((err) => {
            res.status(502).send("internal error while updating book");
        });

    });

    app.post('/editImage', isAuth, async (req, res) => {
        const db = getDb();
        console.log("req.body", req.body);
        db.collection('Images').updateOne({ id: req.body.id }, {
            $set: {
                image: req.body.image,
            }
        }).then(() => {
            res.status(200).send(req.body);
        }).catch((err) => {
            res.status(502).send("internal error while updating book");
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
        const { username, password, userID } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            username,
            password: hashedPassword,
            userID: userID
        };
        db.collection('Users').insertOne(newUser).then(() => {
            res.status(200).send({ username: username });
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
                { username: username, userID: existingUser.userID },
                'secret-key'
            );
        } catch (err) {
            res.status(501).send(err);
        }
        console.warn("existingUser", existingUser);

        res.status(200).send({
            username: username,
            userID: existingUser[0].userID,
            token: token
        });
    });
}

