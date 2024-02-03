const sqlite3 = require('sqlite3').verbose();

//connect to sql DB
let sql = new sqlite3.Database('./data.db', sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
        console.log('Connected to the local DB.');
        /*
        sql.run(`
        CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL
        );

        `, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("tabela ustvarjena oz. ze obstaja");
            }
        })
        */
    }
});