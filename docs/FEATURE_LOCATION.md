# Location Features Implementation

## Overview
We have added location-based services to the Explore page, allowing users to find venues near them and get directions, similar to apps like Swiggy or Zomato.

## Features Added

### 1. User Geolocation ("Locate Me")
- **Functionality**: Users can click the "Locate Me" button in the Explore header.
- **Technology**: Uses the browser's native `navigator.geolocation` API.
- **Privacy**: Requests permission only when clicked.

### 2. Distance Calculation
- **Logic**: Uses the Haversine formula to calculate the distance between the user's coordinates and venue coordinates in Kilometers.
- **Display**: Shows a distance badge (e.g., "2.5 km") on the venue card image when location is active.

### 3. Sort by Distance
- **Functionality**: A toggle "Sort by Distance" appears when user location is available.
- **Behavior**: Reorders the venue list from nearest to farthest.

### 4. Map Directions
- **Functionality**: A navigation arrow icon button is added to each venue card.
- **Action**: Opens a new tab with Google Maps navigation pre-filled with the destination coordinates.
- **URL Format**: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`

## Mock Data Updates
- Added `coordinates` object (`{ lat, lng }`) to `lib/mockData.js` for testing purposes (centered around Bangalore).

## Testing Instructions
1. Open the Explore page.
2. Click "Locate Me". Allow browser location permission.
3. Verify the button changes to "Near Me" and distance badges appear on cards.
4. Click "Sort by Distance" and verify the order changes.
5. Click the Navigation icon (arrow) on a venue card and verify Google Maps opens.
