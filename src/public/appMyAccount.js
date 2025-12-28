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
            const userAccount = await getUserAccountByMemberId(member._id);
            if (userAccount) {
                // Populate the My Account page display fields
                if (myAccountFullName && 'text' in myAccountFullName) {
                    myAccountFullName.text = `${userAccount.firstName || ''} ${userAccount.lastName || ''}`.trim();
                }
                if (myAccountEmail && 'text' in myAccountEmail) {
                    myAccountEmail.text = userAccount.loginEmail || 'Cannot retrieve email';
                }
                if (myAccountUserId && 'text' in myAccountUserId) {
                    myAccountUserId.text = userAccount.userId || 'Cannot retrieve User ID';
                }
                if (myAccountStatus && 'label' in myAccountStatus) {
                    myAccountStatus.label = userAccount.status || 'Unknown';
                }

                // Configure options repeater if present
                if (myAccountOptionsRepeater) {
                    const buttonSelector = typeof myAccountOptionsRepeaterItemButton === 'string'
                        ? myAccountOptionsRepeaterItemButton
                        : myAccountOptionsRepeaterItemButton?.id
                            ? `#${myAccountOptionsRepeaterItemButton.id}`
                            : null;

                    myAccountOptionsRepeater.data = userAccount.teamAdmin || [];
                    if (buttonSelector) {
                        myAccountOptionsRepeater.onItemReady(($item, itemData) => {
                            $item(buttonSelector).label = `Team Admin: ${itemData}`;
                        });
                    }
                }

                // Enable or disable update password button based on status
                if (updatePasswordButton && typeof updatePasswordButton.enable === 'function') {
                    if (userAccount.status === 'Active') {
                        updatePasswordButton.enable();
                    } else if (typeof updatePasswordButton.disable === 'function') {
                        updatePasswordButton.disable();
                    }
                }
            } else {
                console.warn('No UserAccount found for member ID:', member._id);
            }
        } else {
            console.warn('No logged-in member found.');
        }
    } catch (error) {
        console.error('Error loading UserAccount data for My Account page:', error);
        // Do not rethrow; we still want the page to continue
    }

    if (myAccountExitButton && typeof myAccountExitButton.onClick === 'function') {
        myAccountExitButton.onClick(async () => {
            await primaryNavigate(primaryMultiState, 'dashboard'); // Navigate back to dashboard state
        });
    }
}