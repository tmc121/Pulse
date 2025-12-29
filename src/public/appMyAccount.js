// File:  src/public/UserAccounts-Auth.js
// import { loadUserAccountPageData } from 'public/appMyAccount.js';

// IMPORTS
import { currentMember } from 'wix-members-frontend';
import { primaryNavigate } from './appNavigation';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';


// THIS FILE WILL CONFIGURE THE MY ACCOUNT PAGE FUNCTIONALITY AND DATA FOR THE USER ACCOUNTS IN APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MY ACCOUNT PAGE TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES
// THIS FUNCTION WILL LOAD THE USER ACCOUNT DATA INTO THE MY ACCOUNT PAGE INPUTS

/*
const myAccount_Exit_Button = $w('#myAccount-Exit-Button');
const myAccount_Options_Repeater = $w('#myAccount-Options-Repeater');
const myAccount_Options_Repeater_Item = $w('#myAccount-Options-Repeater-Item'); // Already Set
const myAccount_Options_Repeater_Item_Button = $w('#myAccount-Options-Repeater-Item-Button'); // Already Set
const myAccount_UserId_DisplayText = $w('#myAccount-UserID-DisplayText');
const myAccount_FullName_DisplayText = $w('#myAccount-FullName-DisplayText');
const myAccount_Email_DisplayText = $w('#myAccount-Email-DisplayText');
const myAccount_StatusDisplay_Button = $w('#myAccount-Status-Display-Button');
const myAccount_UpdatePassword_Button = $w('#myAccount-UpdatePassword-Button');
*/

export async function loadUserAccountPageData(
    myAccountFullName,
    myAccountEmail,
    myAccountUserId,
    myAccountStatus,
    myAccountOptionsRepeater,
    myAccountOptionsRepeaterItemButton,
    updatePasswordButton,
    myAccountExitButton,
    primaryMultiState) {

    // Minimal placeholder while rebuilding account integration
    try {
        const member = await currentMember.getMember();
        const UserAccount = await getUserAccountByMemberId(member._id);
        const fallbackName = UserAccount.account.firstName + ' ' + UserAccount.account.lastName || 'Member';
        if (myAccountFullName && 'text' in myAccountFullName) {
            myAccountFullName.text = fallbackName;
        }
        if (myAccountEmail && 'text' in myAccountEmail) {
            myAccountEmail.text = UserAccount.account.loginEmail || 'Email unavailable';
        }
        if (myAccountUserId && 'text' in myAccountUserId) {
            myAccountUserId.text = UserAccount.account.userId || 'ID unavailable';
        }
        if (myAccountStatus && 'label' in myAccountStatus) {
            myAccountStatus.label = UserAccount.account.status || 'Status unavailable';
        }
        if (myAccountOptionsRepeater) {
            myAccountOptionsRepeater.data = [];
            const buttonSelector = typeof myAccountOptionsRepeaterItemButton === 'string'
                ? myAccountOptionsRepeaterItemButton
                : myAccountOptionsRepeaterItemButton?.id
                    ? `#${myAccountOptionsRepeaterItemButton.id}`
                    : null;
            if (buttonSelector) {
                myAccountOptionsRepeater.onItemReady(($item) => {
                    $item(buttonSelector).label = 'Team Admin: (none)';
                });
            }
        }
        if (updatePasswordButton && typeof updatePasswordButton.enable === 'function') {
            updatePasswordButton.enable();
        }
    } catch (error) {
        console.error('My Account placeholder load error:', error);
    }

    if (myAccountExitButton && typeof myAccountExitButton.onClick === 'function') {
        myAccountExitButton.onClick(async () => {
            await primaryNavigate(primaryMultiState, 'dashboard');
        });
    }
}   