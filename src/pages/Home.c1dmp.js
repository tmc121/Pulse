import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members-frontend';
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';

// Safe selector to avoid hard failures when an element id is missing on the page
const $safe = (id) => {
    try {
        return $w(id);
    } catch (_e) {
        console.warn(`Element missing: ${id}`);
        return null;
    }
};

//IMPORTS
import { primaryNavigate } from 'public/appNavigation.js';
import { initializeSearch, initializeSearchSelected, setupCreateOrEditReference } from 'public/InitializeData.js';
import { reportsInNotReceived, reportsNotDelivered, reportsAllInbound ,getInboundReceivedOnlyCount} from 'public/appReports.js';
import { loadUserAccountPageData } from 'public/appMyAccount.js';
import { showNoAccessState } from 'public/appAuthentication';

// MULTISTATE BOXES

//MAIN
const primaryMultiState = $safe('#multiStateBox1');
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
const reportsMultiState = $safe('#reportsMultiStateBox');
const reportsMultiStateTitle = $safe('#reports-MultiState-Selected-Title');
const reportsLoadingProgressBar = $safe('#report-Loading-ProgressBar');
const reports_ResultsDataset = $safe('#resultsDataset');
// STATE PAGE ID's
const report_DashState = 'reportsDash'; // Main page when the 'primary_reportsState' is called. 
const report_DataState = 'reportsData'; // This reports page will show data depending on a pre-configured query for dataset. 
const report_LoadingState = 'reportsLoading';
const report_InMenuDropdown = $safe('#reports-InMenu-Dropdown');
// Prevent duplicate dropdown handler bindings
let reportsMenuHandlerBound = false;

// SEARCH DATA
const search_Dataset = $safe('#searchDataset');
const searchInput = $safe('#searchData-Search-Input');
const searchTypeInput = $safe('#searchData-TypeDropdown-Input');
const searchStatusInput = $safe('#searchData-StatusDropdown-Input');
const searchByUserInput = $safe('#searchData-ByUserDropdown-Input');
const searchSubmitButton = $safe('#searchData-Submit-SearchButton');
const searchResults_Table = $safe('#table2');
let searchInputDebounce;

// SELECTED REFERENCE DATA STATE CONSTANTS 
// THIS CODE IS USED WHEN AN ITEM FROM A TABLE IS SELECTED THE ITEMS FIELD referenceNumber will be queried to retrieve the path of the referencedNumber added to the collection.
// State Name is : primary_ReferencedPathState

const selectedReferenced_Dataset = $safe('#selectedReferencedData-Dataset');
const selectedReference_Table = $safe('#selectedReference-Table');
const selectedReferenced_ReferenceNumber_Display = $safe('#referencePath-Selected-ReferenceNumber-Display');
const selectedReferenced_Filter_Type_Dropdown = $safe('#referencePath-Filter-ReferencedType-Dropdown');
const selectedReferenced_Filter_Status_Dropdown = $safe('#referencePath-Filter-ReferencedStatus-Dropdown');
const selectedReferenced_Filter_ByUser_Dropdown = $safe('#referencePath-Filter-ReferencedByUser-Dropdown');



// CREATE REFERENCE
const createReference_Dataset = $safe('#createDataset');
const createReference_RefNumber_Input = $safe('#create-ReferenceNumber-Input');
const createReference_Type_Input = $safe('#create-TypeDropdown-Input');
const createReference_Status_Input = $safe('#create-StatusDropdown-Input');
const createReference_ByUser_Input = $safe('#create-ByUserDropdown-Input');
const createReference_SubmitButton = $safe('#create-SubmitButton');


//DASHBOARD PAGE CONSTANTS

const totalInbound_Display = $safe('#dashboard-InboundSection-Total-InboundReceivedDisplay');
const dashboard_Inbound_ViewButton = $safe('#dashboard-Inbound-ViewButton');
const totalTeamMembers_Display = $safe('#dashboard-TeamSection-Total-TeamMembers-Display');
const dashboard_Team_ViewButton = $safe('#dashboard-Team-ViewButton');
const manageSection_Repeater = $safe('#dashboard-ManageSection-Repeater');
const manageSection_Repeater_Item = $safe('#dashboard-ManageSection-Repeater-ItemBox');
const manageSection_Repeater_Item_Button = $safe('#dashboard-ManageSection-Repeater-ItemButton');
const accountSection_Repeater = $safe('#dashboard-AccountSection-Repeater');
const accountSection_Repeater_Item = $safe('#dashboard-AccountSection-Repeater-ItemBox');
const accountSection_Repeater_Item_Button = $safe('#dashboard-AccountSection-Repeater-ItemButton');
const settingsSection_Repeater = $safe('#dashboard-SettingsSection-Repeater');
const settingsSection_Repeater_Item = $safe('#dashboard-SettingsSection-Repeater-ItemBox');
const settingsSection_Repeater_Item_Button = $safe('#dashboard-SettingsSection-Repeater-ItemButton');

