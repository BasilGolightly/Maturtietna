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