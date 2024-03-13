let loginDisplayMode = 0;
let accounts = document.getElementsByClassName('accountWrap');
let accList = document.getElementById('accountsList');
let loginPage = document.getElementById('loginPromptWrap');
let loginNameOut = document.getElementById('loginName');
let forName = document.getElementById('forName');
let idLogin = document.getElementById('idLogin');
let serverLogin = document.getElementById('serverLogin');

function loginDisplay(mode, accId){
    for(let i = 0; i < document.getElementsByClassName('loginWrap').length; i++){
        document.getElementsByClassName('loginWrap')[i].style.display = 'none';
    }

    switch(mode){
        //show account list - BACK BUTTON
        case 0:
            forName.innerHTML = "";
            loginNameOut.innerHTML = "";
            idLogin.innerHTML = "";
            
            loginDisplayMode = 0;

            document.getElementById('passwordTextField').value = "";
            document.getElementById('errorLogin').innerHTML = "";

            accList.style.display = "grid";
            break;
        //password prompt - selected account
        case 1:
            if(accId > -1){
                idLogin.innerHTML = accId;

                loginDisplayMode = 1;

                let username = document.getElementById('accountName' + accId).innerHTML.trim();
                //forName = "for ";
                loginNameOut.innerHTML = username;

                loginPage.style.display = "flex";
            }
            else{
                loginDisplay(0, -1);
            }
            break;
        
        case 2:
            forName.innerHTML = "";
            loginNameOut.innerHTML = "Sever login";
            idLogin.innerHTML = "";

            serverLogin.style.display = 'flex';

            loginDisplayMode = 2;
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

function togglePassLogin2(){
    let passField = document.getElementById('serverPassword');
    let btn = document.getElementById('serverPassShowBtn');
    if(passField.type == 'text'){
        passField.type = 'password';
        btn.innerHTML = "(Show)";
    }
    else{
        passField.type = 'text';
        btn.innerHTML = "(Hide)";
    }
}