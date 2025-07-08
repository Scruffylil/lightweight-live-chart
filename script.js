const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  width: window.innerWidth,
  height: 500,
  layout: {
    backgroundColor: '#0e1117',
    textColor: '#d1d4dc',
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
  },
});

const candleSeries = chart.addCandlestickSeries();

const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

let data = [];

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
    data[data.length - 1] = point;
  } else {
    data.push(point);
  }

  candleSeries.setData(data);
};