const gameModule = require("./gameModule.js"),
    express =require("express");

var router = new express.Router();
var connection;

var ai = require("./bot.js");

var gameModes = [
    { playQueue:[], nrPlayers:2 },
    { playQueue:[], nrPlayers:4 },
    { playQueue:[], nrPlayers:2 }
];

var games = [];
var gameIds = [];


function checkGameMode(req, res){
    if(req.body.gameMode != 0 && req.body.gameMode != 1 && req.body.gameMode != 2) {
        res.send({message:"Unsupported game mode."});
        return true;
    }
    return false;
} 

router.post("/HTML/playQueue", function(req, res, next) {
     if(!req.session.username) {
        res.send({message:"Not authenticated."});
        return;
     }
    else if(checkGameMode(req, res)) return;
    else {
        gameModes[req.body.gameMode].playQueue.push({username:req.session.username, date: req.body.date, icon:req.session.icon, lastSent: req.body.lastSent, inbox:[]});
        res.send({message:"Success"});
    }
});

router.post("/HTML/search", function(req, res) {
    if(checkGameMode(req, res)) return;

    var gm = gameModes[req.body.gameMode];
    for(var i=0; i<gm.playQueue.length;i++) {
        var currentTime = new Date();
        if(gm.playQueue[i].username == req.session.username && 
                gm.playQueue[i].date == req.body.date) {

            gm.playQueue[i].lastSent = req.body.lastSent;
            break;
        }
    }

    for(var i=0;i<games.length;i++) {
        for(var j=0;j<games[i].players.length;j++) {
            if(games[i].players[j].date == req.body.date && games[i].players[j].username == req.session.username) {
                res.send({message:"Game found", id:games[i].id});
                return;
            }
        }
    }
    res.send({message:"Game not found"});
})

function removeFromPlayQueue(array, gameMode) {
    var playQueue = gameModes[gameMode].playQueue;
    for(var i=0;i<array.length;i++) {
        playQueue.splice(array[i]-i,1);
    }
}

function Game(pls, gameId) {
    this.players = pls;
    this.id = gameId;
    this.nrDistributedCards = 0;
    this.cards = [[],[],[],[]];
    this.turn = 0;
    this.onTable = [];
    this.holder = 0;
    this.team1P = 0;
    this.team2P = 0;
    this.end = false;
}

function matchGM2() {
    var gm = gameModes[2];
    for(var i=0; i<gm.playQueue.length; i++) {
        if(gameIds.length == 0) {
            gm.playQueue.splice(0,i);
            return;
        }
        var game = new Game([gm.playQueue[i]], gameIds.shift());
        var bot = new ai(game, "Robottas", game.players.length);
        game.players.push(bot);
        bot.greet();
        games[game.id] = game;
        gameModule.initializeGame(game.id);
    }
    gm.playQueue = [];
}

function match(gameMode) {
    var gm = gameModes[gameMode];
    if(gm.playQueue.length >= gm.nrPlayers) {
        var game = new Game([], null);
        var playersFound = 0;
        var indexes = []; 
        var invalidEntries = [];
        for(var j=0;j<gm.playQueue.length;j++) {
            var ok = true;
            var currentTime = new Date().getTime();
            if(currentTime - gm.playQueue[j].lastSent > 4000) {
                invalidEntries.push(j);
                ok = false;
            }
            else {
                for(var i=0;i<playersFound;i++) {
                    if(game.players[i].username == gm.playQueue[j].username){
                        ok = false;
                        break;
                    }
                }
            }
            if(ok) {
                game.players[playersFound] = gm.playQueue[j];
                indexes.push(j);
                playersFound++;
            }
            if(playersFound == gm.nrPlayers) break;
        }
        removeFromPlayQueue(invalidEntries, gameMode);
        if(gameIds.length == 0) return;
        if(playersFound == gm.nrPlayers) {
            game.id = gameIds.shift();
            games[game.id] = game;
            gameModule.initializeGame(game.id);
            removeFromPlayQueue(indexes, gameMode);
            match(gameMode);
        }
    }
    return;
}

var alternate = 0;

setInterval(function() {
    if(alternate == 0) {
        match(0);
    }
    else if(alternate == 1){
        match(1);
    }
    else {
        matchGM2();
    }
    alternate = (alternate+1)%3;

}, 500);

function initializeConnection(c) {
    connection = c;
    for(var i=0; i<100; i++) gameIds[i] = i; 
    gameModule.initialize(games, gameIds, connection);
}

router.use(gameModule.router);
module.exports.router = router;
module.exports.initializeConnection = initializeConnection;
