/* This is the main module */


// all the needed modules
const http = require("http"),
    express = require("express"),
    bodyParser = require('body-parser'),
    url = require("url"),
    cookie = require("cookie-parser"),
    session = require("express-session"),
    credentials = require("./credentials.js"),
    mysql = require("mysql"),
    verify = require("./verifyInput"),
    queueModule = require("./queueModule.js"),
    profileModule = require("./profileModule.js");
    

// connect to the database
var pool = mysql.createPool(credentials.mysqlCredentials);

//initiating the express aplication
var app = express();

http.createServer(app).listen(3000);
app.use(cookie(credentials.cookieSecret));
app.use(session(credentials.cookieSecret));
app.use(express.static(__dirname + "/Client"));
app.use(bodyParser.urlencoded({extend: true}));

// this route handler checks whether the user accessing a certain page is authenticated
app.get("/check", function(req, res) {
    if(!req.session.username){
        res.writeHead(401, {"Content-Type":"text/plain"});
        res.end("Not authenticated.");
        return;
    }
    res.send();
}); 


// if no route is specified, this route handler redirects the user to the sign in page 
// if (s)he is not authenticated or otherwise to the menu page
app.get("/", function(req, res){
    if(!req.session.username){
        res.redirect("/HTML/signIn.html");
    }
    else{
        res.redirect("/HTML/menu.html");
    }
})

// this route handler authenticates the user by creating a username field in the session object
app.post("/HTML/signIn", function(req, res, next){

    pool.getConnection(function(err, connection) {
        // check whether the username exists in the database
        connection.query("SELECT * FROM Users WHERE username = ?", [req.body.username], function(err, rows, fields) {
            connection.release();
            // check whether the password is correct
            if((rows[0] == undefined) || (rows[0].password !== req.body.password)){
                res.send("Username or password incorrect.");
                return;
            } else {
                req.session.username = rows[0].username;
                req.session.name = rows[0].name;
                req.session.surname = rows[0].surname;
                req.session.icon = rows[0].icon;
                res.send("Success");
            }
        });
    });
});

// this route handler is used when a new account is created
// if everything is alright an approval message is sent back to the user 
// if not then an error message is sent back to the user and the method is ended
app.post("/HTML/checkUsername", function(req, res) {
    pool.getConnection(function(err, connection) {
        // query the username in the database to see if it already exists
        connection.query("SELECT username FROM Users;", function(err, rows, fields) {
            var request = req.body;

            // check if the username contains unsupported symbols
            if(!verify.verifyUsername(request.username)){
                res.send("Username contains unsupported symbols.");
                return;
            }
            
            // check if the password is empty
            if(request.password.length == 0){
                res.send("Password is empty");
                return;
            }

            // the password and the retype of the password have to match
            if(request.password !== request.retype){
                res.send("Passwords don't match");
                return;
            }


            // the name can not be empty
            if(!verify.verifyEmpty(request.name)){
                res.send("Name is empty.");
                return;
            }

            // the username has to be unique
            for(var i=0;i<rows.length;i++){
                if(rows[i].username.toUpperCase() == req.body.username.toUpperCase()){
                    res.send("Username already taken.");
                    return;
                }
            }


            var err = false;
            // insert the data about the new user in the database
            connection.query('INSERT INTO Users SET ?', {username: request.username, password: request.password, name: request.name, surname:request.surname, icon:"teacher"}, function(error) {
                if (error) {
                    console.log(error.message);
                    err = true;
                } else {
                    console.log('success');    
                }
            });

            // create the stats for the new users in the database
            connection.query('INSERT INTO Stats SET ?', {username: request.username, games1v1:0, games2v2:0, wins1v1:0, wins2v2:0, points1v1:0, points2v2:0}, function(error) {
                if (error) {
                    console.log(error.message);
                    err = true;
                } else {
                    console.log('success');    
                }
            });

            connection.release();
            // if an error occured during the database update then an error message is sent to the user
            if(err) res.send("An error occured.");
            res.send("Success");
        });
    });
});


// this route handler logs out the user by setting the username field in the session object to undefined
// with the username field set to undefined the user will always be redirected to the sign in page
app.get("/HTML/logOut", function(req, res){
    req.session.username = undefined;
    req.session.name = undefined;
    res.send();
    
});

// this route is used whenever a user wants to change his/her user icon
const icons = ["baby", "nurse", "teacher", "professor", "sad", "spy", "bear"]; // an array with all the icons that are available
app.post("/changeIcon", function(req, res) {

    // check if the user is authenticated and if the index lies between de boundaries of the array
    if(req.session.username != undefined && req.body.nr >=0 && req.body.nr <= 6) {
        pool.getConnection(function(err, connection) {
            // update the data in the database
            connection.query("UPDATE Users SET icon=? WHERE username=?;", [icons[req.body.nr], req.session.username], function(error) {
                connection.release();
                if(error) console.log(error.message);
                else {
                    req.session.icon = icons[req.body.nr];
                    res.send("Success");
                }
            });
        });
    }
});

app.use(queueModule.router);
app.use(profileModule.router);

// pass the connection with the database with the other modules
profileModule.initializePool(pool);
queueModule.initializePool(pool);
