const express = require('express');
const bodyParser = require('body-parser');
const friend = express.Router();
const isAuthenticated = require('../middleware/authController');
const { User, Friend } = require('../database/models');

friend.use(bodyParser.json());

const statuses = {
    ACCEPTED: 'ACCEPTED',
    PENDING: 'PENDING',
    BLOCKED: 'BLOCKED'
}

/* GET /api/friend/status/<id_one>/<id_two> - Gets friendship status of two user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.get('/status/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const users = await Friend.findOne({
            where: { userOneId: req.params.id_one, userTwoId: req.params.id_two }
        })

        if (users) {
            res.status(200).json({ status: users.status });
        }
        else {
            res.status(404).send("No friendship status.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* GET /api/friend/<id>/ - Gets all friends of a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const users = await Friend.findAll({
            where: { userOneId: req.params.id, status: statuses.ACCEPTED },
            include: [{
                model: User,
                as: 'userTwo',
                attributes: { exclude: ['password'] }
            }],
            attributes: { exclude: ['id', 'status', 'userOneId', 'userTwoId'] }
        })

        if (users) {
            res.status(200).send(users);
        }
        else {
            res.status(404).send("No friends.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* GET /api/friend/<id>/pending - Gets all pending friend requests of a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.get('/:id/pending', isAuthenticated, async (req, res, next) => {
    try {
        const users = await Friend.findAll({
            where: { userOneId: req.params.id, status: statuses.PENDING },
            include: [{
                model: User,
                as: 'userTwo',
                attributes: { exclude: ['password'] }
            }],
            attributes: { exclude: ['id', 'status', 'userOneId', 'userTwoId'] }
        })

        if (users) {
            res.status(200).send(users);
        }
        else {
            res.status(404).send("No pending friend requests.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* GET /api/friend/<id>/blocked - Gets all blocked friends of a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.get('/:id/blocked', isAuthenticated, async (req, res, next) => {
    try {
        const users = await Friend.findAll({
            where: { userOneId: req.params.id, status: statuses.BLOCKED },
            include: [{
                model: User,
                as: 'userTwo',
                attributes: { exclude: ['password'] }
            }],
            attributes: { exclude: ['id', 'status', 'userOneId', 'userTwoId'] }
        })

        if (users) {
            res.status(200).send(users);
        }
        else {
            res.status(404).send("No blocked friends.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* POST /api/friend/request/<id_one>/<id_two> - Sends a friend request from given user to another user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.post('/request/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const userOne = await User.findOne({
            where: { id: req.params.id_one }
        })
        const userTwo = await User.findOne({
            where: { id: req.params.id_two }
        })
        const checkOne = await Friend.findOne({
            where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.PENDING }
        })
        const checkTwo = await Friend.findOne({
            where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.PENDING }
        })
        if (userOne && userTwo && !checkOne && !checkTwo) {
            await Friend.create({
                status: statuses.PENDING,
                userOneId: req.params.id_one,
                userTwoId: req.params.id_two
            })
            await Friend.create({
                status: statuses.PENDING,
                userOneId: req.params.id_two,
                userTwoId: req.params.id_one
            })
            res.status(200).send("Friend Request Sent!");
        }
        else {
            res.status(400).send("One or both users doesn't exist or already pending request.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

/* PUT /api/friend/accept/<id_one>/<id_two> - Accepts a friend request between one user and another
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.put('/accept/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const userOne = await User.findOne({
            where: { id: req.params.id_one }
        })
        const userTwo = await User.findOne({
            where: { id: req.params.id_two }
        })
        if (userOne && userTwo) {
            const acceptOne = await Friend.update({
                status: statuses.ACCEPTED
            },
                { where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.PENDING } }
            )
            const acceptTwo = await Friend.update({
                status: statuses.ACCEPTED
            },
                { where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.PENDING } }
            )
            if (acceptOne.length > 1 && acceptTwo.length > 1) {
                res.status(200).send("Friend Request Accepted!");
            }
            else {
                res.status(400).send("Could not accept friend request.");
            }
        }
        else {
            res.status(404).send("One or both users doesn't exist.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

/* PUT /api/friend/block/<id_one>/<id_two> - Blocks a friend of a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.put('/block/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const userOne = await User.findOne({
            where: { id: req.params.id_one }
        })
        const userTwo = await User.findOne({
            where: { id: req.params.id_two }
        })
        if (userOne && userTwo) {
            const updateOne = await Friend.update({
                status: statuses.BLOCKED
            },
                { where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.ACCEPTED } }
            )
            const updateTwo = await Friend.update({
                status: statuses.BLOCKED
            },
                { where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.ACCEPTED } }
            )
            if (updateOne.length > 1 && updateTwo.length > 1) {
                res.status(200).send("Blocked Friend.");
            }
            else {
                res.status(400).send("Could not block friend.");
            }
        }
        else {
            res.status(404).send("One or both users doesn't exist.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

/* DELETE /api/friend/unfriend/<id_one>/<id_two> - Deletes a friend of a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.delete('/unfriend/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const userOne = await User.findOne({
            where: { id: req.params.id_one }
        })
        const userTwo = await User.findOne({
            where: { id: req.params.id_two }
        })
        if (userOne && userTwo) {
            const deleteOne = await Friend.destroy({
                where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.ACCEPTED }
            })
            const deleteTwo = await Friend.destroy({
                where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.ACCEPTED }
            })
            if (deleteOne && deleteTwo) {
                res.status(200).send("Unfriended.");
            }
            else {
                res.status(404).send("Could not delete friend.");
            }
        }
        else {
            res.status(422).send("One or both users doesn't exist.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

/* DELETE /api/friend/decline/<id_one>/<id_two> - Declines a friend request from a given user
EXPECTS:
  HEADERS:
    - 'Authorization': 'Bearer <token>'
*/
friend.delete('/decline/:id_one/:id_two', isAuthenticated, async (req, res, next) => {
    try {
        const userOne = await User.findOne({
            where: { id: req.params.id_one }
        })
        const userTwo = await User.findOne({
            where: { id: req.params.id_two }
        })
        if (userOne && userTwo) {
            const deleteOne = await Friend.destroy({
                where: { userOneId: req.params.id_one, userTwoId: req.params.id_two, status: statuses.PENDING }
            })
            const deleteTwo = await Friend.destroy({
                where: { userOneId: req.params.id_two, userTwoId: req.params.id_one, status: statuses.PENDING }
            })
            if (deleteOne && deleteTwo) {
                res.status(200).send("Declined.");
            }
            else {
                res.status(400).send("Could not decline friend request.");
            }
        }
        else {
            res.status(422).send("One or both users doesn't exist.");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

friend.get('*', async (req, res, next) => {
    res.status(200).send("Default Friend Route.");
})

module.exports = friend;