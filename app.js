const http = require("http");
const express = require("express");

const app = express();

app.use((res, req, next) => {
	console.log("In the middleware");
	next(); //alow does res to continue to the next middleware in line
});

app.use((req, res, next) => {
	console.log("In another middleware");
	res.send("<h1>Hello From Node.js</h1>");
});

const server = http.createServer(app);

server.listen(3000);
