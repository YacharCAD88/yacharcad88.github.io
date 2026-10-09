/* ============ YacharCAD 3D — Bootstrap ============ */
(function () {
  function initStage() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const stage = new Konva.Stage({
      container: 'canvas-container',
      width,
      height
    });

    State.stage = stage;

    // Capas en orden
    State.backgroundLayer = new Konva.Layer();
    State.drawLayer = new Konva.Layer();
    State.vertexLayer = new Konva.Layer();
    State.previewLayer = new Konva.Layer();

    stage.add(State.backgroundLayer);
    stage.add(State.drawLayer);
    stage.add(State.vertexLayer);
    stage.add(State.previewLayer);

    // Fondo
    const bg = new Konva.Rect({
      x: 0, y: 0, width, height,
      fill: '#000000',
      listening: true,
      name: 'background'
    });
    State.backgroundLayer.add(bg);
    State.backgroundLayer.draw();

    // Redimensionar
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      stage.width(w);
      stage.height(h);
      bg.width(w);
      bg.height(h);
      State.backgroundLayer.batchDraw();
      Drawing.redrawAll();
    });
  }

  function init() {
    initStage();
    UI.init();
    Interactions.init();

    // Estilo inicial desde UI
    State.style.lineColor = document.getElementById('lineColor').value;
    State.style.lineWidth = parseFloat(document.getElementById('lineWidth').value);
    State.style.vertexColor = document.getElementById('vertexColor').value;
    State.style.vertexRadius = parseFloat(document.getElementById('vertexRadius').value);
    State.style.selLineColor = document.getElementById('selLineColor').value;
    State.style.selVertexColor = document.getElementById('selVertexColor').value;
    State.style.previewColor = document.getElementById('previewColor').value;

    // Snap inicial
    State.snapEnabled = document.getElementById('snapEnabled').checked;
    State.snapRadius = parseFloat(document.getElementById('snapRadius').value);

    // Primer render
    Drawing.redrawAll();

    // Bienvenida
    console.log('%c🏗️ YacharCAD 3D Modular v1.0', 'color:#64ffda;font-size:16px;font-weight:bold');
    console.log('💡 Escribe "ayuda" para ver comandos disponibles');
    UI.toast('Bienvenido. Escribe "ayuda" para empezar.', 'info');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
