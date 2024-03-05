let showGenerate = true;
let showContact = true;

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