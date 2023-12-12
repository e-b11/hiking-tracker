//Project 3: Hiking Tracker
// Emma Bastian, Connor Humphrey, Johnny Fietkau, Lauren do Lago

//Express Package
const express = require("express");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");

let path = require("path");
const faviconPath = path.join(__dirname, "public");
let app = express();

//Set port
const port = process.env.PORT || 3000;

//Add ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Connect css file
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(faviconPath, "favicon.ico")));

// Set up knex, will have to adjust database
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "postgres",
    database: process.env.RDS_DB_NAME || "intex",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

//Render index.ejs as home page
app.get("/", (req, res) => {
  res.render(path.join(__dirname + "/views/index.ejs"));
});

//Render login page
app.get("/login", (req, res) => {
  res.render(path.join(__dirname + "/views/login.ejs"));
});

//Tell it what port to listen out and send a message when it starts
app.listen(port, () => console.log("Website started."));
