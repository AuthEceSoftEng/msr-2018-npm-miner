const downloader = require('./downloader/index');
const properties = require('./properties');
const dbmanager = require('./dbmanager/index');
const path = require('path');

DB_URL = properties.getCouchDBUrl();
DB_name = properties.getDBName();

function getRepositorySource(repository_information){

  var repository_name = repository_information.latest_package_json.name + '-' + repository_information.latest_package_json.version;

  init_folder_structure = dbmanager.initRepositoryFolderStructure(properties.getStoringFolder(), repository_name);
  init_folder_structure.then(value =>{
    var tarball_url = repository_information.latest_package_json.dist.tarball;
    var tarball_name = tarball_url.split('/')[tarball_url.split('/').length - 1];
    var tarball_storage_path = properties.getStoringFolder() + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'compressed';
    var tarball_extract_path = properties.getStoringFolder() + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'raw';
    
    downloader.getProjectTarball(tarball_url, tarball_storage_path + path.sep + tarball_name).then(value => {
      downloader.extractProjectTarball(tarball_storage_path + path.sep + tarball_name, tarball_extract_path + path.sep + repository_name).then(value =>{
        console.log('Downlad source code completed successfully');
      })
      .catch(err => {
        console.log('Tarball extract failed');
      });
    })
    .catch(err => {
      console.log('Download tarball failed');
    });
  })
  .catch(err => {
    console.log('Initialize structure failed: ' + err);
  });

};


// p = downloader.getProjectInfo(DB_URL, DB_name, 'bootstrap');
// Promise.all([p]).then(values => {
//   var info = JSON.parse(values[0]);
  
//   getRepositorySource(info);
//   //console.log(JSON.parse(values[0])._id);
// })
// .catch(function(err) {
//   console.log(err); // some coding error in handling happened
// });