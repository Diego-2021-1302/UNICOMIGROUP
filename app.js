const { groups: GROUPS, start: START, places: PLACE_DATA } = window.MAP_DATA;

const state = {
  map: null,
  geocoder: null,
  directionsService: null,
  start: null,
  places: new Map(),
  markers: new Map(),
  currentRenderer: null,
  activeGroup: 'all',
  activePlaceId: null,
  directionsVisible: false,
  placesListVisible: true,
  presentationIndex: -1,
  mapType: 'roadmap',
  fullscreenHandlerBound: false
};

function el(id) {
  return document.getElementById(id);
}

function setStatus(text) {
  el('statusPill').textContent = text;
}

function createMarkerPin(color) {
  const pin = document.createElement('div');
  pin.className = 'marker-pin';
  pin.style.background = color;
  pin.style.position = 'relative';
  return pin;
}

function clearActiveClasses(selector) {
  document.querySelectorAll(selector).forEach(node => node.classList.remove('active'));
}

function setHeroEmpty(message) {
  const hero = el('placeHero');
  hero.className = 'place-hero empty-state';
  hero.innerHTML = message;
  el('placeMeta').classList.add('hidden');
}

function setHeroPhoto(url, alt) {
  const hero = el('placeHero');
  hero.className = 'place-hero';
  hero.innerHTML = `<img src="${url}" alt="${alt}">`;
}

function clearRoute() {
  if (state.currentRenderer) {
    state.currentRenderer.setMap(null);
    state.currentRenderer = null;
  }
}

function focusRoute(routeResult) {

  if (!routeResult?.routes?.length) return;

  const route = routeResult.routes[0];
  const bounds = new google.maps.LatLngBounds();

  route.overview_path.forEach(point => {
    bounds.extend(point);
  });

  // auto encuadre tipo GPS
  state.map.fitBounds(bounds, 80);

  // evitar zoom exagerado
  google.maps.event.addListenerOnce(state.map, "bounds_changed", () => {

    const zoom = state.map.getZoom();

    if (zoom > 18) state.map.setZoom(18);
    if (zoom < 15) state.map.setZoom(15);

  });

}

function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html || '';
  return temp.textContent || temp.innerText || '';
}

function formatDistance(step) {
  return step?.distance?.text ? ` for ${step.distance.text}` : '';
}

function simplifyStep(step, index, total) {
  const raw = stripHtml(step.instructions).trim();
  const lower = raw.toLowerCase();
  const maneuver = (step.maneuver || '').toLowerCase();
  const street = raw.match(/(?:onto|on to|on)\s+([^,]+)/i)?.[1]?.trim();
  const streetText = street ? ` on ${street}` : '';
  const distanceText = formatDistance(step);

  if (index === total - 1 && /destination/.test(lower)) {
    if (lower.includes('right')) return 'The place is on the right.';
    if (lower.includes('left')) return 'The place is on the left.';
    return 'You have arrived.';
  }

  if (maneuver.includes('turn-left') || lower.includes('turn left')) {
    return `Turn left${streetText}${distanceText}.`;
  }
  if (maneuver.includes('turn-right') || lower.includes('turn right')) {
    return `Turn right${streetText}${distanceText}.`;
  }
  if (maneuver.includes('uturn')) {
    return `Make a U-turn${distanceText}.`;
  }
  if (maneuver.includes('fork-left') || lower.includes('keep left')) {
    return `Keep left${distanceText}.`;
  }
  if (maneuver.includes('fork-right') || lower.includes('keep right')) {
    return `Keep right${distanceText}.`;
  }
  if (maneuver.includes('merge') || lower.includes('merge')) {
    return `Go straight on${streetText}${distanceText}.`;
  }
  if (maneuver.includes('ramp-left')) {
    return `Take the left ramp${distanceText}.`;
  }
  if (maneuver.includes('ramp-right')) {
    return `Take the right ramp${distanceText}.`;
  }
  if (lower.includes('cross')) {
    return `Cross the street${distanceText}.`;
  }
  if (lower.includes('pass') || lower.includes('go past')) {
    return `Go past the next block${distanceText}.`;
  }
  if (lower.includes('head') || lower.includes('continue') || lower.includes('straight')) {
    return `Go straight on${streetText}${distanceText}.`;
  }

  return raw ? `${raw}.` : `Go straight on${distanceText}.`;
}

