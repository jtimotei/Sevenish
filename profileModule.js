var express =require("express");
var router = new express.Router();

router.get("/getInfo", function(req, res) {
    res.send({
        username: req.session.username,
        name: req.session.name,
        surname: req.session.surname,
        icon: req.session.icon,
        winRate1v1: 0,
        winRate2v2: 0
    });
})

module.exports.router = router;