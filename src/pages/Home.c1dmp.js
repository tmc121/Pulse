import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members-frontend';
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import {
    changePrimary_MultistateBoxState,
    changeReports_MultistateBoxState,
    validateMemberAccount,
    initAfterLogin,
    checkAndPromptTeamAssignment,
    initSelectedReferenceView,
    handleNavigation,
    setDatasetQueryOptionsSuppressed,
    getUserAccount,
    navigateToAccount,
    navigateToTeam,
    navigateToNoAccess,
    navigateToManage,
    setMainMenu,
    createNewReference,
    setReportsMenuDropdown,
    onSearchInput,
    searchQuery,
    setSearchFilters,
    setCreateReferenceFilters,
    setCreateByUserFromAccount,
    manageTeam,
    myTeam,
    myAccount,
    noAccess,
    setDashboardData,
    setMyAccountOptionsRepeater,
    configureCreateNewAccount,
    configureManageTeam,
    setSelectedReferenceDetails,
    setSelectedReferenceFilterDropdowns,
    applySelectedReferenceFilters,
    validateCreateReferencedReferenceNumber,
    all_Report,
    InNotReceived_Report,
    NotDelivered_Report,
    isAdminAccount
} from '/public/appFunctions.js';
// This code will be implemented to handle functions Home.c1dmp.js code will be updated to import functions from appFunctions.js
import { changePrimary_MultistateBoxState, changeReports_MultistateBoxState } from 'public/appFunctions.js';
import { InNotReceived_Report, NotDelivered_Report, all_Report } from 'public/appReportFunctions.js';

// MULTISTATE BOXES

//MAIN
const primaryMultiState = $w('#multiStateBox1');
// STATE PAGE ID's
const primary_Dashboard = 'dashboard';
const primary_SearchState = 'searchMain1';
const primary_PullState = 'pullMain1'; // batch
const primary_ReportsState = 'reportsMain1';
const primary_CreateReferenceState = 'createReferenceMain1';
const primary_ManageTeamState = 'manageTeamMain1';
const primary_ReferencedPathState = 'referencePathMain1';
const primary_ManageTeamNewAccountState = 'manageTeamNewAccountMain1'; // Create new account state
const primary_TeamState = 'teamMain1';
const primary_MyAccountState = 'myAccountMain1';
const primary_NoAccessState = 'noAccessStateMain1';
const primary_LoadingState = 'loadingMain1';

//REPORTS 
const reportsMultiState = $w('#reportsMultiStateBox');
const reportsMultiStateTitle = $w('#reports-MultiState-Selected-Title');
const reportsLoadingProgressBar = $w('#report-Loading-ProgressBar');
const reports_ResultsDataset = $w('#resultsDataset');
// STATE PAGE ID's
const report_DashState = 'reportsDash'; // Main page when the 'primary_reportsState' is called. 
const report_DataState = 'reportsData'; // This reports page will show data depending on a pre-configured query for dataset. 
const report_LoadingState = 'reportsLoading';
const report_InMenuDropdown = $w('#reports-InMenu-Dropdown');
// Prevent duplicate dropdown handler bindings
let reportsMenuHandlerBound = false;

// SEARCH DATA
const search_Dataset = $w('#searchDataset');
const searchInput = $w('#searchData-Search-Input');
const searchTypeInput = $w('#searchData-TypeDropdown-Input');
const searchStatusInput = $w('#searchData-StatusDropdown-Input');
const searchByUserInput = $w('#searchData-ByUserDropdown-Input');
const searchSubmitButton = $w('#searchData-Submit-SearchButton');
const searchResults_Table = $w('#table2');

// SELECTED REFERENCE DATA STATE CONSTANTS 
// THIS CODE IS USED WHEN AN ITEM FROM A TABLE IS SELECTED THE ITEMS FIELD referenceNumber will be queried to retrieve the path of the referencedNumber added to the collection.
// State Name is : primary_ReferencedPathState

const selectedReferenced_Dataset = $w('#selectedReferencedData-Dataset');
const selectedReference_Table = $w('#selectedReference-Table');
const selectedReferenced_ReferenceNumber_Display = $w('#referencePath-Selected-ReferenceNumber-Display');
const selectedReferenced_Filter_Type_Dropdown = $w('#referencePath-Filter-ReferencedType-Dropdown');
const selectedReferenced_Filter_Status_Dropdown = $w('#referencePath-Filter-ReferencedStatus-Dropdown');
const selectedReferenced_Filter_ByUser_Dropdown = $w('#referencePath-Filter-ReferencedByUser-Dropdown');



// CREATE REFERENCE
const createReference_Dataset = $w('#createDataset');
const createReference_RefNumber_Input = $w('#create-ReferenceNumber-Input');
const createReference_Type_Input = $w('#create-TypeDropdown-Input');
const createReference_Status_Input = $w('#create-StatusDropdown-Input');
const createReference_ByUser_Input = $w('#create-ByUserDropdown-Input');
const createReference_SubmitButton = $w('#create-SubmitButton');


//DASHBOARD PAGE CONSTANTS

const totalInbound_Display = $w('#dashboard-InboundSection-Total-InboundReceivedDisplay');
const dashboard_Inbound_ViewButton = $w('#dashboard-Inbound-ViewButton');
const totalTeamMembers_Display = $w('#dashboard-TeamSection-Total-TeamMembers-Display');
const dashboard_Team_ViewButton = $w('#dashboard-Team-ViewButton');
const manageSection_Repeater = $w('#dashboard-ManageSection-Repeater');
const manageSection_Repeater_Item = $w('#dashboard-ManageSection-Repeater-ItemBox');
const manageSection_Repeater_Item_Button = $w('#dashboard-ManageSection-Repeater-ItemButton');
const accountSection_Repeater = $w('#dashboard-AccountSection-Repeater');
const accountSection_Repeater_Item = $w('#dashboard-AccountSection-Repeater-ItemBox');
const accountSection_Repeater_Item_Button = $w('#dashboard-AccountSection-Repeater-ItemButton');
const settingsSection_Repeater = $w('#dashboard-SettingsSection-Repeater');
const settingsSection_Repeater_Item = $w('#dashboard-SettingsSection-Repeater-ItemBox');
const settingsSection_Repeater_Item_Button = $w('#dashboard-SettingsSection-Repeater-ItemButton');

// MANAGE TEAM ELEMENTS (THIS PAGE CAN ONLY BE VIEWED BY AN ADMIN ACCOUNT USER)

