require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const user = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bcrypt = require('bcrypt');
const {check, validationResult } = require('express-validator');
const {User, Receipt} = require('../database/models')

user.use(bodyParser.json());

const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'splitit',
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file)
            cb(null, file.originalname);
        }
    })
}).array('image', 1);

user.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findOne({
            where : { id: req.params.id}
        })
        res.status(200).send(user);
    } catch(err) {
        res.status(400).send(err);
    }
})

user.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                let payload = { email: user.email };
                let token = jwt.sign(payload, 'splititAPI');
                res.status(200).send({ user, token });
            } else {
                res.status(400).send('Password is incorrect.');
            }
        }
        else {
            res.status(400).send('Credentials invalid.');
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

user.post('/register',
    [check('email').isEmail(),
    check('firstname').isLength({ min: 1 }),
    check('lastname').isLength({ min: 1 }),
    ], async (req, res, next) => {

        try {
            let firstname = req.body.firstname
            firstname = firstname[0].toUpperCase() + firstname.substr(1)
            let lastname = req.body.lastname
            lastname = lastname[0].toUpperCase() + lastname.substr(1)
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() })
            }
            else {
                let hash_password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
                let new_user = await User.create({
                    firstname: firstname,
                    lastname: lastname,
                    email: req.body.email,
                    password: hash_password
                });
                res.status(201).send(new_user);
            }
        } catch (err) {
            res.status(400).send(err);
        }
    })

user.post('/:id/upload', upload, async (req, res, next) => {
    try {
        const url = `https://splitit.nyc3.cdn.digitaloceanspaces.com/${req.files[0].originalname}`
        let new_receipt = await Receipt.create({
            imageURL: url,
            uploadDate: Date.now(),
            userId: req.params.id  
        })
        res.status(201).send(new_receipt)
    } catch (err) {
        res.status(400).send(err);
    }
})

user.get('/:id/receipts', async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {id: req.params.id}
        })
        if(!user) res.status(400).send("User not found.")
        else {
            const receipts = await Receipt.findAll({
                where: {userId: req.params.id}
            })
            res.status(200).send(receipts)
        }
    } catch(err) {
        res.status(400).send(err);
    }
})

user.get('*', (req, res, next) => {
    res.status(200).send("This is the default User Route.");
})

module.exports = user;