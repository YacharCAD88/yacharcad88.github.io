/* ============ Commands ============ */
window.Commands = {
  // Historial de comandos
  history: [],
  historyIndex: -1,

  parse(input) {
    const raw = input.trim();
    if (!raw) return;

    this.history.push(raw);
    this.historyIndex = this.history.length;

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // ---------- Comandos de dibujo ----------
    if (cmd === 'linea' || cmd === 'l') { this.startCommand('line'); return; }
    if (cmd === 'polilinea' || cmd === 'pl') { this.startCommand('polyline'); return; }
    if (cmd === 'cubo' || cmd === 'c') { this.startCommand('cube'); return; }
    if (cmd === 'punto' || cmd === 'pt') { this.startCommand('point'); return; }

    // ---------- Fin / Cancelar ----------
    if (cmd === 'fin' || cmd === 'end') { this.finishCommand(); return; }
    if (cmd === 'cancelar' || cmd === 'esc') { this.cancelCommand(); return; }

    // ---------- Z ----------
    if (cmd === 'z') {
      if (args.length === 0) {
        UI.toast(`Z actual: ${State.currentZ}`, 'info');
      } else {
        const z = parseFloat(args[0]);
        if (isNaN(z)) { UI.toast('Z debe ser un número', 'error'); return; }
        State.currentZ = z;
        UI.updateZInfo();
        UI.toast(`Z = ${z}`, 'success');
      }
      return;
    }

    // ---------- Snap ----------
    if (cmd === 'snap') {
      if (args.length === 0) {
        State.snapEnabled = !State.snapEnabled;
        document.getElementById('snapEnabled').checked = State.snapEnabled;
        UI.toast(`Snap ${State.snapEnabled ? 'ON' : 'OFF'}`, 'info');
        return;
      }
      const sub = args[0].toLowerCase();
      if (sub === 'on') { State.snapEnabled = true; document.getElementById('snapEnabled').checked = true; UI.toast('Snap ON', 'success'); return; }
      if (sub === 'off') { State.snapEnabled = false; document.getElementById('snapEnabled').checked = false; UI.toast('Snap OFF', 'success'); return; }
      if (sub === 'radio' && args[1]) {
        const r = parseFloat(args[1]);
        if (isNaN(r) || r <= 0) { UI.toast('Radio inválido', 'error'); return; }
        State.snapRadius = r;
        document.getElementById('snapRadius').value = r;
        UI.toast(`Radio snap = ${r}`, 'success');
        return;
      }
      UI.toast('Uso: snap [on|off|radio N]', 'info');
      return;
    }

    // ---------- Rotar ----------
    if (cmd === 'rotar' && args.length === 2) {
      const aX = parseFloat(args[0]);
      const aY = parseFloat(args[1]);
      if (isNaN(aX) || isNaN(aY)) { UI.toast('Uso: rotar [X] [Y]', 'error'); return; }
      Camera.rotate(aY, aX);
      Drawing.redrawAll();
      UI.toast(`Rotado X=${Camera.angleX.toFixed(2)} Y=${Camera.angleY.toFixed(2)}`, 'success');
      return;
    }

    if (cmd === 'reset-angle') {
      Camera.resetAngles();
      Drawing.redrawAll();
      UI.toast('Ángulos reseteados', 'success');
      return;
    }

    // ---------- Vista ----------
    if (cmd === 'reset') { Camera.resetView(); return; }
    if (cmd === 'zoom-in') { Camera.zoomAtPointer(CONFIG.ZOOM_FACTOR); return; }
    if (cmd === 'zoom-out') { Camera.zoomAtPointer(1 / CONFIG.ZOOM_FACTOR); return; }

    // ---------- Listar ----------
    if (cmd === 'listar' || cmd === 'list') { this.listEntities(); return; }

    // ---------- Borrar ----------
    if (cmd === 'borrar' || cmd === 'clear') {
      if (State.entities.length === 0) { UI.toast('Nada que borrar', 'info'); return; }
      const n = State.entities.length;
      State.reset();
      Drawing.redrawAll();
      UI.updateEntityCount();
      UI.updateSelectionInfo();
      UI.toast(`${n} entidades borradas`, 'success');
      return;
    }

    // ---------- Seleccionar por ID ----------
    if (cmd === 'sel' || cmd === 'seleccionar') {
      if (args.length === 0) { UI.toast('Uso: sel [id]', 'info'); return; }
      const id = args[0];
      if (!Entities.findById(id)) { UI.toast(`No existe: ${id}`, 'error'); return; }
      Selection.select(id);
      return;
    }

    if (cmd === 'desel' || cmd === 'deseleccionar') {
      Selection.deselectAll();
      UI.toast('Selección limpiada', 'success');
      return;
    }

    // ---------- Ayuda ----------
    if (cmd === 'ayuda' || cmd === 'help' || cmd === '?') { this.showHelp(); return; }

    // ---------- Coordenadas (si hay comando activo) ----------
    if (State.activeCommand) {
      // Prefijo "snap" para forzar snap
      let useSnap = false;
      let coordStr = raw;
      if (raw.toLowerCase().startsWith('snap ')) {
        useSnap = true;
        coordStr = raw.substring(5);
      }

      const coords = Utils.parseCoords(coordStr, State.currentZ);
      if (!coords) {
        UI.toast('Coordenadas inválidas. Usa x,y,z', 'error');
        return;
      }

      let final = coords;
      if (useSnap || State.snapEnabled) {
        final = Snapping.resolve(coords.x, coords.y, coords.z);
      }

      State.currentPoints.push(final);
      State.lastPoint = final;
      UI.toast(`Punto ${State.currentPoints.length}: ${Utils.formatCoords(final)}${final.snapped ? ' 🧲' : ''}`, 'info');
      Drawing.drawPreview(Camera.project(final.x, final.y, final.z));

      // Auto-finalizar punto (no necesita fin)
      if (State.activeCommand === 'point') {
        Entities.createPoint(final);
        State.activeCommand = null;
        State.currentPoints = [];
        State.lastPoint = null;
        Drawing.redrawAll();
        Drawing.clearPreview();
        UI.updateEntityCount();
        UI.setModeIndicator(null);
      }
      return;
    }

    UI.toast(`Comando no reconocido: "${cmd}". Escribe "ayuda".`, 'error');
  },

  startCommand(type) {
    State.activeCommand = type;
    State.currentPoints = [];
    State.lastPoint = null;
    Drawing.clearPreview();

    const names = { line: 'Línea', polyline: 'Polilínea', cube: 'Cubo', point: 'Punto' };
    UI.setModeIndicator(type);
    UI.toast(`${names[type]}: ingresa coordenadas x,y,z. "fin" para terminar.`, 'info');
  },

  finishCommand() {
    if (!State.activeCommand) { UI.toast('No hay comando activo', 'error'); return; }

    const pts = State.currentPoints;
    let created = null;

    if (State.activeCommand === 'line') {
      if (pts.length < 2) { UI.toast('Necesitas 2 puntos', 'error'); return; }
      created = Entities.createLine(pts[0], pts[1]);
    } else if (State.activeCommand === 'polyline') {
      if (pts.length < 2) { UI.toast('Necesitas al menos 2 puntos', 'error'); return; }
      created = Entities.createPolyline(pts);
    } else if (State.activeCommand === 'cube') {
      if (pts.length < 2) { UI.toast('Necesitas 2 esquinas', 'error'); return; }
      created = Entities.createCube(pts[0], pts[1]);
    } else if (State.activeCommand === 'point') {
      if (pts.length < 1) { UI.toast('Necesitas 1 punto', 'error'); return; }
      created = Entities.createPoint(pts[0]);
    }

    State.activeCommand = null;
    State.currentPoints = [];
    State.lastPoint = null;
    Drawing.redrawAll();
    Drawing.clearPreview();
    UI.updateEntityCount();
    UI.setModeIndicator(null);

    if (created) UI.toast(`✅ ${Entities.describe(created)}`, 'success');
  },

  cancelCommand() {
    if (!State.activeCommand) return;
    State.activeCommand = null;
    State.currentPoints = [];
    State.lastPoint = null;
    Drawing.clearPreview();
    UI.setModeIndicator(null);
    UI.toast('Comando cancelado', 'info');
  },

  listEntities() {
    if (State.entities.length === 0) { UI.toast('No hay entidades', 'info'); return; }
    console.log(`\n📋 Entidades (${State.entities.length}):`);
    State.entities.forEach((e, i) => {
      console.log(`  ${i + 1}. ${Entities.describe(e)}${e.selected ? ' ⭐' : ''}`);
    });
    UI.toast(`${State.entities.length} entidades (ver consola F12)`, 'info');
  },

  showHelp() {
    console.log(`\n📐 YacharCAD 3D — Comandos
═══════════════════════════════════
 DIBUJO
  linea / l           Iniciar línea
  polilinea / pl      Iniciar polilínea
  cubo / c            Iniciar cubo
  punto / pt          Crear punto
  fin / end           Finalizar dibujo actual
  cancelar / esc      Cancelar comando

 COORDENADAS
  x,y,z               Punto absoluto (ej: 10,20,30)
  snap x,y,z          Fuerza snap al vértice más cercano

 Z ACTUAL
  z                   Ver Z actual
  z [valor]           Establecer Z

 SNAP
  snap                Toggle ON/OFF
  snap on / off       Activar/desactivar
  snap radio N        Radio de snap

 SELECCIÓN
  sel [id]            Seleccionar por ID
  desel               Deseleccionar todo
  Click               Seleccionar entidad
  Ctrl+Click          Añadir a selección

 VISTA
  rotar [x] [y]       Rotar vista (radianes)
  reset-angle         Resetear ángulos
  reset               Reset total vista
  zoom-in / zoom-out  Zoom

 OTROS
  listar / list       Listar entidades
  borrar / clear      Borrar todo
  ayuda / help / ?    Esta ayuda
═══════════════════════════════════`);
    UI.toast('Ayuda en consola (F12)', 'info');
  }
};
