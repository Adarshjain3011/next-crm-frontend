import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export const formatDateForInput = (date) => {
  if (!date) return "";

  const d = new Date(date); // parse string or use Date object
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};



export const flattenObject = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const preKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, preKey)); // recursively flatten nested object
    } else {
      acc[preKey] = value;
    }
    return acc;
  }, {});



export const formatDate = (dateString) => {


  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch {
    return 'Invalid date';
  }
}

