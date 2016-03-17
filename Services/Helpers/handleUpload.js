module.exports = (function (App, Package, privateMethods) {
    var Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs-extra')),
        path = require('path'),
        Resizer = require('./resizeImage')(App, Package, privateMethods),
        baseDir = '',
        Image = {
            copies: {}
        };

    //My responsibility is to move the uploaded file to its destination defined by the config
    //Optionally, i can resize this file and produce copies for each size
    //itemObj referes to an optional object (like a product) which will be used to build a path or rename the file
    return function (file, Config, itemObj) {

        var asyncTasks = [];
        baseDir = privateMethods.replaceParams(Config.dir, itemObj);

        //move the file
        return moveOriginal(file)
            .then(function (newFile) {
                if (!Config.copies) {
                    return Image;
                }

                return createCopies(newFile, Config.copies);
            })
            .then(function (copies) {
                for (var j in copies){
                    if (!copies[j].name){
                        continue;
                    }

                    Image.copies[copies[j].name] = copies[j];

                }

                return Image;
            });





        function moveOriginal(file) {
            //check if we are to keep originals and then move it to originals folder
            var destinationDir = (typeof Package.options.originalsFolder != 'undefined')
                ? baseDir + '/' + Package.options.originalsFolder + '/'
                : baseDir + '/';

            return fs.moveAsync(file.path, baseDir + 'originals/' + file.originalname, {clobber: true})
                .then(function () {
                    var newImageLocation = path.join(Package.baseDir, destinationDir + file.originalname);
                    Image.copies.originals = {
                        imagePath: newImageLocation,
                    };

                    if (itemObj){
                        Image.copies.originals.imagePath = privateMethods.replaceParams(Config.url, itemObj) + (Package.options.originalsFolder || '') + '/' + file.originalname;

                    }

                    return newImageLocation;
                });
        }

        function createCopies(file, copies) {
            var toResize = [];
            for (var i in copies) {
                var destFolder = baseDir + copies[i].dir;
                copies[i].name = i;
                if (itemObj){
                    copies[i].imageUrl = privateMethods.replaceParams(Config.url, itemObj) + copies[i].dir + '/' + path.basename(file);
                }
                
                toResize.push(new Resizer().resize(file, destFolder ,copies[i]));
            }

            return Promise.all(toResize);
        }
    };


});