const manageTeam_Close_Button = $w('#manageTeam-Close-Button');
const manageTeam_EditAccounts_Button = $w('#manageTeam-EditAccounts-Button');
const manageTeam_NewAccount_Button = $w('#manageTeam-NewAccount-Button');
const manageTeam_AccountsRepeater = $w('#manageTeam-AccountsRepeater');
const manageTeam_AccountDisplay_Item_Button = $w('#managerTeam-DisplayAccount-Item-Button');
const manageTeam_Account_Item_CheckBox = $w('#item-Team-CheckBox');
const manageTeam_SelectedItem_Display_Wrapper = $w('#manageTeam-SelectedItem-Display-Wrapper');
const manageTeam_SelectedItem_UserID_Text = $w('#manageTeam-SelectedItem-UserID');
const manageTeam_SelectedItem_FullName_Text = $w('#manageTeam-SelectedItem-FullName');
const manageTeam_SelectedItem_Email_Text = $w('#manageTeam-SelectedItem-Email');
const manageTeam_SelectedItem_Status_Button = $w('#manageTeam-SelectedItem-Status-Button');
const manageTeam_SelectedItem_Disable_Button = $w('#manageTeam-SelectedItem-DisableAccount-Button');
const manageTeam_SelectedItem_Discard_Button = $w('#manageTeam-SelectedItem-Discard-Button');
const manageTeam_SelectedItem_Save_Button = $w('#manageTeam-SelectedItem-Save-Button');

// MY TEAM ELEMENTS (THIS PAGE CAN ONLY BE VIEWED BY AN LOGGED IN ACCOUNT USER)

const myTeam_Close_Button = $w('#myTeam-Exit-Button');
const myTeam_Team_Repeater = $w('#myTeam-Team-Repeater');
const myTeam_TeamItem_Box = $w('#myTeam-TeamItem-box');
const myTeam_TeamItem_CheckBox = $w('#myTeam-TeamItem-CheckBox');
const myTeam_SelectedTeam_Title = $w('#myTeam-SelectedTeam-Title');
const myTeam_SelectedTeam_UserID = $w('#myTeam-SelectedTeam-UserId');
const myTeam_SelectedTeam_FullName = $w('#myTeam-SelectedTeam-FullName');
const myTeam_SelectedTeam_Email = $w('#myTeam-SelectedTeam-Email');
const myTeam_TeamItem_Status_Button = $w('#myTeam-SelectedTeam-Status-Button');

// CREATE NEW ACCOUNT CONSTANTS

const createNewAccount_Exit_Button = $w('#createNewAccount-Close-Button');
const createNewAccount_Reset_Button = $w('#createNewAccount-Reset-Button');
const createNewAccount_FirstName_Input = $w('#createNewAccount-FirstName-Input');
const createNewAccount_LastName_Input = $w('#createNewAccount-LastName-Input');
const createNewAccount_UserId_Input = $w('#createNewAccount-UserId-Input');
const createNewAccount_Status_DisplayText = $w('#createNewAccount-UserID-Status-DisplayText');
const createNewAccount_MemberAccountLink_Dropdown_Input = $w('#createNewAccount-MemberAccount-Dropdown-Input');
const createNewAccount_Discard_Button = $w('#createNewAccount-Discard-Button');
const createNewAccount_SaveUpdate_Button = $w('#createNewAccount-SaveUpdate-Button');



// My Account Page Constants

const myAccount_Exit_Button = $w('#myAccount-Exit-Button');
const myAccount_Options_Repeater = $w('#myAccount-Options-Repeater');
const myAccount_Options_Repeater_Item = $w('#myAccount-Options-Repeater-Item'); // Already Set
const myAccount_Options_Repeater_Item_Button = $w('#myAccount-Options-Repeater-Item-Button'); // Already Set
const myAccount_UserId_DisplayText = $w('#myAccount-UserID-DisplayText');
const myAccount_FullName_DisplayText = $w('#myAccount-FullName-DisplayText');
const myAccount_Email_DisplayText = $w('#myAccount-Email-DisplayText');
const myAccount_StatusDisplay_Button = $w('#myAccount-Status-Display-Button');
const myAccount_UpdatePassword_Button = $w('#myAccount-UpdatePassword-Button');

// No Access Page Constants

const noAccess_MainTitle_DisplayText = $w('#noAccess-MainTitle-DisplayText');
const noAccess_Title_DisplayText = $w('#noAccess-Title-DisplayText');
const noAccess_Subtitle_DisplayText = $w('#noAccess-Subtitle-DisplayText');
const noAccess_AdditionalDetails_DisplayText = $w('#noAccess-AdditionalDetails-DisplayText');


// MAIN MENU BUTTONS

const mainMenu_Batch_Button = $w('#mainMenu-Button-Batch');
const mainMenu_Dashboard_Button = $w('#mainMenu-Button-Dashboard');
const mainMenu_Search_Button = $w('#mainMenu-Button-Search');

const mainMenu_InNotReceived_Button = $w('#mainMenu-Button-InNotReceived');
const mainMenu_NotDelivered_Button = $w('#mainMenu-Button-NotDelivered');
const mainMenu_ReportAll_Button = $w('#mainMenu-Button-ReportAll');

const mainMenu_CreateReference_Button = $w('#mainMenu-Button-CreateReference');

// Store current user account data
let currentUserAccount = null;
let isInitialized = false; // Track if page has been initialized
let selectedReferenceHandlersBound = false; // Prevent duplicate bindings for reference table
let selectedReferenceNumber = ''; // Tracks currently selected referenceNumber for filtering

function isAdminAccount(account) {
    return !!(account && account.adminAccount === true);
}

// Validate that logged-in member has a valid UserAccount
async function validateMemberAccount(memberId) {
    if (!memberId) {
        return { isValid: false, account: null, error: 'No member ID provided' };
    }

    try {
        const account = await getUserAccount(memberId);
        if (!account) {
            return {
                isValid: false,
                account: null,
                error: 'No active UserAccount found for this member'
            };
        }

        if (account.status !== 'ACTIVE') {
            return {
                isValid: false,
                account: account,
                error: `Account status is ${account.status}, expected ACTIVE`
            };
        }

        return { isValid: true, account: account, error: null };
    } catch (error) {
        console.error('Error validating member account:', error);
        return {
            isValid: false,
            account: null,
            error: `Validation error: ${error.message}`
        };
    }
}

