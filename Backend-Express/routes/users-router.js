const express = require("express");
const controller = require("../controller/users-controller");
const checkAuth = require("../middlewear/check-auth");

const router = express.Router();

router.post("/signup", controller.userSignup);
router.post("/login", controller.userLogin);
router.delete("/:userId", checkAuth, controller.deleteUser);
router.patch("/addSet/:userId", checkAuth, controller.addSetToUser);
router.patch("/deleteSet/:userId", checkAuth, controller.deleteSetFromUser);
router.get("/:userId", checkAuth, controller.getSetFromUser);

module.exports = router;
