const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userwithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userwithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUser = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validUser.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!isValid(username, password)) {
      return res.status(400).json({ message: "Invalid username" });
    }   
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
          data: password
        }, 'access', { expiresIn: 60 * 20 });
        req.session.authorization = {
          accessToken, username 
      }
      return res.status(200).send("Customer successfully logged in");
    } else {
      return res.status(208).send("Incorrect Login. Check credentials");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if(review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
    }
    else{
        res.send("Unable to find this ISBN!");
    }
  });

// delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).send("Unable to find this ISBN!");
    }

    delete books[isbn]['reviews'];

    return res.status(200).send(`The review for the book with ISBN ${isbn} has been deleted.`);
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
