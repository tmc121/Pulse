// File:  src/public/appReportFunctions.js
// import { InNotReceived_Report , NotDelivered_Report , all_Report } from 'public/appReportFunctions.js';

import { changePrimary_MultistateBoxState, changeReports_MultistateBoxState } from './appFunctions.js';
import wixData from 'wix-data';

// THIS FILE WILL CONTAIN ALL REPORT RELATED FUNCTIONS THAT WILL BE USED IN THE APP
// THIS WILL HELP WITH FUNCTIONS INSIDE THE REPORT PAGES TO CALL THESE FUNCTIONS FROM HERE RATHER THAN REWRITING THE SAME FUNCTION IN MULTIPLE PAGES

// ADD REPORT RELATED FUNCTIONS BELOW

// GET REPORT IN-NOT-RECEIVED DATA REPORT FUNCTION
export async function InNotReceived_Report(dataset) {
    const reports_ResultsDataset = dataset;
    // Add your logic to fetch and display the In-Not-Received report data
    console.log("Fetching In-Not-Received report data...");
    // Example: await fetchDataAndDisplay('in-not-received-endpoint');
    // Results Query InNotReceived
    // Logic:
    // - For each referenceNumber, get the most recently added item (by _createdDate or updateDate)
    // - Only show references where the most recent item does NOT have status 'Inbound Received'
    try {
        console.log('Building InNotReceived filter...');

        // Get ALL items, sorted by newest first (most recently added)
        let query = wixData
            .query('DemoData')
            .ne('referenceNumber', '')
            .isNotEmpty('referenceNumber');

        // Sort by creation date descending (newest first), then by update date
        query = query.descending('_createdDate').descending('updateDate').descending('_updatedDate');

        const opts = { suppressAuth: true, suppressHooks: true };
        const pageSize = 1000;
        let results = await query.limit(pageSize).find(opts);

        // Map to store the most recent item per referenceNumber
        const mostRecentByRef = new Map();

        const processItems = (items) => {
            items.forEach(item => {
                const ref = item.referenceNumber?.trim();
                if (!ref) return;

                // Since items are sorted by newest first, the first occurrence 
                // per referenceNumber is the most recently added
                if (!mostRecentByRef.has(ref)) {
                    mostRecentByRef.set(ref, item);
                }
            });
        };

        // Process first batch
        processItems(results.items);

        // Process remaining batches if needed
        while (results.hasNext() && mostRecentByRef.size < pageSize) {
            results = await results.next();
            processItems(results.items);
        }

        // Filter out references where the most recent item has status 'Inbound Received'
        const validItems = Array.from(mostRecentByRef.values())
            .filter(item => item.status !== 'Inbound Received');

        console.log(`Found ${validItems.length} references where latest item is not 'Inbound Received'`);

        if (validItems.length === 0) {
            // No matching items, set filter that returns no results
            await reports_ResultsDataset.setFilter(
                wixData.filter().eq('_id', 'NO_MATCH_FOUND')
            );
            return;
        }

        // Build filter to show only these specific items
        const selectedIds = validItems.map(item => item._id).filter(Boolean);

        let idFilter = wixData.filter().eq('_id', selectedIds[0]);
        for (let i = 1; i < selectedIds.length; i++) {
            idFilter = idFilter.or(wixData.filter().eq('_id', selectedIds[i]));
        }

        // Apply the filter
        await reports_ResultsDataset.setFilter(idFilter);

        // Set sort order to show newest items first
        if (typeof reports_ResultsDataset.setSort === 'function') {
            await reports_ResultsDataset.setSort(
                wixData.sort().descending('_createdDate').descending('updateDate')
            );
        }

        console.log('InNotReceived filter applied successfully');

    } catch (error) {
        console.error('Error building InNotReceived results:', error);
        // Fallback: simple filter excluding 'Inbound Received'
        await reports_ResultsDataset.setFilter(
            wixData.filter()
                .ne('status', 'Inbound Received')
                .ne('referenceNumber', '')
                .isNotEmpty('referenceNumber')
        );
    }
}

