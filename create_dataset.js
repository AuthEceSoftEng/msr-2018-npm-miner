const downloader = require('./downloader/index');
const properties = require('./properties');
const dbmanager = require('./dbmanager/index');
const lib = require('./utilities/library');
const path = require('path');
const jssa = require('jssa');
const bfj = require('bfj');

DB_URL = properties.getCouchDBUrl();
DB_name = properties.getDBName();

function getRepositorySource(repository_information){

  return new Promise((resolve, reject) => {
    var repository_name = repository_information.latest_package_json.name + '-' + repository_information.latest_package_json.version;

    init_folder_structure = dbmanager.initRepositoryFolderStructure(properties.getStoringFolder(), repository_name);
    init_folder_structure.then(value =>{
      var tarball_url = repository_information.latest_package_json.dist.tarball;
      var tarball_name = tarball_url.split('/')[tarball_url.split('/').length - 1];
      var tarball_storage_path = properties.getStoringFolder() + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'compressed';
      var tarball_extract_path = properties.getStoringFolder() + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'raw';
      
      downloader.getProjectTarball(tarball_url, tarball_storage_path + path.sep + tarball_name).then(value => {
        downloader.extractProjectTarball(tarball_storage_path + path.sep + tarball_name, tarball_extract_path + path.sep + repository_name).then(value =>{
          resolve(repository_information._id + ': Download source code completed successfully');
        })
        .catch(err => {
          reject('Tarball extract failed');
        });
      })
      .catch(err => {
        reject('Download tarball failed');
      });
    })
    .catch(err => {
      reject('Initialize structure failed: ' + err);
    });
  });
};

function remove_source(eslint_results_obj){

  return new Promise((resolve, reject) => {
    for (var i = 0; i < eslint_results_obj.results.length; i++){
      delete eslint_results_obj.results[i].source;
      //delete eslint_results_obj.results[i].messages;
    }
    resolve(eslint_results_obj)
  });
};

function analyze_code(project_name, platform){

  return new Promise((resolve, reject) => {
    var project_root = properties.getStoringFolder() + '\\' + project_name + '\\source_code\\raw\\' + project_name + '\\package';
    var analysis_storing_path = properties.getStoringFolder() + '\\' + project_name + '\\analysis_results'

    p = lib.get_list_of_js_files(project_root);
    p.then(val =>{
      jssa.analyze_all(project_root, val, platform).then(res => {
        Array("escomplex", "nsp", "jsinspect", "eslint", "sonarjs").forEach(tool_name => {
          if(tool_name == "eslint"){
            remove_source(res[tool_name]).then(pure =>{
              bfj.write(analysis_storing_path + '\\' + tool_name + ".json", pure, {}).then(() => {

              })
              .catch(error => {
                reject(tool_name + ' results storage failed');
              });
            });
          }
          else{
            bfj.write(analysis_storing_path + '\\' + tool_name + ".json", res[tool_name], {}).then(() => {

            })
            .catch(error => {
              reject(tool_name + ' results storage failed');
            });
          }
        });
        resolve(project_name + ": Analysis Successful");
      })
      .catch(err => {
        reject('jssa failed: ' + err);
      });  
    })
    .catch(err => {
      reject('Get js files failed: ' + err);
    });
  });
};

function run_full_analysis(DB_URL, DB_name, platform, num_projects, skip){
  downloader.getMostDownloadedProjectsInfo(DB_URL, DB_name, num_projects, skip).then(most_starred_projects_info => {
    for (var i = 0; i < most_starred_projects_info.rows.length; i++ ){
      var repo = most_starred_projects_info.rows[i];
      console.log(repo.id + ': Started analysis of repo (Project Index: ' + String(i + 1 + skip) + ' )');
      downloader.getProjectInfo(DB_URL, DB_name, repo.id).then(repo_info => {
        var repo_full_name = repo_info.latest_package_json.name + '-' + repo_info.latest_package_json.version
        getRepositorySource(repo_info).then(output => {
          console.log(output);
          analyze_code(repo_full_name, platform).then(analysis_output => {
            console.log(analysis_output);  
          })
          .catch(err =>{
            console.log(err);
          });
        })
        .catch(err =>{
          console.log(err);
        });
      })
      .catch(err =>{
        console.log(err);
      });
    }
  })
  .catch(function(err) {
    console.log(err);
  });
} 

// Run full analysis
run_full_analysis(DB_URL, DB_name, "WINDOWS", 8, 12);