const PRODUCT_ORDER = [
    "DOOR LOCK",
    "PROCESSOR",
    "LUMI GLASS SERIES",
    "ESCULT SERIES",
    "TACTILE HEXA SERIES",
    "DUO-QUAD SERIES",
    "DOMOGENIE GLASS LITE SERIES",
    "WALL MOUNT DISPLAY",
    "TREMBLAY SOUNDS",
    "Z-WAVE RELAY",
    "CURTAIN MOTORS",
    "SENSORS",
    "IR BLASTER - ZMOTE",
    "AUTOMATION DISTRIBUTION BOX",
    "NETWORK DISTRIBUTION BOX",
    "TEXT"
];

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
    "DOMOGENIE GLASS LITE SERIES"
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
    if (productKey === 'TEXT') return 'TX';
    if (productKey === 'AUTOMATION DISTRIBUTION BOX') return 'ADB';
    if (productKey === 'NETWORK DISTRIBUTION BOX') return 'NDB';
    if (switchFamilies.has(productKey)) return 'S';
    return 'S';
}

/* ------------------------- LOAD FLOOR PLAN IMAGE ------------------------- */
function loadFloorPlanImage() {
    const previewImage = document.getElementById('previewImage');
    const uploadedFloorPlan = sessionStorage.getItem('uploadedFloorPlan');
    const exportedPlan = sessionStorage.getItem('exportedPlan');

    previewImage.src = '';
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
        previewImage.style.visibility = 'visible';
        void previewImage.offsetWidth;
        
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

const wires = [];
let isWireMode = false;
let currentWireType = null;
let currentWireMode = 'curve';
let wireStartMark = null;
let wireEndMark = null;
let selectedWire = null;
let wirePoints = [];

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
];

/* ------------------------- MARKS & DRAGGING ------------------------- */
const marksListEl = document.getElementById('marksList');
const addMarkBtn = document.getElementById('addMarkBtn');
const markShapeEl = document.getElementById('markShape');
const markSizeEl = document.getElementById('markSizeText');

let markCounter = 0;
let multiComponentGroups = {};

previewImage.addEventListener('load', updateImageDimensions);
window.addEventListener('resize', updateImageDimensions);

