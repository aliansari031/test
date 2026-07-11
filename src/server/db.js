import fs from "fs";
import path from "path";
import { UserRole, OrderStatus } from "../types.js";
import { INITIAL_PRODUCTS, INITIAL_PORTFOLIO } from "../data.js";

const DB_FILE = path.join(process.cwd(), "db.json");

const DEFAULT_COUPONS = [
  { code: "WAOPRINT10", discountPercentage: 10, minSpend: 30, expiresAt: "2027-12-31", active: true },
  { code: "WAO20", discountPercentage: 20, minSpend: 100, expiresAt: "2027-12-31", active: true },
  { code: "FREESHIP", discountPercentage: 15, minSpend: 50, expiresAt: "2027-12-31", active: true }
];

const DEFAULT_USERS = [
  {
    id: "user-admin",
    name: "WAO Admin",
    email: "admin@waoprints.com",
    role: UserRole.ADMIN,
    phone: "+1 (555) 019-2831",
    address: "742 Printing Way, Sector 5, CA",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-cust-1",
    name: "Sarah Jenkins",
    email: "sarah.j@gmail.com",
    role: UserRole.CUSTOMER,
    phone: "+1 (555) 012-3456",
    address: "123 Creative Studio Apt 4B, New York, NY",
    createdAt: new Date().toISOString()
  }
];

class Database {
  constructor() {
    this.data = {
      users: [...DEFAULT_USERS],
      products: [...INITIAL_PRODUCTS],
      orders: [],
      portfolio: [...INITIAL_PORTFOLIO],
      inquiries: [],
      coupons: [...DEFAULT_COUPONS],
      supportTickets: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(content);
        this.data = {
          users: parsed.users || [...DEFAULT_USERS],
          products: parsed.products || [...INITIAL_PRODUCTS],
          orders: parsed.orders || [],
          portfolio: parsed.portfolio || [...INITIAL_PORTFOLIO],
          inquiries: parsed.inquiries || [],
          coupons: parsed.coupons || [...DEFAULT_COUPONS],
          supportTickets: parsed.supportTickets || []
        };
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Failed to load local database, resetting to default seed data:", error);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing database file:", error);
    }
  }

  // --- Users ---
  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  addUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // --- Products ---
  getProducts() { return this.data.products; }
  getProductById(id) { return this.data.products.find(p => p.id === id); }
  addProduct(product) {
    this.data.products.push(product);
    this.save();
    return product;
  }
  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.save();
      return this.data.products[idx];
    }
    return null;
  }
  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders() { return this.data.orders; }
  getOrderById(id) { return this.data.orders.find(o => o.id === id); }
  getOrdersByUserId(userId) { return this.data.orders.filter(o => o.userId === userId); }
  addOrder(order) {
    this.data.orders.unshift(order); // Newest first
    this.save();
    return order;
  }
  updateOrderStatus(id, status, trackingNumber) {
    const order = this.data.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      this.save();
      return order;
    }
    return null;
  }

  // --- Portfolio ---
  getPortfolio() { return this.data.portfolio; }
  getPortfolioById(id) { return this.data.portfolio.find(p => p.id === id); }
  addPortfolioProject(proj) {
    this.data.portfolio.push(proj);
    this.save();
    return proj;
  }
  updatePortfolioProject(id, updates) {
    const idx = this.data.portfolio.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.portfolio[idx] = { ...this.data.portfolio[idx], ...updates };
      this.save();
      return this.data.portfolio[idx];
    }
    return null;
  }
  deletePortfolioProject(id) {
    const idx = this.data.portfolio.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.portfolio.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Service Inquiries ---
  getInquiries() { return this.data.inquiries; }
  addInquiry(inq) {
    this.data.inquiries.unshift(inq);
    this.save();
    return inq;
  }
  updateInquiryStatus(id, status) {
    const inq = this.data.inquiries.find(i => i.id === id);
    if (inq) {
      inq.status = status;
      this.save();
      return inq;
    }
    return null;
  }

  // --- Coupons ---
  getCoupons() { return this.data.coupons; }
  getCouponByCode(code) {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  }
  addCoupon(coupon) {
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }
  deleteCoupon(code) {
    const idx = this.data.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      this.data.coupons.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Support Tickets ---
  getSupportTickets() { return this.data.supportTickets; }
  getSupportTicketsByUserId(userId) { return this.data.supportTickets.filter(t => t.userId === userId); }
  addSupportTicket(ticket) {
    this.data.supportTickets.unshift(ticket);
    this.save();
    return ticket;
  }
  addTicketReply(id, sender, message) {
    const ticket = this.data.supportTickets.find(t => t.id === id);
    if (ticket) {
      ticket.replies.push({
        sender,
        message,
        createdAt: new Date().toISOString()
      });
      this.save();
      return ticket;
    }
    return null;
  }
  updateTicketStatus(id, status) {
    const ticket = this.data.supportTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      this.save();
      return ticket;
    }
    return null;
  }
}

export const db = new Database();
