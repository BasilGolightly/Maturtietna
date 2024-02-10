let loginDisplayMode = 0;
let accounts = document.getElementsByClassName('accountWrap');
let accList = document.getElementById('accountsList');
let loginPage = document.getElementById('loginPromptWrap');
let loginNameOut = document.getElementById('loginName');

function loginDisplay(mode, accId){
    switch(mode){
        //show account list
        case 0:
            loginNameOut.innerHTML = "";
            //document.getElementById('loginTitle').innerHTML = `Login`;
            loginPage.style.display = "none";
            /*for(let i = 0; accounts.length; i++){
                accounts[i].style.display = "flex";
            }*/
            accList.style.display = "flex";
            loginDisplayMode = 0;
            break;
        //password prompt - selected account
        case 1:
            /*for(let i = 0; accounts.length; i++){
                accounts[i].style.display = "none";
            }*/
            if(accId > -1){
                loginDisplayMode = 1;
                accList.style.display = "none";
                loginPage.style.display = "flex";
                let username = document.getElementById('accountName' + accId).innerHTML.trim();
                //console.log(username)
                //document.getElementById('loginTitle').innerHTML = `Login`;
                loginNameOut.innerHTML = 'for ' + username;
            }
            else{
                loginDisplay(0, -1);
            }
            
            break;
    }
}