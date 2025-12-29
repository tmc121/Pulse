// File: src/public/InitializeData.js
// Search and selection helpers used by Home.c1dmp.js

import wixData from 'wix-data';
import { currentMember } from 'wix-members-frontend';

const SEARCH_PAGE_SIZE = 500;

function normalizeValue(value) {
    return typeof value === 'string' ? value.trim() : value || '';
}

function buildFilter({ searchValue = '', typeValue = '', statusValue = '', byUserValue = '', referenceNumber = '' } = {}) {
    let filter = wixData.filter();

    const ref = normalizeValue(referenceNumber);
    if (ref) {
        filter = filter.eq('referenceNumber', ref);
    }

    const search = normalizeValue(searchValue);
    if (search) {
        filter = filter.contains('referenceNumber', search);
    }

    const type = normalizeValue(typeValue);
    if (type) {
        filter = filter.eq('referenceType', type);
    }

    const status = normalizeValue(statusValue);
    if (status) {
        filter = filter.eq('status', status);
    }

    const byUser = normalizeValue(byUserValue);
    if (byUser) {
        filter = filter.eq('addedByUser', byUser);
    }

    return filter;
}

async function applyFilter(dataset, filter) {
    if (!dataset || typeof dataset.setFilter !== 'function') {
        return;
    }
    await dataset.setFilter(filter);
    if (typeof dataset.refresh === 'function') {
        await dataset.refresh();
    }
    if (typeof dataset.setSort === 'function') {
        await dataset.setSort(
            wixData.sort().descending('updateDate').descending('_updatedDate').descending('_createdDate')
        );
    }
}

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
    } catch (_e) {
        // Fallback if hasSome is unavailable
        let filter = wixData.filter().eq('_id', ids[0]);
        for (let i = 1; i < ids.length; i++) {
            filter = filter.or(wixData.filter().eq('_id', ids[i]));
        }
        await dataset.setFilter(filter);
    }

    if (typeof dataset.refresh === 'function') {
        await dataset.refresh();
    }

    if (typeof dataset.setSort === 'function') {
        await dataset.setSort(
            wixData.sort().descending('updateDate').descending('_updatedDate').descending('_createdDate')
        );
    }
}

async function fetchLatestByReference({ searchValue = '', typeValue = '', statusValue = '', byUserValue = '' } = {}) {
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .descending('updateDate')
        .descending('_updatedDate')
        .descending('_createdDate');

    const search = normalizeValue(searchValue);
    if (search) {
        query = query.contains('referenceNumber', search);
    }
    const type = normalizeValue(typeValue);
    if (type) {
        query = query.eq('referenceType', type);
    }
    const status = normalizeValue(statusValue);
    if (status) {
        query = query.eq('status', status);
    }
    const byUser = normalizeValue(byUserValue);
    if (byUser) {
        query = query.eq('addedByUser', byUser);
    }

    let results = await query.limit(SEARCH_PAGE_SIZE).find({ suppressAuth: true, suppressHooks: true });

    const seenRefs = new Set();
    const ids = [];

    const process = (items) => {
        for (const item of items) {
            const ref = normalizeValue(item.referenceNumber);
            if (!ref || seenRefs.has(ref)) {
                continue;
            }
            seenRefs.add(ref);
            if (item._id) {
                ids.push(item._id);
            }
        }
    };

    process(results.items || []);
    while (results.hasNext()) {
        results = await results.next();
        process(results.items || []);
    }

    return ids;
}

function bindOnChangeOnce(control, handler) {
    if (!control || typeof control.onChange !== 'function') {
        return;
    }
    if (control._initializeDataBound) {
        return;
    }
    control._initializeDataBound = true;
    control.onChange(handler);
}

function bindOnRowSelectOnce(table, handler) {
    if (!table || typeof table.onRowSelect !== 'function') {
        return;
    }
    if (table._initializeDataRowBound) {
        return;
    }
    table._initializeDataRowBound = true;
    table.onRowSelect(handler);
}

