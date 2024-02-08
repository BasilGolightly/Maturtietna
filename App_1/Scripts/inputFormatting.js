var formality = true;
var newPurposeBottomVisible = true; 

function changeFormality(){
    //infromal
    if(formality){
        formality = false;
        document.getElementById('newFormalityOutput').innerHTML = "Informal";
    }
    //formal
    else{
        formality = true;
        document.getElementById('newFormalityOutput').innerHTML = "Formal";
    }
    //alert(formality);
}

function showPurposeMenu(){
    let nodes = document.getElementsByClassName('newPurposeBottom');
    let displayMode = "", displayMode2 = "";

    //hide
    if(newPurposeBottomVisible){
        displayMode = "none";
        displayMode2 = "none";
        newPurposeBottomVisible = false;
    }
    //show
    else{
        displayMode = "inline-flex";
        displayMode2 = "grid";
        newPurposeBottomVisible = true;
    }

    for(let i = 0; i < nodes.length; i++){
        nodes[i].style.display = displayMode;
    }
    
    document.getElementById('newReason').style.display = displayMode2;
}

function onBlurReasonTextBox(){
    let textArea = document.getElementById('newReasonTextArea');
    textArea.innerHTML = textArea.innerHTML.trim(); 
    textArea.setSelectionRange(textArea.innerHTML.length, textArea.innerHTML.length);
}

function setCursorTextArea(element){
    //alert("asdad");
    let text = element.innerHTML;
    //text = text.trim();
    element.innerHTML = text.trim();
    //element.setSelectionRange(len-1, len-1);
}