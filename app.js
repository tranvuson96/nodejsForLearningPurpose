const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/add-product", (req, res, next) => {
	console.log("ADD-PRODUCT");
	res.send(
		'<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>',
	);
});

app.post("/product", (req, res, next) => {
	console.log(req.body);
	res.redirect("/");
});

app.use("/", (req, res, next) => {
	console.log("In another middleware");
	res.send("<h1>Hello From Node.js</h1>");
});

app.listen(3000);
