import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const SimpleCarAnimation = ({ map, route, isActive, speed = 50 }) => {
  const carMarkerRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const isWaitingRef = useRef(false);
  const currentSpeedRef = useRef(0.04); // Increased from 0.02 - faster but realistic
  const normalSpeed = 0.04; // Normal movement speed - doubled
  const slowSpeed = 0.02; // Slow speed for yellow light - doubled

  useEffect(() => {
    if (!map || !route || !isActive || route.length < 2) {
      return;
    }

    startAnimation();

    return () => {
      stopAnimation();
    };
  }, [map, route, isActive]);

  const createCarIcon = (rotation = 0) => {
    // Navigation2 icon SVG from Lucide
    const navigationSVG = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="3,11 22,2 13,21 11,13 3,11"></polygon>
      </svg>
    `;

    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transform: rotate(${rotation}deg);
          transition: transform 0.3s ease;
        ">${navigationSVG}</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'professional-car-marker'
    });
  };

  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const checkNearbyTrafficLights = (currentPos) => {
    // Get all traffic light markers from the map
    let nearestRedLight = null;
    let nearestYellowLight = null;
    let minRedDistance = Infinity;
    let minYellowDistance = Infinity;

    map.eachLayer((layer) => {
      if (layer.options && layer.options.icon && layer.options.icon.options.className === 'traffic-light-marker') {
        const lightPos = layer.getLatLng();
        const distance = Math.sqrt(
          Math.pow((lightPos.lat - currentPos.lat) * 111000, 2) + 
          Math.pow((lightPos.lng - currentPos.lng) * 85000, 2)
        );
        
        if (distance < 60) { // Within 60 meters - more realistic stopping distance
          const iconHtml = layer.options.icon.options.html;
          const isRed = iconHtml.includes('background: #ff0000');
          const isYellow = iconHtml.includes('background: #ffff00');
          
          if (isRed && distance < minRedDistance) {
            nearestRedLight = { distance, layer };
            minRedDistance = distance;
          }
          
          if (isYellow && distance < minYellowDistance) {
            nearestYellowLight = { distance, layer };
            minYellowDistance = distance;
          }
        }
      }
    });
    
    return {
      hasRedLight: nearestRedLight !== null,
      hasYellowLight: nearestYellowLight !== null,
      redDistance: minRedDistance,
      yellowDistance: minYellowDistance
    };
  };

  const startAnimation = () => {
    if (!route || route.length < 2) return;

    // Create car marker
    const startPoint = route[0];
    carMarkerRef.current = L.marker([startPoint.lat, startPoint.lng], {
      icon: createCarIcon(),
      zIndexOffset: 1000
    }).addTo(map);

    positionRef.current = 0;
    isWaitingRef.current = false;
    currentSpeedRef.current = normalSpeed;
    animate();
  };

  const animate = () => {
    if (!carMarkerRef.current || positionRef.current >= route.length - 1) {
      stopAnimation();
      return;
    }

    const currentPoint = route[Math.floor(positionRef.current)];
    const nextPoint = route[Math.floor(positionRef.current) + 1];

    if (currentPoint && nextPoint) {
      // Check for traffic lights
      const lightStatus = checkNearbyTrafficLights(currentPoint);
      
      if (lightStatus.hasRedLight && !isWaitingRef.current) {
        // Stop at red light
        isWaitingRef.current = true;
        currentSpeedRef.current = 0;
        console.log('🔴 Car stopped at red light');
        
        // Wait until light changes (check every second)
        const checkLight = () => {
          const updatedStatus = checkNearbyTrafficLights(currentPoint);
          if (!updatedStatus.hasRedLight) {
            isWaitingRef.current = false;
            currentSpeedRef.current = normalSpeed;
            console.log('🟢 Light changed - car continuing');
          } else {
            setTimeout(checkLight, 1000); // Check again in 1 second
          }
        };
        setTimeout(checkLight, 1000);
      } else if (lightStatus.hasYellowLight && !isWaitingRef.current) {
        // Slow down for yellow light
        currentSpeedRef.current = slowSpeed;
        console.log('🟡 Car slowing down for yellow light');
        
        // Resume normal speed after 3 seconds
        setTimeout(() => {
          if (!isWaitingRef.current) {
            currentSpeedRef.current = normalSpeed;
            console.log('🟢 Resuming normal speed after yellow');
          }
        }, 3000);
      } else if (!lightStatus.hasRedLight && !lightStatus.hasYellowLight && !isWaitingRef.current) {
        // Green light or no lights - normal speed
        currentSpeedRef.current = normalSpeed;
      }
      
      // Move the car if not stopped
      if (!isWaitingRef.current || currentSpeedRef.current > 0) {
        // Simple linear interpolation
        const progress = positionRef.current - Math.floor(positionRef.current);
        const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * progress;
        const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * progress;

        // Calculate bearing for rotation
        const bearing = calculateBearing(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng);
        
        // Update position and rotation
        carMarkerRef.current.setLatLng([lat, lng]);
        carMarkerRef.current.setIcon(createCarIcon(bearing));
        
        positionRef.current += currentSpeedRef.current; // Use current speed
      }
    }

    animationRef.current = setTimeout(animate, 120); // Faster update interval - reduced from 200ms to 120ms
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    if (carMarkerRef.current && map) {
      map.removeLayer(carMarkerRef.current);
      carMarkerRef.current = null;
    }
    isWaitingRef.current = false;
    currentSpeedRef.current = normalSpeed;
  };

  return null;
};

export default SimpleCarAnimation;
