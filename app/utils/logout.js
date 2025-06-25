import { persistor } from '@/app/store/store';
import { clearUser, clearAllData } from '@/app/store/slice/userSlice';
import { clearAllQuoteData } from '@/app/store/slice/quoteSlice';
import { clearAllMembersData } from '@/app/store/slice/membersSlice';
import { clearInvoice } from '@/app/store/slice/invoiceSlice';
import { clearSalesPersonData } from '@/app/store/slice/salesPersonData';
import { clearEnqueryData } from '@/app/store/slice/enquerySlice';
import { logoutHandler } from '@/lib/api';
import { handleAxiosError } from '@/lib/handleAxiosError';

/**
 * Comprehensive logout function that clears all application data
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} router - Next.js router for navigation
 * @param {boolean} clearPersistedData - Whether to clear persisted data (default: true)
 * @param {Object} queryClient - React Query client (optional)
 */
export const performLogout = async (dispatch, router, clearPersistedData = true, queryClient = null) => {
  try {

    await logoutHandler();

  } catch (error) {

    handleAxiosError(error);

  }

  // Clear all Redux state
  dispatch(clearUser());
  dispatch(clearAllQuoteData());
  dispatch(clearAllMembersData());
  dispatch(clearInvoice());
  dispatch(clearSalesPersonData());
  dispatch(clearEnqueryData());

  // Clear React Query cache if available
  if (queryClient) {
    try {
      queryClient.clear();
    } catch (error) {
      console.error('Failed to clear React Query cache:', error);
    }
  }

  // Clear persisted data if requested
  if (clearPersistedData) {
    try {
      await persistor.purge();
    } catch (error) {
      console.error('Failed to clear persisted data:', error);
    }
  }


  // Navigate to login page
  router.push('/auth/login');

};

/**
 * Quick logout function that only clears user data
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} router - Next.js router for navigation
 * @param {Object} queryClient - React Query client (optional)
 */
export const quickLogout = async (dispatch, router, queryClient = null) => {
  try {
    await logoutHandler();
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  dispatch(clearUser());

  // Clear React Query cache if available
  if (queryClient) {
    user
    try {
      queryClient.clear();
    } catch (error) {
      console.error('Failed to clear React Query cache:', error);
    }
  }

  router.push('/auth/login');
};

