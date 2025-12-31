// File:  src/public/appManageTeam.js
// import { setManageTeamPage } from 'public/appManageTeam.js';


// IMPORTS
import wixData, { get } from 'wix-data';
import { primaryNavigate } from 'public/appNavigation.js';
import { getLoggedInMemberId } from 'public/appAuthentication.js';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';
import { authentication } from 'wix-members';
import { contacts } from 'wix-crm-frontend';



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
            primaryNavigate($w('#multiStateBox1'), 'createNewAccount');
            
        } catch (err) {
            console.error('Failed to handle New Account click', err);
        }
    });

    // Additional setup for accountsRepeater and other controls to be implemented later as needed

    // THE ACCOUNTS REPEATER DATA WILL BE POPULATED BASED ON THE TEAM MEMBERS LINKED TO THE ADMIN USER ACCOUNT

    // SET INITIALIZATION OF SELECTED ITEM DISPLAY
    editAccountsButton.disable();
        newAccountButton.disable();
        selectedItemFullNameText.text = 'No team member selected';
        selectedItemUserIDText.text = 'No team member selected';
        selectedItemEmailText.text = 'No team member selected';
        selectedItemStatusButton.text = '-';
        selectedItemDisableButton.collapse();
        selectedItemDiscardButton.collapse();
        selectedItemSaveButton.collapse();

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
                .hasSome('teamAdmin', [adminAccountId])
                .find({ suppressAuth: true, suppressHooks: true });
            (result?.items || []).forEach((item) => teamMembers.push(item));
        }
        accountsRepeater.data = teamMembers;
        accountsRepeater.onItemReady(($item, itemData) => {
            const userId = itemData.userId ? itemData.userId.toUpperCase() : '';
            if (itemData.adminAccount === true) {
                $item('#managerTeam-DisplayAccount-Item-Button').label = `${itemData.firstName} ${itemData.lastName} • ${userId} (Admin)`;
            } else {
                $item('#managerTeam-DisplayAccount-Item-Button').label = `${itemData.firstName} ${itemData.lastName} • ${userId}`;
            }
            $item('#item-Team-CheckBox').checked = false; // Default unchecked
            $item('#managerTeam-DisplayAccount-Item-Button').onClick(() => {

                selectedItemFullNameText.text = `${itemData.firstName} ${itemData.lastName}`;
                selectedItemUserIDText.text = itemData.userId.toUpperCase();
                selectedItemEmailText.text = itemData.loginEmail;
                selectedItemStatusButton.label = `Status: ${itemData.accountStatus || 'Unknown'}`;
                // Additional setup for disable, discard, save buttons to be implemented later
                selectedItemDisplayWrapper.expand();
                selectedItemDisableButton.label = itemData.accountStatus === 'Disabled' ? 'Enable Account' : 'Disable Account';

                if (itemData.adminAccount === true) {
                    selectedItemDisableButton.disable();
                    selectedItemSaveButton.disable();
                    selectedItemDiscardButton.disable();
                } else {
                    selectedItemDisableButton.enable();
                    selectedItemSaveButton.enable();
                    selectedItemDiscardButton.enable();
                }

                selectedItemDisableButton.onClick(() => {
                    // TO BE IMPLEMENTED LATER
                    console.log(`Toggle disable for account: ${itemData.userId}`);
                });
                selectedItemDiscardButton.onClick(() => {
                    // TO BE IMPLEMENTED LATER
                    console.log(`Discard changes for account: ${itemData.userId}`);
                });
                selectedItemSaveButton.onClick(() => {
                    // TO BE IMPLEMENTED LATER
                    console.log(`Save changes for account: ${itemData.userId}`);
                });
                
            });
        });
    } catch (error) {
        console.error('Error querying team members for Manage Team page:', error);
        // SHOW DATA TO PLACE IN REPEATER AS EMPTY BUT LET USER KNOW THERE WAS AN ERROR
        const errorResults = [{
            firstName: 'Error loading team members',
            lastName: '',
            userId: '',
            loginEmail: '',
            accountStatus: '',
            adminAccount: false
        }];
        accountsRepeater.data = errorResults;
        accountsRepeater.onItemReady(($item, itemData) => {
            $item('#managerTeam-DisplayAccount-Item-Button').label = itemData.firstName;
            $item('#item-Team-CheckBox').collapse();
        });

        editAccountsButton.disable();
        newAccountButton.disable();
        selectedItemFullNameText.text = '';
        selectedItemUserIDText.text = '';
        selectedItemEmailText.text = '';
        selectedItemStatusButton.text = '-';
        selectedItemDisableButton.collapse();
        selectedItemDiscardButton.collapse();
        selectedItemSaveButton.collapse();

    }

    await createNewAccountPageSetup(
        $w('#createNewAccount-Close-Button'),
        $w('#createNewAccount-Reset-Button'),
        $w('#createNewAccount-FirstName-Input'),
        $w('#createNewAccount-LastName-Input'),
        $w('#createNewAccount-UserId-Input'),
        $w('#createNewAccount-UserID-Status-DisplayText'),
        $w('#createNewAccount-MemberAccount-Dropdown-Input'),
        $w('#createNewAccount-Discard-Button'),
        $w('#createNewAccount-SaveUpdate-Button')
    );  


}

