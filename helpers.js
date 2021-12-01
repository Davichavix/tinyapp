const getUserByEmail = function(email, userObj) {
  let userNames = Object.keys(userObj);
  for (const user of userNames) {
    if (userObj[user]["email"] === email) {
      return userObj[user]["id"];
    }
  }
  return undefined;
};

const generateRandomString = function() {
  let randStr = "";
  const randChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randStr = randStr + randChars[Math.floor(Math.random() * 61) + 1];
  }
  return randStr;
};

// Function returns only urls based on email
const urlsForUser = function(urlObj, id) {
  let resObj = {};
  for (const short in urlObj) {
    if (urlObj[short]["userID"] === id) {
      resObj[short] = {
        longURL: urlObj[short]["longURL"],
        userID: urlObj[short]["userID"]
      };
    }
  }
  return resObj;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};