function showHidePassRegister(textBoxIndex){
    let textBox = document.getElementById('passwordtextBox' + textBoxIndex);
    let btn = document.getElementById('showHideBtn' + textBoxIndex);
    if(textBox.type == 'text'){
        //console.log("1");
        btn.innerHTML = "(Show)";
        textBox.type = 'password';
    }
    else{
        //console.log("2");
        btn.innerHTML = "(Hide)";
        textBox.type = 'text';
    }
}

//clear register form - empty error, username, pass and new pass contents 
function registerClear(){
    document.getElementById('error').innerHTML = "";
    document.getElementById('newUsername').innerHTML = "";
    document.getElementById('passwordtextBox1').innerHTML = "";
    document.getElementById('passwordtextBox2').innerHTML = "";
}

function RegisterDisplayMode(mode){
    let regWindow = document.getElementById('mainRegister');
    let apiWindow = document.getElementById('apiMain');

    //main register
    if(mode == 0){
        apiWindow.style.display = "none";
        regWindow.style.display = "grid";
    }
    //api register
    else if(mode == 1)
    {
        regWindow.style.display = "none";
        apiWindow.style.display = "grid";
    }
}