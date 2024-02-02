const sqlite3 = require('sqlite3').verbose();

//connect to sql DB
let sql = new sqlite3.Database('./data.db', sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the local DB.');
});