function currentReferenceNumber(dataset) {
    try {
        const item = dataset && typeof dataset.getCurrentItem === 'function'
            ? dataset.getCurrentItem()
            : null;
        const ref = item?.referenceNumber || item?.referenceNumberDisplay || item?.reference;
        return normalizeValue(ref);
    } catch (_e) {
        return '';
    }
}

function updateReferenceDisplay(referenceDisplay, referenceNumber) {
    if (!referenceDisplay || !('text' in referenceDisplay)) {
        return;
    }
    const refText = normalizeValue(referenceNumber);
    referenceDisplay.text = refText ? `Reference: ${refText}` : 'Reference: N/A';
}

async function getUserOptionByUserId(userId) {
    const cleanId = normalizeValue(userId);
    if (!cleanId) {
        return null;
    }

    try {
        const result = await wixData
            .query('UserAccounts')
            .eq('userId', cleanId)
            .find({ suppressAuth: true, suppressHooks: true });

        if (result.items && result.items.length > 0) {
            const acct = result.items[0];
            const label = `${normalizeValue(acct.firstName)} ${normalizeValue(acct.lastName)}`.trim() || cleanId;
            return { label, value: cleanId };
        }
    } catch (error) {
        console.error('Error fetching user account for addedByUser:', error);
    }

    return { label: cleanId, value: cleanId };
}

