// Progressive enhancement: Update GitHub chart with latest version in background
(function() {
  const chart = document.querySelector('img[src="/assets/github-chart.svg"]');
  if (!chart) return;

  // Create a temporary image to load the fresh version
  const freshChart = new Image();

  // Add timestamp to bypass cache
  freshChart.src = `https://ghchart.rshah.org/notsaad?t=${Date.now()}`;

  // Once loaded, swap it in smoothly
  freshChart.onload = function() {
    chart.style.transition = 'opacity 0.3s';
    chart.style.opacity = '0.5';

    setTimeout(() => {
      chart.src = freshChart.src;
      chart.style.opacity = '1';
    }, 300);
  };

  // Silently fail if the fresh fetch doesn't work
  freshChart.onerror = function() {
    // Keep showing cached version
  };
})();
