require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const auth = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const {User} = require('../database/models')

auth.use(bodyParser.json());

/* POST /api/auth/login/ - Log In with User Credentials
EXPECTS:
  HEADERS:
    - N/A
  BODY:
    - email: email of new user 
    - password: password of new user 
*/
auth.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { email: req.body.email }
        });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                let payload = { email: user.email };
                let token = jwt.sign(payload, process.env.JWT_SECRET);
                res.status(200).send({ user, token });
            } else {
<<<<<<< HEAD
                res.status(422).send('Password is incorrect.');
=======
                res.status(200).send('Password is incorrect.');
>>>>>>> 4bbadce736c57d5c9939848058833b6734203792
            }
        }
        else {
            res.status(422).send('Credentials invalid.');
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* POST /api/auth/register/ - Register a new user
EXPECTS:
  HEADERS:
    - N/A
  BODY:
    - firstname: firstname of new user 
    - lastname: lastname of new user 
    - email: email of new user
    - password: password of new user
*/
auth.post('/register',
    [check('email').isEmail(),
    check('firstname').isLength({ min: 1 }),
    check('lastname').isLength({ min: 1 }),
    ], async (req, res, next) => {

        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() })
            }
            const check = await User.findOne({
                where: { email: req.body.email}
            })
            if(check) {
                res.status(422).send("Email already exists.");
            }
            else {
                let firstname = req.body.firstname
                firstname = firstname[0].toUpperCase() + firstname.substr(1)
                let lastname = req.body.lastname
                lastname = lastname[0].toUpperCase() + lastname.substr(1)
                const hashPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
                const url = "https://splitit.nyc3.cdn.digitaloceanspaces.com/default_picture.png";
                let new_user = await User.create({
                    firstName: firstname,
                    lastName: lastname,
                    email: req.body.email,
                    password: hashPassword,
                    profilePicture: url
                });
                res.status(201).send(new_user);
            }
        } catch (err) {
            res.status(400).send(err);
        }
    })

auth.get('*', (req, res, next) => {
    res.status(200).send("Default Auth route.");
})

module.exports = auth;
