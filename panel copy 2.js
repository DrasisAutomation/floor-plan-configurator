
const PRODUCT_ORDER = [
    "DOOR LOCK",
    "PROCESSOR",
    "LUMI GLASS SERIES",
    "ESCULT SERIES",
    "TACTILE HEXA SERIES",
    "DUO-QUAD SERIES",
    "DOMOGENIE GLASS SERIES",
    "WALL MOUNT DISPLAY",
    "TREMBLAY SOUNDS",
    "Z-WAVE RELAY",
    "CURTAIN MOTORS",
    "SENSORS",
    "IR BLASTER - ZMOTE",
    "EMITTER",
    "EQUIPMENTS", // ADDED NEW CATEGORY
    "AUTOMATION DISTRIBUTION BOX",
    "NETWORK DISTRIBUTION BOX",
    "ACCESS POINT",
    "TEXT"
];

/* ------------------------- SWITCH CONFIGURATION FUNCTIONS ------------------------- */
function createSwitchConfigurationControls() {
    const existingControls = document.getElementById('switchConfigControls');
    if (existingControls) {
        existingControls.remove();
    }

    const data = productData[currentProduct];
    if (!data || !switchFamilies.has(currentProduct)) return;

    // Remove existing features section
    featuresSection.style.display = 'none';

    // Hide product image overlay
    productImageOverlay.style.display = 'none';

    // Determine placeholder based on product series
    let placeholder = '';
    if (currentProduct === 'LUMI GLASS SERIES') {
        placeholder = 'e.g., 3 light + 1 load';
    } else if (currentProduct === 'DOMOGENIE GLASS SERIES') {
        placeholder = 'e.g., 2 light + 1 fan';
    } else {
        placeholder = 'e.g., 1 light, 2 fan, 1 dimmer';
    }

    // Check if a mark is selected and has existing configuration
    const selectedMark = marks.find(mark => mark.id === selectedMarkId);
    const existingConfig = selectedMark ? selectedMark.switchConfig : '';

    // In the createSwitchConfigurationControls function, update the HTML:
    const switchControlsHTML = `
    <div class="mark-controls-box" id="switchConfigControls" style="margin-top: 20px; border-color: #FF9800;">
        <h3 style="color: #FF9800; margin-bottom: 15px;">
            <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">settings</span>
            ${currentProduct} Configuration
        </h3>
        
        ${selectedMarkId ? `
        <div style="background: #FFF8E1; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #FFECB3;">
            <div style="font-size: 12px; color: #FF9800; margin-bottom: 4px;">
                <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                Configuring: <strong>${selectedMark ? selectedMark.seriesLabel : ''}</strong>
                ${selectedMark && selectedMark.modelName ? `(${selectedMark.modelName})` : ''}
            </div>
            <div style="font-size: 11px; color: #555;">
                Configuration will be saved only for this specific switch label.
            </div>
        </div>
        ` : `
        <div style="background: #FFF8E1; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #FFECB3;">
            <div style="font-size: 12px; color: #FF9800; margin-bottom: 4px;">
                <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                Setting Default Configuration for New Switches
            </div>
            <div style="font-size: 11px; color: #555;">
                This configuration will apply to all new ${currentProduct} switches.
                Select a specific switch to configure it individually.
            </div>
        </div>
        `}
        
        <div class="form-group">
            <label style="color: #FF9800; font-weight: 500;">Switch Configuration</label>
            <input type="text" 
                   id="switchConfigInput" 
                   class="form-control" 
                   placeholder="${placeholder}"
                   value="${selectedMarkId && selectedMark ? (selectedMark.switchConfig || productData[currentProduct]?.defaultSwitchConfig || '') : (productData[currentProduct]?.defaultSwitchConfig || '')}"
                   style="border-color: #FF9800; margin-bottom: 10px;">
            <div style="font-size: 11px; color: #666; margin-top: 4px;">
                <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                ${selectedMarkId ? `Editing configuration for ${selectedMark.seriesLabel}` : 'Set default configuration for new switches'}
            </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
            <button id="saveSwitchConfigBtn" class="btn primary full-width" style="background: #FF9800; border-color: #FF9800;">
                <span class="material-icons" style="font-size: 16px; margin-right: 8px;">save</span>
                ${selectedMarkId ? 'Save Configuration' : 'Set Default Configuration'}
            </button>
        </div>

        <div style="margin-top: 15px; padding: 12px; background: #FFF3E0; border-radius: 6px; border: 1px solid #FFE0B2;">
            <div style="font-size: 12px; color: #FF9800; margin-bottom: 4px;">
                <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                Configuration Info
            </div>
            <div style="font-size: 11px; color: #555;">
                • Each switch label has its own configuration<br>
                • Default configuration applies to new switches<br>
                • Select a switch to override with individual config<br>
                • Configuration will be displayed in PDF<br>
                • Will appear in product details
            </div>
        </div>
    </div>
`;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', switchControlsHTML);
        attachSwitchConfigEvents();
    }
}

function attachSwitchConfigEvents() {
    const saveBtn = document.getElementById('saveSwitchConfigBtn');
    const configInput = document.getElementById('switchConfigInput');

    if (saveBtn && configInput) {
        saveBtn.addEventListener('click', function () {
            const config = configInput.value.trim();
            const selectedMark = marks.find(mark => mark.id === selectedMarkId);

            if (!config) {
                showNotification('Please enter switch configuration', 'error');
                return;
            }

            if (selectedMarkId && selectedMark) {
                // Save configuration for the selected mark
                selectedMark.switchConfig = config;
                selectedMark.desc = `${selectedMark.categoryName}: ${config}`;

                // Update the mark's tooltip
                if (selectedMark.tooltip) {
                    const tooltipModel = selectedMark.tooltip.querySelector('.tooltip-model');
                    if (tooltipModel) {
                        tooltipModel.textContent = config || selectedMark.modelName || '—';
                    }
                }

                showNotification(`Configuration saved for ${selectedMark.seriesLabel}!`, 'success');
                renderMarksList();
            } else {
                // Set default configuration for new switches
                if (productData[currentProduct]) {
                    productData[currentProduct].defaultSwitchConfig = config;

                    // Also update ALL existing switches of this type that don't have individual configs
                    marks.forEach(mark => {
                        if (mark.categoryName === currentProduct && !mark.switchConfig) {
                            mark.switchConfig = config;
                            mark.desc = `${mark.categoryName}: ${config}`;

                            // Update tooltip
                            if (mark.tooltip) {
                                const tooltipModel = mark.tooltip.querySelector('.tooltip-model');
                                if (tooltipModel) {
                                    tooltipModel.textContent = config || mark.modelName || '—';
                                }
                            }
                        }
                    });

                    showNotification('Default configuration set for new switches and updated existing ones without config', 'success');
                    renderMarksList();
                }
            }
        });
    }
}


/* ------------------------- UI BUILD ------------------------- */
const productListEl = document.getElementById('productList');
const pTitle = document.getElementById('pTitle');
const pDesc = document.getElementById('pDesc');
const pMeta = document.getElementById('pMeta');
const pFeatures = document.getElementById('pFeatures');
const featuresSection = document.getElementById('featuresSection');
const productImage = document.getElementById('productImage');
const productImageOverlay = document.getElementById('productImageOverlay');
const previewImage = document.getElementById('previewImage');
const imgInner = document.getElementById('imgInner');
const imgContainer = document.getElementById('imgContainer');
const relayControlsEl = document.getElementById('relayControls');
const relayOptionsList = document.getElementById('relayOptionsList');
const productModalEl = document.getElementById('productModal');
const modalProductTitle = document.getElementById('modalProductTitle');
const modalProductDesc = document.getElementById('modalProductDesc');
const modalProductImage = document.getElementById('modalProductImage');
const modalProductFeatures = document.getElementById('modalProductFeatures');
const modalCloseBtn = document.getElementById('modalCloseBtn');

const relayOptions = [
    { id: 'relay-1ch', label: '1 Channel Relay' },
    { id: 'relay-2ch', label: '2 Channel Relay' },
    { id: 'relay-curtain', label: '1 Channel Curtain Relay' },
    { id: 'relay-dimmer', label: '0-10V Analog Dimmer' },
    { id: 'relay-remote', label: 'LS Series Remote' }
];

const relayOptionImages = {
    'relay-1ch': './images/relay/48.png',
    'relay-2ch': './images/relay/49.png',
    'relay-curtain': './images/relay/47.png',
    'relay-dimmer': './images/relay/50.png',
    'relay-remote': './images/relay/48.png'
};

const relayState = relayOptions.reduce((acc, opt) => {
    acc[opt.id] = { selected: false, quantity: 1 };
    return acc;
}, {});
let lastRelaySelectionLabel = '';

function relaySelectionsFromState() {
    return relayOptions
        .filter(opt => relayState[opt.id].selected)
        .map(opt => ({ name: opt.label, quantity: relayState[opt.id].quantity, id: opt.id }));
}

function updateRelayOverlay() {
    if (currentProduct !== 'Z-WAVE RELAY') {
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        return;
    }
    const selections = relaySelectionsFromState();
    productImageOverlay.style.display = 'block';
    if (selections.length === 0) {
        productImageOverlay.textContent = 'Select relay modules to highlight them.';
        resetRelayPreview();
        return;
    }
    const preferred = selections.find(sel => sel.name === lastRelaySelectionLabel) || selections[selections.length - 1];
    productImageOverlay.innerHTML = `<strong>${preferred.name}</strong><br>Qty ${preferred.quantity}`;
    setRelayPreview(preferred.id);
}

function setRelayPreview(optionId) {
    const baseImg = productData['Z-WAVE RELAY']?.img || '';
    const src = relayOptionImages[optionId] || baseImg;
    if (currentProduct === 'Z-WAVE RELAY' && src) {
        productImage.src = src;
    }
}

function resetRelayPreview() {
    const baseImg = productData['Z-WAVE RELAY']?.img || '';
    if (currentProduct === 'Z-WAVE RELAY' && baseImg) {
        productImage.src = baseImg;
    }
}

const switchFamilies = new Set([
    "LUMI GLASS SERIES",
    "ESCULT SERIES",
    "TACTILE HEXA SERIES",
    "DUO-QUAD SERIES",
    "DOMOGENIE GLASS SERIES"
]);

const seriesCounters = {};

function getSeriesCode(productKey) {
    if (productKey === 'DOOR LOCK') return 'L';
    if (productKey === 'PROCESSOR') return 'P';
    if (productKey === 'WALL MOUNT DISPLAY') return 'D';
    if (productKey === 'CURTAIN MOTORS') return 'C';
    if (productKey === 'Z-WAVE RELAY') return 'R';
    if (productKey === 'TREMBLAY SOUNDS') return 'T';
    if (productKey === 'IR BLASTER - ZMOTE') return 'I';
    if (productKey === 'EMITTER') return 'E';
    if (productKey === 'TEXT') return 'TX';
    if (productKey === 'EQUIPMENTS') return 'EQ';
    if (productKey === 'AUTOMATION DISTRIBUTION BOX') return 'ADB';
    if (productKey === 'NETWORK DISTRIBUTION BOX') return 'NDB';
    if (productKey === 'ACCESS POINT') return 'AP'; // ADD THIS LINE
    if (switchFamilies.has(productKey)) return 'S';
    return 'S';
}
/* ------------------------- LOAD FLOOR PLAN IMAGE ------------------------- */
function loadFloorPlanImage() {
    const previewImage = document.getElementById('previewImage');

    const uploadedFloorPlan = sessionStorage.getItem('uploadedFloorPlan');
    const exportedPlan = sessionStorage.getItem('exportedPlan');

    previewImage.src = '';

    // Add a loading placeholder to maintain aspect ratio
    previewImage.style.visibility = 'hidden';

    if (uploadedFloorPlan) {
        console.log('📤 Loading uploaded floor plan from index.html');
        previewImage.src = uploadedFloorPlan;
        sessionStorage.removeItem('uploadedFloorPlan');
    } else if (exportedPlan) {
        console.log('🏠 Loading exported floor plan from floor planner');
        previewImage.src = exportedPlan;
    } else {
        console.log('🏢 Using default floor plan image');
        previewImage.src = 'https://virtualtourslasvegas.com/wp-content/uploads/2023/01/1701-N-Green-Valley-Pkwy-8A.jpg';
    }

    previewImage.onload = function () {
        console.log('✅ Floor plan image loaded successfully');
        // Make image visible
        previewImage.style.visibility = 'visible';

        // Force a reflow to ensure dimensions are accurate
        void previewImage.offsetWidth;

        // Wait a frame for layout to settle
        setTimeout(() => {
            updateImageDimensions();
            clearAllMarksAndWires();
        }, 50);
    };

    previewImage.onerror = function () {
        console.error('❌ Failed to load floor plan image');
        previewImage.style.visibility = 'visible';
        const exportedFallback = sessionStorage.getItem('exportedPlan');
        if (exportedFallback && previewImage.src !== exportedFallback) {
            console.log('🔄 Trying exported plan as fallback');
            previewImage.src = exportedFallback;
            return;
        }
        console.log('🔄 Using default image as fallback');
        previewImage.src = 'https://virtualtourslasvegas.com/wp-content/uploads/2023/01/1701-N-Green-Valley-Pkwy-8A.jpg';
    };
}

function clearAllMarksAndWires() {
    marks.forEach(mark => {
        if (mark.el && mark.el.parentNode) {
            mark.el.parentNode.removeChild(mark.el);
        }
    });
    marks.length = 0;

    wires.forEach(wire => {
        if (wire.element && wire.element.svg) {
            wire.element.svg.remove();
        }
    });
    wires.length = 0;

    markCounter = 0;
    selectedMarkId = null;

    isWireMode = false;
    currentWireType = null;
    wireStartMark = null;
    wireEndMark = null;
    selectedWire = null;
    wirePoints = [];

    renderMarksList();
    updateWiresList();
    hideWireControls();

    console.log('🧹 Cleared all marks and wires for new image');
}

function nextSeriesLabel(productKey) {
    const code = getSeriesCode(productKey);

    if (!seriesCounters[code]) {
        seriesCounters[code] = 0;
    }

    // Find the next available number
    const existingMarks = marks.filter(mark => mark.seriesCode === code);
    let nextNum = 1;

    if (existingMarks.length > 0) {
        const existingNumbers = existingMarks.map(mark => {
            const num = parseInt(mark.seriesLabel.substring(code.length));
            return isNaN(num) ? 0 : num;
        });

        while (existingNumbers.includes(nextNum)) {
            nextNum++;
        }
    } else {
        nextNum = seriesCounters[code] + 1;
    }

    seriesCounters[code] = Math.max(seriesCounters[code], nextNum);
    return { seriesCode: code, label: `${code}${nextNum}` };
}

let currentProduct = null;
let currentSubProduct = null;
let imageScale = 1;
const marks = [];
let selectedMarkId = null;
let imageNaturalWidth = 0;
let imageNaturalHeight = 0;
let imageDisplayWidth = 0;
let imageDisplayHeight = 0;
let markColors = {}; // Track colors for each mark

const wires = [];
let isWireMode = false;
let currentWireType = null;
let currentWireMode = 'curve';
let wireStartMark = null;
let wireEndMark = null;
let selectedWire = null;
let wirePoints = [];

// Updated wireTypes with CAT6 cable
// Updated wireTypes with CAT6 cable, IR Cable, and DALI Wire
const wireTypes = [
    {
        id: 'knx',
        name: 'KNX_WIRE',
        title: 'KNX Bus Wire',
        color: '#4CAF50',
        icon: 'electric_bolt',
        bgColor: '#f0f9f0',
        borderColor: '#c8e6c9'
    },
    {
        id: 'phase',
        name: 'PHASE_WIRE',
        title: 'Phase Wire (Live)',
        color: '#f44336',
        icon: 'flash_on',
        bgColor: '#ffebee',
        borderColor: '#ffcdd2'
    },
    {
        id: 'neutral',
        name: 'NEUTRAL_WIRE',
        title: 'Neutral Wire',
        color: '#000000',
        icon: 'power',
        bgColor: '#f5f5f5',
        borderColor: '#e0e0e0'
    },
    {
        id: 'cat6',
        name: 'CAT6_WIRE',
        title: 'CAT6 Cable',
        color: '#9E9E9E',
        icon: 'cable',
        bgColor: '#f5f5f5',
        borderColor: '#e0e0e0'
    },
    {
        id: 'ir',
        name: 'IR_WIRE',
        title: 'IR Cable',
        color: '#2196F3',
        icon: 'settings_remote',
        bgColor: '#f0f7ff',
        borderColor: '#bbdefb'
    },
    {
        id: 'speaker',
        name: 'SPEAKER_WIRE',
        title: 'Speaker Cable 16/18 AWG',
        color: '#FFC107',
        icon: 'speaker',
        bgColor: '#fffde7',
        borderColor: '#fff59d'
    },
    // ADD THIS NEW DALI WIRE TYPE
    {
        id: 'dali',
        name: 'DALI_WIRE',
        title: 'DALI 2 Core Wire 1.5 sqmm',
        color: '#9C27B0', // Purple color
        icon: 'cable',
        bgColor: '#f3e5f5',
        borderColor: '#e1bee7'
    },
];

