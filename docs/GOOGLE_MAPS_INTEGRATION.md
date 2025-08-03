# Google Maps Integration Guide

## Current Implementation

Your website now has an interactive Google Maps integration in the Location section that shows the exact location of your clinic at **356 Ecclesall Road South, Sheffield S11 9PU, UK**.

### How It Works

The current implementation uses Google Maps' **iframe embed** approach, which:
- ✅ **No API key required** - Works immediately without setup
- ✅ **Fully interactive** - Users can zoom, pan, and click to get directions
- ✅ **Mobile responsive** - Works perfectly on all devices
- ✅ **Fast loading** - Uses lazy loading for performance
- ✅ **Accessible** - Includes proper title and accessibility attributes

### Features Available to Users

With the current integration, visitors to your website can:
- **Zoom in/out** of the map
- **Pan around** to explore the area
- **Switch map types** (satellite, terrain, etc.)
- **Click "View larger map"** to open in Google Maps
- **Get directions** directly from the map
- **See street view** of your location

## URL Structure Explained

The current embed URL: 
```
https://www.google.com/maps?q=356+Ecclesall+Road+South,Sheffield+S11+9PU,UK&output=embed
```

- `q=` - The search query (your clinic address)
- `&output=embed` - Tells Google to format for iframe embedding
- Address is URL-encoded (spaces become `+`)

## Advanced Options (If Needed)

### Option 1: Google Maps Embed API (Free, Limited Customization)

If you want more control, you can use the official Embed API:

```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=HealthMaster+Clinic,356+Ecclesall+Road+South,Sheffield+UK"
  width="100%"
  height="100%">
</iframe>
```

**Benefits:**
- More reliable long-term
- Additional parameters (zoom level, map type)
- Official Google support

**Requirements:**
- Need a free Google Cloud Platform account
- Need to enable Maps Embed API
- Need to generate an API key

### Option 2: Google Maps JavaScript API (Advanced, Requires API Key)

For maximum customization, you could use the JavaScript API:

```javascript
function initMap() {
  const clinicLocation = { lat: 53.3498, lng: -1.4889 }; // Approximate Sheffield coordinates
  
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: clinicLocation,
    styles: [...] // Custom styling
  });

  const marker = new google.maps.Marker({
    position: clinicLocation,
    map: map,
    title: "HealthMaster Acupuncture Clinic"
  });
}
```

**Benefits:**
- Complete control over styling
- Custom markers and info windows
- Multiple locations support
- Custom interactions

**Requirements:**
- API key required
- More complex setup
- JavaScript knowledge needed

## Updating the Address

If you need to change the clinic address in the future:

1. **Find the iframe** in `index.html` (line ~503)
2. **Update the address** in the `src` URL
3. **URL-encode the new address** (spaces = `+`, special characters encoded)

Example for a new address:
```html
src="https://www.google.com/maps?q=NEW+ADDRESS+HERE&output=embed"
```

## Performance Notes

The current implementation:
- Uses `loading="lazy"` - Map loads only when user scrolls to it
- Uses `referrerpolicy="no-referrer-when-downgrade"` - For privacy
- Styled with `border:0` and proper responsive classes

## Testing

To test the integration:
1. Open your website
2. Navigate to the Location section
3. The map should load automatically
4. Try interacting with it (zoom, pan, click for directions)

## Troubleshooting

**Map not loading?**
- Check your internet connection
- Ensure the address in the URL is correct
- Try opening the `src` URL directly in a browser

**Address not found?**
- Verify the address format
- Try using latitude/longitude coordinates instead
- Use the address as it appears in Google Maps search

## Next Steps

Your current implementation should work perfectly for most users. If you want to upgrade to a more advanced solution later, you can:

1. Get a Google Cloud Platform account
2. Enable the Maps JavaScript API
3. Replace the iframe with a custom map implementation

For now, the current solution provides excellent functionality without any setup complexity!
