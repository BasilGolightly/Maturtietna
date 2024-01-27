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
            document.getElementById('generatedTitleText').innerHTML = "Generated mails <span class='generatedTitleCount' id='generatedTitleCount'></span>";
            let generatedMails = document.getElementsByClassName('generatedLetter');
            document.getElementById('generatedTitleCount').innerHTML = "(" + generatedMails.length + ")";
            document.getElementById('generatedMailWrap').style.display = "none";
            document.getElementById('generatedWrap').style.display = "flex";
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
            let contacts = document.getElementsByClassName('contactFrame');
            document.getElementById('countContacts').innerHTML = contacts.length;
            document.getElementById('contactImg').src = "../pictures/white_pfp.png";
            document.getElementById('contactsNavItem').style.backgroundColor = "#006786";
            document.getElementById('contactsHeadTitleText').innerHTML = "Contacts";
            document.getElementById('selectedContact').style.display = 'none';
            document.getElementById('addContact').style.display = 'none';
            document.getElementById('contactList').style.display = 'flex';
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

    /*
    if(mode != displayModeId){
        
    }*/
}

function displayModeGenerated(mailId){
    displayMode(1);

    document.getElementById('generatedWrap').style.display = "none";
    document.getElementById('generatedMailWrap').style.display = "flex";
    document.getElementById('generatedMailWrap').innerHTML = "<h1>" + mailId + "</h1>"; 
    document.getElementById('generatedTitleText').innerHTML = "<a onclick='displayMode(1)' href='#' class='titleLink'>Generated mails</a> > Mail " + mailId;
}

function displayModeContacts(contactId){
    displayMode(2);

    //get selected contact's name
    let name = document.getElementById('contact' + contactId).innerHTML;
    
    //rewrite title text to "contacts > name"
    document.getElementById('contactsHeadTitleText').innerHTML = "<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> > " + name;
    document.getElementById('selectedContact').innerHTML = name.trim();

    //display selected Contact Wrap, hide contact list and add contact
    document.getElementById('contactList').style.display = 'none';
    document.getElementById('addContact').style.display = 'none';
    document.getElementById('selectedContact').style.display = 'flex';
}

function displayModeAddContacts(){
    displayMode(2);

    //rewrite title text to "contacts > add"
    document.getElementById('contactsHeadTitleText').innerHTML = "<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> > Add";

    //change title icon to add contact
    document.getElementById('contactImg').src = "../pictures/white_pfp_hover.png";

    //display add contact, hide contact list and selected contact wrap
    document.getElementById('contactList').style.display = 'none';
    document.getElementById('selectedContact').style.display = 'none';
    document.getElementById('addContact').style.display = 'flex';
}