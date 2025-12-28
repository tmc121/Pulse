// File: src/public/appNavigation.js
// import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';

// THIS FILE WILL CONTAIN ALL NAVIGATION FUNCTIONS FOR THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixLocationFrontend from 'wix-location-frontend';





// PRIMARY STATE OPTIONS:
// 'dashboard'
// 'searchMain1'
// 'pullMain1'
// 'reportsMain1'
// 'createReferenceMain1'
// 'manageTeamMain1'
// 'referencePathMain1'
// 'manageTeamNewAccountMain1'
// 'teamMain1'
// 'myAccountMain1'
// 'noAccessStateMain1'
// 'loadingMain1'

// REPORTS STATE OPTIONS:
// 'reportsDash'
// 'reportsData'
// 'reportsLoading'

// THIS FUNCTION WILL NAVIGATE THE PRIMARY MULTISTATE BOX TO THE DESIRED STATE
export async function primaryNavigate(multistateBox, state) {
    await multistateBox.changeState('loadingMain1'); // Optional: Show loading state before changing to the desired state
    setTimeout(async () => {
        await multistateBox.changeState(state);
    }, 500); // Adjust the delay time (in milliseconds) as needed
} 

// THIS FUNCTION WILL NAVIGATE THE REPORTS MULTISTATE BOX TO THE DESIRED STATE
export async function reportsNavigate(multistateBox, state, reportsLoadingProgressBar) {
    await multistateBox.changeState('reportsLoading'); // Optional: Show loading state before changing to the desired state
    setTimeout(async () => {
        await multistateBox.changeState(state);
        // Capture the interval ID
    const intervalId = setInterval(() => {
        // Increment safely without exceeding 100
        reportsLoadingProgressBar.value = Math.min(
            reportsLoadingProgressBar.value + 20,
            100
        );
    }, 200);
    }, 1000); // Adjust the delay time (in milliseconds) as needed  
 
}

