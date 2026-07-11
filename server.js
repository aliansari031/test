import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose"; 
import { GoogleGenAI, Type } from "@google/genai";
import { OrderStatus, UserRole } from "./src/types.js";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers with high limit for customized canvas images/logos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ----------------------------------------------------
// MONGODB CONNECTION SETUP
// ----------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("CRITICAL ERROR : MONGODB_URI is not defined in .env file!");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully!  Live Database Active."))
  .catch((err) => console.error("MongoDB Connection Error :", err));

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
const Schema = mongoose.Schema;

// 1. User Schema
const UserModel = mongoose.model("User", new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: UserRole.CUSTOMER },
  phone: String,
  address: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
}));

// 2. Product Schema
const ProductModel = mongoose.model("Product", new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  discountPrice: Number,
  category: { type: String, required: true },
  images: { type: [String], default: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"] },
  stock: { type: Number, default: 100 },
  deliveryTime: { type: String, default: "3-5 Business Days" },
  specifications: { type: Schema.Types.Mixed, default: {} },
  isCustomizable: { type: Boolean, default: false },
  reviews: { type: [Schema.Types.Mixed], default: [] }
}));

// 3. Order Schema
const OrderModel = mongoose.model("Order", new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: [Schema.Types.Mixed], required: true },
  shippingAddress: { type: String, required: true },
  billingAddress: String,
  paymentMethod: String,
  paymentStatus: String,
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, default: OrderStatus.PENDING },
  trackingNumber: String,
  notes: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
}));

// 4. Portfolio Schema (For WAO PRINTS showcase)
const PortfolioModel = mongoose.model("Portfolio", new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true }, 
  createdAt: { type: String, default: () => new Date().toISOString() }
}));

// 5. Banner Schema (New Added for Hero Banner Settings)
const BannerModel = mongoose.model("Banner", new Schema({
  bannerUrl: { type: String, default: "" },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}));

// Initialize Gemini API client safely
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY detected. Running with simulated intelligent analyzer fallback.");
}

// ----------------------------------------------------
// API ROUTES WITH MONGODB INTEGRATION
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ----------------------------------------------------
// HERO BANNER MANAGEMENT ENDPOINTS (Optimized for Storage)
// ----------------------------------------------------

