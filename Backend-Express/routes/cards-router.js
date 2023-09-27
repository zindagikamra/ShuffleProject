const express = require("express");
const controller = require("../controller/cards-controller");
const checkAuth = require("../middlewear/check-auth");

const router = express.Router();

router.post("/", /*checkAuth,*/ controller.createCard); //most prob will be completely without checkAuth as createAI set *might* be main creation method
router.get("/:cardId", checkAuth, controller.getCardById);
router.get("/", controller.getCard);
router.delete("/:cardId", controller.deleteCard); // removed check auth as done in sets
router.patch("/:cardId", checkAuth, controller.updateCard);

module.exports = router;
