/**
 * This is a properties file that enables the configuration of certain essentials parameters 
 */

// Load libraries
const request = require('request');
const download = require('download');
const fs = require('fs');
const decompress = require('decompress');

module.exports = {
  // Get the N most starred npm packages
  getMostStarredProjectsInfo: function (DB_url, DB_name, numProjects) {
    return new Promise((resolve, reject) => {
      request.get({
        url: DB_url + '/' + DB_name + '/_design/analytics/_view/stars?descending=true&limit=' + numProjects
        
    }, function(error, response, body){

        if(error){
          reject('Error in communication with couchDB');
        }
        else{
          if (response.statusCode != 200){
            reject(response.statusCode);
          }
          else{
            resolve(JSON.parse(response.body));
          }
        }
      });
    });
  },
  getProjectInfo: function (DB_url, DB_name, project_name) {
    return new Promise((resolve, reject) => {
      request.get({
        url: DB_url + '/' + DB_name + '/' + project_name
        
      }, function(error, response, body){

          if(error){
            reject('Error in communication with couchDB');
          }
          else{
            if (response.statusCode != 200){
              reject(response.statusCode);
            }
            else{
              resolve(JSON.parse(response.body));
            }
          }
      });
    });
  },
  getProjectTarball: function (url, path_to_store) {
    return new Promise((resolve, reject) => {
      download(url).then(data => {
        fs.writeFileSync(path_to_store, data);
      })
      .then(data => {
        resolve('Download successful');
      })
      .catch(err => {
        reject('Error downloading tarball: ' + err);
      });
    });
  },
  extractProjectTarball: function (tarball_path, path_to_store) {
    return new Promise((resolve, reject) => {
      decompress(tarball_path, path_to_store).then(data => {
        resolve('Extract successful');
      })
      .catch(err => {
        reject('Error extracting tarball: ' + err);
      });
    });
  }
};