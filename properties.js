/**
 * This is a properties file that enables the configuration of certain essentials parameters 
 */

module.exports = {

  // This function provides the URL of the CouchDB
  getCouchDBUrl: function (){
    return "http://couchdb.npm-miner.com:5984";
  },
  // This function provides the name of the database that holds the informatioon of the npm packages
  getDBName: function (){
    return "npm-packages";
  }
}