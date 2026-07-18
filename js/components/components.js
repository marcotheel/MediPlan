/**
 * MediPlan component helpers.
 * Pure rendering helpers only; no application state is stored here.
 */
const Components = {
  icon(name, label = "") {
    const aria = label ? `aria-label="${UI.escape(label)}"` : 'aria-hidden="true"';
    return `<svg class="mds-icon" ${aria}><use href="assets/icons/ui-icons.svg#icon-${name}"></use></svg>`;
  },

  badge(text, status = "info") {
    return `<span class="mds-badge mds-badge--${status}">${UI.escape(text)}</span>`;
  },

  emptyState(title, text) {
    return `<div class="empty-state mds-enter"><h3>${UI.escape(title)}</h3><p>${UI.escape(text)}</p></div>`;
  }
};
