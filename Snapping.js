/* ============ Snapping ============ */
window.Snapping = {
  // Busca el vértice más cercano a (x,y,z) dentro del radio
  findNearestVertex(x, y, z, maxDist) {
    let best = null;
    let bestDist = maxDist;

    Entities.forEachVertex((v) => {
      const d = Utils.distance3D({ x, y, z }, v);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    });

    return best;
  },

  // Snap a cuadrícula en el plano XY
  snapToGrid(x, y, z) {
    const step = CONFIG.GRID_STEP;
    return {
      x: Math.round(x / step) * step,
      y: Math.round(y / step) * step,
      z
    };
  },

  // Resuelve un punto aplicando snap si está activo
  // options: { type: 'vertex' | 'grid' | 'auto' }
  resolve(x, y, z, options = {}) {
    if (!State.snapEnabled) return { x, y, z, snapped: null };

    const type = options.type || 'auto';
    const radius = State.snapRadius;

    if (type === 'vertex' || type === 'auto') {
      const v = this.findNearestVertex(x, y, z, radius);
      if (v) return { x: v.x, y: v.y, z: v.z, snapped: 'vertex' };
    }

    if (type === 'grid' || type === 'auto') {
      const g = this.snapToGrid(x, y, z);
      if (Utils.distance3D({ x, y, z }, g) < radius) {
        return { ...g, snapped: 'grid' };
      }
    }

    return { x, y, z, snapped: null };
  }
};
