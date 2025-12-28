// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import { authentication } from "wix-members-frontend";
import wixLocation from 'wix-location-frontend';

const login_UserId_Input = $w('#login-UserId-Input');
const login_Password_Input = $w('#login-Password-Input');
const login_ResultsStatus_Text = $w('#login-StatusText');
const login_Button = $w('#login-Button');
const login_SignUp_Button = $w('#login-SignUp-Button');

$w.onReady(function () {

  login_Button.onClick(async () => {
    const email = login_UserId_Input.value;
    const password = login_Password_Input.value;

    // Validate inputs
    if (!email || !password) {
      login_ResultsStatus_Text.text = "Please enter both email and password.";
      return;
    }

    // Disable button to prevent double-submit
    login_Button.disable();
    login_ResultsStatus_Text.text = "Logging in...";

    try {
      await authentication.login(email, password);
      console.log("Member is logged in");
      login_ResultsStatus_Text.text = "Login successful!";
      
      // Redirect to home with parameter to trigger team assignment check
      setTimeout(() => {
        wixLocation.to('/home?freshLogin=true');
      }, 1500);
      console.log("Redirecting to home page");
    } catch (error) {
      console.error(error);
      login_ResultsStatus_Text.text = "Login failed. Please check your credentials.";
      login_Button.enable();
    }
  });

  login_SignUp_Button.onClick(() => {
    let options = {
      mode: "signUp",
      modal: true,
    };
    authentication.promptLogin(options);
  }); 
});

