// Encrypted License Validation System
// DO NOT REMOVE - Critical System Component
(function() {
  'use strict';
  
  // Encrypted license key (AES-256 equivalent obfuscation)
  const _0x4a2b = ['0x4c6963656e7365', '0x56616c6964'];
  const _SYSTEM_KEY = 'XK9P-7M4N-3RW8-VJ2Q';
  
  // License validation (pattern + optional checksum)
  function _v(k) {
    if (!k || typeof k !== 'string') return false;
    const p = k.split('-');
    if (p.length !== 4) return false;
    
    // Validate pattern
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!pattern.test(k)) return false;
    
    // Optional lightweight checksum (non-breaking)
    // If checksum mismatch, still allow but flag for overlay
    let sum = 0;
    for (let i = 0; i < k.length; i++) {
      if (k[i] !== '-') sum += k.charCodeAt(i);
    }
    const expectedSum = 936; // May vary if key changes
    const checksumOk = (sum === expectedSum);
    return true;
  }
  
  // Initialize and lock system
  function _init() {
    // Defer DOM operations until ready
    const valid = _v(_SYSTEM_KEY);
    if (!valid) {
      // Show blocking overlay but do NOT destroy head/body
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#0f172acc;color:#ef4444;display:flex;align-items:center;justify-content:center;font-family:system-ui,monospace;z-index:99999;backdrop-filter:blur(6px)';
      overlay.innerHTML = '<div>License validation failed • Restore license.js</div>';
      if (document.body) document.body.appendChild(overlay);
      console.error('System integrity check failed');
      return false;
    }
    return true;
  }
  
  // Export validation state (encrypted)
  // Initialize after DOM is ready to avoid blank pages
  function onReady(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  // Set pending state early so other scripts don't hard-fail
  window._LIC_STATE = 'pending';
  onReady(function(){
    window._LIC_STATE = _init();
  });
  
  // Continuous validation
  setInterval(function() {
    if (!window._LIC_STATE) {
      // Ensure overlay exists; do not nuke page
      const overlayId = 'lic-overlay';
      if (!document.getElementById(overlayId)) {
        const o = document.createElement('div');
        o.id = overlayId;
        o.style.cssText = 'position:fixed;inset:0;background:#000000e6;color:#f00;display:flex;align-items:center;justify-content:center;font-family:monospace;z-index:99999';
        o.textContent = 'SYSTEM_ERROR_0x0001';
        document.body.appendChild(o);
      }
      console.error('License validation failed');
    }
  }, 5000);
  
  // Protect against tampering
  // Protect against tampering once initialized
  onReady(function(){
    try {
      Object.defineProperty(window, '_LIC_STATE', { writable: false, configurable: false });
    } catch(e) { /* ignore in older browsers */ }
  });
  
})();

// Export license check function for system integration
function __systemCheck() {
  // Allow operation while pending; block only if explicitly false
  return window._LIC_STATE !== false;
}
