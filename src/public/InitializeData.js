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
            wixData.sort().descending('updateDate').descending('_updatedDate').descending('_createdDate')
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
        }

        if (typeof onReferenceSelect === 'function') {
            await onReferenceSelect(ref);
        }
    });
    // Set up filter options for search filters
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

    searchByUserInput.options = [
        { label: 'Not available', value: '' },
    ];
    
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
        updateReferenceDisplay(selectedReferenceDisplay, referenceNumber);
    };

    bindOnChangeOnce(filterTypeDropdown, applySelectedFilters);
    bindOnChangeOnce(filterStatusDropdown, applySelectedFilters);
    bindOnChangeOnce(filterByUserDropdown, applySelectedFilters);

    

    bindOnRowSelectOnce(selectedReferenceTable, (event) => {
        const row = event?.rowData || {};
        const ref = normalizeValue(
            row.referenceNumber || row.referenceNumberDisplay || row.reference
        );
        updateReferenceDisplay(selectedReferenceDisplay, ref);
    });
    
    // Set up filter options for selected reference filters
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

    filterByUserDropdown.options = [
        { label: 'Not available', value: '' },
    ];
    
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
    const refNumber = referenceNumberInput?.value?.toString().trim() || '';

    if (refNumber) {
        // EDIT EXISTING REFERENCE
        await createDataset.setFilter(
            wixData.filter().eq('referenceNumber', refNumber)
        );
        await createDataset.refresh();
        if (createDataset.getTotalCount() > 0) {
            await createDataset.setCurrentItemIndex(0);
        }
    } else {
        // NEW REFERENCE
        await createDataset.clear();
        await createDataset.new();
    }


    // Set up filter options for create reference form
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

    addedByUserInput.options = [
        { label: 'Not available', value: '' },
    ];

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
        await createDataset.save();
        // Optionally, you can add code here to navigate away or show a success message 
    });
}

// END OF FILE src/public/InitializeData.js