function updateDirectionsList(steps) {
  const list = el('directionsList');
  list.innerHTML = '';
  if (!steps || !steps.length) {
    list.innerHTML = '<li>Select a place to generate the real route.</li>';
    return;
  }

  const intro = document.createElement('li');
  intro.textContent = `Start at ${START.title}.`;
  list.appendChild(intro);

  steps.forEach((step, index) => {
    const li = document.createElement('li');
    li.textContent = simplifyStep(step, index, steps.length);
    list.appendChild(li);
  });
}

function setDirectionsVisibility(visible) {
  state.directionsVisible = visible;
  el('directionsWrap').classList.toggle('hidden', !visible);
  el('toggleDirectionsBtn').textContent = visible ? 'Hide' : 'Show';
  el('toggleDirectionsBtn').setAttribute('aria-expanded', visible ? 'true' : 'false');
}

function setPlacesVisibility(visible) {
  state.placesListVisible = visible;
  el('placesWrap').classList.toggle('hidden', !visible);
  el('togglePlacesBtn').textContent = visible ? 'Hide list' : 'Show list';
}

function groupPlaces(groupKey) {
  if (groupKey === 'all') return PLACE_DATA;
  return PLACE_DATA.filter(place => place.group === groupKey);
}

function syncCounter() {
  const visiblePlaces = groupPlaces(state.activeGroup === 'all' ? 'red' : state.activeGroup);
  const total = visiblePlaces.length;
  const current = state.presentationIndex >= 0 ? state.presentationIndex + 1 : 0;
  el('presentationCounter').textContent = `${current} / ${total}`;
}

function syncActiveButtons() {
  clearActiveClasses('.group-btn');
  clearActiveClasses('.place-btn');
  const groupBtn = document.querySelector(`.group-btn.${state.activeGroup}`);
  if (groupBtn) groupBtn.classList.add('active');
  if (state.activePlaceId) {
    const placeBtn = document.querySelector(`.place-btn[data-place-id="${state.activePlaceId}"]`);
    if (placeBtn) placeBtn.classList.add('active');
  }
}

function updateMarkerVisibility() {
  state.markers.forEach((marker, placeId) => {
    const placeData = PLACE_DATA.find(item => item.id === placeId);
    if (!placeData) return;
    const visible = state.activeGroup === 'all' || placeData.group === state.activeGroup;
    marker.map = visible ? state.map : null;
  });
}

function setPlaceMeta(placeData, resolvedPlace) {
  el('placeMeta').classList.remove('hidden');
  el('placeTitle').textContent = resolvedPlace.displayName || placeData.title;
  el('placeAddress').textContent = resolvedPlace.formattedAddress || 'Address unavailable';
  el('placeDescription').textContent = placeData.description;
  el('placeSentence').textContent = placeData.sentence || '';

  const badge = el('placeGroupBadge');
  badge.textContent = GROUPS[placeData.group].label;
  badge.className = `group-badge ${placeData.group}`;
}

function setPhotoAttribution(photo) {
  const node = el('photoAttribution');
  node.innerHTML = '';
  if (!photo?.authorAttributions?.length) return;
  const attr = photo.authorAttributions[0];
  const link = document.createElement('a');
  link.href = attr.uri;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = `Photo attribution: ${attr.displayName}`;
  node.appendChild(link);
}

function renderLegend() {
  const legend = el('legend');
  legend.innerHTML = '';
  Object.values(GROUPS).filter(group => group.key !== 'all').forEach(group => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-swatch" style="background:${group.color}"></span>${group.label} · ${group.owner.split('—')[0].trim()}`;
    legend.appendChild(item);
  });
}

function renderGroupButtons() {
  const container = el('groupButtons');
  container.innerHTML = '';
  [GROUPS.all, GROUPS.red, GROUPS.blue, GROUPS.green, GROUPS.purple].forEach(group => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `group-btn ${group.key}`;
    button.innerHTML = `<strong>${group.label}</strong><span>${group.owner}</span>`;
    button.addEventListener('click', () => setActiveGroup(group.key));
    container.appendChild(button);
  });
}

function renderPlacesList() {
  const container = el('placesList');
  container.innerHTML = '';
  const filtered = groupPlaces(state.activeGroup);
  el('activeGroupLabel').textContent = GROUPS[state.activeGroup].label;

  filtered.forEach((place, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `place-btn ${place.group}`;
    button.dataset.placeId = place.id;
    button.innerHTML = `<strong>${place.title}</strong><span>${GROUPS[place.group].owner}</span>`;
    button.addEventListener('click', () => {
      state.presentationIndex = index;
      syncCounter();
      focusPlace(place.id);
    });
    container.appendChild(button);
  });

  syncActiveButtons();
}