$w.onReady(async function () {
    try {
        // Set auth listeners first so we respond to login events even if initially logged out
        authentication.onLogin(async () => {
            try {
                console.log('Authentication event: Member logged in');
                // Reset initialization flag on new login
                isInitialized = false;
                await initAfterLogin();
            } catch (error) {
                console.error('Error during post-login initialization:', error);
                await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
                await noAccess(
                    'Error',
                    'An error occurred during login',
                    'Please try logging in again or contact support.'
                );
            }
        });

        authentication.onLogout(async () => {
            try {
                console.log('Authentication event: Member logged out');
                currentUserAccount = null;
                isInitialized = false;
                await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
                await noAccess(
                    'Logged Out',
                    'Please log in to access this page',
                    'You have been logged out. Use the login button in the header to sign in again.'
                );
            } catch (error) {
                console.error('Error during logout handling:', error);
            }
        });

        // Listen for URL changes (e.g., from quick menu navigation)
        wixLocationFrontend.onChange(async () => {
            console.log('URL changed, handling navigation');
            const isLoggedIn = authentication.loggedIn();
            if (isLoggedIn) {
                await handleNavigation();
            } else {
                console.warn('URL change detected but user not logged in');
                await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
                await noAccess(
                    'Login Required',
                    'Please log in to continue',
                    'You must be logged in to use this feature.'
                );
            }
        });

        // Check initial login state
        const isLoggedIn = authentication.loggedIn();
        console.log('Page ready - Initial login state:', isLoggedIn);

        if (isLoggedIn) {
            // Check if member has a valid account before initializing
            const member = await currentMember.getMember();
            if (member && member._id) {
                const validation = await validateMemberAccount(member._id);
                if (!validation.isValid) {
                    console.warn(`Member account validation failed: ${validation.error}`);
                    await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
                    await noAccess(
                        'Account Setup Required',
                        'User account validation failed',
                        validation.error || 'Your member account needs to be properly configured. Please contact support.'
                    );
                    return;
                }
            }
            await initAfterLogin(primaryMultiState, primary_Dashboard, primary_NoAccessState, currentUserAccount, isInitialized, selectedReferenceHandlersBound, selectedReferenceNumber, search_Dataset, reports_ResultsDataset, createReference_Dataset, selectedReferenced_Dataset);
        } else {
            console.warn('User not logged in, showing no access page');
            await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
            await noAccess(
                'Login Required',
                'Please log in to continue',
                'You must be logged in to use the InComm application. Use the login button in the header to sign in.'
            );
        }
    } catch (error) {
        console.error('Fatal error in page initialization:', error);
        await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
        await noAccess(
            'Initialization Error',
            'An error occurred while loading the page',
            'Please refresh the page or contact support if the problem persists.'
        );
    }
});


// Initialize page after successful login
async function initAfterLogin() {
    // Prevent double initialization
    if (isInitialized) {
        console.log('Page already initialized, skipping re-initialization');
        return;
    }

    try {
        console.log('Initializing after login...');

        const member = await currentMember.getMember();
        if (!member || !member._id) {
            throw new Error('Unable to retrieve member information');
        }

        console.log('Current member ID:', member._id);

        // Validate member account with detailed error handling
        const validation = await validateMemberAccount(member._id);

        if (!validation.isValid) {
            console.warn(`Account validation failed for member ${member._id}: ${validation.error}`);
            isInitialized = false;
            await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
            await noAccess(
                'Account Validation Failed',
                'User account validation error',
                validation.error || 'Unable to validate your account. Please contact support.'
            );
            return; // Exit early if validation fails
        }

        currentUserAccount = validation.account;
        console.log('User account validated and loaded:', currentUserAccount._id);

        // Populate create reference ByUser dropdown with the current user's account ID
        setCreateByUserFromAccount();

        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard); // Start Up
        await setDashboardData(); // Initialize dashboard elements

        // Ensure dataset queries run with suppressed auth/hooks where needed
        setDatasetQueryOptionsSuppressed();

        await setMainMenu();

        // Prepare referenced-path UI (filters + table selection)
        await initSelectedReferenceView();

        // Check if user needs to be assigned to a team
        await checkAndPromptTeamAssignment();

        // Handle query parameters for navigation from master page
        await handleNavigation();

        // Mark as initialized
        isInitialized = true;
        console.log('Page initialization complete');
    } catch (error) {
        console.error('Error during post-login initialization:', error);
        isInitialized = false;
        await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
        await noAccess(
            'Initialization Error',
            'An error occurred while setting up your account',
            'Please try logging in again. If the problem persists, contact support.'
        );
    }
}

// Check if user is assigned to a team, and prompt Get Team page if not
async function checkAndPromptTeamAssignment() {
    try {
        // Check if this is a fresh login/registration
        const query = wixLocationFrontend.query;
        const isFreshLogin = query.freshLogin === 'true' || query.fromLogin === 'true';

        if (!isFreshLogin) {
            console.log('Not a fresh login, skipping team assignment check');
            return;
        }

        if (!currentUserAccount) {
            console.warn('No user account found, cannot check team assignment');
            return;
        }

        // Check if user is an admin account
        const isAdminAccount = currentUserAccount.adminAccount === true;

        // Check if user has a teamAdmin assigned (has a teamAdminId)
        const hasTeamAdmin = currentUserAccount.teamAdminId && currentUserAccount.teamAdminId.trim() !== '';

        // Prompt Get Team page if user is NOT an admin account AND does NOT have a teamAdmin
        if (!isAdminAccount && !hasTeamAdmin) {
            console.log('User is not an admin account and not assigned to a team admin, prompting Get Team page');
            // Open Get Team as a lightbox/modal
            await wixWindowFrontend.openLightbox('Get Team');
        } else {
            if (isAdminAccount) {
                console.log('User is an admin account, skipping team assignment prompt');
            } else {
                console.log('User is assigned to a team admin:', currentUserAccount.teamAdminId);
            }
        }
    } catch (error) {
        console.error('Error checking team assignment:', error);
    }
}

// Bind reference table selection and configure filters once
async function initSelectedReferenceView() {
    if (selectedReferenceHandlersBound) {
        return;
    }

    await setSelectedReferenceFilterDropdowns();

    if (selectedReference_Table && typeof selectedReference_Table.onRowSelect === 'function') {
        selectedReference_Table.onRowSelect(async (event) => {
            const rowData = event && event.rowData ? event.rowData : null;
            // Prefer passing the full row data to avoid extra fetches
            await setSelectedReferenceDetails(rowData || (event && event.rowData && event.rowData._id));
        });
    }

    if (searchResults_Table && typeof searchResults_Table.onRowSelect === 'function') {
        searchResults_Table.onRowSelect(async (event) => {
            const rowData = event && event.rowData ? event.rowData : null;
            const refNumber = rowData && rowData.referenceNumber ? rowData.referenceNumber : '';

            if (!refNumber) {
                console.warn('Row selected without referenceNumber; skipping reference path view.');
                return;
            }

            selectedReferenceNumber = refNumber;
            if (selectedReferenced_ReferenceNumber_Display) {
                selectedReferenced_ReferenceNumber_Display.text = refNumber;
            }

            await applySelectedReferenceFilters();
            await changePrimary_MultistateBoxState(primaryMultiState, primary_ReferencedPathState);
        });
    }

    selectedReferenceHandlersBound = true;
}

