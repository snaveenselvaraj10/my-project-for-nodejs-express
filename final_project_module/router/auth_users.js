const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let sameUser = users.filter((user)=>{
        return user.username === username
    });
    if (sameUser.length > 0) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const { username } = req.session.authorization;
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
  
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    books[isbn].reviews[username] = review;
    
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { username } = req.session.authorization;
  
    if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
    }
  
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
  
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }
  
    delete books[isbn].reviews[username];
  
    return res.status(200).send(`Review for ISBN ${isbn} by user ${username} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
