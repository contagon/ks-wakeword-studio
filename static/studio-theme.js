// Runs before CSS/Vue so the first painted Studio frame uses the chosen theme.
(() => {
  let saved;
  try { saved = localStorage.getItem('studio.theme'); } catch { /* Optional storage. */ }
  const dark = saved === 'dark' || (saved !== 'light' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.studioTheme = dark ? 'dark' : 'light';
})();