// Handle navigation based on query parameters
async function handleNavigation() {
    const query = wixLocationFrontend.query;
    console.log('Query parameters:', query);

    if (query.noAccess === 'true') {
        const title = query.title ? decodeURIComponent(query.title) : 'No Access';
        const subtitle = query.subtitle ? decodeURIComponent(query.subtitle) : 'Member Must Contact Admin Support to connect members account';
        const details = query.details ? decodeURIComponent(query.details) : '';

        await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
        await noAccess(title, subtitle, details);
        return;
    }

    if (query.view === 'account') {
        console.log('Navigating to account page');
        await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
        await myAccount();
    } else if (query.view === 'team') {
        console.log('Navigating to team page');
        await changePrimary_MultistateBoxState(primaryMultiState, primary_TeamState);
        await myTeam();
    } else if (query.view === 'manage') {
        console.log('Attempting to access manage team page');
        if (isAdminAccount(currentUserAccount)) {
            console.log('User has admin role, allowing access');
            await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamState);
            await manageTeam();
        } else {
            console.warn('User does not have admin role, denying access');
            await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
            await noAccess('Manage Team', 'Admin access required', 'You do not have permission to access team management.');
        }
    } else if (query.view) {
        // Unknown view parameter, go to dashboard
        console.log('Unknown view parameter, navigating to dashboard');
        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
        await setDashboardData();
    }
    // If no view parameter, stay on current page (don't force dashboard)
}
function setDatasetQueryOptionsSuppressed() {
    const options = { suppressAuth: true, suppressHooks: true };
    if (search_Dataset && typeof search_Dataset.setQueryOptions === 'function') {
        search_Dataset.setQueryOptions(options);
    }
    if (reports_ResultsDataset && typeof reports_ResultsDataset.setQueryOptions === 'function') {
        reports_ResultsDataset.setQueryOptions(options);
    }
    if (createReference_Dataset && typeof createReference_Dataset.setQueryOptions === 'function') {
        createReference_Dataset.setQueryOptions(options);
    }
    if (selectedReferenced_Dataset && typeof selectedReferenced_Dataset.setQueryOptions === 'function') {
        selectedReferenced_Dataset.setQueryOptions(options);
    }
}

// Fetch user account from storage first, then UserAccounts collection if needed
async function getUserAccount(memberId) {
    if (!memberId) {
        console.error('getUserAccount called without memberId');
        return null;
    }

    try {
        console.log('Fetching user account from database for member:', memberId);

        // Query by connectedMemberId (consistent with masterPage.js)
        let results = await wixData
            .query("UserAccounts")
            .eq("connectedMemberId", memberId)
            .eq("status", "ACTIVE")
            .find({ suppressAuth: true, suppressHooks: true });

        if (results.items && results.items.length > 0) {
            console.log("Active user account found for member:", memberId);
            return results.items[0];
        }

        // Fall back to memberId field (for compatibility)
        results = await wixData
            .query("UserAccounts")
            .eq("memberId", memberId)
            .eq("status", "ACTIVE")
            .find({ suppressAuth: true, suppressHooks: true });

        if (results.items && results.items.length > 0) {
            console.log("Active user account found for member (via memberId):", memberId);
            return results.items[0];
        }

        console.warn("No active user account found in UserAccounts collection for member ID:", memberId);
        return null;
    } catch (error) {
        console.error("Error fetching user account from UserAccounts collection:", error);
        return null;
    }
}

// Export navigation functions for use by masterPage.js
export async function navigateToAccount() {
    if (!isInitialized) {
        await initAfterLogin();
    }
    await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
    await myAccount();
}

export async function navigateToTeam() {
    if (!isInitialized) {
        await initAfterLogin();
    }
    await changePrimary_MultistateBoxState(primaryMultiState, primary_TeamState);
    await myTeam();
}

export async function navigateToNoAccess() {
    if (!isInitialized) {
        await initAfterLogin();
    }
    await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
    await noAccess('Authentication', 'Access Denied', 'Can not authenticate user account at this time.');
}

export async function navigateToManage() {
    if (!isInitialized) {
        await initAfterLogin();
    }

    if (isAdminAccount(currentUserAccount)) {
        console.log('User has admin role, allowing access to Manage Team');
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamState);
        await manageTeam();
    } else {
        console.warn('User does not have admin role, denying access to Manage Team');
        await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
        await noAccess('Manage Team', 'Admin access required', 'You do not have permission to access team management.');
    }
}

// THIS CHANGES THE STATE OF THE REPORTS MULTI STATE PAGES IN THIS PROGRAM
// THE REPORTS MULTISTATE SHOULD NOT BE CALLED UNLESS THE PRIMARY MULTISTATE HAS CHANGED TO 'primary_ReportsState';

async function setMainMenu() {

    mainMenu_Dashboard_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
    });

    mainMenu_Batch_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_PullState);
    });

    mainMenu_Search_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_SearchState);
        await setSearchFilters();
        await onSearchInput();
        // Optional: trigger an initial search with current inputs
        await searchQuery();
    });

    mainMenu_InNotReceived_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
        await InNotReceived_Report(reports_ResultsDataset);
        await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DataState);
        reportsMultiStateTitle.text = "Report:  Inbound Not Received";
    });

    mainMenu_NotDelivered_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
        await NotDelivered_Report(reports_ResultsDataset);
        await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DataState);
        reportsMultiStateTitle.text = "Report: Not Delivered";
    });

    mainMenu_ReportAll_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
        await all_Report(reports_ResultsDataset);
        await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DataState);
        reportsMultiStateTitle.text = "Report: All Reports";
    });

    mainMenu_CreateReference_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_CreateReferenceState);
        await createNewReference();
        await setCreateReferenceFilters();
        // Populate the ByUser dropdown with current user's account info
        setCreateByUserFromAccount();
    });

}

// Results Query All
// await resultsQueryAll(reports_ResultsDataset);

// Results Query InNotReceived
// await InNotReceivedReports(reports_ResultsDataset);

// Results Query NotDelivered
// await NotDeliveredReports(reports_ResultsDataset);


// Prevent multiple handler bindings for create reference
let createReferenceHandlerBound = false;

