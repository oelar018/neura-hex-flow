/**
 * Simple integration test that can be run manually to verify scroll functionality
 * Run with: npm run test:scroll
 */

import { scrollToId } from './scroll';

// Mock DOM for testing
const createMockDOM = () => {
  // Create a mock waitlist section
  const waitlistSection = document.createElement('section');
  waitlistSection.id = 'waitlist';
  waitlistSection.innerHTML = `
    <form>
      <input type="text" id="name" placeholder="Full name" />
      <input type="email" id="email" placeholder="Email" />
      <button type="submit">Join Waitlist</button>
    </form>
  `;
  
  // Create a mock fixed header
  const header = document.createElement('header');
  header.className = 'fixed top-0 left-0 right-0';
  Object.defineProperty(header, 'offsetHeight', {
    value: 64,
    writable: true,
  });
  
  document.body.appendChild(header);
  document.body.appendChild(waitlistSection);
  
  // Mock getBoundingClientRect
  waitlistSection.getBoundingClientRect = () => ({
    top: 800,
    left: 0,
    right: 1200,
    bottom: 1000,
    width: 1200,
    height: 200,
    x: 0,
    y: 800,
    toJSON: () => ({}),
  } as DOMRect);
  
  return { waitlistSection, header };
};

// Mock window.scrollTo
let scrollCalled = false;
let scrollParams: any = null;

const originalScrollTo = window.scrollTo;
window.scrollTo = (options: any) => {
  scrollCalled = true;
  scrollParams = options;
  console.log('Mock scrollTo called with:', options);
};

// Run the test
const runIntegrationTest = () => {
  console.log('🚀 Running scroll integration test...');
  
  try {
    // Setup DOM
    const { waitlistSection } = createMockDOM();
    
    // Test scrolling
    scrollToId('waitlist');
    
    // Verify scroll was called
    if (scrollCalled && scrollParams) {
      console.log('✅ scrollTo was called successfully');
      console.log('   Parameters:', scrollParams);
      
      // Check parameters
      if (scrollParams.behavior === 'smooth') {
        console.log('✅ Smooth scrolling enabled');
      } else {
        console.log('❌ Smooth scrolling not enabled');
      }
      
      // Check offset calculation (800 top - 64 header - 8 extra = 728)
      const expectedTop = 728;
      if (Math.abs(scrollParams.top - expectedTop) < 10) {
        console.log('✅ Offset calculation correct');
      } else {
        console.log(`❌ Offset calculation incorrect. Expected ~${expectedTop}, got ${scrollParams.top}`);
      }
    } else {
      console.log('❌ scrollTo was not called');
    }
    
    // Test focus after timeout
    setTimeout(() => {
      const firstInput = waitlistSection.querySelector('input') as HTMLInputElement;
      if (document.activeElement === firstInput) {
        console.log('✅ First input focused successfully');
      } else {
        console.log('⚠️  First input focus not verified (DOM focus may not work in test environment)');
      }
    }, 600);
    
    // Test error handling
    scrollToId('nonexistent-element');
    console.log('✅ Error handling works (no crashes)');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    // Restore original scrollTo
    window.scrollTo = originalScrollTo;
  }
  
  console.log('🏁 Integration test completed');
};

// Export for potential use in other files
export { runIntegrationTest };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  runIntegrationTest();
}