// MANAGE TEAM ELEMENTS (THIS PAGE CAN ONLY BE VIEWED BY AN ADMIN ACCOUNT USER)

const manageTeam_Close_Button = $safe('#manageTeam-Close-Button');
const manageTeam_EditAccounts_Button = $safe('#manageTeam-EditAccounts-Button');
const manageTeam_NewAccount_Button = $safe('#manageTeam-NewAccount-Button');
const manageTeam_AccountsRepeater = $safe('#manageTeam-AccountsRepeater');
const manageTeam_AccountDisplay_Item_Button = $safe('#managerTeam-DisplayAccount-Item-Button');
const manageTeam_Account_Item_CheckBox = $safe('#item-Team-CheckBox');
const manageTeam_SelectedItem_Display_Wrapper = $safe('#manageTeam-SelectedItem-Display-Wrapper');
const manageTeam_SelectedItem_UserID_Text = $safe('#manageTeam-SelectedItem-UserID');
const manageTeam_SelectedItem_FullName_Text = $safe('#manageTeam-SelectedItem-FullName');
const manageTeam_SelectedItem_Email_Text = $safe('#manageTeam-SelectedItem-Email');
const manageTeam_SelectedItem_Status_Button = $safe('#manageTeam-SelectedItem-Status-Button');
const manageTeam_SelectedItem_Disable_Button = $safe('#manageTeam-SelectedItem-DisableAccount-Button');
const manageTeam_SelectedItem_Discard_Button = $safe('#manageTeam-SelectedItem-Discard-Button');
const manageTeam_SelectedItem_Save_Button = $safe('#manageTeam-SelectedItem-Save-Button');

// MY TEAM ELEMENTS (THIS PAGE CAN ONLY BE VIEWED BY AN LOGGED IN ACCOUNT USER)

const myTeam_Close_Button = $safe('#myTeam-Exit-Button');
const myTeam_Team_Repeater = $safe('#myTeam-Team-Repeater');
const myTeam_TeamItem_Box = $safe('#myTeam-TeamItem-box');
const myTeam_TeamItem_CheckBox = $safe('#myTeam-TeamItem-CheckBox');
const myTeam_SelectedTeam_Title = $safe('#myTeam-SelectedTeam-Title');
const myTeam_SelectedTeam_UserID = $safe('#myTeam-SelectedTeam-UserId');
const myTeam_SelectedTeam_FullName = $safe('#myTeam-SelectedTeam-FullName');
const myTeam_SelectedTeam_Email = $safe('#myTeam-SelectedTeam-Email');
const myTeam_TeamItem_Status_Button = $safe('#myTeam-SelectedTeam-Status-Button');

// CREATE NEW ACCOUNT CONSTANTS

const createNewAccount_Exit_Button = $safe('#createNewAccount-Close-Button');
const createNewAccount_Reset_Button = $safe('#createNewAccount-Reset-Button');
const createNewAccount_FirstName_Input = $safe('#createNewAccount-FirstName-Input');
const createNewAccount_LastName_Input = $safe('#createNewAccount-LastName-Input');
const createNewAccount_UserId_Input = $safe('#createNewAccount-UserId-Input');
const createNewAccount_Status_DisplayText = $safe('#createNewAccount-UserID-Status-DisplayText');
const createNewAccount_MemberAccountLink_Dropdown_Input = $safe('#createNewAccount-MemberAccount-Dropdown-Input');
const createNewAccount_Discard_Button = $safe('#createNewAccount-Discard-Button');
const createNewAccount_SaveUpdate_Button = $safe('#createNewAccount-SaveUpdate-Button');



// My Account Page Constants

const myAccount_Exit_Button = $safe('#myAccount-Exit-Button');
const myAccount_Options_Repeater = $safe('#myAccount-Options-Repeater');
const myAccount_Options_Repeater_Item = $safe('#myAccount-Options-Repeater-Item'); // Already Set
const myAccount_Options_Repeater_Item_Button = $safe('#myAccount-Options-Repeater-Item-Button'); // Already Set
const myAccount_UserId_DisplayText = $safe('#myAccount-UserID-DisplayText');
const myAccount_FullName_DisplayText = $safe('#myAccount-FullName-DisplayText');
const myAccount_Email_DisplayText = $safe('#myAccount-Email-DisplayText');
const myAccount_StatusDisplay_Button = $safe('#myAccount-Status-Display-Button');
const myAccount_UpdatePassword_Button = $safe('#myAccount-UpdatePassword-Button');