async function geocodeQuery(query) {
  return new Promise((resolve, reject) => {
    state.geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        resolve(results[0].geometry.location);
      } else {
        reject(new Error(`Geocoding failed for ${query}: ${status}`));
      }
    });
  });
}

async function searchPlace(placeData) {
  const { Place } = await google.maps.importLibrary('places');
  const request = {
    textQuery: placeData.query,
    fields: ['displayName', 'formattedAddress', 'location'],
    locationBias: state.start.location,
    maxResultCount: 1,
    language: 'en-US',
    region: 'do'
  };

  const { places } = await Place.searchByText(request);
  if (!places?.length) throw new Error(`No Google Maps result for ${placeData.title}`);
  const place = places[0];
  await place.fetchFields({ fields: ['photos'] });
  return place;
}

async function createStartMarker() {
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  new AdvancedMarkerElement({
    map: state.map,
    position: state.start.location,
    title: START.title,
    content: createMarkerPin('#f59e0b')
  });
}

async function loadPlaces() {
  setStatus('Searching real places…');
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(state.start.location);

  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

  for (const placeData of PLACE_DATA) {
    try {
      const resolvedPlace = await searchPlace(placeData);
      state.places.set(placeData.id, resolvedPlace);
      bounds.extend(resolvedPlace.location);

      const marker = new AdvancedMarkerElement({
        map: state.map,
        position: resolvedPlace.location,
        title: placeData.title,
        content: createMarkerPin(GROUPS[placeData.group].color)
      });

      marker.addListener('gmp-click', () => {
        const list = groupPlaces(state.activeGroup);
        state.presentationIndex = list.findIndex(item => item.id === placeData.id);
        syncCounter();
        focusPlace(placeData.id);
      });

      state.markers.set(placeData.id, marker);
    } catch (error) {
      console.error(error);
    }
  }

  state.map.fitBounds(bounds, 70);
  updateMarkerVisibility();
  setStatus('Ready');
}

async function drawRouteToPlace(placeId) {
  const resolvedPlace = state.places.get(placeId);
  const placeData = PLACE_DATA.find(item => item.id === placeId);
  if (!resolvedPlace || !placeData) return;

  clearRoute();
  const renderer = new google.maps.DirectionsRenderer({
    map: state.map,
    suppressMarkers: true,
    preserveViewport: true,
    polylineOptions: {
      strokeColor: GROUPS[placeData.group].color,
      strokeWeight: 6,
      strokeOpacity: 0.92
    }
  });

  const response = await state.directionsService.route({
    origin: state.start.location,
    destination: resolvedPlace.location,
    travelMode: google.maps.TravelMode.WALKING
  });

renderer.setDirections(response);
state.currentRenderer = renderer;

// NUEVO AUTOFOCUS
focusRoute(response);

  const leg = response.routes?.[0]?.legs?.[0];
  if (leg) updateDirectionsList(leg.steps || []);
}

async function showPlaceInfo(placeId) {
  const placeData = PLACE_DATA.find(item => item.id === placeId);
  const resolvedPlace = state.places.get(placeId);
  if (!placeData || !resolvedPlace) return;

  setPlaceMeta(placeData, resolvedPlace);

  if (resolvedPlace.photos?.length) {
    const photo = resolvedPlace.photos[0];
    setHeroPhoto(photo.getURI({ maxHeight: 900 }), `Photo of ${placeData.title}`);
    setPhotoAttribution(photo);
  } else {
    setHeroEmpty('No real photo was returned by Google Maps for this location.');
    el('placeMeta').classList.remove('hidden');
    el('photoAttribution').innerHTML = '';
  }
}

async function focusPlace(placeId) {
  const resolvedPlace = state.places.get(placeId);
  if (!resolvedPlace) return;

  state.activePlaceId = placeId;
  syncActiveButtons();
  state.map.panTo(resolvedPlace.location);

  setStatus('Loading image and route…');
  await showPlaceInfo(placeId);
  await drawRouteToPlace(placeId);
  setStatus('Route ready');
}

function setActiveGroup(groupKey) {
  state.activeGroup = groupKey;
  renderPlacesList();
  updateMarkerVisibility();
  syncActiveButtons();

  const items = groupPlaces(groupKey === 'all' ? 'red' : groupKey);
  if (groupKey !== 'all' && items.length) {
    state.presentationIndex = 0;
    syncCounter();
    focusPlace(items[0].id);
    return;
  }

  state.presentationIndex = -1;
  syncCounter();
  clearRoute();
  state.activePlaceId = null;
  updateDirectionsList([]);
  setHeroEmpty('Select a place to load the real image.');
  el('photoAttribution').innerHTML = '';
  el('placeMeta').classList.add('hidden');
  setDirectionsVisibility(false);
  setStatus('Ready');
}

