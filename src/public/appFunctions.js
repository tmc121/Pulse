// File: src/public/appFunctions.js
// import { changePrimary_MultistateBoxState , changeReports_MultistateBoxState } from '/public/appFunctions.js';

// THIS FILE WILL CONTAIN ALL FUNCTIONS THAT WILL BE USED IN THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

// PRIMARY MULISTATE CHANGE FUNCTION
export async function changePrimary_MultistateBoxState(multistateBox, state) {

    await multistateBox.changeState('loadingMain1'); // Optional: Show loading state before changing to the desired state

    setTimeout(async () => {
        await multistateBox.changeState(state);
    }, 500); // Adjust the delay time (in milliseconds) as needed

    //
}

// REPORTS MULTISTATE CHANGE FUNCTION
export async function changeReports_MultistateBoxState(multistateBox, reportsLoadingProgressBar, state) {

    await multistateBox.changeState('reportsLoading'); // Optional: Show loading state before changing to the desired state

    reportsLoadingProgressBar.value = 0;
    reportsLoadingProgressBar.targetValue = 100;

    // Capture the interval ID
    const intervalId = setInterval(() => {
        // Increment safely without exceeding 100
        reportsLoadingProgressBar.value = Math.min(
            reportsLoadingProgressBar.value + 20,
            100
        );
    }, 200);
    setTimeout(async () => {
        await multistateBox.changeState(state);
        clearInterval(intervalId);
    }, 1000); // Adjust the delay time (in milliseconds) as needed

}


