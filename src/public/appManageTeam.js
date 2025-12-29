// File:  src/public/appManageTeam.js
// import { setManageTeamPage } from 'public/appManageTeam.js';


// IMPORTS


// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO THE MANAGE TEAM PAGE AND ITS FUNCTIONALITY
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MANAGE TEAM PAGE TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES
// THIS CODE REQUIRES THE CURRENT MEMBER TO HAVE A USER ACCOUNT WITH ADMIN ACCOUNT = TRUE TO ACCESS THIS PAGE
// SUPPRESS AUTH AND HOOKS WHERE APPLICABLE FOR DATA QUERIES TO AVOID CONFLICTS WITH MEMBER AUTHENTICATION

/*
const manageTeam_Close_Button = $w('#manageTeam-Close-Button');
const manageTeam_EditAccounts_Button = $w('#manageTeam-EditAccounts-Button');
const manageTeam_NewAccount_Button = $w('#manageTeam-NewAccount-Button');
const manageTeam_AccountsRepeater = $w('#manageTeam-AccountsRepeater');
const manageTeam_AccountDisplay_Item_Button = $w('#managerTeam-DisplayAccount-Item-Button');
const manageTeam_Account_Item_CheckBox = $w('#item-Team-CheckBox');
const manageTeam_SelectedItem_Display_Wrapper = $w('#manageTeam-SelectedItem-Display-Wrapper');
const manageTeam_SelectedItem_UserID_Text = $w('#manageTeam-SelectedItem-UserID');
const manageTeam_SelectedItem_FullName_Text = $w('#manageTeam-SelectedItem-FullName');
const manageTeam_SelectedItem_Email_Text = $w('#manageTeam-SelectedItem-Email');
const manageTeam_SelectedItem_Status_Button = $w('#manageTeam-SelectedItem-Status-Button');
const manageTeam_SelectedItem_Disable_Button = $w('#manageTeam-SelectedItem-DisableAccount-Button');
const manageTeam_SelectedItem_Discard_Button = $w('#manageTeam-SelectedItem-Discard-Button');
const manageTeam_SelectedItem_Save_Button = $w('#manageTeam-SelectedItem-Save-Button');
*/


export async function setManageTeamPage(
    closeButton,
    editAccountsButton,
    newAccountButton,
    accountsRepeater,
    accountDisplayItemButton,
    accountItemCheckBox,
    selectedItemDisplayWrapper,
    selectedItemUserIDText,
    selectedItemFullNameText,
    selectedItemEmailText,
    selectedItemStatusButton,
    selectedItemDisableButton,
    selectedItemDiscardButton,
    selectedItemSaveButton
) {
    // IMPLEMENT FUNCTION TO SETUP MANAGE TEAM PAGE

    closeButton.onClick(async () => {
        try {
            await primaryNavigate($w('#multiStateBox1'), 'dashboard');
        } catch (err) {
            console.error('Failed to navigate from Manage Team close', err);
        }
    });

    editAccountsButton.onClick(async () => {
        try {
            // TO BE IMPLEMENTED LATER
            if(accountItemCheckBox.collapsed) {
                editAccountsButton.label = 'Edit';
                accountItemCheckBox.expand();
            } else {
                editAccountsButton.label = 'Done';
                accountItemCheckBox.collapse();
            }   
            console.log('Edit Accounts button clicked - functionality to be implemented.');
        } catch (err) {
            console.error('Failed to handle Edit Accounts click', err);
        }
    });

    newAccountButton.onClick(async () => {
        try {
            // TO BE IMPLEMENTED LATER
            console.log('New Account button clicked - functionality to be implemented.');
        } catch (err) {
            console.error('Failed to handle New Account click', err);
        }
    });

    // Additional setup for accountsRepeater and other controls to be implemented later as needed
    
    // THE ACCOUNTS REPEATER DATA WILL BE POPULATED BASED ON THE TEAM MEMBERS LINKED TO THE ADMIN USER ACCOUNT
    // THE USER ACCOUNT MUST HAVE A TEAM ADMIN THAT IS THE SAME AS THE LOGGED IN MEMBER'S USER ACCOUNT ID.
    // NOT TEAM MEMBERS USER ACCOUNTS CAN HAVE MORE THAN ONE TEAM ADMIN, BUT A TEAM ADMIN CAN ONLY HAVE ONE USER ACCOUNT.
    // THIS WILL ALLOW MULTIPLE ADMINS TO MANAGE THE SAME TEAM MEMBERS IF NEEDED.

    const teamMembers = []; // TO BE FILLED WITH TEAM MEMBER DATA FROM USER ACCOUNTS

    wixData.query('UserAccounts')
        .eq('teamAdmin', await getLoggedInMemberId())
        .find({ suppressAuth: true, suppressHooks: true })
        .then((results) => {
            results.items.forEach((item) => {
                teamMembers.push(item);
            });
            accountsRepeater.data = teamMembers;
        })
        .catch((error) => {
            console.error('Error querying team members for Manage Team page:', error);
        });

    accountsRepeater.onItemReady(($item, itemData) => {
        const button = $item(accountDisplayItemButton || '#manageTeam-DisplayAccount-Item-Button');
        const checkBox = $item(accountItemCheckBox || '#item-Team-CheckBox');

        button.label = (itemData.firstName + ' ' + itemData.lastName).trim() + " • " +  (itemData.userId || itemData.userid || 'No User ID');
        checkBox.checked = false;

        button.onClick(() => {
            selectedItemUserIDText.text = `User ID: ${itemData.userId || itemData.userid || '-'}`;
            selectedItemFullNameText.text = `Full Name: ${itemData.firstName || ''} ${itemData.lastName || ''}`.trim() || 'Full Name: -';
            selectedItemEmailText.text = `Email: ${itemData.loginEmail || 'No Email'}`;
            selectedItemStatusButton.label = `Status: ${itemData.accountStatus || 'Unknown'}`;
            selectedItemDisableButton.label = itemData.status === 'Disabled' ? 'Enable Account' : 'Disable Account';
            selectedItemDisplayWrapper.expand();
            selectedItemSaveButton.enable();
            selectedItemDisableButton.enable();
            selectedItemDiscardButton.enable();
            selectedItemDisableButton.onClick(() => {
                // TO BE IMPLEMENTED LATER
                console.log(`Toggle disable for account: ${itemData.userId || itemData.userid || 'No User ID'}`);
            });
            selectedItemDiscardButton.onClick(() => {
                selectedItemDisplayWrapper.collapse();
                selectedItemSaveButton.disable();
                selectedItemDisableButton.disable();
            });
            selectedItemSaveButton.onClick(() => {
                // TO BE IMPLEMENTED LATER
                console.log(`Save changes for account: ${itemData.userId || itemData.userid || 'No User ID'}`);
                selectedItemDisplayWrapper.collapse();
                selectedItemSaveButton.disable();
                selectedItemDisableButton.disable();
                selectedItemDiscardButton.disable();
            }); 
        });
    });


}
