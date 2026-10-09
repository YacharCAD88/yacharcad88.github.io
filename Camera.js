/* ============ Camera ============ */
window.Camera = {
  angleX: CONFIG.ANGLE_X_DEFAULT,
  angleY: CONFIG.ANGLE_Y_DEFAULT,
  scale: 1,

  project(x, y, z) {
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);

    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    return {
      x: x1 + this.getOffsetX(),
      y: -y1 + this.getOffsetY(),
      depth: z2
    };
  },

  getOffsetX() { return window.innerWidth / 2; },
  getOffsetY() { return (window.innerHeight - 60) / 2; },

  rotate(deltaX, deltaY) {
    this.angleY += deltaX;
    this.angleX += deltaY;
    this.angleX = Utils.clamp(this.angleX, -CONFIG.ANGLE_CLAMP, CONFIG.ANGLE_CLAMP);
  },

  resetAngles() {
    this.angleX = CONFIG.ANGLE_X_DEFAULT;
    this.angleY = CONFIG.ANGLE_Y_DEFAULT;
  },

  zoomAtPointer(factor) {
    const stage = State.stage;
    const drawLayer = State.drawLayer;
    if (!stage || !drawLayer) return;

    const oldScale = drawLayer.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) {
      const newScale = Utils.clamp(oldScale * factor, CONFIG.MIN_SCALE, CONFIG.MAX_SCALE);
      drawLayer.scale({ x: newScale, y: newScale });
      drawLayer.batchDraw();
      UI.updateZoomInfo();
      return;
    }

    const mousePointTo = {
      x: (pointer.x - drawLayer.x()) / oldScale,
      y: (pointer.y - drawLayer.y()) / oldScale
    };

    const newScale = Utils.clamp(oldScale * factor, CONFIG.MIN_SCALE, CONFIG.MAX_SCALE);
    drawLayer.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };
    drawLayer.position(newPos);
    drawLayer.batchDraw();

    if (State.previewLayer) {
      State.previewLayer.scale({ x: newScale, y: newScale });
      State.previewLayer.position(newPos);
      State.previewLayer.batchDraw();
    }
    if (State.vertexLayer) {
      State.vertexLayer.scale({ x: newScale, y: newScale });
      State.vertexLayer.position(newPos);
      State.vertexLayer.batchDraw();
    }

    UI.updateZoomInfo();
  },

  resetView() {
    const drawLayer = State.drawLayer;
    if (!drawLayer) return;
    drawLayer.position({ x: 0, y: 0 });
    drawLayer.scale({ x: 1, y: 1 });
    if (State.vertexLayer) {
      State.vertexLayer.position({ x: 0, y: 0 });
      State.vertexLayer.scale({ x: 1, y: 1 });
    }
    if (State.previewLayer) {
      State.previewLayer.position({ x: 0, y: 0 });
      State.previewLayer.scale({ x: 1, y: 1 });
    }
    this.resetAngles();
    Drawing.redrawAll();
    UI.updateZoomInfo();
  }
};
