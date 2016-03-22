module.exports = (function(App,Package,privateMethods){
    var im = require('imagemagick'),
        Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs-extra')),
        path = require("path");


    return function(sourceImage,destFolder, copy){
        return new Promise(function (resolve, reject) {
            try {
                var stats = fs.lstatSync(destFolder);
            } catch (e){
                fs.ensureDirSync(destFolder);
            }

            var imageName = (copy.prefix) ? copy.prefix + path.basename(sourceImage) : path.basename(sourceImage),
                destImage = path.join(destFolder, imageName);

            im.resize({
                srcPath: sourceImage,
                dstPath: destImage,
                width: copy.width,
                height: copy.height,
                quality: copy.quality || 1,
                gravity: 'Center'
            }, function(err, stdout, stderr){
                if (err) {
                    return reject(err);
                }

                copy.imagePath = path.resolve(destImage);

                resolve(copy);
            });
        });

    }

});