/* ------------------------- AUTOMATION DB BOX FUNCTIONS ------------------------- */
/* ------------------------- AUTOMATION DB BOX FUNCTIONS ------------------------- */
function createAutomationDBBoxControls() {
    const existingControls = document.getElementById('automationDBControls');
    if (existingControls) {
        existingControls.remove();
    }

    const data = productData[currentProduct];
    if (!data || !data.isDBBox) return;

    // Remove existing features section
    featuresSection.style.display = 'none';

    // Hide product image overlay
    productImageOverlay.style.display = 'none';

    // Automation DB box specific options - REMOVED MODULES
    const dbBoxRelays = [
        { id: 'knx-power-supply', label: 'KNX Power Supply' },
        { id: '12-channel-actuator', label: '12 Channel Actuator' },
        { id: '2-fold-dally-gateway', label: '2 Fold Dally Gateway' },
        { id: 'knx-tuya-gateway', label: 'KNX Tuya Gateway' },
        { id: '4-channel-face-cut-dimmer', label: '4 Channel Face Cut Dimmer' },
        { id: '4-channel-analog-dimmer', label: '4 Channel Analog Dimmer' },
        { id: 'knx-ip-router', label: 'KNX IP Router' },
        { id: 'knx-vrv-gateway', label: 'KNX VRV Gateway' },
        { id: 'zmote-lan', label: 'Zmote LAN' },
        { id: '4-channel-inwall-relay', label: '4 Channel Inwall Relay' }
    ];

    const dbControlsHTML = `
        <div class="mark-controls-box" id="automationDBControls" style="margin-top: 20px; border-color: #2196F3;">
            <h3 style="color: #2196F3; margin-bottom: 15px;">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">settings</span>
                Automation DB Box Specifications
            </h3>
            
            <div class="form-group">
                <label style="color: #2196F3; font-weight: 500;">Brand</label>
                <input type="text" 
                       id="automationDBBrandInput" 
                       class="form-control" 
                       placeholder="Enter brand name (e.g., Legrand, Schneider)"
                       value="${data.brand || ''}"
                       style="border-color: #2196F3;">
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                    Enter the manufacturer brand
                </div>
            </div>

            <div class="form-group" style="margin-top: 15px;">
                <label style="color: #2196F3; font-weight: 500;">Size (in feet)</label>
                <input type="text" 
                       id="automationDBSizeInput" 
                       class="form-control" 
                       placeholder="Enter size in feet (e.g., 2x3, 4x6)"
                       value="${data.size || ''}"
                       style="border-color: #2196F3;">
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                    Enter dimensions like 2x3, 4x6, etc.
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label style="color: #2196F3; font-weight: 500;">Modules</label>
                <div id="automationDBRelaysList" style="margin-top: 10px; max-height: 150px; overflow-y: auto;">
                    ${dbBoxRelays.map(relay => `
                        <div class="db-relay-option" style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e0e0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" 
                                           data-relay-id="${relay.id}" 
                                           style="cursor: pointer;">
                                    <span style="font-size: 13px;">${relay.label}</span>
                                </label>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 12px; color: #666;">Qty:</span>
                                    <input type="number" 
                                           data-relay-id="${relay.id}" 
                                           min="1" 
                                           value="1" 
                                           style="width: 60px; padding: 4px; border: 1px solid #ddd; border-radius: 4px; text-align: center;"
                                           disabled>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <button id="saveAutomationDBSpecsBtn" class="btn primary full-width" style="background: #2196F3; border-color: #2196F3;">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">save</span>
                    Save Specifications
                </button>
            </div>

            <div style="margin-top: 15px; padding: 12px; background: #f0f7ff; border-radius: 6px; border: 1px solid #bbdefb;">
                <div style="font-size: 12px; color: #2196F3; margin-bottom: 4px;">
                    <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                    Specifications Info
                </div>
                <div style="font-size: 11px; color: #555;">
                    • Brand and size will be displayed in PDF<br>
                    • Size will be shown in model name when label is clicked<br>
                    • Relay selection will be included in PDF<br>
                    • Information is saved per DB box
                </div>
            </div>
        </div>
    `;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', dbControlsHTML);
        attachAutomationDBControlsEvents();
    }
}

function attachAutomationDBControlsEvents() {
    const saveBtn = document.getElementById('saveAutomationDBSpecsBtn');
    const brandInput = document.getElementById('automationDBBrandInput');
    const sizeInput = document.getElementById('automationDBSizeInput');

    // Add event listeners to relay checkboxes
    document.querySelectorAll('#automationDBRelaysList input[type="checkbox"]').forEach(checkbox => {
        const relayId = checkbox.dataset.relayId;
        const qtyInput = document.querySelector(`input[data-relay-id="${relayId}"]`);

        checkbox.addEventListener('change', function () {
            qtyInput.disabled = !this.checked;
            if (!this.checked) {
                qtyInput.value = '1';
            }
        });

        qtyInput.addEventListener('input', function () {
            const val = Math.max(1, parseInt(this.value || '1', 10));
            this.value = val;
        });
    });

    if (saveBtn && brandInput && sizeInput) {
        saveBtn.addEventListener('click', function () {
            const brand = brandInput.value.trim();
            const size = sizeInput.value.trim();

            if (!brand || !size) {
                showNotification('Please enter both brand and size', 'error');
                return;
            }

            // Get selected relays
            const selectedRelays = [];
            document.querySelectorAll('#automationDBRelaysList input[type="checkbox"]:checked').forEach(checkbox => {
                const relayId = checkbox.dataset.relayId;
                const qtyInput = document.querySelector(`input[data-relay-id="${relayId}"]`);
                const relayLabel = checkbox.parentElement.querySelector('span').textContent;
                selectedRelays.push({
                    id: relayId,
                    name: relayLabel,
                    quantity: parseInt(qtyInput.value) || 1
                });
            });

            if (productData[currentProduct]) {
                productData[currentProduct].brand = brand;
                productData[currentProduct].size = size;
                productData[currentProduct].selectedRelays = selectedRelays;

                // Update existing marks
                marks.forEach(mark => {
                    if (mark.categoryName === currentProduct) {
                        mark.modelName = `${brand} - ${size} ft`;
                        mark.desc = `${currentProduct}: ${brand} ${size} ft`;
                        mark.brand = brand;
                        mark.sizeFt = size;
                        mark.selectedRelays = selectedRelays;
                    }
                });

                showNotification('Automation DB Box specifications saved successfully!', 'success');
                renderMarksList();
            }
        });
    }
}

function attachAutomationDBControlsEvents() {
    const saveBtn = document.getElementById('saveAutomationDBSpecsBtn');
    const brandInput = document.getElementById('automationDBBrandInput');
    const sizeInput = document.getElementById('automationDBSizeInput');

    // Add event listeners to module checkboxes
    document.querySelectorAll('#automationDBModulesList input[type="checkbox"]').forEach(checkbox => {
        const moduleId = checkbox.dataset.moduleId;
        const qtyInput = document.querySelector(`input[data-module-id="${moduleId}"]`);

        checkbox.addEventListener('change', function () {
            qtyInput.disabled = !this.checked;
            if (!this.checked) {
                qtyInput.value = '1';
            }
        });

        qtyInput.addEventListener('input', function () {
            const val = Math.max(1, parseInt(this.value || '1', 10));
            this.value = val;
        });
    });

    // Add event listeners to relay checkboxes
    document.querySelectorAll('#automationDBRelaysList input[type="checkbox"]').forEach(checkbox => {
        const relayId = checkbox.dataset.relayId;
        const qtyInput = document.querySelector(`input[data-relay-id="${relayId}"]`);

        checkbox.addEventListener('change', function () {
            qtyInput.disabled = !this.checked;
            if (!this.checked) {
                qtyInput.value = '1';
            }
        });

        qtyInput.addEventListener('input', function () {
            const val = Math.max(1, parseInt(this.value || '1', 10));
            this.value = val;
        });
    });

    if (saveBtn && brandInput && sizeInput) {
        saveBtn.addEventListener('click', function () {
            const brand = brandInput.value.trim();
            const size = sizeInput.value.trim();

            if (!brand || !size) {
                showNotification('Please enter both brand and size', 'error');
                return;
            }

            // Get selected modules
            const selectedModules = [];
            document.querySelectorAll('#automationDBModulesList input[type="checkbox"]:checked').forEach(checkbox => {
                const moduleId = checkbox.dataset.moduleId;
                const qtyInput = document.querySelector(`input[data-module-id="${moduleId}"]`);
                const moduleLabel = checkbox.parentElement.querySelector('span').textContent;
                selectedModules.push({
                    id: moduleId,
                    name: moduleLabel,
                    quantity: parseInt(qtyInput.value) || 1
                });
            });

            // Get selected relays
            const selectedRelays = [];
            document.querySelectorAll('#automationDBRelaysList input[type="checkbox"]:checked').forEach(checkbox => {
                const relayId = checkbox.dataset.relayId;
                const qtyInput = document.querySelector(`input[data-relay-id="${relayId}"]`);
                const relayLabel = checkbox.parentElement.querySelector('span').textContent;
                selectedRelays.push({
                    id: relayId,
                    name: relayLabel,
                    quantity: parseInt(qtyInput.value) || 1
                });
            });

            if (productData[currentProduct]) {
                productData[currentProduct].brand = brand;
                productData[currentProduct].size = size;
                productData[currentProduct].selectedModules = selectedModules;
                productData[currentProduct].selectedRelays = selectedRelays;

                // Update existing marks
                marks.forEach(mark => {
                    if (mark.categoryName === currentProduct) {
                        mark.modelName = `${brand} - ${size} ft`;
                        mark.desc = `${currentProduct}: ${brand} ${size} ft`;
                        mark.brand = brand;
                        mark.sizeFt = size;
                        mark.selectedModules = selectedModules;
                        mark.selectedRelays = selectedRelays;
                    }
                });

                showNotification('Automation DB Box specifications saved successfully!', 'success');
                renderMarksList();
            }
        });
    }
}

/* ------------------------- NETWORK DB BOX FUNCTIONS ------------------------- */
function createNetworkDBBoxControls() {
    const existingControls = document.getElementById('networkDBControls');
    if (existingControls) {
        existingControls.remove();
    }

    const data = productData[currentProduct];
    if (!data || !data.isNetworkDBBox) return;

    // Remove existing features section
    featuresSection.style.display = 'none';

    // Hide product image overlay
    productImageOverlay.style.display = 'none';

    // Network DB box specific modules - ADD THESE
    const networkDBModules = [
        { id: 'network-switch', label: 'Network Switch' },
        { id: 'patch-panel', label: 'Patch Panel' },
        { id: 'fiber-termination', label: 'Fiber Termination Box' },
        { id: 'ups', label: 'UPS System' },
        { id: 'cable-manager', label: 'Cable Manager' },
        { id: 'pdu', label: 'PDU Unit' },
        { id: 'surge-protector', label: 'Surge Protector' },
        { id: 'media-converter', label: 'Media Converter' }
    ];

    const networkControlsHTML = `
        <div class="mark-controls-box" id="networkDBControls" style="margin-top: 20px; border-color: #9C27B0;">
            <h3 style="color: #9C27B0; margin-bottom: 15px;">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">router</span>
                Network DB Box Specifications
            </h3>
            
            <div class="form-group">
                <label style="color: #9C27B0; font-weight: 500;">Brand</label>
                <input type="text" 
                       id="networkDBBrandInput" 
                       class="form-control" 
                       placeholder="Enter brand name (e.g., Legrand, Schneider)"
                       value="${data.brand || ''}"
                       style="border-color: #9C27B0;">
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                    Enter the manufacturer brand
                </div>
            </div>

            <div class="form-group" style="margin-top: 15px;">
                <label style="color: #9C27B0; font-weight: 500;">Size (in feet)</label>
                <input type="text" 
                       id="networkDBSizeInput" 
                       class="form-control" 
                       placeholder="Enter size in feet (e.g., 2x3, 4x6)"
                       value="${data.size || ''}"
                       style="border-color: #9C27B0;">
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                    Enter dimensions like 2x3, 4x6, etc.
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label style="color: #9C27B0; font-weight: 500;">Network Router</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div>
                        <label style="font-size: 11px; color: #666;">Brand</label>
                        <input type="text" 
                               id="networkRouterBrand" 
                               placeholder="e.g., Cisco"
                               value="${data.routerBrand || ''}"
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                    </div>
                    <div>
                        <label style="font-size: 11px; color: #666;">Model</label>
                        <input type="text" 
                               id="networkRouterModel" 
                               placeholder="e.g., ISR 4331"
                               value="${data.routerModel || ''}"
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                    </div>
                    <div style="grid-column: span 2;">
                        <label style="font-size: 11px; color: #666;">Quantity</label>
                        <input type="number" 
                               id="networkRouterQty" 
                               min="1" 
                               value="${data.routerQty || 1}"
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; text-align: center;">
                    </div>
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label style="color: #9C27B0; font-weight: 500;">Network Modules</label>
                <div id="networkDBModulesList" style="margin-top: 10px; max-height: 150px; overflow-y: auto;">
                    ${networkDBModules.map(module => `
                        <div class="db-module-option" style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e0e0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" 
                                           data-module-id="${module.id}" 
                                           style="cursor: pointer;">
                                    <span style="font-size: 13px;">${module.label}</span>
                                </label>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 12px; color: #666;">Qty:</span>
                                    <input type="number" 
                                           data-module-id="${module.id}" 
                                           min="1" 
                                           value="1" 
                                           style="width: 60px; padding: 4px; border: 1px solid #ddd; border-radius: 4px; text-align: center;"
                                           disabled>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <button id="saveNetworkDBSpecsBtn" class="btn primary full-width" style="background: #9C27B0; border-color: #9C27B0;">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">save</span>
                    Save Specifications
                </button>
            </div>

            <div style="margin-top: 15px; padding: 12px; background: #f3e5f5; border-radius: 6px; border: 1px solid #e1bee7;">
                <div style="font-size: 12px; color: #9C27B0; margin-bottom: 4px;">
                    <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                    Specifications Info
                </div>
                <div style="font-size: 11px; color: #555;">
                    • Brand and size will be displayed in PDF<br>
                    • Router details will be included in PDF<br>
                    • Module selection will be included in PDF<br>
                    • Information is saved per DB box
                </div>
            </div>
        </div>
    `;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', networkControlsHTML);
        attachNetworkDBControlsEvents();
    }
}

function attachNetworkDBControlsEvents() {
    const saveBtn = document.getElementById('saveNetworkDBSpecsBtn');
    const brandInput = document.getElementById('networkDBBrandInput');
    const sizeInput = document.getElementById('networkDBSizeInput');
    const routerBrandInput = document.getElementById('networkRouterBrand');
    const routerModelInput = document.getElementById('networkRouterModel');
    const routerQtyInput = document.getElementById('networkRouterQty');

    // Add event listeners to module checkboxes
    document.querySelectorAll('#networkDBModulesList input[type="checkbox"]').forEach(checkbox => {
        const moduleId = checkbox.dataset.moduleId;
        const qtyInput = document.querySelector(`input[data-module-id="${moduleId}"]`);

        checkbox.addEventListener('change', function () {
            qtyInput.disabled = !this.checked;
            if (!this.checked) {
                qtyInput.value = '1';
            }
        });

        qtyInput.addEventListener('input', function () {
            const val = Math.max(1, parseInt(this.value || '1', 10));
            this.value = val;
        });
    });

    // Quantity input validation
    if (routerQtyInput) {
        routerQtyInput.addEventListener('input', function () {
            const val = Math.max(1, parseInt(this.value || '1', 10));
            this.value = val;
        });
    }

    if (saveBtn && brandInput && sizeInput) {
        saveBtn.addEventListener('click', function () {
            const brand = brandInput.value.trim();
            const size = sizeInput.value.trim();

            if (!brand || !size) {
                showNotification('Please enter both brand and size', 'error');
                return;
            }

            // Get router details
            const routerBrand = routerBrandInput ? routerBrandInput.value.trim() : '';
            const routerModel = routerModelInput ? routerModelInput.value.trim() : '';
            const routerQty = routerQtyInput ? parseInt(routerQtyInput.value) || 1 : 1;

            // Get selected modules
            const selectedModules = [];
            document.querySelectorAll('#networkDBModulesList input[type="checkbox"]:checked').forEach(checkbox => {
                const moduleId = checkbox.dataset.moduleId;
                const qtyInput = document.querySelector(`input[data-module-id="${moduleId}"]`);
                const moduleLabel = checkbox.parentElement.querySelector('span').textContent;
                selectedModules.push({
                    id: moduleId,
                    name: moduleLabel,
                    quantity: parseInt(qtyInput.value) || 1
                });
            });

            if (productData[currentProduct]) {
                productData[currentProduct].brand = brand;
                productData[currentProduct].size = size;
                productData[currentProduct].routerBrand = routerBrand;
                productData[currentProduct].routerModel = routerModel;
                productData[currentProduct].routerQty = routerQty;
                productData[currentProduct].selectedModules = selectedModules;

                // Update existing marks
                marks.forEach(mark => {
                    if (mark.categoryName === currentProduct) {
                        mark.modelName = `${brand} - ${size} ft`;
                        mark.desc = `${currentProduct}: ${brand} ${size} ft`;
                        mark.brand = brand;
                        mark.sizeFt = size;
                        mark.routerBrand = routerBrand;
                        mark.routerModel = routerModel;
                        mark.routerQty = routerQty;
                        mark.selectedModules = selectedModules;
                    }
                });

                showNotification('Network DB Box specifications saved successfully!', 'success');
                renderMarksList();
            }
        });
    }
}

function orientTooltip(mark) {
    const tooltip = mark?.tooltip;
    if (!tooltip || !imageNaturalWidth || !imageNaturalHeight) return;
    const offset = 12;
    const centerX = mark.x + (mark.size / 2);
    const centerY = mark.y + (mark.size / 2);
    const verticalIsBottom = centerY < (imageNaturalHeight / 2);
    const horizontalIsRight = centerX < (imageNaturalWidth / 2);

    tooltip.dataset.vertical = verticalIsBottom ? 'bottom' : 'top';
    tooltip.dataset.horizontal = horizontalIsRight ? 'right' : 'left';

    if (verticalIsBottom) {
        tooltip.style.top = '100%';
    } else {
        tooltip.style.top = '0';
    }

    if (horizontalIsRight) {
        tooltip.style.left = '100%';
    } else {
        tooltip.style.left = '0';
    }

    const translateX = horizontalIsRight ? `${offset}px` : `calc(-100% - ${offset}px)`;
    const translateY = verticalIsBottom ? `${offset}px` : `calc(-100% - ${offset}px)`;
    tooltip.style.transform = `translate(${translateX}, ${translateY})`;
}

function populateModal(mark) {
    if (!mark) return;

    let title = '';
    if (mark.isDBBox && mark.sizeFt) {
        title = `${mark.categoryName || ''} — ${mark.brand || ''} ${mark.sizeFt} ft`.trim() || 'DB Box';
    } else if (mark.isNetworkDBBox && mark.sizeFt) {
        title = `${mark.categoryName || ''} — ${mark.brand || ''} ${mark.sizeFt} ft`.trim() || 'Network DB Box';
    } else if (mark.isSwitchFamily) {
        title = `${mark.categoryName || ''} — ${mark.modelName || ''}`.trim() || 'Switch';
    } else {
        title = `${mark.categoryName || ''}${mark.modelName ? ' — ' + mark.modelName : ''}`.trim() || 'Product';
    }

    modalProductTitle.textContent = title;

    // Clear previous content
    modalProductDesc.innerHTML = '';

    if (mark.isDBBox) {
        // Create HTML elements for separate points/lines
        const typeEl = document.createElement('div');
        typeEl.textContent = `Type: ${mark.categoryName || 'DB Box'}`;
        modalProductDesc.appendChild(typeEl);

        const brandEl = document.createElement('div');
        brandEl.textContent = `Brand: ${mark.brand || 'Not specified'}`;
        modalProductDesc.appendChild(brandEl);

        const sizeEl = document.createElement('div');
        sizeEl.textContent = `Size: ${mark.sizeFt || 'Not specified'} ft`;
        modalProductDesc.appendChild(sizeEl);

        // Add relay details if any - as bullet points
        if (mark.selectedRelays && mark.selectedRelays.length > 0) {
            const relayHeader = document.createElement('div');
            relayHeader.textContent = 'Relays:';
            relayHeader.style.marginTop = '8px';
            relayHeader.style.fontWeight = 'bold';
            modalProductDesc.appendChild(relayHeader);

            mark.selectedRelays.forEach(item => {
                const relayItem = document.createElement('div');
                relayItem.textContent = `• ${item.name} x${item.quantity}`;
                relayItem.style.marginLeft = '15px';
                modalProductDesc.appendChild(relayItem);
            });
        }
        // In populateModal function, update the Network DB Box section:

    } else if (mark.isNetworkDBBox) {
    // Create HTML elements for separate points/lines
    const typeEl = document.createElement('div');
    typeEl.textContent = `Type: ${mark.categoryName || 'Network DB Box'}`;
    modalProductDesc.appendChild(typeEl);

    const brandEl = document.createElement('div');
    brandEl.textContent = `Brand: ${mark.brand || 'Not specified'}`;
    modalProductDesc.appendChild(brandEl);

    const sizeEl = document.createElement('div');
    sizeEl.textContent = `Size: ${mark.sizeFt || 'Not specified'} ft`;
    modalProductDesc.appendChild(sizeEl);

    // Add router details if any - as bullet point
    if (mark.routerBrand || mark.routerModel) {
        const routerEl = document.createElement('div');
        routerEl.innerHTML = `<strong>• Network Router:</strong> ${mark.routerBrand || ''} ${mark.routerModel || ''} x${mark.routerQty || 1}`;
        routerEl.style.marginTop = '8px';
        modalProductDesc.appendChild(routerEl);
    }

    // Add modules details if any - as bullet points
    if (mark.selectedModules && mark.selectedModules.length > 0) {
        const moduleHeader = document.createElement('div');
        moduleHeader.textContent = 'Modules:';
        moduleHeader.style.marginTop = '8px';
        moduleHeader.style.fontWeight = 'bold';
        modalProductDesc.appendChild(moduleHeader);

        mark.selectedModules.forEach(item => {
            const moduleItem = document.createElement('div');
            moduleItem.textContent = `• ${item.name} x${item.quantity}`;
            moduleItem.style.marginLeft = '15px';
            modalProductDesc.appendChild(moduleItem);
        });
    } else {
        // Show empty message if no modules
        const noModulesEl = document.createElement('div');
        noModulesEl.textContent = 'No modules selected';
        noModulesEl.style.marginTop = '8px';
        noModulesEl.style.fontStyle = 'italic';
        noModulesEl.style.color = '#666';
        modalProductDesc.appendChild(noModulesEl);
    }
} else if (mark.isSwitchFamily) {
        // Create HTML elements for separate points/lines
        const typeEl = document.createElement('div');
        typeEl.textContent = `Type: ${mark.categoryName || 'Switch'}`;
        modalProductDesc.appendChild(typeEl);

        const modelEl = document.createElement('div');
        modelEl.textContent = `Model: ${mark.modelName || 'Not specified'}`;
        modalProductDesc.appendChild(modelEl);

        // Show individual switch configuration
        if (mark.switchConfig) {
            const configEl = document.createElement('div');
            configEl.textContent = `Configuration: ${mark.switchConfig}`;
            configEl.style.marginTop = '8px';
            configEl.style.fontWeight = 'bold';
            configEl.style.color = '#FF9800';
            modalProductDesc.appendChild(configEl);
        } else if (productData[mark.categoryName]?.defaultSwitchConfig) {
            const configEl = document.createElement('div');
            configEl.textContent = `Configuration: ${productData[mark.categoryName].defaultSwitchConfig} (default)`;
            configEl.style.marginTop = '8px';
            configEl.style.fontStyle = 'italic';
            configEl.style.color = '#666';
            modalProductDesc.appendChild(configEl);
        }
    } else if (mark.isTextLabel) {
        const textEl = document.createElement('div');
        textEl.textContent = `Text Label: ${mark.text || ''}`;
        modalProductDesc.appendChild(textEl);
    } else if (mark.isEquipment) {
        const typeEl = document.createElement('div');
        typeEl.textContent = `Type: Equipment`;
        modalProductDesc.appendChild(typeEl);

        const modelEl = document.createElement('div');
        modelEl.textContent = `Equipment: ${mark.modelName || 'Not specified'}`;
        modalProductDesc.appendChild(modelEl);
    } else {
        // For regular products
        const descEl = document.createElement('div');
        descEl.textContent = mark.desc || '';
        modalProductDesc.appendChild(descEl);

        // For Z-Wave Relay, show relay items
        if (mark.relayItems && mark.relayItems.length > 0) {
            const relayHeader = document.createElement('div');
            relayHeader.textContent = 'Relay Items:';
            relayHeader.style.marginTop = '8px';
            relayHeader.style.fontWeight = 'bold';
            modalProductDesc.appendChild(relayHeader);

            mark.relayItems.forEach(item => {
                const relayItem = document.createElement('div');
                relayItem.textContent = `• ${item.name} x${item.quantity}`;
                relayItem.style.marginLeft = '15px';
                modalProductDesc.appendChild(relayItem);
            });
        }
    }

    const imageSrc = mark.imageSrc || previewImage.src;
    if (imageSrc) {
        modalProductImage.src = imageSrc;
        modalProductImage.style.display = 'block';
    } else {
        modalProductImage.style.display = 'none';
    }

    modalProductFeatures.innerHTML = '';
    // For DB Boxes, Network DB Boxes, Text Labels, and Equipment, don't show features in modal
    if (!mark.isDBBox && !mark.isNetworkDBBox && !mark.isTextLabel && !mark.isEquipment) {
        const featureList = (mark.features && mark.features.length ? mark.features : ['Immersive Audio Experience', 'Flexible Speaker Placement', 'Seamless Connectivity & Control', 'Expandable & Future-Ready System']).slice(0, 12);
        featureList.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalProductFeatures.appendChild(li);
        });
    }
}

function openProductModal(mark) {
    populateModal(mark);
    productModalEl.classList.add('show');
}

function closeProductModal() {
    productModalEl.classList.remove('show');
}

modalCloseBtn.addEventListener('click', closeProductModal);
productModalEl.addEventListener('click', (e) => {
    if (e.target === productModalEl) {
        closeProductModal();
    }
});

function buildList() {
    productListEl.innerHTML = '';

    // First, add wire types
    wireTypes.forEach(wireType => {
        const wireItem = document.createElement('div');
        wireItem.className = 'tab-btn wire-tab';
        wireItem.dataset.name = wireType.name;
        wireItem.dataset.wireType = wireType.id;
        wireItem.style.position = 'relative';
        wireItem.style.cursor = 'pointer';
        wireItem.style.padding = '12px 16px';
        wireItem.style.margin = '4px 0';

        wireItem.innerHTML = `
            <div class="tab-title" style="color: ${wireType.color}; font-weight: 600; position: relative; z-index: 2;">
                <span class="material-icons" style="font-size: 18px; margin-right: 8px; vertical-align: middle;">${wireType.icon}</span>
                ${wireType.title}
            </div>
            <div class="tab-sub" style="position: relative; z-index: 2;">
                <span class="material-icons" style="font-size:20px;color:${wireType.color}">add_link</span>
            </div>
        `;

        // Add click event directly to the tab-btn
        // In the buildList function, update the wire tab event listeners:
        wireItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let target = e.target;
            while (target && !target.classList.contains('tab-btn')) {
                target = target.parentElement;
            }

            if (target) {
                currentWireType = wireType.id;
                isWireMode = true;

                // Update this selector to include DALI_WIRE
                document.querySelectorAll('.tab-btn[data-name^="KNX_WIRE"], .tab-btn[data-name^="PHASE_WIRE"], .tab-btn[data-name^="NEUTRAL_WIRE"], .tab-btn[data-name^="CAT6_WIRE"], .tab-btn[data-name^="IR_WIRE"], .tab-btn[data-name^="SPEAKER_WIRE"], .tab-btn[data-name^="DALI_WIRE"]').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.name === wireType.name);
                });

                document.querySelectorAll('.tab-btn[data-name]').forEach(btn => {
                    if (!btn.dataset.name.includes('WIRE')) {
                        btn.classList.remove('active');
                    }
                });

                showWireControls();
                showNotification(`${wireType.title} Mode: Select two marks to connect them`, 'info');
            }
        });

        productListEl.appendChild(wireItem);
    });

    // Add separator
    const separator = document.createElement('div');
    separator.style.height = '1px';
    separator.style.backgroundColor = 'var(--border)';
    separator.style.margin = '15px 0';
    productListEl.appendChild(separator);

    // Add product categories
    const keys = PRODUCT_ORDER.length ? PRODUCT_ORDER.filter(k => productData[k]) : Object.keys(productData);
    for (const key of keys) {
        const item = document.createElement('div');
        item.className = 'tab-btn product-tab';
        item.dataset.name = key;
        item.style.position = 'relative';
        item.style.cursor = 'pointer';
        item.style.padding = '12px 16px';
        item.style.margin = '4px 0';

        const left = document.createElement('div');
        left.className = 'tab-title';
        left.textContent = key;
        left.style.position = 'relative';
        left.style.zIndex = '2';

        const right = document.createElement('div');
        right.className = 'tab-sub';
        right.style.position = 'relative';
        right.style.zIndex = '2';

        if (productData[key].subProducts && !productData[key].isDBBox && !productData[key].isNetworkDBBox) {
            right.innerHTML = '<span class="material-icons" style="font-size:20px;color:var(--muted)">expand_more</span>';

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Get the actual clicked element
                let target = e.target;
                while (target && !target.classList.contains('tab-btn')) {
                    target = target.parentElement;
                }

                if (target) {
                    const existing = item.nextElementSibling;
                    if (existing && existing.classList.contains('sub-product-list')) {
                        existing.remove();
                        item.querySelector('.material-icons').textContent = 'expand_more';
                    } else {
                        createSubProducts(item, key);
                        item.querySelector('.material-icons').textContent = 'expand_less';
                    }
                }
            });
        } else {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Get the actual clicked element
                let target = e.target;
                while (target && !target.classList.contains('tab-btn')) {
                    target = target.parentElement;
                }

                if (target) {
                    selectProduct(key);
                }
            });
        }

        item.appendChild(left);
        item.appendChild(right);
        productListEl.appendChild(item);
    }
}
function createSubProducts(afterItem, productKey) {
    const wrap = document.createElement('div');
    wrap.className = 'sub-product-list';
    wrap.style.marginTop = '8px';
    wrap.style.marginBottom = '8px';
    wrap.style.paddingLeft = '8px';
    wrap.style.borderLeft = '2px solid var(--border)';

    const subProducts = productData[productKey].subProducts;
    for (const subKey of Object.keys(subProducts)) {
        const btn = document.createElement('div');
        btn.className = 'tab-btn';
        btn.style.background = '#f8f9fa';
        btn.style.border = '1px solid var(--border)';
        btn.dataset.name = productKey + '|' + subKey;
        btn.innerHTML = `<div class="tab-title">${subKey}</div>`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectProduct(productKey, subKey);
        });
        wrap.appendChild(btn);
    }
    afterItem.parentNode.insertBefore(wrap, afterItem.nextSibling);
}

