// Main application state
const appState = {
    walls: [],
    furniture: [],
    selectedItem: null,
    selectedType: null, // 'wall', 'furniture', or null
    currentTool: 'select',
    isDrawingWall: false,
    tempWall: null,
    viewTransform: {
        x: 0,
        y: 0,
        scale: 1
    },
    history: [],
    historyIndex: -1,
    SNAP_THRESHOLD: 10,
    ANGLE_SNAP_TOLERANCE: 3,
    joints: {}, // Joint system for connected walls
    isMeasuring: false,
    measurementPoints: [],
    gridSnap: true,
    wallThickness: 5,
    isRotating: false,
    isResizing: false,
    resizeHandle: null,
    nextJointId: 1,
    lastPlacedFurnitureType: null,
    selectedFurnitureType: null
};

// Furniture images configuration
const furnitureImages = {
    door: 'images/furniture/2.png',
    window: 'images/furniture/1.png',
    sofa: 'images/furniture/3.png',
    table: 'images/furniture/4.png',
    bed: 'images/furniture/5.png',
    tv: 'images/furniture/6.png'
};

// Preloaded images
const loadedImages = {};

// DOM elements
const canvas = document.getElementById('floor-plan-canvas');
const ctx = canvas.getContext('2d');
const cursorPosition = document.getElementById('cursor-position');
const operationStatus = document.getElementById('operation-status');
const zoomLevel = document.getElementById('zoom-level');
const toolbox = document.getElementById('toolbox');
const propertiesPanel = document.getElementById('properties-panel');
const toggleToolbox = document.getElementById('toggle-toolbox');
const toggleProperties = document.getElementById('toggle-properties');
const gridSnapCheckbox = document.getElementById('grid-snap');
const wallThicknessSelect = document.getElementById('wall-thickness');

// Tool buttons
const selectTool = document.getElementById('select-tool');
const wallTool = document.getElementById('wall-tool');
const panTool = document.getElementById('pan-tool');
const measureTool = document.getElementById('measure-tool');

// Properties panels
const noSelectionPanel = document.getElementById('no-selection');
const wallPropertiesPanel = document.getElementById('wall-properties');
const furniturePropertiesPanel = document.getElementById('furniture-properties');

// Property inputs
const wallX1 = document.getElementById('wall-x1');
const wallY1 = document.getElementById('wall-y1');
const wallX2 = document.getElementById('wall-x2');
const wallY2 = document.getElementById('wall-y2');
const wallLength = document.getElementById('wall-length');
const wallAngle = document.getElementById('wall-angle');
const furnitureType = document.getElementById('furniture-type');
const furnitureX = document.getElementById('furniture-x');
const furnitureY = document.getElementById('furniture-y');
const furnitureWidth = document.getElementById('furniture-width');
const furnitureHeight = document.getElementById('furniture-height');
const furnitureRotation = document.getElementById('furniture-rotation');
const rotationValue = document.getElementById('rotation-value');
const rotate90Btn = document.getElementById('rotate-90-btn');

// Size scale slider
const furnitureScale = document.getElementById('furniture-scale');
const scaleValue = document.getElementById('scale-value');

// Delete buttons
const deleteWallBtn = document.getElementById('delete-wall');
const deleteFurnitureBtn = document.getElementById('delete-furniture');

// Control buttons
const newPlanBtn = document.getElementById('new-plan');
const savePlanBtn = document.getElementById('save-plan');
const loadPlanBtn = document.getElementById('load-plan');
const downloadJsonBtn = document.getElementById('download-json');
const exportPngBtn = document.getElementById('export-png');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const resetViewBtn = document.getElementById('reset-view');
const exportToConfiguratorBtn = document.getElementById('export-to-configurator');

// Furniture items
const furnitureItems = document.querySelectorAll('.furniture-item');

// Load furniture images
function loadFurnitureImages() {
    for (const [type, src] of Object.entries(furnitureImages)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            console.log(`Loaded image: ${type}`);
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
        };
        loadedImages[type] = img;
    }
}

// Initialize canvas
function initCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load furniture images
    loadFurnitureImages();
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // Add keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Add tool button events
    selectTool.addEventListener('click', () => setTool('select'));
    wallTool.addEventListener('click', () => setTool('wall'));
    panTool.addEventListener('click', () => setTool('pan'));
    measureTool.addEventListener('click', () => setTool('measure'));
    
    // Add furniture item events
    furnitureItems.forEach(item => {
        item.addEventListener('click', () => {
            setTool('furniture');
            appState.selectedFurnitureType = item.getAttribute('data-type');
            operationStatus.textContent = `Placing ${appState.selectedFurnitureType}. Click to place.`;
        });
    });
    
    // Add control button events
    newPlanBtn.addEventListener('click', newPlan);
    savePlanBtn.addEventListener('click', savePlan);
    loadPlanBtn.addEventListener('click', loadPlan);
    downloadJsonBtn.addEventListener('click', downloadJson);
    exportPngBtn.addEventListener('click', exportPng);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    resetViewBtn.addEventListener('click', resetView);
    exportToConfiguratorBtn.addEventListener('click', exportToConfigurator);
    
    // Add property input events
    wallX1.addEventListener('change', updateWallProperties);
    wallY1.addEventListener('change', updateWallProperties);
    wallX2.addEventListener('change', updateWallProperties);
    wallY2.addEventListener('change', updateWallProperties);
    furnitureX.addEventListener('change', updateFurnitureProperties);
    furnitureY.addEventListener('change', updateFurnitureProperties);
    furnitureWidth.addEventListener('change', updateFurnitureProperties);
    furnitureHeight.addEventListener('change', updateFurnitureProperties);
    furnitureRotation.addEventListener('input', updateFurnitureRotation);
    
    // Add scale slider event
    furnitureScale.addEventListener('input', updateFurnitureScale);
    
    // Add rotation button event
    rotate90Btn.addEventListener('click', rotateFurniture90);
    
    // Add delete button events
    deleteWallBtn.addEventListener('click', deleteSelectedWall);
    deleteFurnitureBtn.addEventListener('click', deleteSelectedFurniture);
    
    // Add settings events
    gridSnapCheckbox.addEventListener('change', (e) => {
        appState.gridSnap = e.target.checked;
    });
    
    wallThicknessSelect.addEventListener('change', (e) => {
        appState.wallThickness = parseInt(e.target.value);
    });
    
    // Add panel toggle events
    toggleToolbox.addEventListener('click', () => {
        toolbox.classList.toggle('collapsed');
    });
    
    toggleProperties.addEventListener('click', () => {
        propertiesPanel.classList.toggle('collapsed');
    });
    
    // Load saved plan if exists
    loadPlan();
    
    // Initialize history with empty state
    saveToHistory();
    
    // Start animation loop
    requestAnimationFrame(render);
}

