/**
 * This is a properties file that enables the configuration of certain essentials parameters 
 */

// Load libraries
request = require('request');


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
            resolve(response.body);
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
              resolve(response.body);
            }
          }
      });
    });
  }
};