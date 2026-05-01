/**
 * Utility to extract latitude and longitude from various Google Maps URL formats
 * @param {string} url - Google Maps URL
 * @returns {object|null} - { lat, lng } or null
 */
const extractCoordinates = (url) => {
    if (!url) return null;

    try {
        // Pattern 1: query=lat,lng
        const queryMatch = url.match(/query=([-\d.]+),([-\d.]+)/);
        if (queryMatch) {
            return {
                lat: parseFloat(queryMatch[1]),
                lng: parseFloat(queryMatch[2])
            };
        }

        // Pattern 2: @lat,lng
        const atMatch = url.match(/@([-\d.]+),([-\d.]+)/);
        if (atMatch) {
            return {
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2])
            };
        }

        // Pattern 3: place/lat,lng
        const placeMatch = url.match(/place\/([-\d.]+),([-\d.]+)/);
        if (placeMatch) {
            return {
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2])
            };
        }

        return null;
    } catch (e) {
        console.error("Error extracting coordinates:", e);
        return null;
    }
};

module.exports = { extractCoordinates };
