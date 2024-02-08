const{ contextBridge } = require('electron');
const sqlite3 = require('sqlite3').verbose();

function alertTest(){
    alert('test1');
}

//connect to sql DB
/*
let sql = new sqlite3.Database('./data.db', sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
        console.log('Connected to the local DB.');
        sql.run(`
        CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1'))
        );

        CREATE TABLE IF NOT EXISTS Contacts(
            id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
            id_user INTEGER FOREIGN KEY REFERENCES Users(id_user) NOT NULL,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            dob DATE NOT NULL,
            relation TEXT NOT NULL,
            bio TEXT
        );

        CREATE TABLE IF NOT EXISTS 

        `, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("tabela ustvarjena oz. ze obstaja");
            }
        })
    }
});*/