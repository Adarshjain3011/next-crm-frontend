import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
    loading: false,
    error: null
}

const quoteSlice = createSlice({
    name: "quote",
    initialState,
    reducers: {
        setQuoteData: (state, action) => {
            state.data = action.payload;
            state.error = null;
        },
        updateVendorDataAtQuotes: (state, action) => {
            state.data = action.payload;
            state.error = null;
        },
        addNewQuote: (state, action) => {
            if (!state.data) {
                state.data = [action.payload];
            } else {
                state.data = [...state.data, action.payload];
            }
            state.error = null;
        },
        addNewVendor: (state, action) => {
            const { versionIndex, itemIndex, vendor } = action.payload;
            if (state.data && state.data[versionIndex]?.items[itemIndex]) {
                if (!state.data[versionIndex].items[itemIndex].vendors) {
                    state.data[versionIndex].items[itemIndex].vendors = [];
                }
                state.data[versionIndex].items[itemIndex].vendors.push(vendor);
            }
        },
        deleteVendor: (state, action) => {
            const { versionIndex, itemIndex, vendorId } = action.payload;
            if (state.data && state.data[versionIndex]?.items[itemIndex]?.vendors) {
                state.data[versionIndex].items[itemIndex].vendors =
                    state.data[versionIndex].items[itemIndex].vendors.filter(
                        vendor => vendor.vendorId !== vendorId
                    );
            }
        },

        updateRootFieldsAndItem: (state, action) => {
            const { rootFieldChanges, itemChanges, quoteId } = action.payload;

            if (state.data) {
                // Find the quote by ID
                const quoteIndex = state.data.findIndex(quote => quote._id === quoteId);
                if (quoteIndex === -1) {
                    return;
                }

                // Update root fields
                Object.keys(rootFieldChanges).forEach(field => {
                    state.data[quoteIndex][field] = rootFieldChanges[field];
                });

                // Process item changes
                itemChanges.forEach(change => {
                    const { index, type, data, changes } = change;

                    if (type === 'added') {
                        // Add new item
                        state.data[quoteIndex].items.push(data);
                    } else if (type === 'modified') {
                        // Modify existing item
                        if (state.data[quoteIndex].items[index]) {
                            Object.keys(changes).forEach(field => {
                                state.data[quoteIndex].items[index][field] = changes[field];
                            });
                        }
                    } else if (type === 'removed') {
                        // Remove item
                        state.data[quoteIndex].items.splice(index, 1);
                    }
                });
            }
        },

        clearAllQuoteData: (state, action) => {
            state.data = null;
            state.loading = false;
            state.error = null;

        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const {
    setQuoteData,
    updateVendorDataAtQuotes,
    addNewQuote,
    addNewVendor,
    deleteVendor,
    setLoading,
    setError,
    clearAllQuoteData,
    updateRootFieldsAndItem

} = quoteSlice.actions;

export default quoteSlice.reducer;

