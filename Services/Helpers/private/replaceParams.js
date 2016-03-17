module.exports = (function (App, Package) {
    return function(string, item) {
        var regex = new RegExp('(:[a-zA-z0-9]+)', 'g'),
            params = string.match(regex),
            temp = string;
        for (var i in params) {
            var param = params[i].replace(':', '');
            temp = temp.replace(params[i], item[param]);
        }

        return temp;
    }

});
