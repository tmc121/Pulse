// File:  src/public/appReports.js
// import { reportsInNotReceived, reportsNotDelivered, reportsAllInbound  } from 'public/appReports.js';

//TODO:
// NOT YET CONFIGURE FOR INTERNATIONALIZATION

// THIS FILE WILL CONTAIN ALL REPORTS RELATED FUNCTIONS FOR THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE MASTER PAGE AND OTHER PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

//IMPORTS
import wixData from 'wix-data';
import { primaryNavigate, reportsNavigate } from './appNavigation.js';

/**
 * @typedef {Object} DemoItem
 * @property {string=} _id
 * @property {string=} referenceNumber
 * @property {string=} type
 * @property {string=} referenceType
 * @property {string=} byUser
 * @property {string=} addedByUser
 * @property {string=} status
 * @property {Date | string | number=} createdAt
 * @property {Date | string | number=} updateDate
 * @property {Date | string | number=} _updatedDate
 * @property {Date | string | number=} _createdDate
 */

/**
 * @typedef {Object} ReportsDropdownContext
 * @property {any} reportsDataset
 * @property {any} reportsTable
 * @property {any} reportsFilterSearch_Input
 * @property {any} reportsInMenuDropdown
 * @property {any} primaryMultiState
 * @property {any} reportsMultiState
 * @property {any} reportsLoadingProgressBar
 */

// THIS FUNCTION WILL GENERATE A REPORT BASED ON THE PROVIDED PARAMETERS
// IN_NOT_RECEIVED_REPORTS: BOOLEAN
// THE IN_NOT_RECEIVED REPORT WILL FILTER FOR RECORDS THAT DO NOT HAVE AN 'Inbound Received' STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

const REPORT_PAGE_SIZE = 1000;
const REPORT_MENU_OPTIONS = [
    { label: 'In Not Received', value: 'inNotReceived' },
    { label: 'Not Delivered', value: 'notDelivered' },
    { label: 'All Inbound', value: 'allInbound' },
];

// Statuses that stop the elapsed delivery clock for a reference.
const DELIVERY_CLOCK_STOP_STATUSES = new Set([
    'delivery attempt',
    'delivered',
    'research',
    'late received',
    'hold over location',
]);

// Avoid stacking multiple dropdown handlers across report calls
let reportsDropdownBound = false;
/** @type {ReportsDropdownContext | null} */
let reportsDropdownCtx = null;
let latestReportRunId = 0;

function beginReportRun() {
    latestReportRunId += 1;
    return latestReportRunId;
}

/** @param {number} runId */
function isCurrentReportRun(runId) {
    return runId === latestReportRunId;
}

/** @param {any} reportsInMenuDropdown
 *  @param {string} selectedValue
 */
function setReportsMenuSelection(reportsInMenuDropdown, selectedValue) {
    if (!reportsInMenuDropdown) {
        return;
    }

    if (!reportsInMenuDropdown._reportsOptionsInitialized) {
        reportsInMenuDropdown.options = REPORT_MENU_OPTIONS;
        reportsInMenuDropdown._reportsOptionsInitialized = true;
    }

    reportsInMenuDropdown.value = selectedValue;
}

/** @param {DemoItem} item */
function normalizedStatus(item) {
    return (item?.status || '').toString().trim();
}

/** @param {DemoItem} item */
function itemTypeValue(item) {
    return (item?.type || item?.referenceType || '').toString().trim();
}

/** @param {DemoItem} item */
function itemByUserValue(item) {
    return (item?.byUser || item?.addedByUser || '').toString().trim();
}

/** @param {DemoItem} item */
function normalizedStatusKey(item) {
    return normalizedStatus(item).toLowerCase();
}

