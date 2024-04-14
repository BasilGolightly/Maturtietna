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

function hoverMailResult(){ document.getElementById('mailResultIcon').src = 'pictures/generated_mail_icon_hover.png';}

function exitMailResult(){ document.getElementById('mailResultIcon').src = 'pictures/generated_mail_icon_neutral.png';}

function hoverHomeMail(){ document.getElementById('homeMailImg').src = 'pictures/generated_mail_icon_hover.png';}

function exitHomeMail(){ document.getElementById('homeMailImg').src = 'pictures/generated_mail_icon_neutral.png';}

let mailResultsShown = true;
let contactResultsShown = true;

function showHideMailResults(){
    let mailResults = document.getElementById("searchMailResultsWrap");
    let mailBtn = document.getElementById("searchMailBtn");

    //hide
    if(mailResultsShown){
        mailResults.style.display = "none";
        mailBtn.style.backgroundImage = `url("pictures/arrow_up.png")`;
        mailResultsShown = false;
    }
    //show
    else{
        mailResults.style.display = "flex";
        mailBtn.style.backgroundImage = `url("pictures/arrow_down.png")`;
        mailResultsShown = true;
    }   
}

function showHideContactResults(){
    let contactResults = document.getElementById("searchContactsResultWrap");
    let contactBtn = document.getElementById("contactResultsBtn");

    //hide
    if(contactResultsShown){
        contactResults.style.display = "none";
        contactBtn.style.backgroundImage = `url("pictures/arrow_up.png")`;
        contactResultsShown = false;
    }
    //show 
    else{
        contactResults.style.display = "flex";
        contactBtn.style.backgroundImage = `url("pictures/arrow_down.png")`;
        contactResultsShown = true;
    }
}

function resizeNameField(mode){
    let el;
    switch(mode){
        case 0:
            el = document.getElementById('changeFirstNameField');
            break;
        case 1:
            el = document.getElementById('changeFirstNameField');
            break;
    }
    
    let text = el.value.trim();
    el.style.width = `${text.length + 5}ch !important`;
}