require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const user = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { Storage } = require('@google-cloud/storage');
const util = require('util');
const { User, Receipt } = require('../database/models')
const isAuthenticated = require('../middleware/authController');

const { format } = util;

user.use(bodyParser.json());

const gc = new Storage({
    keyFilename: path.join(__dirname, process.env.GOOGLE_CREDENTIALS),
    projectId: 'splitit-277702'
})

const splitBucket = gc.bucket('splitit-bucket');

const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        // no larger than 100 mb.
        fileSize: 100 * 1024 * 1024,
    },
})

user.use(multerMid.single('file'));

const uploadImage = (file, id) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file

    const blob = splitBucket.file(id + '_' + originalname.replace(/ /g, "_"))
    const blobStream = blob.createWriteStream({
        resumable: false
    })
    blobStream.on('finish', () => {
        const publicUrl = format(
            `https://storage.googleapis.com/${splitBucket.name}/${blob.name}`
        )
        resolve(publicUrl)
    })
        .on('error', () => {
            reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)
})

// const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
// const s3 = new aws.S3({
//     endpoint: spacesEndpoint,
//     accessKeyId: process.env.ACCESS_KEY_ID,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY
// });

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'splitit',
//         acl: 'public-read-write',
//         key: (req, file, cb) => {
//             console.log(file)
//             cb(null, file.originalname);
//         }
//     })
// }).array('image', 1);

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
            res.status(404).json({ error: "No user exists." });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

/* GET /api/user/<id> - Gets all users 
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
user.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findAll();
        if (user) {
            res.status(200).send(user);
        }
        else {
            res.status(404).json({ error: "No user exists." });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

/* POST /api/user/<id>/upload - Saves uploaded image under given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY (form-data):
    - image: user selected image
*/
user.post('/:id/upload', isAuthenticated, async (req, res, next) => {
    try {
        
        const myFile = req.file
        const imageUrl = await uploadImage(myFile, req.params.id);

        // const url = `https://splitit.nyc3.digitaloceanspaces.com/${req.files[0].originalname}`
        const data = await Receipt.create({
            imageURL: imageUrl,
            uploadDate: Date.now(),
            userId: req.params.id
        })

        res.status(201).send(data);
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

/* POST /api/user/receipt/<id>/update - Update name of receipt
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY (form-data):
    - image: user selected image
*/

user.put('/receipt/:id/update', isAuthenticated, async (req, res, next) => {
    try {
        const response = await Receipt.update({
            name: req.body.name
        },
            { where: { id: req.params.id } }
        );
        if (response) {
            res.status(200).json({ message: "Updated name of receipt!" });
        }
        else {
            res.status(404).json({ error: "No receipt exists." });
        }
    } catch (err) {
        res.status(400).json({ error: err });
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
        if (!user) res.status(404).json({ error: "No user exists." })
        else {
            const receipts = await Receipt.findAll({
                where: { userId: req.params.id }
            })
            res.status(200).send(receipts)
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

/* PUT /api/user/<id>/picture - Updates user profile picture
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY (form-data):
    - image: user selected image
*/
user.put('/:id/picture', isAuthenticated, async (req, res, next) => {
    try {

        const myFile = req.file
        const imageUrl = await uploadImage(myFile, req.params.id);

        // const url = `https://splitit.nyc3.digitaloceanspaces.com/${req.files[0].originalname}`
        const user = await User.update({
            profilePicture: imageUrl
        },
            { where: { id: req.params.id } }
        );
        if (user) {
            res.status(200).json({ message: "Updated profile picture!" });
        }
        else {
            res.status(404).json({ error: "No user exists." });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

/* PUT /api/user/<id>/<balance> - Updates user balance
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
  BODY :
    - N/A
*/
user.put('/:id/:balance', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.update({
            balance: req.params.balance
        },
            { where: { id: req.params.id } }
        );
        if (!user) {
            res.status(404).json({ error: 'No user exists.' });
        }
        else {
            res.status(200).json({ message: 'Balance updated.' });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})
user.get('*', (req, res, next) => {
    res.status(200).json({ message: "Default User Route." });
})

module.exports = user;
