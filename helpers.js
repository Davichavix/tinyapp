const getUserByEmail = function(email, userObj) {
  let userNames = Object.keys(userObj);
  for (const user of userNames) {
    if (userObj[user]["email"] === email) {
      return userObj[user]["id"];
    }
  }
  return undefined;
};

module.exports = {getUserByEmail};