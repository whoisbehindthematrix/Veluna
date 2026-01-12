/**
 * Darkens a hex color by a given percentage.
 * @param hex - The color in hex format (e.g., "#3b82f6")
 * @param percent - The amount to darken (0 to 100)
 * @returns A darkened hex string
 */
export const darkenColor = (hex: string, percent: number): string => {
	// Remove the hash if it exists
	const cleanHex = hex.replace("#", "");
	
	// Parse the hex to an integer
	const num = parseInt(cleanHex, 16);
	
	// Calculate the amount to reduce each RGB channel
	const amt = Math.round(2.55 * percent);
	
	// Extract and shift channels
	let R = (num >> 16) - amt;
	let G = ((num >> 8) & 0x00ff) - amt;
	let B = (num & 0x0000ff) - amt;
  
	// Clamp values between 0 and 255
	R = Math.max(0, Math.min(255, R));
	G = Math.max(0, Math.min(255, G));
	B = Math.max(0, Math.min(255, B));
  
	// Combine back into a hex string
	return (
	  "#" +
	  (0x1000000 + R * 0x10000 + G * 0x100 + B)
		.toString(16)
		.slice(1)
		.toUpperCase()
	);
  };


  // Helper to add opacity to hex colors
export const addOpacityToHex = (hex: string, opacity: number): string => {
	// Remove # if present
	const cleanHex = hex.replace('#', '');
	// Convert opacity (0-1) to hex (00-FF)
	const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
	return `#${cleanHex}${hexOpacity}`;
  };
  