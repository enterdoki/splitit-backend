const express = require('express');
const bodyParser = require('body-parser');
const invoice = express.Router();
const isAuthenticated = require('../middleware/authController');
const { User, Friend } = require('../database/models');

invoice.use(bodyParser.json());

const statuses = {
    ACCEPTED: 'ACCEPTED',
    PENDING: 'PENDING',
    BLOCKED: 'BLOCKED'
}

/* GET /api/invoice/request/<id_one>/<id_two> - Request payment from one user to another
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
    BODY:
    - balance: amount of money owed
*/
invoice.put('/request/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const checkOne = await Friend.findOne({
            where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.ACCEPTED }
        })
        const checkTwo = await Friend.findOne({
            where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.ACCEPTED }
        })

        // id one sends request for id two to pay back, we find id two as id one in table and set balance
        if (checkOne && checkTwo) {
            const balance = req.body.balance;
            const status = await Friend.update({
                balance: balance
            },
                { where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.ACCEPTED } }
            )
            if (status) {
                res.status(200).json({ message: "Sent payment request." });
            }
            else {
                res.status(400).json({ error: "Could not send payment request." });
            }
        }
        else {
            res.status(404).json({ error: 'Cannot find established friendship.' })
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: 'Unable to request payment.' })
    }
})

invoice.get('*', async (req, res, next) => {
    res.status(200).json({ message: "Default Invoice Route." });
})

module.exports = invoice;