async function createNewReference() {
    // Only bind the handler once to prevent duplicate submissions
    if (!createReferenceHandlerBound) {
        // Auto-validate reference number to pre-fill type/status if it already exists
        if (createReference_RefNumber_Input && typeof createReference_RefNumber_Input.onInput === 'function') {
            createReference_RefNumber_Input.onInput(async () => {
                await validateCreateReferencedReferenceNumber();
            });
        }

        createReference_SubmitButton.onClick(async () => {
            // Guard against duplicate submissions
            createReference_SubmitButton.label = 'Submitting...';
            createReference_SubmitButton.disable();

            try {
                // Collect and validate input data
                const referenceNumber = (createReference_RefNumber_Input.value || '').trim();
                const type = createReference_Type_Input.value || '';
                const status = createReference_Status_Input.value || '';
                const byUser = createReference_ByUser_Input.value || '';

                // Validate required fields
                if (!referenceNumber || !type || !status) {
                    console.error('Validation failed - Missing required fields');
                    console.error('Reference Number:', referenceNumber ? 'provided' : 'MISSING');
                    console.error('Type:', type ? 'provided' : 'MISSING');
                    console.error('Status:', status ? 'provided' : 'MISSING');

                    createReference_SubmitButton.label = 'Missing Fields';
                    setTimeout(() => {
                        createReference_SubmitButton.label = 'Submit';
                    }, 2000);
                    return;
                }

                // Log data being submitted for transparency
                console.log('Creating new reference with data:', {
                    referenceNumber,
                    type,
                    status,
                    byUser,
                    createdBy: currentUserAccount ? currentUserAccount._id : 'Unknown',
                    createdAt: new Date().toISOString()
                });

                // Prepare data for insertion with complete audit trail
                const toInsert = {
                    referenceNumber,
                    type,
                    status,
                    userSignature: '',
                    byUser,
                    recipient: '',
                    createdBy: currentUserAccount ? currentUserAccount._id : '',
                    createdByName: currentUserAccount
                        ? `${currentUserAccount.firstName || ''} ${currentUserAccount.lastName || ''}`.trim()
                        : '',
                    createdAt: new Date(),
                };

                const options = {
                    suppressAuth: true,
                    suppressHooks: true,
                };

                // Insert data into database
                const item = await wixData.insert("DemoData", toInsert, options);

                // Log successful creation for audit trail
                console.log('Reference created successfully:', {
                    _id: item._id,
                    referenceNumber: item.referenceNumber,
                    createdAt: item._createdDate || item.createdAt
                });

                // Show success feedback
                createReference_SubmitButton.label = 'Success!';

                // Clear form inputs for next entry
                createReference_RefNumber_Input.value = '';
                createReference_Type_Input.value = '';
                createReference_Status_Input.value = '';
                // Keep byUser as it's auto-populated

                // Refresh dataset to show new entry
                await createReference_Dataset.refresh();

                // Reset button after delay
                setTimeout(() => {
                    createReference_SubmitButton.label = 'Submit';
                }, 2000);

            } catch (error) {
                console.error('Error creating reference:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details
                });

                // Show error feedback to user
                createReference_SubmitButton.label = 'Error - Try Again';
                setTimeout(() => {
                    createReference_SubmitButton.label = 'Submit';
                }, 3000);
            } finally {
                createReference_SubmitButton.enable();
            }
        });
        createReferenceHandlerBound = true;
    }
}

// SET REPORTS MENU DROPDOWN

async function setReportsMenuDropdown() {

    report_InMenuDropdown.placeholder = "-";
    report_InMenuDropdown.options = [
        { label: "Reports Dashboard", value: report_DashState },
        { label: "In Not Received", value: report_DataState },
    ];

    if (!reportsMenuHandlerBound) {
        report_InMenuDropdown.onChange(async (event) => {
            if (event.target.value === report_DashState) {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
                await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DashState);
                reportsMultiStateTitle.text = "Report: Dashboard";
            } else if (event.target.value === report_DataState) {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
                await all_Report(reports_ResultsDataset);
                await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DataState);
                reportsMultiStateTitle.text = "Report: All Reports";
            } else {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_ReportsState);
                await changeReports_MultistateBoxState(reportsMultiState, reportsLoadingProgressBar, report_DashState);
                reportsMultiStateTitle.text = "Report: Dashboard";
            }
        });
        reportsMenuHandlerBound = true;
    }

}

async function onSearchInput() {

    searchInput.onInput(async () => {
        await searchQuery();
    });
    searchTypeInput.onChange(async () => {
        await searchQuery();
    });
    searchStatusInput.onChange(async () => {
        await searchQuery();
    });
    searchByUserInput.onChange(async () => {
        await searchQuery();
    });

    // Provide a click trigger for searches as well
    if (searchSubmitButton && typeof searchSubmitButton.onClick === 'function') {
        searchSubmitButton.onClick(async () => {
            await searchQuery();
        });
    }

}

async function searchQuery() {
    try {
        let filter = wixData.filter();

        const refVal = (searchInput.value || '').trim();
        const typeVal = searchTypeInput.value || '';
        const statusVal = searchStatusInput.value || '';
        const byUserVal = searchByUserInput.value || '';

        if (refVal) {
            // Support partial matching of reference numbers
            filter = filter.contains('referenceNumber', refVal);
        }
        if (typeVal) {
            filter = filter.eq('type', typeVal);
        }
        if (statusVal) {
            filter = filter.eq('status', statusVal);
        }
        if (byUserVal) {
            filter = filter.eq('byUser', byUserVal);
        }

        // Apply filter to the dedicated search dataset
        await search_Dataset.setFilter(filter);
    } catch (error) {
        console.log(error);
    }
}

async function setSearchFilters() {

    searchInput.placeholder = "-";

    searchTypeInput.placeholder = "-";
    searchTypeInput.options = [
        { label: "-", value: "" },
        { label: "USPS-First Class", value: "USPS FIRST CLASS" },
        { label: "USPS-Express", value: "USPS EXPRESS" },
        { label: "USPS", value: "USPS" },
        { label: "FEDEX E", value: "FEDEX EXPRESS" },
        { label: "FEDEX G", value: "FEDEX GROUND" },
        { label: "DHL", value: "DHL" },
        { label: "AMAZON", value: "AMAZON" },
        { label: "UPS", value: "UPS" },
        { label: "STAPLES", value: "STAPLES" },
        { label: "OTHER", value: "UNKNOWN" },
    ];

    searchStatusInput.placeholder = "-";
    searchStatusInput.options = [
        { label: "-", value: "" },
        { label: "Inbound Received", value: "Inbound Received" },
        { label: "Inbound Department", value: "Inbound Department" },
        { label: "Inbound Service", value: "Inbound Service" },
        { label: "Inbound Associate", value: "Inbound Associate" },
        { label: "Outbound Received", value: "Outbound Received" },
        { label: "Outbound Carrier", value: "Outbound Carrier" },
        { label: "Delivery Attempt", value: "Delivery Attempt" },
        { label: "Delivered", value: "Delivered" },
        { label: "Research", value: "Set In Research" },
        { label: "Decisioning", value: "Decisioning" },
        { label: "Inventory", value: "Inventoried" },
    ];

    searchByUserInput.placeholder = "-";
    searchByUserInput.options = [
        { label: "Unavailable", value: "" },
    ];
}

async function setCreateReferenceFilters() {

    createReference_RefNumber_Input.placeholder = "-";

    createReference_Type_Input.placeholder = "-";
    createReference_Type_Input.options = [
        { label: "-", value: "" },
        { label: "USPS-First Class", value: "USPS FIRST CLASS" },
        { label: "USPS-Express", value: "USPS EXPRESS" },
        { label: "USPS", value: "USPS" },
        { label: "FEDEX E", value: "FEDEX EXPRESS" },
        { label: "FEDEX G", value: "FEDEX GROUND" },
        { label: "DHL", value: "DHL" },
        { label: "AMAZON", value: "AMAZON" },
        { label: "UPS", value: "UPS" },
        { label: "STAPLES", value: "STAPLES" },
        { label: "OTHER", value: "UNKNOWN" },
    ];

    createReference_Status_Input.placeholder = "-";
    createReference_Status_Input.options = [
        { label: "-", value: "" },
        { label: "Inbound Received", value: "Inbound Received" },
        { label: "Inbound Department", value: "Inbound Department" },
        { label: "Inbound Service", value: "Inbound Service" },
        { label: "Inbound Associate", value: "Inbound Associate" },
        { label: "Outbound Received", value: "Outbound Received" },
        { label: "Outbound Carrier", value: "Outbound Carrier" },
        { label: "Delivery Attempt", value: "Delivery Attempt" },
        { label: "Delivered", value: "Delivered" },
        { label: "Research", value: "Set In Research" },
        { label: "Decisioning", value: "Decisioning" },
        { label: "Inventory", value: "Inventoried" },
    ];

    createReference_ByUser_Input.placeholder = "-";
    setCreateByUserFromAccount();

}

