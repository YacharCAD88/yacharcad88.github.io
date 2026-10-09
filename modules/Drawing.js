/* ============ Drawing ============ */
window.Drawing = {
  // Crea un nodo Konva Line para dos puntos 3D
  createLineNode(x1, y1, z1, x2, y2, z2, opts = {}) {
    const p1 = Camera.project(x1, y1, z1);
    const p2 = Camera.project(x2, y2, z2);
    const style = State.style;

    return new Konva.Line({
      points: [p1.x, p1.y, p2.x, p2.y],
      stroke: opts.color || style.lineColor,
      strokeWidth: opts.width || style.lineWidth,
      lineCap: 'round',
      listening: opts.listening !== false,
      name: 'line-node'
    });
  },

  createVertexNode(x, y, z, opts = {}) {
    const p = Camera.project(x, y, z);
    const style = State.style;
    return new Konva.Circle({
      x: p.x,
      y: p.y,
      radius: opts.radius || style.vertexRadius,
      fill: opts.color || style.vertexColor,
      listening: opts.listening !== false,
      name: 'vertex-node'
    });
  },

  // Dibuja una entidad completa
  drawEntity(entity) {
    const drawLayer = State.drawLayer;
    const vertexLayer = State.vertexLayer;
    const style = State.style;
    const isSel = entity.selected;

    const lineColor = isSel ? style.selLineColor : style.lineColor;
    const lineWidth = isSel ? CONFIG.SEL_LINE_WIDTH : style.lineWidth;
    const vertexColor = isSel ? style.selVertexColor : style.vertexColor;
    const vertexRadius = isSel
      ? style.vertexRadius * CONFIG.SEL_VERTEX_RADIUS_MULT
      : style.vertexRadius;

    switch (entity.type) {
      case 'line': {
        const node = this.createLineNode(
          entity.x1, entity.y1, entity.z1,
          entity.x2, entity.y2, entity.z2,
          { color: lineColor, width: lineWidth }
        );
        node.on('click', (e) => {
          e.cancelBubble = true;
          if (e.evt.ctrlKey || e.evt.metaKey) Selection.toggle(entity.id);
          else Selection.select(entity.id);
        });
        drawLayer.add(node);

        // Vértices
        [ [entity.x1, entity.y1, entity.z1],
          [entity.x2, entity.y2, entity.z2] ].forEach(([x, y, z]) => {
          const v = this.createVertexNode(x, y, z, {
            color: vertexColor, radius: vertexRadius, listening: false
          });
          vertexLayer.add(v);
        });
        break;
      }

      case 'polyline': {
        const pts = entity.points;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const node = this.createLineNode(a.x, a.y, a.z, b.x, b.y, b.z, {
            color: lineColor, width: lineWidth
          });
          node.on('click', (e) => {
            e.cancelBubble = true;
            if (e.evt.ctrlKey || e.evt.metaKey) Selection.toggle(entity.id);
            else Selection.select(entity.id);
          });
          drawLayer.add(node);
        }
        pts.forEach(p => {
          vertexLayer.add(this.createVertexNode(p.x, p.y, p.z, {
            color: vertexColor, radius: vertexRadius, listening: false
          }));
        });
        break;
      }

      case 'cube': {
        const verts = Entities.getVertices(entity);
        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];
        for (const [a, b] of edges) {
          const va = verts[a], vb = verts[b];
          const node = this.createLineNode(va.x, va.y, va.z, vb.x, vb.y, vb.z, {
            color: lineColor, width: lineWidth
          });
          node.on('click', (e) => {
            e.cancelBubble = true;
            if (e.evt.ctrlKey || e.evt.metaKey) Selection.toggle(entity.id);
            else Selection.select(entity.id);
          });
          drawLayer.add(node);
        }
        verts.forEach(v => {
          vertexLayer.add(this.createVertexNode(v.x, v.y, v.z, {
            color: vertexColor, radius: vertexRadius, listening: false
          }));
        });
        break;
      }

      case 'point': {
        const v = this.createVertexNode(entity.x, entity.y, entity.z, {
          color: lineColor, radius: vertexRadius * 1.5
        });
        v.on('click', (e) => {
          e.cancelBubble = true;
          if (e.evt.ctrlKey || e.evt.metaKey) Selection.toggle(entity.id);
          else Selection.select(entity.id);
        });
        vertexLayer.add(v);
        break;
      }
    }
  },

  redrawAll() {
    const drawLayer = State.drawLayer;
    const vertexLayer = State.vertexLayer;
    const previewLayer = State.previewLayer;
    if (!drawLayer) return;

    drawLayer.destroyChildren();
    vertexLayer.destroyChildren();
    previewLayer.destroyChildren();

    this.drawAxes();

    for (const entity of State.entities) {
      this.drawEntity(entity);
    }

    drawLayer.draw();
    vertexLayer.draw();
    previewLayer.draw();
  },

  drawAxes() {
    const len = CONFIG.AXIS_LENGTH;
    const [cx, cy, cz] = CONFIG.AXIS_COLORS;
    const dirs = [
      { end: { x: len, y: 0, z: 0 }, color: cx },
      { end: { x: 0, y: len, z: 0 }, color: cy },
      { end: { x: 0, y: 0, z: len }, color: cz }
    ];
    for (const { end, color } of dirs) {
      const line = this.createLineNode(0, 0, 0, end.x, end.y, end.z, {
        color, width: 2, listening: false
      });
      State.drawLayer.add(line);
    }
  },

  // Preview en vivo: línea punteada del último punto al cursor
  drawPreview(cursorScreenPos) {
    const previewLayer = State.previewLayer;
    if (!previewLayer) return;
    previewLayer.destroyChildren();

    if (!State.lastPoint || !State.activeCommand) {
      previewLayer.draw();
      return;
    }

    // Proyecta el último punto 3D
    const last = Camera.project(State.lastPoint.x, State.lastPoint.y, State.lastPoint.z);

    // Línea punteada en coordenadas de pantalla
    const line = new Konva.Line({
      points: [last.x, last.y, cursorScreenPos.x, cursorScreenPos.y],
      stroke: State.style.previewColor,
      strokeWidth: State.style.lineWidth,
      dash: [6, 4],
      listening: false
    });
    previewLayer.add(line);

    // Pequeño círculo en el cursor
    const dot = new Konva.Circle({
      x: cursorScreenPos.x,
      y: cursorScreenPos.y,
      radius: State.style.vertexRadius,
      fill: State.style.previewColor,
      listening: false
    });
    previewLayer.add(dot);

    previewLayer.draw();
  },

  clearPreview() {
    if (State.previewLayer) {
      State.previewLayer.destroyChildren();
      State.previewLayer.draw();
    }
  }
};
