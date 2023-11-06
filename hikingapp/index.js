const express = require("express");

let app = express();

let path = require("path");

const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
});

app.listen(port, () => console.log("Website started."));
