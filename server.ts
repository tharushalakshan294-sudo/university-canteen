import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "canteen-secret-key";

// Initial data structure
const initialData = {
  users: [],
  menu: [
    { id: "1", name: "Classic Burger", price: 8.99, category: "Burgers", description: "Juicy beef patty with lettuce, tomato, and our secret sauce." },
    { id: "2", name: "Cheese Pizza", price: 12.50, category: "Pizza", description: "Classic mozzarella cheese and tomato sauce." },
    { id: "3", name: "Caesar Salad", price: 7.25, category: "Salads", description: "Fresh romaine lettuce with parmesan and croutons." },
    { id: "4", name: "Chicken Sandwich", price: 9.50, category: "Sandwiches", description: "Grilled chicken breast with avocado and sprouts." },
    { id: "5", name: "Pasta Primavera", price: 11.00, category: "Pasta", description: "Seasonal vegetables in a light garlic cream sauce." },
    { id: "6", name: "Chocolate Cake", price: 5.50, category: "Desserts", description: "Rich dark chocolate layer cake." }
  ],
  orders: []
};

// Persistence helpers
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(content);
};

const saveData = (data: any) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    const db = loadData();

    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      password: hashedPassword,
      paymentMethods: []
    };

    db.users.push(newUser);
    saveData(db);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { id: newUser.id, name, email } });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const db = loadData();

    const user = db.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = loadData();
      const user = db.users.find((u: any) => u.id === decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ user: { id: user.id, name: user.name, email: user.email, paymentMethods: user.paymentMethods } });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/menu", (req, res) => {
    const db = loadData();
    res.json(db.menu);
  });

  app.post("/api/orders", (req, res) => {
    const { items, total } = req.body;
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = loadData();
      const newOrder = {
        id: Math.random().toString(36).substring(7),
        userId: decoded.userId,
        items,
        total,
        status: "Confirmed",
        date: new Date().toISOString()
      };
      db.orders.push(newOrder);
      saveData(db);
      res.json(newOrder);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/orders", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = loadData();
      const userOrders = db.orders.filter((o: any) => o.userId === decoded.userId);
      res.json(userOrders);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post("/api/payment-methods", (req, res) => {
    const { type, last4, expiry } = req.body;
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = loadData();
      const userIndex = db.users.findIndex((u: any) => u.id === decoded.userId);
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });

      const newMethod = { id: Math.random().toString(36).substring(7), type, last4, expiry };
      db.users[userIndex].paymentMethods.push(newMethod);
      saveData(db);
      res.json(newMethod);
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.delete("/api/payment-methods/:id", (req, res) => {
    const { id } = req.params;
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const db = loadData();
      const userIndex = db.users.findIndex((u: any) => u.id === decoded.userId);
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });

      db.users[userIndex].paymentMethods = db.users[userIndex].paymentMethods.filter((m: any) => m.id !== id);
      saveData(db);
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
