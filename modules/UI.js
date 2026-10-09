/* ============ UI ============ */
window.UI = {
  toastTimeout: null,

  init() {
    this.bindToolbar();
    this.bindStyleInputs();
    this.bindSidebarButtons();
    this.bindCommandInput();
    this.updateZoomInfo();
    this.updateZInfo();
    this.updateEntityCount();
    this.updateSelectionInfo();
  },

  // ---------- Toolbar ----------
  bindToolbar() {
    document.querySelectorAll('#toolbar .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'delete') {
          if (State.selectedIds.size === 0) { this.toast('Nada seleccionado', 'error'); return; }
          const n = Entities.removeSelected();
          Drawing.redrawAll();
          this.updateEntityCount();
          this.updateSelectionInfo();
          this.toast(`${n} entidad(es) eliminada(s)`, 'success');
        } else if (action === 'rot-left') { Camera.rotate(-0.1, 0); Drawing.redrawAll(); }
        else if (action === 'rot-right') { Camera.rotate(0.1, 0); Drawing.redrawAll(); }
        else if (action === 'rot-up') { Camera.rotate(0, -0.1); Drawing.redrawAll(); }
        else if (action === 'rot-down') { Camera.rotate(0, 0.1); Drawing.redrawAll(); }
        else if (action === 'reset-view') { Camera.resetView(); }
      });
    });

    // Snap
    document.getElementById('snapEnabled').addEventListener('change', (e) => {
      State.snapEnabled = e.target.checked;
    });
    document.getElementById('snapRadius').addEventListener('input', (e) => {
      const r = parseFloat(e.target.value);
      if (!isNaN(r) && r > 0) State.snapRadius = r;
    });
  },

  // ---------- Estilo ----------
  bindStyleInputs() {
    const map = {
      lineColor: 'lineColor',
      lineWidth: 'lineWidth',
      vertexColor: 'vertexColor',
      vertexRadius: 'vertexRadius',
      selLineColor: 'selLineColor',
      selVertexColor: 'selVertexColor',
      previewColor: 'previewColor'
    };
    for (const [id, key] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener('input', () => {
        const val = el.type === 'number' ? parseFloat(el.value) : el.value;
        State.style[key] = val;
        Drawing.redrawAll();
      });
    }
  },

  // ---------- Sidebar botones de comando ----------
  bindSidebarButtons() {
    document.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        Commands.parse(cmd);
        document.getElementById('command-input').focus();
      });
    });
    document.querySelectorAll('[data-action="deselect"]').forEach(btn => {
      btn.addEventListener('click', () => Selection.deselectAll());
    });
  },

  // ---------- Consola ----------
  bindCommandInput() {
    const input = document.getElementById('command-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        input.value = '';
        if (val) Commands.parse(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (Commands.historyIndex > 0) {
          Commands.historyIndex--;
          input.value = Commands.history[Commands.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (Commands.historyIndex < Commands.history.length - 1) {
          Commands.historyIndex++;
          input.value = Commands.history[Commands.historyIndex];
        } else {
          Commands.historyIndex = Commands.history.length;
          input.value = '';
        }
      }
    });
    input.focus();
  },

  // ---------- Updates ----------
  updateZoomInfo() {
    const el = document.getElementById('zoomInfo');
    if (el && State.drawLayer) {
      const scale = State.drawLayer.scaleX() * 100;
      el.textContent = `Zoom: ${scale.toFixed(0)}%`;
    }
  },

  updateZInfo() {
    const el = document.getElementById('zInfo');
    if (el) el.textContent = `Z: ${State.currentZ}`;
  },

  updateEntityCount() {
    const el = document.getElementById('entityCount');
    if (el) el.textContent = `Entidades: ${State.entities.length}`;
  },

  updateSelectionInfo() {
    const el = document.getElementById('selectionInfo');
    if (!el) return;
    if (State.selectedIds.size === 0) {
      el.innerHTML = '<div class="muted">Nada seleccionado</div>';
      return;
    }
    const items = [];
    for (const id of State.selectedIds) {
      const e = Entities.findById(id);
      if (e) {
        items.push(`<div class="item">
          <div class="id">${e.id}</div>
          <div>${Entities.describe(e).replace(/\[.*?\]\s*/, '')}</div>
        </div>`);
      }
    }
    el.innerHTML = items.join('');
  },

  setStatus(msg) {
    // Actualiza info-panel temporalmente
    const panel = document.getElementById('info-panel');
    if (!panel) return;
    panel.textContent = msg;
    panel.style.display = 'block';
    clearTimeout(this._statusTimeout);
    this._statusTimeout = setTimeout(() => {
      panel.style.display = 'none';
    }, 2500);
  },

  setModeIndicator(cmdType) {
    const el = document.getElementById('mode-indicator');
    if (!el) return;
    if (!cmdType) {
      el.textContent = 'MODO: SELECT';
      el.style.color = 'var(--accent-4)';
    } else {
      const names = { line: 'LÍNEA', polyline: 'POLILÍNEA', cube: 'CUBO', point: 'PUNTO' };
      el.textContent = `MODO: ${names[cmdType] || cmdType.toUpperCase()}`;
      el.style.color = 'var(--accent-1)';
    }
  },

  toast(msg, type = 'info') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast-${type}`;
    el.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      el.classList.remove('show');
    }, 3000);
  }
};
