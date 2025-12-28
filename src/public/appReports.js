// File:  src/public/appReports.js
// import { reportsInNotReceived, reportsNotDelivered, reportsAllInbound  } from 'public/appReports.js';

// THIS FILE WILL CONTAIN ALL REPORTS RELATED FUNCTIONS FOR THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixData from 'wix-data';
import { primaryNavigate, reportsNavigate } from 'public/appNavigation';

// THIS FUNCTION WILL GENERATE A REPORT BASED ON THE PROVIDED PARAMETERS
// IN_NOT_RECEIVED_REPORTS: BOOLEAN
// THE IN_NOT_RECEIVED REPORT WILL FILTER FOR RECORDS THAT DO NOT HAVE AN 'Inbound Received' STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

const REPORT_PAGE_SIZE = 1000;

async function fetchLatestByReference({ searchValue, typeValue, statusValue, byUserValue, statusExclusion }) {
    const opts = { suppressAuth: true, suppressHooks: true };
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .descending('updateDate')
        .descending('_updatedDate')
        .descending('_createdDate');

    if (searchValue) {
        query = query.contains('referenceNumber', searchValue);
    }
    if (typeValue) {
        query = query.eq('referenceType', typeValue);
    }
    if (statusValue) {
        query = query.eq('status', statusValue);
    }
    if (byUserValue) {
        query = query.eq('addedByUser', byUserValue);
    }

    let results = await query.limit(REPORT_PAGE_SIZE).find(opts);

    const mostRecentByRef = new Map();
    const processItems = (items) => {
        items.forEach((item) => {
            const ref = item.referenceNumber ? item.referenceNumber.trim() : '';
            if (!ref) {
                return;
            }
            if (!mostRecentByRef.has(ref)) {
                mostRecentByRef.set(ref, item);
            }
        });
    };

    processItems(results.items);
    while (results.hasNext()) {
        results = await results.next();
        processItems(results.items);
    }

    let valid = Array.from(mostRecentByRef.values());
    if (statusExclusion) {
        valid = valid.filter((item) => item.status !== statusExclusion);
    }

    return valid;
}

async function applyIdsToDataset(dataset, ids) {
    if (!dataset || typeof dataset.setFilter !== 'function') {
        return;
    }

    if (!ids || ids.length === 0) {
        await dataset.setFilter(wixData.filter().eq('_id', 'NO_MATCH_FOUND'));
        return;
    }

    try {
        await dataset.setFilter(wixData.filter().hasSome('_id', ids));
    } catch (error) {
        console.warn('hasSome unsupported, falling back to OR chain', error);
        let filter = wixData.filter().eq('_id', ids[0]);
        for (let i = 1; i < ids.length; i++) {
            filter = filter.or(wixData.filter().eq('_id', ids[i]));
        }
        await dataset.setFilter(filter);
    }
}

async function sortDatasetByNewest(dataset) {
    if (dataset && typeof dataset.setSort === 'function') {
        await dataset.setSort(wixData.sort().descending('updateDate').descending('_updatedDate').descending('_createdDate'));
    }
}

export async function reportsInNotReceived(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    const searchValue = (reportsFilterSearch_Input?.value || '').trim();

    const items = await fetchLatestByReference({
        searchValue,
        statusExclusion: 'Inbound Received',
    });

    const ids = items.map((item) => item._id).filter(Boolean);
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    reportsInMenuDropdown.options = [
        { label: 'In Not Received', value: 'inNotReceived' },
        { label: 'Not Delivered', value: 'notDelivered' },
        { label: 'All Inbound', value: 'allInbound' },
    ];
    reportsInMenuDropdown.value = 'inNotReceived';

    return ids.length;


}



// THE NOT_DELIVETERED REPORT WILL FILTER FOR RECORDS THAT DO NOT HAVE A 'Delivered' STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

export async function reportsNotDelivered(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    const searchValue = (reportsFilterSearch_Input?.value || '').trim();

    const items = await fetchLatestByReference({
        searchValue,
        statusExclusion: 'Delivered',
    });

    const ids = items.map((item) => item._id).filter(Boolean);
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    reportsInMenuDropdown.options = [
        { label: 'In Not Received', value: 'inNotReceived' },
        { label: 'Not Delivered', value: 'notDelivered' },
        { label: 'All Inbound', value: 'allInbound' },
    ];
    reportsInMenuDropdown.value = 'notDelivered';

    return ids.length;
}


// THE REPORT ALL WILL NOT FILTER FOR ANY STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

export async function reportsAllInbound(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    // Show all items; ignore any search input so the full deduped set is returned.
    const items = await fetchLatestByReference({
        searchValue: null,
        statusExclusion: null,
    });

    const ids = items.map((item) => item._id).filter(Boolean);
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    reportsInMenuDropdown.options = [
        { label: 'In Not Received', value: 'inNotReceived' },
        { label: 'Not Delivered', value: 'notDelivered' },
        { label: 'All Inbound', value: 'allInbound' },
    ];
    reportsInMenuDropdown.value = 'allInbound';

    return ids.length;
}