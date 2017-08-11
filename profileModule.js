var express =require("express");
var router = new express.Router();
var connection;

function getWinrate(games, wins) {
    if(games==0) return 0;
    return Math.floor((wins*100)/games);
}

router.get("/getInfo", function(req, res) {
    var winRate1v1;
    var winRate2v2;

     connection.query("SELECT * FROM (SELECT bar1.* FROM (SELECT @i:=@i+1 AS rank1v1, t1.username, t1.games1v1, t1.wins1v1, t1.points1v1 FROM (SELECT * FROM Stats ORDER BY points1v1 DESC, wins1v1 DESC) AS t1 , (SELECT @i:=0) AS foo1) AS bar1 WHERE username = ?) AS table1, (SELECT bar2.* FROM (SELECT @j:=@j+1 AS rank2v2, t2.username, t2.games2v2, t2.wins2v2, t2.points2v2 FROM (SELECT * FROM Stats ORDER BY points2v2 DESC, wins2v2 DESC) AS t2 , (SELECT @j:=0) AS foo2) AS bar2 WHERE username = ?) AS table2;", [req.session.username, req.session.username], function(err, rows, fields) {
        if(rows[0] == undefined){
            res.send({message:"Error retrieving data."});
            return;
        } else {
            winRate1v1=getWinrate(rows[0].games1v1, rows[0].wins1v1);
            winRate2v2=getWinrate(rows[0].games2v2, rows[0].wins2v2)
            res.send({
                username: req.session.username,
                name: req.session.name,
                surname: req.session.surname,
                icon: req.session.icon,
                winRate1v1: winRate1v1,
                winRate2v2: winRate2v2,
                rank1v1: rows[0].rank1v1,
                rank2v2: rows[0].rank2v2,
                points1v1: rows[0].points1v1,
                points2v2: rows[0].points2v2
            });
        }
    });


})

router.get("/top1v1", function(re1, res) {
        connection.query("SELECT username, points1v1 AS points FROM Stats ORDER BY points1v1 DESC, wins1v1 DESC LIMIT 10", function(err, rows, fields) {
        if(rows[0] == undefined){
            res.send({message:"Error retrieving data."});
            return;
        } else {
            res.send({
               list:rows
            });
        }
    });
});

router.get("/top2v2", function(re1, res) {
        connection.query("SELECT username, points2v2 AS points FROM Stats ORDER BY points2v2 DESC, wins2v2 DESC LIMIT 10", function(err, rows, fields) {
        if(rows[0] == undefined){
            res.send({message:"Error retrieving data."});
            return;
        } else {
            res.send({
               list:rows
            });
        }
    });
});

function initializeConnection(c) {
    connection = c;
}

module.exports.router = router;
module.exports.initializeConnection = initializeConnection;