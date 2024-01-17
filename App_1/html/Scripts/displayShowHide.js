//#006786
//0 - NEW EMAIL
//1 - GENERATED
//2 - CONTACTS
//3 - SETTINGS
let displayModeId = -1;

let navItems = document.getElementsByClassName('listItem');

let newMailFrame = document.getElementById('newMailFrame');
let generatedFrame = document.getElementById('generatedFrame');
let contactsFrame = document.getElementById('contactsFrame');
let settingsFrame = document.getElementById('settingsFrame');
//let xFrame = document.getElementById('');


function displayMode(mode){
    
    //check if the parameter mode is the same as the current display mode - avoid unnecessary work
    if(mode != displayModeId){
        //reset navbar, such that no list item is glowing
        for(let i = 0; i < navItems.length; i++){
            navItems[i].style.backgroundColor = "transparent";
        }

        //check which panel to show
        switch(mode){
            //new email
            case 0:
                //alert('0');
                displayModeId = 0;
                newMailFrame.style.display = "flex";
                generatedFrame.style.display = "none";
                contactsFrame.style.display = "none";
                settingsFrame.style.display = "none";
                document.getElementById('newMailNavItem').style.backgroundColor = "#006786";
                break;
            //generated
            case 1:
                //alert('1');
                displayModeId = 1;
            	generatedFrame.style.display = "flex";
                newMailFrame.style.display = "none";
                contactsFrame.style.display = "none";
                settingsFrame.style.display = "none";
                document.getElementById('generatedNavItem').style.backgroundColor = "#006786";
                break;
            //contacts
            case 2:
                //alert('2');
                displayModeId = 2;
                contactsFrame.style.display = "flex";
                newMailFrame.style.display = "none";
                generatedFrame.style.display = "none";
                settingsFrame.style.display = "none";
                document.getElementById('contactsNavItem').style.backgroundColor = "#006786";
                break;
            //settings
            case 3:
                //alert('3');
                displayModeId = 3;
                settingsFrame.style.display = "flex";
                contactsFrame.style.display = "none";
                newMailFrame.style.display = "none";
                generatedFrame.style.display = "none";
                document.getElementById('settingsNavItem').style.backgroundColor = "#006786";
                break;
        }
    }
}