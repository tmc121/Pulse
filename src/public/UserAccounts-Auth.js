// File: src/public/UserAccounts-Auth.js
// import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';

// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO USER ACCOUNTS AND AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members';


// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S _ID;

// Change this function to use connectedMemberId
export async function getUserAccountByMemberId(id){
    try {
        const userAccount = await wixData.query("UserAccounts")
            .eq("connectedMemberId", id.toString()) // Changed from "memberId"
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    return results.items[0];
                } else {
                    return null;
                }
            });
        return userAccount;
    } catch (error) {
        console.error("Error fetching user account:", error);
        throw error;
    }   
}


// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S EMAIL;
export async function getUserAccountByEmail(email){

    try {
        const userAccount = await wixData.query("UserAccounts")
            .eq("loginEmail", email)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    return results.items[0]; // Return the first matching user account
                } else {
                    return null; // No matching user account found
                }
            });
        return userAccount;
    } catch (error) {
        console.error("(By Email) - Error fetching user account:", error);
        throw error; // Rethrow the error for further handling if needed
    }   
}

// THIS FUNCTION WILL CHECK IF A USER ACCOUNT EXISTS
// BASED ON A PROVIDED MEMBER ID;
export async function checkUserAccountExistsByUserId(id){

    try {
        const userAccountExists = await wixData.query("UserAccounts")
            .eq("userId", id)
            .find()
            .then((results) => {
                return results.items.length > 0; // Return true if at least one matching user account is found
            });
        return userAccountExists;
    } catch (error) {
        console.error("(Check Exists By UserID) - Error checking user account existence:", error);
        throw error; // Rethrow the error for further handling if needed
    }   
}

// THIS FUNCTION WILL CHECK IF A USER IS AN ADMIN (ADMIN ACCOUNT = TRUE)
// BASED ON A PROVIDED MEMBER ID;
export async function checkIfUserIsAdminByMemberId(id){
    try {
        const userAccount = await getUserAccountByMemberId(id);
        if (userAccount.adminAccount === true ) {
            return true; // User is an admin
        } else {
            return false; // User is not an admin or account not found
        }
    } catch (error) {
        console.error("(Check If Admin By MemberID) - Error checking if user is admin:", error);
        throw error; // Rethrow the error for further handling if needed
    }   
}

// THIS FUNCTION WILL CHECK IF AN ENTERED USER ID IS AN ADMIN (ADMIN ACCOUNT = TRUE)
// BASED ON A PROVIDED USER ID;
export async function checkIfUserIsAdminByUserId(userId){
    try {
        const userAccount = await wixData.query("UserAccounts")
            .eq("userId", userId)
            .eq("adminAccount", true)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    return true ; // Return the first matching user account

                } else {
                    return false; // No matching user account found
                }
            });
        return userAccount;
    } catch (error) {
        console.error("(Check If Admin By UserID) - Error checking if user is admin:", error);
        throw error; // Rethrow the error for further handling if needed
    }   
}

// THIS FUNCTION WILL VALIDATE IF A USER ACCOUNT IS VALID AND ACTIVE
// BASED ON A PROVIDED MEMBER ID;
export async function validateUserAccountAccess(memberId){
    try {
        const userAccount = await getUserAccountByMemberId(memberId);
        
        if (!userAccount) {
            return {
                isValid: false,
                reason: 'NO_ACCOUNT',
                message: 'No user account found. Please contact your administrator.',
                account: null
            };
        }
        
        if (userAccount.status !== 'Active') {
            return {
                isValid: false,
                reason: 'INACTIVE_ACCOUNT',
                message: 'Your account is not active. Please contact your administrator.',
                account: userAccount
            };
        }
        
        // Check if user has team admin assigned or is an admin themselves
        const hasTeamAdmin = userAccount.teamAdmin && userAccount.teamAdmin.length > 0;
        const isAdminAccount = userAccount.adminAccount === true;
        
        if (!hasTeamAdmin && !isAdminAccount) {
            return {
                isValid: false,
                reason: 'NO_TEAM_ASSIGNED',
                message: 'You need to be assigned to a team to access InComm.',
                account: userAccount,
                requiresTeamAssignment: true
            };
        }
        
        return {
            isValid: true,
            reason: 'VALID',
            message: 'Access granted.',
            account: userAccount
        };
        
    } catch (error) {
        console.error("Error validating user account access:", error);
        return {
            isValid: false,
            reason: 'ERROR',
            message: 'An error occurred while validating your account. Please try again.',
            account: null
        };
    }
}