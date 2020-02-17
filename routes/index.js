const router = require("express").Router();
const userRoute = require('./user');
const authRoute = require('./auth');
const searchRoute = require('./search');

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/search', searchRoute);

router.use((req, res, next) => {
    res.status(200).send("Default API route.");
})

module.exports = router;