function getImageTransform() {
    const img = previewImage;
    const containerRect = imgContainer.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    let naturalWidth = img.naturalWidth || imgRect.width;
    let naturalHeight = img.naturalHeight || imgRect.height;

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

    if (imgAspect > containerAspect) {
        displayWidth = containerRect.width;
        displayHeight = containerRect.width / imgAspect;
        imgOffsetX = 0;
        imgOffsetY = (containerRect.height - displayHeight) / 2;
    } else {
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

function updateImageDimensions() {
    const transform = getImageTransform();
    if (transform) {
        updateAllMarks();
        updateAllWires();
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
    const size = mark.size * transform.scaleX;

    mark.el.style.left = x + 'px';
    mark.el.style.top = y + 'px';
    mark.el.style.width = size + 'px';
    mark.el.style.height = size + 'px';
    orientTooltip(mark);
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

/* ------------------------- WIRE SELECTION FOR ALL MARKS ------------------------- */
function selectMarkForWire(markData) {
    if (!currentWireType) return;

    if (!wireStartMark) {
        wireStartMark = markData;
        showNotification(`First mark selected: ${markData.seriesLabel}. Now select second mark.`, 'info');
    } else if (!wireEndMark && wireStartMark.id !== markData.id) {
        wireEndMark = markData;
        const wireTypeInfo = getWireTypeInfo(currentWireType);
        showNotification(`Second mark selected: ${markData.seriesLabel}. ${currentWireMode === 'curve' ? 'Adjust curve' : 'Add points'} and click "Create ${wireTypeInfo.title}".`, 'info');
    } else if (wireStartMark.id === markData.id) {
        wireStartMark = null;
        wireEndMark = null;
        wirePoints = [];
        showNotification('First mark selection cleared.', 'info');
    } else if (wireEndMark && wireEndMark.id === markData.id) {
        wireEndMark = null;
        wirePoints = [];
        showNotification('Second mark selection cleared.', 'info');
    }
    
    updateWireSelectionLabels();
    updatePointsList();
}

/* ------------------------- CREATE MARKS (UNIFIED) ------------------------- */
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
    const needsModel = data.subProducts && currentProduct !== 'Z-WAVE RELAY' && !data.isDBBox && !data.isNetworkDBBox;
    if (needsModel && !currentSubProduct) {
        alert('Select a model before adding a label');
        return;
    }

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
    const fallbackProduct = productData[currentProduct] || {};
    const fallbackImg = productDataForMark?.img || fallbackProduct.img || previewImage.src;
    const categoryName = currentProduct || '';

    let modelName = '';
    let featuresList = [];
    let descText = '';
    let brand = '';
    let sizeFt = '';
    let selectedRelays = [];
    let routerBrand = '';
    let routerModel = '';
    let routerQty = 1;
    let apBrand = '';
    let apModel = '';
    let apQty = 1;

    if (data.isDBBox) {
        brand = productData[currentProduct].brand || '';
        sizeFt = productData[currentProduct].size || '';
        modelName = brand ? `${brand} - ${sizeFt} ft` : 'DB Box';
        descText = `${categoryName}: ${brand} ${sizeFt} ft`;
        featuresList = [];
        selectedRelays = productData[currentProduct].selectedRelays || [];
    } else if (data.isNetworkDBBox) {
        brand = productData[currentProduct].brand || '';
        sizeFt = productData[currentProduct].size || '';
        modelName = brand ? `${brand} - ${sizeFt} ft` : 'Network DB Box';
        descText = `${categoryName}: ${brand} ${sizeFt} ft`;
        featuresList = [];
        currentSubProduct = null;
        routerBrand = productData[currentProduct].routerBrand || '';
        routerModel = productData[currentProduct].routerModel || '';
        routerQty = productData[currentProduct].routerQty || 1;
        apBrand = productData[currentProduct].apBrand || '';
        apModel = productData[currentProduct].apModel || '';
        apQty = productData[currentProduct].apQty || 1;
    } else if (currentProduct === 'Z-WAVE RELAY') {
        modelName = relayItems.length === 1 ? relayItems[0].name : `${relayItems.length} modules selected`;
        featuresList = relayItems.map(item => `${item.name} — Qty ${item.quantity}`);
        descText = productDataForMark?.desc || fallbackProduct.desc || '';
    } else {
        modelName = productDataForMark?.title || fallbackProduct.title || '';
        featuresList = (productDataForMark?.features || fallbackProduct.features || []).slice();
        descText = productDataForMark?.desc || fallbackProduct.desc || '';
    }

    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.size = size;
    el.dataset.shape = shape;

    const badge = document.createElement('div');
    badge.className = 'label-badge';
    badge.textContent = label;
    el.appendChild(badge);

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
        imageSrc: fallbackImg,
        relayItems,
        brand: brand,
        sizeFt: sizeFt,
        isDBBox: data.isDBBox || false,
        isNetworkDBBox: data.isNetworkDBBox || false,
        selectedRelays: selectedRelays,
        routerBrand: routerBrand,
        routerModel: routerModel,
        routerQty: routerQty,
        apBrand: apBrand,
        apModel: apModel,
        apQty: apQty
    };

    marks.push(markData);

    // ✅ UNIFIED CLICK HANDLER FOR ALL MARKS
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        
        // Handle wire mode selection
        if (isWireMode && currentWireType && !e.defaultPrevented) {
            selectMarkForWire(markData);
            e.preventDefault();
        } 
        // Handle regular selection (not dragging)
        else if (!isWireMode && !e.defaultPrevented && !dragStarted) {
            selectedMarkId = id;
            updateMarkSelection();
            if (!markData.isTextLabel) {
                openProductModal(markData);
            }
        }
    });

    // Setup dragging
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
            dragStarted = false;
            try {
                el.releasePointerCapture(ev.pointerId);
            } catch (e) { }
            el.classList.remove('selected');
        }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('mouseenter', () => orientTooltip(markData));
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    updateMarkPosition(markData);
    updateMarkSelection();
}

/* ------------------------- MULTI-COMPONENT MARKS ------------------------- */
function createMultiComponentMark(options) {
    const {
        x, y, size, shape, productKey, subProductKey, component,
        componentIndex, label, groupId, totalComponents
    } = options;
    
    const id = 'mark-' + (++markCounter);
    const subData = productData[productKey].subProducts[subProductKey];
    
    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.groupId = groupId;
    el.dataset.size = size;
    el.dataset.shape = shape;
    
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
        totalComponents: totalComponents
    };
    
    marks.push(markData);
    
    // ✅ UNIFIED CLICK HANDLER (SAME AS REGULAR MARKS)
    el.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (isWireMode && currentWireType && !e.defaultPrevented) {
            selectMarkForWire(markData);
            e.preventDefault();
        } else if (!isWireMode && !e.defaultPrevented && !dragStarted) {
            selectedMarkId = id;
            updateMarkSelection();
            openProductModal(markData);
        }
    });
    
    // Setup dragging (same as regular marks)
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
            dragStarted = false;
            try {
                el.releasePointerCapture(ev.pointerId);
            } catch (e) { }
            el.classList.remove('selected');
        }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('mouseenter', () => orientTooltip(markData));
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    
    updateMarkPosition(markData);
    orientTooltip(markData);
    
    return markData;
}

