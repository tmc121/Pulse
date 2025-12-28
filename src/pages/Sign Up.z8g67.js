// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import { authentication, currentMember } from "wix-members-frontend";
import wixData from "wix-data";
import wixLocationFrontend from 'wix-location-frontend';

const signUp_FirstName_Input = $w('#SignUp-FirstName-Input');
const signUp_LastName_Input = $w('#SignUp-LastName-Input');
const signUp_LoginEmail_Input = $w('#SignUp-LoginEmail-Input');
const signUp_Password_Input = $w('#SignUp-Password-Input');
const signUp_ConfirmPassword_Input = $w('#SignUp-ConfirmPassword-Input');
const signUp_ResultsStatus_Text = $w('#SignUp-StatusText');
const signUp_Submit_Button = $w('#SignUp-Button');
const signUp_Login_Button = $w('#SignUp-Login-Button'); // Prompt Login;

$w.onReady(function () {
    signUp_Submit_Button.onClick(async () => { 
    const firstName = signUp_FirstName_Input.value;
    const lastName = signUp_LastName_Input.value;
    const email = signUp_LoginEmail_Input.value;
    const password = signUp_Password_Input.value;
    const confirmPassword = signUp_ConfirmPassword_Input.value;

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      signUp_ResultsStatus_Text.text = "Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      signUp_ResultsStatus_Text.text = "Passwords do not match.";
      return;
    }

    // Disable button to prevent double-submit
    signUp_Submit_Button.disable();
    signUp_ResultsStatus_Text.text = "Signing up...";

    try {
      await authentication.register(email, password, {
        contactInfo: {
          firstName: firstName,
          lastName: lastName
        }
      });
      console.log("Member is registered and logged in");
      
      // Get the newly registered member's ID
      const member = await currentMember.getMember();
      if (member && member._id) {
        // Insert new user into UserAccounts collection
        const newUserAccount = {
          memberId: member._id,
          userId: '', // Use email prefix as userId Leave Blank for admin to fill in later
          loginEmail: email, // Store login email
          firstName: firstName,
          lastName: lastName,
          status: 'Active', // Default status
          teamAdmin: '', // Leave blank. When member completes registration the Get Team  popup should be shown after sign up and or login when the userAccount does not have a team admin selected or is not an adminAccount(true). 
          adminAccount: false, // New users are not admin accounts by default
          createdDate: new Date(),
          _updatedDate: new Date()
        };
        
        await wixData.insert("UserAccounts", newUserAccount, { suppressAuth: true, suppressHooks: true });
        console.log("User account created in UserAccounts collection");
      }
      
      signUp_ResultsStatus_Text.text = "Sign up successful! Redirecting...";
      
      // Redirect to home with freshLogin parameter to trigger Get Team check
      setTimeout(() => {
        wixLocationFrontend.to('/home?freshLogin=true');
      }, 1500);
    } catch (error) {
      console.error(error);
      signUp_ResultsStatus_Text.text = "Sign up failed. Please try again.";
      signUp_Submit_Button.enable();
    }
  });

  signUp_Login_Button.onClick(() => {
    let options = {
      mode: "login",
      modal: true,
    };
    authentication.promptLogin(options);
  });

});

