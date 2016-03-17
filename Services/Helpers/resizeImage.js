module.exports = (function(App,Package,privateMethods){
    var im = require('imagemagick'),
        Promise = require('bluebird'),
        fs = Promise.promisifyAll(require('fs-extra')),
        path = require("path");

    function Resizer() {
        this.resize = performResize;
    }

    function performResize(sourceImage,destFolder, copy){
        return new Promise(function (resolve, reject) {
            try {
                var stats = fs.lstatSync(destFolder);
            } catch (e){
                fs.ensureDirSync(destFolder);
            }
            var destImage = path.join(destFolder, path.basename(sourceImage));

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
    return Resizer;
});
