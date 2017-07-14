const gameModule = require("./gameModule.js"),
    express =require("express");

var router = new express.Router();

//var gameModes[req.body.gameMode].playQueue = [{username:"Timo", date:"long ago", icon:"ninja", inbox:[]}, {username:"test1",date:"long ago", icon:"teacher", inbox:[]},{username:"test2",date:"long ago", icon:"professor", inbox:[]},{username:"test3",date:"long ago", icon:"nurse", inbox:[]}];

var gameModes = [
    { playQueue:[], nrPlayers:2 },
    { playQueue:[], nrPlayers:4 }
];

var games = [];
var gameNr = 0;


function checkGameMode(req, res){
    if(req.body.gameMode != 0 && req.body.gameMode != 1) {
        res.send("Unsupported game mode.");
        return true;
    }
    return false;
} 

router.post("/HTML/playQueue", function(req, res, next) {
    if(checkGameMode(req, res)) return;

    gameModes[req.body.gameMode].playQueue.push({username:req.session.username, date: req.body.date, icon:req.session.icon, lastSent: req.body.lastSent, inbox:[]});
    res.send("Success");
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

function match(gameMode) {
    var gm = gameModes[gameMode];
    if(gm.playQueue.length >= gm.nrPlayers) {
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
        if(playersFound == gm.nrPlayers) {
            games.push(game);
            gameNr++;
            removeFromPlayQueue(indexes, gameMode);
            match(gameMode);
        }
    }
    return;
}

var alternate = true;

setInterval(function() {
    if(alternate) {
        alternate=false;
        match(0);
    }
    else {
        alternate = true;
        match(1);
    }
}, 1000);

router.use(gameModule.router);
module.exports.router = router;
gameModule.initialize(games);