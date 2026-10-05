require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(express.json());

// CREATE
app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// READ ONE
app.get("/api/products/:pid", async (req, res) => {
  const product = await Product.findOne({ pid: req.params.pid });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

// UPDATE
app.put("/api/products/:pid", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { pid: req.params.pid },
      req.body,
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
app.delete("/api/products/:pid", async (req, res) => {
  const product = await Product.findOneAndDelete({ pid: req.params.pid });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Deleted" });
});

app.get("/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "unavailable",
    mongo: isConnected ? "connected" : "disconnected",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`API running on port ${process.env.PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
