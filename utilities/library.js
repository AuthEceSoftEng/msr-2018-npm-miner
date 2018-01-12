/**
 * This is a properties file that enables the configuration of certain essentials parameters 
 */

// Include libraries 
const walk = require('walk');
const path = require('path');

module.exports = {
  // Get an array containing the paths of all .js files included in a given directory
  get_list_of_js_files: function (root_dir){

    return new Promise((resolve, reject) => {
      walker = walk.walk(root_dir, { filters: ["node_modules"] });
      var list_of_files = [];
      walker.on("file", function (root, fileStats, next) {
        if(fileStats.name.endsWith('.js')){
          list_of_files.push(root + path.sep + fileStats.name);
        }
        next();
      });
      walker.on("end", function () {
        resolve(list_of_files);
      });
    });
  }
}