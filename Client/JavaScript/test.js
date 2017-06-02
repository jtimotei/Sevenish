window.onload = function() {
    const allcards = [7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,'J','J','J','J','K','K','K','K','Q','Q','Q','Q','A','A','A','A'];
    var games = [{cards:[[],[],[],[]]}];

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
    for(;j<4;j++) {
        if(games[i].cards[0][j]==undefined) break;
    }
    games[i].cards[0][j]=games[i].deck[0+nr];
    games[i].cards[1][j]=games[i].deck[1+nr];
    games[i].cards[2][j]=games[i].deck[2+nr];
    games[i].cards[3][j]=games[i].deck[3+nr];    
    
    games[i].nrDistributedCards+=4;
}

    games[0].nrDistributedCards = 0;
    shuffleCards(0);
    distributeCards(0);
    distributeCards(0);
    console.log(games);
}