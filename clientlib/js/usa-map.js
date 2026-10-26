
(function () {
  'use strict';

  const STATES = {
    "01": ["AL", "Alabama"],
    "02": ["AK", "Alaska"],
    "04": ["AZ", "Arizona"],
    "05": ["AR", "Arkansas"],
    "06": ["CA", "California"],
    "08": ["CO", "Colorado"],
    "09": ["CT", "Connecticut"],
    "10": ["DE", "Delaware"],
    "12": ["FL", "Florida"],
    "13": ["GA", "Georgia"],
    "15": ["HI", "Hawaii"],
    "16": ["ID", "Idaho"],
    "17": ["IL", "Illinois"],
    "18": ["IN", "Indiana"],
    "19": ["IA", "Iowa"],
    "20": ["KS", "Kansas"],
    "21": ["KY", "Kentucky"],
    "22": ["LA", "Louisiana"],
    "23": ["ME", "Maine"],
    "24": ["MD", "Maryland"],
    "25": ["MA", "Massachusetts"],
    "26": ["MI", "Michigan"],
    "27": ["MN", "Minnesota"],
    "28": ["MS", "Mississippi"],
    "29": ["MO", "Missouri"],
    "30": ["MT", "Montana"],
    "31": ["NE", "Nebraska"],
    "32": ["NV", "Nevada"],
    "33": ["NH", "New Hampshire"],
    "34": ["NJ", "New Jersey"],
    "35": ["NM", "New Mexico"],
    "36": ["NY", "New York"],
    "37": ["NC", "North Carolina"],
    "38": ["ND", "North Dakota"],
    "39": ["OH", "Ohio"],
    "40": ["OK", "Oklahoma"],
    "41": ["OR", "Oregon"],
    "42": ["PA", "Pennsylvania"],
    "44": ["RI", "Rhode Island"],
    "45": ["SC", "South Carolina"],
    "46": ["SD", "South Dakota"],
    "47": ["TN", "Tennessee"],
    "48": ["TX", "Texas"],
    "49": ["UT", "Utah"],
    "50": ["VT", "Vermont"],
    "51": ["VA", "Virginia"],
    "53": ["WA", "Washington"],
    "54": ["WV", "West Virginia"],
    "55": ["WI", "Wisconsin"],
    "56": ["WY", "Wyoming"]
  };

  const ATLAS_URL =
    'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

  const DEFAULT_ENDPOINT =
    '';

  // Share external library loads across map instances.
  const scriptPromises = new Map();

  function loadScript(src) {
    if (scriptPromises.has(src)) {
      return scriptPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    scriptPromises.set(src, promise);
    return promise;
  }

  async function ensureLibraries() {
    if (!window.d3) {
      await loadScript(
        'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'
      );
    }

    if (!window.topojson) {
      await loadScript(
        'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js'
      );
    }
  }

  function getConfig(root) {
    return {
      endpoint: root.dataset.countsUrl || DEFAULT_ENDPOINT,
      sourceType: root.dataset.sourceType || 'rest',
      stateField: root.dataset.stateField || 'state',
      valueField: root.dataset.valueField || 'count',
      metricLabel: root.dataset.metricLabel || 'Submissions',
      showStatistics: root.dataset.showStatistics !== 'false',
      enableDrilldown: root.dataset.enableDrilldown === 'true',
      drilldownEndpoint: root.dataset.drilldownEndpoint || '',
      showTooltips: root.dataset.showTooltips !== 'false'
    };
  }

  
function validateEndpoint(endpoint) {
  if (!endpoint || !endpoint.trim()) {
    throw new Error('REST API endpoint is required');
  }

  const url = new URL(endpoint.trim(), window.location.origin);

  if (url.username || url.password) {
    throw new Error('Credentials in URLs are not supported');
  }

  if (
    url.protocol !== 'https:' &&
    !(url.origin === window.location.origin &&
      url.protocol === 'http:')
  ) {
    throw new Error('External REST APIs must use HTTPS');
  }

  return url.href;
}


  function normalizeData(data, config) {
    // Supports:
    // { states: [{ state: "CA", count: 8 }] }
    // { states: [{ state: "CA", value: 8 }] }
    // { states: [{ code: "CA", customers: 8 }] }
    // [{ state: "CA", count: 8 }]

    const rows = Array.isArray(data)
      ? data
      : data.states;

    if (!Array.isArray(rows)) {
      throw new Error('Expected a state data array');
    }

    const counts = {};

    rows.forEach(row => {
      const state = String(
        row[config.stateField] || ''
      ).trim().toUpperCase();

      const value = Number(row[config.valueField]);

      if (
        /^[A-Z]{2}$/.test(state) &&
        Number.isFinite(value)
      ) {
        counts[state] = value;
      }
    });

    return counts;
  }

  function updateStatistics(root, counts, config) {
    if (!config.showStatistics) return;

    const values = Object.values(counts);
    const total = values.reduce((sum, value) => sum + value, 0);

    const represented = values.filter(value => value > 0).length;

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    const topState = sorted.length && sorted[0][1] > 0
      ? sorted[0][0]
      : '--';

    const totalElement = root.querySelector('[data-stat="total"]');
    const statesElement = root.querySelector('[data-stat="states"]');
    const topElement = root.querySelector('[data-stat="top"]');

    if (totalElement) totalElement.textContent = total;
    if (statesElement) statesElement.textContent = represented;
    if (topElement) topElement.textContent = topState;
  }

  async function initializeMap(root) {
    const container = root.querySelector('.usa-map-container');
    const details = root.querySelector('.usa-state-details');
    const errorBox = root.querySelector('.usa-map-error');
    const config = getConfig(root);

    try {
      const endpoint = validateEndpoint(config.endpoint);

      const response = await fetch(endpoint, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Data API returned ' + response.status);
      }

      const data = await response.json();
      const counts = normalizeData(data, config);

      updateStatistics(root, counts, config);

      await ensureLibraries();

      const atlasResponse = await fetch(ATLAS_URL);

      if (!atlasResponse.ok) {
        throw new Error('Unable to load USA geography');
      }

      const atlas = await atlasResponse.json();

      const features = window.topojson.feature(
        atlas,
        atlas.objects.states
      ).features.filter(feature =>
        STATES[String(feature.id).padStart(2, '0')]
      );

      const width = 975;
      const height = 610;

      const projection = window.d3.geoAlbersUsa()
        .fitSize([width - 30, height - 30], {
          type: 'FeatureCollection',
          features
        });

      const path = window.d3.geoPath(projection);

      const maxValue = Math.max(
        1,
        ...Object.values(counts)
      );

      const color = window.d3.scaleSequential()
        .domain([0, maxValue])
        .interpolator(window.d3.interpolateBlues);

      container.textContent = '';

      const svg = window.d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'group')
        .attr('aria-label', 'Interactive United States map');

      function selectState(feature) {
        const [code, name] = STATES[
          String(feature.id).padStart(2, '0')
        ];

        const value = counts[code] || 0;

        details.textContent =
          `${name} (${code}): ${value} ${config.metricLabel}`;

        // Drill-down will be implemented separately.
        // Do not fetch submission details until the
        // AEM endpoint enforces user authorization.
        if (config.enableDrilldown) {
          details.dataset.selectedState = code;
        }
      }

      svg.selectAll('path')
        .data(features)
        .join('path')
        .attr('d', path)
        .attr('fill', feature => {
          const code = STATES[
            String(feature.id).padStart(2, '0')
          ][0];

          return counts[code] > 0
            ? color(counts[code])
            : '#e5e7eb';
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.2)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', feature => {
          const [code, name] = STATES[
            String(feature.id).padStart(2, '0')
          ];

          return `${name}: ${counts[code] || 0} ${config.metricLabel}`;
        })
        .each(function (feature) {
          if (!config.showTooltips) return;

          const [code, name] = STATES[
            String(feature.id).padStart(2, '0')
          ];

          window.d3.select(this)
            .append('title')
            .text(
              `${name}: ${counts[code] || 0} ${config.metricLabel}`
            );
        })
        .on('click', (event, feature) => {
          selectState(feature);
        })
        .on('keydown', (event, feature) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectState(feature);
          }
        });

    } catch (error) {
      console.error('USA map initialization failed:', error);

      container.textContent = '';

      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent =
          'Unable to load USA map data.';
      }
    }
  }

  function initializeAll() {
    document.querySelectorAll('.usa-forms-dashboard')
      .forEach(root => {
        if (root.dataset.initialized === 'true') return;
        root.dataset.initialized = 'true';
        initializeMap(root);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    initializeAll();
  }
})();
