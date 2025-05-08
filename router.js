const express = require("express");
const app = express();
const authRoutes = require("./src/routes/authRoutes.js");
const menuRoutes = require("./src/routes/menuRoutes.js");
const orderRoutes = require("./src/routes/orderRoutes.js");

app.use("/auth", authRoutes);
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);

module.exports = app;