// THIS CODE WILL BE USED TO CREATE A NEW ACCOUNT PAGE FUNCTIONALITY
// THE FUNCTION WILL ALLOW AN ADMIN USER TO CREATE A NEW MEMBER AND LINK THAT MEMBER TO THE NEW USER ACCOUNT.
// CONNECT A MEMBER ID TO THE NEW USER ACCOUNT USING THE CONNECTEDMEMBERID FIELD IN THE USER ACCOUNTS COLLECTION
// BEFORE AN ACCOUNT CAN BE CREATED COMPLETELY THE MEMBER ADDED WILL BE EMAILED A TEMPORARY PASSWORD TO SET THEIR OWN PASSWORD AND COMPLETE THE ACCOUNT SETUP
// THIS FUNCTION WILL BE CALLED FROM THE MANAGE TEAM PAGE WHEN THE ADMIN CLICKS THE "NEW ACCOUNT" BUTTON

// NEW USERID VALIDATION RULES:
// MUST BE 6 CHARACTERS LONG
// FIRST 3 CHARACTERS MUST BE LETTERS (A-Z, a-z)
// LAST 3 CHARACTERS MUST BE NUMBERS (0-9)
// EXAMPLE OF A VALID USERID: ABC123

async function validateUserIdFromat(userId) {
    const userIdTrimmed = (userId || '').trim();
    const userIdPattern = /^[A-Za-z]{3}\d{3}$/;
    return userIdPattern.test(userIdTrimmed);
    //Example Returns true for valid format, false for invalid format
}
async function checkIfUserIdExists(userId) {
    const userIdTrimmed = (userId || '').trim().toUpperCase();
    if (!userIdTrimmed) {
        return false;
    }

    try {
        const results = await wixData
            .query('UserAccounts')
            .eq('userId', userIdTrimmed)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        return results.items.length > 0;
    } catch (error) {
        console.error('Error checking User ID existence:', error);
        return false;
    }
}
async function checkUserEmailExists(email) {
    const emailTrimmed = (email || '').trim().toLowerCase();
    if (!emailTrimmed) {
        return false;
    }

    try {
        const results = await wixData
            .query('UserAccounts')
            .eq('loginEmail', emailTrimmed)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        return results.items.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error);
        return false;
    }
}

// GENERATE A SUGGESTED USER ID BASED ON FULL NAME OF THE USER'S FIRST AND LAST NAME
async function generateUserIdSuggestion() {
    const randomNum = Math.floor(100 + Math.random() * 900); // Generate a random 3-digit number
    const userIdSuggestion = `USR${randomNum}`; // Example format: USR123
    const exists = await checkIfUserIdExists(userIdSuggestion);
    if (exists) {
        // Recursively generate a new suggestion if it already exists
        return generateUserIdSuggestion();
    }

    return userIdSuggestion;

}
async function getMembersForDropdown() {
    try {
        const results = await wixData
            .query('Members')
            .limit(100)
            .find({ suppressAuth: true, suppressHooks: true });

        return results.items.map(member => ({
            label: `${member.firstName} ${member.lastName} (${member.email})`,
            value: member._id
        }));
    } catch (error) {
        console.error('Error fetching members for dropdown:', error);
        return [];
    }
}

/*
const createNewAccount_Exit_Button = $w('#createNewAccount-Close-Button');
const createNewAccount_Reset_Button = $w('#createNewAccount-Reset-Button');
const createNewAccount_FirstName_Input = $w('#createNewAccount-FirstName-Input');
const createNewAccount_LastName_Input = $w('#createNewAccount-LastName-Input');
const createNewAccount_UserId_Input = $w('#createNewAccount-UserId-Input');
const createNewAccount_Status_DisplayText = $w('#createNewAccount-UserID-Status-DisplayText');
const createNewAccount_MemberAccountLink_Dropdown_Input = $w('#createNewAccount-MemberAccount-Dropdown-Input');
const createNewAccount_Discard_Button = $w('#createNewAccount-Discard-Button');
const createNewAccount_SaveUpdate_Button = $w('#createNewAccount-SaveUpdate-Button');
*/

