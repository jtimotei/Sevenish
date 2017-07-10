const http = require("http"),
    express = require("express"),
    bodyParser = require('body-parser'),
    url = require("url"),
    cookie = require("cookie-parser"),
    session = require("express-session"),
    credentials = require("./credentials.js"),
    mysql = require("mysql"),
    verify = require("./verifyInput"),
    gameModule = require("./gameModule.js");
    
var playQueue = [{username:"Timo", date:"long ago", icon:"ninja", inbox:[]}, {username:"test1",date:"long ago", icon:"teacher", inbox:[]},{username:"test2",date:"long ago", icon:"professor", inbox:[]},{username:"test3",date:"long ago", icon:"nurse", inbox:[]}];
//var playQueue = [];
var games = [];
var gameNr = 0;

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


var check = function(req, res) {
    if(!req.session.username){
        res.writeHead(401, {"Content-Type":"text/plain"});
        res.end("Not authenticated.");
        return;
    }
    res.send();
}

app.get("/check", check); 

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
            req.session.icon = rows[0].icon;
            res.send("Success");
        }
    });
})

app.post("/HTML/checkUsername", function(req, res) {
    connection.query("SELECT username FROM users;", function(err, rows, fields) {
        console.log(req.body);
        for(var i=0;i<rows.length;i++){
            if(rows[i].username == req.body.username){
                res.send("Username already taken.");
                return;
            }
        }
        var request = req.body;
        if(request.password !== request.retype){
            res.send("Passwords don't match");
            return;
        }

        if(!verify.verifyUsername(request.username)){
            res.send("Username does not contain any letters.");
            return;
        }

        if(!verify.verifyEmpty(request.name)){
            res.send("Name is empty.");
            return;
        }

        connection.query('INSERT INTO users SET ?', {username: request.username, password: request.password, name: request.name, surname:request.surname}, function(error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('success');    
            }
        });

        res.send("Success");
    });
});

app.get("/HTML/logOut", function(req, res){
    req.session.username = undefined;
    req.session.name = undefined;
    res.send();
    
});

app.post("/HTML/playQueue", function(req, res, next) {
    playQueue.push({username:req.session.username, date: req.body.date, icon:req.session.icon, lastSent: req.body.lastSent, inbox:[]});
    res.send();
});

app.post("/HTML/search", function(req, res) {
    for(var i=0; i<playQueue.length;i++) {
        var currentTime = new Date();
        if(playQueue[i].username == req.session.username && playQueue[i].date == req.body.date) {
            playQueue[i].lastSent = req.body.lastSent;
            break;
        }
    }
    for(var i=0;i<games.length;i++) {
        for(var j=0;j<4;j++) {
            if(games[i].players[j].date == req.body.date && games[i].players[j].username == req.session.username) {
                res.send({message:"Game found", id:games[i].id});
                return;
            }
        }
    }
    res.send({message:"Game not found"});
})

function removeFromPlayQueue(array) {
    for(var i=0;i<array.length;i++) {
        playQueue.splice(array[i]-i,1);
    }
}

function match() {
    if(playQueue.length >= 4) {
        var game = {
            players:[],
            id : gameNr,
            nrDistributedCards:0,
            cards : [[],[],[],[]],
            turn:0,
            onTable:[],
            holder:0,
            team1P:0,
            team2P:0
        };
        var playersFound = 0;
        var indexes = []; 
        var invalidEntries = [];
        for(var j=0;j<playQueue.length;j++) {
            var ok = true;
            var currentTime = new Date().getTime();
            if(currentTime - playQueue[j].lastSent > 4000) {
                invalidEntries.push(j);
                ok = false;
            }
            else {
                for(var i=0;i<playersFound;i++) {
                    if(game.players[i].username == playQueue[j].username){
                        ok = false;
                        break;
                    }
                }
            }
            if(ok) {
                game.players[playersFound] = playQueue[j];
                indexes.push(j);
                playersFound++;
            }
            if(playersFound == 4) break;
        }
        removeFromPlayQueue(invalidEntries);
        if(playersFound == 4) {
            games.push(game);
            gameNr++;
            removeFromPlayQueue(indexes);
            match();
        }
    }
    return;
}

setInterval(match, 1500);

gameModule.initialize(games);
app.use(gameModule.router);
