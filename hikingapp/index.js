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
//app.use(favicon(path.join(faviconPath, "favicon.ico")));

// Set up knex, will have to adjust database
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "password",
    database: process.env.RDS_DB_NAME || "hikingapp",
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


//Render hike view page
app.get("/hikes", (req, res) => {

  // knex.raw("SELECT h.hike_name, hike_length, AVG(r.rating) FROM hikes INNER JOIN hike_ratings h ON h.hike_id = r.hike_id GROUP BY  ")

  knex('hikes')
  .select('hikes.hike_name', 'hikes.hike_length')
  .avg('hike_ratings.rating as average_rating')
  .join('hike_ratings', 'hikes.hike_id', '=', 'hike_ratings.hike_id')
  .groupBy('hikes.hike_id', 'hikes.hike_name', 'hikes.hike_length')
  .then(hikes => {
    console.log(hikes);
  })
  .catch(error => {
    console.error(error);
  })

  res.render(path.join(__dirname + "/views/hikes.ejs", {hikes}));
});




//Tell it what port to listen out and send a message when it starts
app.listen(port, () => console.log("Website started."));
