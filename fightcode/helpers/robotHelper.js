var EJS = require('ejs');

EJS.filters.colorStyle = function(element) {
    var color = element;
    if (typeof element !== "string"){
        color = element.color;
    }
    if (color === "") {
      color = "#ED002D";
    }
    return "style=\"background-color: "+color+"\"";
};