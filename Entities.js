/* ============ Entities ============ */
window.Entities = {
  findById(id) {
    return State.entities.find(e => e.id === id) || null;
  },

  // Devuelve todos los vértices únicos de una entidad
  getVertices(entity) {
    switch (entity.type) {
      case 'line':
        return [
          { x: entity.x1, y: entity.y1, z: entity.z1 },
          { x: entity.x2, y: entity.y2, z: entity.z2 }
        ];
      case 'polyline':
        return entity.points.map(p => ({ x: p.x, y: p.y, z: p.z }));
      case 'cube': {
        const { x, y, z, width, height, depth } = entity;
        return [
          { x, y, z },
          { x: x + width, y, z },
          { x: x + width, y: y + height, z },
          { x, y: y + height, z },
          { x, y, z: z + depth },
          { x: x + width, y, z: z + depth },
          { x: x + width, y: y + height, z: z + depth },
          { x, y: y + height, z: z + depth }
        ];
      }
      case 'point':
        return [{ x: entity.x, y: entity.y, z: entity.z }];
      default:
        return [];
    }
  },

  // Itera sobre todos los vértices de todas las entidades
  forEachVertex(callback) {
    for (const entity of State.entities) {
      const verts = this.getVertices(entity);
      for (const v of verts) {
        callback(v, entity);
      }
    }
  },

  createLine(p1, p2) {
    const id = Utils.generateUniqueId('line');
    const entity = {
      id, type: 'line',
      x1: p1.x, y1: p1.y, z1: p1.z,
      x2: p2.x, y2: p2.y, z2: p2.z,
      selected: false
    };
    State.entities.push(entity);
    return entity;
  },

  createPolyline(points) {
    const id = Utils.generateUniqueId('pline');
    const entity = {
      id, type: 'polyline',
      points: points.map(p => ({ x: p.x, y: p.y, z: p.z })),
      selected: false
    };
    State.entities.push(entity);
    return entity;
  },

  createCube(p1, p2) {
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const z = Math.min(p1.z, p2.z);
    const width = Math.abs(p2.x - p1.x) || 50;
    const height = Math.abs(p2.y - p1.y) || 50;
    const depth = Math.abs(p2.z - p1.z) || 50;

    const id = Utils.generateUniqueId('cube');
    const entity = {
      id, type: 'cube',
      x, y, z, width, height, depth,
      selected: false
    };
    State.entities.push(entity);
    return entity;
  },

  createPoint(p) {
    const id = Utils.generateUniqueId('pt');
    const entity = {
      id, type: 'point',
      x: p.x, y: p.y, z: p.z,
      selected: false
    };
    State.entities.push(entity);
    return entity;
  },

  removeById(id) {
    const idx = State.entities.findIndex(e => e.id === id);
    if (idx >= 0) {
      State.entities.splice(idx, 1);
      State.selectedIds.delete(id);
      return true;
    }
    return false;
  },

  removeSelected() {
    let count = 0;
    for (const id of Array.from(State.selectedIds)) {
      if (this.removeById(id)) count++;
    }
    return count;
  },

  describe(entity) {
    switch (entity.type) {
      case 'line':
        return `Línea [${entity.id}] (${entity.x1.toFixed(1)},${entity.y1.toFixed(1)},${entity.z1.toFixed(1)}) → (${entity.x2.toFixed(1)},${entity.y2.toFixed(1)},${entity.z2.toFixed(1)})`;
      case 'polyline':
        return `Polilínea [${entity.id}] (${entity.points.length} pts)`;
      case 'cube':
        return `Cubo [${entity.id}] en (${entity.x},${entity.y},${entity.z}) ${entity.width}×${entity.height}×${entity.depth}`;
      case 'point':
        return `Punto [${entity.id}] (${entity.x.toFixed(1)},${entity.y.toFixed(1)},${entity.z.toFixed(1)})`;
      default:
        return `[${entity.id}] ${entity.type}`;
    }
  }
};
