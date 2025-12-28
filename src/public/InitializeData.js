// File: src/public/InitializeData.js
// Search and selection helpers used by Home.c1dmp.js

import wixData from 'wix-data';

function normalizeValue(value) {
    return typeof value === 'string' ? value.trim() : value || '';
}

function buildFilter({ searchValue, typeValue, statusValue, byUserValue, referenceNumber }) {
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
            wixData.sort().descending('_createdDate').descending('updateDate')
        );
    }
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
        await applyFilter(
            searchDataset,
            buildFilter({
                searchValue: searchInput?.value,
                typeValue: searchTypeInput?.value,
                statusValue: searchStatusInput?.value,
                byUserValue: searchByUserInput?.value,
            })
        );
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
            updateReferenceDisplay(null, ref);
        }

        if (typeof onReferenceSelect === 'function') {
            await onReferenceSelect(ref);
        }
    });

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
    const applySelectedFilters = async () => {
        const referenceNumber = currentReferenceNumber(selectedDataset);
        await applyFilter(
            selectedDataset,
            buildFilter({
                referenceNumber,
                typeValue: filterTypeDropdown?.value,
                statusValue: filterStatusDropdown?.value,
                byUserValue: filterByUserDropdown?.value,
            })
        );
        updateReferenceDisplay(selectedReferenceDisplay.text = referenceNumber.toString());
    };

    bindOnChangeOnce(filterTypeDropdown, applySelectedFilters);
    bindOnChangeOnce(filterStatusDropdown, applySelectedFilters);
    bindOnChangeOnce(filterByUserDropdown, applySelectedFilters);

    

    bindOnRowSelectOnce(selectedReferenceTable, (event) => {
        const row = event?.rowData || {};
        const ref = normalizeValue(
            row.referenceNumber || row.referenceNumberDisplay || row.reference
        );
        updateReferenceDisplay(selectedReferenceDisplay.text = ref.toString());
    });

    filterTypeDropdown.disable();
    filterStatusDropdown.disable();
    filterByUserDropdown.disable();
    await applySelectedFilters();
}
