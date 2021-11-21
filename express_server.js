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
const {getUserByEmail} = require("./helpers");

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

const urlsForUser = function(urlObj, id) {
  let resObj = {};
  for (const short in urlObj) {
    if (urlObj[short]["userID"] === id) {
      resObj[short] = {
        longURL: urlObj[short]["longURL"],
        userID: urlObj[short]["userID"]
      }
    }
  }
  return resObj;
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`)
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400).end();
  };
  if (getUserByEmail(req.body.email, users)) {
    res.sendStatus(400).end();
  };
  const userID = "user" + generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.session.user_id = userID;
  users[userID] = {
    id : userID,
    email: req.body.email,
    password: hashedPassword
  };
  console.log(users[userID])
  res.redirect("/register");
});

app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  if (userID && bcrypt.compareSync(req.body.password, users[userID]["password"])) {
  req.session.user_id = userID;
  res.redirect("/urls");
  } else {
  res.redirect("/urls");
  }
})

app.post("/register/page", (req, res) => {
  res.redirect("/register");
})

app.post("/login/page", (req, res) => {
  res.redirect("/login");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
    if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls")
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
  } else {
    res.redirect("/urls")
  }
})
 

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.id]["userID"]) {
    urlDatabase[req.params.id]["longURL"] = req.body.newURL;
  }
  res.redirect("/urls")
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
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
  const templateVars = { 
    username: users[userID],
    urls: urlDatabase
   };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
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