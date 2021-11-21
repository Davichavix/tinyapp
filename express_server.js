const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let randStr = "";
  const randChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    randStr = randStr + randChars[Math.floor(Math.random() * 61) + 1];
  }
  return randStr;
};

const checkEmail = function(userObj, email) {
  let userNames = Object.keys(userObj);
  for (const user of userNames) {
    if (userObj[user]["email"] === email) {
      return userObj[user]["id"];
    }
  }
  return false;
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400).end();
  };
  if (checkEmail(users, req.body.email)) {
    res.sendStatus(400).end();
  };
  console.log(users);
  const userID = "user" + generateRandomString();
  res.cookie('user_id', userID);
  users[userID] = {
    id : userID,
    email: req.body.email,
    password: req.body.password
  };
  res.redirect("/register");
});

app.post("/login", (req, res) => {
  const userID = checkEmail(users, req.body.email);
  res.cookie('user_id', userID);
  res.redirect("/urls");
})

app.post("/register/page", (req, res) => {
  res.redirect("/register");
})

app.post("/login/page", (req, res) => {
  res.redirect("/login");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
})
 

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls")
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    username: users[userID],
    urls: urlDatabase
   };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    username: users[userID],
    urls: urlDatabase
   };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    username: users[userID],
    urls: urlDatabase
   };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
  const templateVars = { 
    username: users[userID],
   };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    username: users[userID], 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });