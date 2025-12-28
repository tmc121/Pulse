// File:  src/public/UserAccounts-Auth.js
// import { loadUserAccountPageData } from 'public/appMyAccount.js';

// IMPORTS
import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId } from './UserAccounts-Auth';
import { primaryNavigate } from './appNavigation';


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
    updatePasswordButton,myAccountExitButton,primaryMultiState) {
    

try {
    const member = await currentMember.getMember();
    if (member && member._id) {
        const userAccount =  await getUserAccountByMemberId(member._id);
        if (userAccount) {
            // Populate the My Account page inputs with user account data
            myAccountFullName.value = userAccount.firstName + ' ' + userAccount.lastName || '';
            myAccountEmail.value = userAccount.loginEmail || 'Cannot retrieve email';
            myAccountUserId.value = userAccount.userId || 'Cannot retrieve User ID';
            myAccountStatus.value = userAccount.status || 'Unknown';
            
            // Configure options repeater and buttons as needed
            myAccountOptionsRepeater.data = userAccount.teamAdmin || [];
            myAccountOptionsRepeater.onItemReady( ($item, itemData, index) => {
                $item(myAccountOptionsRepeaterItemButton).label = `Team Admin: ${itemData}`; // Adjust as necessary
            });

            // Enable or disable update password button based on some condition
            if (userAccount.status === 'Active') {
                updatePasswordButton.enable();
            } else {
                updatePasswordButton.disable();
            }
            // Add more fields as necessary
        } else {
            console.warn("No UserAccount found for member ID:", member._id);
        }
    } else {
        console.warn("No logged-in member found.");
    }       
} catch (error) {
    console.error("Error loading UserAccount data for My Account page:", error);
    throw error; // Rethrow the error for further handling if needed    
}

myAccountExitButton.onClick(async () => {
    await primaryNavigate(primaryMultiState, 'dashboardMain1'); // Navigate back to dashboard main
});

}