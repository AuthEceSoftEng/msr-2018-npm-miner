const downloader = require('./downloader/index');
const properties = require('./properties');
const dbmanager = require('./dbmanager/index');
const lib = require('./utilities/library');
const path = require('path');
const jssa = require('jssa');
const bfj = require('bfj');

const DB_URL = properties.getCouchDBUrl();
const DB_name = properties.getDBName();
const platform = properties.getPlatform();

function getRepositorySource(repository_information, repository_index){

  return new Promise((resolve, reject) => {
    var repository_name = repository_information.latest_package_json.name + '-' + repository_information.latest_package_json.version;

    var low_lim = parseInt(repository_index/100) * 100;
    var high_lim = parseInt(repository_index/100 + 1) * 100;
    var storing_folder = properties.getStoringFolder() + path.sep + low_lim + '_' + high_lim + '_repositories';
    
    init_folder_structure = dbmanager.initRepositoryFolderStructure(storing_folder, repository_name);
    init_folder_structure.then(value =>{
      var tarball_url = repository_information.latest_package_json.dist.tarball;
      var tarball_name = tarball_url.split('/')[tarball_url.split('/').length - 1];
      var tarball_storage_path = storing_folder + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'compressed';
      var tarball_extract_path = storing_folder + path.sep + repository_name + path.sep + 'source_code' + path.sep + 'raw';
      
      downloader.getProjectTarball(tarball_url, tarball_storage_path + path.sep + tarball_name).then(value => {
        downloader.extractProjectTarball(tarball_storage_path + path.sep + tarball_name, tarball_extract_path + path.sep + repository_name).then(value =>{
          resolve(repository_information._id + ': Download source code completed successfully');
        })
        .catch(err => {
          reject('Tarball extract failed: ' + err);
        });
      })
      .catch(err => {
        reject('Download tarball failed: ' + err);
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

function analyze_code(project_name, repository_index, platform){

  return new Promise((resolve, reject) => {
    var low_lim = parseInt(repository_index/100) * 100;
    var high_lim = parseInt(repository_index/100 + 1) * 100;
    var storing_folder = properties.getStoringFolder() + path.sep + low_lim + '_' + high_lim + '_repositories';

    var project_root = storing_folder + path.sep + project_name + path.sep + 'source_code' + path.sep + 'raw' + path.sep + project_name + path.sep + 'package';
    var analysis_storing_path = storing_folder + path.sep + project_name + path.sep + 'analysis_results'

    p = lib.get_list_of_js_files(project_root);
    p.then(val =>{
      jssa.analyze_all(project_root, val, platform).then(res => {
        Array("escomplex", "nsp", "jsinspect", "eslint", "sonarjs").forEach(tool_name => {
          if(tool_name == "eslint"){
            remove_source(res[tool_name]).then(pure =>{
              bfj.write(analysis_storing_path + path.sep + tool_name + ".json", pure, {}).then(() => {

              })
              .catch(error => {
                reject(tool_name + ' results storage failed');
              });
            });
          }
          else{
            bfj.write(analysis_storing_path + path.sep + tool_name + ".json", res[tool_name], {}).then(() => {

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
  return new Promise((resolve, reject) => {
    downloader.getMostDownloadedProjectsInfo(DB_URL, DB_name, num_projects, skip).then(most_starred_projects_info => {
      for (var i = 0; i < most_starred_projects_info.rows.length; i++ ){
        var repo = most_starred_projects_info.rows[i];
        console.log(repo.id + ': Started analysis of repo (Project Index: ' + String(i + 1 + skip) + ' )');
        downloader.getProjectInfo(DB_URL, DB_name, repo.id).then(repo_info => {
          var repo_full_name = repo_info.latest_package_json.name + '-' + repo_info.latest_package_json.version
          getRepositorySource(repo_info, skip + 1).then(output => {
            console.log(output);
            analyze_code(repo_full_name, skip + 1, platform).then(analysis_output => {
              console.log(analysis_output);
              resolve(analysis_output)
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
  });
}

function analyze_project_by_name(DB_URL, DB_name, platform, project_name, index){
  return new Promise((resolve, reject) => {
    downloader.getProjectInfo(DB_URL, DB_name, project_name).then(repo_info => {
      var repo_full_name = repo_info.latest_package_json.name + '-' + repo_info.latest_package_json.version
      getRepositorySource(repo_info, index).then(output => {
        console.log(output);
        analyze_code(repo_full_name, index, platform).then(analysis_output => {
          console.log(analysis_output);
          resolve(analysis_output)
        })
        .catch(err =>{
          reject(err);
        });
      })
      .catch(err =>{
        reject(err);
      });
    })
    .catch(err =>{
      reject(err);
    });
  });
};

function analyze_from_lib(chunk, platform){
  bfj.read("data" + path.sep + "list_of_packages.json", {}).then(res => {
    return res[chunk].list_of_packages.reduce((promise, item) => {
      var package_name = item.name;
      var index = parseInt(chunk.split('_')[0], 10) + 10;
      return promise.then((result) => {
        return analyze_project_by_name(DB_URL, DB_name, platform, package_name, index).then(result => {
          return result + " Done"
        })
      })
      .catch(console.error)
    }, Promise.resolve())
  });
};

function sequential_execution(DB_URL, DB_name, platform, from_index, to_index) {
  var projects_indexes = []
  for (var i = from_index - 1; i < to_index; i++){
    projects_indexes.push(i);
  }
  return projects_indexes.reduce((promise, item) => {
    return promise.then((result) => {
      return run_full_analysis(DB_URL, DB_name, platform, 1, item).then(result => {
        analysis_results.push(result)
        return result + " Done"
      })
    })
    .catch(console.error)
  }, Promise.resolve())
}

/**
 * Run full analysis for packages residing in the CouchDB which is continuously updated.
 * The requested indexes refer to the most downloaded packages (descending order).
 * 
 */
// let analysis_results = [];
// sequential_execution(DB_URL, DB_name, platform, 1, 3).then(val =>{
//   console.log(analysis_results)
// });


/**
 * Run analysis in order to replicate the existing msr-2018-dataset 
 * using the information from data/list_of_packages.json
 * 
 * The available values for the first argument are:
 *    0_100_packages, 100_200_packages, ... , 1900_2000_packages   
 */
//analyze_from_lib("100_200_packages", platform);