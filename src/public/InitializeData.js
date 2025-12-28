// File: src/public/InitializeData.js
// Search and selection helpers used by Home.c1dmp.js

import wixData from 'wix-data';

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

    // Set up reference number input handler to load existing data when reference number is entered
    // Use direct onChange to ensure it always works
    if (referenceNumberInput && typeof referenceNumberInput.onChange === 'function') {
        referenceNumberInput.onChange(async () => {
            try {
                const refNumber = referenceNumberInput?.value?.toString().trim() || '';
                
                if (refNumber) {
                    // EDIT EXISTING REFERENCE - check if reference exists
                    await createDataset.setFilter(
                        wixData.filter().eq('referenceNumber', refNumber)
                    );
                    await createDataset.refresh();
                    
                    if (createDataset.getTotalCount() > 0) {
                        // Reference exists - populate fields for editing
                        await createDataset.setCurrentItemIndex(0);
                        const currentItem = createDataset.getCurrentItem();
                        
                        if (currentItem) {
                            // Populate the form fields with existing data
                            if (referenceTypeInput && currentItem.referenceType) {
                                referenceTypeInput.value = currentItem.referenceType;
                                
                                // Disable type input if first entry was "Inbound Received"
                                // Check if this reference has any "Inbound Received" entries
                                const hasInboundReceived = currentItem.status === 'Inbound Received' || 
                                                         currentItem.referenceType !== '';
                                if (hasInboundReceived && referenceTypeInput.disable) {
                                    referenceTypeInput.disable();
                                }
                            }
                            
                            if (statusInput && currentItem.status) {
                                statusInput.value = currentItem.status;
                            }
                            if (addedByUserInput && currentItem.addedByUser) {
                                addedByUserInput.value = currentItem.addedByUser;
                            }
                        }
                    } else {
                        // Reference doesn't exist - set up for new entry
                        await createDataset.clear();
                        await createDataset.new();
                        await createDataset.setFieldValue('referenceNumber', refNumber);
                        
                        // Clear form fields and enable type input for new entry
                        if (referenceTypeInput) {
                            referenceTypeInput.value = '';
                            if (referenceTypeInput.enable) {
                                referenceTypeInput.enable();
                            }
                        }
                        if (statusInput) statusInput.value = '';
                        if (addedByUserInput) addedByUserInput.value = '';
                    }
                } else {
                    // No reference number - set up for new entry
                    await createDataset.clear();
                    await createDataset.new();
                    
                    // Clear form fields and enable type input
                    if (referenceTypeInput) {
                        referenceTypeInput.value = '';
                        if (referenceTypeInput.enable) {
                            referenceTypeInput.enable();
                        }
                    }
                    if (statusInput) statusInput.value = '';
                    if (addedByUserInput) addedByUserInput.value = '';
                }
            } catch (error) {
                console.error('Error in reference number onChange:', error);
            }
        });
    }

    // Initial setup - check if there's already a reference number
    const initialRefNumber = referenceNumberInput?.value?.toString().trim() || '';
    if (initialRefNumber) {
        try {
            await createDataset.setFilter(
                wixData.filter().eq('referenceNumber', initialRefNumber)
            );
            await createDataset.refresh();
            
            if (createDataset.getTotalCount() > 0) {
                await createDataset.setCurrentItemIndex(0);
                const currentItem = createDataset.getCurrentItem();
                
                if (currentItem) {
                    if (referenceTypeInput && currentItem.referenceType) {
                        referenceTypeInput.value = currentItem.referenceType;
                        
                        // Disable type input if reference already exists with data
                        const hasInboundReceived = currentItem.status === 'Inbound Received' || 
                                                 currentItem.referenceType !== '';
                        if (hasInboundReceived && referenceTypeInput.disable) {
                            referenceTypeInput.disable();
                        }
                    }
                    if (statusInput && currentItem.status) {
                        statusInput.value = currentItem.status;
                    }
                    if (addedByUserInput && currentItem.addedByUser) {
                        addedByUserInput.value = currentItem.addedByUser;
                    }
                }
            } else {
                await createDataset.clear();
                await createDataset.new();
                await createDataset.setFieldValue('referenceNumber', initialRefNumber);
                
                // Enable type input for new reference
                if (referenceTypeInput && referenceTypeInput.enable) {
                    referenceTypeInput.enable();
                }
            }
        } catch (error) {
            console.error('Error in initial setup:', error);
            await createDataset.clear();
            await createDataset.new();
        }
    } else {
        // NEW REFERENCE
        try {
            await createDataset.clear();
            await createDataset.new();
            
            // Enable type input for new reference
            if (referenceTypeInput && referenceTypeInput.enable) {
                referenceTypeInput.enable();
            }
        } catch (error) {
            console.error('Error setting up new reference:', error);
        }
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
        
        // Set userID to ABC123
        await createDataset.setFieldValue('addedByUser', 'ABC123');
        
        // Set update date to current timestamp
        await createDataset.setFieldValue('updateDate', currentDate);
        
        await createDataset.save();
        // Optionally, you can add code here to navigate away or show a success message 
    });
}

// END OF FILE src/public/InitializeData.js
