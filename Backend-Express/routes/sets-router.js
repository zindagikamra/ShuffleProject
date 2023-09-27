const express = require("express");
const controller = require("../controller/sets-controller");
const checkAuth = require("../middlewear/check-auth");

const router = express.Router();

router.post("/", checkAuth, controller.createSet);
router.get("/", checkAuth, controller.getSet);
router.get("/:setId", checkAuth, controller.getSetById);
router.delete("/:setId", checkAuth, controller.deleteSet);
router.patch("/addCards/:setId", checkAuth, controller.addCardsToSet);
router.patch("/deleteCards/:setId", checkAuth, controller.deleteCardsFromSet);
router.post("/AI", controller.createAISet);

module.exports = router;