function buildRelayOptions() {
    relayOptionsList.innerHTML = '';
    relayOptions.forEach(option => {
        const row = document.createElement('div');
        row.className = 'relay-option';
        row.dataset.optionId = option.id;
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = relayState[option.id].selected;
        checkbox.addEventListener('change', () => {
            relayState[option.id].selected = checkbox.checked;
            if (checkbox.checked) {
                lastRelaySelectionLabel = option.label;
            } else {
                if (lastRelaySelectionLabel === option.label) {
                    lastRelaySelectionLabel = '';
                }
            }
            updateRelayOverlay();
        });
        label.appendChild(checkbox);
        const span = document.createElement('span');
        span.textContent = option.label;
        label.appendChild(span);
        const qty = document.createElement('input');
        qty.type = 'number';
        qty.min = 1;
        qty.value = relayState[option.id].quantity;
        qty.addEventListener('input', () => {
            const val = Math.max(1, parseInt(qty.value || '1', 10));
            qty.value = val;
            relayState[option.id].quantity = val;
            if (checkbox.checked) {
                updateRelayOverlay();
            }
        });
        row.appendChild(label);
        const qtyWrap = document.createElement('div');
        qtyWrap.className = 'relay-qty-row';
        const qtyLabel = document.createElement('span');
        qtyLabel.textContent = 'Quantity';
        qtyWrap.appendChild(qtyLabel);
        qtyWrap.appendChild(qty);
        row.appendChild(qtyWrap);
        relayOptionsList.appendChild(row);
    });
    updateRelayOverlay();
}

function getSelectedRelayItems() {
    return relaySelectionsFromState();
}

function selectProduct(productKey, subProductKey = null) {
    // Exit wire mode when selecting a product
    isWireMode = false;
    currentWireType = null;
    hideWireControls();

    document.querySelectorAll('.tab-btn[data-name^="KNX_WIRE"], .tab-btn[data-name^="PHASE_WIRE"], .tab-btn[data-name^="NEUTRAL_WIRE"], .tab-btn[data-name^="CAT6_WIRE"], .tab-btn[data-name^="IR_WIRE"], .tab-btn[data-name^="SPEAKER_WIRE"]').forEach(btn => {
        btn.classList.remove('active');
    });

    currentProduct = productKey;
    currentSubProduct = subProductKey;

    document.querySelectorAll('.tab-btn').forEach(b => {
        const isActive = (b.dataset.name === productKey) ||
            (subProductKey && b.dataset.name === (productKey + '|' + subProductKey));
        b.classList.toggle('active', isActive);
    });

    // Clean up text input when switching away from TEXT
    if (currentProduct !== productKey && currentProduct === 'TEXT') {
        // Remove text instruction
        const textInstruction = document.querySelector('.text-instruction');
        if (textInstruction) {
            textInstruction.remove();
        }

        // Remove text controls
        const textControls = document.getElementById('textLabelControls');
        if (textControls) {
            textControls.remove();
        }

        // Restore product image display
        productImage.style.display = 'block';
    }

    let data = productData[productKey];
    let title = data.title || productKey;
    let desc = data.desc || '';
    let img = '';
    let features = [];
    const isRelay = productKey === 'Z-WAVE RELAY';
    const isDBBox = data.isDBBox || false;
    const isNetworkDBBox = data.isNetworkDBBox || false;
    const isTextLabel = data.isTextLabel || false;
    const isMultiComponent = data.isMultiComponent || false;
    const isEmitter = data.isEmitter || false;
    const isEquipment = data.isEquipment || false; // Check if it's equipment
    const isSwitchFamily = switchFamilies.has(productKey); // Check if it's a switch family

    if (isDBBox) {
        title = data.title;
        desc = data.desc;
        img = data.img || '';
        features = data.features || [];
        currentSubProduct = null;
    } else if (isNetworkDBBox) {
        title = data.title;
        desc = data.desc;
        img = data.img || '';
        features = data.features || [];
        currentSubProduct = null;
    } else if (isTextLabel) {
        title = data.title;
        desc = data.desc;
        img = data.img || '';
        features = [];
        currentSubProduct = null;
    } else if (isEquipment && subProductKey && data.subProducts && data.subProducts[subProductKey]) {
        const subData = data.subProducts[subProductKey];
        title = subData.title;
        desc = subData.desc;
        img = subData.icon || ''; // Use icon for equipment
        features = [];
    } else if (isSwitchFamily && subProductKey && data.subProducts && data.subProducts[subProductKey]) {
        const subData = data.subProducts[subProductKey];
        title = subData.title;
        desc = subData.desc;
        img = subData.img || '';
        features = subData.features || [];
    } else if (isMultiComponent && subProductKey && data.subProducts && data.subProducts[subProductKey]) {
        const subData = data.subProducts[subProductKey];
        title = subData.title;
        desc = subData.desc;
        img = subData.img || '';
        features = [];
    } else if (subProductKey && data.subProducts && data.subProducts[subProductKey]) {
        const subData = data.subProducts[subProductKey];
        title = subData.title;
        desc = subData.desc;
        img = subData.img;
        features = subData.features || [];
    } else if (data.subProducts) {
        title = data.title;
        desc = data.desc;
        img = '';
        features = [];
    }

    pTitle.textContent = title;
    pDesc.textContent = desc;

    const resolvedImg = img || data.img || '';
    if (resolvedImg) {
        productImage.src = resolvedImg;
        productImage.style.display = 'block';

        // For equipment, use the CDN icon
        if (isEquipment && subProductKey) {
            productImage.style.width = '64px';
            productImage.style.height = '64px';
            productImage.style.objectFit = 'contain';
        } else {
            productImage.style.width = '';
            productImage.style.height = '';
            productImage.style.objectFit = '';
        }
    } else {
        productImage.style.display = 'none';
    }

    pMeta.innerHTML = '';
    if (subProductKey && !isDBBox && !isNetworkDBBox && !isTextLabel && !isEquipment) {
        const meta = document.createElement('div');
        meta.className = 'meta-item';
        meta.textContent = subProductKey;
        pMeta.appendChild(meta);
    }

    if (isRelay) {
        featuresSection.style.display = 'none';
        relayControlsEl.style.display = 'block';
        buildRelayOptions();
        productImageOverlay.style.display = 'block';
        updateRelayOverlay();

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

    } else if (isEmitter) {
        // For EMITTER - Show clean interface similar to TEXT
        pTitle.textContent = data.title;
        pDesc.textContent = data.desc;

        // Hide product image if not available
        if (data.img) {
            productImage.src = data.img;
            productImage.style.display = 'block';
        } else {
            productImage.style.display = 'none';
        }

        // Hide features section
        featuresSection.style.display = 'none';
        relayControlsEl.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        // Clear features
        pFeatures.innerHTML = '';

        // Add emitter-specific features
        const featureLi = document.createElement('li');
        featureLi.textContent = 'RF/IR emitter device';
        pFeatures.appendChild(featureLi);

        const featureLi2 = document.createElement('li');
        featureLi2.textContent = 'Serial numbering: E1, E2, E3...';
        pFeatures.appendChild(featureLi2);

        const featureLi3 = document.createElement('li');
        featureLi3.textContent = 'No modal popup on click';
        pFeatures.appendChild(featureLi3);

        // Clear pMeta
        pMeta.innerHTML = '';

        resetRelayPreview();
        lastRelaySelectionLabel = '';

    } else if (isEquipment) {
        // For EQUIPMENTS - Show icon-based interface
        pTitle.textContent = title;
        pDesc.textContent = desc;

        // Show features section
        featuresSection.style.display = 'block';
        relayControlsEl.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        // Clear and add equipment features
        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = `Equipment: ${subProductKey || 'Select equipment type'}`;
            pFeatures.appendChild(li);
        }

        // Clear pMeta
        pMeta.innerHTML = '';

    } else if (isSwitchFamily) {
        // For switch families - Show configuration controls
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'block';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        // Create switch configuration controls
        createSwitchConfigurationControls();

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');

        // Clear and add switch features
        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Select a model to see features';
            pFeatures.appendChild(li);
        }

    } else if (isDBBox) {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        createAutomationDBBoxControls();

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        }
    } else if (isNetworkDBBox) {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        createNetworkDBBoxControls();

        // Hide other controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        }
    } else if (isTextLabel) {
        // For TEXT labels - Show clean interface
        pTitle.textContent = "Text Label";
        pDesc.textContent = "Add custom text annotations to the floor plan";

        // Hide product image
        productImage.style.display = 'none';
        productImageOverlay.style.display = 'none';

        // Hide features section
        featuresSection.style.display = 'none';
        relayControlsEl.style.display = 'none';

        // Remove existing special controls
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        // Clear features
        pFeatures.innerHTML = '';

        // Add text-specific feature
        const featureLi = document.createElement('li');
        featureLi.textContent = 'Plain text annotations (no background/border)';
        pFeatures.appendChild(featureLi);

        const featureLi2 = document.createElement('li');
        featureLi2.textContent = 'Max 15 characters';
        pFeatures.appendChild(featureLi2);

        const featureLi3 = document.createElement('li');
        featureLi3.textContent = 'Drag to move, no modal on click';
        pFeatures.appendChild(featureLi3);

        // Clear pMeta
        pMeta.innerHTML = '';

        // Create text input controls
        createTextLabelControls();
    } else if (isMultiComponent && subProductKey) {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        createMultiComponentControls(productKey, subProductKey);

        // Hide other controls
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        pFeatures.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = 'Multi-component audio system';
        pFeatures.appendChild(li);
    } else {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'block';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';

        // Hide all special controls
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        document.getElementById('switchConfigControls') && (document.getElementById('switchConfigControls').style.display = 'none');

        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Select a sub-product to see features';
            pFeatures.appendChild(li);
        }
    }
}

function createTextLabelControls() {
    const existingControls = document.getElementById('textLabelControls');
    if (existingControls) {
        existingControls.remove();
    }

    const textControlsHTML = `
        <div class="mark-controls-box" id="textLabelControls" style="margin-top: 20px; border-color: #667eea;">
            <h3 style="color: #667eea; margin-bottom: 15px;">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">text_fields</span>
                Plain Text Label
            </h3>
            
            <div class="form-group">
                <label style="color: #667eea; font-weight: 500;">Text Content <span style="color: #999; font-size: 11px;">(Max 15 chars)</span></label>
                <input type="text" 
                       id="textLabelInput" 
                       class="form-control" 
                       placeholder="Enter text (e.g., Living Room)"
                       maxlength="15"
                       style="border-color: #667eea; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span class="material-icons" style="font-size: 11px; vertical-align: middle;">info</span>
                    Plain black text with no background or border
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 12px; background: #f0f4ff; border-radius: 6px; border: 1px solid #c3dafe;">
                <div style="font-size: 12px; color: #667eea; margin-bottom: 4px;">
                    <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                    Plain Text Labels:
                </div>
                <div style="font-size: 11px; color: #555;">
                    1. Just black text, no background or border<br>
                    2. Max 15 characters<br>
                    3. Drag to move - cursor follows smoothly<br>
                    4. No modal opens when clicked<br>
                    5. Shows as plain text in marks list
                </div>
            </div>
        </div>
    `;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', textControlsHTML);

        // Add Enter key support to text input
        const textInput = document.getElementById('textLabelInput');
        if (textInput) {
            textInput.addEventListener('input', function () {
                // Show character count
                const charCount = this.value.length;
                if (charCount >= 12) {
                    this.style.borderColor = '#ff9800';
                } else {
                    this.style.borderColor = '#667eea';
                }
            });

            textInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    const shape = markShapeEl.value;
                    let sizePercent = parseFloat(markSizeEl.value) || 4;
                    if (sizePercent <= 0) sizePercent = 4;

                    if (imageNaturalWidth && imageNaturalHeight) {
                        const sizePixels = (sizePercent / 100) * Math.min(imageNaturalWidth, imageNaturalHeight);
                        const centerX = imageNaturalWidth / 2;
                        const centerY = imageNaturalHeight / 2;

                        addTextLabel(this.value.trim(), shape, sizePixels);
                        this.value = '';
                        this.focus();
                    }
                }
            });

            // Focus the input when TEXT category is selected
            setTimeout(() => {
                textInput.focus();
            }, 100);
        }
    }
}
// Add this function to create text marks
function addTextMark(text) {
    const shape = markShapeEl.value;
    let sizePercent = parseFloat(markSizeEl.value) || 4;
    if (sizePercent <= 0) sizePercent = 4;

    if (imageNaturalWidth && imageNaturalHeight) {
        const sizePixels = (sizePercent / 100) * Math.min(imageNaturalWidth, imageNaturalHeight);
        const centerX = imageNaturalWidth / 2;
        const centerY = imageNaturalHeight / 2;

        createTextMark({
            x: centerX - (sizePixels / 2),
            y: centerY - (sizePixels / 2),
            size: sizePixels,
            shape: shape,
            text: text
        });
    }
}

// Add this function to create text mark elements
function createTextMark({ x, y, size, shape, text }) {
    const id = 'mark-' + (++markCounter);
    const { seriesCode, label } = nextSeriesLabel('TEXT');

    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.size = size;
    el.dataset.shape = shape;

    // Style for text label
    el.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    el.style.borderColor = '#667eea';
    el.style.borderWidth = '2px';
    el.style.borderStyle = 'solid';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.padding = '6px';
    el.style.cursor = 'move';

    const textSpan = document.createElement('span');
    textSpan.className = 'label-text';
    textSpan.textContent = text;
    textSpan.style.color = '#333';
    textSpan.style.fontSize = '12px';
    textSpan.style.fontWeight = '600';
    textSpan.style.textAlign = 'center';
    textSpan.style.lineHeight = '1.2';
    textSpan.style.whiteSpace = 'nowrap';
    textSpan.style.overflow = 'hidden';
    textSpan.style.textOverflow = 'ellipsis';
    textSpan.style.maxWidth = '100px';

    el.appendChild(textSpan);

    const badge = document.createElement('div');
    badge.className = 'label-badge';
    badge.textContent = label;
    badge.style.backgroundColor = '#667eea';
    badge.style.color = '#FFFFFF';
    el.appendChild(badge);

    // Add hover effect
    el.addEventListener('mouseenter', function () {
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
    });

    el.addEventListener('mouseleave', function () {
        this.style.boxShadow = '';
    });

    imgInner.appendChild(el);

    const markData = {
        id,
        x,
        y,
        size,
        shape,
        el,
        seriesCode,
        seriesLabel: label,
        tooltip: null,
        categoryName: 'Text Label',
        modelName: text,
        desc: `Text Label: ${text}`,
        features: [],
        imageSrc: null,
        isTextLabel: true,
        text: text,
        labelElement: textSpan
    };

    marks.push(markData);

    // Add click event - just for selection, no modal
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        selectedMarkId = id;
        updateMarkSelection();
        // No modal opens for text labels
    });

    // Add dragging functionality
    setupMarkDragging(el, markData);

    updateMarkPosition(markData);
    updateMarkSelection();

    showNotification(`Text label "${text}" added as ${label}`, 'success');

    return markData;
}



function attachTextLabelEvents() {
    const textInput = document.getElementById('textLabelInput');
    const fontSizeSlider = document.getElementById('textFontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const addTextBtn = document.getElementById('addTextLabelBtn');

    // Font size slider
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', function () {
            fontSizeValue.textContent = this.value;
        });
    }

    // Add text label button
    if (addTextBtn) {
        addTextBtn.addEventListener('click', function () {
            if (!textInput.value.trim()) {
                showNotification('Please enter text for the label', 'error');
                return;
            }

            addTextLabel(
                textInput.value.trim(),
                parseInt(fontSizeSlider.value)
            );

            // Clear input
            textInput.value = '';
        });
    }
}

function addTextLabel(text, shape, sizePixels) {
    if (!text || text.trim() === '') {
        showNotification('Please enter text for the label', 'error');
        return;
    }

    if (!imageNaturalWidth || !imageNaturalHeight) {
        showNotification('Please wait for floor plan to load', 'error');
        return;
    }

    // Limit text to 15 characters
    const displayText = text.trim().substring(0, 15);

    // Center the label on the image
    const centerX = imageNaturalWidth / 2;
    const centerY = imageNaturalHeight / 2;

    // Create the text mark WITHOUT series code
    const id = 'mark-' + (++markCounter);

    const el = document.createElement('div');
    el.className = 'mark text-label';
    el.dataset.id = id;
    el.dataset.size = sizePixels;
    el.dataset.shape = shape;
    el.dataset.isTextLabel = true;

    // Create text span - PLAIN TEXT WITH NO STYLING
    const textSpan = document.createElement('span');
    textSpan.className = 'text-label-content';
    textSpan.textContent = displayText;
    textSpan.style.cssText = `
        color: #000000;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        cursor: move;
        display: block;
        line-height: 1;
    `;

    // NO BACKGROUND, NO BORDER - JUST PLAIN TEXT
    el.style.cssText = `
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        display: inline-block;
        cursor: move;
        padding: 0 !important;
        margin: 0 !important;
    `;

    el.appendChild(textSpan);
    imgInner.appendChild(el);

    const markData = {
        id,
        x: centerX,
        y: centerY,
        size: sizePixels,
        shape,
        el,
        seriesCode: '',
        seriesLabel: '', // Empty label for text
        tooltip: null,
        categoryName: 'Text Label',
        modelName: displayText,
        desc: `Text Label: ${displayText}`,
        features: ['Custom text annotation'],
        imageSrc: previewImage.src,
        isTextLabel: true,
        text: displayText
    };

    marks.push(markData);

    // Add click event for text labels - NO MODAL
    el.addEventListener('click', function (e) {
        e.stopPropagation();

        if (isWireMode && currentWireType && !e.defaultPrevented) {
            // Wire selection logic
            if (!wireStartMark) {
                wireStartMark = markData;
                showNotification(`First mark selected: "${displayText}". Now select second mark.`, 'info');
            } else if (!wireEndMark && wireStartMark !== markData) {
                wireEndMark = markData;
                const wireTypeInfo = getWireTypeInfo(currentWireType);
                showNotification(`Second mark selected: "${displayText}". ${currentWireMode === 'curve' ? 'Adjust curve' : 'Add points'} and click "Create ${wireTypeInfo.title}".`, 'info');
            } else if (wireStartMark === markData) {
                wireStartMark = null;
                wireEndMark = null;
                wirePoints = [];
                showNotification('First mark selection cleared.', 'info');
            } else if (wireEndMark === markData) {
                wireEndMark = null;
                wirePoints = [];
                showNotification('Second mark selection cleared.', 'info');
            }
            updateWireSelectionLabels();
            updatePointsList();
            e.preventDefault();
        } else if (!isWireMode && !e.defaultPrevented) {
            selectedMarkId = id;
            updateMarkSelection();
            // Don't open modal for text labels
        }
    });

    // Setup proper dragging for text label
    setupTextLabelDragging(el, markData);

    updateMarkPosition(markData);
    updateMarkSelection();
    renderMarksList();

    showNotification(`Text label "${displayText}" added`, 'success');

    return markData;
}
function setupTextLabelDragging(el, markData) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let startMarkX = 0, startMarkY = 0;
    let isPointerDown = false;

    function onPointerDown(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        if (el.setPointerCapture) el.setPointerCapture(ev.pointerId);
        isPointerDown = true;
        startX = ev.clientX;
        startY = ev.clientY;
        startMarkX = markData.x;
        startMarkY = markData.y;
        selectedMarkId = markData.id;
        updateMarkSelection();

        // Add a slight visual feedback for dragging
        el.style.cursor = 'grabbing';
        if (markData.textEl) {
            markData.textEl.style.textShadow = '0 0 2px rgba(0,0,0,0.1)';
        }
    }

    function onPointerMove(ev) {
        if (!isPointerDown) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        // Start dragging only after minimal movement to avoid accidental drags
        if (!isDragging && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
            isDragging = true;
        }

        if (!isDragging) return;

        ev.preventDefault();
        ev.stopPropagation();

        const transform = getImageTransform();
        if (!transform || !imageNaturalWidth || !imageNaturalHeight) return;

        const imgRect = previewImage.getBoundingClientRect();

        // Calculate scale more accurately
        const scaleX = imageNaturalWidth / imgRect.width;
        const scaleY = imageNaturalHeight / imgRect.height;

        const imageDx = dx * scaleX;
        const imageDy = dy * scaleY;

        let newX = startMarkX + imageDx;
        let newY = startMarkY + imageDy;

        // Constrain to image bounds
        newX = Math.max(0, Math.min(imageNaturalWidth - 10, newX));
        newY = Math.max(0, Math.min(imageNaturalHeight - 10, newY));

        markData.x = newX;
        markData.y = newY;

        updateMarkPosition(markData);
    }

    function onPointerUp(ev) {
        if (isPointerDown) {
            isPointerDown = false;
            isDragging = false;

            try {
                if (el.releasePointerCapture) el.releasePointerCapture(ev.pointerId);
            } catch (e) { }

            // Reset cursor and visual effects
            el.style.cursor = 'move';
            if (markData.textEl) {
                markData.textEl.style.textShadow = '';
            }

            // Don't open modal for text labels even on click
            selectedMarkId = markData.id;
            updateMarkSelection();
        }
    }

    // Store reference to text element for styling during drag
    markData.textEl = el.querySelector('.text-label-content');

    // Set initial cursor
    el.style.cursor = 'move';

    el.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    // Prevent text selection while dragging
    el.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}
function createTextMark(options) {
    const { x, y, size, shape, text, fontSize } = options;

    const id = 'mark-' + (++markCounter);
    const { seriesCode, label } = nextSeriesLabel('TEXT');

    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.size = size;
    el.dataset.shape = shape;
    el.dataset.isTextLabel = true;

    // Style for text label
    el.style.backgroundColor = '#FFFFFF';
    el.style.borderColor = '#607D8B';
    el.style.borderWidth = '2px';
    el.style.borderStyle = 'solid';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.padding = '4px 8px';

    const textSpan = document.createElement('span');
    textSpan.className = 'label-text';
    textSpan.textContent = text;
    textSpan.style.color = '#000000';
    textSpan.style.fontSize = fontSize + 'px';
    textSpan.style.fontWeight = '600';
    textSpan.style.textAlign = 'center';
    textSpan.style.lineHeight = '1.2';
    textSpan.style.whiteSpace = 'nowrap';
    textSpan.style.overflow = 'hidden';
    textSpan.style.textOverflow = 'ellipsis';

    el.appendChild(textSpan);

    const badge = document.createElement('div');
    badge.className = 'label-badge';
    badge.textContent = label;
    badge.style.backgroundColor = '#607D8B';
    badge.style.color = '#FFFFFF';
    el.appendChild(badge);

    imgInner.appendChild(el);

    const markData = {
        id,
        x,
        y,
        size,
        shape,
        el,
        seriesCode,
        seriesLabel: label,
        tooltip: null,
        categoryName: 'Text Label',
        modelName: text,
        desc: `Text Label: ${text}`,
        features: [],
        imageSrc: null,
        isTextLabel: true,
        text: text,
        fontSize: fontSize,
        labelElement: textSpan
    };

    marks.push(markData);

    // Add click event to open modal
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        selectedMarkId = id;
        updateMarkSelection();
        openTextLabelModal(markData);
    });

    // Add dragging functionality
    setupMarkDragging(el, markData);

    updateMarkPosition(markData);
    updateMarkSelection();

    showNotification(`Text label "${text}" added`, 'success');

    return markData;
}
/* ------------------------- WIRE MAPPING FUNCTIONS ------------------------- */
function getWireTypeInfo(type) {
    return wireTypes.find(wt => wt.id === type) || wireTypes[0];
}

