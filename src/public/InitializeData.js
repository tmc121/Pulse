// File: src/public/InitializeData.js
// Search and selection helpers used by Home.c1dmp.js

import wixData, { get } from 'wix-data';
import { currentMember } from 'wix-members-frontend';
import { getUserAccountByMemberId } from './UserAccounts-Auth';

const SEARCH_PAGE_SIZE = 500;

function normalizeValue(value) {
    return typeof value === 'string' ? value.trim() : value || '';
}

function itemTypeValue(item) {
    return normalizeValue(item?.type || item?.referenceType || item?.referenceTypeDisplay || item?.typeDisplay);
}

function itemByUserValue(item) {
    return normalizeValue(item?.byUser || item?.addedByUser || item?.userId || item?.addedByUserId);
}

function itemSortDateValue(item) {
    return item?.createdAt || item?.updateDate || item?._updatedDate || item?._createdDate || 0;
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
        filter = filter.and(
            wixData.filter().eq('type', type).or(wixData.filter().eq('referenceType', type))
        );
    }

    const status = normalizeValue(statusValue);
    if (status) {
        filter = filter.eq('status', status);
    }

    const byUser = normalizeValue(byUserValue);
    if (byUser) {
        filter = filter.and(
            wixData.filter().eq('byUser', byUser).or(wixData.filter().eq('addedByUser', byUser))
        );
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
            wixData.sort().descending('createdAt').descending('updateDate').descending('_updatedDate').descending('_createdDate')
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
            wixData.sort().descending('createdAt').descending('updateDate').descending('_updatedDate').descending('_createdDate')
        );
    }
}

