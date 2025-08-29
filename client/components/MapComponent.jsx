import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ className = "", fromLocation, toLocation, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Calculate and display route
  useEffect(() => {
    const calculateRoute = async () => {
      if (!fromLocation || !toLocation || !mapInstanceRef.current) return;

      setIsLoading(true);

      try {
        // Geocode from and to locations
        const fromCoords = await geocodeLocation(fromLocation);
        const toCoords = await geocodeLocation(toLocation);

        if (!fromCoords || !toCoords) {
          console.error('Could not geocode one or both locations');
          setIsLoading(false);
          return;
        }

        // Remove existing routing control
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        // Create new routing control with better styling
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(fromCoords.lat, fromCoords.lng),
            L.latLng(toCoords.lat, toCoords.lng)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          createMarker: function(i, waypoint, n) {
            let iconColor = '#3b82f6'; // Blue color
            let iconHtml = '';
            
            if (i === 0) {
              // Start marker - Green
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
              // End marker - Red
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
          },
          lineOptions: {
            styles: [
              // Shadow line for depth
              { 
                color: '#000000', 
                weight: 8, 
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round'
              },
              // Main route line
              { 
                color: '#3b82f6', 
                weight: 6, 
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }
            ]
          },
          show: false, // Hide the default instruction panel
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          })
        }).on('routesfound', function(e) {
          const routes = e.routes;
          const summary = routes[0].summary;
          
          // Convert time from seconds to minutes
          const timeInMinutes = Math.round(summary.totalTime / 60);
          const distanceInKm = (summary.totalDistance / 1000).toFixed(1);
          
          // Call the callback with route information
          if (onRouteCalculated) {
            onRouteCalculated({
              distance: `${distanceInKm} km`,
              duration: `${timeInMinutes} mins`,
              instructions: routes[0].instructions
            });
          }
          
          setIsLoading(false);
        }).on('routingerror', function(e) {
          console.error('Routing error:', e);
          setIsLoading(false);
        }).addTo(mapInstanceRef.current);

        // Fit map bounds to show the route with padding
        const bounds = L.latLngBounds([
          [fromCoords.lat, fromCoords.lng],
          [toCoords.lat, toCoords.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 // Prevent zooming too close
        });

      } catch (error) {
        console.error('Route calculation error:', error);
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent rapid recalculation
    const timeoutId = setTimeout(calculateRoute, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fromLocation, toLocation]); // Removed onRouteCalculated from dependencies to prevent loops

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
    </div>
  );
};

export default MapComponent;