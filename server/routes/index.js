const router = require('express').Router();

router.use("/user", require("./user.routes"))
router.use("/posts", require("./post.routes"));
module.exports = router