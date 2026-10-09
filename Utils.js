/* ============ Utils ============ */
window.Utils = {
  generateUniqueId(prefix = 'ent') {
    return prefix + '_' + Date.now().toString(36) + '_' +
           Math.random().toString(36).substr(2, 5);
  },

  clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  },

  distance3D(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  // Parsea "x,y,z" o "x y z" o "x,y" (usa zActual)
  parseCoords(input, zActual = 0) {
    const trimmed = input.trim();
    let parts;
    if (trimmed.includes(',')) {
      parts = trimmed.split(',').map(s => s.trim());
    } else {
      parts = trimmed.split(/\s+/).filter(s => s !== '');
    }
    if (parts.length < 2 || parts.length > 3) return null;

    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    const z = parts.length === 3 ? parseFloat(parts[2]) : zActual;

    if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
    return { x, y, z };
  },

  formatCoords(p, decimals = 2) {
    return `(${p.x.toFixed(decimals)}, ${p.y.toFixed(decimals)}, ${p.z.toFixed(decimals)})`;
  }
};
