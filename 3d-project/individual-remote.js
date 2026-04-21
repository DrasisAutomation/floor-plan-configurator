// individual-remote.js - Individual Remote Control Module for 360 Scene Editor
// Creates a single-button control card that opens direct control directly instead of a switch grid.

const IndividualRemoteModule = (() => {
  // Available Font Awesome icons
  const ICONS = [
    { class: 'fas fa-toggle-on', name: 'Toggle' },
    { class: 'fas fa-sliders-h', name: 'Sliders' },
    { class: 'fas fa-lightbulb', name: 'Bulb-on' },
    { class: 'fa-regular fa-lightbulb', name: 'Bulb-off' },
    { class: 'fa-solid fa-person-booth', name: 'Curtain' },
    { class: 'fas fa-fan', name: 'Fan' },
    { class: 'fas fa-plug', name: 'Plug' },
    { class: 'fas fa-tv', name: 'TV' }
  ];

  const DEFAULT_SWITCH = { name: "Switch", icon: 'fas fa-lightbulb', entityId: "", active: false, _lastToggle: 0, controlType: 'toggle' };

  let instanceId = 1;
  let remotesData = new Map();
  let currentRemoteId = null;
  let currentScene = 'scene1';

  // ========== HOME ASSISTANT CONFIGURATION ==========
  const HA_CONFIG = {
    get url() { return window.HomeAssistantConfig?.getWebSocketUrl() || ''; },
    get token() { return window.HomeAssistantConfig?.active?.token || ''; },
    connected: false,
    socket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: window.HomeAssistantConfig?.maxReconnectAttempts || 5,
    messageId: 1,
    pendingRequests: new Map(),
    autoReconnect: true,
    reconnectInterval: window.HomeAssistantConfig?.reconnectInterval || 5000,
    entityStates: new Map()
  };
  // ==================================================

  // Convert HTTP URL to WebSocket URL
  function convertToWebSocketUrl(httpUrl) {
    if (httpUrl.startsWith('https://')) return httpUrl.replace('https://', 'wss://') + '/api/websocket';
    if (httpUrl.startsWith('http://')) return httpUrl.replace('http://', 'ws://') + '/api/websocket';
    return (httpUrl.startsWith('ws://') || httpUrl.startsWith('wss://')) ? httpUrl : 'wss://' + httpUrl + '/api/websocket';
  }

  // Initialize WebSocket connection to Home Assistant
  const initWebSocket = () => {
    if (HA_CONFIG.socket && (HA_CONFIG.socket.readyState === WebSocket.OPEN || HA_CONFIG.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const wsUrl = convertToWebSocketUrl(HA_CONFIG.url);
    try {
      HA_CONFIG.socket = new WebSocket(wsUrl);
      HA_CONFIG.socket.onopen = () => {
        HA_CONFIG.reconnectAttempts = 0;
        HA_CONFIG.socket.send(JSON.stringify({ type: 'auth', access_token: HA_CONFIG.token }));
      };
      HA_CONFIG.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      HA_CONFIG.socket.onerror = (error) => {
        HA_CONFIG.connected = false;
      };
      HA_CONFIG.socket.onclose = (event) => {
        HA_CONFIG.connected = false;
        updateAllSwitchStates(false);
        HA_CONFIG.pendingRequests.forEach(request => request.reject(new Error('WebSocket closed')));
        HA_CONFIG.pendingRequests.clear();
        if (HA_CONFIG.autoReconnect && HA_CONFIG.reconnectAttempts < HA_CONFIG.maxReconnectAttempts) {
          HA_CONFIG.reconnectAttempts++;
          setTimeout(initWebSocket, HA_CONFIG.reconnectInterval);
        }
      };
    } catch (error) {
      HA_CONFIG.connected = false;
    }
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'auth_required':
        HA_CONFIG.socket.send(JSON.stringify({ type: 'auth', access_token: HA_CONFIG.token }));
        break;
      case 'auth_ok':
        HA_CONFIG.connected = true;
        HA_CONFIG.reconnectAttempts = 0;
        HA_CONFIG.socket.send(JSON.stringify({ id: HA_CONFIG.messageId++, type: 'get_states' }));
        HA_CONFIG.socket.send(JSON.stringify({ id: HA_CONFIG.messageId++, type: 'subscribe_events', event_type: 'state_changed' }));
        break;
      case 'auth_invalid':
        HA_CONFIG.connected = false;
        HA_CONFIG.socket.close();
        break;
      case 'result':
        if (message.id === 1 && message.result) {
          message.result.forEach(ent => HA_CONFIG.entityStates.set(ent.entity_id, ent));
          updateSwitchesFromHA();
        }
        const pendingRequest = HA_CONFIG.pendingRequests.get(message.id);
        if (pendingRequest) {
          HA_CONFIG.pendingRequests.delete(message.id);
          if (message.success) pendingRequest.resolve(message);
          else pendingRequest.reject(new Error(message.error?.message || 'Command failed'));
        }
        break;
      case 'event':
        if (message.event && message.event.event_type === 'state_changed') {
          const { entity_id, new_state } = message.event.data;
          if (new_state) {
            HA_CONFIG.entityStates.set(entity_id, new_state);
            updateSwitchesFromHA();
            if (currentRemoteId) {
              const remoteData = remotesData.get(currentRemoteId);
              if (remoteData && remoteData.switch.entityId === entity_id) {
                renderControlUI(remoteData.switch, currentRemoteId);
              }
            }
          }
        }
        break;
    }
  };

  const updateSwitchesFromHA = () => {
    remotesData.forEach((remoteData, remoteId) => {
      const ha = HA_CONFIG.entityStates.get(remoteData.switch.entityId);
      if (ha) {
        remoteData.switch.active = (ha.state === 'on' || ha.state === 'open' || ha.state === 'true');
        updateSwitchVisualState(remoteId, remoteData.switch.active);
      }
    });
  };

  const getEntityState = (entityId) => HA_CONFIG.entityStates.get(entityId) || { state: '', attributes: {} };
  const getBrightness = (entityId) => {
    const ent = getEntityState(entityId);
    return (ent.attributes && ent.attributes.brightness != null) ? Math.round((ent.attributes.brightness / 255) * 100) : 0;
  };
  const getCurtainPosition = (entityId) => {
    const ent = getEntityState(entityId);
    return (ent.attributes && ent.attributes.current_position != null) ? ent.attributes.current_position : 0;
  };
  const getColorTemp = (entityId) => {
    const ent = getEntityState(entityId);
    if (ent.attributes && ent.attributes.color_temp != null) {
      let percent = (ent.attributes.color_temp - 153) / (500 - 153) * 100;
      return Math.min(100, Math.max(0, Math.round(percent)));
    }
    return 50;
  };
  const getHue = (entityId) => {
    const ent = getEntityState(entityId);
    return (ent.attributes && ent.attributes.hs_color && ent.attributes.hs_color[0] != null) ? Math.round(ent.attributes.hs_color[0]) : 0;
  };

  const updateSwitchVisualState = (remoteId, isActive) => {
    const mainButton = document.getElementById(`${remoteId}-mainButton`);
    if (mainButton) {
      if (isActive) {
        mainButton.classList.add('active-device');
      } else {
        mainButton.classList.remove('active-device');
      }
    }
  };

  const updateAllSwitchStates = (connected) => {
    remotesData.forEach((remoteData, remoteId) => {
      if (!connected) {
        remoteData.switch.active = false;
        updateSwitchVisualState(remoteId, false);
      }
    });
  };

  const callService = (domain, service, data) => {
    if (!HA_CONFIG.connected || !HA_CONFIG.socket) return;
    HA_CONFIG.socket.send(JSON.stringify({
      id: HA_CONFIG.messageId++,
      type: 'call_service',
      domain, service,
      service_data: data
    }));
  };

  // Create HTML structure for individual remote modal (no switch grid)
  const createRemoteModal = (position, targetScene, switchOverride = null, panelName = null, shape = null) => {
    const remoteId = `indiv-remote-${instanceId++}`;
    const sw = switchOverride ? JSON.parse(JSON.stringify(switchOverride)) : JSON.parse(JSON.stringify(DEFAULT_SWITCH));

    const container = document.createElement('div');
    container.className = 'individual-remote-container remote-container';
    container.id = remoteId;
    container.dataset.position = JSON.stringify(position);
    container.dataset.targetScene = targetScene || '';
    container.dataset.visible = 'true';
    container.style.position = 'absolute';
    container.style.zIndex = '1000';
    container.style.pointerEvents = 'none';

    container.innerHTML = `
      <!-- Single Main Button in 3D representing the switch -->
      <button class="individual-remote-main-button remote-main-button" id="${remoteId}-mainButton" style="pointer-events: auto; ${shape === 'round' ? 'border-radius: 50%; aspect-ratio: 1/1;' : ''}">
        <i class="${sw.icon}"></i>
      </button>

      <!-- Main Modal - contains only edit and control panels -->
      <div class="individual-remote-modal remote-modal" id="${remoteId}-modal">
        <div class="remote-modal-content">
          <button class="remote-close-btn" id="${remoteId}-closeModal">
            <i class="fas fa-times"></i>
          </button>
          <!-- Panel Edit -->
          <div id="${remoteId}-panelEdit" class="remote-panel hidden">
            <div class="remote-modal-title" id="${remoteId}-modalTitle">${panelName || 'Individual Switch'}</div>
            <form class="remote-edit-form" id="${remoteId}-editForm">
              <div class="remote-form-group">
                <label class="remote-form-label">Panel Name</label>
                <input type="text" class="remote-form-input" id="${remoteId}-panelName" value="${panelName || 'Individual Switch'}" maxlength="20">
              </div>
              <div class="remote-form-group">
                <label class="remote-form-label">Name (8 max)</label>
                <input type="text" class="remote-form-input" id="${remoteId}-switchName" maxlength="8" required>
              </div>
              <div class="remote-form-group">
                <label class="remote-form-label">Entity ID</label>
                <input type="text" class="remote-form-input" id="${remoteId}-entityId" placeholder="light.bedroom" required>
              </div>
              <div class="remote-form-group">
                <label class="remote-form-label">Control type</label>
                <select class="remote-form-select" id="${remoteId}-controlType">
                  <option value="toggle">Toggle (on/off)</option>
                  <option value="dimmer">Dimmer (brightness)</option>
                  <option value="cct">CCT (brightness + temp)</option>
                  <option value="rgb">RGB (brightness + hue)</option>
                  <option value="curtain">Curtain (position)</option>
                </select>
              </div>
              <div class="remote-form-group">
                <label class="remote-form-label">Icon</label>
                <input type="text" class="remote-form-input" id="${remoteId}-iconSearch" placeholder="Search icons... (e.g. cat)" style="margin-bottom: 5px;">
                <input type="hidden" id="${remoteId}-buttonIcon" value="${sw.icon}">
                <div class="remote-icon-selection">
                  <div class="remote-icon-grid" id="${remoteId}-iconGrid"></div>
                </div>
              </div>
              <div class="remote-form-actions">
                <button type="button" class="remote-form-btn danger" id="${remoteId}-deleteBtn" style="margin-right: auto;">Delete</button>
                <button type="submit" class="remote-form-btn save">Save</button>
              </div>
            </form>
          </div>

          <!-- Panel Control (direct control) -->
          <div id="${remoteId}-panelControl" class="remote-panel hidden">
            <div class="remote-modal-title" id="${remoteId}-controlTitle">${panelName || 'Control'}</div>
            <div class="remote-control-container" id="${remoteId}-controlContainer"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    remotesData.set(remoteId, {
      id: remoteId,
      position: position,
      targetScene: targetScene || '',
      switch: sw,
      panelName: panelName || 'Individual Switch',
      shape: shape || 'default',
      active: false,
      container: container,
      visible: true
    });

    initRemoteModal(remoteId);
    updateSwitchVisualState(remoteId, sw.active);

    return remoteId;
  };

  const initRemoteModal = (remoteId) => {
    const remoteData = remotesData.get(remoteId);
    if (!remoteData) return;

    const modal = document.getElementById(`${remoteId}-modal`);
    const panelEdit = document.getElementById(`${remoteId}-panelEdit`);
    const panelControl = document.getElementById(`${remoteId}-panelControl`);
    const iconGrid = document.getElementById(`${remoteId}-iconGrid`);
    const mainButton = document.getElementById(`${remoteId}-mainButton`);
    const closeModalBtn = document.getElementById(`${remoteId}-closeModal`);
    const editForm = document.getElementById(`${remoteId}-editForm`);
    const deleteBtn = document.getElementById(`${remoteId}-deleteBtn`);

    populateIconGrid(iconGrid, remoteId);
    setupEventListeners(remoteId, modal, panelEdit, panelControl, mainButton, closeModalBtn, editForm, deleteBtn, remoteData);
  };

  const populateIconGrid = (iconGridElement, remoteId) => {
    if (!iconGridElement) return;

    const currentIconInput = document.getElementById(`${remoteId}-buttonIcon`);
    const searchInput = document.getElementById(`${remoteId}-iconSearch`);
    const remoteData = remotesData.get(remoteId);
    if (!remoteData) return;
    
    // Initial render
    window.FontAwesomeSearch.renderGrid(iconGridElement, '', remoteData.tempSelectedIcon || remoteData.switch.icon, (selectedClass) => {
      remoteData.tempSelectedIcon = selectedClass;
      if (currentIconInput) currentIconInput.value = selectedClass;
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        window.FontAwesomeSearch.renderGrid(iconGridElement, e.target.value, remoteData.tempSelectedIcon || remoteData.switch.icon, (selectedClass) => {
          remoteData.tempSelectedIcon = selectedClass;
          if (currentIconInput) currentIconInput.value = selectedClass;
        });
      });
    }
  };

  const renderControlUI = (sw, remoteId) => {
    const controlContainer = document.getElementById(`${remoteId}-controlContainer`);
    if (!controlContainer) return;
    
    const type = sw.controlType;
    let html = '';

    if (type === 'dimmer') {
      let b = getBrightness(sw.entityId);
      html = `<div class="remote-slider-unit">
                <span class="remote-slider-label">Brightness</span>
                <input type="range" min="0" max="100" value="${b}" class="remote-dynamic-slider remote-brightness-slider" id="${remoteId}-dimmerSlider">
                <div class="remote-control-value" id="${remoteId}-dimmerValue">${b}%</div>
              </div>`;
    } else if (type === 'cct') {
      let b = getBrightness(sw.entityId);
      let t = getColorTemp(sw.entityId);
      let kelvin = Math.round(6500 - (t / 100) * (6500 - 2000));
      html = `<div class="remote-slider-unit">
                <span class="remote-slider-label">Brightness</span>
                <input type="range" min="0" max="100" value="${b}" class="remote-dynamic-slider remote-brightness-slider" id="${remoteId}-cctBrightSlider">
                <div class="remote-control-value" id="${remoteId}-cctBrightValue">${b}%</div>
              </div>
              <div class="remote-slider-unit">
                <span class="remote-slider-label">Color temp</span>
                <input type="range" min="0" max="100" value="${t}" class="remote-dynamic-slider remote-temp-slider" id="${remoteId}-cctTempSlider">
                <div class="remote-control-value" id="${remoteId}-cctTempValue">${kelvin}K</div>
              </div>`;
    } else if (type === 'rgb') {
      let b = getBrightness(sw.entityId);
      let h = getHue(sw.entityId);
      html = `<div class="remote-slider-unit">
                <span class="remote-slider-label">Brightness</span>
                <input type="range" min="0" max="100" value="${b}" class="remote-dynamic-slider remote-brightness-slider" id="${remoteId}-rgbBrightSlider">
                <div class="remote-control-value" id="${remoteId}-rgbBrightValue">${b}%</div>
              </div>
              <div class="remote-slider-unit">
                <span class="remote-slider-label">Hue</span>
                <input type="range" min="0" max="360" value="${h}" class="remote-dynamic-slider remote-rgb-slider" id="${remoteId}-rgbHueSlider">
                <div class="remote-control-value" id="${remoteId}-rgbHueValue">Hue ${h}°</div>
              </div>`;
    } else if (type === 'curtain') {
      let pos = getCurtainPosition(sw.entityId);
      html = `<div class="remote-slider-unit">
                <span class="remote-slider-label">Position</span>
                <input type="range" min="0" max="100" value="${pos}" class="remote-dynamic-slider remote-brightness-slider" id="${remoteId}-curtainSlider">
                <div class="remote-control-value" id="${remoteId}-curtainValue">${pos}%</div>
              </div>`;
    } else {
      html = '<div class="remote-toggle-placeholder" style="text-align:center; padding: 20px;">Use the main button directly to toggle.</div>';
    }

    controlContainer.innerHTML = html;

    setTimeout(() => {
      attachControlEvents(type, sw, remoteId);
    }, 0);
  };

  const attachControlEvents = (type, sw, remoteId) => {
    const bindSlider = (idAffix, service, paramFn, fmtFn) => {
      const s = document.getElementById(`${remoteId}-${idAffix}Slider`);
      const v = document.getElementById(`${remoteId}-${idAffix}Value`);
      if (s) {
        s.style.boxShadow = 'none';
        s.addEventListener('mousedown', e => e.stopPropagation());
        s.addEventListener('touchstart', e => e.stopPropagation(), {passive: true});
        s.addEventListener('input', e => { e.stopPropagation(); v.textContent = fmtFn(e.target.value); });
        s.addEventListener('change', e => { e.stopPropagation(); callService(sw.entityId.split('.')[0], service, { entity_id: sw.entityId, ...paramFn(e.target.value) }); });
      }
    };
    if (type === 'dimmer' || type === 'cct' || type === 'rgb') {
      bindSlider(type === 'dimmer' ? 'dimmer' : (type === 'cct' ? 'cctBright' : 'rgbBright'), 'turn_on', v => ({ brightness_pct: parseInt(v) }), v => v + '%');
    }
    if (type === 'cct') {
      bindSlider('cctTemp', 'turn_on', v => ({ color_temp: Math.round(153 + (500 - 153) * (v / 100)) }), v => Math.round(6500 - (v / 100) * (6500 - 2000)) + 'K');
    }
    if (type === 'rgb') {
      bindSlider('rgbHue', 'turn_on', v => ({ hs_color: [parseInt(v), 100] }), v => 'Hue ' + v + '°');
    }
    if (type === 'curtain') {
      bindSlider('curtain', 'set_cover_position', v => ({ position: parseInt(v) }), v => v + '%');
    }
  };

  const toggleSwitch = (remoteId) => {
    const remoteData = remotesData.get(remoteId);
    if (!remoteData) return;
    const sw = remoteData.switch;

    if (!sw.entityId) {
      openEditPanel(remoteId);
      return;
    }

    const now = Date.now();
    if (sw._lastToggle && (now - sw._lastToggle) < 500) return;

    const current = sw.active;
    sw.active = !current;
    updateSwitchVisualState(remoteId, sw.active);

    try {
      if (HA_CONFIG.connected && HA_CONFIG.socket) {
        const domain = sw.entityId.split('.')[0];
        callService(domain, 'toggle', { entity_id: sw.entityId });
        sw._lastToggle = Date.now();
      } else {
        sw.active = current;
        updateSwitchVisualState(remoteId, current);
      }
    } catch {
      sw.active = current;
      updateSwitchVisualState(remoteId, current);
    }
  };

  const openEditPanel = (remoteId) => {
    const remoteData = remotesData.get(remoteId);
    if (!remoteData) return;
    
    currentRemoteId = remoteId;
    const sw = remoteData.switch;

    document.getElementById(`${remoteId}-switchName`).value = sw.name;
    document.getElementById(`${remoteId}-entityId`).value = sw.entityId;
    document.getElementById(`${remoteId}-controlType`).value = sw.controlType || 'toggle';
    remoteData.tempSelectedIcon = sw.icon;

    document.getElementById(`${remoteId}-iconSearch`).value = '';
    const iconGrid = document.getElementById(`${remoteId}-iconGrid`);
    window.FontAwesomeSearch.renderGrid(iconGrid, '', sw.icon, (selectedClass) => {
      remoteData.tempSelectedIcon = selectedClass;
      const currentIconInput = document.getElementById(`${remoteId}-buttonIcon`);
      if (currentIconInput) currentIconInput.value = selectedClass;
    });

    document.getElementById(`${remoteId}-panelControl`).classList.add('hidden');
    document.getElementById(`${remoteId}-panelEdit`).classList.remove('hidden');
    
    const modal = document.getElementById(`${remoteId}-modal`);
    modal.classList.add('show');
    document.body.classList.add('remote-modal-active');
  };

  const openControlPanel = (remoteId) => {
    const remoteData = remotesData.get(remoteId);
    if (!remoteData) return;
    
    currentRemoteId = remoteId;
    const sw = remoteData.switch;
    const controlTitle = document.getElementById(`${remoteId}-controlTitle`);
    if (controlTitle) controlTitle.textContent = remoteData.panelName || sw.name + ' Control';

    renderControlUI(sw, remoteId);

    document.getElementById(`${remoteId}-panelEdit`).classList.add('hidden');
    document.getElementById(`${remoteId}-panelControl`).classList.remove('hidden');

    const modal = document.getElementById(`${remoteId}-modal`);
    modal.classList.add('show');
    document.body.classList.add('remote-modal-active');
  };

  const setupEventListeners = (remoteId, modal, panelEdit, panelControl, mainButton, closeModalBtn, editForm, deleteBtn, remoteData) => {
    let pressTimer;
    let isLongPress = false;
    
    const handleMainAction = () => {
      if (isLongPress) return;
      
      if (window.shapeMode === 'round') {
        remoteData.shape = 'round';
        mainButton.style.borderRadius = '50%';
        mainButton.style.aspectRatio = '1/1';
        return;
      } else if (window.shapeMode === 'default') {
        remoteData.shape = 'default';
        mainButton.style.borderRadius = '';
        mainButton.style.aspectRatio = '';
        return;
      }
      
      const sw = remoteData.switch;
      if (!sw.entityId) {
        openEditPanel(remoteId);
      } else if (sw.controlType === 'toggle') {
        toggleSwitch(remoteId);
      } else {
        openControlPanel(remoteId);
      }
    };
    
    const startLongPress = () => {
      isLongPress = false;
      pressTimer = setTimeout(() => {
        isLongPress = true;
        openEditPanel(remoteId);
      }, 500); // 500ms long press standard
    };
    
    const cancelLongPress = () => clearTimeout(pressTimer);

    mainButton.addEventListener('mousedown', (e) => { e.preventDefault(); startLongPress(); });
    mainButton.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); startLongPress(); });
    mainButton.addEventListener('mouseup', (e) => { e.preventDefault(); cancelLongPress(); handleMainAction(); });
    mainButton.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); cancelLongPress(); handleMainAction(); });
    mainButton.addEventListener('mouseleave', cancelLongPress);
    mainButton.addEventListener('touchcancel', cancelLongPress);

    closeModalBtn.addEventListener('click', () => { modal.classList.remove('show'); document.body.classList.remove('remote-modal-active'); });
    
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if(confirm('Delete this individual remote?')) {
        IndividualRemoteModule.deleteRemote(remoteId);
        document.body.classList.remove('remote-modal-active');
      }
    });

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sw = remoteData.switch;
      sw.name = document.getElementById(`${remoteId}-switchName`).value.trim().substring(0, 8);
      sw.entityId = document.getElementById(`${remoteId}-entityId`).value.trim();
      sw.controlType = document.getElementById(`${remoteId}-controlType`).value;
      sw.icon = remoteData.tempSelectedIcon || sw.icon;
      sw.active = false;
      
      const newPanelName = document.getElementById(`${remoteId}-panelName`).value.trim();
      if (newPanelName) {
        remoteData.panelName = newPanelName;
        const titleEl = document.getElementById(`${remoteId}-modalTitle`);
        if (titleEl) titleEl.textContent = newPanelName;
      }
      
      const iconEl = mainButton.querySelector('i');
      if(iconEl) iconEl.className = sw.icon;

      modal.classList.remove('show');
      document.body.classList.remove('remote-modal-active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.classList.remove('remote-modal-active');
      }
    });

    const sliders = modal.querySelectorAll('.remote-dynamic-slider');
    sliders.forEach(slider => {
      slider.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      slider.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    });
  };

  return {
    createRemote: (position, targetScene, switchOverride = null) => {
      const remoteId = createRemoteModal(position, targetScene, switchOverride);
      return { id: remoteId, position: position, targetScene: targetScene || '' };
    },
    deleteRemote: (remoteId) => {
      const container = document.getElementById(remoteId);
      if (container) container.remove();
      return remotesData.delete(remoteId);
    },
    getRemotesData: () => {
      const remotes = [];
      remotesData.forEach(remoteData => {
        remotes.push({
          id: remoteData.id,
          position: remoteData.position.toArray ? remoteData.position.toArray() : remoteData.position,
          targetScene: remoteData.targetScene || '',
          panelName: remoteData.panelName || 'Individual Switch',
          shape: remoteData.shape || 'default',
          switch: {
            name: remoteData.switch.name,
            icon: remoteData.switch.icon,
            entityId: remoteData.switch.entityId,
            active: remoteData.switch.active,
            controlType: remoteData.switch.controlType || 'toggle'
          }
        });
      });
      return remotes;
    },
    setCurrentScene: (sceneName) => currentScene = sceneName,
    loadRemotes: (remotesDataArray) => {
      document.querySelectorAll('.individual-remote-container').forEach(el => el.remove());
      remotesData.clear();
      remotesDataArray.forEach(remoteData => {
        const position = Array.isArray(remoteData.position) ? new THREE.Vector3().fromArray(remoteData.position) : remoteData.position;
        const sw = remoteData.switch || JSON.parse(JSON.stringify(DEFAULT_SWITCH));
        createRemoteModal(position, remoteData.targetScene || '', sw, remoteData.panelName, remoteData.shape);
      });
      if (HA_CONFIG.connected) updateSwitchesFromHA();
    },
    clearRemotes: () => {
      document.querySelectorAll('.individual-remote-container').forEach(el => el.remove());
      remotesData.clear();
    },
    updateRemotePositions: (camera) => {
      remotesData.forEach((remoteData, remoteId) => {
        const container = document.getElementById(remoteId);
        if (!container || !remoteData.position) return;
        const shouldBeVisible = !remoteData.targetScene || remoteData.targetScene === currentScene;
        if (!shouldBeVisible) {
          container.style.display = 'none';
          return;
        }
        const screenPoint = remoteData.position.clone().project(camera);
        const x = (screenPoint.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPoint.y * 0.5 + 0.5) * window.innerHeight;
        if (screenPoint.z < 1 && x >= -50 && x <= window.innerWidth + 50 && y >= -50 && y <= window.innerHeight + 50) {
          container.style.display = 'block';
          container.style.left = x + 'px';
          container.style.top = y + 'px';
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
        } else {
          container.style.display = 'none';
        }
      });
    },
    updateRemoteVisibility: (sceneName) => {
      currentScene = sceneName;
      remotesData.forEach((remoteData, remoteId) => {
        const container = document.getElementById(remoteId);
        if (container && remoteData) {
          const shouldBeVisible = !remoteData.targetScene || remoteData.targetScene === sceneName;
          container.dataset.visible = shouldBeVisible.toString();
          container.style.display = shouldBeVisible ? 'block' : 'none';
        }
      });
    },
    getHAConfig: () => ({ url: HA_CONFIG.url, connected: HA_CONFIG.connected, socketState: HA_CONFIG.socket ? HA_CONFIG.socket.readyState : 'CLOSED' }),
    syncWithHA: async () => {
      if (!HA_CONFIG.connected) {
        initWebSocket();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      updateSwitchesFromHA();
      return { success: HA_CONFIG.connected, message: HA_CONFIG.connected ? 'Sync completed' : 'Not connected' };
    },
    initHomeAssistant: async () => {
      initWebSocket();
      return new Promise((resolve) => {
        const iter = setInterval(() => {
          if (HA_CONFIG.connected) {
            clearInterval(iter);
            resolve({ success: true, message: 'Connected to HA' });
          }
        }, 1000);
        setTimeout(() => { clearInterval(iter); resolve({ success: false, message: 'Timeout' }); }, 10000);
      });
    },
    disconnectHomeAssistant: () => {
      if (HA_CONFIG.socket) {
        HA_CONFIG.autoReconnect = false;
        HA_CONFIG.socket.close();
        HA_CONFIG.connected = false;
      }
    }
  };
})();
