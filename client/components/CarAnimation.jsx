import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Car icon SVG
const carIconSVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 20 20.55 20 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="#2563eb"/>
</svg>`;

// Simple Car Animation Controller
class SimpleCarController {
  constructor(map, route, trafficLights = [], options = {}) {
    this.map = map;
    this.route = route || [];
    this.trafficLights = trafficLights || [];
    this.options = {
      speed: options.speed || 50,
      updateInterval: 200,
      ...options
    };
    
    this.carMarker = null;
    this.isMoving = false;
    this.currentIndex = 0;
    this.animationInterval = null;
  }

  createCarIcon() {
    return L.divIcon({
      html: carIconSVG,
      className: 'car-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  start() {
    if (!this.route || this.route.length < 2) {
      console.log('No route available for animation');
      return;
    }

    this.isMoving = true;
    this.currentIndex = 0;

    // Create car at start position
    const startPos = this.route[0];
    this.carMarker = L.marker([startPos.lat, startPos.lng], {
      icon: this.createCarIcon(),
      zIndexOffset: 1000
    }).addTo(this.map);

    this.animate();
  }

  animate() {
    if (!this.isMoving || this.currentIndex >= this.route.length - 1) {
      this.stop();
      return;
    }

    const currentPos = this.route[this.currentIndex];
    const nextPos = this.route[this.currentIndex + 1];

    if (this.carMarker && currentPos && nextPos) {
      // Simple check for nearby traffic lights
      const nearbyLight = this.findNearbyTrafficLight(currentPos);
      if (nearbyLight && nearbyLight.status === 'red') {
        // Wait at red light
        console.log('Car waiting at red light');
        setTimeout(() => {
          this.continueAnimation();
        }, 2000); // Wait 2 seconds for demo
        return;
      }

      // Move car to next position
      this.carMarker.setLatLng([nextPos.lat, nextPos.lng]);
      this.currentIndex++;

      // Calculate bearing and rotate car
      const bearing = this.calculateBearing(currentPos, nextPos);
      this.updateCarRotation(bearing);
    }

    this.animationInterval = setTimeout(() => this.animate(), this.options.updateInterval);
  }

  continueAnimation() {
    if (this.isMoving) {
      this.animate();
    }
  }

  findNearbyTrafficLight(position) {
    return this.trafficLights.find(light => {
      const distance = this.calculateDistance(position, light);
      return distance < 0.001; // Very close for demo
    });
  }

  calculateDistance(pos1, pos2) {
    const lat1 = pos1.lat;
    const lon1 = pos1.lng;
    const lat2 = pos2.lat;
    const lon2 = pos2.lng;
    
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  }

  calculateBearing(pos1, pos2) {
    const lat1 = pos1.lat * Math.PI / 180;
    const lat2 = pos2.lat * Math.PI / 180;
    const deltaLon = (pos2.lng - pos1.lng) * Math.PI / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    return Math.atan2(y, x) * 180 / Math.PI;
  }

  updateCarRotation(bearing) {
    if (this.carMarker) {
      const element = this.carMarker.getElement();
      if (element) {
        const svg = element.querySelector('svg');
        if (svg) {
          svg.style.transform = `rotate(${bearing + 90}deg)`;
          svg.style.transition = 'transform 0.2s ease';
        }
      }
    }
  }

  stop() {
    this.isMoving = false;
    if (this.animationInterval) {
      clearTimeout(this.animationInterval);
    }
    if (this.carMarker && this.map) {
      this.map.removeLayer(this.carMarker);
      this.carMarker = null;
    }
    console.log('Car animation stopped');
  }

  setSpeed(speed) {
    this.options.speed = speed;
    this.options.updateInterval = Math.max(100, 300 - (speed * 2));
  }
}

const CarAnimation = ({ map, route, trafficLights, isActive, speed = 50, onAnimationComplete }) => {
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!map || !route || !isActive) return;

    console.log('Starting car animation with route:', route);

    // Create controller
    controllerRef.current = new SimpleCarController(map, route, trafficLights, { speed });
    
    // Start animation
    controllerRef.current.start();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
      }
    };
  }, [map, route, isActive, speed]);

  useEffect(() => {
    if (controllerRef.current && isActive) {
      controllerRef.current.setSpeed(speed);
    }
  }, [speed, isActive]);

  return null;
};

export default CarAnimation;
