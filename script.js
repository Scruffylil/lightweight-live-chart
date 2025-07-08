// Get the chart container element
const chartContainer = document.getElementById('chart');

// Create the chart instance
const chart = LightweightCharts.createChart(chartContainer, {
  width: chartContainer.clientWidth,   // Initial width from container
  height: chartContainer.clientHeight, // Initial height from container
  layout: {
    backgroundColor: '#131722', // Dark background inspired by TradingView
    textColor: '#d1d4dc',       // Light grey text
  },
  grid: {
    vertLines: {
      color: 'rgba(42, 46, 57, 0.5)', // Very faint vertical grid lines
    },
    horzLines: {
      color: 'rgba(42, 46, 57, 0.5)', // Very faint horizontal grid lines
    },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false, // Often seconds are hidden in main TradingView view for 1m
    borderColor: '#48586f', // Border color for the time scale
    tickMarkFormatter: (time) => {
        // Format time to show date for daily, or hour:minute for intraday
        const date = new Date(time * 1000); // Convert Unix timestamp to Date object
        if (date.getHours() === 0 && date.getMinutes() === 0) {
            // If it's the start of a day (for daily charts)
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        // For intraday (e.g., 1m, 5m), show time
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
  },
  rightPriceScale: {
    borderColor: '#48586f', // Border color for the price scale
  },
  crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
  },
});

// Add the candlestick series
const candleSeries = chart.addCandlestickSeries({
  upColor: '#26a69a',     // Green for up candles (body and wick)
  downColor: '#ef5350',   // Red for down candles (body and wick)
  borderVisible: false,   // No borders around candles for a cleaner look
  wickUpColor: '#26a69a', // Wick color matches body color
  wickDownColor: '#ef5350', // Wick color matches body color
});

// Array to hold our candlestick data
const data = [];

// Establish WebSocket connection to Binance for BTC/USDT 1-minute kline
const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

socket.onopen = () => {
  console.log("✅ WebSocket connected to Binance");
};

socket.onerror = (err) => {
  console.error("❌ WebSocket error:", err);
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const candlestick = message.k; // The 'k' property contains the kline (candlestick) data

  const newPoint = {
    time: Math.floor(candlestick.t / 1000), // Convert ms to seconds
    open: parseFloat(candlestick.o),
    high: parseFloat(candlestick.h),
    low: parseFloat(candlestick.l),
    close: parseFloat(candlestick.c),
  };

  const lastBar = data[data.length - 1];

  if (lastBar && lastBar.time === newPoint.time) {
    // If the new data point is for the current (incomplete) bar, update it
    data[data.length - 1] = newPoint; // Update local data array
    candleSeries.update(newPoint);     // Update chart series
  } else {
    // If it's a new bar, add it to data and set all data
    data.push(newPoint);
    candleSeries.setData(data); // Re-set data to display the new bar correctly
  }
};

// Handle window resizing to make the chart responsive
const resizeObserver = new ResizeObserver(entries => {
    if (entries.length === 0 || entries[0].target !== chartContainer) {
        return;
    }
    const newRect = entries[0].contentRect;
    chart.applyOptions({ height: newRect.height, width: newRect.width });
});

// Start observing the chart container for size changes
resizeObserver.observe(chartContainer);

// Initial resizing in case the container's size is set by CSS after script execution
chart.applyOptions({
  width: chartContainer.clientWidth,
  height: chartContainer.clientHeight,
});
