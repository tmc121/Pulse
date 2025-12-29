// File: src/public/UserAccounts-Auth.js
// import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';

// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO USER ACCOUNTS AND AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
// All user account logic removed for reset; stubs remain to avoid import errors while rebuilding.
import wixData from 'wix-data';


// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S _ID;

// Change this function to use connectedMemberId
// Call Exampple: getUserAccountByMemberId(member._id)
// Returns: { activeAccount: boolean, account: object|null }
export async function getUserAccountByMemberId(memberId){
    const cleanId = memberId || '';
    if (!cleanId) {
        return { activeAccount: false, account: null };
    }

    try {
        const results = await wixData
            .query('UserAccounts')
            .eq('connectedMemberId', cleanId)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        const account = results.items?.[0] || null;
        return { activeAccount: !!account, account };
    } catch (error) {
        console.error('Error querying UserAccounts by connectedMemberId:', error);
        return { activeAccount: false, account: null };
    }
}


// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S EMAIL;
// NOT YET USED - FOR FUTURE PURPOSES
export async function getUserAccountByEmail(_email){
    console.warn('getUserAccountByEmail stub: user account logic reset.');
    return null;
}

// THIS FUNCTION WILL CHECK IF A USER ACCOUNT EXISTS
// BASED ON A PROVIDED MEMBER ID;
export async function checkUserAccountExistsByUserId(_id){
    console.warn('checkUserAccountExistsByUserId stub: user account logic reset.');
    return false;
}

// THIS FUNCTION WILL CHECK IF A USER IS AN ADMIN (ADMIN ACCOUNT = TRUE)
// BASED ON A PROVIDED MEMBER ID;
export async function checkIfUserIsAdminByMemberId(_id){
    console.warn('checkIfUserIsAdminByMemberId stub: user account logic reset.');
    return false;
}

// THIS FUNCTION WILL CHECK IF AN ENTERED USER ID IS AN ADMIN (ADMIN ACCOUNT = TRUE)
// BASED ON A PROVIDED USER ID;
export async function checkIfUserIsAdminByUserId(_userId){
    console.warn('checkIfUserIsAdminByUserId stub: user account logic reset.');
    return false;
}

// THIS FUNCTION WILL VALIDATE IF A USER ACCOUNT IS VALID AND ACTIVE
// BASED ON A PROVIDED MEMBER ID;
export async function validateUserAccountAccess(_memberId){
    console.warn('validateUserAccountAccess stub: validation skipped while rebuilding auth.');
    return {
        isValid: true,
        reason: 'SKIPPED',
        message: 'Validation skipped; auth rebuild in progress.',
        account: null
    };
}