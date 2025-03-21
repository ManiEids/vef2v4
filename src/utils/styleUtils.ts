// Utility functions for consistent styling

/**
 * Returns appropriate text color class based on background
 * @param bgClass Background class name (e.g. 'bg-white', 'bg-gray-800')
 * @returns Text color class for contrast
 */
export function getTextContrastClass(bgClass: string): string {
  // Dark backgrounds need light text
  const darkBackgrounds = [
    'bg-black', 'bg-gray-800', 'bg-gray-900', 'bg-gray-700',
    'bg-blue-800', 'bg-blue-900', 'bg-indigo-800', 'bg-indigo-900',
    'bg-purple-800', 'bg-purple-900', 'space-card'
  ];
  
  // Light backgrounds need dark text
  const lightBackgrounds = [
    'bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300',
    'bg-yellow-100', 'bg-yellow-200', 'bg-green-100'
  ];
  
  if (darkBackgrounds.some(bg => bgClass.includes(bg))) {
    return 'text-white';
  }
  
  if (lightBackgrounds.some(bg => bgClass.includes(bg))) {
    return 'text-gray-900';
  }
  
  // Default to dark text
  return 'text-gray-900';
}

/**
 * Combines class names and ensures text contrast
 */
export function combineClasses(baseClass: string, additionalClasses: string = ''): string {
  const combined = `${baseClass} ${additionalClasses}`;
  
  // If we have explicitly set text color in additional classes, don't override it
  if (additionalClasses.includes('text-')) {
    return combined;
  }
  
  return `${combined} ${getTextContrastClass(combined)}`;
}
