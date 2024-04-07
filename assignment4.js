const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "mongodb+srv://preetpambhar:preetpambhar11032001@preetproject.kxozdrj.mongodb.net/?retryWrites=true&w=majority"
);

// Product Schema and Model
const productSchema = new mongoose.Schema({
  description: String,
  image: String,
  price: Number,
  shipping_cost: Number,
});

const Product = mongoose.model("Product", productSchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  purchase_history: String, // Change to String for simplicity
  shipping_address: String,
});

const User = mongoose.model("User", userSchema);

// Cart Schema and Model
const cartSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Cart = mongoose.model("Cart", cartSchema);

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order_date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Product routes
// Create a new product
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.send("Product inserted successfully");
  } catch (error) {
    res.status(500).send("Error inserting product");
  }
});

// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching products");
  }
});

// Fetch product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).send("Error fetching product");
  }
});

// Update product by ID
app.put("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      res.status(404).send("Product not found");
      return;
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).send("Error updating product");
  }
});

// Delete product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send("Product deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting product");
  }
});

// User routes
// Create a new user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User inserted successfully");
  } catch (error) {
    res.status(500).send("Error inserting user");
  }
});

// Fetch all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Fetch user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user");
  }
});

// Update user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      res.status(404).send("User not found");
      return;
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send("Error updating user");
  }
});

// Delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
});

// Create a new cart
app.post("/carts", async (req, res) => {
  try {
    const { product_id, quantity, user_id } = req.body;
    const cart = new Cart({ product_id, quantity, user_id });
    await cart.save();
    res.send("Cart created successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all carts
app.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update cart by ID
app.put("/carts/:id", async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCart) {
      res.status(404).send("Cart not found");
      return;
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cart by ID
app.delete("/carts/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.send("Cart deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new order
app.post("/orders", async (req, res) => {
  try {
    const { product_id, quantity, user_id } = req.body;

    // Create a new order
    const order = new Order({ product_id, quantity, user_id });
    await order.save();

    // Remove the corresponding product from the cart
    await Cart.deleteOne({ product_id, user_id });

    // Send response with the ID of the newly created order
    res.status(201).json({
      message: "Order created successfully",
      order_id: order._id, // Access the ID of the newly created order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch order by ID
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).send("Order not found");
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all orders by user ID
app.get("/orders/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.find({ user_id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order by ID
app.put("/orders/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrder) {
      res.status(404).send("Order not found");
      return;
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order by ID
app.delete("/orders/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      res.status(404).send("Order not found");
      return;
    }
    res.send("Order deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Port is set to 5000
const PORT = process.env.PORT || 5000;
app.listen(5000, function () {
  console.log("App is listening on port 5000! Go to http://localhost:5000/");
});
