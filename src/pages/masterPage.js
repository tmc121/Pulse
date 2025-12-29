import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';

import { getLoggedInMemberId, loggedInMember, onMemberLogin, onMemberLogout, checkUserAccountIsAdmin } from 'public/appAuthentication.js';
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

const main_LogoBox = $w('#box18'); // ON CLICK ON THESE WILL REFRESH THE APP TO HOME STATE DASHBOARD
const main_LogoTile = $w('#text5'); // ON CLICK ON THESE WILL REFRESH THE APP TO HOME STATE DASHBOARD




$w.onReady( async function () {


// HEADER LOGO AND TITLE CLICK HANDLER TO REFRESH TO HOME DASHBOARD MAIN
    // LOGO CLICK HANDLER TO REFRESH TO DASHBOARD MAIN
main_LogoBox.onClick( async () => {
    try {
        wixLocationFrontend.to('/home');
    } catch (error) {
        console.error('Error navigating to Home Dashboard page:', error);
    }
});

main_LogoTile.onClick( async () => {
    try {
        wixLocationFrontend.to('/home');
    } catch (error) {
        console.error('Error navigating to Home Dashboard page:', error);
    }
});
    // CALL THE ON LOGIN FUNCTION TO SETUP THE MASTER PAGE HEADER LOGIN BUTTON AND QUICKMENU
    await onMemberLogin(
        main_loginUserName_Button,
        main_Header_Menu_Wrapper,
        main_QuickMenu_Button_Account,
        main_QuickMenu_Button_Team,
        main_QuickMenu_Button_Manage,
        main_QuickMenu_Button_Logout
    );

    await loggedInMember(
        main_loginUserName_Button,
        main_Header_Menu_Wrapper,
        main_QuickMenu_Button_Account,
        main_QuickMenu_Button_Team,
        main_QuickMenu_Button_Manage,
        main_QuickMenu_Button_Logout
    ); // SET THE LOGGED IN MEMBER GLOBAL VARIABLE

    await onMemberLogout(
        main_loginUserName_Button,
        main_Header_Menu_Wrapper
    );  
});