async function resetFields(
    createNewAccount_FirstName_Input,
    createNewAccount_LastName_Input,
    createNewAccount_UserId_Input,
    createNewAccount_Status_DisplayText,
    createNewAccount_MemberAccountLink_Dropdown_Input
) {
    createNewAccount_FirstName_Input.value = '';
    createNewAccount_LastName_Input.value = '';
    createNewAccount_UserId_Input.value = await generateUserIdSuggestion();
    createNewAccount_Status_DisplayText.text = '';
    createNewAccount_MemberAccountLink_Dropdown_Input.value = '';

    let options = await getMembersForDropdown();
    createNewAccount_MemberAccountLink_Dropdown_Input.options = options;
}

async function createNewAccountPageSetup(
    createNewAccount_Exit_Button,
    createNewAccount_Reset_Button,
    createNewAccount_FirstName_Input,
    createNewAccount_LastName_Input,
    createNewAccount_UserId_Input,
    createNewAccount_Status_DisplayText,
    createNewAccount_MemberAccountLink_Dropdown_Input,
    createNewAccount_Discard_Button,
    createNewAccount_SaveUpdate_Button
) {
    createNewAccount_Exit_Button.onClick(async () => {
       primaryNavigate($w('#multiStateBox1'), 'manageTeam');
    });
    createNewAccount_Discard_Button.onClick(async () => {
        await resetFields(
            createNewAccount_FirstName_Input,
            createNewAccount_LastName_Input,
            createNewAccount_UserId_Input,
            createNewAccount_Status_DisplayText,
            createNewAccount_MemberAccountLink_Dropdown_Input
        );
    });

    createNewAccount_Reset_Button.onClick(async () => {
        createNewAccount_FirstName_Input.value = '';
        createNewAccount_LastName_Input.value = '';
        createNewAccount_UserId_Input.value = await generateUserIdSuggestion();
        createNewAccount_Status_DisplayText.text = '';
        createNewAccount_MemberAccountLink_Dropdown_Input.value = '';
        
        
            let options = await getMembersForDropdown();
            createNewAccount_MemberAccountLink_Dropdown_Input.options = options;
    
    });

    createNewAccount_UserId_Input.onInput(async () => {
        const userIdValue = (createNewAccount_UserId_Input.value || '').trim().toUpperCase();
        if (!userIdValue) {
            createNewAccount_Status_DisplayText.text = '';
            return;
        }
validateUserIdFromat(userIdValue).then(async (isValidFormat) => {
            if (!isValidFormat) {
                createNewAccount_Status_DisplayText.text = 'Invalid format. Use 3 letters followed by 3 numbers (e.g., ABC123).';
                return;
            }
            const exists = await checkIfUserIdExists(userIdValue);
            if (exists) {
                createNewAccount_Status_DisplayText.text = 'User ID already exists. Please choose another.';
            } else {
                createNewAccount_Status_DisplayText.text = 'User ID is available.';
            }
        });
    });

    // Additional setup for member account linking dropdown and save/discard buttons to be implemented later
    console.log('Create New Account page setup - functionality to be implemented.');
}


// SUBMIT NEW ACCOUNT CREATION
// THIS CODE WILL REGISTER THE NEW MEMBER AND CREATE A USER ACCOUNT WITH THE PROVIDED DETAILS
// THE NEW USER ACCOUNT WILL BE LINKED TO THE SELECTED MEMBER ID VIA THE CONNECTEDMEMBERID FIELD
// A TEMPORARY PASSWORD WILL BE GENERATED AND EMAILED TO THE NEW MEMBER'S EMAIL TO COMPLETE THEIR ACCOUNT SETUP

async function submitNewAccountCreation(
    createNewAccount_FirstName_Input,
    createNewAccount_LastName_Input,
    createNewAccount_UserId_Input,
    createNewAccount_MemberAccountLink_Dropdown_Input
) {
    const firstName = (createNewAccount_FirstName_Input.value || '').trim();
    const lastName = (createNewAccount_LastName_Input.value || '').trim();
    const userId = (createNewAccount_UserId_Input.value || '').trim().toUpperCase();
    const memberId = createNewAccount_MemberAccountLink_Dropdown_Input.value;

    if (!firstName || !lastName || !userId || !memberId) {
        console.warn('Submit New Account Creation: missing required fields.');
        return;
    }

    const isValidUserId = await validateUserIdFromat(userId);
    if (!isValidUserId) {
        console.warn('Submit New Account Creation: invalid User ID format.');
        return;
    }

    const userIdExists = await checkIfUserIdExists(userId);
    if (userIdExists) {
        console.warn('Submit New Account Creation: User ID already exists.');
        return;
    }

    const emailExists = await checkUserEmailExists(memberId);
    if (emailExists) {
        console.warn('Submit New Account Creation: Email already associated with another account.');
        return;
    }       
    // REGISTER THE NEW USER ACCOUNT LOGIC TO BE IMPLEMENTED LATER

    console.log('Submit New Account Creation - functionality to be implemented.');
}

