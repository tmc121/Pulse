import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { navigateToAccount, navigateToTeam, navigateToManage , navigateToNoAccess } from './Home.c1dmp'; // Fixed import path for Wix

const main_loginUserName_Button = $w('#header-LoginUsername-Button');
//QUICK MENU ELEMENTS
const main_Header_Menu_Wrapper = $w('#header-Main-QuickMenu-Wrapper');
const main_QuickMenu_Button_Account = $w('#header-QuickMenu-Button-Account');
const main_QuickMenu_Button_Team = $w('#header-QuickMenu-Button-Team');
const main_QuickMenu_Button_Manage = $w('#header-QuickMenu-Button-Manage');
const main_QuickMenu_Button_Logout = $w('#header-QuickMenu-Button-Logout');

async function promptLogin() {
  const options = {
    mode: "login",
    modal: true,
  };

  authentication
    .promptLogin(options)
    .then(async () => {
      console.log("Member is logged in");
      // Refresh the page to update the UI after login
      wixLocationFrontend.to(wixLocationFrontend.url);
    })
    .catch((error) => {
      console.error(error);
    });
}

// Clear stored member info on logout
function clearMemberStorage() {
  console.log("Member info cleared");
}

// Function to validate admin userId
async function validateUserId(memberId) {
  if (!memberId) {
    return { isValid: false, account: null };
  }

  try {
    const results = await wixData
      .query('UserAccounts')
      .eq('connectedMemberId', memberId.toString())
      .eq('status', 'ACTIVE')
      .find({ suppressAuth: true, suppressHooks: true });

    if (results.items && results.items.length > 0) {
      const account = results.items[0];
      return { isValid: true, account: account };
    } else {
      return { isValid: false, account: null };
    }
  } catch (error) {
    console.error('Error validating admin user ID:', error);
    return { isValid: false, account: null };
  }
}

$w.onReady(async function () {
  try {
    const member = await currentMember.getMember();

    if (member) {
      const memberId = member._id;
      
      if (!memberId) {
        console.error('Member ID is missing');
        clearMemberStorage();
        main_loginUserName_Button.label = "SignUp/Login";
        main_loginUserName_Button.onClick(() => {
          promptLogin();
        });
        await navigateToNoAccess();
        return;
      }
      
      const { isValid, account } = await validateUserId(memberId);

      if (isValid && account) {
      // Use firstName and lastName if fullName doesn't exist
      const displayName = account.fullName || 
                         (account.firstName && account.lastName ? 
                          `${account.firstName} ${account.lastName}` : 
                          account.firstName || 
                          account.lastName || 
                          "Account User");
      
      main_loginUserName_Button.label = displayName;

      // Show quick menu on user name button click
      main_loginUserName_Button.onClick(async() => {
        main_Header_Menu_Wrapper.show();
        main_Header_Menu_Wrapper.expand();
      });

      // Navigate to Account page
      main_QuickMenu_Button_Account.onClick(async () => {
        await navigateToAccount();
        main_Header_Menu_Wrapper.collapse();
      });
      // Navigate to Team page
      main_QuickMenu_Button_Team.onClick(async () => {
        await navigateToTeam();
        main_Header_Menu_Wrapper.collapse();
      });
      // Navigate to Manage page
      main_QuickMenu_Button_Manage.onClick(async () => {
        await navigateToManage();
        main_Header_Menu_Wrapper.collapse();
      });
      // Logout functionality
      main_QuickMenu_Button_Logout.onClick(async () => {
        await authentication.logout();
        main_Header_Menu_Wrapper.collapse();
        // Refresh the page to update the UI after logout
        wixLocationFrontend.to(wixLocationFrontend.url);
      });
    } else {
      // Invalid users
      main_loginUserName_Button.label = "SignUp/Login";
      main_loginUserName_Button.onClick(async() => {
        await promptLogin();
      });
      await navigateToNoAccess();
    }
  } else {
    // Not logged in
    main_loginUserName_Button.label = "SignUp/Login";
    main_loginUserName_Button.onClick(() => {
      promptLogin();
    });
    await navigateToNoAccess();
  }
  } catch (error) {
    console.error('Error in masterPage initialization:', error);
    main_loginUserName_Button.label = "SignUp/Login";
    main_loginUserName_Button.onClick(() => {
      promptLogin();
    });
    await navigateToNoAccess();
  }
});
