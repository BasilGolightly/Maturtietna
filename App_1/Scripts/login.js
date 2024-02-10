let loginDisplayMode = 0;
let accounts = document.getElementsByClassName('accountWrap');
let loginPage = document.getElementById('loginPromptWrap');
let loginNameOut = document.getElementById('loginName');

function loginDisplay(mode, accId){
    switch(mode){
        //show account list
        case 0:
            loginPage.style.display = "none";
            for(let i = 0; accounts.length; i++){
                accounts[i].style.display = "flex";
            }
            loginDisplayMode = 0;
            break;
        //password prompt - selected account
        case 1:
            let loginNameIn = document.getElementById('accountName' + accId);
            for(let i = 0; accounts.length; i++){
                accounts[i].style.display = "none";
            }
            loginPage.style.display = "flex";
            loginDisplayMode = 1;
            break;
    }
}