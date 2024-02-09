//const{ contextBridge } = require('electron');
const sqlite3 = require('sqlite3').verbose();

/*
function alertTest(){
    alert('test1');
}
*/

//connect to sql DB

let sql = new sqlite3.Database('./DB/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
        console.log('Connected to the local DB.');

        //CREATE USERS TABLE
        sql.run(`
        CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username NVARCHAR(50) NOT NULL,
            password NVARCHAR(255) NOT NULL,
            firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1'))
        );`, 
        (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("Users table created / already exists.");
            }
        })

        //CREATE CONTACTS TABLE
        sql.run(`
        CREATE TABLE IF NOT EXISTS Contacts(
            id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
            id_user INTEGER NOT NULL,
            name NVARCHAR(50) NOT NULL,
            surname NVARCHAR(50) NOT NULL,
            dob DATE NOT NULL,
            relation TEXT NOT NULL,
            bio TEXT,
            FOREIGN KEY(id_user) REFERENCES Users(id_user)
        );
        `, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("Contacts table created / already exists.");
            }
        })

        //CREATE MAILS TABLE
        sql.run(`
        CREATE TABLE IF NOT EXISTS Mails(
            id_mail INTEGER PRIMARY KEY AUTOINCREMENT,
            id_contact INTEGER NOT NULL,
            id_user INTEGER NOT NULL,
            title NVARCHAR(50) NOT NULL,
            date_generated DATE DEFAULT CURDATE() NOT NULL,
            FOREIGN KEY(id_contact) REFERENCES Contacts(id_contact),
            FOREIGN KEY(id_user) REFERENCES Users(id_user) 
        );

        `, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("Mails table created / already exists.");
            }
        })
    }
});