function ai(g, name, i) {
    this.username = name;
    this.icon = "robot";
    this.inbox = [];
    var game = g;
    var index = i;

    this.run = function() {
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
        var texts = ["Minimal talking.", "I'm focused", "You're good at this.", "I'm having fun"]
        var rand = Math.floor(Math.random() * 8);
        if(rand >= 5) this.chat(texts[rand-5]);
        this.inbox = [];
    }
}

module.exports = ai;