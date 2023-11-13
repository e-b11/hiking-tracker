const express = require("express");

let app = express();

let path = require("path");

let favicon = require("serve-favicon");

//Set port
const port = 3000;

//Add ejs
app.set("view engine", "ejs");

//favicon
app.use(favicon(__dirname + "/public/images/favicon.ico"));

app.use(express.urlencoded({ extended: true }));

//Connect css file
app.use(express.static(__dirname + "/public"));

//Render index.ejs as home page
app.get("/", (req, res) => {
  res.render(path.join(__dirname + "/views/index.ejs"));
});

//Tell it what port to listen out and send a message when it starts
app.listen(port, () => console.log("Website started."));
