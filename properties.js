/**
 * This is a properties file that enables the configuration of certain essentials parameters 
 */

// Load libraries
const path = require('path');
const os = require('os');

module.exports = {

  // This function provides the URL of the CouchDB
  getCouchDBUrl: function (){
    return "http://couchdb.npm-miner.com:5984";
  },
  getPlatform: function (){
    if(os.platform() === 'win32'){
      return 'WINDOWS'
    }
    else{
      return os.platform();
    }
  },
  // This function provides the name of the database that holds the informatioon of the npm packages
  getDBName: function (){
    return "npm-packages";
  },
  // This function provides the path of the root folder for storing the results
  getStoringFolder: function (){
    return "msr-2018-dataset";
  }
}