// Populate the ByUser dropdown with the logged-in user's account ID
function setCreateByUserFromAccount() {
    if (!createReference_ByUser_Input || typeof createReference_ByUser_Input.options === 'undefined') {
        return;
    }

    if (currentUserAccount && currentUserAccount._id) {
        const userIdValue = currentUserAccount.userId || currentUserAccount._id;
        const userIdValueUpper = (userIdValue || '').toUpperCase();
        const label = `${currentUserAccount.firstName || ''} ${currentUserAccount.lastName || ''}`.trim() || userIdValueUpper;
        createReference_ByUser_Input.options = [
            { label, value: userIdValueUpper }
        ];
        createReference_ByUser_Input.value = userIdValueUpper;
    } else {
        createReference_ByUser_Input.options = [
            { label: "Unavailable", value: "" },
        ];
        createReference_ByUser_Input.value = "";
    }
}


async function manageTeam() {
    // Wire up close button
    manageTeam_Close_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
    });

    // Load and configure team management
    await configureManageTeam();
    console.log("Manage Team page loaded");
}

async function myTeam() {
    try {
        // Wire up close button
        myTeam_Close_Button.onClick(async () => {
            await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
        });

        // Fetch all user accounts for the team
        const teamResults = await wixData
            .query("UserAccounts")
            .find({ suppressAuth: true, suppressHooks: true });

        console.log(`My Team page loaded - ${teamResults.items.length} team members found`);

        // Prepare data for repeater with formatted display
        const teamData = teamResults.items.map(member => {
            const firstName = member.firstName || '';
            const lastName = member.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
            const userId = member.userId || member._id || 'N/A';

            return {
                _id: member._id,
                displayText: `${fullName} • ${userId}`,
                fullName: fullName,
                userId: userId,
                email: member.email || 'N/A',
                status: member.status || 'Active',
                role: member.role || 'User'
            };
        });

        // Set up repeater
        myTeam_Team_Repeater.onItemReady(($item, itemData, index) => {
            // Set button label with formatted text
            const button = $item('#myTeam-TeamItem-Button');
            if (button) {
                button.label = itemData.displayText;

                // Handle click to show member details
                button.onClick(() => {
                    console.log('Team member selected:', itemData.fullName);
                    myTeam_SelectedTeam_Title.text = itemData.fullName;
                    myTeam_SelectedTeam_UserID.text = itemData.userId;
                    myTeam_SelectedTeam_FullName.text = itemData.fullName;
                    myTeam_SelectedTeam_Email.text = itemData.email;
                    myTeam_TeamItem_Status_Button.label = itemData.status;
                });
            }
        });

        // Populate repeater with team data
        myTeam_Team_Repeater.data = teamData;

        console.log("My Team repeater populated with team members");
    } catch (error) {
        console.error("Error loading My Team page:", error);
    }
}

async function myAccount() {
    // Wire up exit button
    myAccount_Exit_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
    });

    // Get current user account data
    if (currentUserAccount) {
        myAccount_UserId_DisplayText.text = currentUserAccount._id || 'N/A';
        myAccount_FullName_DisplayText.text = `${currentUserAccount.firstName || ''} ${currentUserAccount.lastName || ''}`.trim() || 'N/A';
        myAccount_Email_DisplayText.text = currentUserAccount.email || 'N/A';
        myAccount_StatusDisplay_Button.label = currentUserAccount.status || 'Active';
    }

    // TODO: Implement password update functionality
    myAccount_UpdatePassword_Button.onClick(() => {
        console.log("Password update requested");
        // Consider using Wix's built-in password reset flow
    });

    console.log("My Account page loaded");
}

async function noAccess(title = 'Access Denied', subtitle = 'Insufficient Permissions', details = 'You do not have access to this resource.') {
    try {
        noAccess_MainTitle_DisplayText.text = 'Access Restricted';
        noAccess_Title_DisplayText.text = title;
        noAccess_Subtitle_DisplayText.text = subtitle;
        noAccess_AdditionalDetails_DisplayText.text = details;

        console.log("No Access page displayed with title:", title);
    } catch (error) {
        console.error('Error displaying no access page:', error);
    }
}


// SET DASHBOARD ELEMENTS DATA

async function setDashboardData() {
    try {
        // Total Inbound Received
        const inboundResults = await wixData
            .query("DemoData")
            .eq("status", "Inbound Received")
            .find({ suppressAuth: true, suppressHooks: true });
        totalInbound_Display.text = inboundResults.totalCount.toString();

        // Total Team Members
        const teamResults = await wixData
            .query("UserAccounts")
            .find({ suppressAuth: true, suppressHooks: true });
        totalTeamMembers_Display.text = teamResults.totalCount.toString();

        // Manage Section Repeater Setup
        manageSection_Repeater.onItemReady(($item, itemData) => {
            $item('#dashboard-ManageSection-Repeater-ItemButton').label = itemData.label;
            $item('#dashboard-ManageSection-Repeater-ItemButton').onClick(async () => {
                console.log(`Manage Section button clicked: ${itemData.label}`);
                await changePrimary_MultistateBoxState(primaryMultiState, primary_NoAccessState);
                await noAccess(itemData.label, 'Page not yet configured', 'Please contact an administrator for access.');
            });
        });
        manageSection_Repeater.data = [
            { label: "1. Manage Team" },
            { label: "2. Decisioning" },
            { label: "3. Day Reconcile" },
        ];

        // Account Section Repeater Setup
        accountSection_Repeater.onItemReady(($item, itemData, index) => {
            $item('#dashboard-AccountSection-Repeater-ItemButton').label = itemData.label;
            $item('#dashboard-AccountSection-Repeater-ItemButton').onClick(async () => {
                console.log(`Account Section button clicked: ${itemData.label}`);

                if (itemData.action === 'viewProfile') {
                    await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
                    await myAccount();
                } else if (itemData.action === 'changePassword') {
                    await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
                    await myAccount();
                    // TODO: Focus on password change section
                    console.log('Change password requested');
                } else if (itemData.action === 'notificationSettings') {
                    // TODO: Implement notification settings page
                    console.log('Notification Settings page not yet implemented');
                }
            });
        });
        accountSection_Repeater.data = [
            { label: "View Profile", action: "viewProfile" },
            { label: "Change Password", action: "changePassword" },
            { label: "Notification Settings", action: "notificationSettings" },
        ];

        console.log("Dashboard data set successfully");
    } catch (error) {
        console.error("Error setting dashboard data:", error);
    }
}

