// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocationFrontend from 'wix-location-frontend';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-frontend';

const getTeam_Disclaimer_DisplayText = $w('#getTeam-Disclaimer-DisplayText');
const getTeam_AdminUserId_Input = $w('#getTeam-AdminUserId-Input');
const getTeam_Status_Display = $w('#getTeam-Status-Display');
const getTeam_ConnectMyTeam_Button = $w('#getTeam-ConnectMyTeam-Button');
const getTeam_Exit_Button = $w('#getTeam-Exit-Button');


// The Get Team page is intended to allow users to connect their team accounts.
// Implementation will depend on the specific team service being integrated.
// Below is a placeholder for where you would add your integration logic.
// The code will need to query the userAccounts collection to validate a users is an admin the adminAccount field for the adminUserId must be true. The user must match the an adminUsers userid with the input value from adminUserId_Input.
// Validate the entered admin userId against UserAccounts.adminAccount === true and active status
async function validateAdminUserId(adminUserIdRaw) {
  const adminUserId = (adminUserIdRaw || '').trim();
  if (!adminUserId) {
    return { isValid: false, account: null };
  }

  try {
    const results = await wixData
      .query('UserAccounts')
      .eq('userId', adminUserId)
      .eq('adminAccount', true)
      .eq('status', 'Active')
      .find({ suppressAuth: true, suppressHooks: true });

    if (results.items && results.items.length > 0) {
      return { isValid: true, account: results.items[0] };
    }
    return { isValid: false, account: null };
  } catch (error) {
    console.error('Error validating admin userId:', error);
    return { isValid: false, account: null };
  }
}

// Wire handlers
$w.onReady(async function () {
  // Default state
  getTeam_ConnectMyTeam_Button.disable();
  getTeam_Status_Display.text = "Enter your Admin User ID to connect.";

  // Live validation on input change
  getTeam_AdminUserId_Input.onInput(async () => {
    const adminUserId = (getTeam_AdminUserId_Input.value || '').trim();
    if (!adminUserId) {
      getTeam_Status_Display.text = "Please enter your Admin User ID.";
      getTeam_ConnectMyTeam_Button.disable();
      return;
    }

    getTeam_Status_Display.text = "Validating admin access...";
    const { isValid } = await validateAdminUserId(adminUserId);
    if (isValid) {
      getTeam_Status_Display.text = "Admin verified. You can connect your team.";
      getTeam_ConnectMyTeam_Button.enable();
    } else {
      getTeam_Status_Display.text = "Admin User ID is not an active admin account.";
      getTeam_ConnectMyTeam_Button.disable();
    }
  });

  // Connect button re-validates before proceeding
  getTeam_ConnectMyTeam_Button.onClick(async () => {
    const adminUserId = (getTeam_AdminUserId_Input.value || '').trim();
    if (!adminUserId) {
      getTeam_Status_Display.text = "Please enter your Admin User ID.";
      getTeam_ConnectMyTeam_Button.disable();
      return;
    }

    getTeam_ConnectMyTeam_Button.disable();
    getTeam_Status_Display.text = "Connecting your team...";

    const { isValid, account } = await validateAdminUserId(adminUserId);
    if (!isValid || !account || !account._id) {
      getTeam_Status_Display.text = "Admin User ID is not an active admin account.";
      getTeam_ConnectMyTeam_Button.enable();
      return;
    }

    try {
      // Get the current member's ID
      const member = await currentMember.getMember();
      if (!member || !member._id) {
        throw new Error('Unable to retrieve member information');
      }

      // Update the current user's account to link them to the team admin
      const results = await wixData
        .query('UserAccounts')
        .eq('memberId', member._id)
        .find({ suppressAuth: true, suppressHooks: true });

      if (results.items && results.items.length > 0) {
        const userAccount = results.items[0];
        // Multi-reference expects an array; enforce single admin link
        userAccount.teamAdmin = [account._id];
        userAccount.teamAdminId = adminUserId;
        userAccount._updatedDate = new Date();

        await wixData.update('UserAccounts', userAccount, { suppressAuth: true, suppressHooks: true });
        console.log('User account linked to team admin:', adminUserId);
      } else {
        throw new Error('User account not found');
      }

      console.log('Team connected successfully');
      getTeam_Status_Display.text = "Team connected successfully!";
      
      // Redirect back to home page after a short delay
      setTimeout(() => {
        wixLocationFrontend.to('/home');
      }, 2000);
    } catch (error) {
      console.error(error);
      getTeam_Status_Display.text = "Failed to connect your team. Please try again.";
      getTeam_ConnectMyTeam_Button.enable();
    }
  });

  getTeam_Exit_Button.onClick(async() => {
    wixLocationFrontend.to('/home');
  }); 
});
    


