const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const bodyParser = require('body-parser')

const port = 3000;
// const index = require("./routes/index");

const app = express();
// app.use(index);

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
// Import socket.io with a connection to a channel (i.e. tops)
const io = socketIo(server);
io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      // This url can be dynamic, as in it can take values from the users db and return quotes for all of their stocks
      "https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,fb,tsla&types=quote,news,chart&range=1m&last=5"
    );
    const data = res.data;

    // To show that we can map through all of the stock data we need
    Object.keys(data).map(stock => console.log(data[stock]))

    socket.emit("FromAPI", data);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

// I used this as an endpoint to test the getApiAndEmit function. For you, you'll use the client websocket you created
app.get('/', (req, res, next) => {
  getApiAndEmit();
})

app.listen(port);