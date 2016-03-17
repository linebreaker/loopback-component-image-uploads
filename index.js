module.exports = function (App, options) {
    var path = require('path');

    function ServiceProvider() {
        var _this = this;

        this.package = {
            name: 'mcmsNodeImageUploads',
            options: options || {},
            settings : {},
            baseDir : App.Config.baseDir || options.baseDir || path.resolve('./')
        };

        //Load the config
        if (typeof options == 'object' && options.config){
            //Acceptable types is file,property,object
            //file should be absolute path
            if (options.type == 'file'){
                this.package.settings = require(options.name);
            } else if (options.type == 'property'){
                this.package.settings = App.Config[options.name];
            } else {
                this.package.settings = options.value;//assume object
            }
        }

        App.Services[this.package.name] = this.package.Services =  App.helpersLoader.loadServices(__dirname + '/Services', null, this.package);
        App.Workers[this.package.name] =  this.package.Workers =  App.helpersLoader.loadDirContents(__dirname + '/Workers', null, this.package);


        App.on('booted',function () {
            //Everything is loaded, do something fancy

        });

    }

    return new ServiceProvider();
};
