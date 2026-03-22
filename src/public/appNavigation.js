// File: src/public/appNavigation.js
// import { primaryNavigate, reportsNavigate } from 'public/appNavigation.js';

// THIS FILE WILL CONTAIN ALL NAVIGATION FUNCTIONS FOR THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixLocationFrontend from 'wix-location-frontend';

const reportsIntervalByBar = new WeakMap();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}





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
    if (!multistateBox || typeof multistateBox.changeState !== 'function') {
        console.warn('primaryNavigate missing multistateBox');
        return;
    }

    await multistateBox.changeState('loadingMain1'); // Optional: Show loading state before changing to the desired state
    await delay(500);
    await multistateBox.changeState(state);
} 

// THIS FUNCTION WILL NAVIGATE THE REPORTS MULTISTATE BOX TO THE DESIRED STATE
export async function reportsNavigate(multistateBox, state, reportsLoadingProgressBar) {
    if (!multistateBox || typeof multistateBox.changeState !== 'function') {
        console.warn('reportsNavigate missing multistateBox');
        return;
    }

    if (reportsLoadingProgressBar) {
        const existingInterval = reportsIntervalByBar.get(reportsLoadingProgressBar);
        if (existingInterval) {
            clearInterval(existingInterval);
        }
        reportsLoadingProgressBar.value = 0;
    }

    await multistateBox.changeState('reportsLoading'); // Optional: Show loading state before changing to the desired state
    await delay(1000);
    await multistateBox.changeState(state);

    if (!reportsLoadingProgressBar || typeof reportsLoadingProgressBar.value !== 'number') {
        return;
    }

    await new Promise((resolve) => {
        const intervalId = setInterval(() => {
            reportsLoadingProgressBar.value = Math.min((reportsLoadingProgressBar.value || 0) + 20, 100);
            if (reportsLoadingProgressBar.value >= 100) {
                clearInterval(intervalId);
                reportsIntervalByBar.delete(reportsLoadingProgressBar);
                resolve();
            }
        }, 200);
        reportsIntervalByBar.set(reportsLoadingProgressBar, intervalId);
    });
 
}

