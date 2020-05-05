const express = require('express');
const bodyParser = require('body-parser');
const search = express.Router();
const { User } = require('../database/models');
const isAuthenticated = require('../middleware/authController');
const Op = require('sequelize').Op;

search.use(bodyParser.json());

/* GET /api/search/<email> - Search all users except id
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
search.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findAll({ where: { id: { [Op.ne]: req.params.id } } })
        if (user) {
            res.status(200).send(user);
        }
        else {
            res.status(404).json({ error: "No users found." });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
})

search.get('*', isAuthenticated, async (req, res, next) => {
    res.status(200).json({ message: "Default Search Route." });
})

module.exports = search;