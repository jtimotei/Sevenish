function verifyUsername(text){
    var length = text.length;
    for(var i=0; i<length;i++){
        if((text.charCodeAt(i) >= 65 && text.charCodeAt(i)<=90) || (text.charCodeAt(i) >= 97 && text.charCodeAt(i)<=122)) {
            return true;
        }
    }
    return false;
}

function verifyEmpty(text){
    var length = text.length;
    if(text.length == 0) return false;
    for(var i=0;i<length;i++){
        if(text[i] !== " "){
            return true;
        }
    }
    return false;
}

module.exports.verifyUsername = verifyUsername;
module.exports.verifyEmpty = verifyEmpty;