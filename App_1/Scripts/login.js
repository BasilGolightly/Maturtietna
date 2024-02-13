let loginDisplayMode = 0;
let accounts = document.getElementsByClassName('accountWrap');
let accList = document.getElementById('accountsList');
let loginPage = document.getElementById('loginPromptWrap');
let loginNameOut = document.getElementById('loginName');
let forName = document.getElementById('forName');
let idLogin = document.getElementById('idLogin');

function loginDisplay(mode, accId){
    switch(mode){
        //show account list
        case 0:
            forName.innerHTML = "";
            loginNameOut.innerHTML = "";
            loginPage.style.display = "none";
            idLogin.innerHTML = "";
            accList.style.display = "grid";
            loginDisplayMode = 0;
            break;
        //password prompt - selected account
        case 1:
            if(accId > -1){
                loginDisplayMode = 1;
                accList.style.display = "none";
                loginPage.style.display = "flex";
                idLogin.innerHTML = accId;
                let username = document.getElementById('accountName' + accId).innerHTML.trim();
                forName = "for ";
                loginNameOut.innerHTML = username;
            }
            else{
                loginDisplay(0, -1);
            }
            break;
    }
}

function checkLoginPassword(el){
    let text = el.value.trim();
    if(text == ""){
        document.getElementById('submitLoginBtn').disabled = true;
        //console.log("disabled");
    }
    else{
        document.getElementById('submitLoginBtn').disabled = false;
        //console.log("enabled");
    }
}

function togglePassLogin(){
    let passField = document.getElementById('passwordTextField');
    let btn = document.getElementById('showPassBtn');
    if(passField.type == 'text'){
        passField.type = 'password';
        btn.innerHTML = "(Show)";
    }
    else{
        passField.type = 'text';
        btn.innerHTML = "(Hide)";
    }
}