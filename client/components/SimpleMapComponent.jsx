import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import SimpleCarAnimation from './SimpleCarAnimation';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SimpleMapComponent = ({ fromLocation, toLocation, onRouteCalculated, showCarAnimation = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [route, setRoute] = useState([]);
  const [trafficLights, setTrafficLights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([28.6139, 77.2090], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Geocode location names to coordinates
  const geocodeLocation = async (locationName) => {
    if (!locationName) return null;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // Get real route using OSRM API
  const getRealRoute = async (fromCoords, toCoords) => {
    try {
      const fromStr = `${fromCoords.lng},${fromCoords.lat}`;
      const toStr = `${toCoords.lng},${toCoords.lat}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${fromStr};${toStr}?overview=full&geometries=geojson`;
      
      console.log('Fetching real route from OSRM:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        const coordinates = data.routes[0].geometry.coordinates;
        const routePoints = coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));
        
        console.log(`✅ Real route found with ${routePoints.length} points`);
        return {
          points: routePoints,
          distance: (data.routes[0].distance / 1000).toFixed(1), // Convert to km
          duration: Math.round(data.routes[0].duration / 60) // Convert to minutes
        };
      } else {
        throw new Error('No route found in OSRM response');
      }
    } catch (error) {
      console.error('OSRM routing failed:', error);
      return null;
    }
  };

  // Fallback: Generate curved route (better than straight line)
  const generateCurvedRoute = (from, to) => {
    console.log('🔄 Using fallback curved route generation');
    
    const steps = 15;
    const latStep = (to.lat - from.lat) / steps;
    const lngStep = (to.lng - from.lng) / steps;
    
    const routePoints = [];
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Add some curve to make it look more like a road
      const curve = Math.sin(progress * Math.PI) * 0.002; // Small curve
      const randomOffset = (Math.random() - 0.5) * 0.001; // Small random variation
      
      routePoints.push({
        lat: from.lat + (latStep * i) + curve + randomOffset,
        lng: from.lng + (lngStep * i) + randomOffset
      });
    }
    
    // Calculate approximate distance
    const distance = Math.sqrt(
      Math.pow((to.lat - from.lat) * 111, 2) + 
      Math.pow((to.lng - from.lng) * 85, 2)
    );
    
    return {
      points: routePoints,
      distance: distance.toFixed(1),
      duration: Math.round(distance * 2.5) // Approximate city driving time
    };
  };

  const createTrafficLight = (lat, lng) => {
    const states = ['red', 'yellow', 'green'];
    const timers = { red: 30, yellow: 5, green: 25 }; // seconds
    
    let currentState = states[Math.floor(Math.random() * states.length)];
    let timeRemaining = timers[currentState];
    
    const getStateColor = (state) => {
      switch(state) {
        case 'red': return '#ff0000';
        case 'yellow': return '#ffff00'; 
        case 'green': return '#00ff00';
        default: return '#ff0000';
      }
    };

    const updateHTML = () => `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #000;
        border-radius: 8px;
        padding: 4px;
        border: 2px solid #333;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        <div style="
          width: 16px;
          height: 16px;
          background: ${getStateColor(currentState)};
          border-radius: 50%;
          border: 1px solid white;
          box-shadow: 0 0 8px ${getStateColor(currentState)};
          margin-bottom: 2px;
        "></div>
        <div style="
          background: #222;
          color: white;
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 9px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
          border: 1px solid #555;
        ">${timeRemaining}s</div>
      </div>
    `;

    const icon = L.divIcon({
      html: updateHTML(),
      iconSize: [24, 35],
      iconAnchor: [12, 17],
      className: 'traffic-light-marker'
    });

    const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);

    // Update timer every second
    const interval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Change state
        const currentIndex = states.indexOf(currentState);
        currentState = states[(currentIndex + 1) % states.length];
        timeRemaining = timers[currentState];
      }
      
      // Update marker icon
      marker.setIcon(L.divIcon({
        html: updateHTML(),
        iconSize: [24, 35],
        iconAnchor: [12, 17],
        className: 'traffic-light-marker'
      }));
    }, 1000);

    // Store interval for cleanup
    marker._trafficInterval = interval;
    
    return marker;
  };

  useEffect(() => {
    if (!fromLocation || !toLocation || !mapInstanceRef.current) return;

    const calculateRoute = async () => {
      setIsLoading(true);

      // Clear previous route and markers
      if (routeLineRef.current) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
      }
      markersRef.current.forEach(marker => {
        // Clear traffic light timers
        if (marker._trafficInterval) {
          clearInterval(marker._trafficInterval);
        }
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      try {
        // Try to geocode the locations
        console.log(`Geocoding: ${fromLocation} → ${toLocation}`);
        
        let fromCoords = await geocodeLocation(fromLocation);
        let toCoords = await geocodeLocation(toLocation);

        // Fallback to default coordinates if geocoding fails
        if (!fromCoords) {
          console.log('Using fallback coordinates for from location');
          fromCoords = { lat: 28.6139, lng: 77.2090, name: fromLocation }; // Delhi
        }
        if (!toCoords) {
          console.log('Using fallback coordinates for to location');  
          toCoords = { lat: 28.5355, lng: 77.3910, name: toLocation }; // Noida
        }

        console.log('From:', fromCoords);
        console.log('To:', toCoords);

        // Try to get real route first
        let routeData = await getRealRoute(fromCoords, toCoords);
        
        // If real route fails, use curved fallback
        if (!routeData) {
          console.log('⚠️ Real routing failed, using curved fallback');
          routeData = generateCurvedRoute(fromCoords, toCoords);
        }

        const routePoints = routeData.points;
        setRoute(routePoints);

        console.log(`📍 Route created with ${routePoints.length} points`);

        // Draw route line
        routeLineRef.current = L.polyline(
          routePoints.map(p => [p.lat, p.lng]), 
          { 
            color: '#3b82f6', 
            weight: 4, 
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }
        ).addTo(mapInstanceRef.current);

        // Add start marker
        const startMarker = L.marker([fromCoords.lat, fromCoords.lng], {
          icon: L.divIcon({
            html: `<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 20]
          })
        }).bindPopup(`<strong>From:</strong> ${fromLocation}<br><small>${fromCoords.name || 'Unknown location'}</small>`)
          .addTo(mapInstanceRef.current);
        markersRef.current.push(startMarker);

        // Add end marker
        const endMarker = L.marker([toCoords.lat, toCoords.lng], {
          icon: L.divIcon({
            html: `<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 20]
          })
        }).bindPopup(`<strong>To:</strong> ${toLocation}<br><small>${toCoords.name || 'Unknown location'}</small>`)
          .addTo(mapInstanceRef.current);
        markersRef.current.push(endMarker);

        // Place traffic lights along the route
        const numLights = Math.min(Math.max(2, Math.floor(routePoints.length / 4)), 8);
        const trafficLightPositions = [];
        
        for (let i = 0; i < numLights; i++) {
          const lightIndex = Math.floor((routePoints.length / (numLights + 1)) * (i + 1));
          if (lightIndex < routePoints.length - 1) {
            trafficLightPositions.push({
              index: lightIndex,
              position: routePoints[lightIndex]
            });
          }
        }
        
        // Create traffic lights at calculated positions
        trafficLightPositions.forEach((lightPos, index) => {
          const light = createTrafficLight(lightPos.position.lat, lightPos.position.lng);
          markersRef.current.push(light);
        });

        // Fit map to route
        mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), {
          padding: [20, 20]
        });
  const analyzeRouteType = (routePoints, fromCoords, toCoords) => {
    // Calculate total distance
    const totalDistance = Math.sqrt(
      Math.pow((toCoords.lat - fromCoords.lat) * 111, 2) + 
      Math.pow((toCoords.lng - fromCoords.lng) * 85, 2)
    );
    
    // Calculate route density (points per km)
    const pointDensity = routePoints.length / totalDistance;
    
    // Determine route type based on distance and point density
    const isCity = totalDistance < 30 || pointDensity > 15; // Short distance or high detail = city
    const isHighway = totalDistance > 100 && pointDensity < 8; // Long distance and low detail = highway
    
    console.log(`📊 Route analysis: ${totalDistance.toFixed(1)}km, ${pointDensity.toFixed(1)} points/km`);
    
    if (isHighway) {
      console.log('🛣️ Highway route detected - fewer traffic lights');
      return 'highway';
    } else if (isCity) {
      console.log('🏙️ City route detected - more traffic lights');
      return 'city';
    } else {
      console.log('🌆 Mixed route detected - moderate traffic lights');
      return 'mixed';
    }
  };

  // Smart traffic light placement based on route type
  const placeTrafficLights = (routePoints, routeType) => {
    let numLights, minInterval, maxInterval;
    
    switch (routeType) {
      case 'city':
        // City: More frequent traffic lights (every 0.5-1km)
        numLights = Math.min(Math.max(4, Math.floor(routePoints.length / 2.5)), 15);
        minInterval = 2; // Minimum points between lights
        maxInterval = 4; // Maximum points between lights
        console.log(`🚦 Placing ${numLights} city traffic lights`);
        break;
        
      case 'highway':
        // Highway: Fewer traffic lights (every 5-10km at intersections)
        numLights = Math.min(Math.max(1, Math.floor(routePoints.length / 12)), 4);
        minInterval = 8; // More spacing between lights
        maxInterval = 15;
        console.log(`🛣️ Placing ${numLights} highway traffic lights`);
        break;
        
      case 'mixed':
      default:
        // Mixed: Moderate traffic lights
        numLights = Math.min(Math.max(2, Math.floor(routePoints.length / 5)), 8);
        minInterval = 4;
        maxInterval = 8;
        console.log(`🌆 Placing ${numLights} mixed route traffic lights`);
        break;
    }
    
    const lights = [];
    const usedIndices = new Set();
    
    // Place lights with smart spacing
    for (let i = 0; i < numLights; i++) {
      let attempts = 0;
      let lightIndex;
      
      do {
        // Try to place lights evenly but with some randomness
        const basePosition = (routePoints.length / (numLights + 1)) * (i + 1);
        const randomOffset = (Math.random() - 0.5) * (maxInterval - minInterval);
        lightIndex = Math.floor(basePosition + randomOffset);
        
        // Ensure light is within bounds and not too close to others
        lightIndex = Math.max(minInterval, Math.min(routePoints.length - minInterval, lightIndex));
        attempts++;
      } while (usedIndices.has(lightIndex) && attempts < 10);
      
      // Check minimum distance from other lights
      let tooClose = false;
      for (const usedIndex of usedIndices) {
        if (Math.abs(lightIndex - usedIndex) < minInterval) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose && lightIndex < routePoints.length - 1) {
        usedIndices.add(lightIndex);
        lights.push({
          index: lightIndex,
          position: routePoints[lightIndex]
        });
      }
    }
    
    return lights.sort((a, b) => a.index - b.index);
  };

        // Fit map to route
        mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), {
          padding: [20, 20]
        });

        // Call route calculated callback with real data
        if (onRouteCalculated) {
          onRouteCalculated({
            distance: `${routeData.distance} km`,
            duration: `${routeData.duration} mins`,
            startCarAnimation: () => {},
            stopCarAnimation: () => {}
          });
        }

      } catch (error) {
        console.error('Route calculation error:', error);
        
        // Even if everything fails, show a basic curved route
        console.log('🚨 All routing failed, creating emergency fallback route');
        const emergencyRoute = generateCurvedRoute(
          { lat: 28.6139, lng: 77.2090, name: fromLocation }, 
          { lat: 28.5355, lng: 77.3910, name: toLocation }
        );
        
        setRoute(emergencyRoute.points);
        
        const routeLine = L.polyline(
          emergencyRoute.points.map(p => [p.lat, p.lng]), 
          { color: '#ef4444', weight: 4, opacity: 0.8 }
        ).addTo(mapInstanceRef.current);
        
        routeLineRef.current = routeLine;
      }

      setIsLoading(false);
    };

    // Add delay to prevent rapid recalculation
    const timeoutId = setTimeout(calculateRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [fromLocation, toLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <div className="font-medium text-gray-900">Calculating route...</div>
                <div className="text-sm text-gray-500">Finding the best path along real roads</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCarAnimation && route.length > 0 && (
        <SimpleCarAnimation
          map={mapInstanceRef.current}
          route={route}
          isActive={showCarAnimation}
          speed={50}
        />
      )}
    </div>
  );
};

export default SimpleMapComponent;