function showWireControls() {
    const wireTypeInfo = getWireTypeInfo(currentWireType);

    hideWireControls();

    const wireControlsHTML = `
        <div class="mark-controls-box" id="wireControls" style="margin-top: 20px; border-color: ${wireTypeInfo.color};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: ${wireTypeInfo.color}; margin: 0;">
                    <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">${wireTypeInfo.icon}</span>
                    ${wireTypeInfo.title} Mapping
                </h3>
                <button id="clearWireSelectionBtn" class="btn" style="padding: 4px 8px; font-size: 11px; background: #f8f9fa; border-color: #ccc;">
                    <span class="material-icons" style="font-size: 14px; margin-right: 4px;">clear</span>
                    Clear
                </button>
            </div>
            
            <div class="form-group">
                <div style="background: ${wireTypeInfo.bgColor}; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid ${wireTypeInfo.borderColor};">
                    <div style="font-size: 12px; color: ${wireTypeInfo.color}; margin-bottom: 8px;">
                        <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                        Select two marks to connect them with a ${wireTypeInfo.title.toLowerCase()}
                    </div>
                    <div style="font-size: 11px; color: #555; display: flex; align-items: center; gap: 12px;">
                        <span id="wireStartLabel">Start: <strong>None</strong></span>
                        <span class="material-icons" style="font-size: 16px; color: ${wireTypeInfo.color};">arrow_forward</span>
                        <span id="wireEndLabel">End: <strong>None</strong></span>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label style="color: ${wireTypeInfo.color};">Wire Mode</label>
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <button id="curveModeBtn" class="btn" style="flex: 1; border-color: ${currentWireMode === 'curve' ? wireTypeInfo.color : '#ccc'}; color: ${currentWireMode === 'curve' ? wireTypeInfo.color : '#666'};">
                        <span class="material-icons" style="font-size: 16px; margin-right: 4px;">timeline</span>
                        Curve Mode
                    </button>
                    <button id="pointsModeBtn" class="btn" style="flex: 1; border-color: ${currentWireMode === 'points' ? wireTypeInfo.color : '#ccc'}; color: ${currentWireMode === 'points' ? wireTypeInfo.color : '#666'};">
                        <span class="material-icons" style="font-size: 16px; margin-right: 4px;">control_point</span>
                        Points Mode
                    </button>
                </div>
            </div>

            <div id="curveControls" class="form-group" style="${currentWireMode === 'curve' ? '' : 'display: none;'}">
                <label style="color: ${wireTypeInfo.color};">Wire Curve Level</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 11px; color: #666;">-100</span>
                    <input type="range" id="wireCurveSlider" min="-100" max="100" value="0" style="flex: 1;">
                    <span style="font-size: 11px; color: #666;">100</span>
                    <span id="curveValue" style="font-size: 12px; font-weight: bold; color: ${wireTypeInfo.color}; min-width: 30px; text-align: center;">0</span>
                </div>
            </div>

            <div id="pointsControls" class="form-group" style="${currentWireMode === 'points' ? '' : 'display: none;'}">
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 12px; color: ${wireTypeInfo.color};">Control Points (${wirePoints.length})</span>
                        <button id="addPointBtn" class="btn" style="padding: 4px 8px; font-size: 11px;">
                            <span class="material-icons" style="font-size: 14px; margin-right: 2px;">add</span>
                            Add Point
                        </button>
                    </div>
                    <div id="pointsList" style="max-height: 80px; overflow-y: auto; padding: 8px; background: #f8f9fa; border-radius: 6px; border: 1px solid var(--border); font-size: 11px;">
                        <div style="color: var(--muted); text-align: center; padding: 4px;">No points added yet</div>
                    </div>
                </div>
                <div style="color: #666; font-size: 10px; padding: 6px; background: #f8f9fa; border-radius: 4px;">
                    <span class="material-icons" style="font-size: 10px; vertical-align: middle; margin-right: 2px;">info</span>
                    Click "Add Point" to add control points • Points are visible only during creation
                </div>
            </div>

            <div class="form-group" id="wireActionButtons" style="display: ${wireStartMark && wireEndMark ? 'block' : 'none'};">
                <button id="createWireBtn" class="btn primary full-width" style="background: ${wireTypeInfo.color}; border-color: ${wireTypeInfo.color};">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">add_link</span>
                    Create ${wireTypeInfo.title}
                </button>
                <button id="cancelWireBtn" class="btn full-width" style="margin-top: 8px; border-color: #666; color: #666;">
                    Cancel
                </button>
            </div>

            <div class="form-group">
                <label style="color: ${wireTypeInfo.color};">Existing ${wireTypeInfo.title}s</label>
                <div id="wiresList" style="max-height: 120px; overflow-y: auto; padding: 8px; background: #f8f9fa; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="color: var(--muted); font-size: 12px; text-align: center; padding: 8px;">No ${wireTypeInfo.title.toLowerCase()}s created yet</div>
                </div>
            </div>

            <div style="margin-top: 12px; color: #666; font-size: 11px; text-align: center; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle; margin-right: 4px;">tips_and_updates</span>
                Wire color: ${wireTypeInfo.title} • Click wire to select • Drag to move • Click Clear to reset
            </div>
        </div>
    `;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', wireControlsHTML);
        attachWireControlsEvents();
        updateWiresList();
        updateWireSelectionLabels();
    }
}

function attachWireControlsEvents() {
    const curveBtn = document.getElementById('curveModeBtn');
    const pointsBtn = document.getElementById('pointsModeBtn');
    const addPointBtn = document.getElementById('addPointBtn');
    const createWireBtn = document.getElementById('createWireBtn');
    const cancelWireBtn = document.getElementById('cancelWireBtn');
    const clearWireSelectionBtn = document.getElementById('clearWireSelectionBtn');

    if (curveBtn) {
        curveBtn.addEventListener('click', () => setWireMode('curve'));
    }

    if (pointsBtn) {
        pointsBtn.addEventListener('click', () => setWireMode('points'));
    }

    if (addPointBtn) {
        addPointBtn.addEventListener('click', addControlPoint);
    }

    if (createWireBtn) {
        createWireBtn.addEventListener('click', createWire);
    }

    if (cancelWireBtn) {
        cancelWireBtn.addEventListener('click', cancelWire);
    }

    if (clearWireSelectionBtn) {
        clearWireSelectionBtn.addEventListener('click', clearWireSelection);
    }

    const wireCurveSlider = document.getElementById('wireCurveSlider');
    if (wireCurveSlider) {
        wireCurveSlider.addEventListener('input', function () {
            const curveValue = document.getElementById('curveValue');
            if (curveValue) {
                curveValue.textContent = this.value;
                updateWirePreview();
            }
        });
    }
}

function hideWireControls() {
    const wireControls = document.getElementById('wireControls');
    if (wireControls) {
        wireControls.remove();
    }
}

function setWireMode(mode) {
    currentWireMode = mode;
    wirePoints = [];

    document.querySelectorAll('.draggable-point').forEach(el => el.remove());

    const curveBtn = document.getElementById('curveModeBtn');
    const pointsBtn = document.getElementById('pointsModeBtn');
    const wireTypeInfo = getWireTypeInfo(currentWireType);

    if (curveBtn) {
        curveBtn.style.borderColor = mode === 'curve' ? wireTypeInfo.color : '#ccc';
        curveBtn.style.color = mode === 'curve' ? wireTypeInfo.color : '#666';
    }
    if (pointsBtn) {
        pointsBtn.style.borderColor = mode === 'points' ? wireTypeInfo.color : '#ccc';
        pointsBtn.style.color = mode === 'points' ? wireTypeInfo.color : '#666';
    }

    const curveControls = document.getElementById('curveControls');
    const pointsControls = document.getElementById('pointsControls');

    if (curveControls) curveControls.style.display = mode === 'curve' ? 'block' : 'none';
    if (pointsControls) pointsControls.style.display = mode === 'points' ? 'block' : 'none';

    const tempWire = document.querySelector('.wire-preview');
    if (tempWire) {
        tempWire.remove();
    }

    if (wireStartMark && wireEndMark) {
        updateWirePreview();
    }

    updatePointsList();
}

function updateWireSelectionLabels() {
    const startLabel = document.getElementById('wireStartLabel');
    const endLabel = document.getElementById('wireEndLabel');

    if (startLabel && endLabel) {
        startLabel.innerHTML = `Start: <strong>${wireStartMark ? wireStartMark.seriesLabel : 'None'}</strong>`;
        endLabel.innerHTML = `End: <strong>${wireEndMark ? wireEndMark.seriesLabel : 'None'}</strong>`;

        const wireActionButtons = document.getElementById('wireActionButtons');

        if (wireStartMark && wireEndMark) {
            if (wireActionButtons) wireActionButtons.style.display = 'block';
            updateWirePreview();
        } else {
            if (wireActionButtons) wireActionButtons.style.display = 'none';
        }
    }
}

function resetWireSelection() {
    wireStartMark = null;
    wireEndMark = null;

    document.querySelectorAll('.draggable-point').forEach(el => el.remove());
    wirePoints = [];

    updateWireSelectionLabels();

    const tempWire = document.querySelector('.wire-preview');
    if (tempWire) {
        tempWire.remove();
    }

    updatePointsList();
}

function addControlPoint() {
    if (!wireStartMark || !wireEndMark) {
        showNotification('Please select start and end marks first', 'error');
        return;
    }

    const transform = getImageTransform();
    if (!transform) return;

    let newX, newY;

    if (wirePoints.length === 0) {
        const startX = wireStartMark.x + (wireStartMark.size / 2);
        const startY = wireStartMark.y + (wireStartMark.size / 2);
        const endX = wireEndMark.x + (wireEndMark.size / 2);
        const endY = wireEndMark.y + (wireEndMark.size / 2);

        newX = (startX + endX) / 2;
        newY = (startY + endY) / 2;
    } else {
        const lastPoint = wirePoints[wirePoints.length - 1];
        const endX = wireEndMark.x + (wireEndMark.size / 2);
        const endY = wireEndMark.y + (wireEndMark.size / 2);

        newX = (lastPoint.x + endX) / 2;
        newY = (lastPoint.y + endY) / 2;
    }

    const point = {
        id: `point-${Date.now()}`,
        x: newX,
        y: newY,
        element: null
    };

    wirePoints.push(point);
    updatePointsList();
    updateWirePreview();

    showNotification(`Point added at position X: ${Math.round(newX)}, Y: ${Math.round(newY)}`, 'info');
}

function updatePointsList() {
    const pointsList = document.getElementById('pointsList');
    if (!pointsList) return;

    pointsList.innerHTML = '';

    if (wirePoints.length === 0) {
        pointsList.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 4px;">No points added yet</div>';
        return;
    }

    wirePoints.forEach((point, index) => {
        const pointItem = document.createElement('div');
        pointItem.className = 'mark-item';
        pointItem.style.marginBottom = '4px';
        pointItem.style.padding = '6px 8px';
        pointItem.style.fontSize = '11px';

        pointItem.innerHTML = `
            <span style="flex: 1;">
                Point ${index + 1}: X ${Math.round(point.x)}, Y ${Math.round(point.y)}
            </span>
            <button class="btn delete-point-btn" data-point-id="${point.id}" style="padding: 2px 4px; min-height: 20px; font-size: 10px;">
                <span class="material-icons" style="font-size: 12px;">delete</span>
            </button>
        `;

        const deleteBtn = pointItem.querySelector('.delete-point-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeControlPoint(point.id);
        });

        pointsList.appendChild(pointItem);
    });
}

function removeControlPoint(pointId) {
    const index = wirePoints.findIndex(p => p.id === pointId);
    if (index > -1) {
        if (wirePoints[index].element && wirePoints[index].element.parentNode) {
            wirePoints[index].element.parentNode.removeChild(wirePoints[index].element);
        }
        wirePoints.splice(index, 1);
        updatePointsList();
        updateWirePreview();
    }
}

function updateWirePreview() {
    if (!wireStartMark || !wireEndMark || !currentWireType) return;

    const existingPreview = document.querySelector('.wire-preview');
    if (existingPreview) {
        existingPreview.remove();
    }

    document.querySelectorAll('.draggable-point').forEach(el => el.remove());

    if (currentWireMode === 'curve') {
        const curveSlider = document.getElementById('wireCurveSlider');
        const curveValue = curveSlider ? parseInt(curveSlider.value) : 0;
        createCurveWirePreview(wireStartMark, wireEndMark, curveValue);
    } else {
        createPointsWirePreview(wireStartMark, wireEndMark, wirePoints);
        createDraggablePoints();
    }
}

function createCurveWirePreview(startMark, endMark, curveValue = 0) {
    const transform = getImageTransform();
    if (!transform) return;

    const startX = startMark.x * transform.scaleX + transform.imgOffsetX + (startMark.size * transform.scaleX / 2);
    const startY = startMark.y * transform.scaleY + transform.imgOffsetY + (startMark.size * transform.scaleY / 2);
    const endX = endMark.x * transform.scaleX + transform.imgOffsetX + (endMark.size * transform.scaleX / 2);
    const endY = endMark.y * transform.scaleY + transform.imgOffsetY + (endMark.size * transform.scaleY / 2);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "wire-preview");
    svg.setAttribute("data-wire-type", currentWireType);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "5";

    const wireTypeInfo = getWireTypeInfo(currentWireType);
    const wireColor = wireTypeInfo.color;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let pathData;

    if (curveValue === 0) {
        pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
        const curveFactor = Math.abs(curveValue) / 100;
        const controlDistance = distance * 0.5 * curveFactor;

        if (curveValue > 0) {
            const angle = Math.atan2(dy, dx);
            const perpendicular = angle + Math.PI / 2;

            const controlX1 = startX + Math.cos(perpendicular) * controlDistance;
            const controlY1 = startY + Math.sin(perpendicular) * controlDistance;
            const controlX2 = endX + Math.cos(perpendicular) * controlDistance;
            const controlY2 = endY + Math.sin(perpendicular) * controlDistance;

            pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        } else {
            const angle = Math.atan2(dy, dx);
            const perpendicular = angle - Math.PI / 2;

            const controlX1 = startX + Math.cos(perpendicular) * controlDistance;
            const controlY1 = startY + Math.sin(perpendicular) * controlDistance;
            const controlX2 = endX + Math.cos(perpendicular) * controlDistance;
            const controlY2 = endY + Math.sin(perpendicular) * controlDistance;

            pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        }
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", wireColor + "80");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "5,5");

    svg.appendChild(path);
    imgInner.appendChild(svg);
}

function createPointsWirePreview(startMark, endMark, points) {
    const transform = getImageTransform();
    if (!transform) return;

    const startX = startMark.x * transform.scaleX + transform.imgOffsetX + (startMark.size * transform.scaleX / 2);
    const startY = startMark.y * transform.scaleY + transform.imgOffsetY + (startMark.size * transform.scaleY / 2);
    const endX = endMark.x * transform.scaleX + transform.imgOffsetX + (endMark.size * transform.scaleX / 2);
    const endY = endMark.y * transform.scaleY + transform.imgOffsetY + (endMark.size * transform.scaleY / 2);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "wire-preview");
    svg.setAttribute("data-wire-type", currentWireType);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "5";

    const wireTypeInfo = getWireTypeInfo(currentWireType);
    const wireColor = wireTypeInfo.color;

    let pathData = `M ${startX} ${startY}`;

    points.forEach(point => {
        const pointX = point.x * transform.scaleX + transform.imgOffsetX;
        const pointY = point.y * transform.scaleY + transform.imgOffsetY;
        pathData += ` L ${pointX} ${pointY}`;
    });

    pathData += ` L ${endX} ${endY}`;

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", wireColor + "80");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "5,5");

    svg.appendChild(path);
    imgInner.appendChild(svg);
}

function createDraggablePoints() {
    const transform = getImageTransform();
    if (!transform) return;

    const wireTypeInfo = getWireTypeInfo(currentWireType);

    wirePoints.forEach((point, index) => {
        if (point.element && point.element.parentNode) {
            point.element.parentNode.removeChild(point.element);
        }

        const pointEl = document.createElement('div');
        pointEl.className = 'draggable-point';
        pointEl.dataset.pointId = point.id;
        pointEl.dataset.pointIndex = index;
        pointEl.style.position = 'absolute';
        pointEl.style.width = '16px';
        pointEl.style.height = '16px';
        pointEl.style.background = wireTypeInfo.color;
        pointEl.style.border = '2px solid white';
        pointEl.style.borderRadius = '50%';
        pointEl.style.cursor = 'move';
        pointEl.style.zIndex = '10';
        pointEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        pointEl.style.transition = 'all 0.2s ease';

        const x = point.x * transform.scaleX + transform.imgOffsetX - 8;
        const y = point.y * transform.scaleY + transform.imgOffsetY - 8;
        pointEl.style.left = x + 'px';
        pointEl.style.top = y + 'px';

        point.element = pointEl;
        setupPointDragging(point, pointEl, index);

        pointEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        imgInner.appendChild(pointEl);
    });
}

function setupPointDragging(point, pointEl, index) {
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let pointStartX = 0, pointStartY = 0;

    pointEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        pointStartX = point.x;
        pointStartY = point.y;
        pointEl.style.cursor = 'grabbing';
        pointEl.style.zIndex = '11';
        pointEl.classList.add('dragging');
        pointEl.style.transform = 'scale(1.4)';
        pointEl.style.boxShadow = '0 6px 12px rgba(0,0,0,0.5)';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        const transform = getImageTransform();
        if (!transform) return;

        const imgRect = previewImage.getBoundingClientRect();
        const scaleX = imageNaturalWidth / imgRect.width;
        const scaleY = imageNaturalHeight / imgRect.height;

        const imageDx = dx * scaleX;
        const imageDy = dy * scaleY;

        point.x = pointStartX + imageDx;
        point.y = pointStartY + imageDy;

        point.x = Math.max(0, Math.min(imageNaturalWidth, point.x));
        point.y = Math.max(0, Math.min(imageNaturalHeight, point.y));

        const newX = point.x * transform.scaleX + transform.imgOffsetX - 8;
        const newY = point.y * transform.scaleY + transform.imgOffsetY - 8;
        pointEl.style.left = newX + 'px';
        pointEl.style.top = newY + 'px';

        updateWirePreview();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            pointEl.style.cursor = 'move';
            pointEl.style.zIndex = '10';
            pointEl.classList.remove('dragging');
            pointEl.style.transform = 'scale(1.2)';
            pointEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
            updatePointsList();
        }
    });
}

function createWire() {
    if (!wireStartMark || !wireEndMark || !currentWireType) {
        alert('Please select two marks to connect');
        return;
    }

    if (wireStartMark === wireEndMark) {
        alert('Cannot connect a mark to itself');
        return;
    }

    const wireElement = currentWireMode === 'curve'
        ? createCurveWire(wireStartMark, wireEndMark)
        : createPointsWire(wireStartMark, wireEndMark, wirePoints);

    if (!wireElement) return;

    const wire = {
        id: `wire-${Date.now()}`,
        startMark: wireStartMark,
        endMark: wireEndMark,
        element: wireElement,
        mode: currentWireMode,
        curveValue: currentWireMode === 'curve' ? parseInt(document.getElementById('wireCurveSlider').value) : 0,
        points: currentWireMode === 'points' ? wirePoints.map(p => ({ x: p.x, y: p.y })) : [],
        wireType: currentWireType,
        color: getWireTypeInfo(currentWireType).color
    };

    wires.push(wire);

    document.querySelectorAll('.draggable-point').forEach(el => el.remove());
    wirePoints = [];

    updateWiresList();
    resetWireSelection();

    const wireTypeInfo = getWireTypeInfo(currentWireType);
    showNotification(`${wireTypeInfo.title} created between ${wireStartMark.seriesLabel} and ${wireEndMark.seriesLabel}`, 'success');
}

function createCurveWire(startMark, endMark) {
    const transform = getImageTransform();
    if (!transform) return null;

    const curveSlider = document.getElementById('wireCurveSlider');
    const curveValue = curveSlider ? parseInt(curveSlider.value) : 0;

    return createWireElement(startMark, endMark, curveValue, false);
}

function createPointsWire(startMark, endMark, points) {
    const transform = getImageTransform();
    if (!transform) return null;

    return createWireElementWithPoints(startMark, endMark, points, false);
}

function createWireElementWithPoints(startMark, endMark, points, isPreview = false) {
    const transform = getImageTransform();
    if (!transform) return null;

    const startX = startMark.x * transform.scaleX + transform.imgOffsetX + (startMark.size * transform.scaleX / 2);
    const startY = startMark.y * transform.scaleY + transform.imgOffsetY + (startMark.size * transform.scaleY / 2);
    const endX = endMark.x * transform.scaleX + transform.imgOffsetX + (endMark.size * transform.scaleX / 2);
    const endY = endMark.y * transform.scaleY + transform.imgOffsetY + (endMark.size * transform.scaleY / 2);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", isPreview ? "wire-preview" : "wire");
    svg.setAttribute("data-wire-type", currentWireType);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = isPreview ? "none" : "auto";
    svg.style.zIndex = isPreview ? "5" : "9";

    const wireTypeInfo = getWireTypeInfo(currentWireType);
    const wireColor = wireTypeInfo.color;

    let pathData = `M ${startX} ${startY}`;

    points.forEach(point => {
        const pointX = point.x * transform.scaleX + transform.imgOffsetX;
        const pointY = point.y * transform.scaleY + transform.imgOffsetY;
        pathData += ` L ${pointX} ${pointY}`;
    });

    pathData += ` L ${endX} ${endY}`;

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", isPreview ? wireColor + "80" : wireColor);
    path.setAttribute("stroke-width", isPreview ? "3" : "4");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", isPreview ? "5,5" : "none");

    if (!isPreview) {
        path.style.cursor = "pointer";
        path.addEventListener('click', function (e) {
            e.stopPropagation();
            selectWire(startMark, endMark, currentWireType);
        });

        makeWireDraggable(path, startMark, endMark);
    }

    svg.appendChild(path);

    const startCircle = document.createElementNS(svgNS, "circle");
    startCircle.setAttribute("cx", startX);
    startCircle.setAttribute("cy", startY);
    startCircle.setAttribute("r", "6");
    startCircle.setAttribute("fill", wireColor);
    startCircle.setAttribute("stroke", "#fff");
    startCircle.setAttribute("stroke-width", "2");

    const endCircle = document.createElementNS(svgNS, "circle");
    endCircle.setAttribute("cx", endX);
    endCircle.setAttribute("cy", endY);
    endCircle.setAttribute("r", "6");
    endCircle.setAttribute("fill", wireColor);
    endCircle.setAttribute("stroke", "#fff");
    endCircle.setAttribute("stroke-width", "2");

    svg.appendChild(startCircle);
    svg.appendChild(endCircle);

    imgInner.appendChild(svg);

    return {
        svg,
        path,
        startCircle,
        endCircle,
        startX, startY, endX, endY
    };
}

