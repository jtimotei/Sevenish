var express =require("express");
var router = new express.Router();

var games;
const allcards = ["7_of_clubs","7_of_diamonds","7_of_hearts","7_of_spades","8_of_clubs","8_of_diamonds","8_of_hearts","8_of_spades","9_of_clubs","9_of_diamonds","9_of_hearts","9_of_spades",
"10_of_clubs","10_of_diamonds","10_of_hearts","10_of_spades","jack_of_clubs2","jack_of_diamonds2","jack_of_hearts2","jack_of_spades2","queen_of_clubs2","queen_of_diamonds","queen_of_hearts2",
"queen_of_spades2","king_of_clubs2","king_of_diamonds2","king_of_hearts2","king_of_spades2","ace_of_clubs","ace_of_diamonds","ace_of_hearts","ace_of_spades"];

router.post('/HTML/init', function (req, res) {
   if(req.body.gameId != undefined && req.body.gameId<games.length) {
       var g = games[req.body.gameId];
       var index = -1;
       for(var i=0;i<4;i++){
           if(g.players[i].username == req.session.username) {
               index = i;
               break;
           }
       }
       if(index>=0){
           if(g.deck==undefined) initializeGame(req.body.gameId);
           res.send({ onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[index],team1P: g.team1P, team2P: g.team2P, you:index});
           return;
       }
       res.send("Access denied");
       
    }
    res.send("Game not found");
});

router.post('/HTML/putCardOnTable', function(req, res) {
    var g = games[req.body.gameId];
    if(req.session.username == g.players[g.turn].username) {
        index = g.turn;
        if(g.onTable.length > 0 && g.onTable.length%4==0 && req.body.card == -1) {
            g.turn = g.holder;
            addPoints(req.body.gameId);
            distributeCards(req.body.gameId);
            g.onTable = [];
            res.send({ onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[index],team1P: g.team1P, team2P: g.team2P, you:index});
        } 
        else if(g.cards[index][req.body.card] != undefined) {
            if(g.onTable.length > 0 && g.cards[index][req.body.card].substring(0,1) == g.onTable[0].substring(0,1) || g.cards[index][req.body.card].substring(0,1) == '7') g.holder=index;
            else if(g.onTable.length > 0 && g.onTable.length%4==0){
                res.send("Invalid action");
                return;
            }
            g.onTable.push(g.cards[index][req.body.card]);
            g.cards[index].splice(req.body.card,1);
            if(g.turn == 3) g.turn = 0;
            else g.turn++;
            res.send({ onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[index],team1P: g.team1P, team2P: g.team2P, you:index});
        }
    }
    else{
        res.send("Invalid action");
    }
})

function addPoints(index) {
    var g = games[index];
    var points =0;
    for(var i=0;i<g.onTable.length;i++) {
        if(g.onTable[i].substring(0,1) == 'a' || g.onTable[i].substring(0,1) == '1') points++;
    }
    if(g.holder%2==0) g.team1P += points;
    else {
        g.team2P += points;
    }
}

router.post('/HTML/getGameState', function(req, res) {
    if(req.body.gameId == undefined || games.length <= req.body.gameId) {
        res.send("Game not found");
        return;
    }

    var g = games[req.body.gameId];
    for(var j=0;j<4;j++) {
        if(req.session.username == g.players[j].username) {
            res.send({ onTable:g.onTable, players:g.players, turn: g.turn, cards:g.cards[j], team1P: g.team1P, team2P: g.team2P, you:j});
            return
        }
    }
    res.send("Not authorized");
})


function shuffleCards(i) {
    var temp = allcards.slice();
    games[i].deck = [];
    for(var j=0;j<32;j++) {
        var index = Math.floor(Math.random()*(32-j));
        games[i].deck[j] = temp[index];
        temp.splice(index,1);
    }
}

function distributeCards(i) {
    // nrDistributedCards is an index in the deck array that tells us which cards we already distributed(left) and which not(right)
    var nr = games[i].nrDistributedCards;
    var j=0;
    while(j<4 && nr != 32) {
        if(games[i].cards[0][j]==undefined) {
            games[i].cards[0][j]=games[i].deck[0+nr];
            games[i].cards[1][j]=games[i].deck[1+nr];
            games[i].cards[2][j]=games[i].deck[2+nr];
            games[i].cards[3][j]=games[i].deck[3+nr];    
            nr+=4;
        }
        j++;
    }
    games[i].nrDistributedCards = nr;
}

function initializeGame(i) {
    shuffleCards(i);
    distributeCards(i);
    games[i].begin = Date.now();
}

function initialize(g) {
    games = g;
}

module.exports.router = router;
module.exports.initialize = initialize;