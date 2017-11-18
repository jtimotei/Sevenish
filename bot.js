var gameModule = require("./gameModule.js");
var Set = require("set");

function ai(g, name, i) {
    // public attributes
    this.username = name;
    this.icon = "robot";
    this.inbox = [];

    // private atributes
    var game = g;
    var index = i;
    var playedCards = new Set();
    var uselessCards = new Set([ "8", "9", "j","q","k"]);
    var cards = game.cards[index];
    

    this.run = function() {
        updatePlayedCards();
        if(game.onTable.length % 2 != 0) gameModule.checkMove(game, defendStrat());
        else gameModule.checkMove(game, attackStrat());
    }

    function updatePlayedCards() {
        for(var i=0; i<cards.length; i++) playedCards.add(cards[i]);
        for(var i=0; i<game.onTable.length; i++) playedCards.add(game.onTable[i]);
    }

    function attackStrat() {
        if(g.onTable.length > 0 && g.onTable.length%g.players.length==0) return -1;
        return 0;
    }

    function defendStrat() {
        var uselessCard = -1;
        if(uselessCards.contains(game.onTable[0].substring(0,1))) {
            for(var i=0; i<cards.length; i++) {
                if(cards[i].substring(0,1) == game.onTable[0].substring(0,1)) {
                    return i;
                }
                else if(uselessCards.contains(cards[i])) {
                    // this can be replaced by looking at which is the card with 
                    // the smallest chance of being in the hand of the opponent
                    uselessCard = i; 
                }
            }
            if(uselessCard != -1) return uselessCard;
            else {
                return 0;
            }
        }
        return 0;
    }

    this.chat = function(message) {
        for(var i=0; i<game.players.length; i++) {
            game.players[i].inbox.push({sender:index, date:new Date(), message:message});
        }
    }

    this.greet = function() {
        var greetings = ["Howdy!", "Greetings", "Get ready to lose.", "Hi there!"];
        this.chat(greetings[Math.floor(Math.random()*4)]);
    }

    this.react = function() {
        var texts = ["Minimal talking.", "I'm focused.", "I'm focused.", "Minimal talking.", "You're good at this!", "I'm having fun!"]
        var rand = Math.floor(Math.random() * 14);
        if(rand >= 8) this.chat(texts[rand-8]);
        this.inbox = [];
    }
}

module.exports = ai;