function createWireElement(startMark, endMark, curveValue = 0, isPreview = false) {
    const transform = getImageTransform();
    if (!transform) return null;

    const startX = startMark.x * transform.scaleX + transform.imgOffsetX + (startMark.size * transform.scaleX / 2);
    const startY = startMark.y * transform.scaleY + transform.imgOffsetY + (startMark.size * transform.scaleY / 2);
    const endX = endMark.x * transform.scaleX + transform.imgOffsetX + (endMark.size * transform.scaleX / 2);
    const endY = endMark.y * transform.scaleY + transform.imgOffsetY + (endMark.size * transform.scaleY / 2);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", isPreview ? "wire-preview" : "wire");
    svg.setAttribute("data-wire-type", currentWireType);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = isPreview ? "none" : "auto";
    svg.style.zIndex = isPreview ? "5" : "9";

    const wireTypeInfo = getWireTypeInfo(currentWireType);
    const wireColor = wireTypeInfo.color;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let pathData;

    if (curveValue === 0) {
        pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
        const curveFactor = Math.abs(curveValue) / 100;
        const controlDistance = distance * 0.5 * curveFactor;

        if (curveValue > 0) {
            const angle = Math.atan2(dy, dx);
            const perpendicular = angle + Math.PI / 2;

            const controlX1 = startX + Math.cos(perpendicular) * controlDistance;
            const controlY1 = startY + Math.sin(perpendicular) * controlDistance;
            const controlX2 = endX + Math.cos(perpendicular) * controlDistance;
            const controlY2 = endY + Math.sin(perpendicular) * controlDistance;

            pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        } else {
            const angle = Math.atan2(dy, dx);
            const perpendicular = angle - Math.PI / 2;

            const controlX1 = startX + Math.cos(perpendicular) * controlDistance;
            const controlY1 = startY + Math.sin(perpendicular) * controlDistance;
            const controlX2 = endX + Math.cos(perpendicular) * controlDistance;
            const controlY2 = endY + Math.sin(perpendicular) * controlDistance;

            pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        }
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", isPreview ? wireColor + "80" : wireColor);
    path.setAttribute("stroke-width", isPreview ? "3" : "4");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", isPreview ? "5,5" : "none");

    if (!isPreview) {
        path.style.cursor = "pointer";
        path.addEventListener('click', function (e) {
            e.stopPropagation();
            selectWire(startMark, endMark, currentWireType);
        });

        makeWireDraggable(path, startMark, endMark);
    }

    svg.appendChild(path);

    const startCircle = document.createElementNS(svgNS, "circle");
    startCircle.setAttribute("cx", startX);
    startCircle.setAttribute("cy", startY);
    startCircle.setAttribute("r", "6");
    startCircle.setAttribute("fill", wireColor);
    startCircle.setAttribute("stroke", "#fff");
    startCircle.setAttribute("stroke-width", "2");

    const endCircle = document.createElementNS(svgNS, "circle");
    endCircle.setAttribute("cx", endX);
    endCircle.setAttribute("cy", endY);
    endCircle.setAttribute("r", "6");
    endCircle.setAttribute("fill", wireColor);
    endCircle.setAttribute("stroke", "#fff");
    endCircle.setAttribute("stroke-width", "2");

    svg.appendChild(startCircle);
    svg.appendChild(endCircle);

    imgInner.appendChild(svg);

    return {
        svg,
        path,
        startCircle,
        endCircle,
        startX, startY, endX, endY,
        curveValue
    };
}

function makeWireDraggable(pathElement, startMark, endMark) {
    let isDragging = false;
    let startDragX = 0, startDragY = 0;
    let originalStartX = 0, originalStartY = 0, originalEndX = 0, originalEndY = 0;

    pathElement.addEventListener('mousedown', function (e) {
        isDragging = true;
        startDragX = e.clientX;
        startDragY = e.clientY;

        const transform = getImageTransform();
        if (transform) {
            originalStartX = startMark.x * transform.scaleX + transform.imgOffsetX + (startMark.size * transform.scaleX / 2);
            originalStartY = startMark.y * transform.scaleY + transform.imgOffsetY + (startMark.size * transform.scaleY / 2);
            originalEndX = endMark.x * transform.scaleX + transform.imgOffsetX + (endMark.size * transform.scaleX / 2);
            originalEndY = endMark.y * transform.scaleY + transform.imgOffsetY + (endMark.size * transform.scaleY / 2);
        }

        e.stopPropagation();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        const dx = e.clientX - startDragX;
        const dy = e.clientY - startDragY;

        const newStartX = originalStartX + dx;
        const newStartY = originalStartY + dy;
        const newEndX = originalEndX + dx;
        const newEndY = originalEndY + dy;

        const transform = getImageTransform();
        if (!transform) return;

        const scaleX = transform.scaleX;
        const scaleY = transform.scaleY;
        const imgOffsetX = transform.imgOffsetX;
        const imgOffsetY = transform.imgOffsetY;

        startMark.x = (newStartX - imgOffsetX - (startMark.size * scaleX / 2)) / scaleX;
        startMark.y = (newStartY - imgOffsetY - (startMark.size * scaleY / 2)) / scaleY;

        endMark.x = (newEndX - imgOffsetX - (endMark.size * scaleX / 2)) / scaleX;
        endMark.y = (newEndY - imgOffsetY - (endMark.size * scaleY / 2)) / scaleY;

        updateMarkPosition(startMark);
        updateMarkPosition(endMark);

        updateAllWires(currentWireType);

        e.preventDefault();
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });
}

function cancelWire() {
    resetWireSelection();
}

function selectWire(startMark, endMark, wireType) {
    selectedWire = { startMark, endMark, wireType };

    wires.forEach(wire => {
        if ((wire.startMark === startMark && wire.endMark === endMark && wire.wireType === wireType) ||
            (wire.startMark === endMark && wire.endMark === startMark && wire.wireType === wireType)) {
            wire.element.path.setAttribute('stroke-width', '6');
        } else {
            wire.element.path.setAttribute('stroke-width', '4');
        }
    });

    showWireEditOptions(startMark, endMark, wireType);
}

function showWireEditOptions(startMark, endMark, wireType) {
    const existingEdit = document.querySelector('.wire-edit-controls');
    if (existingEdit) {
        existingEdit.remove();
    }

    const wire = wires.find(w =>
        ((w.startMark === startMark && w.endMark === endMark) ||
            (w.startMark === endMark && w.endMark === startMark)) &&
        w.wireType === wireType
    );

    if (!wire) return;

    const wireTypeInfo = getWireTypeInfo(wireType);

    const editHTML = `
        <div class="mark-controls-box wire-edit-controls" style="margin-top: 20px; border-color: ${wireTypeInfo.color};">
            <h3 style="color: ${wireTypeInfo.color};">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">edit</span>
                Edit ${wireTypeInfo.title}
            </h3>
            
            <div class="form-group">
                <div style="background: ${wireTypeInfo.bgColor}; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid ${wireTypeInfo.borderColor};">
                    <div style="font-size: 12px; color: ${wireTypeInfo.color}; margin-bottom: 8px;">
                        <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">link</span>
                        ${wireTypeInfo.title} between <strong>${startMark.seriesLabel}</strong> and <strong>${endMark.seriesLabel}</strong>
                    </div>
                    <div style="font-size: 11px; color: #555;">
                        Mode: ${wire.mode === 'curve' ? 'Curve' : 'Points'} 
                        ${wire.mode === 'curve' ? `• Curve level: ${wire.curveValue}` : `• Points: ${wire.points.length}`}
                    </div>
                </div>
            </div>

            <div class="form-group">
                <button id="deleteWireBtn" class="btn full-width" style="border-color: #f44336; color: #f44336;">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">delete</span>
                    Delete Wire
                </button>
                <button id="closeEditBtn" class="btn full-width" style="margin-top: 8px;">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">close</span>
                    Close
                </button>
            </div>
        </div>
    `;

    const wireControls = document.getElementById('wireControls');
    if (wireControls) {
        wireControls.insertAdjacentHTML('afterend', editHTML);

        document.getElementById('deleteWireBtn').addEventListener('click', function () {
            deleteWire(wire);
        });

        document.getElementById('closeEditBtn').addEventListener('click', function () {
            const editControls = document.querySelector('.wire-edit-controls');
            if (editControls) {
                editControls.remove();
            }

            wires.forEach(wire => {
                wire.element.path.setAttribute('stroke-width', '4');
            });

            selectedWire = null;
        });
    }
}

function updateWireDisplay(wire) {
    if (wire.element && wire.element.svg) {
        wire.element.svg.remove();
    }

    let newElement;
    if (wire.mode === 'curve') {
        const curveSlider = document.getElementById('editWireCurveSlider');
        const newCurveValue = curveSlider ? parseInt(curveSlider.value) : wire.curveValue;
        wire.curveValue = newCurveValue;
        newElement = createWireElement(wire.startMark, wire.endMark, newCurveValue, false);
    } else {
        newElement = createWireElementWithPoints(wire.startMark, wire.endMark, wire.points, false);
    }

    wire.element = newElement;
}

function updateWire(wire) {
    if (wire.mode === 'curve') {
        const slider = document.getElementById('editWireCurveSlider');
        const newCurveValue = slider ? parseInt(slider.value) : wire.curveValue;
        wire.curveValue = newCurveValue;
    }

    updateWireDisplay(wire);

    const wireTypeInfo = getWireTypeInfo(wire.wireType);
    showNotification(`${wireTypeInfo.title} updated successfully`, 'success');
}

function deleteWire(wire) {
    if (wire.element && wire.element.svg) {
        wire.element.svg.remove();
    }

    const index = wires.indexOf(wire);
    if (index > -1) {
        wires.splice(index, 1);
    }

    const editControls = document.querySelector('.wire-edit-controls');
    if (editControls) {
        editControls.remove();
    }

    updateWiresList();

    const wireTypeInfo = getWireTypeInfo(wire.wireType);
    showNotification(`${wireTypeInfo.title} deleted successfully`, 'success');
    selectedWire = null;
}

function updateAllWires(wireType = null) {
    wires.forEach(wire => {
        if (!wireType || wire.wireType === wireType) {
            // Only update wires if their SVG element exists
            if (wire.element && wire.element.svg && wire.element.svg.parentNode) {
                // Just remove and recreate the wire
                if (wire.element.svg) {
                    wire.element.svg.remove();
                }

                // Temporarily set currentWireType to the wire's type
                const tempWireType = currentWireType;
                currentWireType = wire.wireType;

                let newElement;
                if (wire.mode === 'curve') {
                    newElement = createWireElement(wire.startMark, wire.endMark, wire.curveValue, false);
                } else {
                    newElement = createWireElementWithPoints(wire.startMark, wire.endMark, wire.points, false);
                }

                // Restore original wire type
                currentWireType = tempWireType;

                if (newElement) {
                    wire.element = newElement;

                    // Reattach event listeners
                    if (newElement.path) {
                        newElement.path.style.cursor = "pointer";
                        newElement.path.addEventListener('click', function (e) {
                            e.stopPropagation();
                            selectWire(wire.startMark, wire.endMark, wire.wireType);
                        });

                        makeWireDraggable(newElement.path, wire.startMark, wire.endMark);
                    }
                }
            }
        }
    });
}

function updateWiresConnectedToMark(mark) {
    wires.forEach(wire => {
        if (wire.startMark === mark || wire.endMark === mark) {
            // Recreate the wire with updated positions
            if (wire.element && wire.element.svg) {
                wire.element.svg.remove();
            }

            // Temporarily set currentWireType to the wire's type
            const tempWireType = currentWireType;
            currentWireType = wire.wireType;

            let newElement;
            if (wire.mode === 'curve') {
                newElement = createWireElement(wire.startMark, wire.endMark, wire.curveValue, false);
            } else {
                newElement = createWireElementWithPoints(wire.startMark, wire.endMark, wire.points, false);
            }

            // Restore original wire type
            currentWireType = tempWireType;

            if (newElement) {
                wire.element = newElement;

                // Reattach event listeners
                if (newElement.path) {
                    newElement.path.style.cursor = "pointer";
                    newElement.path.addEventListener('click', function (e) {
                        e.stopPropagation();
                        selectWire(wire.startMark, wire.endMark, wire.wireType);
                    });

                    makeWireDraggable(newElement.path, wire.startMark, wire.endMark);
                }
            }
        }
    });
}

function updateWiresList() {
    const wiresList = document.getElementById('wiresList');
    if (!wiresList || !currentWireType) return;

    wiresList.innerHTML = '';

    const typeWires = wires.filter(wire => wire.wireType === currentWireType);

    if (typeWires.length === 0) {
        const wireTypeInfo = getWireTypeInfo(currentWireType);
        wiresList.innerHTML = `<div style="color: var(--muted); font-size: 12px; text-align: center; padding: 8px;">No ${wireTypeInfo.title.toLowerCase()}s created yet</div>`;
        return;
    }

    typeWires.forEach((wire, index) => {
        const wireItem = document.createElement('div');
        wireItem.className = 'mark-item';
        wireItem.style.borderColor = wire.color;
        wireItem.style.background = wire.color + '10';

        wireItem.innerHTML = `
            <span style="flex: 1; font-size: 12px;">
                <span style="font-weight: bold; color: ${wire.color};">${wire.startMark.seriesLabel}</span>
                <span class="material-icons" style="font-size: 12px; vertical-align: middle; margin: 0 4px; color: ${wire.color};">arrow_forward</span>
                <span style="font-weight: bold; color: ${wire.color};">${wire.endMark.seriesLabel}</span>
                <span style="font-size: 10px; color: #666; margin-left: 8px;">${wire.mode === 'curve' ? 'Curve: ' + wire.curveValue : 'Points: ' + wire.points.length}</span>
            </span>
            <button class="btn" style="padding: 4px 6px; min-height: 24px; font-size: 11px; opacity: 0.7;">
                <span class="material-icons" style="font-size: 14px;">delete</span>
            </button>
        `;

        wireItem.addEventListener('click', function (e) {
            if (!e.target.closest('button')) {
                selectWire(wire.startMark, wire.endMark, wire.wireType);
            }
        });

        const deleteBtn = wireItem.querySelector('button');
        deleteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteWire(wire);
        });

        wiresList.appendChild(wireItem);
    });
}

function clearWireSelection() {
    isWireMode = false;
    currentWireType = null;

    wireStartMark = null;
    wireEndMark = null;
    wirePoints = [];
    selectedWire = null;

    document.querySelectorAll('.draggable-point').forEach(el => el.remove());

    const tempWire = document.querySelector('.wire-preview');
    if (tempWire) {
        tempWire.remove();
    }

    updateWireSelectionLabels();
    updatePointsList();

    document.querySelectorAll('.tab-btn[data-name^="KNX_WIRE"], .tab-btn[data-name^="PHASE_WIRE"], .tab-btn[data-name^="NEUTRAL_WIRE"], .tab-btn[data-name^="CAT6_WIRE"], .tab-btn[data-name^="IR_WIRE"]').forEach(btn => {
        btn.classList.remove('active');
    });

    wires.forEach(wire => {
        if (wire.element && wire.element.path) {
            wire.element.path.setAttribute('stroke-width', '4');
        }
    });

    const wireEditControls = document.querySelector('.wire-edit-controls');
    if (wireEditControls) {
        wireEditControls.remove();
    }

    hideWireControls();

    showNotification('Wire selection cleared', 'info');
}

/* ------------------------- MARKS & DRAGGING ------------------------- */
const marksListEl = document.getElementById('marksList');
const addMarkBtn = document.getElementById('addMarkBtn');
const markShapeEl = document.getElementById('markShape');
const markSizeEl = document.getElementById('markSizeText');

let markCounter = 0;

previewImage.addEventListener('load', updateImageDimensions);
window.addEventListener('resize', updateImageDimensions);

function getImageTransform() {
    const img = previewImage;
    const containerRect = imgContainer.getBoundingClientRect();

    // Get the actual rendered image dimensions
    const imgRect = img.getBoundingClientRect();

    // Calculate natural dimensions, fallback to displayed if not available
    let naturalWidth = img.naturalWidth || imgRect.width;
    let naturalHeight = img.naturalHeight || imgRect.height;

    // If natural dimensions are 0 or invalid, use the displayed dimensions
    if (naturalWidth <= 0 || naturalHeight <= 0) {
        naturalWidth = imgRect.width;
        naturalHeight = imgRect.height;
    }

    imageNaturalWidth = naturalWidth;
    imageNaturalHeight = naturalHeight;

    if (!imageNaturalWidth || !imageNaturalHeight) return null;

    const imgAspect = imageNaturalWidth / imageNaturalHeight;
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth, displayHeight, imgOffsetX, imgOffsetY;

    // Calculate how the image is actually displayed with object-fit: contain
    if (imgAspect > containerAspect) {
        // Image is wider than container
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
        imgOffsetX = 0;
        imgOffsetY = (containerRect.height - displayHeight) / 2;
    } else {
        // Image is taller than container
        displayHeight = containerRect.height;
        displayWidth = containerRect.height * imgAspect;
        imgOffsetX = (containerRect.width - displayWidth) / 2;
        imgOffsetY = 0;
    }

    imageDisplayWidth = displayWidth;
    imageDisplayHeight = displayHeight;

    return {
        imgOffsetX,
        imgOffsetY,
        scaleX: displayWidth / imageNaturalWidth,
        scaleY: displayHeight / imageNaturalHeight
    };
}

// Add this function near the top with other utility functions
function getActualImageDimensions() {
    const img = previewImage;
    const containerRect = imgContainer.getBoundingClientRect();

    // Get the actual rendered dimensions
    const imgRect = img.getBoundingClientRect();

    // Calculate natural dimensions
    let naturalWidth = img.naturalWidth || imgRect.width;
    let naturalHeight = img.naturalHeight || imgRect.height;

    // Calculate displayed dimensions based on object-fit: contain
    const imgAspect = naturalWidth / naturalHeight;
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth, displayHeight;

    if (imgAspect > containerAspect) {
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
    } else {
        displayHeight = containerRect.height;
        displayWidth = containerRect.height * imgAspect;
    }

    return {
        naturalWidth,
        naturalHeight,
        displayWidth,
        displayHeight
    };
}

function updateImageDimensions() {
    const transform = getImageTransform();
    if (transform) {
        // Also store the actual displayed image position for reference
        const img = previewImage;
        const imgRect = img.getBoundingClientRect();
        const containerRect = imgContainer.getBoundingClientRect();

        // Calculate the actual visible area of the image
        const imgActual = getActualImageDimensions();

        // Update marks and wires with the accurate transform
        updateAllMarks();
        updateAllWires();

        console.log('Image updated:', {
            natural: `${imgActual.naturalWidth}x${imgActual.naturalHeight}`,
            displayed: `${Math.round(imgActual.displayWidth)}x${Math.round(imgActual.displayHeight)}`,
            container: `${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`,
            scale: `${transform.scaleX.toFixed(4)}x${transform.scaleY.toFixed(4)}`,
            offset: `${Math.round(transform.imgOffsetX)}x${Math.round(transform.imgOffsetY)}`
        });
    }
}

function updateAllMarks() {
    marks.forEach(mark => {
        updateMarkPosition(mark);
    });
}

function updateMarkPosition(mark) {
    const transform = getImageTransform();
    if (!transform) return;

    const x = mark.x * transform.scaleX + transform.imgOffsetX;
    const y = mark.y * transform.scaleY + transform.imgOffsetY;

    // For text labels, use the center point
    if (mark.isTextLabel) {
        // Get text width for proper centering
        const textWidth = mark.el.offsetWidth || 50;
        const textHeight = mark.el.offsetHeight || 20;

        mark.el.style.left = (x - textWidth / 2) + 'px';
        mark.el.style.top = (y - textHeight / 2) + 'px';

        // Remove width/height constraints for text labels
        mark.el.style.width = 'auto';
        mark.el.style.height = 'auto';
        mark.el.style.transform = 'none';
    } else {
        const size = mark.size * transform.scaleX;
        mark.el.style.left = x + 'px';
        mark.el.style.top = y + 'px';
        mark.el.style.width = size + 'px';
        mark.el.style.height = size + 'px';
    }

    orientTooltip(mark);
}

function renumberAllMarks() {
    const marksByCode = {};
    marks.forEach(mark => {
        if (!marksByCode[mark.seriesCode]) {
            marksByCode[mark.seriesCode] = [];
        }
        marksByCode[mark.seriesCode].push(mark);
    });

    Object.keys(marksByCode).forEach(code => {
        marksByCode[code].sort((a, b) => {
            const numA = parseInt(a.id.split('-')[1]);
            const numB = parseInt(b.id.split('-')[1]);
            return numA - numB;
        });

        marksByCode[code].forEach((mark, index) => {
            const newLabel = `${code}${index + 1}`;

            mark.seriesLabel = newLabel;

            const badge = mark.el.querySelector('.label-badge');
            if (badge) {
                badge.textContent = newLabel;
            }
        });

        seriesCounters[code] = marksByCode[code].length;
    });
}

addMarkBtn.addEventListener('click', () => {
    if (!currentProduct) {
        alert('Please select a product first');
        return;
    }

    const data = productData[currentProduct];

    // Handle TEXT labels
    if (currentProduct === 'TEXT') {
        const textInput = document.getElementById('textLabelInput');
        if (!textInput) {
            showNotification('Please wait for text input to load', 'error');
            return;
        }

        const text = textInput.value.trim();
        if (!text) {
            showNotification('Please enter text for the label', 'error');
            textInput.focus();
            return;
        }

        const shape = markShapeEl.value;
        let sizePercent = parseFloat(markSizeEl.value) || 4;
        if (sizePercent <= 0) sizePercent = 4;

        if (imageNaturalWidth && imageNaturalHeight) {
            const sizePixels = (sizePercent / 100) * Math.min(imageNaturalWidth, imageNaturalHeight);
            addTextLabel(text, shape, sizePixels);
            textInput.value = '';
            textInput.focus();
        } else {
            showNotification('Please wait for floor plan to load', 'error');
        }
        return;
    }

    // Handle other products (original logic)
    if (data.subProducts && !data.isDBBox && !data.isNetworkDBBox && currentProduct !== 'Z-WAVE RELAY' && !currentSubProduct) {
        alert('Please select a model first');
        return;
    }

    const shape = markShapeEl.value;
    let sizePercent = parseFloat(markSizeEl.value) || 4;
    if (sizePercent <= 0) sizePercent = 4;

    if (imageNaturalWidth && imageNaturalHeight) {
        const sizePixels = (sizePercent / 100) * Math.min(imageNaturalWidth, imageNaturalHeight);
        const centerX = imageNaturalWidth / 2;
        const centerY = imageNaturalHeight / 2;

        createMark({
            x: centerX - (sizePixels / 2),
            y: centerY - (sizePixels / 2),
            size: sizePixels,
            shape: shape
        });
    } else {
        createMark({
            x: 50,
            y: 50,
            size: 50,
            shape: shape
        });
    }
});

