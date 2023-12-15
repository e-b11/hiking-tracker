//Project 3: Hiking Tracker
//Description: Users have the ability to view, update, add, and delete hikes once they login. They can also see some recommendations.
// Emma Bastian, Connor Humphrey, Johnny Fietkau, Lauren do Lago

//Set up Packages
const express = require("express");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");

let path = require("path");
const faviconPath = path.join(__dirname, "public");
let app = express();

//Set port
const port = process.env.PORT || 3000;

//Add ejs, cookie functionality
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Connect css file, favicon
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(faviconPath, "favicon.ico")));

// Set up knex, will have to adjust database
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "postgres",
    database: process.env.RDS_DB_NAME || "hikingapp",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

//Render index.ejs as home page
app.get("/", (req, res) => {
  res.render("index");
});

//Render login page
app.get("/login", (req, res) => {
  res.render("login");
});

//Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  knex("users")
    .where({ username, password })
    .first()
    .then((user) => {
      if (user) {
        //Create cookies to store username and privileges
        res.cookie("username", username, { maxAge: 900000, httpOnly: true }); //creates a cookie 'username' and assigns the value of the username
        res.cookie("access", "granted", { maxAge: 900000, httpOnly: true }); //creates a cookie that sets access privileges to granted
        res.redirect("hikes");
      } else {
        //If they get something wrong, they have the option to try again from a different view
        res.render("invalidLogin");
      }
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

//Display hikes page
app.get("/hikes", (req, res) => {
  // knex.raw("SELECT h.hike_name, hike_length, AVG(r.rating) FROM hikes INNER JOIN hike_ratings h ON h.hike_id = r.hike_id GROUP BY  ")
  //Many of the routes have these if statements, so that they can only be accessed if you are logged in. Otherwise, you are redirected to the login page
  if (req.cookies.access == "granted") {
    knex
      .select(
        "hike_id",
        "username",
        "hike_name",
        "hike_description",
        "date",
        "length",
        "elevation",
        "location",
        "rating"
      )
      .from("hikes")
      .where("username", req.cookies.username) //Only show hikes for logged in user
      .then((hikes) => {
        const pageuser = req.cookies.username;
        res.render("hikes", { myhikes: hikes });
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    res.redirect("/login");
  }
});

//Create Account route
app.get("/createAccount", (req, res) => {
  res.render("createAccount");
});

//Send new user info to users table, then redirect user to login
app.post("/createAccount", (req, res) => {
  knex("users")
    .insert({
      username: req.body.username,
      password: req.body.password,
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((error) => {
      console.error("Error processing the form:", error);
      res.status(500).send("Internal Server Error");
    });
});

//Create hike page
app.get("/addHike", (req, res) => {
  if (req.cookies.access == "granted") {
    res.render("addHike");
  } else {
    res.redirect("/login");
  }
});

//Post new hike to database, only allow if user is logged in
app.post("/addHike", (req, res) => {
  if (req.cookies.access == "granted") {
    knex("hikes")
      .insert({
        username: req.cookies.username,
        hike_name: req.body.hike_name,
        hike_description: req.body.description,
        date: req.body.date,
        length: req.body.hike_length,
        elevation: req.body.elevation,
        location: req.body.location,
        rating: req.body.rating,
      })
      .then(() => {
        res.redirect("/hikes");
      })
      .catch((error) => {
        console.error("Error processing the form:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.send("You do not have access to this page.");
  }
});

//Edit hike page
app.get("/editHike/:id", (req, res) => {
  if (req.cookies.access == "granted") {
    knex
      .select(
        "hike_id",
        "username",
        "hike_name",
        "hike_description",
        "date",
        "length",
        "elevation",
        "location",
        "rating"
      )
      .from("hikes")
      //only show info about the hike they want to edit
      .where("hike_id", req.params.id)
      .then((hikes) => {
        res.render("editHike", { myhikes: hikes });
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    res.redirect("/login");
  }
});

//Post edits to hike
app.post("/editHike", (req, res) => {
  if (req.cookies.access == "granted") {
    knex("hikes")
      .where("hike_id", parseInt(req.body.hike_id))
      //No need to update hike id or username, as that should not change
      .update({
        hike_name: req.body.hike_name,
        hike_description: req.body.hike_description,
        date: req.body.date,
        length: req.body.length,
        elevation: req.body.elevation,
        location: req.body.location,
        rating: req.body.rating,
      })
      .then((myhikes) => {
        res.redirect("/hikes");
      })
      .catch((error) => {
        console.error("Error processing the form:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.send("You do not have access to view this page.");
  }
});

//Delete Hike
app.post("/deleteHike/:id", (req, res) => {
  knex("hikes")
    .where("hike_id", req.params.id)
    .del()
    .then((myhikes) => {
      res.redirect("/hikes");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err });
    });
});

//Ratings page
app.get("/recommendations", (req, res) => {
  res.render("recommendations");
});

//Logout
app.get("/logout", (req, res) => {
  //remove admin cookies
  //req.cookies.access = "not_granted";
  res.cookie("access", "not_granted", { maxAge: 9000, httpOnly: true });

  res.redirect("/");
});

//Tell it what port to listen out and send a message when it starts
app.listen(port, () => console.log("Website started."));
