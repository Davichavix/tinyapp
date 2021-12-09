const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['randomKeys'],
  maxAge: 24 * 60 * 60 * 1000
}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require("bcrypt");
const PORT = 8080;
const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID]) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL : req.body.longURL,
      userID : req.session.user_id
    };
    return res.redirect(`/urls/${shortURL}`);
  }
  return res.status(400).send("Please Login");
});

// Registers new User and return error if username/password blank
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Username/Password cannot be blank");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("User already exists");
  }

  // Generates random UserID for new users
  const userID = "user" + generateRandomString();

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.session.user_id = userID;
  users[userID] = {
    id : userID,
    email: req.body.email,
    password: hashedPassword
  };
  res.redirect("/urls");
});

// Login if username and password match registered user
app.post("/login", (req, res) => {

  // Get userID based on Email
  const userID = getUserByEmail(req.body.email, users);

  if (userID && bcrypt.compareSync(req.body.password, users[userID]["password"])) {
    req.session.user_id = userID;
    res.redirect("/urls");
  } else if (!userID) {
    return res.status(400).send("Username not found");
  } else if (!bcrypt.compareSync(req.body.password, users[userID]["password"])) {
    return res.status(400).send("Password is incorrect");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  // Only logged in user can delete user's own urls
  if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  } else {
    return res.status(400).send("Must be logged in to delete urls");
  }
});

//POST edit for existing shortURLs
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    const shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(400).send("Must be logged in to edit urls");
  }
});
 
// Generates new longURL to existing shortURL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  // Only logged in user can edit user's own urls
  if (userID === urlDatabase[req.params.id]["userID"]) {
    urlDatabase[req.params.id]["longURL"] = req.body.newURL;
  }
  res.redirect("/urls");
});

// GET view for shortURLs and longURLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!users[userID]) {
    return res.redirect("/urls/new");
  }
  // Users can only view urls registered to logged in user
  const userURLs = urlsForUser(urlDatabase, userID);
  
  const templateVars = {
    username: users[userID],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    username: users[userID],
    urls: urlDatabase
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID]) {
    return res.redirect("/urls/new")
  } else {
  const templateVars = {
    username: users[userID],
    urls: urlDatabase
  };
  res.render("login", templateVars);
  }
});

// GET /urls/new page if userID logged in else redirects to login page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (users[userID]) {
    const templateVars = {
      username: users[userID],
    };
   res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    username: users[userID],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});