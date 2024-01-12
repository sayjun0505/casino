// Add Express
const express = require("express");
// Initialize Express
const app = express();
const axios = require('axios');

const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 7071 });
// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.get("/test", (req, res) => {
    res.send({status: 'success'});
})
// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});
module.exports = app;