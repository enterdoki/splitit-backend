require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const user = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { User, Receipt } = require('../database/models')
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
        acl: 'public-read-write',
        key: (req, file, cb) => {
            console.log(file)
            cb(null, file.originalname);
        }
    })
}).array('image', 1);

/* GET /api/user/<id> - Gets info of given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
user.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password'] }
        })
        if (user) {
            res.status(200).send(user);
        }
        else {
            res.status(404).send("No user exists.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* POST /api/user/<id>/upload - Saves uploaded image under given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY (form-data):
    - image: user selected image
*/
user.post('/:id/upload', [isAuthenticated, upload], async (req, res, next) => {
    try {
        const url = `https://splitit.nyc3.cdn.digitaloceanspaces.com/${req.files[0].originalname}`
        await Receipt.create({
            imageURL: url,
            uploadDate: Date.now(),
            userId: req.params.id
        })

        const body = {
            url: url
        }

        const result = await axios.post('https://api.taggun.io/api/receipt/v1/simple/url', body, {
            headers: {
                "Content-Type": "application/json",
                "apikey": process.env.TAGGUN_API_KEY
              }
        })

        res.status(201).send(result['data'])
    } catch (err) {
        res.status(400).send(err);
    }
})

/* GET /api/user/<id>/receipts - Get all receipts of given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
user.get('/:id/receipts', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id }
        })
        if (!user) res.status(404).send("No user exists.")
        else {
            const receipts = await Receipt.findAll({
                where: { userId: req.params.id }
            })
            res.status(200).send(receipts)
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* PUT /api/user/<id>/picture - Updates user profile picture
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY (form-data):
    - image: user selected image
*/
user.put('/:id/picture', [isAuthenticated, upload], async (req, res, next) => {
    try {
        const url = `https://splitit.nyc3.cdn.digitaloceanspaces.com/${req.files[0].originalname}`
        const user = await User.update({
            profilePicture: url
        },
            { where: { id: req.params.id } }
        );
        if (user) {
            res.status(200).send("Updated profile picture!" + user);
        }
        else {
            res.status(404).send("No user exists.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* PUT /api/user/<id>/<balance> - Updates user balance
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY :
    - N/A
*/
user.put('/:id/:balance', isAuthenticated, async(req, res, next) => {
    try {
        const user = await User.update({
            balance: req.params.balance
        },
            { where: { id: req.params.id } }
        );
        if(!user) {
            res.status(404).send('No user exists.');
        }
        else {
            res.status(200).send('Balance updated.' + user);
        }
    } catch(err) {
        res.status(400).send(err);
    }
})
user.get('*', (req, res, next) => {
    res.status(200).send("Default User Route.");
})

module.exports = user;
