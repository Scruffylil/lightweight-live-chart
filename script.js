const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  width: window.innerWidth,
  height: window.innerHeight, // Use window.innerHeight for initial height
  layout: {
    backgroundColor: '#131722', // Darker background inspired by TradingView
    textColor: '#d1d4dc',     // Light grey text
  },
  grid: {
    vertLines: {
      color: 'rgba(42, 46, 57, 0.5)', // Very faint grid lines
    },
    horzLines: {
      color: 'rgba(42, 46, 57, 0.5)', // Very faint grid lines
    },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
    borderColor: '#48586f', // Border color for the time scale
  },
  rightPriceScale: {
    borderColor: '#48586f', // Border color for the price scale
  },
});

// ... (rest of your script.js code remains the same as previously provided) ...

// Ensure this ResizeObserver is present to handle dynamic resizing:
new ResizeObserver(entries => {
    if (entries.length === 0 || entries[0].target !== document.getElementById('chart')) {
        return;
    }
    const newRect = entries[0].contentRect;
    chart.applyOptions({ height: newRect.height, width: newRect.width });
}).observe(document.getElementById('chart'));
