require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const user = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

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

user.get('/', (req, res, next) => {
    res.status(200).send("User Route.");
})

user.post('/upload', async (req, res, next) => {
    try {
        await upload(req, res, (err) => {
            if (err) {
                res.status(400).send("Error")
            }
            const url = `https://splitit.nyc3.cdn.digitaloceanspaces.com/${req.files[0].originalname}`
            res.status(200).send(url)
        })
    } catch (err) {
        res.status(400).send(err);
    }


})

module.exports = user;