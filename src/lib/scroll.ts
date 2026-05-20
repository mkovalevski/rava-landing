export function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function smoothScrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
