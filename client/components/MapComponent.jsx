import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import CarAnimation from './CarAnimation';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ className = "", fromLocation, toLocation, onRouteCalculated, showCarAnimation = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const trafficLightsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [carAnimationActive, setCarAnimationActive] = useState(false);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        preferCanvas: true, // Better performance for route rendering
        zoomControl: true,
        attributionControl: true
      }).setView([28.6139, 77.2090], 11); // Default to Delhi

      // Add OpenStreetMap tiles with better contrast
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        className: 'map-tiles' // For potential CSS styling
      }).addTo(mapInstanceRef.current);

      // Position zoom controls
      mapInstanceRef.current.zoomControl.setPosition('topright');
    }

    return () => {
      if (mapInstanceRef.current) {
        // Clear traffic lights before removing map
        clearTrafficLights();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to geocode location names to coordinates
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

  // Function to create traffic light marker with red, yellow, green dots
  const createTrafficLight = (lat, lng) => {
    // Random initial timer between 5-35 seconds (city timing)
    const randomTimer = Math.floor(Math.random() * 31) + 5;
    let timer = randomTimer;
    
    // Only use red, yellow, green states
    const states = ['red', 'yellow', 'green'];
    let currentState = states[Math.floor(Math.random() * states.length)];
    let timerInterval;

    // Create traffic light object with status info for car animation
    const trafficLightData = {
      lat: lat,
      lng: lng,
      status: currentState,
      timer: timer,
      marker: null
    };

    // Standard traffic light colors only
    const getStateColor = (state) => {
      switch(state) {
        case 'red': return '#ff0000';
        case 'yellow': return '#ffff00';
        case 'green': return '#00ff00';
        default: return '#ff0000';
      }
    };

    const updateTrafficLightHTML = () => {
      const activeColor = getStateColor(currentState);
      return `
        <div class="traffic-light-container" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #000;
          border-radius: 8px;
          padding: 6px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.7);
          border: 2px solid #333;
        ">
          <div class="traffic-light-dot" style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${activeColor};
            box-shadow: 0 0 12px ${activeColor}, 0 0 20px ${activeColor}40;
            border: 2px solid #fff;
            animation: pulse 2s infinite;
          "></div>
          <div class="timer" style="
            background: #000;
            color: white;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 4px;
            min-width: 22px;
            text-align: center;
            border: 1px solid #444;
          ">${timer}s</div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        </style>
      `;
    };

    const trafficLightIcon = L.divIcon({
      html: updateTrafficLightHTML(),
      iconSize: [30, 50],
      iconAnchor: [15, 25],
      className: 'traffic-light-marker'
    });

    const marker = L.marker([lat, lng], { icon: trafficLightIcon }).addTo(mapInstanceRef.current);
    trafficLightData.marker = marker;

    const updateTimer = () => {
      timer--;
      if (timer <= 0) {
        // Change to next state with city-style traffic light timers
        const stateTimers = {
          'red': Math.floor(Math.random() * 15) + 20, // 20-35 seconds (city red)
          'yellow': Math.floor(Math.random() * 2) + 3, // 3-4 seconds (city yellow)  
          'green': Math.floor(Math.random() * 10) + 15 // 15-25 seconds (city green)
        };
        
        if (currentState === 'red') {
          currentState = 'green';
        } else if (currentState === 'green') {
          currentState = 'yellow';
        } else {
          currentState = 'red';
        }
        
        timer = stateTimers[currentState];
        
        // Update traffic light data for car animation
        trafficLightData.status = currentState;
        trafficLightData.timer = timer;
        
        // Update the marker with new HTML
        marker.setIcon(L.divIcon({
          html: updateTrafficLightHTML(),
          iconSize: [30, 50],
          iconAnchor: [15, 25],
          className: 'traffic-light-marker'
        }));
      } else {
        // Update timer in traffic light data
        trafficLightData.timer = timer;
        
        // Just update the timer display
        marker.setIcon(L.divIcon({
          html: updateTrafficLightHTML(),
          iconSize: [30, 50],
          iconAnchor: [15, 25],
          className: 'traffic-light-marker'
        }));
      }
    };

    // Start the timer
    timerInterval = setInterval(updateTimer, 1000);

    // Store reference for cleanup
    if (trafficLightsRef.current) {
      trafficLightsRef.current.push({ 
        marker, 
        interval: timerInterval, 
        data: trafficLightData 
      });
    }

    return trafficLightData;
  };

  // Function to clear traffic lights
  const clearTrafficLights = () => {
    trafficLightsRef.current.forEach(light => {
      if (light.interval) {
        clearInterval(light.interval);
      }
      if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(light.marker)) {
        mapInstanceRef.current.removeLayer(light.marker);
      }
    });
    trafficLightsRef.current = [];
  };

  // Function to find intersections along route with random spacing
  const findIntersectionsOnRoute = (route) => {
    const intersections = [];
    
    try {
      // Get route coordinates from the route geometry
      let coordinates = null;
      
      // Try different ways to access coordinates based on OSRM response structure
      if (route.coordinates && route.coordinates.length > 0) {
        coordinates = route.coordinates;
      } else if (route.geometry && route.geometry.coordinates) {
        coordinates = route.geometry.coordinates;
      } else if (route.waypoints && route.waypoints.length > 0) {
        // Fallback: create simple path between waypoints
        coordinates = route.waypoints.map(wp => [wp.location[0], wp.location[1]]);
      }
      
      if (coordinates && coordinates.length > 0) {
        // Calculate total route distance first
        let totalRouteDistance = 0;
        for (let i = 1; i < coordinates.length; i++) {
          const prevCoord = coordinates[i - 1];
          const currentCoord = coordinates[i];
          
          const prevLat = Array.isArray(prevCoord) ? prevCoord[1] : prevCoord.lat;
          const prevLng = Array.isArray(prevCoord) ? prevCoord[0] : prevCoord.lng;
          const currentLat = Array.isArray(currentCoord) ? currentCoord[1] : currentCoord.lat;
          const currentLng = Array.isArray(currentCoord) ? currentCoord[0] : currentCoord.lng;
          
          const distance = L.latLng(prevLat, prevLng).distanceTo(
            L.latLng(currentLat, currentLng)
          );
          totalRouteDistance += distance;
        }

        // Determine number of traffic lights based on route length (every 500-800m)
        const avgSpacing = 650; // meters
        const numTrafficLights = Math.max(3, Math.min(12, Math.floor(totalRouteDistance / avgSpacing)));
        
        // Calculate equal spacing intervals
        const equalSpacing = totalRouteDistance / (numTrafficLights + 1);
        
        let accumulatedDistance = 0;
        let nextTarget = equalSpacing;
        let trafficLightIndex = 0;
        
        for (let i = 1; i < coordinates.length && trafficLightIndex < numTrafficLights; i++) {
          const prevCoord = coordinates[i - 1];
          const currentCoord = coordinates[i];
          
          // Handle both [lng, lat] and [lat, lng] formats
          const prevLat = Array.isArray(prevCoord) ? prevCoord[1] : prevCoord.lat;
          const prevLng = Array.isArray(prevCoord) ? prevCoord[0] : prevCoord.lng;
          const currentLat = Array.isArray(currentCoord) ? currentCoord[1] : currentCoord.lat;
          const currentLng = Array.isArray(currentCoord) ? currentCoord[0] : currentCoord.lng;
          
          // Calculate distance between points using Leaflet's distance function
          const distance = L.latLng(prevLat, prevLng).distanceTo(
            L.latLng(currentLat, currentLng)
          );
          
          accumulatedDistance += distance;
          
          // Add intersection when we reach the target distance
          if (accumulatedDistance >= nextTarget) {
            intersections.push({
              lat: currentLat,
              lng: currentLng
            });
            trafficLightIndex++;
            nextTarget += equalSpacing; // Next equally spaced target
          }
        }
        
        // Ensure we have at least one traffic light near the middle if none were added
        if (intersections.length === 0 && coordinates.length > 0) {
          const middleIndex = Math.floor(coordinates.length / 2);
          const middleCoord = coordinates[middleIndex];
          const lat = Array.isArray(middleCoord) ? middleCoord[1] : middleCoord.lat;
          const lng = Array.isArray(middleCoord) ? middleCoord[0] : middleCoord.lng;
          intersections.push({ lat, lng });
        }
        
        // Remove the max lights limitation since we're calculating optimal distribution
        console.log(`Total route distance: ${(totalRouteDistance/1000).toFixed(2)}km`);
        console.log(`Planned ${numTrafficLights} traffic lights with ${(equalSpacing).toFixed(0)}m spacing`);
        console.log(`Actually placed ${intersections.length} traffic lights evenly distributed`);
      }
    } catch (error) {
      console.error('Error finding intersections:', error);
    }
    
    console.log(`Generated ${intersections.length} evenly distributed city traffic lights`);
    return intersections;
  };

  // Calculate and display route
  useEffect(() => {
    const calculateRoute = async () => {
      if (!fromLocation || !toLocation || !mapInstanceRef.current) return;

      setIsLoading(true);

      try {
        // Geocode from and to locations
        let fromCoords = await geocodeLocation(fromLocation);
        let toCoords = await geocodeLocation(toLocation);

        // Fallback coordinates if geocoding fails
        if (!fromCoords) {
          console.log('Using fallback coordinates for from location');
          fromCoords = { lat: 28.6139, lng: 77.2090, name: fromLocation }; // Delhi
        }
        if (!toCoords) {
          console.log('Using fallback coordinates for to location');
          toCoords = { lat: 28.5355, lng: 77.3910, name: toLocation }; // Noida
        }

        // Remove existing routing control
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        // Clear existing traffic lights
        clearTrafficLights();

        // Create fake route data for demo when OSRM fails
        const createFakeRouteData = () => {
          const steps = 15;
          const latStep = (toCoords.lat - fromCoords.lat) / steps;
          const lngStep = (toCoords.lng - fromCoords.lng) / steps;
          
          const coordinates = [];
          for (let i = 0; i <= steps; i++) {
            coordinates.push({
              lat: fromCoords.lat + (latStep * i) + (Math.random() - 0.5) * 0.002,
              lng: fromCoords.lng + (lngStep * i) + (Math.random() - 0.5) * 0.002
            });
          }
          
          // Create fake intersections for traffic lights
          const intersections = [];
          for (let i = 3; i < coordinates.length - 3; i += 3) {
            intersections.push(coordinates[i]);
          }
          
          return { coordinates, intersections };
        };

        // Try OSRM routing first, fallback to fake data
        let routeSuccess = false;
        
        try {
          // Create new routing control with better styling
          routingControlRef.current = L.Routing.control({
            waypoints: [
              L.latLng(fromCoords.lat, fromCoords.lng),
              L.latLng(toCoords.lat, toCoords.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            show: true,
            router: L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            lineOptions: {
              styles: [
                { 
                  color: '#3b82f6', 
                  weight: 5, 
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round'
                }
              ]
            },
            createMarker: function(i, waypoint, n) {
              let iconColor = '#3b82f6';
              let iconHtml = '';
              
              if (i === 0) {
                iconColor = '#10b981';
                iconHtml = `
                  <div style="
                    background-color: ${iconColor};
                    width: 24px;
                    height: 24px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                  ">
                    <div style="
                      width: 6px;
                      height: 6px;
                      background-color: white;
                      border-radius: 50%;
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%) rotate(45deg);
                    "></div>
                  </div>
                `;
              } else if (i === n - 1) {
                iconColor = '#ef4444';
                iconHtml = `
                  <div style="
                    background-color: ${iconColor};
                    width: 24px;
                    height: 24px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                  ">
                    <div style="
                      width: 6px;
                      height: 6px;
                      background-color: white;
                      border-radius: 50%;
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%) rotate(45deg);
                    "></div>
                  </div>
                `;
              }
              
              const customIcon = L.divIcon({
                html: iconHtml,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24],
                className: 'custom-route-marker'
              });
              
              const marker = L.marker(waypoint.latLng, {
                icon: customIcon,
                draggable: false
              });
              
              if (i === 0) {
                marker.bindPopup(`<strong>From:</strong> ${fromLocation}`, {
                  closeButton: false,
                  autoClose: false
                });
              } else if (i === n - 1) {
                marker.bindPopup(`<strong>To:</strong> ${toLocation}`, {
                  closeButton: false,
                  autoClose: false
                });
              }
              
              return marker;
            }
          }).on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            const route = routes[0];
            
            console.log('OSRM Route found:', route);
            routeSuccess = true;
            
            // Extract route coordinates for car animation
            let coordinates = [];
            if (route.coordinates && route.coordinates.length > 0) {
              coordinates = route.coordinates.map(coord => ({
                lat: coord[1],
                lng: coord[0]
              }));
            } else if (route.geometry && route.geometry.coordinates) {
              coordinates = route.geometry.coordinates.map(coord => ({
                lat: coord[1],
                lng: coord[0]
              }));
            }
            
            setRouteCoordinates(coordinates);
            
            const timeInMinutes = Math.round(summary.totalTime / 60);
            const distanceInKm = (summary.totalDistance / 1000).toFixed(1);
            
            clearTrafficLights();
            
            const intersections = findIntersectionsOnRoute(route);
            console.log('Found intersections:', intersections.length);
            
            intersections.forEach((intersection, index) => {
              const trafficLight = createTrafficLight(
                intersection.lat, 
                intersection.lng
              );
              console.log(`Created traffic light ${index + 1} at [${intersection.lat}, ${intersection.lng}]`);
            });
            
            if (showCarAnimation && coordinates.length > 0) {
              setCarAnimationActive(true);
            }
            
            if (onRouteCalculated) {
              onRouteCalculated({
                distance: `${distanceInKm} km`,
                duration: `${timeInMinutes} mins`,
                instructions: routes[0].instructions,
                startCarAnimation: () => setCarAnimationActive(true),
                stopCarAnimation: () => setCarAnimationActive(false)
              });
            }
            
            setIsLoading(false);
          }).on('routingerror', function(e) {
            console.error('OSRM Routing error:', e);
            routeSuccess = false;
            
            // Use fake route as fallback
            console.log('Using fake route data for demo');
            const fakeData = createFakeRouteData();
            
            // Remove the failed routing control
            if (routingControlRef.current) {
              mapInstanceRef.current.removeControl(routingControlRef.current);
            }
            
            // Create manual route line
            const routeLine = L.polyline(fakeData.coordinates.map(coord => [coord.lat, coord.lng]), {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.8
            }).addTo(mapInstanceRef.current);
            
            // Add manual markers
            const startMarker = L.marker([fromCoords.lat, fromCoords.lng], {
              icon: L.divIcon({
                html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 24]
              })
            }).addTo(mapInstanceRef.current);
            
            const endMarker = L.marker([toCoords.lat, toCoords.lng], {
              icon: L.divIcon({
                html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 24]
              })
            }).addTo(mapInstanceRef.current);
            
            setRouteCoordinates(fakeData.coordinates);
            
            // Add fake traffic lights
            fakeData.intersections.forEach((intersection, index) => {
              const trafficLight = createTrafficLight(intersection.lat, intersection.lng);
              console.log(`Created fake traffic light ${index + 1}`);
            });
            
            if (showCarAnimation && fakeData.coordinates.length > 0) {
              setCarAnimationActive(true);
            }
            
            // Calculate fake distance
            const fakeDistance = Math.sqrt(
              Math.pow((toCoords.lat - fromCoords.lat) * 111, 2) + 
              Math.pow((toCoords.lng - fromCoords.lng) * 111, 2)
            );
            
            if (onRouteCalculated) {
              onRouteCalculated({
                distance: `${fakeDistance.toFixed(1)} km (demo)`,
                duration: `${Math.round(fakeDistance * 2)} mins (demo)`,
                instructions: [],
                startCarAnimation: () => setCarAnimationActive(true),
                stopCarAnimation: () => setCarAnimationActive(false)
              });
            }
            
            setIsLoading(false);
          });
          
          // Add to map and try routing
          routingControlRef.current.addTo(mapInstanceRef.current);
          
        } catch (error) {
          console.error('Failed to create routing control:', error);
          
          // Fallback to fake data immediately
          console.log('Using immediate fake route data');
          const fakeData = createFakeRouteData();
          
          const routeLine = L.polyline(fakeData.coordinates.map(coord => [coord.lat, coord.lng]), {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.8
          }).addTo(mapInstanceRef.current);
          
          setRouteCoordinates(fakeData.coordinates);
          
          fakeData.intersections.forEach((intersection, index) => {
            createTrafficLight(intersection.lat, intersection.lng);
          });
          
          if (showCarAnimation && fakeData.coordinates.length > 0) {
            setCarAnimationActive(true);
          }
          
          setIsLoading(false);
        }

        // Fit map bounds
        const bounds = L.latLngBounds([
          [fromCoords.lat, fromCoords.lng],
          [toCoords.lat, toCoords.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15
        });

      } catch (error) {
        console.error('Route calculation error:', error);
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(calculateRoute, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fromLocation, toLocation]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full z-0" />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-700">Calculating route...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Car Animation Component */}
      {carAnimationActive && routeCoordinates.length > 0 && (
        <CarAnimation
          map={mapInstanceRef.current}
          route={routeCoordinates}
          trafficLights={trafficLightsRef.current.map(light => light.data)}
          isActive={carAnimationActive}
          speed={50} // 50 km/h default speed
          onAnimationComplete={() => {
            setCarAnimationActive(false);
            console.log('Car animation completed');
          }}
        />
      )}
    </div>
  );
};

export default MapComponent;