// Set myAccount Options Repeater (Used for navigation)
async function setMyAccountOptionsRepeater() {
    myAccount_Options_Repeater.onItemReady(($item, itemData, index) => {
        $item('#myAccount-Options-Repeater-Item-Button').label = itemData.label;
        $item('#myAccount-Options-Repeater-Item-Button').onClick(async () => {
            console.log(`My Account option clicked: ${itemData.label}`);
            if (itemData.action === 'viewProfile') {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
                await myAccount();
            } else if (itemData.action === 'changePassword') {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_MyAccountState);
                await myAccount();

                console.log('Change password requested');
            } else if (itemData.action === 'notificationSettings') {
                console.log('Notification Settings page not yet implemented');
            }
        });
    });
    myAccount_Options_Repeater.data = [
        { label: "View Profile", action: "viewProfile" },
        { label: "Change Password", action: "changePassword" },
        { label: "Notification Settings", action: "notificationSettings" },
    ];
}


// Configure Manage Teams 'manageTeam'

async function configureCreateNewAccount() {
    // Reset form fields
    createNewAccount_FirstName_Input.value = '';
    createNewAccount_LastName_Input.value = '';
    createNewAccount_UserId_Input.value = '';
    createNewAccount_Status_DisplayText.text = '';

    // Wire up close button
    createNewAccount_Exit_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamState);
    });

    // Wire up reset button
    createNewAccount_Reset_Button.onClick(() => {
        console.log("Reset form clicked");
        createNewAccount_FirstName_Input.value = '';
        createNewAccount_LastName_Input.value = '';
        createNewAccount_UserId_Input.value = '';
        createNewAccount_Status_DisplayText.text = '';
    });

    // Wire up discard button
    createNewAccount_Discard_Button.onClick(async () => {
        console.log("Discard clicked");
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamState);
    });

    // Validate userId on input change
    createNewAccount_UserId_Input.onInput(() => {
        const userId = (createNewAccount_UserId_Input.value || '').trim();
        if (!userId) {
            createNewAccount_Status_DisplayText.text = '';
            return;
        }
        createNewAccount_Status_DisplayText.text = 'User ID: ' + userId;
    });

    // Wire up save button
    createNewAccount_SaveUpdate_Button.onClick(async () => {
        const firstName = (createNewAccount_FirstName_Input.value || '').trim();
        const lastName = (createNewAccount_LastName_Input.value || '').trim();
        const userId = (createNewAccount_UserId_Input.value || '').trim().toUpperCase();

        // Validate inputs
        if (!firstName || !lastName || !userId) {
            createNewAccount_Status_DisplayText.text = 'Please fill in all fields.';
            return;
        }

        createNewAccount_SaveUpdate_Button.disable();
        createNewAccount_Status_DisplayText.text = 'Creating account...';

        try {
            // Check if userId already exists
            const existingResults = await wixData
                .query('UserAccounts')
                .eq('userId', userId)
                .find({ suppressAuth: true, suppressHooks: true });

            if (existingResults.items && existingResults.items.length > 0) {
                createNewAccount_Status_DisplayText.text = 'User ID already exists.';
                createNewAccount_SaveUpdate_Button.enable();
                return;
            }

            // Create new user account
            const newUserAccount = {
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                email: '', // Email can be added later
                status: 'Active',
                adminAccount: false,
                createdDate: new Date(),
                _updatedDate: new Date()
            };

            const result = await wixData.insert('UserAccounts', newUserAccount, { suppressAuth: true, suppressHooks: true });
            console.log('New user account created:', userId);

            createNewAccount_Status_DisplayText.text = 'Account created successfully!';

            // Refresh manage team page and return to it
            setTimeout(async () => {
                await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamState);
                await configureManageTeam();
            }, 1500);
        } catch (error) {
            console.error('Error creating user account:', error);
            createNewAccount_Status_DisplayText.text = 'Failed to create account. Please try again.';
            createNewAccount_SaveUpdate_Button.enable();
        }
    });

    console.log('Create New Account page configured');
}

async function configureManageTeam() {
    manageTeam_Close_Button.onClick(async () => {
        await changePrimary_MultistateBoxState(primaryMultiState, primary_Dashboard);
    });
    manageTeam_EditAccounts_Button.onClick(() => {
        console.log("Edit Accounts clicked");
        if (manageTeam_Account_Item_CheckBox.collapsed) {
            manageTeam_Account_Item_CheckBox.expand();
        } else {
            manageTeam_Account_Item_CheckBox.collapse();
            manageTeam_Account_Item_CheckBox.checked = false;
        }
    });
    manageTeam_NewAccount_Button.onClick(async () => {
        console.log("New Account clicked");
        await changePrimary_MultistateBoxState(primaryMultiState, primary_ManageTeamNewAccountState);
        configureCreateNewAccount();
    });

    manageTeam_SelectedItem_Save_Button.onClick(async () => {
        console.log("Save Account changes clicked");
    });

    manageTeam_SelectedItem_Discard_Button.onClick(async () => {
        console.log("Discard Account changes clicked");
        manageTeam_SelectedItem_Display_Wrapper.collapse();
    });

    manageTeam_SelectedItem_Disable_Button.onClick(async () => {
        console.log("Disable Account clicked for UserID:", manageTeam_SelectedItem_UserID_Text.text);
    });

    // Fetch all user accounts for the team
    const teamResults = await wixData
        .query("UserAccounts")
        .find({ suppressAuth: true, suppressHooks: true });

    console.log(`Manage Team loaded - ${teamResults.items.length} team members found`);

    // Prepare data for repeater with formatted display
    const teamData = teamResults.items.map(member => {
        const firstName = member.firstName || '';
        const lastName = member.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
        const userId = member.userId || member._id || 'N/A';

        return {
            _id: member._id,
            displayText: `${fullName} • ${userId}`,
            fullName: fullName,
            userId: userId,
            email: member.email || 'N/A',
            status: member.status || 'Active',
            role: member.role || 'User'
        };
    });

    // Populate repeater with team data
    manageTeam_AccountsRepeater.data = teamData;

    // Set up repeater item ready function
    manageTeam_AccountsRepeater.onItemReady(($item, itemData, index) => {
        $item('#managerTeam-DisplayAccount-Item-Button').label = itemData.displayText;
        $item('#managerTeam-DisplayAccount-Item-Button').onClick(() => {
            console.log('Team member selected:', itemData.fullName);
            manageTeam_SelectedItem_UserID_Text.text = itemData.userId;
            manageTeam_SelectedItem_FullName_Text.text = itemData.fullName;
            manageTeam_SelectedItem_Email_Text.text = itemData.email;
            manageTeam_SelectedItem_Status_Button.label = itemData.status;
            manageTeam_SelectedItem_Display_Wrapper.expand();
        });
        if ($item('#item-Team-CheckBox').checked === true) {
            manageTeam_EditAccounts_Button.label = 'Delete Selected';
            manageTeam_EditAccounts_Button.onClick(async () => {
                try {
                    await wixData.remove("UserAccounts", itemData._id, { suppressAuth: true, suppressHooks: true });
                    console.log('Deleted user account:', itemData.fullName);
                    // await manageTeam_AccountsRepeater.refresh();
                } catch (error) {
                    console.error('Error deleting user account:', error);
                }
            });
        }
        console.log('Checkbox selected for:', itemData.fullName);


    });
}

