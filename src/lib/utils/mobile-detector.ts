export function isMobileDevice(): boolean {
    // Check if window is available (for SSR compatibility)
    if (typeof window === 'undefined') return false;

    // Check user agent for mobile devices
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone'];

    // Check if any mobile keywords are in the user agent
    const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));

    // Check screen size (typical mobile breakpoint)
    const isSmallScreen = window.innerWidth <= 768;

    // Exclude iPads - they should be allowed
    const isIpad = userAgent.includes('ipad') || (userAgent.includes('macintosh') && 'ontouchend' in document);

    return (isMobileUserAgent || isSmallScreen) && !isIpad;
}

export function isTabletDevice(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('ipad') ||
        (userAgent.includes('android') && !userAgent.includes('mobile')) ||
        (userAgent.includes('macintosh') && 'ontouchend' in document);
} 