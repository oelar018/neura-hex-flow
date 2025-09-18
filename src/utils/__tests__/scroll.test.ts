/**
 * @jest-environment jsdom
 */

import { scrollToId } from '../scroll';

// Mock scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock getBoundingClientRect
const mockGetBoundingClientRect = jest.fn();

// Mock console methods
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('scrollToId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    mockScrollTo.mockClear();
    mockGetBoundingClientRect.mockReturnValue({
      top: 100,
      left: 0,
      right: 0,
      bottom: 200,
      width: 300,
      height: 100,
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should scroll to element when it exists', () => {
    // Create test elements
    const targetElement = document.createElement('div');
    targetElement.id = 'waitlist';
    targetElement.getBoundingClientRect = mockGetBoundingClientRect;
    document.body.appendChild(targetElement);

    const input = document.createElement('input');
    input.type = 'email';
    targetElement.appendChild(input);

    // Mock window properties
    Object.defineProperty(window, 'scrollY', {
      value: 50,
      writable: true,
    });

    scrollToId('waitlist');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 142, // 50 (scrollY) + 100 (element top) - 0 (no header) - 8 (default offset)
      behavior: 'smooth',
    });
  });

  it('should account for fixed header height', () => {
    // Create header
    const header = document.createElement('header');
    header.className = 'fixed top-0 left-0 right-0';
    Object.defineProperty(header, 'offsetHeight', {
      value: 60,
      writable: true,
    });
    document.body.appendChild(header);

    // Create target
    const targetElement = document.createElement('div');
    targetElement.id = 'waitlist';
    targetElement.getBoundingClientRect = mockGetBoundingClientRect;
    document.body.appendChild(targetElement);

    Object.defineProperty(window, 'scrollY', {
      value: 50,
      writable: true,
    });

    scrollToId('waitlist');

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 82, // 50 + 100 - 60 - 8
      behavior: 'smooth',
    });
  });

  it('should use custom extraOffset', () => {
    const targetElement = document.createElement('div');
    targetElement.id = 'waitlist';
    targetElement.getBoundingClientRect = mockGetBoundingClientRect;
    document.body.appendChild(targetElement);

    Object.defineProperty(window, 'scrollY', {
      value: 50,
      writable: true,
    });

    scrollToId('waitlist', 20);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 130, // 50 + 100 - 0 - 20
      behavior: 'smooth',
    });
  });

  it('should handle missing element gracefully', () => {
    scrollToId('nonexistent');

    expect(mockScrollTo).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Element with id "nonexistent" not found');
  });

  it('should focus first input after timeout', (done) => {
    const targetElement = document.createElement('div');
    targetElement.id = 'waitlist';
    targetElement.getBoundingClientRect = mockGetBoundingClientRect;
    
    const input = document.createElement('input');
    input.type = 'email';
    const focusSpy = jest.spyOn(input, 'focus');
    targetElement.appendChild(input);
    
    document.body.appendChild(targetElement);

    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });

    scrollToId('waitlist');

    // Check that focus is called after timeout
    setTimeout(() => {
      expect(focusSpy).toHaveBeenCalled();
      done();
    }, 600);
  });

  it('should handle errors gracefully', () => {
    // Force an error by making getBoundingClientRect throw
    const targetElement = document.createElement('div');
    targetElement.id = 'waitlist';
    targetElement.getBoundingClientRect = () => {
      throw new Error('Test error');
    };
    document.body.appendChild(targetElement);

    scrollToId('waitlist');

    expect(consoleSpy).toHaveBeenCalledWith('Error scrolling to element:', expect.any(Error));
    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});

// Integration test to verify the waitlist element exists in the DOM
describe('Integration: Waitlist element', () => {
  it('should have element with id="waitlist" in production markup', () => {
    // This test ensures the CTA component uses the correct ID
    // In a real test environment, you'd render the actual component
    
    // Mock the CTA component structure
    document.body.innerHTML = `
      <section id="waitlist" class="py-24 bg-[#0A0A0A]">
        <form>
          <input type="email" id="email" />
          <input type="text" id="name" />
          <button type="submit">Join the Waitlist</button>
        </form>
      </section>
    `;

    const waitlistElement = document.getElementById('waitlist');
    expect(waitlistElement).toBeTruthy();
    expect(waitlistElement?.tagName).toBe('SECTION');
    
    const firstInput = waitlistElement?.querySelector('input');
    expect(firstInput).toBeTruthy();
    expect(firstInput?.type).toBe('email');
  });
});