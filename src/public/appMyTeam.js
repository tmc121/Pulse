// @ts-nocheck
// File:   src/public/appMyTeam.js
// import { setMyTeamPage } from 'public/appMyTeam.js';

import wixData from 'wix-data';
import { primaryNavigate } from './appNavigation.js';
import { getUserAccountByMemberId } from './UserAccounts-Auth.js';
import { getLoggedInMemberId } from './appAuthentication.js';


// THIS FILE WILL CONTAIN ALL FUNCTIONS RELATED TO THE MY TEAM PAGE AND ITS FUNCTIONALITY
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MY TEAM PAGE TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

/*
const myTeam_Close_Button = $w('#myTeam-Exit-Button');
const myTeam_Team_Repeater = $w('#myTeam-Team-Repeater');
const myTeam_TeamItem_Box = $w('#myTeam-TeamItem-box');
const myTeam_TeamItem_Button = $w('#myTeam-TeamItem-Button');
const myTeam_TeamItem_CheckBox = $w('#myTeam-TeamItem-CheckBox');
const myTeam_SelectedTeam_Title = $w('#myTeam-SelectedTeam-Title');
const myTeam_SelectedTeam_UserID = $w('#myTeam-SelectedTeam-UserId');
const myTeam_SelectedTeam_FullName = $w('#myTeam-SelectedTeam-FullName');
const myTeam_SelectedTeam_Email = $w('#myTeam-SelectedTeam-Email');
const myTeam_TeamItem_Status_Button = $w('#myTeam-SelectedTeam-Status-Button');
*/

// Helper for navigating primary multistate box
// IMPLEMENT FUNCTION TO SETUP MY TEAM PAGE


export async function setMyTeamPage(
    closeButton,
    teamRepeater,
    teamItemBox,
    teamItemCheckBox,
    teamItemButton,
    selectedTeamTitle,
    selectedTeamUserID,
    selectedTeamFullName,
    selectedTeamEmail,
    teamItemStatusButton
) {
    // Guard for missing controls
    if (!closeButton || !teamRepeater) {
        console.warn('My Team setup skipped: missing closeButton or teamRepeater');
        return;
    }

    // Close handler to navigate back to dashboard
    closeButton.onClick(async () => {
        try {
            await primaryNavigate($w('#multiStateBox1'), 'dashboard');
        } catch (err) {
            console.error('Failed to navigate from My Team close', err);
        }
    });

    // Clear UI
    teamRepeater.data = [];
    if (selectedTeamTitle) selectedTeamTitle.text = 'Team Member: -';
    if (selectedTeamUserID) selectedTeamUserID.text = 'User ID: -';
    if (selectedTeamFullName) selectedTeamFullName.text = 'Full Name: -';
    if (selectedTeamEmail) selectedTeamEmail.text = 'Email: -';
    if (teamItemStatusButton) teamItemStatusButton.label = 'Status: -';

    // Load team members for the current admin
    let teamMembers = [];
    try {
        const memberId = await getLoggedInMemberId();
        const account = await getUserAccountByMemberId(memberId);
        const adminUserId = account?.account?.userid || account?.account?.userId || account?.userId;
        if (!adminUserId) {
            console.warn('No admin userId found for current member');
        } else {
            const result = await wixData.query('UserAccounts')
                .eq('teamAdmin', adminUserId)
                .find({ suppressAuth: true, suppressHooks: true });
            teamMembers = result?.items || [];
        }
    } catch (err) {
        console.error('Error loading team members:', err);
    }

    teamRepeater.data = teamMembers;

    teamRepeater.onItemReady(($item, itemData) => {
        const button = $item(teamItemButton || '#myTeam-TeamItem-Button');
        const checkbox = $item(teamItemCheckBox || '#myTeam-TeamItem-CheckBox');
        if (checkbox && typeof checkbox.collapse === 'function') {
            checkbox.collapse();
        }
        const fullName = `${itemData.firstName || ''} ${itemData.lastName || ''}`.trim();
        const userId = (itemData.userId || '').toString().toUpperCase();
        const email = itemData.loginEmail || itemData.email || '';
        const status = itemData.status || itemData.accountStatus || '';
        if (button) {
            button.label = fullName && userId ? `${fullName} (${userId})` : userId || fullName || 'Team Member';
            button.onClick(() => {
                if (selectedTeamTitle) selectedTeamTitle.text = `Team Member: ${fullName || '-'}`;
                if (selectedTeamUserID) selectedTeamUserID.text = `User ID: ${userId || '-'}`;
                if (selectedTeamFullName) selectedTeamFullName.text = `Full Name: ${fullName || '-'}`;
                if (selectedTeamEmail) selectedTeamEmail.text = `Email: ${email || '-'}`;
                if (teamItemStatusButton) teamItemStatusButton.label = `Status: ${status || '-'}`;
            });
        }
    });
}