// No Access Page Constants

const noAccess_MainTitle_DisplayText = $safe('#noAccess-MainTitle-DisplayText');
const noAccess_Title_DisplayText = $safe('#noAccess-Title-DisplayText');
const noAccess_Subtitle_DisplayText = $safe('#noAccess-Subtitle-DisplayText');
const noAccess_AdditionalDetails_DisplayText = $safe('#noAccess-AdditionalDetails-DisplayText');


// MAIN MENU BUTTONS

const mainMenu_Batch_Button = $safe('#mainMenu-Button-Batch');
const mainMenu_Dashboard_Button = $safe('#mainMenu-Button-Dashboard');
const mainMenu_Search_Button = $safe('#mainMenu-Button-Search');

const mainMenu_InNotReceived_Button = $safe('#mainMenu-Button-InNotReceived');
const mainMenu_NotDelivered_Button = $safe('#mainMenu-Button-NotDelivered');
const mainMenu_ReportAll_Button = $safe('#mainMenu-Button-ReportAll');

const mainMenu_CreateReference_Button = $safe('#mainMenu-Button-CreateReference');

// Map external query aliases to actual primary state ids
const primaryStateAliases = {
    dashboardMain1: primary_Dashboard,
    dashboard: primary_Dashboard,
    reportsMain: primary_ReportsState,
    reports: primary_ReportsState,
};
const validPrimaryStates = new Set([
    primary_Dashboard,
    primary_SearchState,
    primary_PullState,
    primary_ReportsState,
    primary_CreateReferenceState,
    primary_ManageTeamState,
    primary_ReferencedPathState,
    primary_ManageTeamNewAccountState,
    primary_TeamState,
    primary_MyAccountState,
    primary_NoAccessState,
    primary_LoadingState,
]);

function resolvePrimaryState(raw) {
    const normalized = typeof raw === 'string' ? raw.trim() : '';
    if (!normalized) {
        return null;
    }
    const mapped = primaryStateAliases[normalized] || normalized;
    return validPrimaryStates.has(mapped) ? mapped : null;
}

