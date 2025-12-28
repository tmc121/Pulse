// File: src/public/UserAccounts-Auth.js
// import {   } from 'public/UserAccounts-Auth.js';

// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO USER ACCOUNTS AND AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members';


// THIS FUNCTION WILL CHECK IF A MEMBER IS LOGGED IN AND RETURN THE MEMBER DETAILS
export async function getLoggedInMemberId(){
    
    try {
        const member = await currentMember.getMember();
        if (member) {
            return member._id; // Return the member ID if logged in
        } else {
            return null; // No member is logged in   
        }
    } catch (error) {
        console.error("Error fetching logged-in member:", error);
        throw error; // Rethrow the error for further handling if needed
    }
}
   

// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S _ID;

export async function getUserAccountByMemberId(id){

    try {
        const userAccount = await wixData.query("UserAccounts")
            .eq("connectedMemberId", id)
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
        console.error("Error fetching user account:", error);
        throw error; // Rethrow the error for further handling if needed
    }   
}


// THIS FUNCTION WILL QUERY & CHECK FOR A USER ACCOUNT
// BASED ON A LOGGED-IN MEMBER'S EMAIL;
export async function getUserAccountByEmail(email){

    try {
        const userAccount = await wixData.query("UserAccounts")
            .eq("loginEmail", email.toLowerCase())
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