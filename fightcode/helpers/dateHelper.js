var EJS = require('ejs');

EJS.filters.showAsDate = function(raw_date) {
    var date = new Date(Date.parse(raw_date));
    return date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear();
};