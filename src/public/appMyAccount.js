// File:  src/public/UserAccounts-Auth.js
// import { loadUserAccountPageData } from 'public/appMyAccount.js';

// IMPORTS
import { currentMember } from 'wix-members-frontend';
import { primaryNavigate } from './appNavigation';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';
import { showNoAccessState } from 'public/appAuthentication.js';


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
        
        if (myAccountFullName) myAccountFullName.text = fallbackName;
        if (myAccountEmail) myAccountEmail.text = UserAccount.account.loginEmail || 'No Email';
        if (myAccountUserId) myAccountUserId.text = UserAccount.account.userId.toUpperCase() || 'Error Retrieving';
        if (myAccountStatus) myAccountStatus.label = UserAccount.account.accountStatus || 'Error Retrieving';
        
        // Setup exit button to navigate back to dashboard
        if (myAccountExitButton) {
            myAccountExitButton.onClick(async () => {
                try {
                    await primaryNavigate($w('#multiStateBox1'), 'dashboard');
                } catch (err) {
                    console.error('Failed to navigate from My Account exit', err);
                    await showNoAccessState($w('#multiStateBox1'),'Error', 'An error occurred while navigating back to the dashboard.', "Contact Support for further assistance", "Click another option to exit this page.");
                }
            });
        }
    } catch (error) {
        console.error('Error loading user account data:', error);
        await showNoAccessState($w('#multiStateBox1'),'Error', 'An error occurred while loading your account data.', "Contact Support for further assistance", "Click another option to exit this page.");
    }

    // SET UP ACCOUT OPTIONS REPEATER - TO BE IMPLEMENTED LATER
    const repeaterData = [
        { _id: "01", label: "Update account info", primaryMultiStateLink: 'dashboard' },
        { _id: "02", label: "Change Password", primaryMultiStateLink: 'dashboard' },
        { _id: "03", label: "Preferences", primaryMultiStateLink: 'dashboard' },
        // Add more options as needed
    ];
    if (myAccountOptionsRepeater) {
        myAccountOptionsRepeater.data = repeaterData;
        myAccountOptionsRepeater.onItemReady(($item, itemData) => {
            const optionButton = $item('#myAccount-Options-Repeater-Item-Button');
            if (optionButton) {
                optionButton.label = itemData.label;
                optionButton.onClick(async () => {
                    console.log(`Option selected: ${itemData.label}`);
                    // Implement option functionality here
                    await primaryNavigate($w('#multiStateBox1'), itemData.primaryMultiStateLink); // Placeholder navigation
                });
            }
        });
    } else {
        console.warn('myAccountOptionsRepeater is not defined');

    }

    // UPDATE PASSWORD BUTTON HANDLER
    // THIS MULTISTATE IS NOT YET IMPLEMENTED - PLACEHOLDER FOR FUTURE - REDIRECT TO DASHBOARD FOR NOW
    updatePasswordButton.onClick(async () => {
        try {
            await primaryNavigate($w('#multiStateBox1'), 'dashboard') // Change to 'changePassword' when implemented
            .then(async () => {
            await showNoAccessState($w('#multiStateBox1'),'No Yet Ready', 'Change Password functionality is not yet implemented.', "Contact Support for further assistance", "Click another option to exit this page.");
            });
        } catch (err) {
            console.error('Failed to navigate to Change Password', err);
            await showNoAccessState($w('#multiStateBox1'),'Error', 'An error occurred while trying to access Change Password.', "Contact Support for further assistance", "Click another option to exit this page.");
        }
    });

}   
// END OF FILE  