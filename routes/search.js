const express = require('express');
const bodyParser = require('body-parser');
const search = express.Router();
const {User} = require('../database/models');
const isAuthenticated = require('../middleware/authController');

search.use(bodyParser.json());

/* GET /api/search/<email> - Search for a user by email
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
search.get('/:email', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email : req.params.email}})
        if(user) {
            res.status(200).send(user);
        }
        else {
            res.status(404).send("No user exists.");
        }
    } catch(err) {
        res.status(400).send(err);
    }
})

search.get('*', isAuthenticated, async (req, res, next) => {
    res.status(200).send("Default Search Route.");
})

module.exports = search;