// Update furniture scale
function updateFurnitureScale() {
    if (!appState.selectedItem || appState.selectedType !== 'furniture') return;
    
    const furniture = appState.selectedItem;
    const scale = parseInt(furnitureScale.value) / 100;
    
    // Store original size if not already stored
    if (!furniture.originalSize) {
        furniture.originalSize = {
            width: furniture.width,
            height: furniture.height
        };
    }
    
    // Calculate new size based on original size and scale
    furniture.width = furniture.originalSize.width * scale;
    furniture.height = furniture.originalSize.height * scale;
    
    scaleValue.textContent = `${furnitureScale.value}%`;
    furnitureWidth.value = Math.round(furniture.width);
    furnitureHeight.value = Math.round(furniture.height);
    
    saveToHistory();
}

// Rotate furniture by 90 degrees
function rotateFurniture90() {
    if (appState.selectedType === 'furniture' && appState.selectedItem) {
        const furniture = appState.selectedItem;
        furniture.rotation = (furniture.rotation + 90) % 360;
        updateFurniturePropertiesPanel();
        saveToHistory();
        operationStatus.textContent = `Rotated ${furniture.type} to ${furniture.rotation}°`;
    }
}

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Set current tool
function setTool(tool) {
    appState.currentTool = tool;
    appState.isMeasuring = tool === 'measure';
    
    // If switching from wall drawing mode, clear temporary wall
    if (tool !== 'wall') {
        appState.isDrawingWall = false;
        appState.tempWall = null;
    }
    
    if (tool === 'measure') {
        appState.measurementPoints = [];
    }
    
    // Update active button
    selectTool.classList.remove('active');
    wallTool.classList.remove('active');
    panTool.classList.remove('active');
    measureTool.classList.remove('active');
    
    if (tool === 'select') {
        selectTool.classList.add('active');
        appState.selectedFurnitureType = null;
    }
    if (tool === 'wall') wallTool.classList.add('active');
    if (tool === 'pan') panTool.classList.add('active');
    if (tool === 'measure') measureTool.classList.add('active');
    
    // Reset selection when switching tools
    if (tool !== 'select') {
        appState.selectedItem = null;
        appState.selectedType = null;
        updatePropertiesPanel();
    }
    
    operationStatus.textContent = `Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`;
}

// Convert screen coordinates to world coordinates
function screenToWorld(x, y) {
    return {
        x: (x - appState.viewTransform.x) / appState.viewTransform.scale,
        y: (y - appState.viewTransform.y) / appState.viewTransform.scale
    };
}

// Convert world coordinates to screen coordinates
function worldToScreen(x, y) {
    return {
        x: x * appState.viewTransform.scale + appState.viewTransform.x,
        y: y * appState.viewTransform.scale + appState.viewTransform.y
    };
}

// Apply grid snapping if enabled
function applyGridSnap(x, y) {
    if (!appState.gridSnap) return { x, y };
    
    const gridSize = 20;
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
}

