/* ============ Selection ============ */
window.Selection = {
  select(id, addToSelection = false) {
    if (!addToSelection) this.deselectAll();
    const entity = Entities.findById(id);
    if (!entity) return;
    State.selectedIds.add(id);
    entity.selected = true;
    this.refreshVisuals();
    UI.updateSelectionInfo();
    UI.setStatus(`Seleccionado: ${entity.id}`);
  },

  toggle(id) {
    const entity = Entities.findById(id);
    if (!entity) return;
    if (State.selectedIds.has(id)) {
      State.selectedIds.delete(id);
      entity.selected = false;
    } else {
      State.selectedIds.add(id);
      entity.selected = true;
    }
    this.refreshVisuals();
    UI.updateSelectionInfo();
  },

  deselectAll() {
    for (const id of State.selectedIds) {
      const e = Entities.findById(id);
      if (e) e.selected = false;
    }
    State.selectedIds.clear();
    this.refreshVisuals();
    UI.updateSelectionInfo();
  },

  isSelected(id) {
    return State.selectedIds.has(id);
  },

  refreshVisuals() {
    Drawing.redrawAll();
  }
};
