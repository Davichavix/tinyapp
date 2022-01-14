# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Users can add, modify and delete short URLs. The app will store a list of short URLs created by the user.

## App Features
- users can only modify and see their own URLs
- only registered users can create short URLs
- user can only register usernames once
- short URL links will work without being logged in as registered user
- password encrypted using bcrypt
- encrypted cookies are used to keep track of user sessions

## Final Product

!["urls page displaying table of short URL and long URL"](https://github.com/Davichavix/tinyapp/blob/main/docs/urls-page.png?raw=true)
!["Register page for new users"](https://github.com/Davichavix/tinyapp/blob/main/docs/register-page.png?raw=true)
!["Page to reassign existing short URLs to new long URLs"](https://github.com/Davichavix/tinyapp/blob/main/docs/urls-show.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.