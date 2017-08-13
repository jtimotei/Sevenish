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
    


var connection = mysql.createConnection(credentials.mysqlCredentials);

connection.connect(function(err){
  if(err){
    console.log('<<< Error connecting to Db >>>');
    return;
  }
  console.log('>>>> Connection established');
});


var users = [];
var app = express();

http.createServer(app).listen(3000);
app.use(cookie(credentials.cookieSecret));
app.use(session(credentials.cookieSecret));
app.use(express.static(__dirname + "/Client"));
app.use(bodyParser.urlencoded({extend: true}));


app.get("/check", function(req, res) {
    if(!req.session.username){
        res.writeHead(401, {"Content-Type":"text/plain"});
        res.end("Not authenticated.");
        return;
    }
    res.send();
}); 

app.get("/", function(req, res){
    if(!req.session.username){
        res.redirect("/HTML/signIn.html");
    }
    else{
        res.redirect("/HTML/menu.html");
    }
})


app.post("/HTML/signIn", function(req, res, next){
    connection.query("SELECT * FROM Users WHERE username = ?", [req.body.username], function(err, rows, fields) {
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
})

app.post("/HTML/checkUsername", function(req, res) {
    connection.query("SELECT username FROM Users;", function(err, rows, fields) {

        var request = req.body;

        if(!verify.verifyUsername(request.username)){
            res.send("Username contains unsupported symbols.");
            return;
        }
        
        if(request.password.length == 0){
            res.send("Password is empty");
            return;
        }

        if(request.password !== request.retype){
            res.send("Passwords don't match");
            return;
        }


        if(!verify.verifyEmpty(request.name)){
            res.send("Name is empty.");
            return;
        }

        for(var i=0;i<rows.length;i++){
            if(rows[i].username == req.body.username){
                res.send("Username already taken.");
                return;
            }
        }


        var err = false;
        connection.query('INSERT INTO Users SET ?', {username: request.username, password: request.password, name: request.name, surname:request.surname, icon:"teacher"}, function(error) {
            if (error) {
                console.log(error.message);
                err = true;
            } else {
                console.log('success');    
            }
        });

        connection.query('INSERT INTO Stats SET ?', {username: request.username, games1v1:0, games2v2:0, wins1v1:0, wins2v2:0, points1v1:0, points2v2:0}, function(error) {
            if (error) {
                console.log(error.message);
                err = true;
            } else {
                console.log('success');    
            }
        });

        if(err) res.send("An error occured.");
        res.send("Success");
    });
});

app.get("/HTML/logOut", function(req, res){
    req.session.username = undefined;
    req.session.name = undefined;
    res.send();
    
});

const icons = ["baby", "nurse", "teacher", "professor", "sad", "spy", "bear"];
app.post("/changeIcon", function(req, res) {
    if(req.session.username != undefined && req.body.nr >=0 && req.body.nr <= 6) {
        connection.query("UPDATE Users SET icon=? WHERE username=?;", [icons[req.body.nr], req.session.username], function(error) {
            if(error) console.log(error.message);
            else {
                req.session.icon = icons[req.body.nr];
                res.send("Success");
            }
        });
    }
});

app.use(queueModule.router);
app.use(profileModule.router);
profileModule.initializeConnection(connection);
queueModule.initializeConnection(connection);