// GET REPORT NOT DELIVERED DATA REPORT FUNCTION
export async function NotDelivered_Report(dataset) {
    const reports_ResultsDataset = dataset;
    // Add your logic to fetch and display the Not Delivered report data
    console.log("Fetching Not Delivered report data...");
    // Example: await fetchDataAndDisplay('not-delivered-endpoint');
    try {
        console.log('Building NotDelivered filter...');

        // Get ALL items, sorted by newest first (most recently added)
        let query = wixData
            .query('DemoData')
            .ne('referenceNumber', '')
            .isNotEmpty('referenceNumber');

        // Sort by creation date descending (newest first), then by update date
        query = query.descending('_createdDate').descending('updateDate').descending('_updatedDate');

        const opts = { suppressAuth: true, suppressHooks: true };
        const pageSize = 1000;
        let results = await query.limit(pageSize).find(opts);

        // Map to store the most recent item per referenceNumber
        const mostRecentByRef = new Map();

        const processItems = (items) => {
            items.forEach(item => {
                const ref = item.referenceNumber?.trim();
                if (!ref) return;

                // Since items are sorted by newest first, the first occurrence 
                // per referenceNumber is the most recently added
                if (!mostRecentByRef.has(ref)) {
                    mostRecentByRef.set(ref, item);
                }
            });
        };

        // Process first batch
        processItems(results.items);

        // Process remaining batches if needed
        while (results.hasNext() && mostRecentByRef.size < pageSize) {
            results = await results.next();
            processItems(results.items);
        }

        // Filter out references where the most recent item has status 'Delivered'
        const validItems = Array.from(mostRecentByRef.values())
            .filter(item => item.status !== 'Delivered');

        console.log(`Found ${validItems.length} references where latest item is not 'Delivered'`);

        if (validItems.length === 0) {
            // No matching items, set filter that returns no results
            await reports_ResultsDataset.setFilter(
                wixData.filter().eq('_id', 'NO_MATCH_FOUND')
            );
            return;
        }

        // Build filter to show only these specific items
        const selectedIds = validItems.map(item => item._id).filter(Boolean);

        let idFilter = wixData.filter().eq('_id', selectedIds[0]);
        for (let i = 1; i < selectedIds.length; i++) {
            idFilter = idFilter.or(wixData.filter().eq('_id', selectedIds[i]));
        }

        // Apply the filter
        await reports_ResultsDataset.setFilter(idFilter);

        // Set sort order to show newest items first
        if (typeof reports_ResultsDataset.setSort === 'function') {
            await reports_ResultsDataset.setSort(
                wixData.sort().descending('_createdDate').descending('updateDate')
            );
        }

        console.log('NotDelivered filter applied successfully');

    } catch (error) {
        console.error('Error building NotDelivered results:', error);
        // Fallback: simple filter excluding 'Delivered'
        await reports_ResultsDataset.setFilter(
            wixData.filter()
                .ne('status', 'Delivered')
                .ne('referenceNumber', '')
                .isNotEmpty('referenceNumber')
        );
    }
}

// GET ALL REPORT DATA FUNCTION
export async function all_Report(dataset) {
    const reports_ResultsDataset = dataset;
    // Add your logic to fetch and display all report data
    console.log("Fetching All report data...");
    // Example: await fetchDataAndDisplay('all-reports-endpoint');
    try {
        console.log('Building All Reports filter...');

        // Get ALL items, sorted by newest first (most recently added)
        let query = wixData
            .query('DemoData')
            .ne('referenceNumber', '')
            .isNotEmpty('referenceNumber');

        // Sort by creation date descending (newest first), then by update date
        query = query.descending('_createdDate').descending('updateDate').descending('_updatedDate');

        const opts = { suppressAuth: true, suppressHooks: true };
        const pageSize = 1000;
        let results = await query.limit(pageSize).find(opts);

        // Map to store the most recent item per referenceNumber
        const mostRecentByRef = new Map();

        const processItems = (items) => {
            items.forEach(item => {
                const ref = item.referenceNumber?.trim();
                if (!ref) return;

                // Since items are sorted by newest first, the first occurrence 
                // per referenceNumber is the most recently added
                if (!mostRecentByRef.has(ref)) {
                    mostRecentByRef.set(ref, item);
                }
            });
        };

        // Process first batch
        processItems(results.items);

        // Process remaining batches if needed
        while (results.hasNext() && mostRecentByRef.size < pageSize) {
            results = await results.next();
            processItems(results.items);
        }

        // Get all valid items (no status filtering for "All Reports")
        const validItems = Array.from(mostRecentByRef.values());

        console.log(`Found ${validItems.length} unique references with latest items`);

        if (validItems.length === 0) {
            // No matching items, set filter that returns no results
            await reports_ResultsDataset.setFilter(
                wixData.filter().eq('_id', 'NO_MATCH_FOUND')
            );
            return;
        }

        // Build filter to show only these specific items
        const selectedIds = validItems.map(item => item._id).filter(Boolean);

        let idFilter = wixData.filter().eq('_id', selectedIds[0]);
        for (let i = 1; i < selectedIds.length; i++) {
            idFilter = idFilter.or(wixData.filter().eq('_id', selectedIds[i]));
        }

        // Apply the filter
        await reports_ResultsDataset.setFilter(idFilter);

        // Set sort order to show newest items first
        if (typeof reports_ResultsDataset.setSort === 'function') {
            await reports_ResultsDataset.setSort(
                wixData.sort().descending('_createdDate').descending('updateDate')
            );
        }

        console.log('All Reports filter applied successfully');

    } catch (error) {
        console.error('Error building All Reports results:', error);
        // Fallback: simple filter with non-empty reference numbers
        await reports_ResultsDataset.setFilter(
            wixData.filter()
                .ne('referenceNumber', '')
                .isNotEmpty('referenceNumber')
        );
    }
}

// ADD MORE REPORT RELATED FUNCTIONS AS NEEDED  
