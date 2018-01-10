downloader = require('./downloader/index');
properties = require('./properties');

DB_URL = properties.getCouchDBUrl();
DB_name = properties.getDBName();

p = downloader.getMostStarredProjectsInfo(DB_URL, DB_name, 15);
Promise.all([p]).then(values => {
  console.log(values[0]);
})
.catch(function(err) {
  console.log(err); // some coding error in handling happened
});