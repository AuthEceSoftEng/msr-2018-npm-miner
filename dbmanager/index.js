/**
 * This file is responsible for handling the database by creating the necessary folder structure 
 */

// Load libraries
const is_there = require('is-there');
const mkdir = require('make-dir');
const path = require('path');

module.exports = {
  // Initialize the repository folder structure
  initRepositoryFolderStructure: function (storing_folder_path, repository_name) {
    return new Promise((resolve, reject) => {
      if(!is_there(storing_folder_path + path.sep + repository_name)){
        Promise.all([
          mkdir(storing_folder_path + path.sep + repository_name + path.sep + 'source_code/compressed'),
          mkdir(storing_folder_path + path.sep + repository_name + path.sep + 'source_code/raw'),
          mkdir(storing_folder_path + path.sep + repository_name + path.sep +'analysis_results'),
        ]).then(values => {
          resolve('Success');
        })
        .catch(err => {
          reject('Error');
        });
      }
      else{
        resolve('Directory already exists');
      }
    });
  }
};