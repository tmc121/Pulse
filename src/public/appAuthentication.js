// File:  src/public/appAuthentication.js
// import { getLoggedInMemberId, loggedInMember, onMemberLogin, onMemberLogout } from 'public/appAuthentication.js';


// IMPORTS
import { authentication, currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth.js';
import wixLocationFrontend from 'wix-location-frontend';
import { primaryNavigate } from './appNavigation';
import { setMyTeamPage } from 'public/appMyTeam.js';
import { setManageTeamPage } from 'public/appManageTeam.js';
import wixWindowFrontend from 'wix-window-frontend';
// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO APP AUTHENTICATION
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

const primary_MyAccountState = 'myAccountMain1';
const primary_TeamState = 'teamMain1';
const primary_Dashboard = 'dashboard';
const primary_ManageTeamState = 'manageTeamMain1';

// HELPER FUNCTION TO GET PRIMARY MULTISTATE BOX

function getPrimaryMultiState() {
    try {
        return $w('#multiStateBox1');
    } catch (_e) {
        return null;
    }
}

// Safe selector to avoid runtime errors on pages without the element
function selectOrNull(selector) {
    try {
        return $w(selector);
    } catch (_e) {
        return null;
    }
}

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
            await ensureTeamAdminAssigned(member._id, userAccount);
            const displayName = userAccount?.account
                ? `${userAccount.account.firstName || ''} ${userAccount.account.lastName || ''}`.trim() || 'Account'
                : 'Account';
            mainLoginButton.label = displayName;
            mainLoginButton.onClick(async () => {
                quickMenuWrapper.expand();
            });
            quickMenuAccountButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_MyAccountState);
                } else {
                    wixLocationFrontend.to('/home');
                }
            });
            quickMenuTeamButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_TeamState);
                    const teamElements = [
                        selectOrNull('#myTeam-Exit-Button'),
                        selectOrNull('#myTeam-Team-Repeater'),
                        selectOrNull('#myTeam-TeamItem-box'),
                        selectOrNull('#myTeam-TeamItem-CheckBox'),
                        selectOrNull('#myTeam-TeamItem-Button'),
                        selectOrNull('#myTeam-SelectedTeam-Title'),
                        selectOrNull('#myTeam-SelectedTeam-UserId'),
                        selectOrNull('#myTeam-SelectedTeam-FullName'),
                        selectOrNull('#myTeam-SelectedTeam-Email'),
                        selectOrNull('#myTeam-SelectedTeam-Status-Button')
                    ];
                    if (teamElements.every(Boolean)) {
                        await setMyTeamPage(
                            teamElements[0],
                            teamElements[1],
                            teamElements[2],
                            teamElements[3],
                            teamElements[4],
                            teamElements[5],
                            teamElements[6],
                            teamElements[7],
                            teamElements[8],
                            teamElements[9]
                        );
                    } else {
                        console.warn('My Team elements missing on this page; skipping setMyTeamPage');
                    }
                } else {
                    wixLocationFrontend.to('/home');
                }
            });
            quickMenuManageButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_ManageTeamState);
                    const manageElements = [
                        selectOrNull('#manageTeam-Close-Button'),
                        selectOrNull('#manageTeam-EditAccounts-Button'),
                        selectOrNull('#manageTeam-NewAccount-Button'),
                        selectOrNull('#manageTeam-Accounts-Repeater'),
                        selectOrNull('#manageTeam-DisplayAccount-Item-Button'),
                        selectOrNull('#manageTeam-AccountItem-CheckBox'),
                        selectOrNull('#manageTeam-SelectedItem-DisplayWrapper'),
                        selectOrNull('#manageTeam-SelectedItem-UserID-Text'),
                        selectOrNull('#manageTeam-SelectedItem-FullName-Text'),
                        selectOrNull('#manageTeam-SelectedItem-Email-Text'),
                        selectOrNull('#manageTeam-SelectedItem-Status-Button'),
                        selectOrNull('#manageTeam-SelectedItem-DisableAccount-Button'),
                        selectOrNull('#manageTeam-SelectedItem-Discard-Button'),
                        selectOrNull('#manageTeam-SelectedItem-Save-Button')
                    ];
                    if (manageElements.every(Boolean)) {
                        await setManageTeamPage(
                            manageElements[0],
                            manageElements[1],
                            manageElements[2],
                            manageElements[3],
                            manageElements[4],
                            manageElements[5],
                            manageElements[6],
                            manageElements[7],
                            manageElements[8],
                            manageElements[9],
                            manageElements[10],
                            manageElements[11],
                            manageElements[12],
                            manageElements[13]
                        );
                    } else {
                        console.warn('Manage Team elements missing on this page; skipping setManageTeamPage');
                    }
                } else {
                    wixLocationFrontend.to('/home');
                }
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
            await ensureTeamAdminAssigned(member._id, userAccount);
            const displayName = userAccount?.account
                ? `${userAccount.account.firstName || ''} ${userAccount.account.lastName || ''}`.trim() || 'Account'
                : 'Account';
            mainLoginButton.label = displayName;
            mainLoginButton.onClick(async () => {
                quickMenuWrapper.expand();
            });
            quickMenuAccountButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_MyAccountState);
                } else {
                    wixLocationFrontend.to('/home');
                }
            });
            quickMenuTeamButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_TeamState);
                } else {
                    wixLocationFrontend.to('/home');
                }
            });
            quickMenuManageButton.onClick(async () => {
                quickMenuWrapper.collapse();
                const ms = getPrimaryMultiState();
                if (ms) {
                    await primaryNavigate(ms, primary_ManageTeamState);
                    const manageElements = [
                        selectOrNull('#manageTeam-Exit-Button'),
                        selectOrNull('#manageTeam-EditAccounts-Button'),
                        selectOrNull('#manageTeam-NewAccount-Button'),
                        selectOrNull('#manageTeam-Accounts-Repeater'),
                        selectOrNull('#manageTeam-DisplayAccount-Item-Button'),
                        selectOrNull('#manageTeam-AccountItem-CheckBox'),
                        selectOrNull('#manageTeam-SelectedItem-DisplayWrapper'),
                        selectOrNull('#manageTeam-SelectedItem-UserID-Text'),
                        selectOrNull('#manageTeam-SelectedItem-FullName-Text'),
                        selectOrNull('#manageTeam-SelectedItem-Email-Text'),
                        selectOrNull('#manageTeam-SelectedItem-Status-Button'),
                        selectOrNull('#manageTeam-SelectedItem-DisableAccount-Button'),
                        selectOrNull('#manageTeam-SelectedItem-Discard-Button'),
                        selectOrNull('#manageTeam-SelectedItem-Save-Button')
                    ];
                    if (manageElements.every(Boolean)) {
                        await setManageTeamPage(
                            manageElements[0],
                            manageElements[1],
                            manageElements[2],
                            manageElements[3],
                            manageElements[4],
                            manageElements[5],
                            manageElements[6],
                            manageElements[7],
                            manageElements[8],
                            manageElements[9],
                            manageElements[10],
                            manageElements[11],
                            manageElements[12],
                            manageElements[13]
                        );
                    } else {
                        console.warn('Manage Team elements missing on this page; skipping setManageTeamPage');
                    }
                } else {
                    wixLocationFrontend.to('/home');
                }
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

// THIS CODE WILL CHECK IF THE LOGGED-IN MEMBER'S USER ACCOUNT HAS A TEAM ADMIN LISTED
// IF SO, RETURN TRUE, ELSE RETURN FALSE
// THIS WILL HELP DETERMINE IF TO PROMPT THE GET TEAM POPUP/LIGHTBOX

export async function checkMemberHasTeamAdmin(memberId, cachedUserAccount) {
    try {
        const userAccountWrapper = cachedUserAccount || await getUserAccountByMemberId(memberId);
        const acc = userAccountWrapper?.account ?? userAccountWrapper; // accept either wrapper or raw account
        const admins = acc?.teamAdmin;
        return Array.isArray(admins) && admins.length > 0;
    } catch (error) {
        console.error("Error checking if member has team admin privileges:", error);
        throw error; // Rethrow the error for further handling if needed
    }
}   

async function ensureTeamAdminAssigned(memberId, cachedUserAccount) {
    const hasTeamAdmin = await checkMemberHasTeamAdmin(memberId, cachedUserAccount);
    if (hasTeamAdmin) {
        return true;
    }
    wixWindowFrontend.openLightbox('Get Team');
    return false;
}