/* ------------------------- TEXT LABELS ------------------------- */
function addTextLabel(text, shape, sizePixels) {
    if (!text || text.trim() === '') {
        showNotification('Please enter text for the label', 'error');
        return;
    }
    
    if (!imageNaturalWidth || !imageNaturalHeight) {
        showNotification('Please wait for floor plan to load', 'error');
        return;
    }
    
    const centerX = imageNaturalWidth / 2;
    const centerY = imageNaturalHeight / 2;
    const id = 'mark-' + (++markCounter);
    const { seriesCode, label } = nextSeriesLabel('TEXT');
    
    const el = document.createElement('div');
    el.className = 'mark ' + shape;
    el.dataset.id = id;
    el.dataset.size = sizePixels;
    el.dataset.shape = shape;
    el.dataset.isTextLabel = true;
    
    const badge = document.createElement('div');
    badge.className = 'label-badge';
    badge.textContent = label;
    el.appendChild(badge);
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';
    const tooltipTitle = document.createElement('div');
    tooltipTitle.className = 'tooltip-title';
    tooltipTitle.textContent = 'Text Label';
    const tooltipModel = document.createElement('div');
    tooltipModel.className = 'tooltip-model';
    tooltipModel.textContent = text;
    
    tooltipContent.appendChild(tooltipTitle);
    tooltipContent.appendChild(tooltipModel);
    tooltip.appendChild(tooltipContent);
    el.appendChild(tooltip);
    imgInner.appendChild(el);
    
    const markData = {
        id,
        x: centerX - (sizePixels / 2),
        y: centerY - (sizePixels / 2),
        size: sizePixels,
        shape,
        el,
        seriesCode,
        seriesLabel: label,
        tooltip,
        categoryName: 'Text Label',
        modelName: text,
        desc: `Text Label: ${text}`,
        features: ['Custom text annotation'],
        imageSrc: previewImage.src,
        isTextLabel: true,
        text: text
    };
    
    marks.push(markData);
    
    // ✅ UNIFIED CLICK HANDLER (SAME AS OTHER MARKS)
    el.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (isWireMode && currentWireType && !e.defaultPrevented) {
            selectMarkForWire(markData);
            e.preventDefault();
        } else if (!isWireMode && !e.defaultPrevented && !dragStarted) {
            selectedMarkId = id;
            updateMarkSelection();
            // Don't open modal for text labels
        }
    });
    
    // Setup dragging (same as regular marks)
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
            dragStarted = false;
            try {
                el.releasePointerCapture(ev.pointerId);
            } catch (e) { }
            el.classList.remove('selected');
        }
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('mouseenter', () => orientTooltip(markData));
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    
    updateMarkPosition(markData);
    updateMarkSelection();
    renderMarksList();
    
    showNotification(`Text label "${text}" added as ${label}`, 'success');
    return markData;
}

/* ------------------------- ADD MARK BUTTON ------------------------- */
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
    
    // Handle other products
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

/* ------------------------- MARKS LIST MANAGEMENT ------------------------- */
function updateMarkSelection() {
    marks.forEach(m => {
        m.el.classList.toggle('selected', m.id === selectedMarkId);
    });
    renderMarksList();
}

function removeMark(id) {
    const idx = marks.findIndex(x => x.id === id);
    if (idx === -1) return;
    const m = marks[idx];

    // Remove connected wires
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

    // Remove from multi-component group if applicable
    if (m.groupId && multiComponentGroups[m.groupId]) {
        const group = multiComponentGroups[m.groupId];
        const markIndex = group.marks.indexOf(m.id);
        if (markIndex > -1) {
            group.marks.splice(markIndex, 1);
        }
        if (group.marks.length === 0) {
            delete multiComponentGroups[m.groupId];
        }
    }

    // Remove mark element
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
                    marks: [m],
                    label: m.seriesLabel
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
        
        // Component list
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

        const label = document.createElement('span');
        label.textContent = m.seriesLabel + (m.isTextLabel ? ` - ${m.text}` : '');
        item.appendChild(label);

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
                if (!m.isTextLabel) {
                    openProductModal(m);
                }
            }
        });
        marksListEl.appendChild(item);
    });
}