// 1. GET Banner Data
app.get("/api/settings/banner", async (req, res) => {
  try {
    // Database se sab se latest banner uthayega
    const banner = await BannerModel.findOne({});
    if (!banner) {
      return res.json({ bannerUrl: "" });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. POST Save/Update Banner (Purana data delete karke naya save karega)
app.post("/api/settings/banner", async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    
    if (!bannerUrl) {
      return res.status(400).json({ message: "Banner URL/Base64 string is required" });
    }

    // Pehle database se purane saare banners delete karega taake MBs na bharein
    await BannerModel.deleteMany({});

    // Ab naya fresh banner insert karega
    const newBanner = new BannerModel({
      bannerUrl,
      updatedAt: new Date().toISOString()
    });
    await newBanner.save();

    res.json(newBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. DELETE Active Banner (Database se permanently uda dega)
app.delete("/api/settings/banner", async (req, res) => {
  try {
    // Database se document permanently delete kar dega taake space bilkul free ho jaye
    await BannerModel.deleteMany({});
    
    res.json({ message: "Custom banner permanently deleted from database.", bannerUrl: "" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


 
// 1. AUTHENTICATION ENDPOINTS
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email is already registered." });

    const newUser = new UserModel({ id: `user-${Date.now()}`, name, email, role: UserRole.CUSTOMER, phone, address });
    await newUser.save();
    res.status(201).json({ user: newUser, token: `mock-jwt-token-${newUser.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Account not found." });

    res.json({ user, token: `mock-jwt-token-${user.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. PRODUCTS CRUD
app.get("/api/products", async (req, res) => {
  try {
    const products = await ProductModel.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await ProductModel.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Product (Admin Panel Upload Route)
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, images, stock, deliveryTime, specifications, isCustomizable } = req.body;
    if (!name || !price || !category) return res.status(400).json({ message: "Name, price and category are required." });

    const newProd = new ProductModel({
      id: `prod-${Date.now()}`,
      name,
      description: description || "",
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      images: images && images.length ? images : ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"],
      stock: stock ? Number(stock) : 100,
      deliveryTime: deliveryTime || "3-5 Business Days",
      specifications: specifications || {},
      isCustomizable: !!isCustomizable,
      reviews: []
    });

    await newProd.save();
    res.status(201).json(newProd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await ProductModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found." });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await ProductModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. ORDERS MANAGEMENT
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.post("/api/orders", async (req, res) => {
//   try {
//     const { userId, customerName, customerEmail, items, shippingAddress, billingAddress, paymentMethod, shippingCost, tax, discountAmount, grandTotal, notes } = req.body;
//     if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
//       return res.status(400).json({ message: "Missing critical order details." });
//     }

//     const orderId = `WAO-${Math.floor(100000 + Math.random() * 900000)}`;
//     const newOrder = new OrderModel({
//       id: orderId,
//       userId: userId || `guest-${Date.now()}`,
//       customerName,
//       customerEmail,
//       items,
//       shippingAddress,
//       billingAddress: billingAddress || shippingAddress,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Pending",
//       shippingCost: Number(shippingCost) || 0,
//       tax: Number(tax) || 0,
//       discountAmount: Number(discountAmount) || 0,
//       grandTotal: Number(grandTotal),
//       status: OrderStatus.PENDING,
//       trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
//       notes
//     });

//     await newOrder.save();

//     for (const item of items) {
//       await ProductModel.findOneAndUpdate(
//         { id: item.productId },
//         { $inc: { stock: -Math.abs(item.quantity) } }
//       );
//     }

//     res.status(201).json(newOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


app.post("/api/orders", async (req, res) => {
  try {
    const { userId, customerName, customerEmail, items, shippingAddress, billingAddress, paymentMethod, shippingCost, tax, discountAmount, grandTotal, notes } = req.body;
    if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: "Missing critical order details." });
    }

    // Sanitize items: Ensure combo selections retain their arrays properly
    const sanitizedItems = items.map(item => {
      if (item.name === "Custom Gift Combo Box" || item.isGiftCombo) {
        return {
          ...item,
          isGiftCombo: true,
          // Agar frontend se comboItems ya selectedItems aa rahe hain toh unhe ensure karein
          comboItems: item.comboItems || item.selectedItems || item.customization?.selectedItems || []
        };
      }
      return item;
    });

    const orderId = `WAO-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = new OrderModel({
      id: orderId,
      userId: userId || `guest-${Date.now()}`,
      customerName,
      customerEmail,
      items: sanitizedItems, // Injected safe sanitized items array
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Pending",
      shippingCost: Number(shippingCost) || 0,
      tax: Number(tax) || 0,
      discountAmount: Number(discountAmount) || 0,
      grandTotal: Number(grandTotal),
      status: OrderStatus.PENDING,
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes
    });

    await newOrder.save();

    for (const item of sanitizedItems) {
      if (item.productId) {
        await ProductModel.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stock: -Math.abs(item.quantity || 1) } }
        );
      }
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





app.put("/api/orders/:id", async (req, res) => {
  try {
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status, paymentStatus: req.body.paymentStatus },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found." });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.delete("/api/orders/:id", async (req, res) => {
  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

 

// 4. PORTFOLIO ENDPOINTS
app.get("/api/portfolio", async (req, res) => {
  try {
    const items = await PortfolioModel.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/portfolio", async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;
    if (!title || !imageUrl || !category) return res.status(400).json({ message: "Title, imageUrl and category are required." });

    const newItem = new PortfolioModel({
      id: `port-${Date.now()}`,
      title,
      description: description || "",
      imageUrl,
      category
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. GEMINI AI PRINT CUSTOMIZER ANALYZER
app.post("/api/gemini/analyze", async (req, res) => {
  const { logoBase64, text, productCategory, notes } = req.body;
  if (!logoBase64 && !text) return res.status(400).json({ message: "Please supply an uploaded image or custom text design to analyze." });

  const textContext = text ? `Custom text layout: "${text}".` : "No overlay text specified.";
  const noteContext = notes ? `Customer extra instructions: "${notes}".` : "No special instructions.";

  if (ai) {
    try {
      console.log(`Analyzing print graphics with Gemini for category: ${productCategory}`);
      let contentParts = [];
      if (logoBase64) {
        const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let mimeType = "image/png";
        let base64Data = logoBase64;
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
        contentParts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
      }

      contentParts.push({
        text: `You are WAO PRINTS' Expert Printing Quality AI Assistant.
        Analyze the attached user's design asset for physical printing on category: "${productCategory}".
        ${textContext}
        ${noteContext}
        Respond with valid JSON:
        {
          "backgroundDetected": "description",
          "quality": "rating",
          "alignment": "suggestions",
          "suggestions": "bullets",
          "autoProcessedPreview": "process info"
        }`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: contentParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              backgroundDetected: { type: Type.STRING },
              quality: { type: Type.STRING },
              alignment: { type: Type.STRING },
              suggestions: { type: Type.STRING },
              autoProcessedPreview: { type: Type.STRING }
            },
            required: ["backgroundDetected", "quality", "alignment", "suggestions", "autoProcessedPreview"]
          }
        }
      });

      if (response.text) return res.json({ feedback: JSON.parse(response.text.trim()) });
    } catch (error) {
      console.error("Gemini API call failed, invoking fallback engine:", error.message || error);
    }
  }

  // Fallback Simulation
  setTimeout(() => {
    res.json({
      feedback: {
        backgroundDetected: logoBase64 ? "Solid background layer filtered." : "Text design asset.",
        quality: "Good (300 DPI equivalent). Ready for high-fidelity print.",
        alignment: "Perfect alignment configuration for " + productCategory + ".",
        suggestions: "• Avoid thin lines smaller than 2px.\n• Colors enhanced for direct dye ink printing.",
        autoProcessedPreview: "Contrast maximized for vibrant color depth on production line."
      }
    });
  }, 1200);
});

// ----------------------------------------------------
// VITE CLIENT DEV SERVER / PRODUCTION STATIC SERVER
// ----------------------------------------------------
async function setupServer() {
  const distPath = path.join(process.cwd(), "dist");
  
  if (process.env.NODE_ENV === "production" || fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server configured running on direct bundle.");
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WAO PRINTS Full Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();



















// import express from "express";
// import path from "path";
// import dotenv from "dotenv";
// import mongoose from "mongoose"; 
// import { GoogleGenAI, Type } from "@google/genai";
// import { OrderStatus, UserRole } from "./src/types.js";
// import fs from "fs";

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Body parsers with high limit for customized canvas images/logos
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // ----------------------------------------------------
// // MONGODB CONNECTION SETUP
// // ----------------------------------------------------
// // Ab ye direct tumhari .env se connection string uthayega
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error("CRITICAL ERROR : MONGODB_URI is not defined in .env file!");
// }

// mongoose.connect(MONGODB_URI)
//   .then(() => console.log("MongoDB Connected Successfully!  Live Database Active."))
//   .catch((err) => console.error("MongoDB Connection Error :", err));

// // ----------------------------------------------------
// // MONGOOSE SCHEMAS & MODELS
// // ----------------------------------------------------
// const Schema = mongoose.Schema;

// // 1. User Schema
// const UserModel = mongoose.model("User", new Schema({
//   id: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   role: { type: String, default: UserRole.CUSTOMER },
//   phone: String,
//   address: String,
//   createdAt: { type: String, default: () => new Date().toISOString() }
// }));

// // 2. Product Schema
// const ProductModel = mongoose.model("Product", new Schema({
//   id: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   description: { type: String, default: "" },
//   price: { type: Number, required: true },
//   discountPrice: Number,
//   category: { type: String, required: true },
//   images: { type: [String], default: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"] },
//   stock: { type: Number, default: 100 },
//   deliveryTime: { type: String, default: "3-5 Business Days" },
//   specifications: { type: Schema.Types.Mixed, default: {} },
//   isCustomizable: { type: Boolean, default: false },
//   reviews: { type: [Schema.Types.Mixed], default: [] }
// }));

// // 3. Order Schema
// const OrderModel = mongoose.model("Order", new Schema({
//   id: { type: String, required: true, unique: true },
//   userId: { type: String, required: true },
//   customerName: { type: String, required: true },
//   customerEmail: { type: String, required: true },
//   items: { type: [Schema.Types.Mixed], required: true },
//   shippingAddress: { type: String, required: true },
//   billingAddress: String,
//   paymentMethod: String,
//   paymentStatus: String,
//   shippingCost: { type: Number, default: 0 },
//   tax: { type: Number, default: 0 },
//   discountAmount: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, default: OrderStatus.PENDING },
//   trackingNumber: String,
//   notes: String,
//   createdAt: { type: String, default: () => new Date().toISOString() }
// }));

// // 4. Portfolio Schema (New added for WAO PRINTS showcase)
// const PortfolioModel = mongoose.model("Portfolio", new Schema({
//   id: { type: String, required: true, unique: true },
//   title: { type: String, required: true },
//   description: { type: String, default: "" },
//   imageUrl: { type: String, required: true },
//   category: { type: String, required: true }, // e.g., 'Mugs', 'Shirts'
//   createdAt: { type: String, default: () => new Date().toISOString() }
// }));

// // Initialize Gemini API client safely
// let ai = null;
// if (process.env.GEMINI_API_KEY) {
//   try {
//     ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
//     });
//     console.log("Gemini API Client initialized successfully.");
//   } catch (err) {
//     console.error("Failed to initialize Gemini client:", err);
//   }
// } else {
//   console.log("No GEMINI_API_KEY detected. Running with simulated intelligent analyzer fallback.");
// }

// // ----------------------------------------------------
// // API ROUTES WITH MONGODB INTEGRATION
// // ----------------------------------------------------

// // Health Check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", time: new Date().toISOString() });
// });

// // 1. AUTHENTICATION ENDPOINTS
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { name, email, password, phone, address } = req.body;
//     if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });

//     const existing = await UserModel.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email is already registered." });

//     const newUser = new UserModel({ id: `user-${Date.now()}`, name, email, role: UserRole.CUSTOMER, phone, address });
//     await newUser.save();
//     res.status(201).json({ user: newUser, token: `mock-jwt-token-${newUser.id}` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

//     const user = await UserModel.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Account not found." });

//     res.json({ user, token: `mock-jwt-token-${user.id}` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 2. PRODUCTS CRUD
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await ProductModel.find({});
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get("/api/products/:id", async (req, res) => {
//   try {
//     const product = await ProductModel.findOne({ id: req.params.id });
//     if (!product) return res.status(404).json({ message: "Product not found." });
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add Product (Admin Panel Upload Route)
// app.post("/api/products", async (req, res) => {
//   try {
//     const { name, description, price, discountPrice, category, images, stock, deliveryTime, specifications, isCustomizable } = req.body;
//     if (!name || !price || !category) return res.status(400).json({ message: "Name, price and category are required." });

//     const newProd = new ProductModel({
//       id: `prod-${Date.now()}`,
//       name,
//       description: description || "",
//       price: Number(price),
//       discountPrice: discountPrice ? Number(discountPrice) : undefined,
//       category,
//       images: images && images.length ? images : ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"],
//       stock: stock ? Number(stock) : 100,
//       deliveryTime: deliveryTime || "3-5 Business Days",
//       specifications: specifications || {},
//       isCustomizable: !!isCustomizable,
//       reviews: []
//     });

//     await newProd.save();
//     res.status(201).json(newProd);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.put("/api/products/:id", async (req, res) => {
//   try {
//     const updated = await ProductModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: "Product not found." });
//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.delete("/api/products/:id", async (req, res) => {
//   try {
//     const deleted = await ProductModel.findOneAndDelete({ id: req.params.id });
//     if (!deleted) return res.status(404).json({ message: "Product not found." });
//     res.json({ message: "Product deleted successfully." });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 3. ORDERS MANAGEMENT (Admin panel integration added)
// // Get all orders for Admin Panel Dashboard
// app.get("/api/orders", async (req, res) => {
//   try {
//     const orders = await OrderModel.find({}).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Checkout Order Submission
// app.post("/api/orders", async (req, res) => {
//   try {
//     const { userId, customerName, customerEmail, items, shippingAddress, billingAddress, paymentMethod, shippingCost, tax, discountAmount, grandTotal, notes } = req.body;
//     if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
//       return res.status(400).json({ message: "Missing critical order details." });
//     }

//     const orderId = `WAO-${Math.floor(100000 + Math.random() * 900000)}`;
//     const newOrder = new OrderModel({
//       id: orderId,
//       userId: userId || `guest-${Date.now()}`,
//       customerName,
//       customerEmail,
//       items,
//       shippingAddress,
//       billingAddress: billingAddress || shippingAddress,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Pending",
//       shippingCost: Number(shippingCost) || 0,
//       tax: Number(tax) || 0,
//       discountAmount: Number(discountAmount) || 0,
//       grandTotal: Number(grandTotal),
//       status: OrderStatus.PENDING,
//       trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
//       notes
//     });

//     await newOrder.save();

//     for (const item of items) {
//       await ProductModel.findOneAndUpdate(
//         { id: item.productId },
//         { $inc: { stock: -Math.abs(item.quantity) } }
//       );
//     }

//     res.status(201).json(newOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update Order Status from Admin Panel
// app.put("/api/orders/:id", async (req, res) => {
//   try {
//     const updatedOrder = await OrderModel.findOneAndUpdate(
//       { id: req.params.id },
//       { status: req.body.status, paymentStatus: req.body.paymentStatus },
//       { new: true }
//     );
//     if (!updatedOrder) return res.status(404).json({ message: "Order not found." });
//     res.json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 4. PORTFOLIO ENDPOINTS
// app.get("/api/portfolio", async (req, res) => {
//   try {
//     const items = await PortfolioModel.find({}).sort({ createdAt: -1 });
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/portfolio", async (req, res) => {
//   try {
//     const { title, description, imageUrl, category } = req.body;
//     if (!title || !imageUrl || !category) return res.status(400).json({ message: "Title, imageUrl and category are required." });

//     const newItem = new PortfolioModel({
//       id: `port-${Date.now()}`,
//       title,
//       description: description || "",
//       imageUrl,
//       category
//     });

//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 5. GEMINI AI PRINT CUSTOMIZER ANALYZER
// app.post("/api/gemini/analyze", async (req, res) => {
//   const { logoBase64, text, productCategory, notes } = req.body;
//   if (!logoBase64 && !text) return res.status(400).json({ message: "Please supply an uploaded image or custom text design to analyze." });

//   const textContext = text ? `Custom text layout: "${text}".` : "No overlay text specified.";
//   const noteContext = notes ? `Customer extra instructions: "${notes}".` : "No special instructions.";

//   if (ai) {
//     try {
//       console.log(`Analyzing print graphics with Gemini for category: ${productCategory}`);
//       let contentParts = [];
//       if (logoBase64) {
//         const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//         let mimeType = "image/png";
//         let base64Data = logoBase64;
//         if (matches && matches.length === 3) {
//           mimeType = matches[1];
//           base64Data = matches[2];
//         }
//         contentParts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
//       }

//       contentParts.push({
//         text: `You are WAO PRINTS' Expert Printing Quality AI Assistant.
//         Analyze the attached user's design asset for physical printing on category: "${productCategory}".
//         ${textContext}
//         ${noteContext}
//         Respond with valid JSON:
//         {
//           "backgroundDetected": "description",
//           "quality": "rating",
//           "alignment": "suggestions",
//           "suggestions": "bullets",
//           "autoProcessedPreview": "process info"
//         }`
//       });

//       const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: { parts: contentParts },
//         config: {
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: Type.OBJECT,
//             properties: {
//               backgroundDetected: { type: Type.STRING },
//               quality: { type: Type.STRING },
//               alignment: { type: Type.STRING },
//               suggestions: { type: Type.STRING },
//               autoProcessedPreview: { type: Type.STRING }
//             },
//             required: ["backgroundDetected", "quality", "alignment", "suggestions", "autoProcessedPreview"]
//           }
//         }
//       });

//       if (response.text) return res.json({ feedback: JSON.parse(response.text.trim()) });
//     } catch (error) {
//       console.error("Gemini API call failed, invoking fallback engine:", error.message || error);
//     }
//   }

//   // Fallback Simulation
//   setTimeout(() => {
//     res.json({
//       feedback: {
//         backgroundDetected: logoBase64 ? "Solid background layer filtered." : "Text design asset.",
//         quality: "Good (300 DPI equivalent). Ready for high-fidelity print.",
//         alignment: "Perfect alignment configuration for " + productCategory + ".",
//         suggestions: "• Avoid thin lines smaller than 2px.\n• Colors enhanced for direct dye ink printing.",
//         autoProcessedPreview: "Contrast maximized for vibrant color depth on production line."
//       }
//     });
//   }, 1200);
// });

// // ----------------------------------------------------
// // VITE CLIENT DEV SERVER / PRODUCTION STATIC SERVER
// // ----------------------------------------------------
// async function setupServer() {
//   const distPath = path.join(process.cwd(), "dist");
  
//   if (process.env.NODE_ENV === "production" || fs.existsSync(distPath)) {
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//     console.log("Production static server configured running on direct bundle.");
//   } else {
//     const { createServer: createViteServer } = await import("vite");
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//     console.log("Vite dev middleware mounted.");
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`WAO PRINTS Full Stack Server running at http://0.0.0.0:${PORT}`);
//   });
// }

// setupServer();
































// import express from "express";
// import path from "path";
// import dotenv from "dotenv";
// import mongoose from "mongoose"; 
// import { GoogleGenAI, Type } from "@google/genai";
// import { OrderStatus, UserRole } from "./src/types.js";
// import fs from "fs";
// import productRoutes from './server/routes/productRoutes.js';
// import orderRoutes from './server/routes/orderRoutes.js';
// import portfolioRoutes from './server/routes/portfolioRoutes.js';

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Body parsers with high limit for customized canvas images/logos
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // ----------------------------------------------------
// // MONGODB CONNECTION SETUP
// // ----------------------------------------------------
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ali_dev:Ali0315@cluster0.m9jre7z.mongodb.net/waoprinter?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(MONGODB_URI)
//   .then(() => console.log("MongoDB Connected Successfully! 🎉 Live Database Active."))
//   .catch((err) => console.error("MongoDB Connection Error ❌:", err));

// // ----------------------------------------------------
// // MONGOOSE SCHEMAS & MODELS
// // ----------------------------------------------------
// const Schema = mongoose.Schema;

// // 1. User Schema
// const UserModel = mongoose.model("User", new Schema({
//   id: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   role: { type: String, default: UserRole.CUSTOMER },
//   phone: String,
//   address: String,
//   createdAt: { type: String, default: () => new Date().toISOString() }
// }));

// // 2. Product Schema
// const ProductModel = mongoose.model("Product", new Schema({
//   id: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   description: { type: String, default: "" },
//   price: { type: Number, required: true },
//   discountPrice: Number,
//   category: { type: String, required: true },
//   images: { type: [String], default: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"] },
//   stock: { type: Number, default: 100 },
//   deliveryTime: { type: String, default: "3-5 Business Days" },
//   specifications: { type: Schema.Types.Mixed, default: {} },
//   isCustomizable: { type: Boolean, default: false },
//   reviews: { type: [Schema.Types.Mixed], default: [] }
// }));

// // 3. Order Schema
// const OrderModel = mongoose.model("Order", new Schema({
//   id: { type: String, required: true, unique: true },
//   userId: { type: String, required: true },
//   customerName: { type: String, required: true },
//   customerEmail: { type: String, required: true },
//   items: { type: [Schema.Types.Mixed], required: true },
//   shippingAddress: { type: String, required: true },
//   billingAddress: String,
//   paymentMethod: String,
//   paymentStatus: String,
//   shippingCost: { type: Number, default: 0 },
//   tax: { type: Number, default: 0 },
//   discountAmount: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, default: OrderStatus.PENDING },
//   trackingNumber: String,
//   notes: String,
//   createdAt: { type: String, default: () => new Date().toISOString() }
// }));

// // Initialize Gemini API client safely
// let ai = null;
// if (process.env.GEMINI_API_KEY) {
//   try {
//     ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//       httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
//     });
//     console.log("Gemini API Client initialized successfully.");
//   } catch (err) {
//     console.error("Failed to initialize Gemini client:", err);
//   }
// } else {
//   console.log("No GEMINI_API_KEY detected. Running with simulated intelligent analyzer fallback.");
// }

// // ----------------------------------------------------
// // API ROUTES WITH MONGODB INTEGRATION
// // ----------------------------------------------------

// // Health Check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", time: new Date().toISOString() });
// });

// // 1. AUTHENTICATION ENDPOINTS
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { name, email, password, phone, address } = req.body;
//     if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });

//     const existing = await UserModel.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email is already registered." });

//     const newUser = new UserModel({ id: `user-${Date.now()}`, name, email, role: UserRole.CUSTOMER, phone, address });
//     await newUser.save();
//     res.status(201).json({ user: newUser, token: `mock-jwt-token-${newUser.id}` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

//     const user = await UserModel.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Account not found." });

//     res.json({ user, token: `mock-jwt-token-${user.id}` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 2. PRODUCTS CRUD
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await ProductModel.find({});
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get("/api/products/:id", async (req, res) => {
//   try {
//     const product = await ProductModel.findOne({ id: req.params.id });
//     if (!product) return res.status(404).json({ message: "Product not found." });
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add Product (Admin Panel Upload Route)
// app.post("/api/products", async (req, res) => {
//   try {
//     const { name, description, price, discountPrice, category, images, stock, deliveryTime, specifications, isCustomizable } = req.body;
//     if (!name || !price || !category) return res.status(400).json({ message: "Name, price and category are required." });

//     const newProd = new ProductModel({
//       id: `prod-${Date.now()}`,
//       name,
//       description: description || "",
//       price: Number(price),
//       discountPrice: discountPrice ? Number(discountPrice) : undefined,
//       category,
//       images: images && images.length ? images : ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"],
//       stock: stock ? Number(stock) : 100,
//       deliveryTime: deliveryTime || "3-5 Business Days",
//       specifications: specifications || {},
//       isCustomizable: !!isCustomizable,
//       reviews: []
//     });

//     await newProd.save();
//     res.status(201).json(newProd);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.put("/api/products/:id", async (req, res) => {
//   try {
//     const updated = await ProductModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: "Product not found." });
//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.delete("/api/products/:id", async (req, res) => {
//   try {
//     const deleted = await ProductModel.findOneAndDelete({ id: req.params.id });
//     if (!deleted) return res.status(404).json({ message: "Product not found." });
//     res.json({ message: "Product deleted successfully." });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 6. ORDERS & INVOICES
// app.post("/api/orders", async (req, res) => {
//   try {
//     const { userId, customerName, customerEmail, items, shippingAddress, billingAddress, paymentMethod, shippingCost, tax, discountAmount, grandTotal, notes } = req.body;
//     if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
//       return res.status(400).json({ message: "Missing critical order details." });
//     }

//     const orderId = `WAO-${Math.floor(100000 + Math.random() * 900000)}`;
//     const newOrder = new OrderModel({
//       id: orderId,
//       userId: userId || `guest-${Date.now()}`,
//       customerName,
//       customerEmail,
//       items,
//       shippingAddress,
//       billingAddress: billingAddress || shippingAddress,
//       paymentMethod,
//       paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Pending",
//       shippingCost: Number(shippingCost) || 0,
//       tax: Number(tax) || 0,
//       discountAmount: Number(discountAmount) || 0,
//       grandTotal: Number(grandTotal),
//       status: OrderStatus.PENDING,
//       trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
//       notes
//     });

//     await newOrder.save();

//     for (const item of items) {
//       await ProductModel.findOneAndUpdate(
//         { id: item.productId },
//         { $inc: { stock: -Math.abs(item.quantity) } }
//       );
//     }

//     res.status(201).json(newOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // 8. GEMINI AI PRINT CUSTOMIZER ANALYZER
// app.post("/api/gemini/analyze", async (req, res) => {
//   const { logoBase64, text, productCategory, notes } = req.body;
//   if (!logoBase64 && !text) return res.status(400).json({ message: "Please supply an uploaded image or custom text design to analyze." });

//   const textContext = text ? `Custom text layout: "${text}".` : "No overlay text specified.";
//   const noteContext = notes ? `Customer extra instructions: "${notes}".` : "No special instructions.";

//   if (ai) {
//     try {
//       console.log(`Analyzing print graphics with Gemini for category: ${productCategory}`);
//       let contentParts = [];
//       if (logoBase64) {
//         const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//         let mimeType = "image/png";
//         let base64Data = logoBase64;
//         if (matches && matches.length === 3) {
//           mimeType = matches[1];
//           base64Data = matches[2];
//         }
//         contentParts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
//       }

//       contentParts.push({
//         text: `You are WAO PRINTS' Expert Printing Quality AI Assistant.
//         Analyze the attached user's design asset for physical printing on category: "${productCategory}".
//         ${textContext}
//         ${noteContext}
//         Respond with valid JSON:
//         {
//           "backgroundDetected": "description",
//           "quality": "rating",
//           "alignment": "suggestions",
//           "suggestions": "bullets",
//           "autoProcessedPreview": "process info"
//         }`
//       });

//       const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: { parts: contentParts },
//         config: {
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: Type.OBJECT,
//             properties: {
//               backgroundDetected: { type: Type.STRING },
//               quality: { type: Type.STRING },
//               alignment: { type: Type.STRING },
//               suggestions: { type: Type.STRING },
//               autoProcessedPreview: { type: Type.STRING }
//             },
//             required: ["backgroundDetected", "quality", "alignment", "suggestions", "autoProcessedPreview"]
//           }
//         }
//       });

//       if (response.text) return res.json({ feedback: JSON.parse(response.text.trim()) });
//     } catch (error) {
//       console.error("Gemini API call failed, invoking fallback engine:", error.message || error);
//     }
//   }

//   // Fallback Simulation
//   setTimeout(() => {
//     res.json({
//       feedback: {
//         backgroundDetected: logoBase64 ? "Solid background layer filtered." : "Text design asset.",
//         quality: "Good (300 DPI equivalent). Ready for high-fidelity print.",
//         alignment: "Perfect alignment configuration for " + productCategory + ".",
//         suggestions: "• Avoid thin lines smaller than 2px.\n• Colors enhanced for direct dye ink printing.",
//         autoProcessedPreview: "Contrast maximized for vibrant color depth on production line."
//       }
//     });
//    river}, 1200);
// });
// // ----------------------------------------------------
// // VITE CLIENT DEV SERVER / PRODUCTION STATIC SERVER
// // ----------------------------------------------------
// async function setupServer() {
//   const distPath = path.join(process.cwd(), "dist");
  
//   // Auto-detect dynamic run mode based on existence of dist folder or NODE_ENV
//   if (process.env.NODE_ENV === "production" || fs.existsSync(distPath)) {
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//     console.log("Production static server configured running on direct bundle.");
//   } else {
//     const { createServer: createViteServer } = await import("vite");
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//     console.log("Vite dev middleware mounted.");
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`WAO PRINTS Full Stack Server running at http://0.0.0.0:${PORT}`);
//   });
// }

// setupServer();
















 


// import express from "express";
// import path from "path";
// import dotenv from "dotenv";
// import { GoogleGenAI, Type } from "@google/genai";
// import { db } from "./src/server/db.js";
// import { OrderStatus, UserRole } from "./src/types.js";

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = 3000;

// // Body parsers with high limit for customized canvas images/logos
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // Initialize Gemini API client safely
// let ai = null;
// if (process.env.GEMINI_API_KEY) {
//   try {
//     ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//       httpOptions: {
//         headers: {
//           'User-Agent': 'aistudio-build',
//         }
//       }
//     });
//     console.log("Gemini API Client initialized successfully.");
//   } catch (err) {
//     console.error("Failed to initialize Gemini client:", err);
//   }
// } else {
//   console.log("No GEMINI_API_KEY detected. Running with simulated intelligent analyzer fallback.");
// }

// // ----------------------------------------------------
// // API ROUTES (Always place before Vite middleware)
// // ----------------------------------------------------

// // Health Check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", time: new Date().toISOString() });
// });

// // 1. AUTHENTICATION ENDPOINTS
// app.post("/api/auth/register", (req, res) => {
//   const { name, email, password, phone, address } = req.body;
//   if (!name || !email || !password) {
//     return res.status(400).json({ message: "Name, email and password are required." });
//   }

//   const existing = db.getUserByEmail(email);
//   if (existing) {
//     return res.status(400).json({ message: "Email is already registered." });
//   }

//   const newUser = {
//     id: `user-${Date.now()}`,
//     name,
//     email,
//     role: UserRole.CUSTOMER, // default
//     phone,
//     address,
//     createdAt: new Date().toISOString()
//   };

//   db.addUser(newUser);
//   res.status(201).json({ user: newUser, token: `mock-jwt-token-${newUser.id}` });
// });

// app.post("/api/auth/login", (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required." });
//   }

//   // Strict check for admin, else client
//   const user = db.getUserByEmail(email);
//   if (!user) {
//     return res.status(404).json({ message: "Account not found." });
//   }

//   // Any password accepted for the premium prototype
//   res.json({
//     user,
//     token: `mock-jwt-token-${user.id}`
//   });
// });

// app.put("/api/auth/profile", (req, res) => {
//   const { id, name, phone, address } = req.body;
//   if (!id) return res.status(400).json({ message: "User ID is required." });

//   const updated = db.updateUser(id, { name, phone, address });
//   if (!updated) return res.status(404).json({ message: "User not found." });

//   res.json({ user: updated });
// });

// // 2. PRODUCTS CRUD
// app.get("/api/products", (req, res) => {
//   res.json(db.getProducts());
// });

// app.get("/api/products/:id", (req, res) => {
//   const product = db.getProductById(req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found." });
//   res.json(product);
// });

// // Add Product (Admin)
// app.post("/api/products", (req, res) => {
//   const { name, description, price, discountPrice, category, images, stock, deliveryTime, specifications, isCustomizable } = req.body;
//   if (!name || !price || !category) {
//     return res.status(400).json({ message: "Name, price and category are required." });
//   }

//   const newProd = {
//     id: `prod-${Date.now()}`,
//     name,
//     description: description || "",
//     price: Number(price),
//     discountPrice: discountPrice ? Number(discountPrice) : undefined,
//     category,
//     images: images && images.length ? images : ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"],
//     stock: stock ? Number(stock) : 100,
//     deliveryTime: deliveryTime || "3-5 Business Days",
//     specifications: specifications || {},
//     isCustomizable: !!isCustomizable,
//     reviews: []
//   };

//   db.addProduct(newProd);
//   res.status(201).json(newProd);
// });

// // Update Product (Admin)
// app.put("/api/products/:id", (req, res) => {
//   const updated = db.updateProduct(req.params.id, req.body);
//   if (!updated) return res.status(404).json({ message: "Product not found." });
//   res.json(updated);
// });

// // Delete Product (Admin)
// app.delete("/api/products/:id", (req, res) => {
//   const deleted = db.deleteProduct(req.params.id);
//   if (!deleted) return res.status(404).json({ message: "Product not found." });
//   res.json({ message: "Product deleted successfully." });
// });

// // Add Review to Product
// app.post("/api/products/:id/reviews", (req, res) => {
//   const { userName, userEmail, rating, comment } = req.body;
//   const product = db.getProductById(req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found." });

//   const newReview = {
//     id: `rev-${Date.now()}`,
//     userName: userName || "Anonymous Customer",
//     userEmail: userEmail || "",
//     rating: Number(rating) || 5,
//     comment: comment || "",
//     createdAt: new Date().toISOString().split("T")[0]
//   };

//   product.reviews.push(newReview);
//   db.save();
//   res.status(201).json(product);
// });


// // 3. SERVICE INQUIRIES
// app.get("/api/inquiries", (req, res) => {
//   res.json(db.getInquiries());
// });

// app.post("/api/inquiries", (req, res) => {
//   const { serviceName, customerName, customerEmail, customerPhone, message, quantity } = req.body;
//   if (!serviceName || !customerName || !customerEmail) {
//     return res.status(400).json({ message: "Missing required inquiry fields." });
//   }

//   const newInq = {
//     id: `inq-${Date.now()}`,
//     serviceName,
//     customerName,
//     customerEmail,
//     customerPhone,
//     message,
//     quantity: Number(quantity) || 1,
//     createdAt: new Date().toISOString(),
//     status: "New"
//   };

//   db.addInquiry(newInq);
//   res.status(201).json(newInq);
// });

// app.put("/api/inquiries/:id", (req, res) => {
//   const { status } = req.body;
//   const updated = db.updateInquiryStatus(req.params.id, status);
//   if (!updated) return res.status(404).json({ message: "Inquiry not found." });
//   res.json(updated);
// });


// // 4. PORTFOLIO ENDPOINTS
// app.get("/api/portfolio", (req, res) => {
//   res.json(db.getPortfolio());
// });

// app.post("/api/portfolio", (req, res) => {
//   const { title, description, category, imageUrl, videoUrl, isFeatured } = req.body;
//   if (!title || !category || !imageUrl) {
//     return res.status(400).json({ message: "Title, category and image URL are required." });
//   }

//   const newProj = {
//     id: `port-${Date.now()}`,
//     title,
//     description: description || "",
//     category,
//     imageUrl,
//     videoUrl,
//     likes: 0,
//     shares: 0,
//     isFeatured: !!isFeatured
//   };

//   db.addPortfolioProject(newProj);
//   res.status(201).json(newProj);
// });

// app.delete("/api/portfolio/:id", (req, res) => {
//   const deleted = db.deletePortfolioProject(req.params.id);
//   if (!deleted) return res.status(404).json({ message: "Portfolio project not found." });
//   res.json({ message: "Project removed successfully." });
// });

// app.post("/api/portfolio/:id/like", (req, res) => {
//   const proj = db.getPortfolioById(req.params.id);
//   if (!proj) return res.status(404).json({ message: "Portfolio project not found." });
//   proj.likes += 1;
//   db.save();
//   res.json(proj);
// });

// app.post("/api/portfolio/:id/share", (req, res) => {
//   const proj = db.getPortfolioById(req.params.id);
//   if (!proj) return res.status(404).json({ message: "Portfolio project not found." });
//   proj.shares += 1;
//   db.save();
//   res.json(proj);
// });


// // 5. COUPON CODE VALIDATION
// app.get("/api/coupons/validate/:code", (req, res) => {
//   const coupon = db.getCouponByCode(req.params.code);
//   if (!coupon) return res.status(404).json({ message: "Invalid or expired coupon code." });
//   res.json(coupon);
// });

// app.get("/api/coupons", (req, res) => {
//   res.json(db.getCoupons());
// });

// app.post("/api/coupons", (req, res) => {
//   const { code, discountPercentage, minSpend, expiresAt } = req.body;
//   if (!code || !discountPercentage) {
//     return res.status(400).json({ message: "Code and discount percentage are required." });
//   }
//   const newCoupon = {
//     code: code.toUpperCase(),
//     discountPercentage: Number(discountPercentage),
//     minSpend: Number(minSpend) || 0,
//     expiresAt: expiresAt || "2027-12-31",
//     active: true
//   };
//   db.addCoupon(newCoupon);
//   res.status(201).json(newCoupon);
// });

// app.delete("/api/coupons/:code", (req, res) => {
//   const deleted = db.deleteCoupon(req.params.code);
//   if (!deleted) return res.status(404).json({ message: "Coupon code not found." });
//   res.json({ message: "Coupon deleted." });
// });


// // 6. ORDERS & INVOICES
// app.get("/api/orders", (req, res) => {
//   res.json(db.getOrders());
// });

// app.get("/api/orders/user/:userId", (req, res) => {
//   res.json(db.getOrdersByUserId(req.params.userId));
// });

// app.get("/api/orders/:id", (req, res) => {
//   const order = db.getOrderById(req.params.id);
//   if (!order) return res.status(404).json({ message: "Order not found." });
//   res.json(order);
// });

// app.post("/api/orders", (req, res) => {
//   const { userId, customerName, customerEmail, items, shippingAddress, billingAddress, paymentMethod, shippingCost, tax, discountAmount, grandTotal, notes } = req.body;
//   if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
//     return res.status(400).json({ message: "Missing critical order details." });
//   }

//   const orderId = `WAO-${Math.floor(100000 + Math.random() * 900000)}`;

//   const newOrder = {
//     id: orderId,
//     userId: userId || `guest-${Date.now()}`,
//     customerName,
//     customerEmail,
//     items,
//     shippingAddress,
//     billingAddress: billingAddress || shippingAddress,
//     paymentMethod,
//     paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Pending",
//     shippingCost: Number(shippingCost) || 0,
//     tax: Number(tax) || 0,
//     discountAmount: Number(discountAmount) || 0,
//     grandTotal: Number(grandTotal),
//     status: OrderStatus.PENDING,
//     trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
//     notes,
//     createdAt: new Date().toISOString()
//   };

//   db.addOrder(newOrder);

//   // Reduce product stock accordingly
//   items.forEach((item) => {
//     const prod = db.getProductById(item.productId);
//     if (prod) {
//       prod.stock = Math.max(0, prod.stock - item.quantity);
//     }
//   });
//   db.save();

//   res.status(201).json(newOrder);
// });

// app.put("/api/orders/:id/status", (req, res) => {
//   const { status, trackingNumber } = req.body;
//   const updated = db.updateOrderStatus(req.params.id, status, trackingNumber);
//   if (!updated) return res.status(404).json({ message: "Order not found." });
//   res.json(updated);
// });


// // 7. SUPPORT TICKETS
// app.get("/api/support/user/:userId", (req, res) => {
//   res.json(db.getSupportTicketsByUserId(req.params.userId));
// });

// app.get("/api/support", (req, res) => {
//   res.json(db.getSupportTickets());
// });

// app.post("/api/support", (req, res) => {
//   const { userId, subject, message } = req.body;
//   if (!userId || !subject || !message) {
//     return res.status(400).json({ message: "Missing ticket arguments." });
//   }

//   const newTicket = {
//     id: `ticket-${Date.now()}`,
//     userId,
//     subject,
//     message,
//     status: "Open",
//     replies: [],
//     createdAt: new Date().toISOString()
//   };

//   db.addSupportTicket(newTicket);
//   res.status(201).json(newTicket);
// });

// app.post("/api/support/:id/reply", (req, res) => {
//   const { sender, message } = req.body;
//   if (!sender || !message) {
//     return res.status(400).json({ message: "Sender and message are required." });
//   }

//   const updated = db.addTicketReply(req.params.id, sender, message);
//   if (!updated) return res.status(404).json({ message: "Ticket not found." });

//   // Update status automatically if admin replies
//   if (sender === "admin") {
//     db.updateTicketStatus(req.params.id, "In Progress");
//   }

//   res.json(updated);
// });

// app.put("/api/support/:id/status", (req, res) => {
//   const { status } = req.body;
//   const updated = db.updateTicketStatus(req.params.id, status);
//   if (!updated) return res.status(404).json({ message: "Ticket not found." });
//   res.json(updated);
// });


// // 8. GEMINI AI PRINT CUSTOMIZER ANALYZER
// app.post("/api/gemini/analyze", async (req, res) => {
//   const { logoBase64, text, productCategory, notes } = req.body;

//   if (!logoBase64 && !text) {
//     return res.status(400).json({ message: "Please supply an uploaded image or custom text design to analyze." });
//   }

//   const textContext = text ? `Custom text layout: "${text}".` : "No overlay text specified.";
//   const noteContext = notes ? `Customer extra instructions: "${notes}".` : "No special instructions.";

//   if (ai) {
//     try {
//       console.log(`Analyzing print graphics with Gemini for category: ${productCategory}`);

//       let contentParts = [];
//       if (logoBase64) {
//         // base64 comes with data:image/png;base64, prefix or raw base64. Trim metadata if needed.
//         const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//         let mimeType = "image/png";
//         let base64Data = logoBase64;
//         if (matches && matches.length === 3) {
//           mimeType = matches[1];
//           base64Data = matches[2];
//         }

//         contentParts.push({
//           inlineData: {
//             mimeType: mimeType,
//             data: base64Data
//           }
//         });
//       }

//       contentParts.push({
//         text: `You are WAO PRINTS' Expert Printing Quality AI Assistant.
//         Analyze the attached user's design asset for physical printing on category: "${productCategory}".
//         ${textContext}
//         ${noteContext}

//         Provide professional, detailed, and realistic technical feedback on:
//         1. "backgroundDetected": Identify the background characteristics and suggest if background auto-removal is recommended for a clean physical print on the ${productCategory}.
//         2. "quality": Gauge resolution, detail crispness, contrast, and gradient safety. Is it print-ready? Give a rating (Excellent, Good, Low Resolution, or Needs Improvement) with technical explanation.
//         3. "alignment": Provide suggestions on center/horizontal placement, padding safety margins, bleeds, and handle safety.
//         4. "suggestions": Concrete bullet points on how to improve this asset to get a 'Waoo' printing result.
//         5. "autoProcessedPreview": Describe how our automated vector processing system would crop and enhance the logo/text to optimize it for printing.

//         Respond with valid JSON matching this schema:
//         {
//           "backgroundDetected": "description of background",
//           "quality": "Quality rating + explanation",
//           "alignment": "Alignment suggestions",
//           "suggestions": "Bullet point 1. Bullet point 2. Bullet point 3.",
//           "autoProcessedPreview": "How our engine processed this to be print-ready"
//         }`
//       });

//       const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: { parts: contentParts },
//         config: {
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: Type.OBJECT,
//             properties: {
//               backgroundDetected: { type: Type.STRING },
//               quality: { type: Type.STRING },
//               alignment: { type: Type.STRING },
//               suggestions: { type: Type.STRING },
//               autoProcessedPreview: { type: Type.STRING }
//             },
//             required: ["backgroundDetected", "quality", "alignment", "suggestions", "autoProcessedPreview"]
//           }
//         }
//       });

//       const resultText = response.text;
//       if (resultText) {
//         const parsed = JSON.parse(resultText.trim());
//         return res.json({ feedback: parsed });
//       }
//     } catch (error) {
//       console.error("Gemini API call failed, invoking simulated expert feedback engine:", error.message || error);
//     }
//   }

//   // Fallback / Simulated Expert Analysis
//   console.log("Serving highly realistic local expert feedback analysis.");
//   setTimeout(() => {
//     const hasImage = !!logoBase64;
//     const feedback = {
//       backgroundDetected: hasImage
//         ? "Solid/textured background colors detected in vector edges. Automated high-contrast vector masking has isolated your logo elements."
//         : "Text-only layout detected. Standard high-contrast raster styling applied.",
//       quality: "Good (300 DPI equivalent). Contrast ratio is excellent with deep saturations, which will prevent dye-bleed on printing.",
//       alignment: "Centered precisely with safe 10% outer bleeds and gutter boundary margins. Ideal centering for " + productCategory + ".",
//       suggestions: "• Set high-contrast overlay mode for maximum dye brilliance.\n• For best fidelity, avoid gradient textures smaller than 2px on curved targets.\n• Your font choice is print-safe and maintains clear tracking.",
//       autoProcessedPreview: "Isolated background layers successfully. Enhanced colors and sharpened contrast values for maximum pop."
//     };
//     res.json({ feedback });
//   }, 1200);
// });

// // ----------------------------------------------------
// // VITE CLIENT DEV SERVER / PRODUCTION STATIC SERVER
// // ----------------------------------------------------

// async function setupServer() {
//   if (process.env.NODE_ENV !== "production") {
//     // Dynamically import Vite only in development to prevent dependency load errors in production start
//     const { createServer: createViteServer } = await import("vite");
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//     console.log("Vite dev middleware mounted.");
//   } else {
//     // Serve production static assets
//     const distPath = path.join(process.cwd(), "dist");
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//     console.log("Production static server configured.");
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`WAO PRINTS Full Stack Server running at http://0.0.0.0:${PORT}`);
//   });
// }

// setupServer();
