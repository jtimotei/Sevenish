var express = require("express"),
    url = require("url"),
    http = require("http");

var app = express();

http.createServer(app).listen(3000);

function logger(req, res, next) {
    console.log("Hi");
    next();
}

function delimiter(req, res, next) {
    console.log("------------");
    next();
}
app.use(logger);

app.get("/*", function(req, res, next){
    console.log("World!");
    //res.send("Sorry, this page is not yet implemented. Try the path /whadap");
    next();
});

app.use("/whadap", function(req, res, next) {
    res.send("WHADAP PEOPLE?!");
    next();
})

app.use("/whadap", function(req, res, next) {
    console.log("Hello2");
    next();
})

app.use(delimiter);