/* ============ Interactions ============ */
window.Interactions = {
  isRotating: false,
  isPanning: false,
  lastMouseX: 0,
  lastMouseY: 0,
  panStart: null,

  init() {
    const stage = State.stage;
    if (!stage) return;

    // ---------- Click izquierdo: selección ----------
    stage.on('click', (e) => {
      // Si el target es el stage (fondo), deseleccionar
      if (e.target === stage || e.target.name() === '') {
        // Solo deseleccionar si no fue click en una entidad
        if (e.target.getParent() === State.backgroundLayer ||
            e.target === State.backgroundLayer) {
          Selection.deselectAll();
        }
      }
    });

    // ---------- Rotación: botón derecho ----------
    stage.on('mousedown', (e) => {
      if (e.evt.button === 2) {
        this.isRotating = true;
        this.lastMouseX = e.evt.clientX;
        this.lastMouseY = e.evt.clientY;
        e.evt.preventDefault();
        stage.container().style.cursor = 'grabbing';
      } else if (e.evt.button === 1) {
        // Botón central: pan
        this.isPanning = true;
        const pos = stage.getPointerPosition();
        this.panStart = {
          x: pos.x - State.drawLayer.x(),
          y: pos.y - State.drawLayer.y()
        };
        e.evt.preventDefault();
        stage.container().style.cursor = 'move';
      }
    });

    // ---------- Mousemove ----------
    stage.on('mousemove', (e) => {
      const pos = stage.getPointerPosition();
      if (!pos) return;

      if (this.isRotating) {
        const dx = (e.evt.clientX - this.lastMouseX) * 0.01;
        const dy = (e.evt.clientY - this.lastMouseY) * 0.01;
        Camera.rotate(dx, dy);
        this.lastMouseX = e.evt.clientX;
        this.lastMouseY = e.evt.clientY;
        Drawing.redrawAll();
      } else if (this.isPanning && this.panStart) {
        const newPos = {
          x: pos.x - this.panStart.x,
          y: pos.y - this.panStart.y
        };
        State.drawLayer.position(newPos);
        State.drawLayer.batchDraw();
        if (State.vertexLayer) {
          State.vertexLayer.position(newPos);
          State.vertexLayer.batchDraw();
        }
        if (State.previewLayer) {
          State.previewLayer.position(newPos);
          State.previewLayer.batchDraw();
        }
      } else {
        // Preview en vivo si hay comando activo
        if (State.activeCommand && State.lastPoint) {
          Drawing.drawPreview(pos);
        }
      }
    });

    // ---------- Mouseup ----------
    stage.on('mouseup', (e) => {
      if (e.evt.button === 2) {
        this.isRotating = false;
        stage.container().style.cursor = 'default';
      } else if (e.evt.button === 1) {
        this.isPanning = false;
        this.panStart = null;
        stage.container().style.cursor = 'default';
      }
    });

    // ---------- Rueda: zoom ----------
    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const factor = e.evt.deltaY > 0 ? 1 / CONFIG.ZOOM_FACTOR : CONFIG.ZOOM_FACTOR;
      Camera.zoomAtPointer(factor);
    });

    // ---------- Contextmenu: bloquear ----------
    stage.on('contextmenu', (e) => e.evt.preventDefault());

    // ---------- Teclado ----------
    window.addEventListener('keydown', (e) => {
      // Esc: cancelar comando
      if (e.key === 'Escape') {
        Commands.cancelCommand();
      }
      // Supr: borrar selección
      if (e.key === 'Delete' && State.selectedIds.size > 0) {
        const n = Entities.removeSelected();
        Drawing.redrawAll();
        UI.updateEntityCount();
        UI.updateSelectionInfo();
        UI.toast(`${n} entidad(es) eliminada(s)`, 'success');
      }
    });
  }
};
