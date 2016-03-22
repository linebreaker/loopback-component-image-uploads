module.exports = (function(App,Package){

  privateMethods = {
      replaceParams : require('./Helpers/private/replaceParams')(App,Package)
  };



  return {
    name : 'Image',
    nameSpace : 'Image',
      handleUpload : require('./Helpers/handleUpload')(App,Package,privateMethods),
      handleUploadAsync : require('./Helpers/handleUploadAsync')(App,Package,privateMethods),
      resizeImage : require('./Helpers/resizeImage')(App,Package,privateMethods),
  };
});
