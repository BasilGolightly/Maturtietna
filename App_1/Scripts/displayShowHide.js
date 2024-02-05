//#006786
//0 - NEW EMAIL
//1 - GENERATED
//2 - CONTACTS
//3 - SETTINGS
let displayModeId = -1;
let selectedMailId = 0;

let navItems = document.getElementsByClassName('listItem');

let newMailFrame = document.getElementById('newMailFrame');
let generatedFrame = document.getElementById('generatedFrame');
let contactsFrame = document.getElementById('contactsFrame');
let settingsFrame = document.getElementById('settingsFrame');
let backgroundNavColor = "rgb(35, 35, 35)";
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

            let contactsString = ``;
            let contactNames = document.getElementsByClassName('contactName');
            //alert(contactNames.length);
            for(let i = -1; i < contactNames.length; i++){
                if(i == -1){
                    contactsString = `<option value="0">-Select recipient-</option>`;
                }
                else{
                    //id = 'contact1'
                    let contactId = contactNames[i].id;
                    contactId = contactId.substring(7, contactId.length);
                    contactsString += `
                    <option value="${contactId}">${contactNames[i].innerHTML.trim()}</option>
                    `;
                }
                
            }
            document.getElementById('newRecipentDropDown').innerHTML = contactsString;
            
            newMailFrame.style.display = "flex";
            generatedFrame.style.display = "none";
            contactsFrame.style.display = "none";
            settingsFrame.style.display = "none";
            /*document.getElementById('newMailNavItem').style.backgroundColor = backgroundNavColor;*/
            break;
        //generated
        case 1:
            //alert('1');
            displayModeId = 1;
            generatedFrame.style.display = "flex";
            document.getElementById('generatedTitleText').innerHTML = "Generated mails <span class='generatedTitleCount' id='generatedTitleCount'></span>";
            let generatedMails = document.getElementsByClassName('generatedLetter');
            document.getElementById('generatedTitleCount').innerHTML = "(" + generatedMails.length + ")";

            document.getElementById('generatedMailWrap').innerHTML = `<!--no mail selected-->
            <div class="noMailSelectedWrap">
                <div class="noMailSelectedInner">
                    <div>
                        <img src="pictures/generated_mail_icon_empty.png" class="noMailSelectedImg">
                    </div>
                    <div>No mail selected</div>
                </div>
            </div>
            <!--no mail selected-->`;

            let mails = document.getElementsByClassName('generatedLetter');
            for(let i = 0; i < mails.length; i++){
                mails[i].style.borderLeft = "3px solid gray";
            }

            document.getElementById('generatedWrap').style.display = "flex";
            newMailFrame.style.display = "none";
            contactsFrame.style.display = "none";
            settingsFrame.style.display = "none";
            document.getElementById('generatedNavItem').style.backgroundColor = backgroundNavColor;
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
            document.getElementById('contactImg').src = "pictures/white_pfp.png";
            document.getElementById('contactsNavItem').style.backgroundColor = backgroundNavColor;
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
            document.getElementById('settingsNavItem').style.backgroundColor = backgroundNavColor;
            break;
    }
}

function displayModeGenerated(mailId){
    displayMode(1);

    let mails = document.getElementsByClassName('generatedLetter');
    let selectedMail = document.getElementById('generatedLetter' + mailId);

    for(let i = 0; i < mails.length; i++){
        mails[i].style.borderLeft = "3px solid gray";
    }

    //deselect - HIDE MAIL
    if(selectedMailId == mailId){
        selectedMail.style.borderLeft = "3px solid gray";
        displayMode(1);
        selectedMailId = 0
    }
    //selected mail - SHOW MAIL
    else{
        selectedMailId = mailId;
        selectedMail.style.borderLeft = "5px solid gray";
        
        //get data from mail
        let title = document.getElementById("titleMail" + mailId).innerHTML;
        let date = document.getElementById("dateMail" + mailId).innerHTML;
        let content = document.getElementById("descMail" + mailId).innerHTML;
        let contact = document.getElementById("contact" + mailId).innerHTML;

        document.getElementById('generatedMailWrap').innerHTML = `
        <!--mail content-->
        <div class="selectedMailWrap">

            <!--mail title-->
            <div class="selectedMailTop">
                <div class="selectedMailTopLeft">  
                    <div class="selectedMailTopTitle">
                        ${title}
                    </div>
                    <div class="selectedMailTopContact">
                        <span style="font-size: 13px">to</span> ${contact}
                    </div>
                </div>
                <div class="selectedMailTopRight">
                    ${date}
                </div>
            </div>
        	<!--mail title-->

            <!--mail content-->
            <div class="selectedMailMiddle">
                ${content}
            </div>
            <!--mail content-->
        </div>
        `; 
        document.getElementById('generatedTitleText').innerHTML = "<a onclick='displayMode(1)' href='#' class='titleLink'>Generated mails</a> > Mail " + mailId;
    }

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
    document.getElementById('contactImg').src = "pictures/white_pfp_hover.png";

    //display add contact, hide contact list and selected contact wrap
    document.getElementById('contactList').style.display = 'none';
    document.getElementById('selectedContact').style.display = 'none';
    document.getElementById('addContact').style.display = 'flex';
}