let showTutorial = true;
let showGenerate = true;
let showContact = true;
let showMails = true;
let showNewMailHelp = false;

function hideTutorial(){
    let tutorial = document.getElementById('tutorialWrap');
    let img = document.getElementById('tutorialHideImg');

    //hide
    if(showTutorial){
        showTutorial = false;
        tutorial.style.display = "none";
        img.src = "pictures/arrow_up.png";
    }
    //show
    else{
        showTutorial = true;
        tutorial.style.display = "flex";
        img.src = "pictures/arrow_down.png";
    }
}

function hideGenerate(){
    let generateChapter = document.getElementById('generateChapter');
    let generateBtn = document.getElementById('tutorialChapterBtn');
    //alert("ba");

    //hide
    if(showGenerate){
        generateChapter.style.display = 'none';
        generateBtn.innerHTML = `<img src="pictures/arrow_up.png" class="tutorialArrowIcon" width="" height=""> Generating your first mail`;
        showGenerate = false;
    }
    //show
    else{
        generateChapter.style.display = 'grid';
        generateBtn.innerHTML = `<img src="pictures/arrow_down.png" class="tutorialArrowIcon" width="" height=""> Generating your first mail`;
        showGenerate = true;
    }
}

function hideContact(){
    let contactChapter = document.getElementById('contactChapter');
    let contactBtn = document.getElementById('tutorialContactBtn');
    //alert("ba");

    //hide
    if(showContact){
        contactChapter.style.display = 'none';
        contactBtn.innerHTML = `<img src="pictures/arrow_up.png" class="tutorialArrowIcon" width="" height=""> Contacts`;
        showContact = false;
    }
    //show
    else{
        contactChapter.style.display = 'grid';
        contactBtn.innerHTML = `<img src="pictures/arrow_down.png" class="tutorialArrowIcon" width="" height=""> Contacts`;
        showContact = true;
    }
}

function hideMails(){
    let mailsChapter = document.getElementById('recentMailContent');
    let img = document.getElementById('recentMailsHideImg');

    //hide
    if(showMails){
        img.src = "pictures/arrow_up.png";
        mailsChapter.style.display = "none";
        showMails = false;
    }
    //show
    else{
        img.src = "pictures/arrow_down.png";
        mailsChapter.style.display = "flex";
        showMails = true;
    }
}


function newMailHelp(){
    let newMailHelp = document.getElementById('newMailHelp');

    //hide
    if(showNewMailHelp){
        newMailHelp.style.display = 'none';
        showNewMailHelp = false;
    }
    //show
    else{
        newMailHelp.style.display = 'flex';
        showNewMailHelp = true;
    }
}