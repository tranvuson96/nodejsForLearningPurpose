const express = require("express");

const router = express.Router();

router.use("/add-product", (req, res, next) => {
	console.log("ADD-PRODUCT");
	res.send(
		'<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>',
	);
});

router.post("/product", (req, res, next) => {
	console.log(req.body);
	res.redirect("/");
});

module.exports = router;
