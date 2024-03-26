const { readdirSync } = require("original-fs");

let reasonShown = false;

function showHideReason(){
    let btn = document.getElementById('generatedMailReasonBtn');
    let reason = document.getElementById('selectedMailReason');
    let content = document.getElementById('selectedMailMiddle');

    //Hide
    if(reasonShown){
        content.style.display = "flex";
        reason.style.display = "none";
        btn.innerHTML = `Show reason <img class="reasonImg" src="pictures/help_icon.png">`;
        reasonShown = false;
    }
    //Show
    else{
        content.style.display = "none";
        reason.style.display = "flex";
        btn.innerHTML = `Hide reason <img class="reasonImg" src="pictures/help_icon.png">`;
        reasonShown = true;
    }   
}

function hoverMailResult(){
    document.getElementById('mailResultIcon').src = 'pictures/generated_mail_icon_hover.png';
}

function exitMailResult(){

}