/** @param {DemoItem} item */
function itemDateMs(item) {
    const d = new Date(item?.createdAt || item?.updateDate || item?._updatedDate || item?._createdDate || 0);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/**
 * @param {{ searchValue?: string, typeValue?: string, statusValue?: string, byUserValue?: string, statusExclusion?: string }} params
 * @returns {Promise<DemoItem[]>}
 */
async function fetchLatestByReference({ searchValue = '', typeValue = '', statusValue = '', byUserValue = '', statusExclusion = '' } = {}) {
    const opts = { suppressAuth: true, suppressHooks: true };
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .descending('createdAt')
        .descending('updateDate')
        .descending('_updatedDate')
        .descending('_createdDate');

    if (searchValue) {
        query = query.contains('referenceNumber', searchValue);
    }
    if (statusValue) {
        query = query.eq('status', statusValue);
    }

    let results = await query.limit(REPORT_PAGE_SIZE).find(opts);

    const mostRecentByRef = new Map();
    /** @param {DemoItem[]} items */
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
    if (typeValue) {
        valid = valid.filter((item) => itemTypeValue(item) === typeValue);
    }
    if (byUserValue) {
        valid = valid.filter((item) => itemByUserValue(item) === byUserValue);
    }
    if (statusExclusion) {
        valid = valid.filter((item) => item.status !== statusExclusion);
    }

    return valid;
}

async function fetchNotDeliveredAfterReceived({ searchValue = '', typeValue = '', statusValue = '', byUserValue = '' } = {}) {
    const opts = { suppressAuth: true, suppressHooks: true };
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .ascending('createdAt')
        .ascending('updateDate')
        .ascending('_updatedDate')
        .ascending('_createdDate');

    if (searchValue) {
        query = query.contains('referenceNumber', searchValue);
    }
    if (statusValue) {
        query = query.eq('status', statusValue);
    }

    let results = await query.limit(REPORT_PAGE_SIZE).find(opts);

    const referenceSequences = new Map();
    /** @param {DemoItem[]} items */
    const processItems = (items) => {
        items.forEach((item) => {
            const ref = item.referenceNumber ? item.referenceNumber.trim() : '';
            if (!ref) {
                return;
            }
            if (!referenceSequences.has(ref)) {
                referenceSequences.set(ref, []);
            }
            referenceSequences.get(ref).push(item);
        });
    };

    processItems(results.items);
    while (results.hasNext()) {
        results = await results.next();
        processItems(results.items);
    }

    const notDeliveredItems = [];
    
    for (const [ref, items] of referenceSequences.entries()) {
        let hasInboundReceived = false;
        let hasClockStopStatusAfterReceived = false;
        let latestItem = null;
        
        // Sort by updateDate to ensure proper sequence
        items.sort((/** @type {DemoItem} */ a, /** @type {DemoItem} */ b) => {
            const aDate = new Date(a.updateDate || a._updatedDate || a._createdDate || 0);
            const bDate = new Date(b.updateDate || b._updatedDate || b._createdDate || 0);
            return aDate.getTime() - bDate.getTime();
        });
        
        // Each 'Inbound Received' starts a new delivery clock cycle for the reference.
        // Any stop-clock status after that inbound removes the reference from the
        // Not Delivered report until a later inbound starts a new cycle.
        for (const item of items) {
            latestItem = item; // Keep track of the latest item
            const statusKey = normalizedStatusKey(item);
            
            if (statusKey === 'inbound received') {
                hasInboundReceived = true;
                hasClockStopStatusAfterReceived = false; // Reset when a new inbound starts a new cycle
            } else if (hasInboundReceived && DELIVERY_CLOCK_STOP_STATUSES.has(statusKey)) {
                hasClockStopStatusAfterReceived = true;
            }
        }
        
        // Include only if there is an inbound cycle and no stop-clock status after it.
        if (hasInboundReceived && !hasClockStopStatusAfterReceived && latestItem) {
            notDeliveredItems.push(latestItem);
        }
    }

    return notDeliveredItems.filter((item) => {
        if (typeValue && itemTypeValue(item) !== typeValue) {
            return false;
        }
        if (byUserValue && itemByUserValue(item) !== byUserValue) {
            return false;
        }
        return true;
    });
}

async function fetchInNotReceivedByFirstStatus({ searchValue = '', typeValue = '', byUserValue = '' } = {}) {
    const opts = { suppressAuth: true, suppressHooks: true };
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .ascending('createdAt')
        .ascending('updateDate')
        .ascending('_updatedDate')
        .ascending('_createdDate');

    if (searchValue) {
        query = query.contains('referenceNumber', searchValue);
    }
    let results = await query.limit(REPORT_PAGE_SIZE).find(opts);

    const referenceSequences = new Map();
    /** @param {DemoItem[]} items */
    const processItems = (items) => {
        (items || []).forEach((item) => {
            const ref = item.referenceNumber ? item.referenceNumber.trim() : '';
            if (!ref) {
                return;
            }
            if (!referenceSequences.has(ref)) {
                referenceSequences.set(ref, []);
            }
            referenceSequences.get(ref).push(item);
        });
    };

    processItems(results.items);
    while (results.hasNext()) {
        results = await results.next();
        processItems(results.items);
    }

    const inNotReceivedItems = [];

    for (const items of referenceSequences.values()) {
        if (!items || items.length === 0) {
            continue;
        }

        items.sort((/** @type {DemoItem} */ a, /** @type {DemoItem} */ b) => itemDateMs(a) - itemDateMs(b));

        const firstStatus = normalizedStatus(items[0]);
        const latestItem = items[items.length - 1];

        if (firstStatus !== 'Inbound Received' && latestItem) {
            inNotReceivedItems.push(latestItem);
        }
    }

    return inNotReceivedItems.filter((item) => {
        if (typeValue && itemTypeValue(item) !== typeValue) {
            return false;
        }
        if (byUserValue && itemByUserValue(item) !== byUserValue) {
            return false;
        }
        return true;
    });
}

/**
 * @param {any} dataset
 * @param {string[]} ids
 */
async function applyIdsToDataset(dataset, ids) {
    if (!dataset || typeof dataset.setFilter !== 'function') {
        return;
    }

    if (!ids || ids.length === 0) {
        await dataset.setFilter(wixData.filter().eq('_id', 'NO_MATCH_FOUND'));
        if (typeof dataset.refresh === 'function') {
            await dataset.refresh();
        }
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

    if (typeof dataset.refresh === 'function') {
        await dataset.refresh();
    }
}

/** @param {any} dataset */
async function sortDatasetByNewest(dataset) {
    if (dataset && typeof dataset.setSort === 'function') {
        await dataset.setSort(wixData.sort().descending('createdAt').descending('updateDate').descending('_updatedDate').descending('_createdDate'));
    }
}

/** @param {ReportsDropdownContext} ctx */
function ensureReportsDropdownHandler(ctx) {
    // Always update the shared context so the bound handler uses fresh datasets/controls
    reportsDropdownCtx = ctx;
    if (reportsDropdownBound) {
        return;
    }
    reportsDropdownBound = true;
    ctx.reportsInMenuDropdown.onChange(async (/** @type {any} */ event) => {
        const selectedValue = event.target.value;
        const c = reportsDropdownCtx || ctx;
        if (selectedValue === 'inNotReceived') {
            await reportsInNotReceived(
                c.reportsDataset,
                c.reportsTable,
                c.reportsFilterSearch_Input,
                c.reportsInMenuDropdown,
                c.primaryMultiState,
                c.reportsMultiState,
                c.reportsLoadingProgressBar
            );
        } else if (selectedValue === 'notDelivered') {
            await reportsNotDelivered(
                c.reportsDataset,
                c.reportsTable,
                c.reportsFilterSearch_Input,
                c.reportsInMenuDropdown,
                c.primaryMultiState,
                c.reportsMultiState,
                c.reportsLoadingProgressBar
            );
        } else if (selectedValue === 'allInbound') {
            await reportsAllInbound(
                c.reportsDataset,
                c.reportsTable,
                c.reportsFilterSearch_Input,
                c.reportsInMenuDropdown,
                c.primaryMultiState,
                c.reportsMultiState,
                c.reportsLoadingProgressBar
            );
        }
    });
}



/**
 * @param {any} reportsDataset
 * @param {any} reportsTable
 * @param {any} reportsFilterSearch_Input
 * @param {any} reportsInMenuDropdown
 * @param {any} primaryMultiState
 * @param {any} reportsMultiState
 * @param {any} reportsLoadingProgressBar
 */
export async function reportsInNotReceived(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    const runId = beginReportRun();

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    const searchValue = (reportsFilterSearch_Input?.value || '').trim();

    const items = await fetchInNotReceivedByFirstStatus({
        searchValue,
    });

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    const ids = items.map((item) => item._id).filter((id) => typeof id === 'string');
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    setReportsMenuSelection(reportsInMenuDropdown, 'inNotReceived');

    ensureReportsDropdownHandler({
        reportsDataset,
        reportsTable,
        reportsFilterSearch_Input,
        reportsInMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar,
    });

    return ids.length;


}



// THE NOT_DELIVETERED REPORT WILL FILTER FOR RECORDS THAT DO NOT HAVE A 'Delivered' STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

/**
 * @param {any} reportsDataset
 * @param {any} reportsTable
 * @param {any} reportsFilterSearch_Input
 * @param {any} reportsInMenuDropdown
 * @param {any} primaryMultiState
 * @param {any} reportsMultiState
 * @param {any} reportsLoadingProgressBar
 */
export async function reportsNotDelivered(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    const runId = beginReportRun();

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    const searchValue = (reportsFilterSearch_Input?.value || '').trim();

    const items = await fetchNotDeliveredAfterReceived({
        searchValue,
    });

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    const ids = items.map((item) => item._id).filter((id) => typeof id === 'string');
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    setReportsMenuSelection(reportsInMenuDropdown, 'notDelivered');

    ensureReportsDropdownHandler({
        reportsDataset,
        reportsTable,
        reportsFilterSearch_Input,
        reportsInMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar,
    });

    return ids.length;
}




// THE REPORT ALL WILL NOT FILTER FOR ANY STATUS
// If multiple items with the same reference number exist, it will only include it once in the report for the last occurrence found by the updateDate field.
// This is critical for accurate reporting.
// The multistateBox and progressBar parameters are required;

/**
 * @param {any} reportsDataset
 * @param {any} reportsTable
 * @param {any} reportsFilterSearch_Input
 * @param {any} reportsInMenuDropdown
 * @param {any} primaryMultiState
 * @param {any} reportsMultiState
 * @param {any} reportsLoadingProgressBar
 */
export async function reportsAllInbound(reportsDataset,
    reportsTable,
    reportsFilterSearch_Input,
    reportsInMenuDropdown,
    primaryMultiState,
    reportsMultiState,
    reportsLoadingProgressBar) {

    const runId = beginReportRun();

    await primaryNavigate(primaryMultiState, 'reportsMain1');
    await reportsNavigate(reportsMultiState, 'reportsData', reportsLoadingProgressBar);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    // Show all items; ignore any search input so the full deduped set is returned.
    const items = await fetchLatestByReference({
        searchValue: '',
        statusExclusion: '',
    });

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    const ids = items.map((item) => item._id).filter((id) => typeof id === 'string');
    await applyIdsToDataset(reportsDataset, ids);
    await sortDatasetByNewest(reportsDataset);

    if (!isCurrentReportRun(runId)) {
        return 0;
    }

    setReportsMenuSelection(reportsInMenuDropdown, 'allInbound');

    ensureReportsDropdownHandler({
        reportsDataset,
        reportsTable,
        reportsFilterSearch_Input,
        reportsInMenuDropdown,
        primaryMultiState,
        reportsMultiState,
        reportsLoadingProgressBar,
    });

    return ids.length;
}

// ANALYTICS FUNCTIONS

// SET UP INBOUND REPORT COUNT
// GET COUNT OF RECORDS FOR 'INBOUND RECEIVED' STATUS THAT ONLY HAS AN INBOUND RECEIVED STATUS RECORD WITHOUT A CORRESPONDING 'DELIVERED' STATUS RECORD
// IF MULTIPLE RECORDS EXIST WITH THE SAME REFERENCE NUMBER, ONLY THE MOST RECENT RECORD BASED ON updateDate FIELD WILL BE CONSIDERED FOR THE REPORT COUNT
export async function getInboundReceivedOnlyCount() {
    try {
        const opts = { suppressAuth: true, suppressHooks: true };
        let query = wixData
            .query('DemoData')
            .ne('referenceNumber', '')
            .isNotEmpty('referenceNumber')
            .descending('createdAt')
            .descending('updateDate')
            .descending('_updatedDate')
            .descending('_createdDate');

        let results = await query.limit(REPORT_PAGE_SIZE).find(opts);

        const latestByRef = new Map();
        /** @param {DemoItem[]} items */
        const process = (items) => {
            for (const item of items || []) {
                const refNum = item.referenceNumber ? item.referenceNumber.trim() : '';
                if (!refNum || latestByRef.has(refNum)) {
                    continue;
                }
                latestByRef.set(refNum, item);
            }
        };

        process(results.items);
        while (results.hasNext()) {
            results = await results.next();
            process(results.items);
        }

        let count = 0;
        latestByRef.forEach((item) => {
            if (item.status === 'Inbound Received') {
                count++;
            }
        });

        return count;
    } catch (error) {
        console.error('Error calculating Inbound Received only count:', error);
        return 0;
    }
}
