// File:  src/public/appAuthentication.js
// import { logoutCurrentUser, handleOnLogin, handleOnLogout, getLoggedInMemberId } from 'public/appAuthentication.js';

// IMPORTS
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import { authentication, currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId, validateUserAccountAccess } from 'public/UserAccounts-Auth.js';

// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO APP AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES


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


// THIS FUNCTION WILL LOGOUT THE CURRENT LOGGED-IN USER
export async function logoutCurrentUser(headerLoginOutButton, headerQuickMenu) {
    try {
        await authentication.logout();
        console.log("User logged out successfully.");
        
        // After logout, set up the logged-out state
        await handleOnLogout(headerLoginOutButton, headerQuickMenu);
        
    } catch (error) {
        console.error("Error logging out user:", error);
        throw error; // Rethrow the error for further handling if needed
    }
}

// THIS FUNCTION WILL HANDLE ON LOGIN ACTIONS
export async function handleOnLogin(headerLoginOutButton, headerQuickMenu) {
    try {
        // Add any actions you want to perform on login here
        console.log("User logged in successfully.");
        
        const memberId = await getLoggedInMemberId();
        console.log("Retrieved memberId for validation:", memberId);
        const validation = await validateUserAccountAccess(memberId);
        
        if (!validation.isValid) {
            // User doesn't have valid access - log them out
            console.log("User access validation failed:", validation.reason, validation.message);
            
            // If user needs team assignment, redirect to Get Team page
            if (validation.requiresTeamAssignment) {
                console.log("User needs team assignment");
                // Don't logout immediately, let them assign to a team first
                headerLoginOutButton.label = "Setup Required";
                headerLoginOutButton.onClick( async () => {
                    try {
                        wixWindowFrontend.openLightbox('Get Team'); // THIS IS THE POPUP LIGHTBOX FOR TEAM ASSIGNMENT
                    } catch (error) {
                        console.error("Error opening Get Team lightbox:", error);
                    }
                });
                return;
            }
            
            // For other validation failures, logout the user
            await logoutCurrentUser(headerLoginOutButton, headerQuickMenu);
            
            // Show error message (you might want to show this in a popup or notification)
            console.error("Access denied:", validation.message);
            return;
        }
        
        // User has valid access - proceed with normal login
        const userAccount = validation.account;
        headerLoginOutButton.label = userAccount.firstName + " " + userAccount.lastName || "Account";
        headerLoginOutButton.onClick( async () => {
            try {
                // For logged-in users, toggle the quick menu
                if (headerQuickMenu.collapsed) {
                    headerQuickMenu.expand();
                } else {
                    headerQuickMenu.collapse();
                }
                headerQuickMenu.onMouseOut( () => {
                    headerQuickMenu.collapse();
                });
            } catch (error) {
                console.error("Error toggling header quick menu on login:", error);
            }
        });
        
        console.log("User access validated successfully for:", userAccount.firstName, userAccount.lastName);
        
    } catch (error) {
        console.error("Error during login actions:", error);
        // On error, logout the user for security
        await logoutCurrentUser(headerLoginOutButton, headerQuickMenu);
        throw error; // Rethrow the error for further handling if needed
    }
}

// THIS FUNCTION WILL HANDLE ON LOGOUT ACTIONS
export async function handleOnLogout(headerLoginOutButton, headerQuickMenu) {
    try {
        // Add any actions you want to perform on logout here
        console.log("User logged out successfully.");
        headerLoginOutButton.label = "SignUp/Login"; // Reset label to default
        headerLoginOutButton.onClick( async () => {
            try {
                // For logged-out users, prompt login instead of opening menu
                let options = {"mode": "login", "modal": true};
                await authentication.promptLogin(options);
                // Ensure menu stays collapsed when not logged in
                headerQuickMenu.collapse();
            } catch (error) {
                console.error("Error prompting login on logout:", error);
            }
        });
    } catch (error) {
        console.error("Error during logout actions:", error);
        throw error; // Rethrow the error for further handling if needed
    }
}

// THIS FUNCTION WILL VALIDATE FRESH LOGIN AND HANDLE TEAM ASSIGNMENT REQUIREMENTS
export async function validateFreshLogin() {
    try {
        const memberId = await getLoggedInMemberId();
        if (!memberId) {
            return { isValid: false, action: 'LOGIN_REQUIRED' };
        }
        
        const validation = await validateUserAccountAccess(memberId);
        
        if (!validation.isValid) {
            if (validation.requiresTeamAssignment) {
                // Open Get Team lightbox popup
                wixWindowFrontend.openLightbox('Get Team');
                return { isValid: false, action: 'TEAM_ASSIGNMENT_OPENED', reason: validation.reason };
            }
            // For other validation failures, just return the failure without forcing logout here
            return { isValid: false, action: 'LOGOUT_REQUIRED', reason: validation.reason, message: validation.message };
        }
        
        return { isValid: true, account: validation.account };
        
    } catch (error) {
        console.error("Error validating fresh login:", error);
        return { isValid: false, action: 'ERROR', reason: 'ERROR' };
    }
}      