async function fetchLatestByReference({ searchValue = '', typeValue = '', statusValue = '', byUserValue = '' } = {}) {
    let query = wixData
        .query('DemoData')
        .ne('referenceNumber', '')
        .isNotEmpty('referenceNumber')
        .descending('createdAt')
        .descending('updateDate')
        .descending('_updatedDate')
        .descending('_createdDate');

    const search = normalizeValue(searchValue);
    if (search) {
        query = query.contains('referenceNumber', search);
    }
    const status = normalizeValue(statusValue);
    if (status) {
        query = query.eq('status', status);
    }

    const type = normalizeValue(typeValue);
    const byUser = normalizeValue(byUserValue);

    let results = await query.limit(SEARCH_PAGE_SIZE).find({ suppressAuth: true, suppressHooks: true });

    const seenRefs = new Set();
    const latestItems = [];

    const process = (items) => {
        for (const item of items) {
            const ref = normalizeValue(item.referenceNumber);
            if (!ref || seenRefs.has(ref)) {
                continue;
            }
            seenRefs.add(ref);
            latestItems.push(item);
        }
    };

    process(results.items || []);
    while (results.hasNext()) {
        results = await results.next();
        process(results.items || []);
    }

    const filteredItems = latestItems.filter((item) => {
        if (type && itemTypeValue(item) !== type) {
            return false;
        }
        if (byUser && itemByUserValue(item) !== byUser) {
            return false;
        }
        return true;
    });

    return filteredItems.map((item) => item._id).filter(Boolean);
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

function uniqueOptions(options = []) {
    const seen = new Set();
    const out = [];
    for (const option of options) {
        const value = normalizeValue(option?.value);
        if (!value || seen.has(value)) {
            continue;
        }
        seen.add(value);
        out.push({ label: normalizeValue(option?.label) || value, value });
    }
    return out;
}

async function getAllUserAccountOptions() {
    try {
        const result = await wixData
            .query('UserAccounts')
            .limit(1000)
            .find({ suppressAuth: true, suppressHooks: true });

        const options = (result.items || []).map((acct) => {
            const userId = normalizeValue(acct?.userId || acct?.userid || '');
            const fullName = `${normalizeValue(acct?.firstName)} ${normalizeValue(acct?.lastName)}`.trim();
            if (!userId) {
                return null;
            }
            const label = fullName ? `${fullName} (${userId})` : userId;
            return { label, value: userId };
        }).filter((option) => option !== null);

        options.sort((a, b) => a.label.localeCompare(b.label));
        return uniqueOptions(options);
    } catch (error) {
        console.error('Error loading UserAccounts options:', error);
        return [];
    }
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

async function getUserAccountSummaryByUserId(userId) {
    const cleanId = normalizeValue(userId);
    if (!cleanId) {
        return null;
    }

    try {
        const result = await wixData
            .query('UserAccounts')
            .eq('userId', cleanId)
            .limit(1)
            .find({ suppressAuth: true, suppressHooks: true });

        const account = result.items?.[0] || null;
        if (!account) {
            return null;
        }

        const firstName = normalizeValue(account.firstName);
        const lastName = normalizeValue(account.lastName);
        const fullName = `${firstName} ${lastName}`.trim();

        return {
            userId: cleanId,
            fullName: fullName || cleanId,
            account,
        };
    } catch (error) {
        console.error('Error fetching user account summary by userId:', error);
        return null;
    }
}

async function getCurrentUserAccountOption() {
    try {
        const member = await currentMember.getMember();
        const memberId = member?._id;
        if (!memberId) {
            return null;
        }

        const wrapper = await getUserAccountByMemberId(memberId);
        const account = wrapper?.account || null;
        if (account) {
            const value = normalizeValue(account.userId || account.userid || '');
            const label = `${normalizeValue(account.firstName)} ${normalizeValue(account.lastName)}`.trim() || value || 'Account';
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
    let latestSearchRun = 0;
    const userOptions = await getAllUserAccountOptions();

    const applySearchFilters = async () => {
        const runId = ++latestSearchRun;
        const ids = await fetchLatestByReference({
            searchValue: searchInput?.value,
            typeValue: searchTypeInput?.value,
            statusValue: searchStatusInput?.value,
            byUserValue: searchByUserInput?.value,
        });

        if (runId !== latestSearchRun) {
            return;
        }
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
            { label: '-', value: '' },
            ...userOptions,
        ];
    }
    
    await applySearchFilters();

    return applySearchFilters;

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
    const userOptions = await getAllUserAccountOptions();

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
    
    const ensureOption = (opts, value, label) => {
        const list = opts || [];
        const cleanVal = normalizeValue(value);
        if (!cleanVal) {
            return list;
        }
        const exists = list.some((o) => normalizeValue(o.value) === cleanVal);
        if (exists) {
            return list;
        }
        return [{ label: label || cleanVal, value: cleanVal }, ...list];
    };

    // Set up filter options for selected reference filters, preserving the current selected values
    if (filterTypeDropdown && filterTypeDropdown.options !== undefined) {
        const current = filterTypeDropdown.value;
        let typeOptions = [
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
        typeOptions = ensureOption(typeOptions, current, current);
        filterTypeDropdown.options = typeOptions;
        if (current) {
            filterTypeDropdown.value = current;
        }
    }

    if (filterStatusDropdown && filterStatusDropdown.options !== undefined) {
        const current = filterStatusDropdown.value;
        let statusOptions = [
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
        statusOptions = ensureOption(statusOptions, current, current);
        filterStatusDropdown.options = statusOptions;
        if (current) {
            filterStatusDropdown.value = current;
        }
    }

    if (filterByUserDropdown && filterByUserDropdown.options !== undefined) {
        const current = filterByUserDropdown.value;
        let byUserOptions = [
            { label: '-', value: '' },
            ...userOptions,
        ];
        byUserOptions = ensureOption(byUserOptions, current, current);
        filterByUserDropdown.options = byUserOptions;
        if (current) {
            filterByUserDropdown.value = current;
        }
    }
    
    await applySelectedFilters();


    
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
    if (!submitButton || typeof submitButton.onClick !== 'function') {
        console.warn('Create reference submit button missing; skipping setup');
        return;
    }

    let editingExistingRecordId = null;

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

    const baseByUserOptions = await getAllUserAccountOptions();

    const setAddedByUserOptions = (value = '') => {
        if (!addedByUserInput || addedByUserInput.options === undefined) {
            return;
        }
        const cleanValue = normalizeValue(value);
        // Run dedup only on the real user list; add blank placeholder separately
        // because uniqueOptions filters out empty-value entries.
        const deduped = uniqueOptions(baseByUserOptions);

        if (cleanValue && !deduped.some((opt) => normalizeValue(opt.value) === cleanValue)) {
            deduped.unshift({ label: cleanValue, value: cleanValue });
        }

        addedByUserInput.options = [{ label: '-', value: '' }, ...deduped];
        addedByUserInput.value = cleanValue;
    };

    if (addedByUserInput && addedByUserInput.options !== undefined) {
        setAddedByUserOptions('');
    }

    const getControlValue = (control) => normalizeValue(control?.value);
    const bindInputOnce = (control, key, handler) => {
        if (!control || typeof control.onInput !== 'function') {
            return;
        }
        const flag = `_createRefInputBound_${key}`;
        if (control[flag]) {
            return;
        }
        control[flag] = true;
        control.onInput(handler);
    };
    const bindChangeOnce = (control, key, handler) => {
        if (!control || typeof control.onChange !== 'function') {
            return;
        }
        const flag = `_createRefChangeBound_${key}`;
        if (control[flag]) {
            return;
        }
        control[flag] = true;
        control.onChange(handler);
    };
    const updateSubmitButtonState = async () => {
        if (!submitButton) {
            return;
        }

        const hasRef = !!getControlValue(referenceNumberInput);
        const hasType = !!getControlValue(referenceTypeInput);
        const hasStatus = !!getControlValue(statusInput);
        const hasByUser = !!getControlValue(addedByUserInput);
        const canSubmit = hasRef && hasType && hasStatus && hasByUser;

        if (canSubmit) {
            if (typeof submitButton.enable === 'function') {
                submitButton.enable();
            }
        } else if (typeof submitButton.disable === 'function') {
            submitButton.disable();
        }
    };

    if (submitButton && typeof submitButton.disable === 'function') {
        submitButton.disable();
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
            editingExistingRecordId = null;
            return false;
        }

        editingExistingRecordId = latest._id || null;
        const currentItem = latest;

        if (referenceNumberInput) {
            referenceNumberInput.value = currentItem?.referenceNumber || refNumber || '';
            if (typeof referenceNumberInput.disable === 'function') {
                referenceNumberInput.disable();
            }
        }

        if (referenceTypeInput) {
            referenceTypeInput.value = currentItem?.type || currentItem?.referenceType || '';
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
            const userOption = await getUserOptionByUserId(currentItem?.byUser || currentItem?.addedByUser);
            if (userOption) {
                setAddedByUserOptions(userOption.value);
            } else {
                setAddedByUserOptions('');
            }
            if (addedByUserInput.enable) {
                addedByUserInput.enable();
            }
        }

        return true;
    };

    const setupNewEntry = async (refNumber) => {
        editingExistingRecordId = null;
        const currentUserOption = addedByUserInput
            ? await getCurrentUserAccountOption()
            : null;

        if (referenceNumberInput) {
            referenceNumberInput.value = refNumber || '';
            if (typeof referenceNumberInput.enable === 'function') {
                referenceNumberInput.enable();
            }
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
            if (currentUserOption) {
                setAddedByUserOptions(currentUserOption.value);
                // Disable so the field stays locked to the logged-in user for new entries.
                if (typeof addedByUserInput.disable === 'function') {
                    addedByUserInput.disable();
                }
            } else {
                setAddedByUserOptions('');
                if (typeof addedByUserInput.enable === 'function') {
                    addedByUserInput.enable();
                }
            }
        }

        await updateSubmitButtonState();
    };

    // Set up reference number input handler to load existing data when reference number is entered
    // Use direct onChange to ensure it always works
    bindInputOnce(referenceNumberInput, 'referenceNumber', async () => {
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

                await updateSubmitButtonState();
            } catch (error) {
                console.error('Error in reference number onChange:', error);
            }
        });

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
    bindChangeOnce(referenceTypeInput, 'referenceType', async () => {
            await updateSubmitButtonState();
        });

    //SET UP STATUS FILTER DROPDOWN
    bindChangeOnce(statusInput, 'status', async () => {
            await updateSubmitButtonState();
        });

    //SET UP ADDED BY USER FILTER DROPDOWN
    //WILL GET THE OF THE CURRENT USER LOGGED IN AND SET IT AS THE ADDED BY USER VALUE
    //EXAMPLE: ABC123 
    bindChangeOnce(addedByUserInput, 'byUser', async () => {
            await updateSubmitButtonState();
        });

    await updateSubmitButtonState();

    //SET UP SUBMIT BUTTON FUNCTIONALITY
    if (submitButton && typeof submitButton.onClick === 'function') {
        submitButton.onClick(async () => {
            const refNumber = referenceNumberInput?.value?.toString().trim() || '';
            const typeValue = referenceTypeInput?.value || '';
            const statusValue = statusInput?.value || '';
            const createdAt = new Date();
            const savePayload = {
                referenceNumber: refNumber,
                type: typeValue,
                status: statusValue,
                createdAt,
            };

            const byUserValue = normalizeValue(addedByUserInput?.value);
            if (byUserValue) {
                savePayload.byUser = byUserValue;

                const byUserSummary = await getUserAccountSummaryByUserId(byUserValue);
                if (byUserSummary?.fullName) {
                    savePayload.createdBy = byUserSummary.fullName;
                }
            }

            // Mirror legacy fields until the rest of the app is fully migrated.
            savePayload.referenceType = typeValue;
            savePayload.addedByUser = byUserValue;
            savePayload.createdByName = savePayload.createdBy || '';
            savePayload.updateDate = createdAt;

            if (editingExistingRecordId) {
                await wixData.update('DemoData', { _id: editingExistingRecordId, ...savePayload }, { suppressAuth: true, suppressHooks: true });
            } else {
                await wixData.insert('DemoData', savePayload, { suppressAuth: true, suppressHooks: true });
            }

            // Refresh local mode after save to keep write-only dynamic dataset out of read operations.
            await setupNewEntry('');
        });
    }
}

// THIS CODE WILL INSERT A NEW ITEM INTO THE DEMODATA COLLECTION USING ELEMENTS FROM THE CREATE REFERENCE FORM
// THE FUNCTION WILL BE CALLED WHEN THE USER CLICKS THE SUBMIT BUTTON ON THE CREATE REFERENCE FORM
// THE FUNCTION WILL GATHER THE DATA FROM THE FORM INPUTS AND INSERT A NEW ITEM INTO THE COLLECTION
// AFTER INSERTING THE ITEM, IT WILL CLEAR THE FORM INPUTS FOR A NEW ENTRY
// THE FUNCTION WILL ALSO HANDLE ANY ERRORS THAT MAY OCCUR DURING THE INSERTION PROCESS
// THE FUNCTION WILL ALSO VALIDATE THE INPUTS TO ENSURE REQUIRED FIELDS ARE FILLED OUT
// THE FUNCTION WILL ALSO PROVIDE FEEDBACK TO THE USER ABOUT THE SUCCESS OR FAILURE OF THE OPERATION
// THE FUNCTION WILL ALSO LOG THE OPERATION DETAILS FOR AUDIT PURPOSES 
export async function insertNewDemoDataItem(
    referenceNumberInput,
    referenceTypeInput,
    statusInput,
    addedByUserInput,
    submitButton,
    createDataset
) {

    const loggedInMember = await currentMember.getMember();
    if (!loggedInMember) {
        console.error('No logged in member found. Cannot insert new DemoData item.');
        return;
    }
    const accountResult = await getUserAccountByMemberId(await loggedInMember._id);
    const userAccount = accountResult?.account || null;
    if (!userAccount) {
        console.error('No user account found for the logged in member. Cannot insert new DemoData item.');
        return;
    }

    const userAccount_Name = `${userAccount.firstName || ''} ${userAccount.lastName || ''}`.trim();
    const userAccount_UserId = userAccount.userId || '';
    
    addedByUserInput.options = [{ label: userAccount_Name || 'Not available', value: userAccount_UserId || '' }];
    addedByUserInput.value = userAccount_UserId || '';
    let toInsert = {};

    if (referenceNumberInput) {
        toInsert.referenceNumber = referenceNumberInput.value || '';
    }
    if (referenceTypeInput) {
        toInsert.type = referenceTypeInput.value || '';
        toInsert.referenceType = referenceTypeInput.value || '';
    }
    if (statusInput) {
        toInsert.status = statusInput.value || '';
    }
    if (addedByUserInput) {
        toInsert.byUser = addedByUserInput.value || '';
        toInsert.addedByUser = addedByUserInput.value || '';
        toInsert.createdBy = userAccount_Name || '';
        toInsert.createdByName = userAccount_Name || '';
    }

    // Set the Created date to current timestamp
    toInsert.createdAt = new Date(); // Format date as (2025-12-28T08:50:19.353Z);
    toInsert.updateDate = toInsert.createdAt;

    try {
        const result = await wixData.insert('DemoData', toInsert, { suppressAuth: true, suppressHooks: true });
        console.log('New DemoData item inserted with ID:', result._id);

        // Clear form inputs after successful insertion
        if (referenceNumberInput) {
            referenceNumberInput.value = '';
        }
        if (referenceTypeInput) {
            referenceTypeInput.value = '';
        }
        if (statusInput) {
            statusInput.value = '';
        }
        if (addedByUserInput) {
            addedByUserInput.value = '';
        }

    } catch (error) {
        console.error('Error inserting new DemoData item:', error);
    }   
}   
// END OF FILE src/public/InitializeData.js
