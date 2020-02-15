const router = require("express").Router();
const userRoute = require('./user');

router.use('/user', userRoute);

router.use((req, res, next) => {
    res.status(200).send("Default API route.");
})

module.exports = router;