function showHidePassRegister(textBoxIndex){
    let textBox = document.getElementById('passwordtextBox' + textBoxIndex);
    let btn = document.getElementById('showHideBtn' + textBoxIndex);
    if(textBox.type == 'text'){
        console.log("1");
        btn.innerHTML = "(Show)";
        textBox.type = 'password';
    }
    else{
        console.log("2");
        btn.innerHTML = "(Hide)";
        textBox.type = 'text';
    }
}

function submitRegister(){
    //set error display to empty string
    document.getElementById('error').innerHTML = "";
    let error = "";

    //get user input data
    let allgood = true;
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('passwordtextBox1').value.trim();
    let repeatPass = document.getElementById('passwordtextBox2"').value.trim();

    
}