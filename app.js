const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
	console.log("This always run!");
	next(); //alow does res to continue to the next middleware in line
});

app.use("/add-product", (rep, res, next) => {
	res.send('<h1>The "ADD PRODUCT"</h1>');
});

app.use("/", (req, res, next) => {
	console.log("In another middleware");
	res.send("<h1>Hello From Node.js</h1>");
});

app.listen(3000);