/* ------------------------- WIRE FUNCTIONS ------------------------- */
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
    const point = { id: `point-${Date.now()}`, x: newX, y: newY, element: null };
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
    return { svg, path, startCircle, endCircle, startX, startY, endX, endY };
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
    return { svg, path, startCircle, endCircle, startX, startY, endX, endY, curveValue };
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
            if (wire.element && wire.element.svg && wire.element.svg.parentNode) {
                if (wire.element.svg) {
                    wire.element.svg.remove();
                }
                const tempWireType = currentWireType;
                currentWireType = wire.wireType;
                let newElement;
                if (wire.mode === 'curve') {
                    newElement = createWireElement(wire.startMark, wire.endMark, wire.curveValue, false);
                } else {
                    newElement = createWireElementWithPoints(wire.startMark, wire.endMark, wire.points, false);
                }
                currentWireType = tempWireType;
                if (newElement) {
                    wire.element = newElement;
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

function attachWireControlsEvents() {
    const curveBtn = document.getElementById('curveModeBtn');
    const pointsBtn = document.getElementById('pointsModeBtn');
    const addPointBtn = document.getElementById('addPointBtn');
    const createWireBtn = document.getElementById('createWireBtn');
    const cancelWireBtn = document.getElementById('cancelWireBtn');
    const clearWireSelectionBtn = document.getElementById('clearWireSelectionBtn');
    if (curveBtn) curveBtn.addEventListener('click', () => setWireMode('curve'));
    if (pointsBtn) pointsBtn.addEventListener('click', () => setWireMode('points'));
    if (addPointBtn) addPointBtn.addEventListener('click', addControlPoint);
    if (createWireBtn) createWireBtn.addEventListener('click', createWire);
    if (cancelWireBtn) cancelWireBtn.addEventListener('click', cancelWire);
    if (clearWireSelectionBtn) clearWireSelectionBtn.addEventListener('click', clearWireSelection);
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

/* ------------------------- UI INITIALIZATION ------------------------- */
function buildList() {
    productListEl.innerHTML = '';
    // Add wire types
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
                document.querySelectorAll('.tab-btn[data-name^="KNX_WIRE"], .tab-btn[data-name^="PHASE_WIRE"], .tab-btn[data-name^="NEUTRAL_WIRE"], .tab-btn[data-name^="CAT6_WIRE"], .tab-btn[data-name^="IR_WIRE"], .tab-btn[data-name^="SPEAKER_WIRE"]').forEach(btn => {
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
    document.querySelectorAll('.tab-btn[data-name^="KNX_WIRE"], .tab-btn[data-name^="PHASE_WIRE"], .tab-btn[data-name^="NEUTRAL_WIRE"], .tab-btn[data-name^="CAT6_WIRE"], .tab-btn[data-name^="IR_WIRE"]').forEach(btn => {
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
        const textInstruction = document.querySelector('.text-instruction');
        if (textInstruction) {
            textInstruction.remove();
        }
        const textControls = document.getElementById('textLabelControls');
        if (textControls) {
            textControls.remove();
        }
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
    } else {
        productImage.style.display = 'none';
    }
    pMeta.innerHTML = '';
    if (subProductKey && !isDBBox && !isNetworkDBBox && !isTextLabel) {
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
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
    } else if (isDBBox) {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';
        createAutomationDBBoxControls();
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
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
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        pFeatures.innerHTML = '';
        if (features.length > 0) {
            features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                pFeatures.appendChild(li);
            });
        }
    } else if (isTextLabel) {
        pTitle.textContent = "Text Label";
        pDesc.textContent = "Add custom text annotations to the floor plan";
        productImage.style.display = 'none';
        productImageOverlay.style.display = 'none';
        featuresSection.style.display = 'none';
        relayControlsEl.style.display = 'none';
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
        pFeatures.innerHTML = '';
        const featureLi = document.createElement('li');
        featureLi.textContent = 'Custom text annotations';
        pFeatures.appendChild(featureLi);
        const featureLi2 = document.createElement('li');
        featureLi2.textContent = 'Serial numbering: TX1, TX2, TX3...';
        pFeatures.appendChild(featureLi2);
        const featureLi3 = document.createElement('li');
        featureLi3.textContent = 'Same styling as product labels';
        pFeatures.appendChild(featureLi3);
        pMeta.innerHTML = '';
        createTextLabelControls();
    } else if (isMultiComponent && subProductKey) {
        relayControlsEl.style.display = 'none';
        featuresSection.style.display = 'none';
        productImageOverlay.style.display = 'none';
        productImageOverlay.textContent = '';
        resetRelayPreview();
        lastRelaySelectionLabel = '';
        createMultiComponentControls(productKey, subProductKey);
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBBoxControls').style.display = 'none');
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
        document.getElementById('multiComponentControls') && (document.getElementById('multiComponentControls').style.display = 'none');
        document.getElementById('textLabelControls') && (document.getElementById('textLabelControls').style.display = 'none');
        document.getElementById('automationDBControls') && (document.getElementById('automationDBControls').style.display = 'none');
        document.getElementById('networkDBControls') && (document.getElementById('networkDBControls').style.display = 'none');
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
