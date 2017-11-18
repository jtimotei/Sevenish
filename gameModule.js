var express =require("express");
var router = new express.Router();
var ai = require("./bot.js");
var games;
var gameIds;

var connection;

const allcards = ["7_of_clubs","7_of_diamonds","7_of_hearts","7_of_spades","8_of_clubs","8_of_diamonds","8_of_hearts","8_of_spades","9_of_clubs","9_of_diamonds","9_of_hearts","9_of_spades",
"10_of_clubs","10_of_diamonds","10_of_hearts","10_of_spades","jack_of_clubs2","jack_of_diamonds2","jack_of_hearts2","jack_of_spades2","queen_of_clubs2","queen_of_diamonds","queen_of_hearts2",
"queen_of_spades2","king_of_clubs2","king_of_diamonds2","king_of_hearts2","king_of_spades2","ace_of_clubs","ace_of_diamonds","ace_of_hearts","ace_of_spades"];

function checkGameId(req, res) {
    var gameId = req.body.gameId - '0';
    if(!Number.isInteger(gameId) || games[gameId] == undefined) {
        res.send("Game not found");
        return true;
    } 
    return false;
}

router.post("/HTML/chat", function(req, res){
    if(checkGameId(req, res)) return;

    if(req.body.message == undefined || req.body.message.length == 0 || req.body.message.length > 50) {
        res.send();
        return;
    }

    var g = games[req.body.gameId];
     for(var j=0;j<g.players.length;j++) {
        if(req.session.username == g.players[j].username) {
            for(var i=0; i<g.players.length; i++) {
                g.players[i].inbox.push({sender:j, date:req.body.date, message:req.body.message});
                var bot = g.players[i];
                if(bot instanceof ai) setTimeout(function() {bot.react();}, 600);
            }
            res.send(g.players[j].inbox);
            g.players[j].inbox = [];
            return;
        }
    }
    res.send();
});

function takeOver(id) {
    var g = games[id];
    if(checkGameEnding(id, 0) == undefined) {
        if(g.onTable.length > 0 && g.onTable.length%g.players.length==0) {
                checkMove(g, -1);
        }
        else {
            var index = g.turn;
            var card = Math.floor(Math.random()*g.cards[index].length);
            checkMove(g, card);
        }
    }
}


router.post('/HTML/putCardOnTable', function(req, res) {
    var g = games[req.body.gameId];
    if(req.session.username == g.players[g.turn].username) {
        var ret = checkMove(g, req.body.card);
        res.send(ret);
    }
    else{
        res.send("Invalid action");
    }
})

function checkMove(g, card) {
        index = g.turn;
        var res;
        if(g.onTable.length > 0 && g.onTable.length%g.players.length==0 && card == -1) {
            g.turn = g.holder;
            addPoints(g);
            distributeCards(g);
            g.onTable = [];
            res = { onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[index],team1P: g.team1P, team2P: g.team2P, you:index, inbox:g.players[index].inbox};
        } 
        else if(g.cards[index][card] != undefined) {
            if(g.onTable.length > 0 && g.cards[index][card].substring(0,1) == g.onTable[0].substring(0,1) || g.cards[index][card].substring(0,1) == '7') g.holder=index;
            else if(g.onTable.length > 0 && g.onTable.length%g.players.length==0){
                return "Invalid action";
            }
            g.onTable.push(g.cards[index][card]);
            g.cards[index].splice(card,1);
            g.turn = (g.turn+1)%g.players.length;
            res = { onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[index],team1P: g.team1P, team2P: g.team2P, you:index, inbox:g.players[index].inbox};
        }
        else {
            return "Invalid action";
        }
        clearTimeout(g.timeout);
        g.timeoutBegin = new Date().getTime();
        g.timeout = setTimeout(function() {
            takeOver(g.id);
        }, 20000);
        var bot = g.players[g.turn];
        if(bot instanceof ai) {
            setTimeout(function() {bot.run();}, 1000);
        }

        return res;
}