$w.onReady( async function () {
    // If not logged in, send user to No Access state and prompt login
    const member = await currentMember.getMember();
    if (!member) {
        await showNoAccessState(
            primaryMultiState,
            noAccess_MainTitle_DisplayText,
            noAccess_Title_DisplayText,
            noAccess_Subtitle_DisplayText,
            noAccess_AdditionalDetails_DisplayText,
            {
                mainTitleText: 'Login Required',
                titleText: 'Please sign in to continue',
                subtitleText: 'Access to InComm requires a member login.',
                detailsText: 'Use the SignUp/Login button in the header to authenticate.'
            }
        );
        return;
    }

    // Respect URL state overrides and default to dashboard after login/fresh login
    const query = wixLocationFrontend.query || {};
    const requestedState = resolvePrimaryState(query.state);
    const isFreshLogin = query.freshLogin === 'true' || query.freshLogin === true;
    const initialState = isFreshLogin ? primary_Dashboard : (requestedState || primary_Dashboard);
    await primaryNavigate(primaryMultiState, initialState);
  
    // SEARCH ON INPUT (debounced to avoid rapid state flips)
    searchInput.onInput(() => {
        if (searchInputDebounce) {
            clearTimeout(searchInputDebounce);
        }
        searchInputDebounce = setTimeout(async () => {
            await primaryNavigate(primaryMultiState, primary_SearchState);
            await initializeSearch(search_Dataset,
                searchResults_Table,
                searchInput,
                searchTypeInput,
                searchStatusInput,
                searchByUserInput,
                selectedReferenced_Dataset,
                async (referenceNumber) => {
                    // Update the reference display and navigate to the reference path state
                    selectedReferenced_ReferenceNumber_Display.text = referenceNumber ? `${referenceNumber}` : 'Reference: N/A';
                    await primaryNavigate(primaryMultiState, primary_ReferencedPathState);
                });
        }, 250); // Adjust debounce delay as needed
    });


// SET MAIN NAVIGATION MENU
// SET BUTTONS TO NAVIGATE TO DIFFERENT PAGES

// DASHBOARD BUTTON
mainMenu_Dashboard_Button.onClick( async () => {
    await primaryNavigate(primaryMultiState, primary_Dashboard);
});
// SEARCH BUTTON
mainMenu_Search_Button.onClick( async () => {
    await primaryNavigate(primaryMultiState, primary_SearchState);
    await initializeSearch(search_Dataset,
        searchResults_Table,
        searchInput,
        searchTypeInput,
        searchStatusInput,
        searchByUserInput,
        selectedReferenced_Dataset,
        async (referenceNumber) => {
            // Update the reference display and navigate to the reference path state
            selectedReferenced_ReferenceNumber_Display.text = referenceNumber ? `${referenceNumber}` : 'Reference: N/A';
            await primaryNavigate(primaryMultiState, primary_ReferencedPathState);
        });
});
// SEARCH SUBMIT BUTTON (single handler)
searchSubmitButton.onClick( async () => {
    await primaryNavigate(primaryMultiState, primary_SearchState);
    await initializeSearchSelected(selectedReferenced_Dataset,
        selectedReference_Table,
        selectedReferenced_ReferenceNumber_Display,
        selectedReferenced_Filter_Type_Dropdown,
        selectedReferenced_Filter_Status_Dropdown,
        selectedReferenced_Filter_ByUser_Dropdown);
});
// BATCH/PULL BUTTON
mainMenu_Batch_Button.onClick( async () => {
    await primaryNavigate(primaryMultiState, primary_PullState);

});
//  REPORTS BUTTONS
mainMenu_InNotReceived_Button.onClick( async () => {
    await reportsInNotReceived(reports_ResultsDataset,
        searchResults_Table,
        null,
        report_InMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar);
    
});
// REPORTS - IN NOT RECEIVED PAGE
mainMenu_NotDelivered_Button.onClick( async () => {
    await reportsNotDelivered(reports_ResultsDataset,
        searchResults_Table,
        null,
        report_InMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar); 
});
// REPORTS - REPORT ALL PAGE
mainMenu_ReportAll_Button.onClick( async () => {
    await reportsAllInbound(reports_ResultsDataset,
        searchResults_Table,
    null,
        report_InMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar);
});
// CREATE REFERENCE BUTTON
mainMenu_CreateReference_Button.onClick( async () => {
    await primaryNavigate(primaryMultiState, primary_CreateReferenceState);
});

// Initialize the create reference functionality during page load
await setupCreateOrEditReference(createReference_Dataset,
    createReference_RefNumber_Input,
    createReference_Type_Input,
    createReference_Status_Input,
    createReference_ByUser_Input,
    createReference_SubmitButton);

totalInbound_Display.text = await getInboundReceivedOnlyCount() + '';

// SET UP DASHBOARD MANAGEMENT SECTION
await setupDashboardManageSection();
// SET UP DASHBOARD ACCOUNT SECTION
await setupDashboardAccountSection();
// SET UP DASHBOARD SETTINGS SECTION
await setupDashboardSettingsSection();
// LOAD MY ACCOUNT PAGE DATA INTO INPUT FIELDS
await loadUserAccountPageData(
    myAccount_FullName_DisplayText,
    myAccount_Email_DisplayText,
    myAccount_UserId_DisplayText,
    myAccount_StatusDisplay_Button,
    myAccount_Options_Repeater,
    myAccount_Options_Repeater_Item_Button,
    myAccount_UpdatePassword_Button,
    myAccount_Exit_Button,
    primaryMultiState);
});

// SET UP DASHBOARD MANAGEMENT SECTION

//Manage Section Repeater Data
const manageData = [
    {
        _id: 'manage-1',
        buttonLabel: 'Manage Team',
        linkState: 'manageTeamMain1'
    },
    {
        _id: 'manage-2',
        buttonLabel: 'Decisioning Matrix',
        linkState: 'manageDecisioningMatrixMain1'
    },
    {   
        _id: 'manage-3',
        buttonLabel: 'Day Reconcil',
        linkState: 'manageDayReconMain1'
    }
];
// Set UP AN EVENT HANDLER TO NAVIGATE TO THE RESPECTIVE PAGES WHEN MANAGE SECTION DASHBOARD BUTTONS ARE CLICKED
// THIS WILL BE SET UP BY MATCHING THE BUTTON LABEL TO A VARIABLE THAT WILL USER THE Primary & Reports NAVIGATION FUNCTIONS