async function getCurrentUserAccountOption() {
    try {
        const member = await currentMember.getMember();
        const memberId = member?._id;
        if (!memberId) {
            return null;
        }

        const result = await wixData
            .query('UserAccounts')
            .eq('connectedMemberId', memberId)
            .find({ suppressAuth: true, suppressHooks: true });

        const account = result.items && result.items[0];
        if (account) {
            const label = `${normalizeValue(account.firstName)} ${normalizeValue(account.lastName)}`.trim() || account.userId || 'Account';
            const value = account.userId || '';
            if (value) {
                return { label, value };
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching current user account option:', error);
        return null;
    }
}

export async function initializeSearch(
    searchDataset,
    searchResultsTable,
    searchInput,
    searchTypeInput,
    searchStatusInput,
    searchByUserInput,
    selectedDataset,
    onReferenceSelect
) {
    const applySearchFilters = async () => {
        const ids = await fetchLatestByReference({
            searchValue: searchInput?.value,
            typeValue: searchTypeInput?.value,
            statusValue: searchStatusInput?.value,
            byUserValue: searchByUserInput?.value,
        });

        await applyIdsToDataset(searchDataset, ids);
    };

    bindOnChangeOnce(searchInput, applySearchFilters);
    bindOnChangeOnce(searchTypeInput, applySearchFilters);
    bindOnChangeOnce(searchStatusInput, applySearchFilters);
    bindOnChangeOnce(searchByUserInput, applySearchFilters);

    bindOnRowSelectOnce(searchResultsTable, async (event) => {
        const row = event?.rowData || {};
        const ref = normalizeValue(
            row.referenceNumber || row.referenceNumberDisplay || row.reference
        );

        if (ref && selectedDataset) {
            await applyFilter(
                selectedDataset,
                buildFilter({ referenceNumber: ref })
            );
        }

        if (typeof onReferenceSelect === 'function') {
            await onReferenceSelect(ref);
        }
    });
    // Set up filter options for search filters
    if (searchTypeInput && searchTypeInput.options !== undefined) {
        searchTypeInput.options = [
            { label: '-', value: '' },
            { label: 'USPS', value: 'USPS' },
            { label: 'USPS - FIRST CLASS', value: 'USPS - FIRST CLASS' },
            { label: 'USPS - EXPRESS', value: 'USPS - EXPRESS' },
            { label: 'FEDEX-E', value: 'FEDEX EXPRESS' },
            { label: 'FEDEX-G', value: 'FEDEX GROUND' },
            { label: 'DHL', value: 'DHL' },
            { label: 'UPS', value: 'UPS' },
            { label: 'UPS - GROUND', value: 'UPS - GROUND' },
            { label: 'UPS - AIR', value: 'UPS - AIR' },
            { label: 'AMAZON', value: 'AMAZON' },
            { label: 'STAPLES', value: 'STAPLES' },
            { label: 'OTHER', value: 'OTHER' },
        ];
    }

    if (searchStatusInput && searchStatusInput.options !== undefined) {
        searchStatusInput.options = [
            { label: '-', value: '' },
            { label: 'Inbound Received', value: 'Inbound Received' },
            { label: 'Inbound Department', value: 'Inbound Department' },
            { label: 'Inbound Associate', value: 'Inbound Associate' },
            { label: 'Inbound Service', value: 'Inbound Service' },
            { label: 'Hold Over Location', value: 'Hold Over Location' },
            { label: 'Late Received', value: 'Late Received' },
            { label: 'Delivery Attempt', value: 'Delivery Attempt' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Outbound Received', value: 'Outbound Received' },
            { label: 'Outbound Carrier', value: 'Outbound Carrier' },
            { label: 'Inventory', value: 'Marked Inventoried' },
            { label: 'Decisioning', value: 'Decisioning' },
            { label: 'Returned Inbound', value: 'Returned Inbound' },
        ];
    }

    if (searchByUserInput && searchByUserInput.options !== undefined) {
        searchByUserInput.options = [
            { label: 'Not available', value: '' },
        ];
    }
    
    await applySearchFilters();

}

export async function initializeSearchSelected(
    selectedDataset,
    selectedReferenceTable,
    selectedReferenceDisplay,
    filterTypeDropdown,
    filterStatusDropdown,
    filterByUserDropdown
) {
    let isSyncingSelected = false;

    const setDropdownValueAndDisable = (dropdown, value, fallbackLabel = '') => {
        if (!dropdown || dropdown.options === undefined) {
            return;
        }
        const cleanValue = normalizeValue(value);
        const options = dropdown.options || [];
        if (cleanValue && !options.some((opt) => opt.value === cleanValue)) {
            dropdown.options = [{ label: cleanValue || fallbackLabel || 'Not available', value: cleanValue }, ...options];
        }
        dropdown.value = cleanValue;
        if (typeof dropdown.disable === 'function') {
            dropdown.disable();
        }
    };

    const pickValue = (item, keys = []) => {
        for (const key of keys) {
            const val = normalizeValue(item?.[key]);
            if (val) {
                return val;
            }
        }
        return '';
    };

    const syncFiltersFromItem = (item) => {
        if (!item) {
            return;
        }
        const typeVal = pickValue(item, ['referenceType', 'referenceTypeDisplay', 'type', 'referenceTypeLabel']);
        const statusVal = pickValue(item, ['status', 'referenceStatus', 'statusDisplay', 'referenceStatusLabel']);
        const byUserVal = pickValue(item, ['addedByUser', 'byUser', 'userId', 'addedByUserId']);

        setDropdownValueAndDisable(filterTypeDropdown, typeVal, typeVal || 'Not available');
        setDropdownValueAndDisable(filterStatusDropdown, statusVal, statusVal || 'Not available');
        setDropdownValueAndDisable(filterByUserDropdown, byUserVal, byUserVal || 'Not available');
    };

    const applySelectedFilters = async (referenceOverride = undefined, itemOverride = undefined) => {
        if (isSyncingSelected) {
            return;
        }
        isSyncingSelected = true;
        const referenceNumber = referenceOverride !== undefined
            ? referenceOverride
            : currentReferenceNumber(selectedDataset);
        const currentItem = itemOverride
            || (selectedDataset && typeof selectedDataset.getCurrentItem === 'function'
                ? selectedDataset.getCurrentItem()
                : null);
        // Ensure dropdowns use the latest item values before filtering
        syncFiltersFromItem(currentItem);
        // apply filter based on current dropdown values or overrides
        await applyFilter(
            selectedDataset,
            buildFilter({
                referenceNumber,
                typeValue: filterTypeDropdown?.value,
                statusValue: filterStatusDropdown?.value,
                byUserValue: filterByUserDropdown?.value,
            })
        );
        // After filter/refresh, sync from the dataset's current item to ensure dropdowns reflect stored values
        const refreshedItem = selectedDataset && typeof selectedDataset.getCurrentItem === 'function'
            ? selectedDataset.getCurrentItem()
            : currentItem;
        syncFiltersFromItem(refreshedItem || currentItem);
        updateReferenceDisplay(selectedReferenceDisplay, referenceNumber);
        isSyncingSelected = false;
    };

    bindOnChangeOnce(filterTypeDropdown, applySelectedFilters);
    bindOnChangeOnce(filterStatusDropdown, applySelectedFilters);
    bindOnChangeOnce(filterByUserDropdown, applySelectedFilters);

    

    bindOnRowSelectOnce(selectedReferenceTable, async (event) => {
        const row = event?.rowData || {};
        const ref = normalizeValue(
            row.referenceNumber || row.referenceNumberDisplay || row.reference
        );
        syncFiltersFromItem(row);
        updateReferenceDisplay(selectedReferenceDisplay, ref);
        await applySelectedFilters(ref, row);
    });
    
    // Set up filter options for selected reference filters
    if (filterTypeDropdown && filterTypeDropdown.options !== undefined) {
        filterTypeDropdown.options = [
            { label: '-', value: '' },
            { label: 'USPS', value: 'USPS' },
            { label: 'USPS - FIRST CLASS', value: 'USPS - FIRST CLASS' },
            { label: 'USPS - EXPRESS', value: 'USPS - EXPRESS' },
            { label: 'FEDEX-E', value: 'FEDEX EXPRESS' },
            { label: 'FEDEX-G', value: 'FEDEX GROUND' },
            { label: 'DHL', value: 'DHL' },
            { label: 'UPS', value: 'UPS' },
            { label: 'UPS - GROUND', value: 'UPS - GROUND' },
            { label: 'UPS - AIR', value: 'UPS - AIR' },
            { label: 'AMAZON', value: 'AMAZON' },
            { label: 'STAPLES', value: 'STAPLES' },
            { label: 'OTHER', value: 'OTHER' },
        ];
    }

    if (filterStatusDropdown && filterStatusDropdown.options !== undefined) {
        filterStatusDropdown.options = [
            { label: '-', value: '' },
            { label: 'Inbound Received', value: 'Inbound Received' },
            { label: 'Inbound Department', value: 'Inbound Department' },
            { label: 'Inbound Associate', value: 'Inbound Associate' },
            { label: 'Inbound Service', value: 'Inbound Service' },
            { label: 'Hold Over Location', value: 'Hold Over Location' },
            { label: 'Late Received', value: 'Late Received' },
            { label: 'Delivery Attempt', value: 'Delivery Attempt' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Outbound Received', value: 'Outbound Received' },
            { label: 'Outbound Carrier', value: 'Outbound Carrier' },
            { label: 'Inventory', value: 'Marked Inventoried' },
            { label: 'Decisioning', value: 'Decisioning' },
            { label: 'Returned Inbound', value: 'Returned Inbound' },
        ];
    }

    if (filterByUserDropdown && filterByUserDropdown.options !== undefined) {
        filterByUserDropdown.options = [
            { label: 'Not available', value: '' },
        ];
    }
    
    await applySelectedFilters();

    // COPY THE TEXT OF THE SELECTED REFERENCE TO THE CLIPBOARD WHEN CLICKED
    // IF THERE IS A VALID REFERENCE NUMBER
    selectedReferenceDisplay.onClick(async () => {
        const refText = selectedReferenceDisplay?.text || '';
        const match = refText.match(/Reference:\s*(.*)/);
        const refNumber = match ? match[1] : '';
        if (refNumber) {
            try {
                await navigator.clipboard.writeText(refNumber);
                console.log(`Copied reference number to clipboard: ${refNumber}`);
            } catch (error) {
                console.error('Failed to copy reference number to clipboard:', error);
            }
        }
    });

    
}



// SET UP THE CREATE REFERENCE TO ADD NEW REFERENCE FUNCTIONALITY OR UPDATE EXISTING REFERENCE FUNCTIONALITY
// IF A REFERENCE NUMBER IS PASSED IN, IT WILL LOAD THAT REFERENCE FOR EDITING
// IF NO REFERENCE NUMBER IS PASSED IN, IT WILL SET UP THE FORM FOR A NEW REFERENCE
export async function setupCreateOrEditReference(
    createDataset,
    referenceNumberInput,
    referenceTypeInput,
    statusInput,
    addedByUserInput,
    submitButton
) {
    // Set up filter options for create reference form first
    if (referenceTypeInput && referenceTypeInput.options !== undefined) {
        referenceTypeInput.options = [
            { label: '-', value: '' },
            { label: 'USPS', value: 'USPS' },
            { label: 'USPS - FIRST CLASS', value: 'USPS - FIRST CLASS' },
            { label: 'USPS - EXPRESS', value: 'USPS - EXPRESS' },
            { label: 'FEDEX-E', value: 'FEDEX EXPRESS' },
            { label: 'FEDEX-G', value: 'FEDEX GROUND' },
            { label: 'DHL', value: 'DHL' },
            { label: 'UPS', value: 'UPS' },
            { label: 'UPS - GROUND', value: 'UPS - GROUND' },
            { label: 'UPS - AIR', value: 'UPS - AIR' },
            { label: 'AMAZON', value: 'AMAZON' },
            { label: 'STAPLES', value: 'STAPLES' },
            { label: 'OTHER', value: 'OTHER' },
        ];
    }

    if (statusInput && statusInput.options !== undefined) {
        statusInput.options = [
            { label: '-', value: '' },
            { label: 'Inbound Received', value: 'Inbound Received' },
            { label: 'Inbound Department', value: 'Inbound Department' },
            { label: 'Inbound Associate', value: 'Inbound Associate' },
            { label: 'Inbound Service', value: 'Inbound Service' },
            { label: 'Hold Over Location', value: 'Hold Over Location' },
            { label: 'Late Received', value: 'Late Received' },
            { label: 'Delivery Attempt', value: 'Delivery Attempt' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Outbound Received', value: 'Outbound Received' },
            { label: 'Outbound Carrier', value: 'Outbound Carrier' },
            { label: 'Inventory', value: 'Marked Inventoried' },
            { label: 'Decisioning', value: 'Decisioning' },
            { label: 'Returned Inbound', value: 'Returned Inbound' },
        ];
    }

    if (addedByUserInput && addedByUserInput.options !== undefined) {
        addedByUserInput.options = [
            { label: 'Not available', value: '' },
        ];
    }

    const populateFromExisting = async (refNumber) => {
        // Query DemoData for the latest matching reference entry
        const query = await wixData
            .query('DemoData')
            .eq('referenceNumber', refNumber)
            .descending('updateDate')
            .descending('_updatedDate')
            .descending('_createdDate')
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        const latest = query.items && query.items[0];
        if (!latest) {
            return false;
        }

        await createDataset.setFilter(wixData.filter().eq('_id', latest._id));
        await createDataset.refresh();
        const total = typeof createDataset.getTotalCount === 'function' ? createDataset.getTotalCount() : 0;
        if (total > 0 && typeof createDataset.setCurrentItemIndex === 'function') {
            await createDataset.setCurrentItemIndex(0);
        }

        const currentItem = typeof createDataset.getCurrentItem === 'function' ? createDataset.getCurrentItem() : latest;

        if (referenceTypeInput) {
            referenceTypeInput.value = currentItem?.referenceType || '';
            if (referenceTypeInput.disable) {
                referenceTypeInput.disable();
            }
        }

        if (statusInput) {
            statusInput.value = currentItem?.status || '';
            if (statusInput.enable) {
                statusInput.enable();
            }
        }

        if (addedByUserInput) {
            const userOption = await getUserOptionByUserId(currentItem?.addedByUser);
            if (userOption) {
                addedByUserInput.options = [userOption];
                addedByUserInput.value = userOption.value;
            } else {
                addedByUserInput.options = [{ label: 'Not available', value: '' }];
                addedByUserInput.value = '';
            }
            if (addedByUserInput.enable) {
                addedByUserInput.enable();
            }
        }

        return true;
    };

    const setupNewEntry = async (refNumber) => {
        await createDataset.clear();
        await createDataset.new();
        if (refNumber) {
            await createDataset.setFieldValue('referenceNumber', refNumber);
        }

        if (referenceTypeInput) {
            referenceTypeInput.value = '';
            if (referenceTypeInput.enable) {
                referenceTypeInput.enable();
            }
        }
        if (statusInput) {
            statusInput.value = '';
            if (statusInput.enable) {
                statusInput.enable();
            }
        }

        if (addedByUserInput) {
            const currentUserOption = await getCurrentUserAccountOption();
            if (currentUserOption) {
                addedByUserInput.options = [currentUserOption];
                addedByUserInput.value = currentUserOption.value;
            } else {
                addedByUserInput.options = [{ label: 'Not available', value: '' }];
                addedByUserInput.value = '';
            }
            if (addedByUserInput.enable) {
                addedByUserInput.enable();
            }
        }
    };

    // Set up reference number input handler to load existing data when reference number is entered
    // Use direct onChange to ensure it always works
    if (referenceNumberInput && typeof referenceNumberInput.onInput === 'function') {
        referenceNumberInput.onInput(async () => {
            try {
                const refNumber = referenceNumberInput?.value?.toString().trim() || '';

                if (refNumber) {
                    const found = await populateFromExisting(refNumber);
                    if (!found) {
                        await setupNewEntry(refNumber);
                    }
                } else {
                    await setupNewEntry('');
                }
            } catch (error) {
                console.error('Error in reference number onChange:', error);
            }
        });
    }

    // Initial setup - check if there's already a reference number
    const initialRefNumber = referenceNumberInput?.value?.toString().trim() || '';
    if (initialRefNumber) {
        const found = await populateFromExisting(initialRefNumber);
        if (!found) {
            await setupNewEntry(initialRefNumber);
        }
    } else {
        await setupNewEntry('');
    }

    //SET UP TYPE FILTER DROPDOWN
    referenceTypeInput.onChange( async () => {
        const typeValue = referenceTypeInput.value;
        if (typeValue) {
            await createDataset.setFieldValue('referenceType', typeValue);
        }
    });

    //SET UP STATUS FILTER DROPDOWN
    statusInput.onChange( async () => {
        const statusValue = statusInput.value;
        if (statusValue) {
            await createDataset.setFieldValue('status', statusValue);
        }
    });

    //SET UP ADDED BY USER FILTER DROPDOWN
    //WILL GET THE OF THE CURRENT USER LOGGED IN AND SET IT AS THE ADDED BY USER VALUE
    //EXAMPLE: ABC123 
    addedByUserInput.onChange( async () => {
        const byUserValue = addedByUserInput.value;
        if (byUserValue) {
            await createDataset.setFieldValue('addedByUser', byUserValue);
        }
    });

    //SET UP SUBMIT BUTTON FUNCTIONALITY
    submitButton.onClick( async () => {
        // Ensure all required fields are set in the dataset before saving
        const refNumber = referenceNumberInput?.value?.toString().trim() || '';
        const typeValue = referenceTypeInput?.value || '';
        const statusValue = statusInput?.value || '';
        const addedByUserValue = addedByUserInput?.value || '';
        const currentDate = new Date();
        
        if (refNumber) {
            await createDataset.setFieldValue('referenceNumber', refNumber);
        }
        
        if (typeValue) {
            await createDataset.setFieldValue('referenceType', typeValue);
        }
        
        if (statusValue) {
            await createDataset.setFieldValue('status', statusValue);
        }

        if (addedByUserValue) {
            await createDataset.setFieldValue('addedByUser', addedByUserValue);
        }
        
        // Set update date to current timestamp
        await createDataset.setFieldValue('updateDate', currentDate);
        
        await createDataset.save();
        // Optionally, you can add code here to navigate away or show a success message 
    });
}

// END OF FILE src/public/InitializeData.js
