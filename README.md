[![Cyclopt rating](https://qaas.cyclopt.com/api/projects/5b0d25d8d9f77a0004f0c108/badge)](https://qaas.cyclopt.com)

# msr-2018-dataset
> This repository contains the source code used to create the "NPM-MINER" dataset submitted at the Data Showcase Track of the "[Mining Software Repositories (MSR)](https://2018.msrconf.org/)" conference.

## Installation
In order to use `msr-2018-dataset` follow the next steps:
1. Clone the repository `AuthEceSoftEng/msr-2018-npm-miner` using the following command:
```sh
$ git clone https://github.com/AuthEceSoftEng/msr-2018-npm-miner.git
```
2. Move to the `AuthEceSoftEng/msr-2018-npm-miner` root directory and install the dependencies using the command:
```sh
$ npm install
```
3. Install `jssa` locally following the instructions found at [jssa documentation](https://github.com/cyclopt/jssa/blob/master/README.md):

## Usage
In order to reproduce the `NPM-MINER` dataset follow the steps:
1. Set the results storing directory by modifying the `properties.js` file:
```javascript
 getStoringFolder: function (){
    return "path_to_storing_folder"; // Place the path to your storing folder
}
```
2. Run the analysis, which supports two modes: `sequential` and `parallel`
- **sequential mode**
```javascript
/**
   * @param {String} DB_URL - The URL through which the couchDB is accessible.
   * @param {String} DB_name - The name of the database.
   * @param {String} platform - "WINDOWS"/"LINUX".
   * @param {Number} from_index - The starting index of the projects to analyze.
   * @param {Number} to_index - The ending index of the projects to analyze.
   */
let analysis_results = [];
sequential_execution(DB_URL, DB_name, platform, from_index, to_index).then( val =>{
  console.log(analysis_results)
});
```
**Example**
```javascript
// Analyze the projects from index 101-110
let analysis_results = [];
sequential_execution(DB_URL, DB_name, "WINDOWS", 101, 110).then( val =>{
  console.log(analysis_results)
});
```
- **parallel mode**
```javascript
/**
   * @param {String} DB_URL - The URL through which the couchDB is accessible.
   * @param {String} DB_name - The name of the database.
   * @param {String} platform - "WINDOWS"/"LINUX".
   * @param {Number} num_projects - The number of projects to analyze.
   * @param {Number} skip - The number of projects to skip.
   */
run_full_analysis(DB_URL, DB_name, platform, num_projects, skip)
```
**Example**
```javascript
// Analyze the projects from index 101-110
run_full_analysis(DB_URL, DB_name, "WINDOWS", 10, 100)
```
