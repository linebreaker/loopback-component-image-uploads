module.exports = (function (App, Package, privateMethods) {
    var Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs-extra')),
        lo = require('lodash'),
        async = require('async'),
        path = require('path'),
        Resizer = require('./resizeImage')(App, Package, privateMethods);


    //My responsibility is to move the uploaded file to its destination defined by the config
    //Optionally, i can resize this file and produce copies for each size
    //itemObj referes to an optional object (like a product) which will be used to build a path or rename the file
    return function(file, Config, itemObj,callback) {

        var _this = this;
        this.Image = {};

        this.baseDir = privateMethods.replaceParams(Config.dir, itemObj);
        this.Copies = lo.clone(Config.copies);
        var tasks = [
            moveOriginal.bind(null,file)
        ];



        moveOriginal(file,function (err, movedImageLocation) {
            if (err){
                return callback(err);
            }

            var copiesTasks = [];

            if (Config.copies){
                for (var i in Config.copies){
                    copiesTasks.push(createCopy.bind(null,movedImageLocation,i,Config.copies[i]));
                }
            }

            async.series(copiesTasks,function (err, result) {
                callback(null,_this.Image);
            });


        });

        function moveOriginal(file,next) {
            _this.Image.copies = {};
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
                        _this.Image.copies.originals.imagePath = privateMethods.replaceParams(Config.url, itemObj) + (Package.options.originalsFolder || '') + '/' + file.originalname;

                    }

                    next(null,newImageLocation);
                })
                .catch(function (err) {
                    console.log('Err in Move',err.stack);
                    next(err);
                });
        }

        function createCopies(file,next) {
            var toResize = [],
                items = lo.clone(_this.Copies);
            // console.log(items)

            lo.forEach(items,function (item,name) {
                _this.Image.copies[name] = lo.clone(item);
                var destFolder = _this.baseDir + item.dir;
                // item.name = name;
                if (itemObj){
                    var imageName = (item.prefix) ? item.prefix + path.basename(file) : path.basename(file);
                    _this.Image.copies[name].imageUrl =  privateMethods.replaceParams(Config.url, itemObj) + item.dir + '/' + imageName;
                }

                toResize.push(_this.Resizer.bind(null,file, destFolder ,item));
            });


            next();
            // async.parallel(toResize,next);
        }

        function createCopy(file, name, copy, done) {
            var destFolder = _this.baseDir + copy.dir;
            _this.Image.copies[name] = {
                imageUrl : ''
            };

            if (itemObj){
                var imageName = (copy.prefix) ? copy.prefix + path.basename(file) : path.basename(file);
                _this.Image.copies[name].imageUrl =  privateMethods.replaceParams(Config.url, itemObj) + copy.dir + '/' + imageName;
            }

            Resizer(file, destFolder ,copy,function (err,imagePath) {
                _this.Image.copies[name].imagePath = imagePath;
                done();
            });

        }


    }



});
