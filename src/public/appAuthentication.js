// File:  src/public/appAuthentication.js
// import { getLoggedInMemberId, loggedInMember, onMemberLogin, onMemberLogout } from 'public/appAuthentication.js';


// IMPORTS
import { authentication, currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';
import wixLocationFrontend from 'wix-location-frontend';
import { primaryNavigate } from './appNavigation';
// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO APP AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

const primary_MyAccountState = 'myAccountStateMain1';
const primary_TeamState = 'teamStateMain1';
const primary_Dashboard = 'dashboardMain1';
const primaryMultiState = $w('#multiStateBox1');

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
export async function loggedInMember(mainLoginButton, quickMenuWrapper, quickMenuAccountButton, quickMenuTeamButton, quickMenuManageButton, quickMenuLogoutButton) {
    try {
        const memberId = await getLoggedInMemberId();
        if (memberId) {
            // Member is logged in
            const member = await currentMember.getMember();
            const userAccount = await getUserAccountByMemberId(member._id);
            const displayName = userAccount?.account
                ? `${userAccount.account.firstName || ''} ${userAccount.account.lastName || ''}`.trim() || 'Account'
                : 'Account';
            mainLoginButton.label = displayName;
            mainLoginButton.onClick(async () => {
                quickMenuWrapper.expand();
            });
            quickMenuAccountButton.onClick(async () => {
                quickMenuWrapper.collapse();
                wixLocationFrontend.to('/home');
            });
            quickMenuTeamButton.onClick(async () => {
                quickMenuWrapper.collapse();
                wixLocationFrontend.to('/home');
            });
            quickMenuManageButton.onClick(async () => {
                quickMenuWrapper.collapse();
                wixLocationFrontend.to('/home');
            });
            quickMenuLogoutButton.onClick(async () => {
                quickMenuWrapper.collapse();
                await authentication.logout();
                wixLocationFrontend.to('/');
            });
            quickMenuWrapper.onMouseOut(() => {
                quickMenuWrapper.collapse();
            });
            return { member, userAccount };
        } else {
            // No member is logged in
            mainLoginButton.label = 'SignUp/Login';
            mainLoginButton.onClick(async () => {
                // Open login/signup lightbox
                let options = {
                    mode: "login",
                    modal: true,
                };
                await authentication.promptLogin(options);
            });
            return null; // No member is logged in
        }
    } catch (error) {
        console.error("Error during member login check:", error);
        setTimeout(() => {
            mainLoginButton.label = 'Error Login In';
        }, 1000);
        mainLoginButton.label = 'SignUp/Login';
        throw error; // Rethrow the error for further handling if needed
    }
}   
/*
const main_loginUserName_Button = $w('#header-LoginUsername-Button');
//QUICK MENU ELEMENTS
const main_Header_Menu_Wrapper = $w('#header-Main-QuickMenu-Wrapper');
const main_QuickMenu_Button_Account = $w('#header-QuickMenu-Button-Account');
const main_QuickMenu_Button_Team = $w('#header-QuickMenu-Button-Team');
const main_QuickMenu_Button_Manage = $w('#header-QuickMenu-Button-Manage');
const main_QuickMenu_Button_Logout = $w('#header-QuickMenu-Button-Logout');
*/

// ON LOGIN HANDLER TO SETUP THE MASTER PAGE HEADER LOGIN BUTTON AND QUICKMENU
export async function onMemberLogin(mainLoginButton, quickMenuWrapper, quickMenuAccountButton, quickMenuTeamButton, quickMenuManageButton, quickMenuLogoutButton) {
    authentication.onLogin(async () => {
    try {
        const member = await currentMember.getMember();
        if (member) {
            const userAccount = await getUserAccountByMemberId(member._id);
            const displayName = userAccount?.account
                ? `${userAccount.account.firstName || ''} ${userAccount.account.lastName || ''}`.trim() || 'Account'
                : 'Account';
            mainLoginButton.label = displayName;
            mainLoginButton.onClick(async () => {
                quickMenuWrapper.expand();
            });
            quickMenuAccountButton.onClick(async () => {
                quickMenuWrapper.collapse();
                await primaryNavigate(primaryMultiState, primary_MyAccountState);
            });
            quickMenuTeamButton.onClick(async () => {
                quickMenuWrapper.collapse();
                await primaryNavigate(primaryMultiState, primary_TeamState);
            });
            quickMenuManageButton.onClick(async () => {
                quickMenuWrapper.collapse();
                await primaryNavigate(primaryMultiState, primary_Dashboard);
            });
            quickMenuLogoutButton.onClick(async () => {
                quickMenuWrapper.collapse();
                await authentication.logout();
                wixLocationFrontend.to('/');
            });
            quickMenuWrapper.onMouseOut(() => {
                quickMenuWrapper.collapse();
            });
            return { member, userAccount };
        } else {
            mainLoginButton.label = 'SignUp/Login';
            mainLoginButton.onClick(async () => {
                // Open login/signup lightbox
                let options = {
                    mode: "login",
                    modal: true,
                };
                await authentication.promptLogin(options);
            });
            return null; // No member is logged in
        }
    } catch (error) {
        console.error("Error during member login:", error);
        setTimeout(() => {
            mainLoginButton.label = 'Error Login In';
        }, 1000);
        mainLoginButton.label = 'SignUp/Login';
        throw error; // Rethrow the error for further handling if needed
    }
    });
}

// ON LOGOUT HANDLER TO RESET THE MASTER PAGE HEADER LOGIN BUTTON AND QUICKMENU
export async function onMemberLogout(mainLoginButton, quickMenuWrapper) {
    authentication.onLogout(async () => {
    try {
        mainLoginButton.label = 'SignUp/Login';
        mainLoginButton.onClick(async () => {
            // Open login/signup lightbox
            let options = {
                mode: "login",
                modal: true,
            };
            await authentication.promptLogin(options);
        });
        quickMenuWrapper.collapse();
    } catch (error) {
        console.error("Error during member logout:", error);
        throw error; // Rethrow the error for further handling if needed
    }
    }); 
}

// CHECK IS USER ACCOUNR IS AN ADMIN ACCOUNT BASED ON MEMBER ID
export async function checkUserAccountIsAdmin(memberId) {
    try {
        const userAccount = await getUserAccountByMemberId(memberId);
        if (userAccount && userAccount.account && userAccount.account.adminAccount === true) {
            return true; // User is an admin account
        } else {
            return false; // User is not an admin account
        }
    } catch (error) {
        console.error("Error checking if user account is admin:", error);
        throw error; // Rethrow the error for further handling if needed
    }
}   

// SHOW NO ACCESS STATE ANYTIME
export async function showNoAccessState(primaryMultiState,
    noAccessMainTitle,
    noAccessTitle,
    noAccessSubtitle,
    noAccessDetails,
    opts = {}) {
    try {
        const mainTitleText = opts.mainTitleText || 'Login Required';
        const titleText = opts.titleText || 'Please sign in to continue';
        const subtitleText = opts.subtitleText || 'Access to this area requires a member login.';
        const detailsText = opts.detailsText || 'Use the SignUp/Login button in the header to authenticate.';

        if (noAccessMainTitle && 'text' in noAccessMainTitle) {
            noAccessMainTitle.text = mainTitleText;
        }
        if (noAccessTitle && 'text' in noAccessTitle) {
            noAccessTitle.text = titleText;
        }
        if (noAccessSubtitle && 'text' in noAccessSubtitle) {
            noAccessSubtitle.text = subtitleText;
        }
        if (noAccessDetails && 'text' in noAccessDetails) {
            noAccessDetails.text = detailsText;
        }

        await primaryNavigate(primaryMultiState, 'noAccessStateMain1');
    } catch (error) {
        console.error('Error showing No Access state:', error);
        throw error;
    }
}