// Mouse event handlers
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let isPanning = false;
let spacePressed = false;
let selectedEndpoint = null;
let isDraggingWallMiddle = false;

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let worldPos = screenToWorld(x, y);
    worldPos = applyGridSnap(worldPos.x, worldPos.y);
    
    if (appState.currentTool === 'wall') {
        if (!appState.isDrawingWall) {
            // Start drawing a new wall
            appState.isDrawingWall = true;
            appState.tempWall = {
                x1: worldPos.x,
                y1: worldPos.y,
                x2: worldPos.x,
                y2: worldPos.y,
                jointId1: createJoint(worldPos.x, worldPos.y),
                jointId2: null
            };
            operationStatus.textContent = 'Drawing wall: Click to set end point';
        } else {
            // Finish drawing the wall
            appState.isDrawingWall = false;
            
            // Apply snapping to endpoints
            const snappedEnd = snapToPoint(worldPos.x, worldPos.y);
            appState.tempWall.x2 = snappedEnd.x;
            appState.tempWall.y2 = snappedEnd.y;
            appState.tempWall.jointId2 = createJoint(snappedEnd.x, snappedEnd.y);
            
            // Add the wall to the collection
            addWall(
                appState.tempWall.x1, 
                appState.tempWall.y1, 
                appState.tempWall.x2, 
                appState.tempWall.y2,
                appState.tempWall.jointId1,
                appState.tempWall.jointId2
            );
            
            appState.tempWall = null;
            operationStatus.textContent = 'Wall added. Click to start new wall.';
        }
    } else if (appState.currentTool === 'furniture' && appState.selectedFurnitureType) {
        // Place furniture
        const snappedPos = snapFurnitureToWall(worldPos.x, worldPos.y, appState.selectedFurnitureType);
        addFurniture(
            appState.selectedFurnitureType,
            snappedPos.x,
            snappedPos.y,
            getDefaultFurnitureSize(appState.selectedFurnitureType).width,
            getDefaultFurnitureSize(appState.selectedFurnitureType).height
        );
        operationStatus.textContent = `${appState.selectedFurnitureType} placed. Switching to select tool.`;
        
        // Automatically switch back to select tool after placing one furniture
        setTimeout(() => {
            setTool('select');
            appState.lastPlacedFurnitureType = appState.selectedFurnitureType;
            appState.selectedFurnitureType = null;
        }, 100);
    } else if (appState.currentTool === 'select') {
        // Check if clicking on a wall or furniture
        const clickedWall = getWallAtPoint(worldPos.x, worldPos.y);
        const clickedFurniture = getFurnitureAtPoint(worldPos.x, worldPos.y);
        
        // Check if clicking on a wall endpoint
        selectedEndpoint = getWallEndpointAtPoint(worldPos.x, worldPos.y);
        
        // Check if clicking on the middle of a wall (not on endpoints)
        if (clickedWall && !selectedEndpoint) {
            // Dragging the entire wall from the middle
            selectItem('wall', clickedWall);
            isDragging = true;
            isDraggingWallMiddle = true;
            dragStart = { x: worldPos.x, y: worldPos.y };
            operationStatus.textContent = 'Selected wall: Drag from middle to move entire wall';
        } else if (selectedEndpoint) {
            // Dragging a specific endpoint
            selectItem('wall', selectedEndpoint.wall);
            isDragging = true;
            isDraggingWallMiddle = false;
            dragStart = { x: worldPos.x, y: worldPos.y };
            operationStatus.textContent = 'Dragging wall endpoint';
        } else if (clickedWall) {
            selectItem('wall', clickedWall);
            isDragging = true;
            dragStart = { x: worldPos.x, y: worldPos.y };
            operationStatus.textContent = 'Selected wall: Drag to move';
        } else if (clickedFurniture) {
            // Check if clicking on rotation handle
            const rotationHandle = getRotationHandleAtPoint(worldPos.x, worldPos.y, clickedFurniture);
            const resizeHandle = getResizeHandleAtPoint(worldPos.x, worldPos.y, clickedFurniture);
            
            if (rotationHandle) {
                // Start rotating
                appState.isRotating = true;
                selectItem('furniture', clickedFurniture);
                dragStart = { x: worldPos.x, y: worldPos.y };
                operationStatus.textContent = 'Rotating furniture';
            } else if (resizeHandle) {
                // Start resizing
                appState.isResizing = true;
                appState.resizeHandle = resizeHandle;
                selectItem('furniture', clickedFurniture);
                dragStart = { x: worldPos.x, y: worldPos.y };
                operationStatus.textContent = 'Resizing furniture';
            } else {
                selectItem('furniture', clickedFurniture);
                isDragging = true;
                dragStart = { x: worldPos.x, y: worldPos.y };
                operationStatus.textContent = 'Selected furniture: Drag to move';
            }
        } else {
            // Clicked on empty space, deselect
            appState.selectedItem = null;
            appState.selectedType = null;
            updatePropertiesPanel();
            operationStatus.textContent = 'Nothing selected';
        }
    } else if (appState.currentTool === 'measure') {
        // Add measurement point
        if (appState.measurementPoints.length < 2) {
            appState.measurementPoints.push({ x: worldPos.x, y: worldPos.y });
            operationStatus.textContent = `Measurement point ${appState.measurementPoints.length} set`;
            
            if (appState.measurementPoints.length === 2) {
                const p1 = appState.measurementPoints[0];
                const p2 = appState.measurementPoints[1];
                const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
                operationStatus.textContent = `Distance: ${Math.round(distance)} px`;
            }
        } else {
            // Reset measurement
            appState.measurementPoints = [{ x: worldPos.x, y: worldPos.y }];
            operationStatus.textContent = 'Measurement point 1 set';
        }
    } else if (appState.currentTool === 'pan' || (appState.currentTool === 'select' && spacePressed)) {
        // Start panning
        isPanning = true;
        dragStart = { x: x, y: y };
        operationStatus.textContent = 'Panning: Drag to move view';
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let worldPos = screenToWorld(x, y);
    worldPos = applyGridSnap(worldPos.x, worldPos.y);
    
    // Update cursor position display
    cursorPosition.textContent = `Cursor: (${Math.round(worldPos.x)}, ${Math.round(worldPos.y)})`;
    
    if (appState.isDrawingWall && appState.tempWall) {
        // Update temporary wall while drawing
        const snappedEnd = snapToPoint(worldPos.x, worldPos.y);
        appState.tempWall.x2 = snappedEnd.x;
        appState.tempWall.y2 = snappedEnd.y;
        
        // Apply angle snapping and length snapping
        applyAngleSnapping(appState.tempWall);
        applyLengthSnapping(appState.tempWall);
    } else if (isDragging && appState.selectedItem) {
        if (appState.selectedType === 'wall') {
            const wall = appState.selectedItem;
            const dx = worldPos.x - dragStart.x;
            const dy = worldPos.y - dragStart.y;
            
            if (selectedEndpoint && !isDraggingWallMiddle) {
                // Dragging a specific endpoint
                const snappedPoint = snapToPoint(worldPos.x, worldPos.y);
                
                if (selectedEndpoint.endpoint === 'start') {
                    // Update start joint position
                    updateJointPosition(wall.jointId1, snappedPoint.x, snappedPoint.y);
                    // Update wall coordinates from joint
                    wall.x1 = appState.joints[wall.jointId1].x;
                    wall.y1 = appState.joints[wall.jointId1].y;
                } else {
                    // Update end joint position
                    updateJointPosition(wall.jointId2, snappedPoint.x, snappedPoint.y);
                    // Update wall coordinates from joint
                    wall.x2 = appState.joints[wall.jointId2].x;
                    wall.y2 = appState.joints[wall.jointId2].y;
                }
                
                // Apply angle snapping
                applyAngleSnapping(wall);
                applyLengthSnapping(wall);
            } else {
                // Dragging the entire wall
                const snappedStart = snapToPoint(wall.x1 + dx, wall.y1 + dy);
                const snappedEnd = snapToPoint(wall.x2 + dx, wall.y2 + dy);
                
                updateJointPosition(wall.jointId1, snappedStart.x, snappedStart.y);
                updateJointPosition(wall.jointId2, snappedEnd.x, snappedEnd.y);
            }
            
            // Update properties panel
            updateWallPropertiesPanel();
        } else if (appState.selectedType === 'furniture') {
            // Drag furniture
            const furniture = appState.selectedItem;
            
            if (appState.isRotating) {
                // Rotate furniture based on mouse position
                const centerX = furniture.x;
                const centerY = furniture.y;
                const angle = Math.atan2(worldPos.y - centerY, worldPos.x - centerX) * 180 / Math.PI;
                furniture.rotation = (angle + 90) % 360;
                
                // Update properties panel
                updateFurniturePropertiesPanel();
            } else if (appState.isResizing) {
                // Resize furniture based on handle position
                const handle = appState.resizeHandle;
                const dx = worldPos.x - dragStart.x;
                const dy = worldPos.y - dragStart.y;
                
                if (handle.includes('left')) {
                    furniture.width = Math.max(10, furniture.width - dx);
                    if (handle.includes('left')) furniture.x += dx / 2;
                }
                if (handle.includes('right')) {
                    furniture.width = Math.max(10, furniture.width + dx);
                    if (handle.includes('right')) furniture.x += dx / 2;
                }
                if (handle.includes('top')) {
                    furniture.height = Math.max(10, furniture.height - dy);
                    if (handle.includes('top')) furniture.y += dy / 2;
                }
                if (handle.includes('bottom')) {
                    furniture.height = Math.max(10, furniture.height + dy);
                    if (handle.includes('bottom')) furniture.y += dy / 2;
                }
                
                dragStart = { x: worldPos.x, y: worldPos.y };
                
                // Update properties panel
                updateFurniturePropertiesPanel();
            } else {
                // Move furniture
                const snappedPos = snapFurnitureToWall(worldPos.x, worldPos.y, furniture.type);
                furniture.x = snappedPos.x;
                furniture.y = snappedPos.y;
                
                // Update properties panel
                updateFurniturePropertiesPanel();
            }
        }
        
        dragStart = { x: worldPos.x, y: worldPos.y };
    } else if (isPanning) {
        // Pan the view
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        
        appState.viewTransform.x += dx;
        appState.viewTransform.y += dy;
        
        dragStart = { x: x, y: y };
    }
}

function handleMouseUp() {
    if (isDragging || isPanning || appState.isRotating || appState.isResizing) {
        saveToHistory();
    }
    
    isDragging = false;
    isPanning = false;
    appState.isRotating = false;
    appState.isResizing = false;
    appState.resizeHandle = null;
    selectedEndpoint = null;
    isDraggingWallMiddle = false;
}

