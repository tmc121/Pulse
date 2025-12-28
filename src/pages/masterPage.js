import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';

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
});
// SET UP QUICKMENU FUNCTIONALITY
async function setupQuickMenu() {
    main_loginUserName_Button.label = "SignUp/Login";
    main_loginUserName_Button.onClick(async () => {
        if (main_Header_Menu_Wrapper.collapsed) {
            main_Header_Menu_Wrapper.expand();
        } else {
            main_Header_Menu_Wrapper.collapse();
        }
        main_loginUserName_Button.onMouseOut( () => {
            main_Header_Menu_Wrapper.collapse();
        });
    });

    main_QuickMenu_Button_Account.label = 'Account';
    main_QuickMenu_Button_Account.onClick( async () => {
        
        
    });

    main_QuickMenu_Button_Team.label = 'My Team';
    main_QuickMenu_Button_Team.onClick( async () => {
        
    });

    main_QuickMenu_Button_Manage.label = 'Manage Team';
    main_QuickMenu_Button_Manage.onClick( async () => {
       

    main_QuickMenu_Button_Logout.label = 'Logout';
    main_QuickMenu_Button_Logout.onClick( async () => {
        await authentication.logout();
        
    });
}

