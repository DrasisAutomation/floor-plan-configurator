// icon-picker.js
window.FontAwesomeSearch = (() => {
  let allIcons = [];
  let isLoaded = false;
  let isLoading = false;

  const loadIcons = async () => {
    if (isLoaded || isLoading) return;
    isLoading = true;
    try {
      const response = await fetch('fontawesome/metadata/icons.json');
      const data = await response.json();
      
      const icons = [];
      for (const [name, meta] of Object.entries(data)) {
        
        let stylePrefix = 'fas';
        if (meta.styles.includes('solid')) stylePrefix = 'fa-solid';
        else if (meta.styles.includes('regular')) stylePrefix = 'fa-regular';
        else if (meta.styles.includes('brands')) stylePrefix = 'fa-brands';
        
        icons.push({
          class: `${stylePrefix} fa-${name}`,
          name: meta.label || name,
          terms: meta.search && meta.search.terms ? meta.search.terms.map(t => t.toLowerCase()) : []
        });
      }
      
      allIcons = icons;
      isLoaded = true;
      isLoading = false;
      console.log(`Loaded ${allIcons.length} FontAwesome icons from local file.`);
    } catch (error) {
      console.error('Failed to load FontAwesome icons:', error);
      isLoading = false;
    }
  };

  loadIcons();

  return {
    isReady: () => isLoaded,
    
    renderGrid: async (container, searchTerm, selectedClass, onSelectCallback) => {
      
      if (!isLoaded && !isLoading) {
        await loadIcons();
      } else if (isLoading) {
        while(isLoading) {
          await new Promise(r => setTimeout(r, 100));
        }
      }
      
      if (!container) return;
      
      let filteredIcons = allIcons;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredIcons = allIcons.filter(icon => 
          icon.name.toLowerCase().includes(term) || 
          icon.class.toLowerCase().includes(term) ||
          icon.terms.some(t => t.includes(term))
        );
      }
      
      filteredIcons = filteredIcons.slice(0, 100);
      
      container.innerHTML = '';
      
      if (filteredIcons.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 10px;">No icons found</div>';
        return;
      }
      
      filteredIcons.forEach(icon => {
        const iconOption = document.createElement('div');
        
        iconOption.style.cursor = 'pointer';
        iconOption.style.fontSize = '18px';
        iconOption.style.display = 'flex';
        iconOption.style.justifyContent = 'center';
        iconOption.style.alignItems = 'center';
        iconOption.style.padding = '8px';
        iconOption.style.borderRadius = '5px';
        iconOption.style.transition = 'all 0.2s';
        iconOption.style.border = '2px solid transparent';
        iconOption.dataset.icon = icon.class;
        
        if (icon.class === selectedClass) {
          iconOption.style.background = '#007aff';
          iconOption.style.color = 'white';
          iconOption.style.borderColor = '#0056cc';
        } else {
          iconOption.style.color = '#666';
          iconOption.style.background = 'white';
        }
        
        const iconEl = document.createElement('i');
        iconEl.className = icon.class;
        iconOption.appendChild(iconEl);
        
        const handleSelect = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectCallback(icon.class);
          
          Array.from(container.children).forEach(child => {
            child.style.background = 'white';
            child.style.color = '#666';
            child.style.borderColor = 'transparent';
          });
          iconOption.style.background = '#007aff';
          iconOption.style.color = 'white';
          iconOption.style.borderColor = '#0056cc';
        };
        
        iconOption.addEventListener('click', handleSelect);
        iconOption.addEventListener('touchend', handleSelect);
        
        container.appendChild(iconOption);
      });
    }
  };
})();
