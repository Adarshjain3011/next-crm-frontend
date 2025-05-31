'use client'

import toast from "react-hot-toast";

export const handleAxiosError = (error) => {
    // Fallback message
    let errorMessage = "Something went wrong!";
  
    // Axios error structure
    if (error.response) {
      // Server responded with a status code outside 2xx
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else {
        errorMessage = `Server Error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = "No response from server. Please check your network.";
    } else if (error.message) {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
  
  
    // You can replace this with toast or alert
    // alert(errorMessage); // or toast.error(errorMessage)

    toast.error(errorMessage);


  };
  