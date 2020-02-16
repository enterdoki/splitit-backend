require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const user = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const {User, Receipt} = require('../database/models')
const isAuthenticated = require('../middleware/authController');

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

user.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where : { id: req.params.id}
        })
        res.status(200).send(user);
    } catch(err) {
        res.status(400).send(err);
    }
})

user.post('/:id/upload', [isAuthenticated, upload], async (req, res, next) => {
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

user.get('/:id/receipts', isAuthenticated, async (req, res, next) => {
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