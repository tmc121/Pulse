import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';




const main_loginUserName_Button = $w('#header-LoginUsername-Button');
//QUICK MENU ELEMENTS
const main_Header_Menu_Wrapper = $w('#header-Main-QuickMenu-Wrapper');
const main_QuickMenu_Button_Account = $w('#header-QuickMenu-Button-Account');
const main_QuickMenu_Button_Team = $w('#header-QuickMenu-Button-Team');
const main_QuickMenu_Button_Manage = $w('#header-QuickMenu-Button-Manage');
const main_QuickMenu_Button_Logout = $w('#header-QuickMenu-Button-Logout');


// SET UP QUICKMENU FUNCTIONALITY
async function setupQuickMenu() {
    main_loginUserName_Button.label = "SignUp/Login";
    main_loginUserName_Button().onClick( () => {
        if (main_Header_Menu_Wrapper().collapsed) {
            main_Header_Menu_Wrapper.expand();
        } else {
            main_Header_Menu_Wrapper.collapse();
        }
    });
    
    main_QuickMenu_Button_Account.label = 'Account';
    main_QuickMenu_Button_Account.onClick( () => {
        primaryNavigate('myAccount');
    });

    main_QuickMenu_Button_Team.label = 'My Team';
    main_QuickMenu_Button_Team.onClick( () => {
        primaryNavigate('team');
    });

    main_QuickMenu_Button_Manage.label = 'Manage Team';
    main_QuickMenu_Button_Manage.onClick( () => {
        primaryNavigate('manageTeamMain1');
    });

    main_QuickMenu_Button_Logout.label = 'Logout';
    main_QuickMenu_Button_Logout.onClick( async () => {
        await authentication.logout();
        
    });
}
    
