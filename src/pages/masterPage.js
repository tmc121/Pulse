import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';

import { logoutCurrentUser, handleOnLogin, handleOnLogout, getLoggedInMemberId, validateFreshLogin } from 'public/appAuthentication.js';
import { logout } from "wix-users";

// Get reference to the primary multistate box from Home page
// const primaryMultiState = $w('#multiStateBox1');





const main_loginUserName_Button = $w('#header-LoginUsername-Button');
//QUICK MENU ELEMENTS
const main_Header_Menu_Wrapper = $w('#header-Main-QuickMenu-Wrapper');
const main_QuickMenu_Button_Account = $w('#header-QuickMenu-Button-Account');
const main_QuickMenu_Button_Team = $w('#header-QuickMenu-Button-Team');
const main_QuickMenu_Button_Manage = $w('#header-QuickMenu-Button-Manage');
const main_QuickMenu_Button_Logout = $w('#header-QuickMenu-Button-Logout');


$w.onReady( async function () {
    // SET UP QUICKMENU FUNCTIONALITY
    await setupQuickMenu();
    
    // CHECK IF A MEMBER IS LOGGED IN
    const memberId =  await getLoggedInMemberId();
    if (memberId) {
        // MEMBER IS LOGGED IN - VALIDATE ACCESS
        console.log("Member is logged in with ID:", memberId);
        
        // Perform validation every time the page loads
        const validation = await validateFreshLogin();
        
        if (!validation.isValid) {
            console.log("Member validation failed:", validation.action, validation.reason);
            
            if (validation.action === 'LOGOUT_REQUIRED') {
                await logoutCurrentUser(main_loginUserName_Button, main_Header_Menu_Wrapper);
            }
            // For other actions, validateFreshLogin already handled them
            return;
        }
        
        await handleOnLogin(main_loginUserName_Button, main_Header_Menu_Wrapper);
        
        // Set up periodic validation check (every 5 minutes to be less aggressive)
        setInterval(async () => {
            try {
                const currentMemberId = await getLoggedInMemberId();
                if (currentMemberId) {
                    const periodicValidation = await validateFreshLogin();
                    if (!periodicValidation.isValid) {
                        console.log("Periodic validation failed:", periodicValidation.action, periodicValidation.reason);
                        // Handle different validation failure types
                        if (periodicValidation.action === 'LOGOUT_REQUIRED') {
                            await logoutCurrentUser(main_loginUserName_Button, main_Header_Menu_Wrapper);
                        }
                        // If it's a team assignment issue, don't logout - let them use the Get Team lightbox
                        // The validateFreshLogin already opened the lightbox for TEAM_ASSIGNMENT_OPENED
                    }
                }
            } catch (error) {
                console.error("Error in periodic validation:", error);
            }
        }, 300000); // Check every 5 minutes instead of 30 seconds
        
    } else {
        // NO MEMBER IS LOGGED IN
        console.log("No member is logged in.");
        await handleOnLogout(main_loginUserName_Button, main_Header_Menu_Wrapper);
    }
});


// SET UP QUICKMENU FUNCTIONALITY
async function setupQuickMenu() {
    // Initial setup - the actual onClick behavior will be set by handleOnLogin/handleOnLogout
    main_loginUserName_Button.label = "SignUp/Login";
    
    // Set up the menu items (these are always available when menu is open)

    main_QuickMenu_Button_Account.label = 'My Account';
    main_QuickMenu_Button_Account.onClick( async () => {
        try {
        wixLocationFrontend.to('/home?state=myAccountMain1');
        wixLocationFrontend.to(wixLocationFrontend.url);
        } catch (error) {
            console.error('Error navigating to My Account page:', error);
        }
    });

    main_QuickMenu_Button_Team.label = 'My Team';
    main_QuickMenu_Button_Team.onClick( async () => {
        try {
        wixLocationFrontend.to('/home?state=teamMain1');
        wixLocationFrontend.to(wixLocationFrontend.url);
        } catch (error) {
            console.error('Error navigating to My Team page:', error);
        }
    });

    main_QuickMenu_Button_Manage.label = 'Manage Team';
    main_QuickMenu_Button_Manage.onClick( async () => {
        try {
        wixLocationFrontend.to('/home?state=manageTeamMain1');
        wixLocationFrontend.to(wixLocationFrontend.url);
        } catch (error) {
            console.error('Error navigating to Manage Team page:', error);
        }
    });

    main_QuickMenu_Button_Logout.label = 'Logout';
    main_QuickMenu_Button_Logout.onClick( async () => {
        await logoutCurrentUser(main_loginUserName_Button, main_Header_Menu_Wrapper);
    });
}