// SET SELECTED REFERENCE DATA FOR TABLE DETAILS VIEW
// On the search state, when a reference is selected from the table, populate the details view
// Accepts either a full reference object (preferred) or a reference _id string for backwards compatibility.
async function setSelectedReferenceDetails(referenceOrId) {
    try {
        if (!referenceOrId) {
            console.warn('setSelectedReferenceDetails called without data');
            return;
        }

        // Avoid an extra fetch when the row data is already available
        const isIdOnly = typeof referenceOrId === 'string';
        const reference = isIdOnly
            ? await wixData.get("DemoData", referenceOrId, { suppressAuth: true, suppressHooks: true })
            : referenceOrId;

        if (!reference) {
            console.warn('No reference found with ID:', referenceOrId);
            return;
        }

        const referenceNumber = reference.referenceNumber || 'N/A';
        selectedReferenceNumber = reference.referenceNumber || '';
        if (selectedReferenced_ReferenceNumber_Display) {
            selectedReferenced_ReferenceNumber_Display.text = referenceNumber;
        }

        if (selectedReferenceNumber) {
            await applySelectedReferenceFilters();
        } else {
            console.warn('Selected reference missing referenceNumber, cannot filter referenced dataset');
        }

        console.log('Selected reference details populated for ID:', reference._id || referenceOrId);
    } catch (error) {
        console.error('Error handling selected reference:', referenceOrId, error);
    }
}

// set up selected reference Filter Dropdowns
async function setSelectedReferenceFilterDropdowns() {
    if (!selectedReferenced_Filter_Type_Dropdown || !selectedReferenced_Filter_Status_Dropdown || !selectedReferenced_Filter_ByUser_Dropdown) {
        console.warn('Selected reference filter dropdowns not present on this page; skipping setup');
        return;
    }

    selectedReferenced_Filter_Type_Dropdown.placeholder = "-";
    selectedReferenced_Filter_Type_Dropdown.options = [
        { label: "-", value: "" },
        { label: "USPS-First Class", value: "USPS FIRST CLASS" },
        { label: "USPS-Express", value: "USPS EXPRESS" },
        { label: "USPS", value: "USPS" },
        { label: "FEDEX E", value: "FEDEX EXPRESS" },
        { label: "FEDEX G", value: "FEDEX GROUND" },
        { label: "DHL", value: "DHL" },
        { label: "AMAZON", value: "AMAZON" },
        { label: "UPS", value: "UPS" },
        { label: "STAPLES", value: "STAPLES" },
        { label: "OTHER", value: "UNKNOWN" },
    ];

    selectedReferenced_Filter_Status_Dropdown.placeholder = "-";
    selectedReferenced_Filter_Status_Dropdown.options = [
        { label: "-", value: "" },
        { label: "Inbound Received", value: "Inbound Received" },
        { label: "Inbound Department", value: "Inbound Department" },
        { label: "Inbound Service", value: "Inbound Service" },
        { label: "Inbound Associate", value: "Inbound Associate" },
        { label: "Outbound Received", value: "Outbound Received" },
        { label: "Outbound Carrier", value: "Outbound Carrier" },
        { label: "Delivery Attempt", value: "Delivery Attempt" },
        { label: "Delivered", value: "Delivered" },
        { label: "Research", value: "Set In Research" },
        { label: "Decisioning", value: "Decisioning" },
        { label: "Inventory", value: "Inventoried" },
    ];

    // THIS WILL DISPLAY THE TEAM MEMBERS NAME AS THE LABEL AND UserID AS THE VALUE
    selectedReferenced_Filter_ByUser_Dropdown.placeholder = "-";
    selectedReferenced_Filter_ByUser_Dropdown.options = [
        { label: "Unavailable", value: "" },
    ];


    // Set up onChange handlers to filter the dataset
    selectedReferenced_Filter_Type_Dropdown.onChange(async () => {
        await applySelectedReferenceFilters();
    });

    selectedReferenced_Filter_Status_Dropdown.onChange(async () => {
        await applySelectedReferenceFilters();
    });

    selectedReferenced_Filter_ByUser_Dropdown.onChange(async () => {
        await applySelectedReferenceFilters();
    });
}


// Apply filters to the selected referenced dataset based on dropdown selections
async function applySelectedReferenceFilters() {
    try {
        if (!selectedReferenced_Dataset || typeof selectedReferenced_Dataset.setFilter !== 'function') {
            console.warn('selectedReferenced_Dataset unavailable; skipping filter application');
            return;
        }

        let filter = wixData.filter();

        if (selectedReferenceNumber) {
            filter = filter.eq('referenceNumber', selectedReferenceNumber);
        }

        const typeVal = selectedReferenced_Filter_Type_Dropdown.value || '';
        const statusVal = selectedReferenced_Filter_Status_Dropdown.value || '';
        const byUserVal = selectedReferenced_Filter_ByUser_Dropdown.value || '';

        if (typeVal) {
            filter = filter.eq('type', typeVal);
        }
        if (statusVal) {
            filter = filter.eq('status', statusVal);
        }
        if (byUserVal) {
            filter = filter.eq('byUser', byUserVal);
        }

        // Apply filter to the selected referenced dataset
        await selectedReferenced_Dataset.setFilter(filter);
    } catch (error) {
        console.log('Error applying selected reference filters:', error);
    }
}


// Validation for createReferenced
// If referenceNumber exists, populate the type and status in the createReferenced dropdowns
async function validateCreateReferencedReferenceNumber() {
    const refNumber = (createReference_RefNumber_Input.value || '').trim();
    if (!refNumber) {
        console.log('No reference number entered for validation');
        return;
    }

    try {
        const results = await wixData
            .query('DemoData')
            .eq('referenceNumber', refNumber)
            .find({ suppressAuth: true, suppressHooks: true });

        if (results.items && results.items.length > 0) {
            const reference = results.items[0];
            createReference_Type_Input.value = reference.type || '';
            createReference_Status_Input.value = reference.status || '';
            console.log('Reference number validated and fields populated:', refNumber);
        } else {
            console.log('Reference number not found during validation:', refNumber);
        }
    } catch (error) {
        console.error('Error validating reference number:', error);
    }
}   