async function setupDashboardManageSection() {
    if (!manageSection_Repeater) {
        console.warn('Manage repeater missing; skipping manage section setup');
        return;
    }
    manageSection_Repeater.data = manageData;
    manageSection_Repeater.onItemReady( ($item, itemData, index) => {
        const button = $item('#dashboard-ManageSection-Repeater-ItemButton');
        if (!button) {
            console.warn('Manage button missing in repeater item');
            return;
        }
        button.label = itemData.buttonLabel;
        button.onClick( async () => {
            try {
                switch (itemData.linkState) {
                    case 'manageTeamMain1':
                        await primaryNavigate(primaryMultiState, primary_ManageTeamState);
                        break;
                    case 'manageDecisioningMatrixMain1':
                        // Navigate to Decisioning Matrix page (implement as needed)
                        console.log('Navigate to Decisioning Matrix page');
                        break;
                    case 'manageDayReconMain1':
                        // Navigate to Day Recon page (implement as needed)
                        console.log('Navigate to Day Recon page');
                        break;
                    default:
                        console.error('Unknown manage section link state:', itemData.linkState);
                }
            } catch (error) {
                console.error('Error navigating to manage section page:', error);
            }
        });
        
    });
    
}

// Account Section Repeater Data
const accountData = [
    {   
        _id: 'account-1',
        buttonLabel: 'My Account',
        linkState: 'myAccountMain1'
    },
    {  
        _id: 'account-2',
        buttonLabel: 'My Team',
        linkState: 'teamMain1'
    }
];  

// SET UP DASHBOARD ACCOUNT SECTION

async function setupDashboardAccountSection() {
    if (!accountSection_Repeater) {
        console.warn('Account repeater missing; skipping account section setup');
        return;
    }
    accountSection_Repeater.data = accountData;
    accountSection_Repeater.onItemReady( ($item, itemData, index) => {
        const button = $item('#dashboard-AccountSection-Repeater-ItemButton');
        if (!button) {
            console.warn('Account button missing in repeater item');
            return;
        }
        button.label = itemData.buttonLabel;
        button.onClick( async () => {
            try {
                switch (itemData.linkState) {
                    case 'myAccountMain1':
                        await primaryNavigate(primaryMultiState, primary_MyAccountState);
                        await loadUserAccountPageData(
                            myAccount_FullName_DisplayText,
                            myAccount_Email_DisplayText,
                            myAccount_UserId_DisplayText,
                            myAccount_StatusDisplay_Button,
                            myAccount_Options_Repeater,
                            myAccount_Options_Repeater_Item_Button,
                            myAccount_UpdatePassword_Button,
                            myAccount_Exit_Button,
                            primaryMultiState);
                        break;
                    case 'teamMain1':
                        await primaryNavigate(primaryMultiState, primary_TeamState);
                        break;
                    default:
                        console.error('Unknown account section link state:', itemData.linkState);
                }
            } catch (error) {
                console.error('Error navigating to account section page:', error);
            }   
        });
    });
}

// Manage Section Repeater Data
const settingsData = [
    {   
        _id: 'settings-1',
        buttonLabel: 'About',
        linkState: 'aboutMain1'
    },
    {   
        _id: 'settings-2',
        buttonLabel: 'Security Settings',
        linkState: 'securitySettingsMain1'
    },
    {   
        _id: 'settings-3',
        buttonLabel: 'Help & Support',
        linkState: 'helpMain1'
    }
];  
// SET UP DASHBOARD SETTINGS SECTION
async function setupDashboardSettingsSection() {
    if (!settingsSection_Repeater) {
        console.warn('Settings repeater missing; skipping settings section setup');
        return;
    }
    settingsSection_Repeater.data = settingsData;
    settingsSection_Repeater.onItemReady( ($item, itemData, index) => {
        const button = $item('#dashboard-SettingsSection-Repeater-ItemButton');
        if (!button) {
            console.warn('Settings button missing in repeater item');
            return;
        }
        button.label = itemData.buttonLabel;
        button.onClick( async () => {
            try {
                switch (itemData.linkState) {
                    case 'aboutMain1':
                        wixWindowFrontend.openLightbox('AboutLightbox');
                        break;
                    case 'securitySettingsMain1':
                        wixWindowFrontend.openLightbox('SecuritySettingsLightbox');
                        break;
                    case 'helpMain1':
                        wixWindowFrontend.openLightbox('HelpSupportLightbox');
                        break;
                    default:
                        console.error('Unknown settings section link state:', itemData.linkState);
                }
            } catch (error) {
                console.error('Error navigating to settings section page:', error);
            }   
        });
    });
}