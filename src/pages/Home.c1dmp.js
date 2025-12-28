import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members-frontend';
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';

//IMPORTS
import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';
import { initializeSearch, initializeSearchSelected, setupCreateOrEditReference, getInboundReceivedOnlyCount } from 'public/InitializeData.js';
import { reportsInNotReceived, reportsNotDelivered, reportsAllInbound  } from 'public/appReports.js';

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

$w.onReady( async function () {
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
// SEARCH SUBMIT BUTTON
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
    await setupCreateOrEditReference(createReference_Dataset,
        createReference_RefNumber_Input,
        createReference_Type_Input,
        createReference_Status_Input,
        createReference_ByUser_Input,
        createReference_SubmitButton);
});

totalInbound_Display.text = await getInboundReceivedOnlyCount();


});