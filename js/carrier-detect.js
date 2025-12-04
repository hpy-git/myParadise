/**
 * Philippine Mobile Network Carrier Detection
 * Based on well-known mobile number prefixes used by major carriers in the Philippines
 * @author HPY
 * @date 2025
 */

// Philippine Mobile Network Carrier Prefix Database
const CARRIER_PREFIXES = {
    // Globe Telecom and TM
    'Globe': [
        '0905', '0906', '0915', '0916', '0917', '0926', '0927', '0935', '0936', '0937',
        '0945', '0952', '0953', '0954', '0955', '0956', '0957', '0965', '0966', '0967', '0975', '0976',
        '0977', '0978', '0979', '0995', '0996', '0997', '0958', '0959', '0817', '0818',
    ],
    
    // Smart Communications, TNT, and Sun Cellular
    'Smart': [
        '0907', '0908', '0909', '0910', '0911', '0912', '0913', '0914', '0918', '0919',
        '0920', '0921', '0928', '0929', '0930', '0938', '0939', '0940', '0946', '0947',
        '0948', '0949', '0950', '0951', '0960', '0961', '0962', '0963', '0964', '0968',
        '0969', '0970', '0980', '0981', '0982', '0983', '0984', '0985', '0986', '0989',
        '0992', '0993', '0994', '0998', '0999'
    ],
    
    // DITO Telecommunity
    'DITO': [
        '0895', '0896', '0897', '0898', '0991', '0992', '0993', '0994'  
    ],
    
    // Cherry Mobile (GOMO - operates on Globe network but separate brand)
    'GOMO': [
        '0976' // May share with Globe
    ]
};

/**
 * Detect the mobile network carrier from a Philippine phone number
 * @param {string} phoneNumber - The phone number to check (09XX or +639XX format)
 * @returns {string|null} - The carrier name or null if not detected
 */
function detectCarrier(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Clean the phone number - remove spaces, dashes, and other non-numeric characters
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Convert +639XX format to 09XX format
    if (cleanNumber.startsWith('+639')) {
        cleanNumber = '0' + cleanNumber.substring(3);
    } else if (cleanNumber.startsWith('639')) {
        cleanNumber = '0' + cleanNumber.substring(2);
    }
    
    // Validate it's a Philippine mobile number (should start with 09)
    if (!cleanNumber.startsWith('09') || cleanNumber.length !== 11) {
        return null;
    }
    
    // Extract the first 4 digits (prefix)
    const prefix = cleanNumber.substring(0, 4);
    
    // Check against each carrier's prefix list
    for (const [carrier, prefixes] of Object.entries(CARRIER_PREFIXES)) {
        if (prefixes.includes(prefix)) {
            return carrier;
        }
    }
    
    // If no carrier found, return unknown
    return 'Unknown';
}

/**
 * Create a carrier badge element (yellow badge)
 * @param {string} carrierName - The name of the carrier
 * @returns {HTMLElement} - The badge element
 */
function createCarrierBadge(carrierName) {
    const badge = document.createElement('span');
    badge.className = 'carrier-badge';
    badge.textContent = carrierName;
    badge.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #78350f;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        margin-left: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        border: 1px solid rgba(245, 158, 11, 0.4);
        vertical-align: middle;
    `;
    return badge;
}

/**
 * Update the locked number display with carrier badge
 * @param {string} phoneNumber - The locked phone number
 */
function updateCarrierDisplay(phoneNumber) {
    const lockedNumberDisplay = document.getElementById('lockedNumberDisplay');
    
    if (!lockedNumberDisplay) return;
    
    // Detect the carrier
    const carrier = detectCarrier(phoneNumber);
    
    // Clear existing content
    lockedNumberDisplay.innerHTML = '';
    
    // Add the phone number as text
    const numberText = document.createTextNode(phoneNumber);
    lockedNumberDisplay.appendChild(numberText);
    
    // Add carrier badge if detected
    if (carrier && carrier !== 'Unknown') {
        const badge = createCarrierBadge(carrier);
        lockedNumberDisplay.appendChild(badge);
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectCarrier,
        createCarrierBadge,
        updateCarrierDisplay
    };
}
