const router = require("express").Router();
const userRoute = require('./user');
const authRoute = require('./auth');
const searchRoute = require('./search');
const friendRoute = require('./friend');

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/search', searchRoute);
router.use('/friend', friendRoute);

router.use((req, res, next) => {
    res.status(200).json({ message: "Default API route." });
})

module.exports = router;