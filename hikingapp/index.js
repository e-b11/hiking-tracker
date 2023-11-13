const express = require("express");

let app = express();

let path = require("path");

const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render(path.join(__dirname + "/views/index.ejs"));
});

app.listen(port, () => console.log("Website started."));
