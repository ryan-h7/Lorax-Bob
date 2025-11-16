/**
 * Get a gradient background based on the current time of day
 */
export function getTimeBasedGradient(): string {
  const hour = new Date().getHours();
  
  // Late night (12am-4am): Deep night sky
  if (hour >= 0 && hour < 4) {
    return 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
  }
  // Early morning (4am-6am): Pre-dawn
  else if (hour >= 4 && hour < 6) {
    return 'linear-gradient(to bottom, #1e1b4b 0%, #4c1d95 40%, #7e22ce 70%, #fb923c 100%)';
  }
  // Sunrise (6am-8am): Warm sunrise
  else if (hour >= 6 && hour < 8) {
    return 'linear-gradient(to bottom, #fb923c 0%, #fbbf24 30%, #fde047 60%, #bae6fd 100%)';
  }
  // Morning (8am-11am): Bright morning
  else if (hour >= 8 && hour < 11) {
    return 'linear-gradient(to bottom, #60a5fa 0%, #93c5fd 50%, #dbeafe 100%)';
  }
  // Noon (11am-2pm): Midday sun
  else if (hour >= 11 && hour < 14) {
    return 'linear-gradient(to bottom, #3b82f6 0%, #60a5fa 40%, #fef08a 100%)';
  }
  // Afternoon (2pm-5pm): Afternoon sun
  else if (hour >= 14 && hour < 17) {
    return 'linear-gradient(to bottom, #60a5fa 0%, #93c5fd 50%, #fef3c7 100%)';
  }
  // Sunset (5pm-7pm): Golden hour
  else if (hour >= 17 && hour < 19) {
    return 'linear-gradient(to bottom, #f97316 0%, #fb923c 30%, #fbbf24 60%, #7c3aed 100%)';
  }
  // Dusk (7pm-9pm): Twilight
  else if (hour >= 19 && hour < 21) {
    return 'linear-gradient(to bottom, #4c1d95 0%, #6b21a8 40%, #1e40af 80%, #1e293b 100%)';
  }
  // Night (9pm-12am): Evening sky
  else {
    return 'linear-gradient(to bottom, #1e293b 0%, #312e81 50%, #1e1b4b 100%)';
  }
}

/**
 * Get a human-readable description of the current time period
 */
export function getTimePeriod(): string {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour < 4) return 'Late Night';
  else if (hour >= 4 && hour < 6) return 'Pre-Dawn';
  else if (hour >= 6 && hour < 8) return 'Sunrise';
  else if (hour >= 8 && hour < 11) return 'Morning';
  else if (hour >= 11 && hour < 14) return 'Noon';
  else if (hour >= 14 && hour < 17) return 'Afternoon';
  else if (hour >= 17 && hour < 19) return 'Sunset';
  else if (hour >= 19 && hour < 21) return 'Dusk';
  else return 'Night';
}