function stepPresentation(direction) {
  const items = groupPlaces(state.activeGroup === 'all' ? 'red' : state.activeGroup);
  if (!items.length) return;

  let index = state.presentationIndex;
  if (index < 0) index = 0;
  else index = (index + direction + items.length) % items.length;

  state.presentationIndex = index;
  syncCounter();
  focusPlace(items[index].id);
}

function resetView() {
  clearRoute();
  state.activePlaceId = null;
  state.presentationIndex = state.activeGroup !== 'all' ? 0 : -1;
  syncCounter();
  syncActiveButtons();
  updateDirectionsList([]);
  setHeroEmpty('Select a place to load the real image.');
  el('photoAttribution').innerHTML = '';
  el('placeMeta').classList.add('hidden');
  setDirectionsVisibility(false);
  if (state.start?.location) {
    state.map.panTo(state.start.location);
    state.map.setZoom(16);
  }
  setStatus('Ready');
}

function bindUI() {
  el('toggleDirectionsBtn').addEventListener('click', () => setDirectionsVisibility(!state.directionsVisible));
  el('togglePlacesBtn').addEventListener('click', () => setPlacesVisibility(!state.placesListVisible));
  el('resetBtn').addEventListener('click', resetView);
  el('prevBtn').addEventListener('click', () => stepPresentation(-1));
  el('nextBtn').addEventListener('click', () => stepPresentation(1));
}

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    const key = window.APP_CONFIG?.GOOGLE_MAPS_API_KEY;
    if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') {
      reject(new Error('Missing Google Maps API key in config.js'));
      return;
    }

    if (window.google?.maps) {
      resolve();
      return;
    }

    window.initApp = async () => {
      try {
        await bootstrapApp();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initApp&v=weekly&libraries=maps,marker,places,routes`;
    script.onerror = () => reject(new Error('Google Maps JavaScript API failed to load.'));
    document.head.appendChild(script);
  });
}


function syncMapNavPosition() {
  const mapNav = el('mapNav');
  if (!mapNav || !state.map) return;

  const fullscreenElement = document.fullscreenElement;
  const mapIsFullscreen = fullscreenElement === el('map') || el('map').contains(fullscreenElement);

  if (mapIsFullscreen) {
    if (!state.mapNavControl) {
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-map-nav';
      wrapper.appendChild(mapNav);
      state.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(wrapper);
      state.mapNavControl = wrapper;
    } else if (!state.mapNavControl.contains(mapNav)) {
      state.mapNavControl.appendChild(mapNav);
    }
  } else {
    const stage = document.querySelector('.map-stage');
    if (stage && mapNav.parentElement !== stage) {
      stage.appendChild(mapNav);
    }
  }
}

function bindFullscreenPersistence() {
  if (state.fullscreenHandlerBound) return;
  document.addEventListener('fullscreenchange', syncMapNavPosition);
  state.fullscreenHandlerBound = true;
}

async function bootstrapApp() {
  renderLegend();
  renderGroupButtons();
  renderPlacesList();
  syncCounter();
  setDirectionsVisibility(false);
  bindUI();

state.map = new google.maps.Map(el('map'), {
  center: { lat: 18.47186, lng: -69.88431 },
  zoom: 16,
  mapId: 'DEMO_MAP_ID',
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeControl: false,

  styles: [
    { elementType: "geometry", stylers: [{ color: "#0b0b0b" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0b" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#aaaaaa" }] },

    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1a1a1a" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }]
    },

    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#121212" }]
    },

    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1f1f1f" }]
    },

    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }]
    },

    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [{ color: "#777777" }]
    }
  ]
});

  bindFullscreenPersistence();
  syncMapNavPosition();

  state.geocoder = new google.maps.Geocoder();
  state.directionsService = new google.maps.DirectionsService();

  try {
    const startLocation = await geocodeQuery(START.query);
    state.start = { ...START, location: startLocation };
    await createStartMarker();
    await loadPlaces();
  } catch (error) {
    console.error(error);
    setStatus('Error');
    setHeroEmpty('The map loaded, but Google Maps could not resolve the start point. Check your API key and enabled services.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadGoogleMapsScript();
  } catch (error) {
    console.error(error);
    setStatus('Error');
    setHeroEmpty('Add a valid Google Maps API key in config.js and enable Maps JavaScript API, Places API, and Directions API.');
  }
});
