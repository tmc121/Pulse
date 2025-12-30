// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocationFrontend from 'wix-location-frontend';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId } from 'public/UserAccounts-Auth';

const getTeam_Disclaimer_DisplayText = $w('#getTeam-Disclaimer-DisplayText');
const getTeam_AdminUserId_Input = $w('#getTeam-AdminUserId-Input');
const getTeam_Status_Display = $w('#getTeam-Status-Display');
const getTeam_ConnectMyTeam_Button = $w('#getTeam-ConnectMyTeam-Button');
const getTeam_Exit_Button = $w('#getTeam-Exit-Button');


// The Get Team page connects the current member's UserAccount to a Team Admin account.
// Admin validation rules:
// - adminUserId must be 3 letters + 3 numbers (e.g., ABC123)
// - Finds an ACTIVE UserAccounts record whose userId matches (case-insensitive)
// - That admin account must have a non-empty adminAccount array and include this member's UserAccount id

$w.onReady(async function () {
    getTeam_Disclaimer_DisplayText.text = "By connecting your team account, you agree to our Terms of Service and Privacy Policy.";
    getTeam_ConnectMyTeam_Button.disable();
    getTeam_Status_Display.text = "Enter your Admin User ID to connect.";

    // Load the current member's UserAccount once
    const member = await currentMember.getMember();
    const memberId = member?._id;
    const UserAccount = await getUserAccountByMemberId(memberId);
    if (!UserAccount) {
        getTeam_Status_Display.text = "We could not load your account. Please re-login.";
        return;
    }

    // Live validation on input change
    getTeam_AdminUserId_Input.onInput(async () => {
        const adminUserId = (getTeam_AdminUserId_Input.value || '').trim();
        if (!isValidUserIdFormat(adminUserId)) {
            getTeam_Status_Display.text = "User ID must be 3 letters followed by 3 numbers (e.g., ABC123).";
            getTeam_ConnectMyTeam_Button.disable();
            return;
        }

        getTeam_Status_Display.text = "Validating admin access...";
        const { isValid, adminAccount } = await validateAdminUserId(adminUserId);
        if (isValid) {
            const name = `${adminAccount.firstName || ''} ${adminAccount.lastName || ''}`.trim();
            getTeam_Status_Display.text = `Admin verified: ${name || 'Admin'} • ${adminAccount.userId}`;
            getTeam_ConnectMyTeam_Button.enable();
        } else {
            getTeam_Status_Display.text = "Admin User ID is not authorized for your account.";
            getTeam_ConnectMyTeam_Button.disable();
        }
    });

    // Single click handler (re-validates and links)
    getTeam_ConnectMyTeam_Button.onClick(async () => {
        const adminUserId = (getTeam_AdminUserId_Input.value || '').trim();
        if (!isValidUserIdFormat(adminUserId)) {
            getTeam_Status_Display.text = "Please enter a valid Admin User ID.";
            getTeam_ConnectMyTeam_Button.disable();
            return;
        }

        getTeam_ConnectMyTeam_Button.disable();
        getTeam_Status_Display.text = "Connecting your team...";

        const { isValid, adminAccount } = await validateAdminUserId(adminUserId);
        if (!isValid || !adminAccount?._id) {
            getTeam_Status_Display.text = "Admin User ID is not authorized for your account.";
            return;
        }

        try {
            // Update the current member's account to link this admin
            const existingAdmins = Array.isArray(UserAccount.teamAdmin)
                ? UserAccount.teamAdmin.filter(Boolean)
                : UserAccount.teamAdmin ? [UserAccount.teamAdmin] : [];

            if (!existingAdmins.includes(adminAccount._id)) {
                UserAccount.teamAdmin = [...existingAdmins, adminAccount._id];
                UserAccount._updatedDate = new Date();
                await wixData.update('UserAccounts', UserAccount, { suppressAuth: true, suppressHooks: true });
            }

            getTeam_Status_Display.text = "Team account connected successfully!";
            setTimeout(() => wixLocationFrontend.to('/home'), 1500);
        } catch (error) {
            console.error('Error connecting team account:', error);
            getTeam_Status_Display.text = "An error occurred while connecting your team account. Please try again later.";
        } finally {
            getTeam_ConnectMyTeam_Button.enable();
        }
    });

    // Exit button
    getTeam_Exit_Button.onClick(async () => {
        wixLocationFrontend.to('/home');
    });
});

function isValidUserIdFormat(value) {
    return /^[A-Za-z]{3}\d{3}$/.test((value || '').trim());
}

async function loadMemberAccount(memberId) {
    if (!memberId) return null;
    try {
        const results = await wixData.query('UserAccounts')
            .eq('connectedMemberId', memberId)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });
        return results.items?.[0] || null;
    } catch (error) {
        console.error('Error loading member account:', error);
        return null;
    }
}

async function validateAdminUserId(adminUserIdRaw, memberAccountId) {
    const adminUserId = (adminUserIdRaw || '').trim().toUpperCase();
    if (!adminUserId) {
        return { isValid: false, adminAccount: null };
    }

    try {
        const results = await wixData
            .query('UserAccounts')
            .eq('userId', adminUserId)
            .eq('status', 'Active')
            .eq('adminAccount', true)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        const adminAccount = results.items?.[0] || null;
        const isAdmin = !!adminAccount;
        return { isValid: isAdmin, adminAccount: isAdmin ? adminAccount : null };
    } catch (error) {
        console.error('Error validating admin userId:', error);
        return { isValid: false, adminAccount: null };
    }
}


    


