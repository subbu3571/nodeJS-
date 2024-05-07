const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const User = mongoose.model('User', {
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} }, 
  createdAt: { type: Date, default: Date.now } 
});


mongoose.connect("mongodb+srv://charanghanta17:Charan123!@cluster0.ufb3wtz.mongodb.net/e-commerce")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: true,
    image_url: `http://localhost:4000/images/${req.file.filename}`
  });
});

// User signup endpoint
app.post("/api/signup", async (req, res) => {
  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ success: false, errors: "User with the same email already exists" });
    }

    // Create a new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, 'secret_ecom', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// User login endpoint
app.post("/api/login", async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ success: false, errors: "Wrong email or password" });
    }

    // Check password
    const isPasswordValid = req.body.password === user.password;
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, errors: "Wrong email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'secret_ecom', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ success: false, errors: "Access denied. Please provide a valid token" });
  }

  try {
    const decoded = jwt.verify(token, 'secret_ecom');
    req.user = decoded.userId;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(400).json({ success: false, errors: "Invalid token" });
  }
};

// Add to cart endpoint
app.post('/addtocart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    // Update cart data
    user.cartData[req.body.itemId] = (user.cartData[req.body.itemId] || 0) + 1;

    // Save updated cart data
    await user.save();

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Remove from cart endpoint
app.post('/removefromcart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    // Update cart data
    if (user.cartData[req.body.itemId] && user.cartData[req.body.itemId] > 0) {
      user.cartData[req.body.itemId]--;
    } else {
      return res.status(400).json({ success: false, errors: "Item not in cart" });
    }

    // Save updated cart data
    await user.save();

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});


app.post('/getcart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }

    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error("Error getting cart data:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