function updateDB(g) {
    var gameMode;
    if(g.players.length==4) gameMode = "2v2";
    else gameMode = "1v1";

    var queryWin = "UPDATE Stats SET games"+gameMode+" = games"+gameMode+" + 1, wins"+gameMode+" = wins"+gameMode+" + 1, points"+gameMode+" = points"+gameMode+" + 5 WHERE username=?;";
    var queryLoss = "UPDATE Stats SET games"+gameMode+" = games"+gameMode+" + 1, points"+gameMode+" = points"+gameMode+" - 3 WHERE username=?;";
    var queryDraw = "UPDATE Stats SET games"+gameMode+" = games"+gameMode+" + 1 WHERE username=?;";

    var query;
    for(var i=0;i<g.players.length; i++){
        if(g.team1P == g.team2P) query=queryDraw;
        else if((i%2 == 0 && g.team1P > g.team2P) || (i%2 == 1 && g.team1P < g.team2P)) query= queryWin;
        else query=queryLoss;

        connection.query(query,[g.players[i].username]);
    }
}

function addPoints(g) {
    var points =0;
    for(var i=0;i<g.onTable.length;i++) {
        if(g.onTable[i].substring(0,1) == 'a' || g.onTable[i].substring(0,1) == '1') points++;
    }
    if(g.holder%2==0) g.team1P += points;
    else {
        g.team2P += points;
    }
}

function checkGameEnding(id, index) {
    var g = games[id];

    if(g.nrDistributedCards == 32) {
        for(var k=0; k<g.players.length;k++) 
            if(g.cards[k].length != 0) 
                return undefined;

        if(!g.end) {
            g.end = true;
            addPoints(g);
            if(!(g.players[0] instanceof ai) && !(g.players[1] instanceof ai)) updateDB(g);
            setTimeout( function() { gameIds.push(g.id); }, 5000);
        }

        if(g.team1P == g.team2P) return "Draw."; 
        else if((index%2 == 0 && g.team1P > g.team2P) || (index%2 == 1 && g.team1P < g.team2P)) return "You won!"; 
        else return "You lost!";
    }
    else return undefined;
}

router.post('/HTML/getGameState', function(req, res) {
    if(checkGameId(req, res)) return;

    var g = games[req.body.gameId];
    for(var j=0;j<g.players.length;j++) {
        if(req.session.username == g.players[j].username) {
            res.send({result:checkGameEnding(req.body.gameId, j), onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[j], team1P: g.team1P, team2P: g.team2P, you:j, inbox:g.players[j].inbox, timeoutBegin:g.timeoutBegin});
            g.players[j].inbox=[];
            return;
        }
    }
    res.send("Not authorized");
})


function shuffleCards(g) {
    var temp = allcards.slice();
    g.deck = [];
    for(var j=0;j<32;j++) {
        var index = Math.floor(Math.random()*(32-j));
        g.deck[j] = temp[index];
        temp.splice(index,1);
    }
}

function distributeCards(g) {
    // nrDistributedCards is an index in the deck array that tells us which cards we already distributed(left) and which not(right)
    var nr = g.nrDistributedCards;
    var j=0;
    while(j<4 && nr != 32) {
        if(g.cards[0][j]==undefined) {
            for(var k=0;k<g.players.length;k++) {
                g.cards[k][j]=g.deck[k+nr];
            }  
            nr+=g.players.length;
        }
        j++;
    }
    g.nrDistributedCards = nr;
}

function initializeGame(id) {
    var g = games[id];
    shuffleCards(g);
    distributeCards(g);
    g.timeout = setTimeout(function() {
        takeOver(id);
    }, 20000);
    g.timeoutBegin = new Date().getTime();
}

function initialize(g, ids, c) {
    games = g;
    gameIds = ids;
    connection = c;
}

module.exports.router = router;
module.exports.initialize = initialize;
module.exports.initializeGame = initializeGame;
module.exports.checkMove = checkMove;