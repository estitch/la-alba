/* ==========================================================
   Vercel Speed Insights Initialization
   Injects Speed Insights to track Core Web Vitals
   ========================================================== */
(() => {
  'use strict';
  
  // Initialize Speed Insights queue
  if (window.si) return;
  window.si = function si(...params) {
    (window.siq = window.siq || []).push(params);
  };

  // Inject the Speed Insights script
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(script);
})();
