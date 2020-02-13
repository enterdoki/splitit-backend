const router = require("express").Router();

router.use((req, res, next) => {
    res.status(200).send("Default API route.");
})

module.exports = router;