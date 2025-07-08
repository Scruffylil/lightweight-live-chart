const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  width: window.innerWidth,
  height: 500,
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

const candleSeries = chart.addCandlestickSeries({
  upColor: '#26a69a',   // Green for up candles
  downColor: '#ef5350', // Red for down candles
  borderVisible: false, // Borders are usually off in TradingView's default style for candles
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
});

const data = [];

const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

socket.onopen = () => {
  console.log("✅ WebSocket connected");
};

socket.onerror = (err) => {
  console.error("❌ WebSocket error", err);
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const candlestick = message.k;

  const point = {
    time: Math.floor(candlestick.t / 1000),
    open: parseFloat(candlestick.o),
    high: parseFloat(candlestick.h),
    low: parseFloat(candlestick.l),
    close: parseFloat(candlestick.c),
  };

  const lastBar = data[data.length - 1];

  if (lastBar && lastBar.time === point.time) {
    // If it's the current (incomplete) bar, update it
    candleSeries.update(point);
    // You might also want to update the 'data' array for consistency
    data[data.length - 1] = point;
  } else {
    // If it's a new bar, add it
    data.push(point);
    candleSeries.setData(data); // Re-set data to display the new bar correctly
  }
};

// Handle window resizing
new ResizeObserver(entries => {
    if (entries.length === 0 || entries[0].target !== document.getElementById('chart')) {
        return;
    }
    const newRect = entries[0].contentRect;
    chart.applyOptions({ height: newRect.height, width: newRect.width });
}).observe(document.getElementById('chart'));

// Initial data setting (optional, if you have historical data)
// candleSeries.setData(initialHistoricalData);