function createMark({ x, y, size, shape }) {
    const id = 'mark-' + (++markCounter);

    const productDataForMark = currentSubProduct && productData[currentProduct]?.subProducts?.[currentSubProduct]
        ? productData[currentProduct].subProducts[currentSubProduct]
        : productData[currentProduct] || {};

    if (!currentProduct) {
        alert('Please select a product first');
        return;
    }

    const data = productData[currentProduct];
    const needsModel = data.subProducts && currentProduct !== 'Z-WAVE RELAY' && !data.isDBBox && !data.isNetworkDBBox && !data.isEquipment;
    if (needsModel && !currentSubProduct) {
        alert('Select a model before adding a label');
        return;
    }

    const isEquipment = data.isEquipment || false;
    const isSwitchFamily = switchFamilies.has(currentProduct);

    let relayItems = [];
    if (currentProduct === 'Z-WAVE RELAY') {
        relayItems = getSelectedRelayItems();
        if (relayItems.length === 0) {
            alert('Select at least one relay module and quantity');
            return;
        }
        lastRelaySelectionLabel = relayItems[relayItems.length - 1].name;
        updateRelayOverlay();
    }

    const { seriesCode, label } = nextSeriesLabel(currentProduct);

    const categoryName = currentProduct || '';

    let modelName = '';
    let featuresList = [];
    let descText = '';
    let brand = '';
    let sizeFt = '';
    let selectedRelays = [];
    let selectedModules = [];
    let routerBrand = '';
    let routerModel = '';
    let routerQty = 1;
    let switchConfig = '';
    let equipmentIcon = '';
    let fallbackImg = '';

    if (data.isDBBox) {
        brand = productData[currentProduct].brand || '';
        sizeFt = productData[currentProduct].size || '';
        modelName = brand ? `${brand} - ${sizeFt} ft` : 'DB Box';
        descText = `${categoryName}: ${brand} ${sizeFt} ft`;
        featuresList = [];
        selectedRelays = productData[currentProduct].selectedRelays || [];

    } else if (data.isNetworkDBBox) {
        // FIX: Check if data exists before accessing properties
        const networkData = productData[currentProduct];
        brand = networkData.brand || '';
        sizeFt = networkData.size || '';
        modelName = brand ? `${brand} - ${sizeFt} ft` : 'Network DB Box';
        descText = `${categoryName}: ${brand} ${sizeFt} ft`;
        featuresList = [];
        currentSubProduct = null;

        routerBrand = networkData.routerBrand || '';
        routerModel = networkData.routerModel || '';
        routerQty = networkData.routerQty || 1;
        selectedModules = networkData.selectedModules || [];

        // FIX: Debug logging
        console.log('Network DB Box Data:', {
            brand: brand,
            sizeFt: sizeFt,
            routerBrand: routerBrand,
            routerModel: routerModel,
            routerQty: routerQty,
            selectedModules: selectedModules
        });

    } else if (isEquipment && currentSubProduct) {
        brand = 'Equipment';
        modelName = productDataForMark?.title || currentSubProduct;
        descText = `${categoryName}: ${modelName}`;
        featuresList = productDataForMark?.features || [];
        equipmentIcon = productDataForMark?.icon || '';
        fallbackImg = equipmentIcon;

    } else if (isSwitchFamily) {
        brand = productData[currentProduct].brand || 'LUMI';
        modelName = productDataForMark?.title || data.title || '';
        descText = productDataForMark?.desc || data.desc || '';
        featuresList = (productDataForMark?.features || data.features || []).slice();
        switchConfig = productData[currentProduct].defaultSwitchConfig || '';

        if (switchConfig) {
            descText = `${modelName}: ${switchConfig}`;
        }

    } else if (currentProduct === 'Z-WAVE RELAY') {
        modelName = relayItems.length === 1 ? relayItems[0].name : `${relayItems.length} modules selected`;
        featuresList = relayItems.map(item => `${item.name} — Qty ${item.quantity}`);
        descText = data.desc || '';
    } else if (data.isEmitter) {
        modelName = data.title || 'Emitter';
        featuresList = ['RF/IR emitter device'];
        descText = data.desc || 'Emitter device';
    } else {
        modelName = productDataForMark?.title || data.title || '';
        featuresList = (productDataForMark?.features || data.features || []).slice();
        descText = productDataForMark?.desc || data.desc || '';
    }

    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.size = size;
    el.dataset.shape = shape;

    if (isEquipment) {
        el.dataset.isEquipment = 'true';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'equipment-icon';
        iconContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            pointer-events: none;
        `;

        const iconImg = document.createElement('img');
        iconImg.src = equipmentIcon || productDataForMark?.icon || '';
        iconImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: brightness(0);
        `;

        iconContainer.appendChild(iconImg);
        el.appendChild(iconContainer);

        const eqText = document.createElement('div');
        eqText.className = 'equipment-label-text';
        eqText.textContent = label;
        eqText.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translate(-50%, 5px);
            font-size: 10px;
            font-weight: bold;
            color: #000;
            white-space: nowrap;
            pointer-events: none;
        `;
        el.appendChild(eqText);
    } else {
        const badge = document.createElement('div');
        badge.className = 'label-badge';
        badge.textContent = label;
        el.appendChild(badge);
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';

    const tooltipTitle = document.createElement('div');
    tooltipTitle.className = 'tooltip-title';
    tooltipTitle.textContent = categoryName || 'Product';

    const tooltipModel = document.createElement('div');
    tooltipModel.className = 'tooltip-model';
    tooltipModel.textContent = modelName || '—';

    tooltipContent.appendChild(tooltipTitle);
    tooltipContent.appendChild(tooltipModel);
    tooltip.appendChild(tooltipContent);
    el.appendChild(tooltip);

    imgInner.appendChild(el);

    const markData = {
        id,
        x,
        y,
        size,
        shape,
        el,
        productData: productDataForMark,
        seriesCode,
        seriesLabel: label,
        tooltip,
        categoryName,
        modelName,
        desc: descText,
        features: featuresList,
        imageSrc: isEquipment ? equipmentIcon : productDataForMark?.img || data.img || previewImage.src,
        relayItems,
        brand: brand,
        sizeFt: sizeFt,
        isDBBox: data.isDBBox || false,
        isNetworkDBBox: data.isNetworkDBBox || false,
        isEmitter: data.isEmitter || false,
        isEquipment: isEquipment,
        isTextLabel: false,
        isSwitchFamily: isSwitchFamily,
        selectedRelays: selectedRelays,
        selectedModules: selectedModules,
        routerBrand: routerBrand,
        routerModel: routerModel,
        routerQty: routerQty,
        switchConfig: isSwitchFamily ? (productData[currentProduct].defaultSwitchConfig || '') : '',
        equipmentIcon: equipmentIcon
    };

    marks.push(markData);

    // Event listener setup with switch configuration refresh
    el.addEventListener('click', function (e) {
        e.stopPropagation();

        if (isWireMode && currentWireType && !e.defaultPrevented) {
            if (!wireStartMark) {
                wireStartMark = markData;
                showNotification(`First mark selected: ${label}. Now select second mark.`, 'info');
            } else if (!wireEndMark && wireStartMark !== markData) {
                wireEndMark = markData;
                const wireTypeInfo = getWireTypeInfo(currentWireType);
                showNotification(`Second mark selected: ${label}. ${currentWireMode === 'curve' ? 'Adjust curve' : 'Add points'} and click "Create ${wireTypeInfo.title}".`, 'info');
            } else if (wireStartMark === markData) {
                wireStartMark = null;
                wireEndMark = null;
                wirePoints = [];
                showNotification('First mark selection cleared.', 'info');
            } else if (wireEndMark === markData) {
                wireEndMark = null;
                wirePoints = [];
                showNotification('Second mark selection cleared.', 'info');
            }
            updateWireSelectionLabels();
            updatePointsList();
            e.preventDefault();
        } else if (!isWireMode && !e.defaultPrevented) {
            if (!dragStarted) {
                selectedMarkId = id;
                updateMarkSelection();

                if (isSwitchFamily) {
                    const existingControls = document.getElementById('switchConfigControls');
                    if (existingControls) {
                        existingControls.remove();
                    }
                    createSwitchConfigurationControls();
                }

                if (!data.isDBBox && !data.isNetworkDBBox && !data.isEmitter && !isEquipment) {
                    openProductModal(markData);
                }
            }
        }
    });

    let dragging = false;
    let startX = 0, startY = 0;
    let startMarkX = 0, startMarkY = 0;
    let dragStarted = false;

    function onPointerDown(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        el.setPointerCapture(ev.pointerId);
        dragging = true;
        dragStarted = false;
        startX = ev.clientX;
        startY = ev.clientY;
        startMarkX = markData.x;
        startMarkY = markData.y;
        selectedMarkId = id;
        updateMarkSelection();
        el.classList.add('selected');
    }

    function onPointerMove(ev) {
        if (!dragging) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!dragStarted && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragStarted = true;
        }

        if (!dragStarted) return;

        ev.preventDefault();
        ev.stopPropagation();

        const transform = getImageTransform();
        if (!transform || !imageNaturalWidth || !imageNaturalHeight) return;

        const imgRect = previewImage.getBoundingClientRect();
        const scaleX = imageNaturalWidth / imgRect.width;
        const scaleY = imageNaturalHeight / imgRect.height;

        const imageDx = dx * scaleX;
        const imageDy = dy * scaleY;

        let newX = startMarkX + imageDx;
        let newY = startMarkY + imageDy;

        newX = Math.max(0, Math.min(imageNaturalWidth - markData.size, newX));
        newY = Math.max(0, Math.min(imageNaturalHeight - markData.size, newY));

        markData.x = newX;
        markData.y = newY;

        updateMarkPosition(markData);
        updateAllWires();
    }

function onPointerUp(ev) {
    if (dragging) {
        dragging = false;
        try {
            el.releasePointerCapture(ev.pointerId);
        } catch (e) { }
        el.classList.remove('selected');

        if (!dragStarted && !isWireMode) {
            selectedMarkId = id;
            updateMarkSelection();

            if (isSwitchFamily) {
                const existingControls = document.getElementById('switchConfigControls');
                if (existingControls) {
                    existingControls.remove();
                }
                createSwitchConfigurationControls();
            }

            // FIX: Check the mark's own properties
            if (!markData.isDBBox && !markData.isNetworkDBBox && !markData.isEmitter && !markData.isEquipment) {
                openProductModal(markData);
            } else if (markData.isDBBox || markData.isNetworkDBBox) {
                // ADD THIS: Open modal for DB boxes too
                openProductModal(markData);
            }
        }
    }
}

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('mouseenter', () => orientTooltip(markData));
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    updateMarkPosition(markData);
    updateMarkSelection();
    renderMarksList();

    if (isEquipment) {
        showNotification(`Equipment "${modelName}" added as ${label}`, 'success');
    } else if (isSwitchFamily) {
        showNotification(`Switch "${modelName}" added as ${label}`, 'success');
    } else {
        showNotification(`Product "${modelName}" added as ${label}`, 'success');
    }

    return markData;
}

/* ------------------------- MULTI-COMPONENT PRODUCT FUNCTIONS ------------------------- */
function createMultiComponentControls(productKey, subProductKey) {
    const existingControls = document.getElementById('multiComponentControls');
    if (existingControls) {
        existingControls.remove();
    }

    const data = productData[productKey];
    if (!data || !data.isMultiComponent || !subProductKey) return;

    const subData = data.subProducts[subProductKey];
    if (!subData || !subData.components) return;

    // Hide features section
    featuresSection.style.display = 'none';
    relayControlsEl.style.display = 'none';

    // Create controls for multi-component system
    const componentsHTML = `
        <div class="mark-controls-box" id="multiComponentControls" style="margin-top: 20px; border-color: #FF9800;">
            <h3 style="color: #FF9800; margin-bottom: 15px;">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 8px;">speaker_group</span>
                ${subData.title} Configuration
            </h3>
            
            <div class="form-group">
                <div style="background: #FFF3E0; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #FFE0B2;">
                    <div style="font-size: 12px; color: #FF9800; margin-bottom: 8px;">
                        <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">info</span>
                        This system includes multiple components. All components will be grouped together.
                    </div>
                    <div style="font-size: 11px; color: #555;">
                        System: <strong>${subData.title}</strong><br>
                        Total Components: <strong>${Object.values(subData.components).reduce((sum, comp) => sum + comp.quantity, 0)}</strong>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label style="color: #FF9800; font-weight: 500;">System Components</label>
                <div id="componentsList" style="margin-top: 10px; max-height: 200px; overflow-y: auto; padding: 8px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e0e0;">
                    ${Object.entries(subData.components).map(([key, component]) => `
                        <div class="component-item" style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #ddd;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; font-size: 12px; color: #333;">${component.title}</div>
                                </div>
                                <div style="font-size: 11px; color: #FF9800; font-weight: bold;">
                                    Qty: ${component.quantity}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <button id="addMultiComponentSystemBtn" class="btn primary full-width" style="background: #FF9800; border-color: #FF9800;">
                    <span class="material-icons" style="font-size: 16px; margin-right: 8px;">add_circle</span>
                    Add Complete System
                </button>
                <div style="font-size: 10px; color: #666; text-align: center; margin-top: 8px;">
                    This will create ${Object.values(subData.components).reduce((sum, comp) => sum + comp.quantity, 0)} labels grouped together
                </div>
            </div>
        </div>
    `;

    const markControlsBox = document.querySelector('.mark-controls-box');
    if (markControlsBox) {
        markControlsBox.insertAdjacentHTML('afterend', componentsHTML);

        // Add system button
        document.getElementById('addMultiComponentSystemBtn').addEventListener('click', function () {
            addMultiComponentSystem(productKey, subProductKey);
        });
    }
}

let multiComponentGroups = {}; // Track grouped components

function addMultiComponentSystem(productKey, subProductKey) {
    const data = productData[productKey];
    const subData = data.subProducts[subProductKey];

    if (!subData.components) return;

    const shape = markShapeEl.value;
    let sizePercent = parseFloat(markSizeEl.value) || 4;
    if (sizePercent <= 0) sizePercent = 4;

    const groupId = `group-${Date.now()}`;
    const componentMarks = [];
    const totalComponents = Object.values(subData.components).reduce((sum, comp) => sum + comp.quantity, 0);

    // Get next available label number
    const existingMarks = marks.filter(mark => mark.seriesCode === 'T');
    let nextNumber = 1;
    if (existingMarks.length > 0) {
        const existingNumbers = existingMarks.map(mark => {
            const num = parseInt(mark.seriesLabel.substring(1));
            return isNaN(num) ? 0 : num;
        });

        while (existingNumbers.includes(nextNumber)) {
            nextNumber++;
        }
    }

    let componentCounter = 0;

    Object.entries(subData.components).forEach(([componentKey, component]) => {
        for (let i = 0; i < component.quantity; i++) {
            const label = `T${nextNumber}`;

            const position = calculateGridPosition(
                componentCounter + 1,
                totalComponents
            );

            if (imageNaturalWidth && imageNaturalHeight) {
                const sizePixels = (sizePercent / 100) * Math.min(imageNaturalWidth, imageNaturalHeight);
                const centerX = imageNaturalWidth / 2 + position.xOffset;
                const centerY = imageNaturalHeight / 2 + position.yOffset;

                const mark = createMultiComponentMark({
                    x: centerX - (sizePixels / 2),
                    y: centerY - (sizePixels / 2),
                    size: sizePixels,
                    shape: shape,
                    productKey: productKey,
                    subProductKey: subProductKey,
                    component: component,
                    componentIndex: i + 1,
                    label: label,
                    groupId: groupId,
                    totalComponents: totalComponents
                });

                componentMarks.push(mark);
                componentCounter++;
            }
        }
        nextNumber++;
    });

    // Store the group
    multiComponentGroups[groupId] = {
        productKey: productKey,
        subProductKey: subProductKey,
        marks: componentMarks.map(m => m.id),
        mainLabel: subData.title
    };

    // Update series counter
    seriesCounters['T'] = Math.max(seriesCounters['T'] || 0,
        componentMarks.length + (existingMarks.length > 0 ? Math.max(...existingMarks.map(m => {
            const num = parseInt(m.seriesLabel.substring(1));
            return isNaN(num) ? 0 : num;
        })) : 0));

    // Update the marks list to show grouped
    renderMarksList();

    showNotification(`Added ${subData.title} with ${componentMarks.length} components`, 'success');
}

function calculateGridPosition(index, total) {
    // Simple grid positioning
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor((index - 1) / cols);
    const col = (index - 1) % cols;

    const spacing = 100; // pixels spacing
    return {
        xOffset: (col - Math.floor(cols / 2)) * spacing,
        yOffset: (row - Math.floor(total / cols / 2)) * spacing
    };
}

function calculateGridPosition(index, total) {
    // Simple grid positioning
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor((index - 1) / cols);
    const col = (index - 1) % cols;

    const spacing = 100; // pixels spacing
    return {
        xOffset: (col - Math.floor(cols / 2)) * spacing,
        yOffset: (row - Math.floor(total / cols / 2)) * spacing
    };
}

function createMultiComponentMark(options) {
    const {
        x, y, size, shape, productKey, subProductKey, component,
        componentIndex, label, groupId, totalComponents, originalId // Add originalId parameter
    } = options;

    // Use originalId if provided, otherwise generate new ID
    const id = originalId || 'mark-' + (++markCounter);

    // Update markCounter if we're generating a new ID
    if (!originalId) {
        markCounter = Math.max(markCounter, parseInt(id.split('-')[1]) || markCounter);
    }

    const subData = productData[productKey].subProducts[subProductKey];

    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.groupId = groupId;
    el.dataset.size = size;
    el.dataset.shape = shape;
    el.dataset.seriesLabel = label; // Store seriesLabel in dataset for easy access

    const badge = document.createElement('div');
    badge.className = 'label-badge';
    badge.textContent = label;
    badge.style.backgroundColor = '#FF9800';
    el.appendChild(badge);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';

    const tooltipTitle = document.createElement('div');
    tooltipTitle.className = 'tooltip-title';
    tooltipTitle.textContent = `${subData.title} - ${component.title}`;
    tooltipTitle.style.color = '#FF9800';

    const tooltipModel = document.createElement('div');
    tooltipModel.className = 'tooltip-model';
    tooltipModel.textContent = `Component ${componentIndex} of ${component.quantity}`;

    tooltipContent.appendChild(tooltipTitle);
    tooltipContent.appendChild(tooltipModel);
    tooltip.appendChild(tooltipContent);
    el.appendChild(tooltip);

    imgInner.appendChild(el);

    const markData = {
        id,
        x,
        y,
        size,
        shape,
        el,
        seriesCode: 'T',
        seriesLabel: label,
        tooltip,
        categoryName: subData.title,
        modelName: component.title,
        desc: `${subData.title} - ${component.title} (${componentIndex}/${component.quantity})`,
        features: [],
        imageSrc: subData.img,
        isMultiComponent: true,
        groupId: groupId,
        componentType: component.title,
        componentIndex: componentIndex,
        totalComponents: totalComponents,
        originalId: originalId || id // Store original ID
    };

    marks.push(markData);

    // Add dragging functionality
    let dragging = false;
    let startX = 0, startY = 0;
    let startMarkX = 0, startMarkY = 0;
    let dragStarted = false;

    function onPointerDown(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (el.setPointerCapture) el.setPointerCapture(ev.pointerId);
        dragging = true;
        dragStarted = false;
        startX = ev.clientX;
        startY = ev.clientY;
        startMarkX = markData.x;
        startMarkY = markData.y;
        selectedMarkId = id;
        updateMarkSelection();
        el.classList.add('selected');
    }

    function onPointerMove(ev) {
        if (!dragging) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!dragStarted && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragStarted = true;
        }

        if (!dragStarted) return;

        ev.preventDefault();
        ev.stopPropagation();

        const transform = getImageTransform();
        if (!transform || !imageNaturalWidth || !imageNaturalHeight) return;

        const imgRect = previewImage.getBoundingClientRect();
        const scaleX = imageNaturalWidth / imgRect.width;
        const scaleY = imageNaturalHeight / imgRect.height;

        const imageDx = dx * scaleX;
        const imageDy = dy * scaleY;

        let newX = startMarkX + imageDx;
        let newY = startMarkY + imageDy;

        newX = Math.max(0, Math.min(imageNaturalWidth - markData.size, newX));
        newY = Math.max(0, Math.min(imageNaturalHeight - markData.size, newY));

        markData.x = newX;
        markData.y = newY;

        updateMarkPosition(markData);

        // Update wires connected to this mark
        updateWiresConnectedToMark(markData);
    }

    function onPointerUp(ev) {
        if (dragging) {
            dragging = false;
            try {
                if (el.releasePointerCapture) el.releasePointerCapture(ev.pointerId);
            } catch (e) { }
            el.classList.remove('selected');

            // FIX: Only open modal if NO dragging occurred (just a click)
            if (!dragStarted && !isWireMode) {
                selectedMarkId = id;
                updateMarkSelection();
                openProductModal(markData);
            }
        }
    }

    el.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    // Add click event with wire handling
    el.addEventListener('click', function (e) {
        e.stopPropagation();

        if (isWireMode && currentWireType && !e.defaultPrevented) {
            // Unified wire selection logic for ALL marks (including multi-component)
            if (!wireStartMark) {
                wireStartMark = markData;
                showNotification(`First mark selected: ${label}. Now select second mark.`, 'info');
            } else if (!wireEndMark && wireStartMark !== markData) {
                wireEndMark = markData;
                const wireTypeInfo = getWireTypeInfo(currentWireType);
                showNotification(`Second mark selected: ${label}. ${currentWireMode === 'curve' ? 'Adjust curve' : 'Add points'} and click "Create ${wireTypeInfo.title}".`, 'info');
            } else if (wireStartMark === markData) {
                wireStartMark = null;
                wireEndMark = null;
                wirePoints = [];
                showNotification('First mark selection cleared.', 'info');
            } else if (wireEndMark === markData) {
                wireEndMark = null;
                wirePoints = [];
                showNotification('Second mark selection cleared.', 'info');
            }
            updateWireSelectionLabels();
            updatePointsList();
            e.preventDefault();
        } else if (!isWireMode && !e.defaultPrevented) {
            // Only open modal if not in wire mode and not dragging
            if (!dragStarted) {
                selectedMarkId = id;
                updateMarkSelection();
                openProductModal(markData);
            }
        }
    });

    el.addEventListener('mouseenter', () => orientTooltip(markData));

    updateMarkPosition(markData);
    orientTooltip(markData);

    return markData;
}


// Add this function to refresh config when selecting different marks
function updateSwitchConfigForSelectedMark() {
    if (!currentProduct || !switchFamilies.has(currentProduct)) return;

    const selectedMark = marks.find(mark => mark.id === selectedMarkId);
    const configInput = document.getElementById('switchConfigInput');

    if (configInput) {
        // Show the mark's individual config, or the default if no individual config exists
        if (selectedMark) {
            configInput.value = selectedMark.switchConfig ||
                productData[currentProduct]?.defaultSwitchConfig ||
                '';
        } else {
            // No mark selected, show default config
            configInput.value = productData[currentProduct]?.defaultSwitchConfig || '';
        }

        // Update the instruction text
        const infoDiv = configInput.nextElementSibling;
        if (infoDiv && selectedMark) {
            infoDiv.textContent = `Configuring: ${selectedMark.seriesLabel} (${selectedMark.modelName})`;
        }
    }
}

// Call this in updateMarkSelection():
function updateMarkSelection() {
    marks.forEach(m => {
        m.el.classList.toggle('selected', m.id === selectedMarkId);
    });

    // Update switch configuration input if a switch is selected
    if (currentProduct && switchFamilies.has(currentProduct)) {
        updateSwitchConfigForSelectedMark();
    }

    renderMarksList();
}


function removeMark(id) {
    const idx = marks.findIndex(x => x.id === id);
    if (idx === -1) return;
    const m = marks[idx];

    const connectedWires = wires.filter(w => w.startMark === m || w.endMark === m);
    connectedWires.forEach(wire => {
        if (wire.element && wire.element.svg) {
            wire.element.svg.remove();
        }
        const wireIndex = wires.indexOf(wire);
        if (wireIndex > -1) {
            wires.splice(wireIndex, 1);
        }
    });

    if (m.el && m.el.parentNode) {
        m.el.parentNode.removeChild(m.el);
    }
    marks.splice(idx, 1);
    if (selectedMarkId === id) {
        selectedMarkId = null;
    }

    updateWiresList();
    renumberAllMarks();
    updateMarkSelection();
}

function renderMarksList() {
    marksListEl.innerHTML = '';
    if (marks.length === 0) {
        const empty = document.createElement('div');
        empty.style.color = 'var(--muted)';
        empty.style.fontSize = '12px';
        empty.style.padding = '8px';
        empty.textContent = 'No marks added yet';
        marksListEl.appendChild(empty);
        return;
    }

    // Group multi-component marks
    const groupedMarks = {};
    const regularMarks = [];

    marks.forEach(m => {
        if (m.groupId && multiComponentGroups[m.groupId]) {
            if (!groupedMarks[m.groupId]) {
                groupedMarks[m.groupId] = {
                    group: multiComponentGroups[m.groupId],
                    marks: [m]
                };
            } else {
                groupedMarks[m.groupId].marks.push(m);
            }
        } else {
            regularMarks.push(m);
        }
    });

    // Render grouped marks
    Object.values(groupedMarks).forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = 'mark-item group-item';
        groupItem.style.background = 'linear-gradient(135deg, #FFF3E0, #FFECB3)';
        groupItem.style.borderLeft = '4px solid #FF9800';

        const groupHeader = document.createElement('div');
        groupHeader.style.display = 'flex';
        groupHeader.style.justifyContent = 'space-between';
        groupHeader.style.alignItems = 'center';
        groupHeader.style.width = '100%';

        const groupInfo = document.createElement('div');
        groupInfo.style.flex = '1';

        const groupTitle = document.createElement('div');
        groupTitle.style.fontWeight = '600';
        groupTitle.style.fontSize = '12px';
        groupTitle.style.color = '#333';
        groupTitle.textContent = group.group.mainLabel;

        const groupSubtitle = document.createElement('div');
        groupSubtitle.style.fontSize = '10px';
        groupSubtitle.style.color = '#666';
        groupSubtitle.textContent = `${group.marks.length} components`;

        groupInfo.appendChild(groupTitle);
        groupInfo.appendChild(groupSubtitle);

        const groupActions = document.createElement('div');
        groupActions.style.display = 'flex';
        groupActions.style.gap = '4px';

        const expandBtn = document.createElement('button');
        expandBtn.className = 'btn';
        expandBtn.innerHTML = '<span class="material-icons" style="font-size:14px;">expand_more</span>';
        expandBtn.style.padding = '2px 4px';
        expandBtn.style.minHeight = 'auto';
        expandBtn.style.fontSize = '10px';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn';
        deleteBtn.innerHTML = '<span class="material-icons" style="font-size:14px;">close</span>';
        deleteBtn.style.padding = '2px 4px';
        deleteBtn.style.minHeight = 'auto';
        deleteBtn.style.fontSize = '10px';

        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const componentList = groupItem.querySelector('.component-list');
            if (componentList) {
                const isHidden = componentList.style.display === 'none';
                componentList.style.display = isHidden ? 'block' : 'none';
                expandBtn.querySelector('.material-icons').textContent =
                    isHidden ? 'expand_less' : 'expand_more';
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete entire ${group.group.mainLabel}? This will remove all ${group.marks.length} components.`)) {
                group.marks.forEach(mark => {
                    removeMark(mark.id);
                });
                delete multiComponentGroups[group.group.id];
            }
        });

        groupActions.appendChild(expandBtn);
        groupActions.appendChild(deleteBtn);
        groupHeader.appendChild(groupInfo);
        groupHeader.appendChild(groupActions);

        groupItem.appendChild(groupHeader);

        // Component list (hidden by default)
        const componentList = document.createElement('div');
        componentList.className = 'component-list';
        componentList.style.display = 'none';
        componentList.style.marginTop = '8px';
        componentList.style.paddingLeft = '10px';
        componentList.style.borderLeft = '2px dashed #FFB74D';

        group.marks.forEach(m => {
            const compItem = document.createElement('div');
            compItem.className = 'mark-item';
            compItem.style.marginBottom = '2px';
            compItem.style.padding = '4px 6px';
            compItem.style.fontSize = '10px';
            compItem.classList.toggle('active', m.id === selectedMarkId);

            const label = document.createElement('span');
            label.textContent = `${m.seriesLabel} - ${m.componentType}`;
            compItem.appendChild(label);

            const compDeleteBtn = document.createElement('button');
            compDeleteBtn.className = 'btn';
            compDeleteBtn.innerHTML = '<span class="material-icons" style="font-size:12px;">close</span>';
            compDeleteBtn.style.marginLeft = '8px';
            compDeleteBtn.style.padding = '1px 2px';
            compDeleteBtn.style.minHeight = 'auto';
            compDeleteBtn.style.fontSize = '9px';
            compDeleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeMark(m.id);
                // Remove from group
                const index = group.marks.indexOf(m);
                if (index > -1) {
                    group.marks.splice(index, 1);
                }
                // Update group if empty
                if (group.marks.length === 0) {
                    delete multiComponentGroups[group.group.id];
                    groupItem.remove();
                }
            });

            compItem.appendChild(compDeleteBtn);

            compItem.addEventListener('click', (e) => {
                if (e.target !== compDeleteBtn && !compDeleteBtn.contains(e.target)) {
                    selectedMarkId = m.id;
                    updateMarkSelection();
                    openProductModal(m);
                }
            });

            componentList.appendChild(compItem);
        });

        groupItem.appendChild(componentList);
        marksListEl.appendChild(groupItem);
    });

    // Render regular marks
    regularMarks.forEach(m => {
        const item = document.createElement('div');
        item.className = 'mark-item';
        item.classList.toggle('active', m.id === selectedMarkId);

        const labelContainer = document.createElement('div');
        labelContainer.style.flex = '1';

        if (m.isTextLabel) {
            // Show just the text content for text labels
            const label = document.createElement('span');
            label.textContent = `"${m.text}"`;
            label.style.color = '#000000';
            label.style.fontWeight = 'normal';
            label.style.fontStyle = 'normal';
            labelContainer.appendChild(label);
        } else {
            // For switches, show configuration in the list
            if (m.isSwitchFamily && m.switchConfig) {
                const mainLabel = document.createElement('div');
                mainLabel.style.fontSize = '11px';
                mainLabel.style.fontWeight = 'bold';
                mainLabel.textContent = m.seriesLabel;
                labelContainer.appendChild(mainLabel);

                const configLabel = document.createElement('div');
                configLabel.style.fontSize = '10px';
                configLabel.style.color = '#666';
                configLabel.style.marginTop = '2px';
                configLabel.textContent = m.switchConfig;
                labelContainer.appendChild(configLabel);
            } else {
                const label = document.createElement('span');
                label.textContent = m.seriesLabel;
                labelContainer.appendChild(label);
            }
        }

        item.appendChild(labelContainer);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn';
        deleteBtn.innerHTML = '<span class="material-icons" style="font-size:16px;">close</span>';
        deleteBtn.style.marginLeft = '8px';
        deleteBtn.style.padding = '4px 6px';
        deleteBtn.style.minHeight = 'auto';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeMark(m.id);
        });
        item.appendChild(deleteBtn);

        item.addEventListener('click', (e) => {
            if (e.target !== deleteBtn && !deleteBtn.contains(e.target)) {
                selectedMarkId = m.id;
                updateMarkSelection();

                // Refresh switch configuration controls if this is a switch
                if (m.isSwitchFamily) {
                    // Remove and recreate switch controls
                    const existingControls = document.getElementById('switchConfigControls');
                    if (existingControls) {
                        existingControls.remove();
                    }
                    createSwitchConfigurationControls();
                }

                // Don't open modal for text labels or emitters
                if (!m.isTextLabel && !m.isEmitter) {
                    openProductModal(m);
                }
            }
        });
        marksListEl.appendChild(item);
    });
}

/* ------------------------- ZOOMING ------------------------- */
function setScale(scale) {
    imageScale = Math.max(0.3, Math.min(3, scale));

    const img = previewImage;
    const containerRect = imgContainer.getBoundingClientRect();
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth, displayHeight;
    if (imgAspect > containerAspect) {
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
    } else {
        displayHeight = containerRect.height;
        displayWidth = containerRect.height * imgAspect;
    }

    imageDisplayWidth = displayWidth * imageScale;
    imageDisplayHeight = displayHeight * imageScale;

    imgInner.style.transform = `scale(${imageScale})`;

    requestAnimationFrame(() => {
        updateImageDimensions();
    });
}

imgContainer.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = -e.deltaY / 500;
    setScale(imageScale + delta);
});

let pinchStartDist = 0, pinchStartScale = 1;
imgContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        pinchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartScale = imageScale;
    }
});

imgContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = d / pinchStartDist;
        setScale(pinchStartScale * ratio);
    }
});

document.getElementById('zoomReset').addEventListener('click', () => {
    setScale(1);
});

imgContainer.addEventListener('click', (e) => {
    if (!e.target.closest('.mark') && !e.target.closest('.wire') && !e.target.closest('.draggable-point')) {
        selectedMarkId = null;
        updateMarkSelection();

        if (!isWireMode) {
            resetWireSelection();
        }
    }
});

/* ------------------------- INIT ------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    loadFloorPlanImage();
    buildList();

    if (previewImage.complete) {
        updateImageDimensions();
    } else {
        previewImage.addEventListener('load', updateImageDimensions);
    }

    const firstKey = PRODUCT_ORDER[0] || Object.keys(productData)[0];
    selectProduct(firstKey);
});

/* ------------------------- UTILITY FUNCTIONS ------------------------- */
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.pdf-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `pdf-notification pdf-notification-${type}`;
    notification.innerHTML = `
        <span class="pdf-notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
        <span class="pdf-notification-text">${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .pdf-notification-icon {
        font-weight: bold;
        font-size: 16px;
    }
    
    .draggable-point {
        transition: all 0.2s ease;
    }
    
    .draggable-point:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
    
    .draggable-point.dragging {
        transform: scale(1.4);
        box-shadow: 0 6px 12px rgba(0,0,0,0.5);
        cursor: grabbing;
    }
    
    .form-control {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 2px solid #e8eaed;
        background: #ffffff;
        font-size: 13px;
        color: #202124;
        transition: all 0.2s;
    }
    
    .form-control:hover {
        border-color: #2196F3;
    }
    
    .form-control:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }
    .text-label {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        min-width: auto !important;
        min-height: auto !important;
        display: inline-block !important;
    }
    
    .text-label-content {
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #000000 !important;
        text-shadow: 1px 1px 1px rgba(255,255,255,0.8);
        white-space: nowrap !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        pointer-events: none !important;
    }
    
    .mark.text-label:hover .text-label-content {
        text-shadow: 0 0 3px rgba(102, 126, 234, 0.3);
    }
    
    .mark.text-label.dragging .text-label-content {
        text-shadow: 0 0 4px rgba(102, 126, 234, 0.5);
    }
`;
document.head.appendChild(style);

/* ------------------------- BRAND ENHANCEMENT ------------------------- */
function enhanceProductDataWithBrands() {
    const brands = {
        "DOOR LOCK": "LocPro",
        "PROCESSOR": "LUMI",
        "LUMI GLASS SERIES": "LUMI",
        "ESCULT SERIES": "Escult",
        "WALL MOUNT DISPLAY": "LUMI",
        "TACTILE HEXA SERIES": "LUMI",
        "DUO-QUAD SERIES": "LUMI",
        "DOMOGENIE GLASS SERIES": "Domogenie",
        "TREMBLAY SOUNDS": "Tremblay",
        "Z-WAVE RELAY": "LUMI",
        "CURTAIN MOTORS": "LUMI",
        "SENSORS": "Big Sense",
        "IR BLASTER - ZMOTE": "Zmote",
        "ACCESS POINT": "Ubiquiti", // ADD THIS LINE
        "EQUIPMENTS": "Equipment",
        "AUTOMATION DISTRIBUTION BOX": "DB",
        "NETWORK DISTRIBUTION BOX": "DB"
    };

    for (const [category, brand] of Object.entries(brands)) {
        if (productData[category]) {
            if (!productData[category].isDBBox && !productData[category].isNetworkDBBox && !productData[category].isEquipment) {
                productData[category].brand = brand;
            }
            if (productData[category].subProducts) {
                for (const subProduct of Object.values(productData[category].subProducts)) {
                    subProduct.brand = brand;
                }
            }
        }
    }
}
enhanceProductDataWithBrands();

/* ------------------------- PDF EXPORT FUNCTIONALITY ------------------------- */
document.getElementById('downloadPdfBtn').addEventListener('click', async function () {
    try {
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px; margin-right: 8px;">hourglass_empty</span> Generating PDF...';
        btn.disabled = true;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        doc.setProperties({
            title: 'Home Automation Configuration',
            subject: 'Product Configuration Summary',
            creator: 'Automation Configurator'
        });

        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Automation Design Suite', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generated on: ${currentDate}`, 105, 28, { align: 'center' });

        let yPosition = 40;

        try {
            const screenshot = await captureFloorPlanScreenshot();
            if (screenshot) {
                const pageWidth = doc.internal.pageSize.getWidth();
                const margin = 20;
                const imgWidth = pageWidth - (2 * margin);

                const tempImg = new Image();
                tempImg.src = screenshot;
                await new Promise((resolve) => {
                    tempImg.onload = () => {
                        const aspectRatio = tempImg.height / tempImg.width;
                        const imgHeight = imgWidth * aspectRatio;

                        doc.addImage(screenshot, 'PNG', margin, yPosition, imgWidth, imgHeight);

                        doc.setFontSize(9);
                        doc.setTextColor(100, 100, 100);
                        doc.text('Floor Plan with Product Labels', 105, yPosition + imgHeight + 5, { align: 'center' });
                        yPosition = yPosition + imgHeight + 15;

                        resolve();
                    };
                    tempImg.onerror = resolve;
                });
            }
        } catch (imgError) {
            console.warn('Could not capture floor plan:', imgError);
            doc.setFontSize(12);
            doc.setTextColor(150, 150, 150);
            doc.text('Floor plan image not available', 105, 80, { align: 'center' });
            yPosition = 100;
        }

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Page 1 of 2', doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

        doc.addPage();
        yPosition = 30;

        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Product Configuration Summary', 105, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${currentDate}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        const tables = generateProductTable();
        const hasDBBoxes = tables.dbBoxes.length > 0;
        const hasNetworkDBBoxes = tables.networkDBBoxes.length > 0;
        const hasMainProducts = tables.mainProducts.length > 0;
        const hasEquipment = tables.equipment.length > 0; // Check for equipment

        // In the Automation DB Box section, update to show like:
        if (hasDBBoxes) {
            doc.setFontSize(14);
            doc.setTextColor(26, 115, 232);
            doc.text('Automation Distribution Boxes', 20, yPosition);
            yPosition += 8;

            const dbTableData = tables.dbBoxes.map(item => [
                item.label,
                'AUTOMATION\nDISTRIBUTION\nBOX', // Type with line breaks
                item.brand,
                item.size,
                item.model,
                item.quantity.toString()
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Label', 'Type', 'Brand', 'Size (ft)', 'Model', 'Qty']],
                body: dbTableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [33, 150, 243],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    minCellHeight: 6
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 60, halign: 'center' }, // Type column
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 40, halign: 'left' },
                    5: { cellWidth: 15, halign: 'center' }
                },
                margin: { left: 15 }
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // DB Box Relays section
            // DB Box Relays section
            const dbBoxWithRelays = tables.dbBoxes.filter(item => item.selectedRelays && item.selectedRelays.length > 0);
            if (dbBoxWithRelays.length > 0) {
                yPosition += 5;
                doc.setFontSize(12);
                doc.setTextColor(33, 150, 243);
                doc.text('DB Box Modules:', 20, yPosition);
                yPosition += 8;

                let itemY = yPosition;
                dbBoxWithRelays.forEach(dbBox => {
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text(`${dbBox.label}:`, 25, itemY);
                    itemY += 5;

                    dbBox.selectedRelays.forEach(item => {
                        if (itemY > doc.internal.pageSize.getHeight() - 30) {
                            doc.addPage();
                            itemY = 30;
                        }
                        doc.setFontSize(9);
                        doc.setTextColor(60, 60, 60);
                        doc.text(`• ${item.name} x${item.quantity}`, 35, itemY);
                        itemY += 4;
                    });
                    itemY += 3;
                });
                yPosition = itemY + 10;
            }
        }

        // In the PDF generation section, replace the Network DB Box equipment part:
        // In the PDF generation section, update the Network DB Box part:

        if (hasNetworkDBBoxes) {
            doc.setFontSize(14);
            doc.setTextColor(156, 39, 176);
            doc.text('Network Distribution Boxes', 20, yPosition);
            yPosition += 8;

            const networkDBTableData = tables.networkDBBoxes.map(item => [
                item.label,
                'NETWORK\nDISTRIBUTION\nBOX',
                item.brand,
                item.size,
                item.model,
                item.quantity.toString()
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Label', 'Type', 'Brand', 'Size (ft)', 'Model', 'Qty']],
                body: networkDBTableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [156, 39, 176],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    minCellHeight: 6
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 60, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 40, halign: 'left' },
                    5: { cellWidth: 15, halign: 'center' }
                },
                margin: { left: 15 }
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // Network DB Box Modules section
            const networkDBWithModules = tables.networkDBBoxes.filter(item =>
                item.selectedModules && item.selectedModules.length > 0
            );

            if (networkDBWithModules.length > 0) {
                yPosition += 5;
                doc.setFontSize(12);
                doc.setTextColor(156, 39, 176);
                doc.text('Network DB Box Modules:', 20, yPosition);
                yPosition += 8;

                let itemY = yPosition;
                networkDBWithModules.forEach(dbBox => {
                    if (itemY > doc.internal.pageSize.getHeight() - 30) {
                        doc.addPage();
                        itemY = 30;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text(`${dbBox.label}:`, 25, itemY);
                    itemY += 5;

                    dbBox.selectedModules.forEach(item => {
                        if (itemY > doc.internal.pageSize.getHeight() - 30) {
                            doc.addPage();
                            itemY = 30;
                        }
                        doc.setFontSize(9);
                        doc.setTextColor(60, 60, 60);
                        doc.text(`• ${item.name} x${item.quantity}`, 35, itemY);
                        itemY += 4;
                    });
                    itemY += 3;
                });
                yPosition = itemY + 10;
            }

            // Network Router details
            const networkDBWithRouter = tables.networkDBBoxes.filter(item =>
                item.routerBrand && item.routerModel
            );

            if (networkDBWithRouter.length > 0) {
                yPosition += 5;
                doc.setFontSize(12);
                doc.setTextColor(156, 39, 176);
                doc.text('Network Routers:', 20, yPosition);
                yPosition += 8;

                let itemY = yPosition;
                networkDBWithRouter.forEach(dbBox => {
                    if (itemY > doc.internal.pageSize.getHeight() - 30) {
                        doc.addPage();
                        itemY = 30;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text(`${dbBox.label}:`, 25, itemY);
                    itemY += 5;

                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    doc.text(`Network Router:`, 35, itemY);
                    itemY += 4;

                    doc.setFontSize(8);
                    doc.setTextColor(40, 40, 40);
                    doc.text(`${dbBox.routerBrand} - ${dbBox.routerModel}`, 40, itemY);
                    itemY += 6;

                    itemY += 3;
                });
                yPosition = itemY + 10;
            }
        }
        if (hasMainProducts) {
            if (hasDBBoxes || hasNetworkDBBoxes) {
                doc.setFontSize(14);
                doc.setTextColor(76, 175, 80);
                doc.text('Automation Products', 20, yPosition);
                yPosition += 8;
            }

            // KEEP ORIGINAL 5-COLUMN TABLE
            const mainTableData = tables.mainProducts.map(item => [
                item.label,
                item.category,
                item.brand,
                item.model,
                item.quantity.toString()
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Label', 'Category', 'Brand', 'Model', 'Qty']], // KEEP 5 COLUMNS
                body: mainTableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [76, 175, 80],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    minCellHeight: 6
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 40, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 80, halign: 'left' },
                    4: { cellWidth: 15, halign: 'center' }
                },
                margin: { left: 15 }
            });

            yPosition = doc.lastAutoTable.finalY + 10;
        }

        if (hasEquipment) {
            yPosition += 10;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black color for equipment
            doc.text('Equipment', 20, yPosition);
            yPosition += 8;

            const equipmentTableData = tables.equipment.map(item => [
                item.label,
                item.category,
                item.brand,
                item.model,
                item.quantity.toString()
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Label', 'Category', 'Brand', 'Model', 'Qty']],
                body: equipmentTableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [0, 0, 0], // Black header
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    minCellHeight: 6
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 90, halign: 'left' },
                    4: { cellWidth: 15, halign: 'center' }
                },
                margin: { left: 15 }
            });

            yPosition = doc.lastAutoTable.finalY + 10;
        }

        const totalDBBoxes = tables.dbBoxes.reduce((sum, item) => sum + item.quantity, 0);
        const totalNetworkDBBoxes = tables.networkDBBoxes.reduce((sum, item) => sum + item.quantity, 0);
        const totalMainProducts = tables.mainProducts.reduce((sum, item) => sum + item.quantity, 0);
        const totalProducts = totalDBBoxes + totalNetworkDBBoxes + totalMainProducts;

        if (hasDBBoxes || hasNetworkDBBoxes || hasMainProducts) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            let summaryText = `Total Items: ${totalProducts}`;
            if (hasDBBoxes) summaryText += ` | Automation DB Boxes: ${totalDBBoxes}`;
            if (hasNetworkDBBoxes) summaryText += ` | Network DB Boxes: ${totalNetworkDBBoxes}`;
            if (hasMainProducts) summaryText += ` | Automation Products: ${totalMainProducts}`;

            doc.text(summaryText, 105, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        } else {
            doc.setFontSize(16);
            doc.setTextColor(100, 100, 100);
            doc.text('No Products Configured', 105, 80, { align: 'center' });
            doc.setFontSize(12);
            doc.text('Add products to the floor plan to generate a summary.', 105, 95, { align: 'center' });
        }

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page 2 of 2`, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        doc.save(`home-automation-configuration-${timestamp}.pdf`);

        showNotification('PDF generated successfully!', 'success');

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF: ' + error.message, 'error');
    } finally {
        const btn = document.getElementById('downloadPdfBtn');
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px; margin-right: 8px;">download</span> DOWNLOAD CONFIGURATOR PDF';
        btn.disabled = false;
    }
});

async function captureFloorPlanScreenshot() {
    try {
        const imageContainer = document.querySelector('.img-container');

        const notifications = document.querySelectorAll('.pdf-notification');
        notifications.forEach(n => n.style.visibility = 'hidden');

        const canvas = await html2canvas(imageContainer, {
            backgroundColor: '#ffffff',
            scale: 1,
            useCORS: true,
            logging: false,
            allowTaint: true,
            imageTimeout: 15000,
            onclone: function (clonedDoc) {
                const images = clonedDoc.querySelectorAll('img');
                images.forEach(img => {
                    if (img.complete) return;
                    img.onload = function () {
                        console.log('Image loaded in clone');
                    };
                });
            }
        });

        notifications.forEach(n => n.style.visibility = 'visible');

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Screenshot capture error:', error);

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#5f6368';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Floor Plan Image Not Available', canvas.width / 2, canvas.height / 2);
        ctx.font = '12px Arial';
        ctx.fillText('Please check console for errors', canvas.width / 2, canvas.height / 2 + 20);

        return canvas.toDataURL('image/png');
    }
}

function generateProductTable() {
    if (marks.length === 0) return { mainProducts: [], dbBoxes: [], networkDBBoxes: [], equipment: [] };

    const productMap = new Map();
    const dbBoxesTable = [];
    const networkDBBoxesTable = [];
    const equipmentTable = [];

    // First, group multi-component marks
    const groupedMultiComponent = {};

    // Group marks by their groupId
    marks.forEach(mark => {
        if (mark.groupId && multiComponentGroups[mark.groupId]) {
            if (!groupedMultiComponent[mark.groupId]) {
                groupedMultiComponent[mark.groupId] = {
                    group: multiComponentGroups[mark.groupId],
                    marks: [mark],
                    label: mark.seriesLabel
                };
            } else {
                groupedMultiComponent[mark.groupId].marks.push(mark);
            }
            return;
        }

        const key = mark.seriesLabel;
        const category = mark.categoryName || 'Unknown';
        let model = mark.modelName || 'Unknown';
        let brand = 'LUMI';

        if (mark.categoryName && productData[mark.categoryName]) {
            brand = productData[mark.categoryName].brand || brand;
        }

        // Skip emitters from PDF
        if (mark.isEmitter) return;

        // Handle equipment separately
        if (mark.isEquipment) {
            equipmentTable.push({
                label: mark.seriesLabel,
                category: category,
                brand: brand,
                model: model,
                quantity: 1
            });
            return;
        }

        if (mark.isDBBox) {
            dbBoxesTable.push({
                label: mark.seriesLabel,
                category: category,
                brand: mark.brand || brand,
                size: mark.sizeFt || 'Not specified',
                model: mark.modelName || model,
                quantity: 1,
                selectedRelays: mark.selectedRelays || []
            });
        } else if (mark.isNetworkDBBox) {
            // FIX: Make sure selectedModules is included
            networkDBBoxesTable.push({
                label: mark.seriesLabel,
                category: category,
                brand: mark.brand || brand,
                size: mark.sizeFt || 'Not specified',
                model: mark.modelName || model,
                quantity: 1,
                routerBrand: mark.routerBrand || '',
                routerModel: mark.routerModel || '',
                routerQty: mark.routerQty || 1,
                selectedModules: mark.selectedModules || [] // ADD THIS LINE
            });
        } else {
            // Handle regular products
            if (!productMap.has(key)) {
                productMap.set(key, {
                    label: key,
                    category: category,
                    brand: brand,
                    model: model,
                    quantity: 1
                });
            } else {
                productMap.get(key).quantity += 1;
            }
        }
    });

    // Add grouped multi-component products
    Object.values(groupedMultiComponent).forEach(group => {
        const mainMark = group.marks[0];
        productMap.set(group.label, {
            label: group.label,
            category: mainMark.categoryName,
            brand: 'Tremblay',
            model: mainMark.modelName,
            quantity: group.marks.length
        });
    });

    return {
        mainProducts: Array.from(productMap.values()),
        dbBoxes: dbBoxesTable,
        networkDBBoxes: networkDBBoxesTable,
        equipment: equipmentTable
    };
}

/* ------------------------- PROJECT SAVE/LOAD FUNCTIONS ------------------------- */
/* ------------------------- PROJECT SAVE/LOAD FUNCTIONS ------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectFileInput = document.getElementById('projectFileInput');

    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', saveProject);
    }

    if (loadProjectBtn) {
        loadProjectBtn.addEventListener('click', () => {
            projectFileInput.click();
        });
    }

    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', createNewProject);
    }

    if (projectFileInput) {
        projectFileInput.addEventListener('change', loadProjectFromFile);
    }
});

function saveProject() {
    try {
        const projectData = {
            version: '2.4', // Updated version
            timestamp: new Date().toISOString(),
            floorPlanImage: previewImage.src,
            marks: marks.map(mark => ({
                id: mark.id,
                x: mark.x,
                y: mark.y,
                size: mark.size,
                shape: mark.shape,
                seriesCode: mark.seriesCode,
                seriesLabel: mark.seriesLabel,
                categoryName: mark.categoryName,
                modelName: mark.modelName,
                groupId: mark.groupId,
                componentType: mark.componentType,
                componentIndex: mark.componentIndex,
                componentUniqueKey: mark.isMultiComponent ?
                    `${mark.seriesLabel}_${mark.componentType}_${mark.componentIndex}` :
                    mark.seriesLabel,
                desc: mark.desc,
                features: mark.features,
                imageSrc: mark.imageSrc,
                relayItems: mark.relayItems,
                isDBBox: mark.isDBBox,
                isNetworkDBBox: mark.isNetworkDBBox,
                isTextLabel: mark.isTextLabel,
                isMultiComponent: mark.isMultiComponent,
                isEquipment: mark.isEquipment, // Save equipment flag
                isSwitchFamily: mark.isSwitchFamily, // Save switch family flag
                text: mark.text,
                fontSize: mark.fontSize,
                brand: mark.brand,
                sizeFt: mark.sizeFt,
                selectedRelays: mark.selectedRelays,
                routerBrand: mark.routerBrand,
                routerModel: mark.routerModel,
                routerQty: mark.routerQty || 1,
                apBrand: mark.apBrand,
                apModel: mark.apModel,
                apQty: mark.apQty || 1,
                switchConfig: mark.switchConfig || '', // Save switch configuration
                equipmentIcon: mark.equipmentIcon || '', // Save equipment icon
                originalId: mark.id
            })),
            multiComponentGroups: multiComponentGroups,
            wires: wires.map(wire => ({
                id: wire.id,
                startMarkId: wire.startMark.id,
                endMarkId: wire.endMark.id,
                startMarkLabel: wire.startMark.seriesLabel,
                endMarkLabel: wire.endMark.seriesLabel,
                startMarkComponentKey: wire.startMark.isMultiComponent ?
                    `${wire.startMark.seriesLabel}_${wire.startMark.componentType}_${wire.startMark.componentIndex}` :
                    wire.startMark.seriesLabel,
                endMarkComponentKey: wire.endMark.isMultiComponent ?
                    `${wire.endMark.seriesLabel}_${wire.endMark.componentType}_${wire.endMark.componentIndex}` :
                    wire.endMark.seriesLabel,
                wireType: wire.wireType,
                mode: wire.mode,
                curveValue: wire.curveValue,
                points: wire.points,
                color: wire.color || getWireTypeInfo(wire.wireType).color
            })),
            relayState: relayState,
            lastRelaySelectionLabel: lastRelaySelectionLabel,
            currentProduct: currentProduct,
            currentSubProduct: currentSubProduct,
            currentWireType: currentWireType,
            isWireMode: isWireMode,
            seriesCounters: seriesCounters,
            markCounter: markCounter,
            imageScale: imageScale,
            dbBoxSpecs: Object.keys(productData)
                .filter(key => productData[key].isDBBox || productData[key].isNetworkDBBox)
                .reduce((specs, key) => {
                    specs[key] = {
                        brand: productData[key].brand || '',
                        size: productData[key].size || '',
                        selectedRelays: productData[key].selectedRelays || [],
                        routerBrand: productData[key].routerBrand || '',
                        routerModel: productData[key].routerModel || '',
                        routerQty: productData[key].routerQty || 1,
                        apBrand: productData[key].apBrand || '',
                        apModel: productData[key].apModel || '',
                        apQty: productData[key].apQty || 1
                    };
                    return specs;
                }, {}),
            switchConfigs: Object.keys(productData)
                .filter(key => switchFamilies.has(key))
                .reduce((specs, key) => {
                    specs[key] = {
                        switchConfig: productData[key].switchConfig || ''
                    };
                    return specs;
                }, {})
        };

        const jsonString = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `floor-plan-configuration-${new Date().toISOString().split('T')[0]}.dmp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Project saved successfully!', 'success');

    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving project: ' + error.message, 'error');
    }
}

function loadProjectFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const projectData = JSON.parse(e.target.result);
            loadProject(projectData);
            showNotification('Project loaded successfully!', 'success');
        } catch (error) {
            console.error('Load error:', error);
            showNotification('Error loading project: Invalid file format', 'error');
        }

        event.target.value = '';
    };

    reader.readAsText(file);
}

function loadProject(projectData) {
    if (!projectData.version || !projectData.marks || !projectData.wires) {
        showNotification('Invalid project file format', 'error');
        return;
    }

    clearAllMarksAndWires();

    markCounter = 0;
    Object.keys(seriesCounters).forEach(key => delete seriesCounters[key]);

    if (projectData.floorPlanImage) {
        previewImage.src = projectData.floorPlanImage;
        previewImage.onload = function () {
            loadProjectData(projectData);
        };
    } else {
        loadProjectData(projectData);
    }
}

function loadProjectData(projectData) {
    if (projectData.imageScale) {
        setScale(projectData.imageScale);
    }

    if (projectData.dbBoxSpecs) {
        Object.keys(projectData.dbBoxSpecs).forEach(key => {
            if (productData[key]) {
                productData[key].brand = projectData.dbBoxSpecs[key].brand;
                productData[key].size = projectData.dbBoxSpecs[key].size;
                productData[key].selectedRelays = projectData.dbBoxSpecs[key].selectedRelays || [];
                productData[key].routerBrand = projectData.dbBoxSpecs[key].routerBrand || '';
                productData[key].routerModel = projectData.dbBoxSpecs[key].routerModel || '';
                productData[key].routerQty = projectData.dbBoxSpecs[key].routerQty || 1;
                productData[key].apBrand = projectData.dbBoxSpecs[key].apBrand || '';
                productData[key].apModel = projectData.dbBoxSpecs[key].apModel || '';
                productData[key].apQty = projectData.dbBoxSpecs[key].apQty || 1;
            }
        });
    }

    // Load switch configurations
    if (projectData.switchConfigs) {
        Object.keys(projectData.switchConfigs).forEach(key => {
            if (productData[key]) {
                productData[key].switchConfig = projectData.switchConfigs[key].switchConfig || '';
            }
        });
    }

    if (projectData.multiComponentGroups) {
        multiComponentGroups = projectData.multiComponentGroups;
    }

    // Create lookup maps
    const markIdMap = new Map();
    const markLabelMap = new Map();
    const markComponentKeyMap = new Map();

    // First, load all marks
    projectData.marks.forEach(savedMark => {
        const newId = 'mark-' + (++markCounter);

        // Create mark data object
        const mark = {
            id: newId,
            x: savedMark.x,
            y: savedMark.y,
            size: savedMark.size,
            shape: savedMark.shape || 'circle',
            seriesCode: savedMark.seriesCode,
            seriesLabel: savedMark.seriesLabel,
            categoryName: savedMark.categoryName,
            modelName: savedMark.modelName,
            desc: savedMark.desc,
            features: savedMark.features || [],
            imageSrc: savedMark.imageSrc,
            relayItems: savedMark.relayItems || [],
            isDBBox: savedMark.isDBBox || false,
            isNetworkDBBox: savedMark.isNetworkDBBox || false,
            isTextLabel: savedMark.isTextLabel || false,
            isEquipment: savedMark.isEquipment || false, // Load equipment flag
            isMultiComponent: savedMark.isMultiComponent || false,
            brand: savedMark.brand || '',
            sizeFt: savedMark.sizeFt || '',
            selectedRelays: savedMark.selectedRelays || [],
            routerBrand: savedMark.routerBrand || '',
            routerModel: savedMark.routerModel || '',
            routerQty: savedMark.routerQty || 1,
            apBrand: savedMark.apBrand || '',
            apModel: savedMark.apModel || '',
            apQty: savedMark.apQty || 1,
            text: savedMark.text || '',
            fontSize: savedMark.fontSize || 12,
            isTremblay: savedMark.categoryName === 'TREMBLAY SOUNDS',
            groupId: savedMark.groupId || null,
            componentType: savedMark.componentType || '',
            isSwitchFamily: savedMark.isSwitchFamily || false,
            switchConfig: savedMark.switchConfig || '',
            equipmentIcon: savedMark.equipmentIcon || '', // Load equipment icon
            componentIndex: savedMark.componentIndex || 0,
            componentUniqueKey: savedMark.componentUniqueKey || savedMark.seriesLabel
        };

        // CRITICAL: Ensure equipment is NOT treated as text label
        if (mark.isEquipment) {
            mark.isTextLabel = false;
        }

        // Update series counter
        if (!seriesCounters[mark.seriesCode]) {
            seriesCounters[mark.seriesCode] = 0;
        }
        const num = parseInt(mark.seriesLabel.substring(mark.seriesCode.length)) || 0;
        seriesCounters[mark.seriesCode] = Math.max(seriesCounters[mark.seriesCode], num);

        // Create the element
        const el = document.createElement('div');
        el.className = 'mark ' + mark.shape;
        el.dataset.id = mark.id;
        el.dataset.size = mark.size;
        el.dataset.shape = mark.shape;
        el.dataset.seriesLabel = mark.seriesLabel;

        // Handle equipment marks
        if (mark.isEquipment) {
            el.dataset.isEquipment = 'true';

            // Create icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'equipment-icon';
            iconContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
                pointer-events: none;
            `;

            const iconImg = document.createElement('img');
            iconImg.src = mark.equipmentIcon || mark.imageSrc || '';
            iconImg.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: brightness(0);
            `;

            iconContainer.appendChild(iconImg);
            el.appendChild(iconContainer);

            // Add series label text
            const eqText = document.createElement('div');
            eqText.className = 'equipment-label-text';
            eqText.textContent = mark.seriesLabel;
            eqText.style.cssText = `
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translate(-50%, 5px);
                font-size: 10px;
                font-weight: bold;
                color: #000;
                white-space: nowrap;
                pointer-events: none;
            `;
            el.appendChild(eqText);

            // Equipment styling
        } else if (mark.isTextLabel) {
            el.dataset.isTextLabel = 'true';
            el.style.backgroundColor = '#FFFFFF';
            el.style.borderColor = '#667eea';
            el.style.borderWidth = '2px';
            el.style.borderStyle = 'solid';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.padding = '4px 8px';

            const textSpan = document.createElement('span');
            textSpan.className = 'label-text';
            textSpan.textContent = mark.text || mark.modelName || '';
            textSpan.style.color = '#000000';
            textSpan.style.fontSize = mark.fontSize + 'px' || '12px';
            textSpan.style.fontWeight = '600';
            textSpan.style.textAlign = 'center';
            textSpan.style.lineHeight = '1.2';
            textSpan.style.whiteSpace = 'nowrap';
            textSpan.style.overflow = 'hidden';
            textSpan.style.textOverflow = 'ellipsis';
            textSpan.style.maxWidth = '100px';
            el.appendChild(textSpan);

            mark.labelElement = textSpan;
        }

        // Create badge (not shown for equipment)
        const badge = document.createElement('div');
        badge.className = 'label-badge';
        if (!mark.isEquipment) {
            badge.textContent = mark.seriesLabel;

            if (mark.isTextLabel) {
                badge.style.backgroundColor = '#667eea';
                badge.style.color = '#FFFFFF';
            } else if (mark.isTremblay || mark.isMultiComponent) {
                badge.style.backgroundColor = '#FF9800';
            }
            el.appendChild(badge);
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';

        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';

        const tooltipTitle = document.createElement('div');
        tooltipTitle.className = 'tooltip-title';
        tooltipTitle.textContent = mark.categoryName || 'Product';
        if (mark.isTextLabel) {
            tooltipTitle.style.color = '#667eea';
        } else if (mark.isTremblay || mark.isMultiComponent) {
            tooltipTitle.style.color = '#FF9800';
        }

        const tooltipModel = document.createElement('div');
        tooltipModel.className = 'tooltip-model';
        tooltipModel.textContent = mark.modelName || '—';

        tooltipContent.appendChild(tooltipTitle);
        tooltipContent.appendChild(tooltipModel);
        tooltip.appendChild(tooltipContent);
        el.appendChild(tooltip);

        imgInner.appendChild(el);

        // Setup event listeners
        el.addEventListener('click', function (e) {
            e.stopPropagation();

            if (isWireMode && currentWireType && !e.defaultPrevented) {
                if (!wireStartMark) {
                    wireStartMark = mark;
                    showNotification(`First mark selected: ${mark.seriesLabel}. Now select second mark.`, 'info');
                } else if (!wireEndMark && wireStartMark !== mark) {
                    wireEndMark = mark;
                    const wireTypeInfo = getWireTypeInfo(currentWireType);
                    showNotification(`Second mark selected: ${mark.seriesLabel}. ${currentWireMode === 'curve' ? 'Adjust curve' : 'Add points'} and click "Create ${wireTypeInfo.title}".`, 'info');
                } else if (wireStartMark === mark) {
                    wireStartMark = null;
                    wireEndMark = null;
                    wirePoints = [];
                    showNotification('First mark selection cleared.', 'info');
                } else if (wireEndMark === mark) {
                    wireEndMark = null;
                    wirePoints = [];
                    showNotification('Second mark selection cleared.', 'info');
                }
                updateWireSelectionLabels();
                updatePointsList();
                e.preventDefault();
            } else if (!isWireMode && !e.defaultPrevented) {
                selectedMarkId = mark.id;
                updateMarkSelection();

                // Don't open modal for text labels or equipment
                if (!mark.isTextLabel && !mark.isEquipment) {
                    openProductModal(mark);
                }
            }
        });

        // Setup dragging
        setupMarkDragging(el, mark);

        mark.el = el;
        mark.tooltip = tooltip;
        marks.push(mark);

        // Store in maps
        markIdMap.set(savedMark.id, mark);
        markLabelMap.set(mark.seriesLabel, mark);

        if (mark.isMultiComponent && mark.componentUniqueKey) {
            markComponentKeyMap.set(mark.componentUniqueKey, mark);
        }
    });

    // Update all marks positions
    updateAllMarks();
    renderMarksList();

    // Load all wires
    if (projectData.wires && Array.isArray(projectData.wires)) {
        console.log('Loading wires:', projectData.wires.length);

        projectData.wires.forEach(savedWire => {
            let startMark = null;
            let endMark = null;

            // Try to find marks by componentUniqueKey (for multi-component marks)
            if (savedWire.startMarkComponentKey) {
                startMark = markComponentKeyMap.get(savedWire.startMarkComponentKey);
            }
            if (savedWire.endMarkComponentKey) {
                endMark = markComponentKeyMap.get(savedWire.endMarkComponentKey);
            }

            // If not found by component key, try by seriesLabel
            if (!startMark) {
                startMark = markLabelMap.get(savedWire.startMarkLabel);
            }
            if (!endMark) {
                endMark = markLabelMap.get(savedWire.endMarkLabel);
            }

            // Fallback: try by ID
            if (!startMark) {
                startMark = markIdMap.get(savedWire.startMarkId);
            }
            if (!endMark) {
                endMark = markIdMap.get(savedWire.endMarkId);
            }

            if (!startMark || !endMark) {
                console.warn('Could not find marks for wire:', {
                    startLabel: savedWire.startMarkLabel,
                    endLabel: savedWire.endMarkLabel
                });
                return;
            }

            // Set current wire type for wire creation
            const originalWireType = currentWireType;
            currentWireType = savedWire.wireType || 'knx';

            let wireElement;
            if (savedWire.mode === 'curve') {
                wireElement = createWireElement(startMark, endMark, savedWire.curveValue || 0, false);
            } else {
                wireElement = createWireElementWithPoints(startMark, endMark, savedWire.points || [], false);
            }

            // Restore original wire type
            currentWireType = originalWireType;

            if (!wireElement) {
                console.error('Failed to create wire element');
                return;
            }

            const wire = {
                id: savedWire.id || `wire-${Date.now()}`,
                startMark: startMark,
                endMark: endMark,
                element: wireElement,
                mode: savedWire.mode || 'curve',
                curveValue: savedWire.curveValue || 0,
                points: savedWire.points || [],
                wireType: savedWire.wireType || 'knx',
                color: savedWire.color || getWireTypeInfo(savedWire.wireType || 'knx').color
            };

            wires.push(wire);

            // Reattach event listeners
            if (wireElement.path) {
                wireElement.path.style.cursor = "pointer";
                wireElement.path.addEventListener('click', function (e) {
                    e.stopPropagation();
                    selectWire(startMark, endMark, wire.wireType);
                });

                makeWireDraggable(wireElement.path, startMark, endMark);
            }
        });

        console.log('Wires loaded:', wires.length);
    }

    // Restore other states
    if (projectData.relayState) {
        Object.assign(relayState, projectData.relayState);
        lastRelaySelectionLabel = projectData.lastRelaySelectionLabel || '';
    }

    // Restore wire mode state
    if (projectData.currentWireType) {
        currentWireType = projectData.currentWireType;
        isWireMode = projectData.isWireMode || false;

        if (isWireMode && currentWireType) {
            setTimeout(() => {
                showWireControls();
                updateWireSelectionLabels();
                updateWiresList();
            }, 100);
        }
    }

    // Restore product selection
    if (projectData.currentProduct) {
        setTimeout(() => {
            selectProduct(projectData.currentProduct, projectData.currentSubProduct);
            if (projectData.currentProduct === 'Z-WAVE RELAY') {
                updateRelayOverlay();
            }
        }, 150);
    }

    // Update wires list if needed
    if (currentWireType) {
        setTimeout(() => {
            updateWiresList();
        }, 200);
    }

    showNotification(`Project loaded: ${projectData.marks.length} marks, ${wires.length} wires`, 'success');
}

function setupMarkDragging(el, markData) {
    let dragging = false;
    let startX = 0, startY = 0;
    let startMarkX = 0, startMarkY = 0;
    let dragStarted = false;

    function onPointerDown(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (el.setPointerCapture) el.setPointerCapture(ev.pointerId);
        dragging = true;
        dragStarted = false;
        startX = ev.clientX;
        startY = ev.clientY;
        startMarkX = markData.x;
        startMarkY = markData.y;
        selectedMarkId = markData.id;
        updateMarkSelection();
        el.classList.add('selected');
    }

    function onPointerMove(ev) {
        if (!dragging) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!dragStarted && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragStarted = true;
        }

        if (!dragStarted) return;

        ev.preventDefault();
        ev.stopPropagation();

        const transform = getImageTransform();
        if (!transform || !imageNaturalWidth || !imageNaturalHeight) return;

        const imgRect = previewImage.getBoundingClientRect();
        const scaleX = imageNaturalWidth / imgRect.width;
        const scaleY = imageNaturalHeight / imgRect.height;

        const imageDx = dx * scaleX;
        const imageDy = dy * scaleY;

        let newX = startMarkX + imageDx;
        let newY = startMarkY + imageDy;

        newX = Math.max(0, Math.min(imageNaturalWidth - markData.size, newX));
        newY = Math.max(0, Math.min(imageNaturalHeight - markData.size, newY));

        markData.x = newX;
        markData.y = newY;

        updateMarkPosition(markData);

        // Update wires connected to this mark
        updateWiresConnectedToMark(markData);
    }

    function onPointerUp(ev) {
        if (dragging) {
            dragging = false;
            try {
                if (el.releasePointerCapture) el.releasePointerCapture(ev.pointerId);
            } catch (e) { }
            el.classList.remove('selected');

            // FIX: Only open modal if we didn't drag (just clicked)
            if (!dragStarted && !isWireMode && !markData.isTextLabel && !markData.isEmitter) {
                selectedMarkId = markData.id;
                updateMarkSelection();
                openProductModal(markData);
            }
            dragStarted = false;
        }
    }

    el.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
}

