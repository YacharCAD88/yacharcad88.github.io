/* ============ State ============ */
window.State = {
  // Entidades
  entities: [],
  selectedIds: new Set(),

  // Dibujo por comandos
  currentZ: 0,
  activeCommand: null,      // 'line' | 'polyline' | 'cube' | 'point'
  currentPoints: [],

  // Modo
  mode: 'select',           // 'select' (único por ahora)

  // Snap
  snapEnabled: true,
  snapRadius: 10,

  // Estilo
  style: {
    lineColor: CONFIG.DEFAULT_LINE_COLOR,
    lineWidth: CONFIG.DEFAULT_LINE_WIDTH,
    vertexColor: CONFIG.DEFAULT_VERTEX_COLOR,
    vertexRadius: CONFIG.DEFAULT_VERTEX_RADIUS,
    selLineColor: CONFIG.DEFAULT_SEL_LINE_COLOR,
    selVertexColor: CONFIG.DEFAULT_SEL_VERTEX_COLOR,
    previewColor: CONFIG.DEFAULT_PREVIEW_COLOR
  },

  // Último punto (para preview)
  lastPoint: null,

  // Referencias Konva
  stage: null,
  backgroundLayer: null,
  drawLayer: null,
  vertexLayer: null,
  previewLayer: null,

  reset() {
    this.entities = [];
    this.selectedIds.clear();
    this.currentZ = 0;
    this.activeCommand = null;
    this.currentPoints = [];
    this.lastPoint = null;
  }
};
