/**
 * Enhanced Browser Detection Script
 * Features:
 * - Comprehensive mini-browser detection
 * - Graceful error handling
 * - Responsive design for all devices
 * - Accessibility improvements
 * - Fallback mechanisms
 * - Updated: 2025-05-23 (Improved modal styling and accessibility)
 */
document.addEventListener("DOMContentLoaded", function() {
    // Configuration
    const config = {
        popupDelay: 500,        // Delay before showing popup (ms)
        browserTimeouts: {      // Timeouts for browser redirects (ms)
            primary: 500,
            secondary: 1000,
            fallback: 1500
        },
        debug: false            // Enable for console logging
    };

    /**
     * Detects if the user is in a mini-browser/webview environment
     * @returns {boolean} True if in mini-browser
     */
    function isInMiniBrowser() {
        try {
            const ua = navigator.userAgent.toLowerCase();
                        const isIOS = /iphone|ipad|ipod/.test(ua);
                        const isAndroid = /android/.test(ua);
                        // Known full browsers on iOS (not in-app)
                        const iOSFullBrowsers = [/crios/, /fxios/, /edgios/, /version\/\d+\.\d+.*safari/];
                        const isIOSFullBrowser = iOSFullBrowsers.some(r => r.test(ua));
                        // iOS WebView heuristic: contains AppleWebKit but not Safari token
                        const isIOSWebView = isIOS && /applewebkit/.test(ua) && !/safari/.test(ua);
                        // Android WebView heuristic: presence of wv or Version/ followed by Chrome
                        const isAndroidWebView = isAndroid && (ua.includes('wv') || /version\/\d+\.\d+.*chrome\/.*/.test(ua));
            
            // Common webview and in-app browser identifiers
            const webviewPatterns = [
                "wv",               // Android webview
                "fb",               // Facebook
                "instagram",        // Instagram
                "twitter",          // Twitter
                "snapchat",         // Snapchat
                "line",             // Line
                "wechat",           // WeChat
                "tiktok",           // TikTok
                "fbav",             // Facebook app
                "fban",             // Facebook app
                "linkedin",         // LinkedIn
                "pinterest",        // Pinterest
                "whatsapp",         // WhatsApp
                "telegram",         // Telegram
                "discord",          // Discord
                "viber"             // Viber
            ];
            
                        // Check for patterns indicating in-app browsers
                        const matchesAppPattern = webviewPatterns.some(pattern => ua.includes(pattern));

                        // Additional signal: referrer from known apps
                        const ref = (document.referrer || '').toLowerCase();
                        const appReferrers = [
                            'facebook.com', 'instagram.com', 't.co', 'twitter.com', 'snapchat.com',
                            'line.me', 'wechat.com', 'tiktok.com', 'lnkd.in', 'pinterest.com'
                        ];
                        const cameFromApp = appReferrers.some(d => ref.includes(d));

                        // Final decision
                        if (isIOS) {
                            // Treat iOS WebView or app patterns or app referrer as mini-browser
                            return (!isIOSFullBrowser) && (isIOSWebView || matchesAppPattern || cameFromApp);
                        }
                        if (isAndroid) {
                            return isAndroidWebView || matchesAppPattern || cameFromApp;
                        }
                        return matchesAppPattern || cameFromApp;
        } catch (error) {
            logError("Error detecting browser type", error);
            return false; // Default to not showing popup on error
        }
    }

    /**
     * Gets device type for tailored messaging
     * @returns {string} Device type identifier
     */
    function getDeviceType() {
        try {
            const ua = navigator.userAgent.toLowerCase();
            
            if (/iphone|ipad|ipod/i.test(ua)) return "ios";
            if (/android/i.test(ua)) return "android";
            if (/windows phone/i.test(ua)) return "windowsphone";
            if (/mac/i.test(ua)) return "mac";
            if (/windows/i.test(ua)) return "windows";
            if (/linux/i.test(ua)) return "linux";
            
            return "unknown";
        } catch (error) {
            logError("Error detecting device type", error);
            return "unknown";
        }
    }

    /**
     * Attempts to open the current page in a full browser
     */
    function openInBrowser() {
        try {
            const url = window.location.href;
            const deviceType = getDeviceType();
            const urlWithoutProtocol = url.replace(/^https?:\/\//, "");
            let opened = false;
            
            if (deviceType === "ios") {
                // iOS handling - mostly requires manual action
                showCopyMessage();
            } else if (deviceType === "android") {
                // Try multiple Android browsers with fallbacks
                try {
                    // Try Chrome first
                    window.location = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end;`;
                    
                    // Try Firefox as fallback
                    setTimeout(() => {
                        if (!opened) {
                            window.location = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=org.mozilla.firefox;end;`;
                        }
                    }, config.browserTimeouts.primary);
                    
                    // Try Edge as second fallback
                    setTimeout(() => {
                        if (!opened) {
                            window.location = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.microsoft.emmx;end;`;
                        }
                    }, config.browserTimeouts.secondary);
                    
                    // Last resort - attempt standard URL
                    setTimeout(() => {
                        if (!opened) {
                            window.location = url;
                        }
                    }, config.browserTimeouts.fallback);
                } catch (err) {
                    logError("Error redirecting on Android", err);
                    // Fallback to direct URL as last resort
                    window.location = url;
                }
            } else {
                // Generic handling for other platforms
                try {
                    // Try to open in new tab first
                    const newTab = window.open(url, '_blank');
                    
                    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                        // If that fails, try direct navigation
                        window.location.href = url;
                    } else {
                        opened = true;
                    }
                } catch (err) {
                    logError("Error opening new window", err);
                    // Last resort
                    window.location.href = url;
                }
            }
        } catch (error) {
            logError("Error in openInBrowser", error);
            showErrorMessage("Unable to open in browser. Please copy and paste the URL manually.");
        }
    }

    /**
     * Creates and shows the browser suggestion popup
     */
    function createPopup() {
        try {
            const deviceType = getDeviceType();
            
            // Create popup container with improved modal placement
            let popup = document.createElement("div");
            popup.id = "browserPopup";
            popup.setAttribute("role", "dialog");
            popup.setAttribute("aria-labelledby", "popupTitle");
            popup.setAttribute("aria-describedby", "popupDescription");
            
            // Nebula-themed modal placement CSS using Aurora palette accents
            popup.style = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(1200px 800px at 20% 10%, rgba(37, 99, 235, 0.12), transparent 60%),
                            radial-gradient(1000px 700px at 80% 90%, rgba(147, 51, 234, 0.12), transparent 60%),
                            rgba(10, 15, 25, 0.92);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                box-sizing: border-box;
            `;
            
            // Create popup content wrapper with improved styling
            let contentWrapper = document.createElement("div");
            contentWrapper.style = `
                width: 90%;
                max-width: 500px;
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95));
                padding: 24px;
                border-radius: 14px;
                box-shadow: 0 10px 30px rgba(2, 6, 23, 0.65), 0 0 30px rgba(59, 130, 246, 0.15);
                max-height: 90vh;
                overflow-y: auto;
                text-align: center;
                border: 1px solid rgba(59, 130, 246, 0.25);
                transform: translateY(-6px); /* Slight adjustment for visual balance */
            `;
            
                        // Create warning title with animated nebula-themed warning icon
                        let title = document.createElement("h2");
                        title.id = "popupTitle";
                        title.style = `
                                margin-top: 0;
                                margin-bottom: 20px;
                                font-size: 1.5rem;
                                color: #fbbf24; /* Amber warning color from Aurora */
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 12px;
                        `;
                        // Animated warning SVG icon (nebula style)
                        const warningIcon = document.createElement("span");
                        warningIcon.innerHTML = `
                                <svg class="nebula-warning-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                                    <defs>
                                        <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="60%">
                                            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
                                            <stop offset="80%" stop-color="#3b82f6" stop-opacity="0.25"/>
                                            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.12"/>
                                        </radialGradient>
                                    </defs>
                                    <circle cx="16" cy="16" r="15" fill="url(#nebulaGlow)" opacity="0.7">
                                        <animate attributeName="r" values="15;17;15" dur="2.2s" repeatCount="indefinite"/>
                                    </circle>
                                    <g>
                                        <polygon points="16,7 28,27 4,27" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
                                        <rect x="14.5" y="13" width="3" height="7.5" rx="1.2" fill="#fffbe6" stroke="#f59e0b" stroke-width="1.2">
                                            <animate attributeName="y" values="13;12.5;13" dur="1.2s" repeatCount="indefinite"/>
                                        </rect>
                                        <circle cx="16" cy="23.2" r="1.3" fill="#fffbe6" stroke="#f59e0b" stroke-width="1.2">
                                            <animate attributeName="r" values="1.3;1.7;1.3" dur="1.2s" repeatCount="indefinite"/>
                                        </circle>
                                    </g>
                                </svg>
                        `;
                        warningIcon.style.display = "inline-flex";
                        warningIcon.style.alignItems = "center";
                        warningIcon.style.justifyContent = "center";
                        warningIcon.style.animation = "nebulaPulse 2.2s infinite alternate cubic-bezier(0.68,-0.55,0.27,1.55)";
                        // Add keyframes for nebulaPulse
                        const styleSheet = document.createElement('style');
                        styleSheet.innerHTML = `
                                @keyframes nebulaPulse {
                                    0% { filter: drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 0px #3b82f6); }
                                    50% { filter: drop-shadow(0 0 18px #fbbf24) drop-shadow(0 0 12px #3b82f6); }
                                    100% { filter: drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 0px #3b82f6); }
                                }
                        `;
                        document.head.appendChild(styleSheet);
                        title.appendChild(warningIcon);
                        // Add text after icon
                        const titleText = document.createElement("span");
                        titleText.textContent = "Cloud Hotspot Experience";
                        title.appendChild(titleText);
            
            // Create description with improved visibility
            let description = document.createElement("p");
            description.id = "popupDescription";
            description.style = `
                margin-bottom: 20px;
                line-height: 1.6;
                font-size: 1.05rem;
                color: #e5e7eb; /* Light text on nebula background */
                background: rgba(255, 255, 255, 0.06);
                padding: 15px;
                border-radius: 8px;
                text-align: left;
            `;
            
            if (deviceType === "ios") {
                description.innerHTML = `
                    This page may not work correctly in your current browser. For the best experience, please:
                    <ol style="text-align: left; margin: 15px 0; padding-left: 20px; color: #e5e7eb;">
                        <li>Copy the link below</li>
                        <li>Open Safari</li>
                        <li>Paste and go to the link</li>
                    </ol>
                `;
            } else if (deviceType === "android") {
                description.innerHTML = `
                    This page may not work correctly in your current browser. For the best experience, please tap the button below to open in Chrome, Firefox, or another browser.
                `;
            } else {
                description.innerHTML = `
                    This page may not work correctly in your current browser. For the best experience, please tap the button below to open in your default browser.
                `;
            }
            
            // Create primary action button with improved styling
            let button = document.createElement("button");
            button.innerText = "Open in Browser";
            button.setAttribute("aria-label", "Open in full browser");
            button.style = `
                padding: 14px 24px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                font-size: 16px;
                font-weight: 700;
                border: 1px solid rgba(59, 130, 246, 0.6);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-bottom: 15px;
                width: 100%;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
            `;
            button.onmouseover = function() { this.style.filter = "brightness(1.08)"; };
            button.onmouseout = function() { this.style.filter = "brightness(1)"; };
            button.onclick = function() {
                try {
                    openInBrowser();
                } catch (error) {
                    logError("Error handling button click", error);
                    showErrorMessage("Unable to open in browser. Please try copying the link manually.");
                }
            };
            
            // Create copyable link with improved styling
            let copyLink = document.createElement("div");
            copyLink.style = `
                margin: 15px 0;
                padding: 12px;
                background: rgba(30, 41, 59, 0.9);
                color: #dbeafe;
                border-radius: 8px;
                word-break: break-all;
                font-size: 14px;
                cursor: pointer;
                border: 1px solid rgba(59, 130, 246, 0.35);
                text-align: left;
                position: relative;
            `;
            copyLink.innerHTML = `
                <span style="display: block; margin-bottom: 5px; font-size: 12px; color: #93c5fd;">
                    Tap to copy:
                </span>
                ${window.location.href}
                <span style="position: absolute; right: 10px; top: 10px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; 
                       padding: 3px 6px; border-radius: 6px; font-size: 11px; border: 1px solid rgba(59, 130, 246, 0.6);">COPY</span>
            `;
            copyLink.setAttribute("aria-label", "Copy link to clipboard");
            copyLink.setAttribute("role", "button");
            copyLink.setAttribute("tabindex", "0");
            
            // Handle copy functionality with fallbacks
            copyLink.onclick = function() {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(window.location.href)
                            .then(() => {
                                showCopySuccess();
                            })
                            .catch(error => {
                                logError("Clipboard API error", error);
                                fallbackCopy();
                            });
                    } else {
                        fallbackCopy();
                    }
                } catch (error) {
                    logError("Error copying to clipboard", error);
                    fallbackCopy();
                }
            };
            
            // Make copyLink keyboard accessible
            copyLink.onkeydown = function(e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.click();
                }
            };
            
            // Close button with enhanced styling
            let closeButton = document.createElement("button");
            closeButton.innerText = "Continue Anyway";
            closeButton.setAttribute("aria-label", "Dismiss notification and continue");
            closeButton.style = `
                margin-top: 15px;
                padding: 12px 20px;
                background: rgba(59, 130, 246, 0.08);
                color: #c7d2fe;
                font-size: 14px;
                border: 1px solid rgba(147, 51, 234, 0.35);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                width: 100%;
            `;
            closeButton.onmouseover = function() { 
                this.style.background = "rgba(147, 51, 234, 0.18)";
                this.style.color = "#ffffff";
            };
            closeButton.onmouseout = function() { 
                this.style.background = "rgba(59, 130, 246, 0.08)";
                this.style.color = "#c7d2fe";
            };
            closeButton.onclick = function() {
                try {
                    if (popup.parentNode) {
                        document.body.removeChild(popup);
                    }
                } catch (error) {
                    logError("Error closing popup", error);
                    // Force remove if error
                    if (document.getElementById("browserPopup")) {
                        document.getElementById("browserPopup").remove();
                    }
                }
            };
            
            // Add status message area for feedback
            let statusMessage = document.createElement("div");
            statusMessage.id = "statusMessage";
            statusMessage.style = `
                margin-top: 15px;
                padding: 0;
                height: 24px;
                font-size: 14px;
                color: #4ade80; /* Success green from Aurora tones */
                transition: all 0.3s;
                visibility: hidden;
            `;
            
            // Legal text with improved visibility
            let legalText = document.createElement("p");
            legalText.style = `
                margin-top: 20px;
                font-size: 12px;
                color: #93c5fd;
                line-height: 1.4;
            `;
            legalText.innerHTML = "We recommend using a standard browser for full functionality and security features.";
            
            // Assemble popup
            contentWrapper.appendChild(title);
            contentWrapper.appendChild(description);
            contentWrapper.appendChild(button);
            contentWrapper.appendChild(copyLink);
            contentWrapper.appendChild(statusMessage);
            contentWrapper.appendChild(closeButton);
            contentWrapper.appendChild(legalText);
            popup.appendChild(contentWrapper);
            
            // Add ESC key to close
            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape" && document.body.contains(popup)) {
                    try {
                        document.body.removeChild(popup);
                    } catch (error) {
                        logError("Error closing popup with ESC key", error);
                    }
                }
            });
            
            // Add to page
            document.body.appendChild(popup);
            
            // Ensure the popup is properly focused for accessibility
            button.focus();
            
        } catch (error) {
            logError("Error creating popup", error);
            // Don't show any popup if there was an error to prevent blocking the user
        }
    }
    
    /**
     * Shows a success message when link is copied
     */
    function showCopySuccess() {
        try {
            const statusMessage = document.getElementById("statusMessage");
            if (statusMessage) {
                statusMessage.innerText = "✓ Link copied successfully";
                statusMessage.style.color = "#4ade80"; // Success green
                statusMessage.style.visibility = "visible";
                
                setTimeout(() => {
                    statusMessage.style.visibility = "hidden";
                }, 3000);
            }
        } catch (error) {
            logError("Error showing copy success", error);
        }
    }
    
    /**
     * Shows a copy instructions message for iOS
     */
    function showCopyMessage() {
        try {
            const statusMessage = document.getElementById("statusMessage");
            if (statusMessage) {
                statusMessage.innerHTML = "Please copy the link above and open it in Safari";
                statusMessage.style.color = "#3b82f6"; // Info blue
                statusMessage.style.visibility = "visible";
                
                setTimeout(() => {
                    statusMessage.style.visibility = "hidden";
                }, 5000);
            }
        } catch (error) {
            logError("Error showing copy message", error);
        }
    }
    
    /**
     * Shows an error message in the popup
     * @param {string} message - Error message to display
     */
    function showErrorMessage(message) {
        try {
            const statusMessage = document.getElementById("statusMessage");
            if (statusMessage) {
                statusMessage.innerText = message || "An error occurred";
                statusMessage.style.color = "#ef4444"; // Error red
                statusMessage.style.visibility = "visible";
                
                setTimeout(() => {
                    statusMessage.style.visibility = "hidden";
                }, 5000);
            }
        } catch (error) {
            logError("Error showing error message", error);
            // Last resort - alert
            try {
                alert(message || "An error occurred. Please try copying the URL manually.");
            } catch (e) {
                // Silent failure if even alert fails
            }
        }
    }
    
    /**
     * Fallback copy method for browsers without clipboard API
     */
    function fallbackCopy() {
        try {
            // Create temporary input
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Try to copy
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                showCopySuccess();
            } else {
                showErrorMessage("Please manually select and copy the link");
            }
        } catch (error) {
            logError("Error in fallback copy", error);
            showErrorMessage("Please manually select and copy the link");
        }
    }
    
    /**
     * Logs errors to console in debug mode
     * @param {string} message - Error description
     * @param {Error} error - Error object
     */
    function logError(message, error) {
        if (config.debug) {
            console.error(`[Browser Detection]: ${message}`, error);
        }
    }
    
    // Main execution
    try {
        // Check if running in mini-browser
        if (isInMiniBrowser()) {
            // Slight delay to ensure DOM is fully loaded
            setTimeout(() => {
                createPopup();
            }, config.popupDelay);
        }
    } catch (error) {
        logError("Fatal error in browser detection", error);
        // Don't block user even if script fails
    }
});