function createNewProject() {
    if (confirm('Create new project? All unsaved changes will be lost.')) {
        clearAllMarksAndWires();
        previewImage.src = 'https://virtualtourslasvegas.com/wp-content/uploads/2023/01/1701-N-Green-Valley-Pkwy-8A.jpg';
        setScale(1);
        showNotification('New project created', 'success');
    }
}

// The rest of your disableAllZoom function remains the same...

function disableAllZoom() {
    // Prevent keyboard zoom (Ctrl +, Ctrl -, Ctrl + mouse wheel)
    document.addEventListener('keydown', function (e) {
        // Windows/Linux: Ctrl + +/-/0
        // Mac: Cmd + +/-/0
        if ((e.ctrlKey || e.metaKey) &&
            (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' ||
                e.code === 'Equal' || e.code === 'Minus' || e.code === 'NumpadAdd' ||
                e.code === 'NumpadSubtract' || e.keyCode === 187 || e.keyCode === 189 ||
                e.keyCode === 48)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Also prevent Ctrl + mouse wheel
        if ((e.ctrlKey || e.metaKey) &&
            (e.key === 'ZoomIn' || e.key === 'ZoomOut')) {
            e.preventDefault();
            return false;
        }
    }, { passive: false });

    // Prevent mouse wheel zoom (Ctrl + mouse wheel)
    document.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { passive: false });

    // Prevent touch zoom (pinch zoom)
    document.addEventListener('touchstart', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    // Prevent double-tap zoom on mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
            e.stopPropagation();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Prevent browser zoom via viewport meta tag manipulation
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
        // Set maximum-scale and user-scalable to prevent zoom
        metaViewport.setAttribute('content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
    } else {
        // Create meta viewport tag if it doesn't exist
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
        document.head.appendChild(meta);
    }

    // CSS to disable text size adjustment
    const style = document.createElement('style');
    style.textContent = `
        html {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            touch-action: manipulation;
        }
        
        body {
            zoom: reset !important;
        }
        
        * {
            max-height: 1000000px; /* Workaround for some browsers */
        }
        
        /* Prevent iOS double-tap zoom */
        a, button, input, label, select, textarea {
            touch-action: manipulation;
        }
    `;
    document.head.appendChild(style);

    // Disable browser's zoom menu (context menu)
    document.addEventListener('contextmenu', function (e) {
        // You might want to be more specific here
        // e.preventDefault();
    });

    // Listen for zoom events and reset if detected
    let lastZoomLevel = window.devicePixelRatio;
    window.addEventListener('resize', function () {
        const currentZoom = window.devicePixelRatio;
        if (Math.abs(currentZoom - lastZoomLevel) > 0.1) {
            // Zoom detected, try to reset
            document.body.style.zoom = 1 / currentZoom;
            lastZoomLevel = currentZoom;
        }
    });

    console.log('All zoom functions disabled');
}

// Call the function to disable zoom
disableAllZoom();

// Optional: If you want to re-enable zoom (for debugging or specific cases)
function enableAllZoom() {
    // Remove event listeners (this is a simplified version)
    // In a real implementation, you'd need to keep references to the handlers

    // Reset viewport meta tag
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }

    // Remove the CSS style
    const zoomStyles = document.querySelectorAll('style');
    zoomStyles.forEach(style => {
        if (style.textContent.includes('text-size-adjust') ||
            style.textContent.includes('touch-action')) {
            style.remove();
        }
    });

    console.log('Zoom functions re-enabled');
}
