/**
 * Smooth scroll utility with header offset and focus management
 */

export function scrollToId(id: string, extraOffset: number = 8): void {
  try {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id "${id}" not found`);
      return;
    }

    // Get fixed header height if it exists
    const header = document.querySelector('header[class*="fixed"]') as HTMLElement;
    const headerHeight = header ? header.offsetHeight : 0;

    // Calculate scroll position with offsets
    const elementRect = element.getBoundingClientRect();
    const scrollTop = window.scrollY + elementRect.top - headerHeight - extraOffset;

    // Smooth scroll to position
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });

    // Focus first input after scroll animation
    setTimeout(() => {
      const firstInput = element.querySelector('input, select, textarea') as HTMLElement;
      if (firstInput && typeof firstInput.focus === 'function') {
        firstInput.focus();
      }
    }, 500); // Wait for scroll animation to complete
  } catch (error) {
    console.warn('Error scrolling to element:', error);
  }
}

/**
 * Alternative scroll function that uses element.scrollIntoView with better offset control
 */
export function scrollToElement(element: HTMLElement, extraOffset: number = 8): void {
  try {
    // Get fixed header height
    const header = document.querySelector('header[class*="fixed"]') as HTMLElement;
    const headerHeight = header ? header.offsetHeight : 0;
    
    const totalOffset = headerHeight + extraOffset;
    
    // Calculate the position manually for better control
    const elementRect = element.getBoundingClientRect();
    const scrollTop = window.scrollY + elementRect.top - totalOffset;

    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });

    // Focus first focusable element after scroll
    setTimeout(() => {
      const firstFocusable = element.querySelector(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable && typeof firstFocusable.focus === 'function') {
        firstFocusable.focus();
      }
    }, 500);
  } catch (error) {
    console.warn('Error scrolling to element:', error);
  }
}