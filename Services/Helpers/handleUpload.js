module.exports = (function (App, Package, privateMethods) {
    var Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs-extra')),
        lo = require('lodash'),
        async = require('async'),
        path = require('path');


    //My responsibility is to move the uploaded file to its destination defined by the config
    //Optionally, i can resize this file and produce copies for each size
    //itemObj referes to an optional object (like a product) which will be used to build a path or rename the file
    function HandleUpload(file, Config, itemObj) {
        var _this = this;
        this.Resizer = require('./resizeImage')(App, Package, privateMethods);
        this.Image = lo.clone({
                copies: {}
            });
        this.baseDir = privateMethods.replaceParams(Config.dir, itemObj);
        this.Copies = lo.clone(Config.copies);

        //move the file
        return moveOriginal(file)
            .then(function (newFile) {
                if (!_this.Copies) {
                    return _this.Image;
                }

                return createCopies(newFile, _this.Copies);
            }).then(function (copies) {
                return _this.Image;
            });

        function moveOriginal(file) {
            //check if we are to keep originals and then move it to originals folder
            var destinationDir = (typeof Package.options.originalsFolder != 'undefined')
                ? _this.baseDir + '/' + Package.options.originalsFolder + '/'
                : _this.baseDir + '/';

            return fs.moveAsync(file.path, _this.baseDir + 'originals/' + file.originalname, {clobber: true})
                .then(function () {
                    var newImageLocation = path.join(Package.baseDir, destinationDir + file.originalname);
                    _this.Image.copies.originals = {
                        imagePath: newImageLocation,
                    };

                    if (itemObj){
                        _this.Image.copies.originals.imageUrl = privateMethods.replaceParams(Config.url, itemObj) + (Package.options.originalsFolder || '') + '/' + file.originalname;

                    }

                    return newImageLocation;
                });
        }

        function createCopies(file, copies) {
            var toResize = [],
                items = lo.clone(copies);

            lo.forEach(items,function (item,name) {
                _this.Image.copies[name] = lo.clone(item);
                var destFolder = _this.baseDir + item.dir;
                item.name = name;
                if (itemObj){
                    var imageName = (item.prefix) ? item.prefix + path.basename(file) : path.basename(file);
                    _this.Image.copies[name].imageUrl = privateMethods.replaceParams(Config.url, itemObj) + item.dir + '/' + imageName;
                }

                toResize.push(_this.Resizer(file, destFolder ,item));
            });


            return Promise.all(toResize);
        }
    }


    return HandleUpload;
});
