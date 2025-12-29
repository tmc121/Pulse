// File:  src/public/appManageTeam.js
// import { setManageTeamPage } from 'public/appManageTeam.js';


// IMPORTS
import wixData from 'wix-data';
import { primaryNavigate } from 'public/appNavigation.js';
import { getLoggedInMemberId } from 'public/appAuthentication.js';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';


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

    if (!accountsRepeater) {
        console.warn('Manage Team setup skipped: accountsRepeater missing');
        return;
    }

    const toSelector = (elOrSelector, fallback) => {
        if (!elOrSelector) return fallback;
        if (typeof elOrSelector === 'string') return elOrSelector;
        if (elOrSelector.id) return `#${elOrSelector.id}`;
        return fallback;
    };

    closeButton.onClick(async () => {
        try {
            await primaryNavigate($w('#multiStateBox1'), 'dashboard');
        } catch (err) {
            console.error('Failed to navigate from Manage Team close', err);
        }
    });

    if (editAccountsButton) {
        editAccountsButton.onClick(() => {
            try {
                // Placeholder toggle: collapse/expand checkbox only if provided
                if (accountItemCheckBox && typeof accountItemCheckBox.collapse === 'function' && typeof accountItemCheckBox.expand === 'function') {
                    if (accountItemCheckBox.collapsed) {
                        editAccountsButton.label = 'Edit';
                        accountItemCheckBox.expand();
                    } else {
                        editAccountsButton.label = 'Done';
                        accountItemCheckBox.collapse();
                    }
                }
                console.log('Edit Accounts button clicked - functionality to be implemented.');
            } catch (err) {
                console.error('Failed to handle Edit Accounts click', err);
            }
        });
    }

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
    const teamMembers = []; // TO BE FILLED WITH TEAM MEMBER DATA FROM USER ACCOUNTS

    try {
        const memberId = await getLoggedInMemberId();
        const adminAccount = await getUserAccountByMemberId(memberId);
        const account = adminAccount?.account;
        if (!account) {
            console.warn('Manage Team: no admin account found for current member');
        }
        const adminAccountId = account?._id || account?._id;
        if (!adminAccountId) {
            console.warn('Manage Team: admin identifier missing; cannot query team members');
        } else {
            const result = await wixData.query('UserAccounts')
                .hasSome('teamAdmin', adminAccountId)
                .find({ suppressAuth: true, suppressHooks: true });
            (result?.items || []).forEach((item) => teamMembers.push(item));
        }
        accountsRepeater.data = teamMembers;
    } catch (error) {
        console.error('Error querying team members for Manage Team page:', error);
        accountsRepeater.data = [];
    }

    accountsRepeater.onItemReady(($item, itemData) => {
        const button = $item(toSelector(accountDisplayItemButton, '#manageTeam-DisplayAccount-Item-Button'));
        const checkBox = $item(toSelector(accountItemCheckBox, '#item-Team-CheckBox'));

        if (button) {
            button.label = (itemData.firstName + ' ' + itemData.lastName).trim() + " • " +  (itemData.userId || itemData.userid || 'No User ID');
        }
        if (checkBox) {
            checkBox.checked = false;
        }

        if (button) {
            button.onClick(() => {
                if (selectedItemUserIDText) selectedItemUserIDText.text = `User ID: ${itemData.userId || itemData.userid || '-'}`;
                if (selectedItemFullNameText) selectedItemFullNameText.text = `Full Name: ${itemData.firstName || ''} ${itemData.lastName || ''}`.trim() || 'Full Name: -';
                if (selectedItemEmailText) selectedItemEmailText.text = `Email: ${itemData.loginEmail || 'No Email'}`;
                if (selectedItemStatusButton) selectedItemStatusButton.label = `Status: ${itemData.accountStatus || 'Unknown'}`;
                if (selectedItemDisableButton) selectedItemDisableButton.label = itemData.status === 'Disabled' ? 'Enable Account' : 'Disable Account';
                if (selectedItemDisplayWrapper && selectedItemDisplayWrapper.expand) selectedItemDisplayWrapper.expand();
                if (selectedItemSaveButton && selectedItemSaveButton.enable) selectedItemSaveButton.enable();
                if (selectedItemDisableButton && selectedItemDisableButton.enable) selectedItemDisableButton.enable();
                if (selectedItemDiscardButton && selectedItemDiscardButton.enable) selectedItemDiscardButton.enable();
                if (selectedItemDisableButton) {
                    selectedItemDisableButton.onClick(() => {
                        console.log(`Toggle disable for account: ${itemData.userId || itemData.userid || 'No User ID'}`);
                    });
                }
                if (selectedItemDiscardButton) {
                    selectedItemDiscardButton.onClick(() => {
                        if (selectedItemDisplayWrapper && selectedItemDisplayWrapper.collapse) selectedItemDisplayWrapper.collapse();
                        if (selectedItemSaveButton && selectedItemSaveButton.disable) selectedItemSaveButton.disable();
                        if (selectedItemDisableButton && selectedItemDisableButton.disable) selectedItemDisableButton.disable();
                    });
                }
                if (selectedItemSaveButton) {
                    selectedItemSaveButton.onClick(() => {
                        console.log(`Save changes for account: ${itemData.userId || itemData.userid || 'No User ID'}`);
                        if (selectedItemDisplayWrapper && selectedItemDisplayWrapper.collapse) selectedItemDisplayWrapper.collapse();
                        if (selectedItemSaveButton.disable) selectedItemSaveButton.disable();
                        if (selectedItemDisableButton && selectedItemDisableButton.disable) selectedItemDisableButton.disable();
                        if (selectedItemDiscardButton && selectedItemDiscardButton.disable) selectedItemDiscardButton.disable();
                    });
                }
            });
        }
    });


}