function handleWheel(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(zoomFactor, x, y);
}

function handleKeyDown(e) {
    // Prevent Escape key from navigating back
    if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        
        // Cancel current operation
        if (appState.isDrawingWall) {
            appState.isDrawingWall = false;
            appState.tempWall = null;
            operationStatus.textContent = 'Wall drawing cancelled';
        } else if (appState.currentTool === 'furniture') {
            setTool('select');
            operationStatus.textContent = 'Switched to select tool';
        } else if (appState.selectedItem) {
            appState.selectedItem = null;
            appState.selectedType = null;
            updatePropertiesPanel();
            operationStatus.textContent = 'Selection cleared';
        }
        
        return false;
    }
    
    if (e.code === 'Space') {
        spacePressed = true;
        if (appState.currentTool === 'select') {
            canvas.style.cursor = 'grab';
        }
    } else if (e.key === 'Delete' && appState.selectedItem) {
        e.preventDefault();
        if (appState.selectedType === 'wall') {
            deleteSelectedWall();
        } else if (appState.selectedType === 'furniture') {
            deleteSelectedFurniture();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
            redo();
        } else {
            undo();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
}

function handleKeyUp(e) {
    if (e.code === 'Space') {
        spacePressed = false;
        if (appState.currentTool === 'select') {
            canvas.style.cursor = 'default';
        }
    }
}

// Joint system for connected walls
function createJoint(x, y) {
    const jointId = appState.nextJointId++;
    appState.joints[jointId] = { x, y, walls: [] };
    return jointId;
}

function updateJointPosition(jointId, x, y) {
    if (!appState.joints[jointId]) return;
    
    const snapped = snapToPoint(x, y);
    appState.joints[jointId].x = snapped.x;
    appState.joints[jointId].y = snapped.y;
    
    // Update all walls connected to this joint
    appState.joints[jointId].walls.forEach(wall => {
        if (wall.jointId1 === jointId) {
            wall.x1 = snapped.x;
            wall.y1 = snapped.y;
        }
        if (wall.jointId2 === jointId) {
            wall.x2 = snapped.x;
            wall.y2 = snapped.y;
        }
    });
}

function addWallToJoint(wall, jointId) {
    if (!appState.joints[jointId]) return;
    
    appState.joints[jointId].walls.push(wall);
}

function removeWallFromJoint(wall, jointId) {
    if (!appState.joints[jointId]) return;
    
    const index = appState.joints[jointId].walls.indexOf(wall);
    if (index !== -1) {
        appState.joints[jointId].walls.splice(index, 1);
    }
}

// Wall functions
function addWall(x1, y1, x2, y2, jointId1 = null, jointId2 = null) {
    // Create joints if not provided
    if (jointId1 === null) {
        jointId1 = createJoint(x1, y1);
    }
    if (jointId2 === null) {
        jointId2 = createJoint(x2, y2);
    }
    
    const wall = {
        id: Date.now(),
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        jointId1: jointId1,
        jointId2: jointId2
    };
    
    appState.walls.push(wall);
    addWallToJoint(wall, jointId1);
    addWallToJoint(wall, jointId2);
    saveToHistory();
    return wall;
}

function getWallAtPoint(x, y) {
    for (const wall of appState.walls) {
        // Calculate distance from point to line segment
        const dist = pointToLineDistance(x, y, wall.x1, wall.y1, wall.x2, wall.y2);
        if (dist < 5) {
            return wall;
        }
    }
    return null;
}

function getWallEndpointAtPoint(x, y) {
    for (const wall of appState.walls) {
        const dist1 = distance(x, y, wall.x1, wall.y1);
        const dist2 = distance(x, y, wall.x2, wall.y2);
        
        if (dist1 < 8) {
            return { wall, endpoint: 'start' };
        } else if (dist2 < 8) {
            return { wall, endpoint: 'end' };
        }
    }
    return null;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Furniture functions
function addFurniture(type, x, y, width, height) {
    const furniture = {
        id: Date.now(),
        type: type,
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: 0,
        originalSize: { width: width, height: height } // Store original size
    };
    
    appState.furniture.push(furniture);
    saveToHistory();
    return furniture;
}

function getFurnitureAtPoint(x, y) {
    for (const furniture of appState.furniture) {
        // Simple bounding box check (considering rotation)
        const cos = Math.cos(furniture.rotation * Math.PI / 180);
        const sin = Math.sin(furniture.rotation * Math.PI / 180);
        
        const dx = x - furniture.x;
        const dy = y - furniture.y;
        
        const rotatedX = dx * cos + dy * sin;
        const rotatedY = -dx * sin + dy * cos;
        
        if (Math.abs(rotatedX) < furniture.width/2 && Math.abs(rotatedY) < furniture.height/2) {
            return furniture;
        }
    }
    return null;
}

function getRotationHandleAtPoint(x, y, furniture) {
    const cos = Math.cos(furniture.rotation * Math.PI / 180);
    const sin = Math.sin(furniture.rotation * Math.PI / 180);
    
    const dx = x - furniture.x;
    const dy = y - furniture.y;
    
    const rotatedX = dx * cos + dy * sin;
    const rotatedY = -dx * sin + dy * cos;
    
    // Rotation handle is above the furniture
    if (Math.abs(rotatedX) < 5 && Math.abs(rotatedY + furniture.height/2 + 15) < 5) {
        return true;
    }
    
    return false;
}

function getResizeHandleAtPoint(x, y, furniture) {
    const cos = Math.cos(furniture.rotation * Math.PI / 180);
    const sin = Math.sin(furniture.rotation * Math.PI / 180);
    
    const dx = x - furniture.x;
    const dy = y - furniture.y;
    
    const rotatedX = dx * cos + dy * sin;
    const rotatedY = -dx * sin + dy * cos;
    
    const handleSize = 6;
    
    // Check each corner
    if (Math.abs(rotatedX - furniture.width/2) < handleSize && Math.abs(rotatedY - furniture.height/2) < handleSize) {
        return 'right-bottom';
    }
    if (Math.abs(rotatedX - furniture.width/2) < handleSize && Math.abs(rotatedY + furniture.height/2) < handleSize) {
        return 'right-top';
    }
    if (Math.abs(rotatedX + furniture.width/2) < handleSize && Math.abs(rotatedY - furniture.height/2) < handleSize) {
        return 'left-bottom';
    }
    if (Math.abs(rotatedX + furniture.width/2) < handleSize && Math.abs(rotatedY + furniture.height/2) < handleSize) {
        return 'left-top';
    }
    
    return null;
}

function getDefaultFurnitureSize(type) {
    const sizes = {
        door: { width: 80, height: 80 },
        window: { width: 100, height: 100 },
        sofa: { width: 120, height: 120 },
        table: { width: 100, height: 100 },
        bed: { width: 120, height: 120 },
        tv: { width: 80, height: 80 }
    };
    return sizes[type] || { width: 100, height: 100 };
}

// Snapping functions
function snapToPoint(x, y) {
    // Check all wall endpoints for snapping
    let closestPoint = { x: x, y: y };
    let minDistance = appState.SNAP_THRESHOLD;
    
    for (const jointId in appState.joints) {
        const joint = appState.joints[jointId];
        const dist = distance(x, y, joint.x, joint.y);
        
        if (dist < minDistance) {
            minDistance = dist;
            closestPoint = { x: joint.x, y: joint.y };
        }
    }
    
    return closestPoint;
}

function snapFurnitureToWall(x, y, type) {
    // For doors and windows, snap to the nearest wall
    if (type === 'door' || type === 'window') {
        let closestWall = null;
        let minDistance = Infinity;
        let closestPoint = { x, y };
        
        for (const wall of appState.walls) {
            const dist = pointToLineDistance(x, y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (dist < minDistance && dist < 20) {
                minDistance = dist;
                closestWall = wall;
                
                // Calculate the closest point on the wall
                const dx = wall.x2 - wall.x1;
                const dy = wall.y2 - wall.y1;
                const length = Math.sqrt(dx*dx + dy*dy);
                
                let t = ((x - wall.x1) * dx + (y - wall.y1) * dy) / (length * length);
                t = Math.max(0, Math.min(1, t));
                
                closestPoint = {
                    x: wall.x1 + t * dx,
                    y: wall.y1 + t * dy
                };
            }
        }
        
        if (closestWall) {
            return closestPoint;
        }
    }
    
    return { x, y };
}

function applyAngleSnapping(wall) {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    
    // Calculate angle in degrees
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * 180 / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    
    // Check if angle is close to 0, 90, 180, or 270 degrees
    const angles = [0, 90, 180, 270];
    for (const targetAngle of angles) {
        if (Math.abs(angleDeg - targetAngle) < appState.ANGLE_SNAP_TOLERANCE || 
            Math.abs(angleDeg - (targetAngle + 360)) < appState.ANGLE_SNAP_TOLERANCE) {
            
            // Snap to the target angle
            const length = Math.sqrt(dx*dx + dy*dy);
            const snappedAngleRad = targetAngle * Math.PI / 180;
            
            wall.x2 = wall.x1 + Math.cos(snappedAngleRad) * length;
            wall.y2 = wall.y1 + Math.sin(snappedAngleRad) * length;
            break;
        }
    }
}

function applyLengthSnapping(wall) {
    const length = distance(wall.x1, wall.y1, wall.x2, wall.y2);
    const snapLengths = [50, 100, 150, 200, 250, 300];
    let closestLength = length;
    let minDiff = Infinity;
    
    for (const snapLen of snapLengths) {
        const diff = Math.abs(length - snapLen);
        if (diff < minDiff && diff < 10) {
            minDiff = diff;
            closestLength = snapLen;
        }
    }
    
    if (minDiff < 10) {
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const currentLength = Math.sqrt(dx*dx + dy*dy);
        
        if (currentLength > 0) {
            const scale = closestLength / currentLength;
            wall.x2 = wall.x1 + dx * scale;
            wall.y2 = wall.y1 + dy * scale;
        }
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Selection functions
function selectItem(type, item) {
    appState.selectedType = type;
    appState.selectedItem = item;
    updatePropertiesPanel();
}

function updatePropertiesPanel() {
    noSelectionPanel.style.display = 'block';
    wallPropertiesPanel.style.display = 'none';
    furniturePropertiesPanel.style.display = 'none';
    
    if (appState.selectedType === 'wall') {
        noSelectionPanel.style.display = 'none';
        wallPropertiesPanel.style.display = 'block';
        updateWallPropertiesPanel();
    } else if (appState.selectedType === 'furniture') {
        noSelectionPanel.style.display = 'none';
        furniturePropertiesPanel.style.display = 'block';
        updateFurniturePropertiesPanel();
    }
}

function updateWallPropertiesPanel() {
    if (!appState.selectedItem) return;
    
    const wall = appState.selectedItem;
    wallX1.value = Math.round(wall.x1);
    wallY1.value = Math.round(wall.y1);
    wallX2.value = Math.round(wall.x2);
    wallY2.value = Math.round(wall.y2);
    
    const length = distance(wall.x1, wall.y1, wall.x2, wall.y2);
    wallLength.value = `${Math.round(length)} px`;
    
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * 180 / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    
    wallAngle.value = `${Math.round(angleDeg)}°`;
}

function updateFurniturePropertiesPanel() {
    if (!appState.selectedItem) return;
    
    const furniture = appState.selectedItem;
    furnitureType.value = furniture.type;
    furnitureX.value = Math.round(furniture.x);
    furnitureY.value = Math.round(furniture.y);
    furnitureWidth.value = Math.round(furniture.width);
    furnitureHeight.value = Math.round(furniture.height);
    furnitureRotation.value = Math.round(furniture.rotation);
    rotationValue.textContent = `${Math.round(furniture.rotation)}°`;
    
    // Update scale slider
    if (furniture.originalSize) {
        const scale = Math.round((furniture.width / furniture.originalSize.width) * 100);
        furnitureScale.value = scale;
        scaleValue.textContent = `${scale}%`;
    } else {
        furnitureScale.value = 100;
        scaleValue.textContent = '100%';
    }
}

function updateWallProperties() {
    if (!appState.selectedItem) return;
    
    const wall = appState.selectedItem;
    wall.x1 = parseInt(wallX1.value);
    wall.y1 = parseInt(wallY1.value);
    wall.x2 = parseInt(wallX2.value);
    wall.y2 = parseInt(wallY2.value);
    
    // Update joints
    updateJointPosition(wall.jointId1, wall.x1, wall.y1);
    updateJointPosition(wall.jointId2, wall.x2, wall.y2);
    
    saveToHistory();
}

function updateFurnitureProperties() {
    if (!appState.selectedItem) return;
    
    const furniture = appState.selectedItem;
    furniture.x = parseInt(furnitureX.value);
    furniture.y = parseInt(furnitureY.value);
    
    // Update original size if it exists
    if (furniture.originalSize) {
        const oldWidth = furniture.width;
        const oldHeight = furniture.height;
        
        furniture.width = parseInt(furnitureWidth.value);
        furniture.height = parseInt(furnitureHeight.value);
        
        // Calculate new scale
        const widthScale = (furniture.width / furniture.originalSize.width) * 100;
        const heightScale = (furniture.height / furniture.originalSize.height) * 100;
        const avgScale = (widthScale + heightScale) / 2;
        
        furnitureScale.value = Math.round(avgScale);
        scaleValue.textContent = `${Math.round(avgScale)}%`;
    } else {
        furniture.width = parseInt(furnitureWidth.value);
        furniture.height = parseInt(furnitureHeight.value);
    }
    
    saveToHistory();
}

function updateFurnitureRotation() {
    if (!appState.selectedItem) return;
    
    const furniture = appState.selectedItem;
    furniture.rotation = parseInt(furnitureRotation.value);
    rotationValue.textContent = `${furniture.rotation}°`;
    
    saveToHistory();
}

function deleteSelectedWall() {
    if (appState.selectedType === 'wall' && appState.selectedItem) {
        const wall = appState.selectedItem;
        const index = appState.walls.indexOf(wall);
        if (index !== -1) {
            // Remove from joints
            removeWallFromJoint(wall, wall.jointId1);
            removeWallFromJoint(wall, wall.jointId2);
            
            appState.walls.splice(index, 1);
            appState.selectedItem = null;
            appState.selectedType = null;
            updatePropertiesPanel();
            saveToHistory();
        }
    }
}

function deleteSelectedFurniture() {
    if (appState.selectedType === 'furniture' && appState.selectedItem) {
        const index = appState.furniture.indexOf(appState.selectedItem);
        if (index !== -1) {
            appState.furniture.splice(index, 1);
            appState.selectedItem = null;
            appState.selectedType = null;
            updatePropertiesPanel();
            saveToHistory();
        }
    }
}

// Zoom and pan functions
function zoom(factor, centerX = canvas.width / 2, centerY = canvas.height / 2) {
    const worldCenter = screenToWorld(centerX, centerY);
    
    appState.viewTransform.scale *= factor;
    appState.viewTransform.scale = Math.max(0.1, Math.min(5, appState.viewTransform.scale));
    
    const newScreenCenter = worldToScreen(worldCenter.x, worldCenter.y);
    
    appState.viewTransform.x += centerX - newScreenCenter.x;
    appState.viewTransform.y += centerY - newScreenCenter.y;
    
    zoomLevel.textContent = `${Math.round(appState.viewTransform.scale * 100)}%`;
}

function resetView() {
    appState.viewTransform = {
        x: 0,
        y: 0,
        scale: 1
    };
    zoomLevel.textContent = '100%';
}

// Save and load functions
function savePlan() {
    const plan = {
        walls: appState.walls,
        furniture: appState.furniture,
        joints: appState.joints,
        nextJointId: appState.nextJointId,
        version: '2.0'
    };
    
    localStorage.setItem('homePlannerLayout', JSON.stringify(plan));
    operationStatus.textContent = 'Plan saved to browser storage';
}

function loadPlan() {
    const saved = localStorage.getItem('homePlannerLayout');
    if (saved) {
        try {
            const plan = JSON.parse(saved);
            appState.walls = plan.walls || [];
            appState.furniture = plan.furniture || [];
            appState.joints = plan.joints || {};
            appState.nextJointId = plan.nextJointId || 1;
            operationStatus.textContent = 'Plan loaded from browser storage';
        } catch (e) {
            console.error('Error loading plan:', e);
            operationStatus.textContent = 'Error loading saved plan';
        }
    }
}

function downloadJson() {
    const plan = {
        walls: appState.walls,
        furniture: appState.furniture,
        joints: appState.joints,
        nextJointId: appState.nextJointId,
        version: '2.0'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "floor_plan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    operationStatus.textContent = 'Plan downloaded as JSON';
}

function exportPng() {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    // Set export canvas size to match the content
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Find bounds of all objects
    for (const wall of appState.walls) {
        minX = Math.min(minX, wall.x1, wall.x2);
        minY = Math.min(minY, wall.y1, wall.y2);
        maxX = Math.max(maxX, wall.x1, wall.x2);
        maxY = Math.max(maxY, wall.y1, wall.y2);
    }
    
    for (const furniture of appState.furniture) {
        minX = Math.min(minX, furniture.x - furniture.width/2);
        minY = Math.min(minY, furniture.y - furniture.height/2);
        maxX = Math.max(maxX, furniture.x + furniture.width/2);
        maxY = Math.max(maxY, furniture.y + furniture.height/2);
    }
    
    // Add some padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    exportCanvas.width = width;
    exportCanvas.height = height;
    
    // Draw background
    exportCtx.fillStyle = 'white';
    exportCtx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawGridOnCanvas(exportCtx, width, height, minX, minY);
    
    // Draw all objects
    for (const wall of appState.walls) {
        drawWallOnCanvas(exportCtx, wall, minX, minY);
    }
    
    for (const furniture of appState.furniture) {
        drawFurnitureOnCanvas(exportCtx, furniture, minX, minY);
    }
    
    // Create download link
    const dataUrl = exportCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'floor_plan.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    operationStatus.textContent = 'Plan exported as PNG';
}

function drawGridOnCanvas(ctx, width, height, offsetX, offsetY) {
    const gridSize = 20;
    
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawWallOnCanvas(ctx, wall, offsetX, offsetY) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = appState.wallThickness;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(wall.x1 - offsetX, wall.y1 - offsetY);
    ctx.lineTo(wall.x2 - offsetX, wall.y2 - offsetY);
    ctx.stroke();
}

function drawFurnitureOnCanvas(ctx, furniture, offsetX, offsetY) {
    ctx.save();
    ctx.translate(furniture.x - offsetX, furniture.y - offsetY);
    ctx.rotate(furniture.rotation * Math.PI / 180);
    
    const img = loadedImages[furniture.type];
    
    if (img && img.complete) {
        // Calculate aspect ratio and draw image centered in square
        const imgAspectRatio = img.width / img.height;
        const containerAspectRatio = furniture.width / furniture.height;
        
        let renderWidth, renderHeight, offsetXImg, offsetYImg;
        
        if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            renderWidth = furniture.width;
            renderHeight = furniture.width / imgAspectRatio;
            offsetXImg = 0;
            offsetYImg = (furniture.height - renderHeight) / 2;
        } else {
            // Image is taller than container
            renderHeight = furniture.height;
            renderWidth = furniture.height * imgAspectRatio;
            offsetXImg = (furniture.width - renderWidth) / 2;
            offsetYImg = 0;
        }
        
        // Draw image centered in the square
        ctx.drawImage(
            img, 
            -furniture.width/2 + offsetXImg, 
            -furniture.height/2 + offsetYImg, 
            renderWidth, 
            renderHeight
        );
    } else {
        // Fallback to colored rectangle
        const colors = {
            door: '#8B4513',
            window: '#87CEEB',
            sofa: '#9b59b6',
            table: '#d35400',
            bed: '#3498db',
            tv: '#2c3e50'
        };
        
        ctx.fillStyle = colors[furniture.type] || '#95a5a6';
        ctx.fillRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furniture.type, 0, 0);
    }
    
    ctx.restore();
}

function newPlan() {
    if (confirm('Are you sure you want to create a new plan? All unsaved changes will be lost.')) {
        appState.walls = [];
        appState.furniture = [];
        appState.joints = {};
        appState.nextJointId = 1;
        appState.selectedItem = null;
        appState.selectedType = null;
        updatePropertiesPanel();
        saveToHistory();
        operationStatus.textContent = 'New plan created';
    }
}

// Undo/redo functions
function saveToHistory() {
    // Don't save if nothing changed
    if (appState.historyIndex >= 0) {
        const lastState = appState.history[appState.historyIndex];
        const currentState = getCurrentState();
        
        // Check if state actually changed
        if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
            return;
        }
    }
    
    // Remove any future states if we're not at the end of history
    appState.history = appState.history.slice(0, appState.historyIndex + 1);
    
    // Save current state
    const state = getCurrentState();
    
    appState.history.push(state);
    appState.historyIndex++;
    
    // Limit history size
    if (appState.history.length > 50) {
        appState.history.shift();
        appState.historyIndex--;
    }
    
    updateUndoRedoButtons();
}

function getCurrentState() {
    return {
        walls: JSON.parse(JSON.stringify(appState.walls)),
        furniture: JSON.parse(JSON.stringify(appState.furniture)),
        joints: JSON.parse(JSON.stringify(appState.joints)),
        nextJointId: appState.nextJointId,
        viewTransform: JSON.parse(JSON.stringify(appState.viewTransform)),
        measurementPoints: JSON.parse(JSON.stringify(appState.measurementPoints))
    };
}

function undo() {
    if (appState.historyIndex > 0) {
        appState.historyIndex--;
        restoreState(appState.history[appState.historyIndex]);
        updateUndoRedoButtons();
        operationStatus.textContent = 'Undo';
    }
}

function redo() {
    if (appState.historyIndex < appState.history.length - 1) {
        appState.historyIndex++;
        restoreState(appState.history[appState.historyIndex]);
        updateUndoRedoButtons();
        operationStatus.textContent = 'Redo';
    }
}

function restoreState(state) {
    appState.walls = JSON.parse(JSON.stringify(state.walls));
    appState.furniture = JSON.parse(JSON.stringify(state.furniture));
    appState.joints = JSON.parse(JSON.stringify(state.joints));
    appState.nextJointId = state.nextJointId;
    appState.viewTransform = JSON.parse(JSON.stringify(state.viewTransform || { x: 0, y: 0, scale: 1 }));
    appState.measurementPoints = JSON.parse(JSON.stringify(state.measurementPoints || []));
    
    // Deselect any items
    appState.selectedItem = null;
    appState.selectedType = null;
    updatePropertiesPanel();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = appState.historyIndex <= 0;
    redoBtn.disabled = appState.historyIndex >= appState.history.length - 1;
}

// Rendering functions
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply view transformation
    ctx.save();
    ctx.translate(appState.viewTransform.x, appState.viewTransform.y);
    ctx.scale(appState.viewTransform.scale, appState.viewTransform.scale);
    
    // Draw grid
    drawGrid();
    
    // Draw walls
    for (const wall of appState.walls) {
        drawWall(wall);
    }
    
    // Draw temporary wall if drawing
    if (appState.isDrawingWall && appState.tempWall) {
        drawWall(appState.tempWall, true);
    }
    
    // Draw furniture
    for (const furniture of appState.furniture) {
        drawFurniture(furniture);
    }
    
    // Draw measurement
    if (appState.isMeasuring && appState.measurementPoints.length > 0) {
        drawMeasurement();
    }
    
    // Draw selection highlights
    if (appState.selectedItem) {
        if (appState.selectedType === 'wall') {
            drawWallSelection(appState.selectedItem);
        } else if (appState.selectedType === 'furniture') {
            drawFurnitureSelection(appState.selectedItem);
        }
    }
    
    // Draw angle guides if applicable
    if (appState.isDrawingWall && appState.tempWall) {
        drawAngleGuides(appState.tempWall);
    }
    
    ctx.restore();
    
    requestAnimationFrame(render);
}

function drawGrid() {
    const gridSize = 20;
    
    // Calculate visible area in world coordinates
    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(canvas.width, canvas.height);
    
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Calculate starting points for grid lines
    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;
    const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
    const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function drawWall(wall, isTemporary = false) {
    ctx.strokeStyle = isTemporary ? '#3498db' : '#2c3e50';
    ctx.lineWidth = isTemporary ? 3 : appState.wallThickness;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
    ctx.stroke();
}

function drawWallSelection(wall) {
    // Draw endpoints
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(wall.x1, wall.y1, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(wall.x2, wall.y2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight wall
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
    ctx.stroke();
    
    ctx.setLineDash([]);
}

function drawFurniture(furniture) {
    ctx.save();
    ctx.translate(furniture.x, furniture.y);
    ctx.rotate(furniture.rotation * Math.PI / 180);
    
    const img = loadedImages[furniture.type];
    
    if (img && img.complete) {
        // Calculate aspect ratio and draw image centered in square
        const imgAspectRatio = img.width / img.height;
        const containerAspectRatio = furniture.width / furniture.height;
        
        let renderWidth, renderHeight, offsetX, offsetY;
        
        if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            renderWidth = furniture.width;
            renderHeight = furniture.width / imgAspectRatio;
            offsetX = 0;
            offsetY = (furniture.height - renderHeight) / 2;
        } else {
            // Image is taller than container
            renderHeight = furniture.height;
            renderWidth = furniture.height * imgAspectRatio;
            offsetX = (furniture.width - renderWidth) / 2;
            offsetY = 0;
        }
        
        // Draw image centered in the square
        ctx.drawImage(
            img, 
            -furniture.width/2 + offsetX, 
            -furniture.height/2 + offsetY, 
            renderWidth, 
            renderHeight
        );
    } else {
        // Fallback to colored rectangle if image not loaded
        const colors = {
            door: '#8B4513',
            window: '#87CEEB',
            sofa: '#9b59b6',
            table: '#d35400',
            bed: '#3498db',
            tv: '#2c3e50'
        };
        
        ctx.fillStyle = colors[furniture.type] || '#95a5a6';
        ctx.fillRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        // Draw outline
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furniture.type, 0, 0);
    }
    
    ctx.restore();
}

function drawFurnitureSelection(furniture) {
    ctx.save();
    ctx.translate(furniture.x, furniture.y);
    ctx.rotate(furniture.rotation * Math.PI / 180);
    
    // Draw selection outline
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
    ctx.setLineDash([]);
    
    // Draw rotation handle
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, -furniture.height/2 - 15, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw resize handles
    const handleSize = 6;
    ctx.fillStyle = '#3498db';
    
    // Top-left
    ctx.fillRect(-furniture.width/2 - handleSize/2, -furniture.height/2 - handleSize/2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(furniture.width/2 - handleSize/2, -furniture.height/2 - handleSize/2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(-furniture.width/2 - handleSize/2, furniture.height/2 - handleSize/2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(furniture.width/2 - handleSize/2, furniture.height/2 - handleSize/2, handleSize, handleSize);
    
    ctx.restore();
}

function drawMeasurement() {
    if (appState.measurementPoints.length === 0) return;
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw line between points
    if (appState.measurementPoints.length >= 2) {
        const p1 = appState.measurementPoints[0];
        const p2 = appState.measurementPoints[1];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        
        // Draw distance text
        const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(distance)} px`, midX, midY - 10);
    }
    
    // Draw points
    ctx.fillStyle = '#e74c3c';
    for (const point of appState.measurementPoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.setLineDash([]);
}

function drawAngleGuides(wall) {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    
    // Calculate angle in degrees
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * 180 / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    
    // Check if angle is close to 0, 90, 180, or 270 degrees
    const angles = [0, 90, 180, 270];
    for (const targetAngle of angles) {
        if (Math.abs(angleDeg - targetAngle) < appState.ANGLE_SNAP_TOLERANCE || 
            Math.abs(angleDeg - (targetAngle + 360)) < appState.ANGLE_SNAP_TOLERANCE) {
            
            // Draw guide line
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            const length = 1000; // Long enough to cross the canvas
            const guideAngleRad = targetAngle * Math.PI / 180;
            
            ctx.beginPath();
            ctx.moveTo(wall.x1, wall.y1);
            ctx.lineTo(
                wall.x1 + Math.cos(guideAngleRad) * length,
                wall.y1 + Math.sin(guideAngleRad) * length
            );
            ctx.stroke();
            
            ctx.setLineDash([]);
            
            // Draw angle label
            ctx.fillStyle = '#3498db';
            ctx.font = '14px Arial';
            ctx.fillText(
                `${targetAngle}°`, 
                wall.x1 + Math.cos(guideAngleRad) * 50,
                wall.y1 + Math.sin(guideAngleRad) * 50
            );
            
            break;
        }
    }
}

// Export to configurator
function exportToConfigurator() {
    try {
        // Capture the current canvas state
        const canvas = document.getElementById('floor-plan-canvas');
        
        // Create a temporary canvas to capture the actual content (not the transformed view)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set temporary canvas size to match the actual drawing content
        const padding = 50; // Add some padding around the content
        
        // Calculate bounds of all objects
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        // Find bounds of walls
        for (const wall of appState.walls) {
            minX = Math.min(minX, wall.x1, wall.x2);
            minY = Math.min(minY, wall.y1, wall.y2);
            maxX = Math.max(maxX, wall.x1, wall.x2);
            maxY = Math.max(maxY, wall.y1, wall.y2);
        }
        
        // Find bounds of furniture
        for (const furniture of appState.furniture) {
            minX = Math.min(minX, furniture.x - furniture.width/2);
            minY = Math.min(minY, furniture.y - furniture.height/2);
            maxX = Math.max(maxX, furniture.x + furniture.width/2);
            maxY = Math.max(maxY, furniture.y + furniture.height/2);
        }
        
        // If no objects, use default size
        if (!isFinite(minX)) {
            minX = 0; minY = 0; maxX = 800; maxY = 600;
        }
        
        // Add padding
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Draw background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, width, height);
        
        // Draw grid
        drawGridOnExportCanvas(tempCtx, width, height, minX, minY);
        
        // Draw all objects
        for (const wall of appState.walls) {
            drawWallOnExportCanvas(tempCtx, wall, minX, minY);
        }
        
        for (const furniture of appState.furniture) {
            drawFurnitureOnExportCanvas(tempCtx, furniture, minX, minY);
        }
        
        // Convert to data URL
        const dataURL = tempCanvas.toDataURL('image/png');
        
        // Save to sessionStorage
        sessionStorage.setItem('exportedPlan', dataURL);
        sessionStorage.setItem('exportedPlanBounds', JSON.stringify({
            minX, minY, width, height
        }));
        
        // Save plan data for potential reconstruction
        const planData = {
            walls: appState.walls,
            furniture: appState.furniture,
            exportTime: new Date().toISOString()
        };
        sessionStorage.setItem('exportedPlanData', JSON.stringify(planData));
        
        // Show success message
        operationStatus.textContent = 'Plan exported to configurator! Redirecting...';
        
        // Redirect after a brief delay
        setTimeout(() => {
            window.location.href = 'panel.html';
        }, 1000);
        
    } catch (error) {
        console.error('Export error:', error);
        operationStatus.textContent = 'Error exporting plan. Please try again.';
    }
}

// Helper functions for export canvas drawing
function drawGridOnExportCanvas(ctx, width, height, offsetX, offsetY) {
    const gridSize = 20;
    
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawWallOnExportCanvas(ctx, wall, offsetX, offsetY) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = appState.wallThickness;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(wall.x1 - offsetX, wall.y1 - offsetY);
    ctx.lineTo(wall.x2 - offsetX, wall.y2 - offsetY);
    ctx.stroke();
}

function drawFurnitureOnExportCanvas(ctx, furniture, offsetX, offsetY) {
    ctx.save();
    ctx.translate(furniture.x - offsetX, furniture.y - offsetY);
    ctx.rotate(furniture.rotation * Math.PI / 180);
    
    const img = loadedImages[furniture.type];
    
    if (img && img.complete) {
        // Calculate aspect ratio and draw image centered in square
        const imgAspectRatio = img.width / img.height;
        const containerAspectRatio = furniture.width / furniture.height;
        
        let renderWidth, renderHeight, offsetXImg, offsetYImg;
        
        if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container
            renderWidth = furniture.width;
            renderHeight = furniture.width / imgAspectRatio;
            offsetXImg = 0;
            offsetYImg = (furniture.height - renderHeight) / 2;
        } else {
            // Image is taller than container
            renderHeight = furniture.height;
            renderWidth = furniture.height * imgAspectRatio;
            offsetXImg = (furniture.width - renderWidth) / 2;
            offsetYImg = 0;
        }
        
        // Draw image centered in the square
        ctx.drawImage(
            img, 
            -furniture.width/2 + offsetXImg, 
            -furniture.height/2 + offsetYImg, 
            renderWidth, 
            renderHeight
        );
    } else {
        // Fallback to colored rectangle
        const colors = {
            door: '#8B4513',
            window: '#87CEEB',
            sofa: '#9b59b6',
            table: '#d35400',
            bed: '#3498db',
            tv: '#2c3e50'
        };
        
        ctx.fillStyle = colors[furniture.type] || '#95a5a6';
        ctx.fillRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(-furniture.width/2, -furniture.height/2, furniture.width, furniture.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furniture.type, 0, 0);
    }
    
    ctx.restore();
}

// Initialize the application
initCanvas();