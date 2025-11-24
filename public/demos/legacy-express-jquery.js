// Legacy Express.js + jQuery Application (circa 2014)
// Uses outdated patterns and deprecated methods

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();

// Deprecated body-parser usage
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Insecure database connection - credentials in code
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'myapp'
});

connection.connect();

// No error handling middleware
app.get('/users', function(req, res) {
  // SQL injection vulnerability
  var userId = req.query.id;
  var query = "SELECT * FROM users WHERE id = " + userId;
  
  connection.query(query, function(error, results) {
    if (error) throw error;
    res.send(results);
  });
});

// Callback hell
app.post('/register', function(req, res) {
  var username = req.body.username;
  var email = req.body.email;
  
  // Nested callbacks
  connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, results) {
    if (err) throw err;
    
    if (results.length > 0) {
      res.send('Email already exists');
    } else {
      connection.query('INSERT INTO users SET ?', {username: username, email: email}, function(err, result) {
        if (err) throw err;
        
        connection.query('SELECT * FROM users WHERE id = ?', [result.insertId], function(err, user) {
          if (err) throw err;
          
          // Send email (another callback)
          sendWelcomeEmail(email, function(err) {
            if (err) throw err;
            res.send('User registered successfully');
          });
        });
      });
    }
  });
});

// Synchronous file operations blocking event loop
var fs = require('fs');
app.get('/config', function(req, res) {
  var config = fs.readFileSync('./config.json', 'utf8');
  res.send(config);
});

// No input validation
app.post('/update-profile', function(req, res) {
  var userId = req.body.userId;
  var data = req.body;
  
  connection.query('UPDATE users SET ? WHERE id = ?', [data, userId], function(err) {
    if (err) throw err;
    res.send('Profile updated');
  });
});

// jQuery frontend code (served as string)
var clientCode = `
<script src="https://code.jquery.com/jquery-1.11.0.min.js"></script>
<script>
$(document).ready(function() {
  // Old jQuery patterns
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    
    var username = $('#username').val();
    var password = $('#password').val();
    
    // No CSRF protection
    $.ajax({
      url: '/login',
      type: 'POST',
      data: {
        username: username,
        password: password
      },
      success: function(response) {
        alert('Login successful!');
        window.location = '/dashboard';
      },
      error: function() {
        alert('Login failed!');
      }
    });
  });
  
  // Deprecated jQuery methods
  $('.delete-btn').live('click', function() {
    var id = $(this).data('id');
    $.post('/delete/' + id, function() {
      location.reload();
    });
  });
  
  // Poor event handling
  $('input').keyup(function() {
    validateForm();
  });
  
  // Global variables
  window.userData = null;
  
  // Inline styles manipulation
  $('.highlight').css({
    'background-color': 'yellow',
    'font-weight': 'bold'
  });
});

function validateForm() {
  // Validation logic
}
</script>
`;

app.get('/', function(req, res) {
  res.send(clientCode);
});

// No proper error handling
app.listen(3000, function() {
  console.log('Server running on port 3000');
});

// Memory leak - event listeners not cleaned up
setInterval(function() {
  connection.query('SELECT COUNT(*) FROM users', function(err, result) {
    console.log('Active users:', result);
  });
}, 1000);
