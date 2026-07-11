import React, { useState, useEffect, useRef } from "react";
import { BarChart, Users, Tag, MessageSquare, Plus, Trash2, Send, RefreshCw, Layers, FolderPlus, Lock, Eye, EyeOff, Upload, Image, Clock } from "lucide-react";
import AdminBannerSettings from "./AdminBannerSettings";

export default function AdminDashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard states
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [tickets, setTickets] = useState([]);
 
  // Order Timers tracking state (stores remaining seconds for each order ID)
  const [orderTimers, setOrderTimers] = useState({});
  const intervalsRef = useRef({});

  const [categories, setCategories] = useState([
    "Business Cards",
    "Mugs Printing",
    "Pen Printing",
    "T-Shirts",
    "Caps",
    "Sticker Printing"
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryReplyText, setInquiryReplyText] = useState("");

  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState(2500); 
  const [prodCategory, setProdCategory] = useState("Business Cards");
  const [prodImage, setProdImage] = useState(""); 
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [coupCode, setCoupCode] = useState("");
  const [coupPct, setCoupPct] = useState(15);
  const [coupMin, setCoupMin] = useState(1000);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // Check login session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("wao_admin_logged_in");
    if (adminSession === "true") {
      setIsAuthenticated(true);
      fetchAdminData();
    }
    return () => {
      // Cleanup all active intervals on unmount
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Optimized Fetch Data Matrix
  const fetchAdminData = async () => {
    try {
      const [oRes, pRes, iRes, cRes, tRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
        fetch("/api/inquiries"),
        fetch("/api/coupons"),
        fetch("/api/support/tickets")
      ]);

      if (oRes.ok) {
        const fetchedOrders = await oRes.json();
        setOrders(fetchedOrders);
        
        // Initialize timers for already Delivered/Cancelled orders if needed
        // fetchedOrders.forEach(o => {
        //   if ((o.status === "Delivered" || o.status === "Cancelled") && !intervalsRef.current[o.id]) {
        //     startOrderCountdown(o._id);
        //   }
        // });

        fetchedOrders.forEach((o) => {
  const id = o._id;

  if (
    (o.status === "Delivered" ||
      o.status === "Cancelled") &&
    !intervalsRef.current[id]
  ) {
    startOrderCountdown(id);
  }
});
      }
      if (pRes.ok) {
        const prodData = await pRes.json();
        setProducts(Array.isArray(prodData) ? prodData.reverse() : []);
      }
      if (iRes.ok) setInquiries(await iRes.json());
      if (cRes.ok) setCoupons(await cRes.json());
      if (tRes.ok) setTickets(await tRes.json());
    } catch (err) {
      console.error("Failed to load admin telemetry dataset:", err);
    }
  };






  // 2 Minutes Auto-Delete Timer Core Logic
  const startOrderCountdown = (orderId) => {
    if (intervalsRef.current[orderId]) return; // Already running

    setOrderTimers(prev => ({ ...prev, [orderId]: 120 })); // Set 120 seconds (2 mins)

    intervalsRef.current[orderId] = setInterval(async () => {
      setOrderTimers(prev => {
        const currentLeft = prev[orderId];
        if (currentLeft <= 1) {
          clearInterval(intervalsRef.current[orderId]);
          delete intervalsRef.current[orderId];
          
          // Trigger Auto Delete execution when time hits 0
          executeOrderDelete(orderId);
          
          const newTimers = { ...prev };
          delete newTimers[orderId];
          return newTimers;
        }
        return { ...prev, [orderId]: currentLeft - 1 };
      });
    }, 1000);
  };

  const stopOrderCountdown = (orderId) => {
    if (intervalsRef.current[orderId]) {
      clearInterval(intervalsRef.current[orderId]);
      delete intervalsRef.current[orderId];
    }
    setOrderTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[orderId];
      return newTimers;
    });
  };

  // FIXED: Handles both o._id (DB standard) and fallback fields to clear local state properly
  const executeOrderDelete = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id && o.id !== id));
      } else {
        console.error("Backend failed to delete order status:", res.status);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  // FIXED: Dynamic ID parameter passes the true MongoDB unique hash to backend API
  const handleManualOrderDelete = async (orderObject) => {
    if (!window.confirm("Are you sure you want to delete this order permanently from records?")) return;
    
    // Fallback detection logic to ensure correct key hits server endpoints
    const databaseId = orderObject._id || orderObject.id; 
    
    stopOrderCountdown(databaseId);
    await executeOrderDelete(databaseId);
  };
const handleOrderStatusUpdate = async (orderObject, newStatus) => {
  const databaseId = orderObject._id || orderObject.id;

  try {
    const res = await fetch(`/api/orders/${databaseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Status Update Failed:", errorText);
      return;
    }

    const updated = await res.json();

    setOrders((prev) =>
      prev.map((o) =>
        (o._id === databaseId || o.id === databaseId)
          ? { ...o, ...updated }
          : o
      )
    );

    if (newStatus === "Delivered" || newStatus === "Cancelled") {
      startOrderCountdown(databaseId);
    } else {
      stopOrderCountdown(databaseId);
    }
  } catch (err) {
    console.error("Status update error:", err);
  }
};


 
 
//..................................................
 const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodImage || isSubmitting) return;

    setIsSubmitting(true);
    if (typeof setIsCompressing === "function") setIsCompressing(true);

    try {
      // ==== STEP A: Image ko ImgBB Cloud par bhej kar direct URL lena (UPDATED) ====
      const formData = new FormData();
      
      // Agar prodImage Base64 string hai, to usey Blob me convert karein
      if (typeof prodImage === 'string' && prodImage.startsWith('data:')) {
        const byteString = atob(prodImage.split(',')[1]);
        const mimeString = prodImage.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        formData.append("image", blob, "uploaded_product.jpg");
      } else {
        // Agar pehle se hi File Object hai to direct append karein
        formData.append("image", prodImage);
      }

      const imgbbRes = await fetch("https://api.imgbb.com/1/upload?key=f3c3635aab4aa1c6a9c1169fdf11cb21", {
        method: "POST",
        body: formData
      });

      const imgbbData = await imgbbRes.json();
      
      if (!imgbbData.success) {
        console.error("ImgBB Full Error Response:", imgbbData);
        throw new Error("ImgBB Upload Failed");
      }

      // ImgBB se mila hua short URL string
      const cloudImageUrl = imgbbData.data.url; 
      if (typeof setIsCompressing === "function") setIsCompressing(false);

      // ==== STEP B: Optimistic UI Update (Screen par instant card dikhana) ====
      const optimisticNewProduct = {
        id: "temp-" + Date.now(),
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        category: prodCategory,
        images: [cloudImageUrl], 
        isCustomizable: true
      };

      setProducts(prev => [optimisticNewProduct, ...prev]);
      setShowProductModal(false);

      // ==== STEP C: MongoDB Backend par data save karwana ====
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          price: Number(prodPrice),
          category: prodCategory,
          images: [cloudImageUrl],  
          isCustomizable: true,
          specifications: { "Material": "Coated Velvet Litho Base" }
        })
      });
      
      if (res.ok) {
        const created = await res.json();
        setProducts(prev => prev.map(p => p.id === optimisticNewProduct.id ? created : p));
        setProdName("");
        setProdDesc("");
        setProdImage("");
        setProdPrice(2500);
      } else {
        // Rollback agar database me network ya server issue ki wajah se save na ho
        setProducts(prev => prev.filter(p => p.id !== optimisticNewProduct.id));
        console.warn("MongoDB Sync failed, item rolled back.");
      }
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== optimisticNewProduct.id));
      console.error("Upload/Creation Error:", err);
    } finally {
      setIsSubmitting(false);
      if (typeof setIsCompressing === "function") setIsCompressing(false);
    }
};

const handleAdminLogin = (e) => {
  e.preventDefault();
  setLoginError("");

  if (adminEmail.trim() === "admin@waoprints.com" && adminPassword === "admin123") {
    localStorage.setItem("wao_admin_logged_in", "true");
    setIsAuthenticated(true);
    fetchAdminData();
  } else {
    setLoginError("Invalid Admin Email or Security Password.");
  }
};

const handleDeleteProduct = async (id) => {
  if (!window.confirm("Verify: Are you sure you want to delete this product?")) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts(products.filter(p => p._id !== id && p.id !== id));
  } catch (err) {
    console.error(err);
  }
};


const handleLogout = () => {
  localStorage.removeItem("wao_admin_logged_in");
  setIsAuthenticated(false);
};

//...............................................

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setIsCompressing(true);

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_WIDTH = 500;
      const MAX_HEIGHT = 500;

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.5);

      setProdImage(compressed);
      setIsCompressing(false);
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
};
//.......................................................,
 

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!coupCode.trim()) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupCode.trim().toUpperCase(),
          discountPercentage: coupPct,
          minSpend: coupMin
        })
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons([created, ...coupons]);
        setShowCouponModal(false);
        setCoupCode("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "Admin", message: ticketReplyText })
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setTicketReplyText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInquiryReply = async (e) => {
    e.preventDefault();
    if (!inquiryReplyText.trim() || !selectedInquiry) return;
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: inquiryReplyText })
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? updated : i));
        setSelectedInquiry(null);
        setInquiryReplyText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const cleanCategory = newCategoryName.trim();
    if (!cleanCategory) return;
    if (categories.some(cat => cat.toLowerCase() === cleanCategory.toLowerCase())) return;
    setCategories([...categories, cleanCategory]);
    setProdCategory(cleanCategory);
    setNewCategoryName("");
    setShowCategoryInput(false);
  };

  const handleDeleteCategory = (catToDelete) => {
    if (!window.confirm(`Are you sure you want to delete "${catToDelete}" category?`)) return;
    const updatedCategories = categories.filter(cat => cat !== catToDelete);
    setCategories(updatedCategories);
    if (prodCategory === catToDelete && updatedCategories.length > 0) {
      setProdCategory(updatedCategories[0]);
    }
  };

  const formatTimerString = (seconds) => {
    if (seconds === undefined) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const activeTicketsCount = tickets.filter(t => t.status === "Open").length;
//..........................................................................................................


 
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 pt-16 sm:pt-28">
        <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl animate-scale-up">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/5">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
            <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@waoprints.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none transition-all"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-xs text-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/10 cursor-pointer flex items-center justify-center gap-2 mt-2 uppercase tracking-wider text-[11px]"
            >
              Connect Security Portal →
            </button>
          </form>
        </div>
      </div>
    );
  }




return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-slate-950">
      
 
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Gross Income Cashflow</p>
          <div className="font-display font-black text-2xl sm:text-3xl text-orange-500">PKR {totalRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400">Total authorized order checkouts.</p>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Submissions Queue</p>
          <div className="font-display font-black text-2xl sm:text-3xl text-white">{orders.length} Runs</div>
          <p className="text-[11px] text-gray-400">Active print sheets scheduled.</p>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">B2B Corporate Inquiries</p>
          <div className="font-display font-black text-2xl sm:text-3xl text-white">{inquiries.length} Quotes</div>
          <p className="text-[11px] text-gray-400">Unanswered volume leads.</p>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Active Support Tickets</p>
          <div className="font-display font-black text-2xl sm:text-3xl text-rose-500">{activeTicketsCount} Open</div>
          <p className="text-[11px] text-gray-400">Customer requests needing inspection.</p>
        </div>
      </div>

 
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
 
         <div className="lg:col-span-3 space-y-2 bg-slate-950/40 border border-slate-900 rounded-3xl p-4 sm:p-5">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "orders" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart className="w-4 h-4" />
            Order Manager ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "products" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Catalog Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "inquiries" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Corporate Inquiries ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "coupons" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <Tag className="w-4 h-4" />
            Promo Coupons ({coupons.length})
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "tickets" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Helpdesk Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
              activeTab === "banners" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <Image className="w-4 h-4" />
            Banners Control
          </button>
        </div>

 
         <div className="lg:col-span-9 bg-slate-950/40 border border-slate-900 p-5 sm:p-8 rounded-3xl min-h-[55vh]">
          


 {/* TAB 1: ORDER MANAGER */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-white">Prism Printing Plate Production Pipeline</h3>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o._id || o.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="text-xs space-y-1 z-10 w-full sm:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{o.id}</span>
                        <span className="font-sans text-gray-400 font-bold">Client: {o.customerName || "N/A"}</span>
                      </div>
                      
                      {/* Sub-items real print counter checking deep levels */}
                      <h4 className="font-bold text-sm text-white mt-1.5">
                        {o.items?.reduce((acc, item) => {
                          const innerItems = item.comboItems || item.selectedItems || item.items || item.products || [];
                          return acc + (innerItems.length > 0 ? innerItems.length : 1);
                        }, 0)} print batches • Total: PKR {Number(o.grandTotal || 0).toLocaleString()}
                      </h4>
                      
                      <div className="text-[11px] text-gray-400 pt-1 space-y-0.5 font-sans">
                        <p><span className="text-gray-500 font-medium">Contact Matrix:</span> {o.customerEmail || "No Email Registered"} {o.customerPhone && `| ${o.customerPhone}`}</p>
                        {o.shippingAddress && <p><span className="text-gray-500 font-medium">Logistics Target:</span> {o.shippingAddress}</p>}
                        
                        {/* Main Products / Combo Items Rendering Loop */}
                        {o.items && o.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 gap-3">
                            {o.items.map((item, idx) => {
                              // Deep extracting nested item configurations from any potential backend model naming
                              let subItemsList = item.comboItems || item.selectedItems || item.items || item.products || [];
                              
                              // Fallback check if the data was serialized as a text description inside customization block
                              if (subItemsList.length === 0 && typeof item.customization?.selectedItems === 'string') {
                                try { subItemsList = JSON.parse(item.customization.selectedItems); } catch(e){}
                              } else if (subItemsList.length === 0 && Array.isArray(item.customization?.selectedItems)) {
                                subItemsList = item.customization.selectedItems;
                              }

                              const isCombo = item.isGiftCombo || subItemsList.length > 0 || item.name === "Custom Gift Combo Box";
                              const displayTitle = item.name || item.productName || "Custom Gift Combo Box";

                              return (
                                <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-3 ${isCombo ? "bg-gradient-to-br from-orange-950/20 to-slate-950/90 border-orange-500/30 shadow-inner" : "bg-slate-950/70 border-slate-900"}`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden">
                                      {isCombo ? (
                                        <span className="text-base">🎁</span>
                                      ) : (
                                        <img 
                                          src={item.customization?.logoUrl || item.image || item.product?.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100"} 
                                          alt="Asset" 
                                          className="object-cover w-full h-full" 
                                        />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                                        <span>{displayTitle}</span>
                                        {isCombo && (
                                          <span className="bg-orange-600 text-white text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                            Bundle Package ({subItemsList.length > 0 ? subItemsList.length : 3} Items)
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-gray-500 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                        <span>Total Qty: <strong className="text-orange-400">{item.quantity || 1}</strong></span>
                                        <span>•</span>
                                        <span>Type: {isCombo ? "Combo Selection" : (item.product?.category || "General")}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Render breakdown whenever subItemsList contains elements */}
                                  {subItemsList && subItemsList.length > 0 ? (
                                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                                      <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block font-mono">
                                        📦 Selected Combo Items Breakdown:
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {subItemsList.map((ci, cIdx) => (
                                          <div 
                                            key={cIdx} 
                                            className="bg-slate-900/90 border border-slate-800 p-2 rounded-md flex items-center justify-between gap-2 text-[11px]"
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              <span className="text-orange-500 text-[10px]">•</span>
                                              <span className="text-gray-200 font-medium truncate">{ci.name || ci.title || ci.productName || `Product Item #${cIdx + 1}`}</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[9px] text-gray-400 shrink-0">
                                              {ci.isCustomized || ci.customText || ci.customization ? (
                                                <span className="bg-blue-500/10 text-blue-400 px-1 rounded border border-blue-500/20">🎨 Custom</span>
                                              ) : (
                                                <span className="text-gray-600">Standard</span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    /* Absolute ultimate fallback if array keys match nothing but it's a known combo */
                                    isCombo && (
                                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-gray-500 font-mono italic">
                                        ⚠️ Combo sub-items details are saved under deep order payload tracking. Please inspect database structure if keys differ.
                                      </div>
                                    )
                                  )}

                                  {/* Custom Text/Prompt Check */}
                                  {item.customization?.text && (
                                    <div className="text-[9px] bg-slate-900 text-gray-400 border border-slate-800 px-2 py-1 rounded font-mono max-w-fit">
                                      Custom Text: "{item.customization.text}"
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10">
                      <button
                        onClick={() => handleManualOrderDelete(o)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-[10px] font-bold uppercase transition"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-xs font-mono">No live manufacturing orders found.</p>}
              </div>
            </div>
          )}


{/*            
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-white">Prism Printing Plate Production Pipeline</h3>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o._id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="text-xs space-y-1 z-10 w-full sm:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{o.id}</span>
                        <span className="font-sans text-gray-400 font-bold">Client: {o.customerName || "N/A"}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-1.5">{o.items?.length || 0} print batches • Total: PKR {Number(o.grandTotal || 0).toLocaleString()}</h4>
                      
                      <div className="text-[11px] text-gray-400 pt-1 space-y-0.5 font-sans">
                        <p><span className="text-gray-500 font-medium">Contact Matrix:</span> {o.customerEmail || "No Email Registered"} {o.customerPhone && `| ${o.customerPhone}`}</p>
                        {o.shippingAddress && <p><span className="text-gray-500 font-medium">Logistics Target:</span> {o.shippingAddress}</p>}
                        
 
 
                         {o.items && o.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 gap-3">
                            {o.items.map((item, idx) => {
                              const matchedProductName = item.isGiftCombo ? "Custom Gift Combo Box" : (item.name || item.productName || item.product?.name || "Custom Printed Product");

                              return (
                                <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 ${item.isGiftCombo ? "bg-gradient-to-br from-amber-950/10 to-slate-950/80 border-orange-500/20" : "bg-slate-950/70 border-slate-900"}`}>
                                  <div className="flex items-center gap-3">
                                     

                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden">
                                      {item.isGiftCombo ? (
                                        <span className="text-sm">🎁</span>
                                      ) : (
                                        <img 
                                          src={item.customization?.logoUrl || item.image || item.product?.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100"} 
                                          alt="Asset" 
                                          className="object-cover w-full h-full" 
                                        />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                                        <span>{matchedProductName}</span>
                                        {item.isGiftCombo && (
                                          <span className="bg-orange-500 text-white text-[8px] px-1 rounded font-mono font-bold uppercase tracking-wider">Bundle</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-gray-500 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                        <span>Qty: <strong className="text-orange-400">{item.quantity || 1}</strong></span>
                                        <span>•</span>
                                        <span>Category: {item.product?.category || "General"}</span>
                                      </div>
                                    </div>
                                  </div>

                                   {item.isGiftCombo && item.comboItems && item.comboItems.length > 0 && (
                                    <div className="mt-1 p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                                      <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block font-mono">
                                        📦 Bundle Items List ({item.comboItems.length} Products):
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.comboItems.map((ci, cIdx) => (
                                          <span 
                                            key={cIdx} 
                                            className="bg-slate-900 border border-slate-800 text-gray-200 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-sans font-medium"
                                          >
                                            • {ci.name} {ci.isCustomized && "🎨"}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                   {item.customization?.text && (
                                    <div className="text-[9px] bg-slate-900 text-gray-400 border border-slate-800 px-2 py-1 rounded font-mono max-w-fit">
                                      Custom Text: "{item.customization.text}"
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10">
                      <button
                        onClick={() => handleManualOrderDelete(o)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-[10px] font-bold uppercase transition"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-xs font-mono">No live manufacturing orders found.</p>}
              </div>
            </div>
          )}         */}

          {/* TAB 2: PRODUCT CATALOG CRUD */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="font-display font-bold text-lg text-white">Registered Core Catalog Materials</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCategoryInput(!showCategoryInput)}
                    className="bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider px-3 py-2.5 rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4 text-orange-500" />
                    Manage Categories
                  </button>
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Register New Blank
                  </button>
                </div>
              </div>

              {showCategoryInput && (
                <form onSubmit={handleAddCategory} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex gap-3 items-end animate-fade-in">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-semibold text-gray-400 uppercase font-mono">Add Dynamic New Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Hoodies, Keychains..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-orange-400 transition-colors">
                    Add Block
                  </button>
                </form>
              )}

              <div className="flex flex-wrap gap-2 pb-2">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-slate-950 text-gray-400 text-[10px] font-mono pl-2.5 pr-1 py-1 rounded-md border border-slate-900 flex items-center gap-1.5">
                    <span>{cat}</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteCategory(cat)} 
                      className="text-gray-600 hover:text-rose-500 p-0.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"} alt="" className="w-10 h-10 rounded bg-slate-950 object-contain p-1 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">PKR {Number(p.price).toLocaleString()} | {p.category}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-slate-950 text-gray-500 hover:text-rose-500 border border-slate-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: B2B COMMERCIAL INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-white">B2B Volume Quote Inquiries</h3>
              <div className="space-y-4">
                {inquiries.map(i => (
                  <div key={i.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="text-xs">
                        <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{i.serviceName}</span>
                        <h4 className="font-bold text-sm text-white mt-1.5">{i.customerName}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Target Run: {i.quantity} units</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs italic">" {i.message} "</p>
                    {i.replyMessage ? (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-gray-300">
                        <p className="font-bold text-orange-400 uppercase text-[8px] tracking-widest font-mono">Emailed Response Quote:</p>
                        <p className="mt-1">{i.replyMessage}</p>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedInquiry(i)} className="text-xs text-orange-400 hover:text-orange-300 font-bold underline">
                        Email PDF Quote reply →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS SYSTEM */}
          {activeTab === "coupons" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-lg text-white">Promo Campaign Coupon Codes</h3>
                <button onClick={() => setShowCouponModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors">
                  Generate Coupon Code
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c, idx) => (
                  <div key={c.code || idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 text-center space-y-2">
                    <span className="font-mono font-bold text-sm text-white bg-slate-950 px-3 py-1 rounded border border-slate-800 inline-block">
                      {c.code}
                    </span>
                    <p className="text-xs text-orange-500 font-bold mt-2">{c.discountPercentage}% Discount</p>
                    <p className="text-[10px] text-gray-400">Min Spend: PKR {Number(c.minSpend || 0).toLocaleString()}</p>
                  </div>
                ))}
                {coupons.length === 0 && <p className="text-gray-500 text-xs font-mono col-span-full text-center py-4">No active verification promo blocks running.</p>}
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS */}
          {activeTab === "tickets" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-white">Active Support Helpdesk Queue</h3>
              <div className="space-y-4">
                {tickets.map(tk => (
                  <div key={tk.id} onClick={() => setSelectedTicket(tk)} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{tk.category}</span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${tk.status === "Open" ? "bg-emerald-950/20 text-emerald-400" : "text-gray-500"}`}>{tk.status}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white mt-2">{tk.subject}</h4>
                    </div>
                    <span className="text-xs text-orange-500 font-bold">Open chat →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BANNERS CONTROL */}
          {activeTab === "banners" && (
            <div className="space-y-6 animate-fade-in my-0 py-0 sm:py-2">
              <AdminBannerSettings />
            </div>
          )}

        </div>
      </div>   
              

      {/* CHAT/MODAL POPUPS */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-end">
          <div className="bg-slate-950 border-l border-slate-900 w-full max-w-lg h-full p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h3 className="font-display font-bold text-base text-white">{selectedTicket.subject}</h3>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white text-xs">Close</button>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900 mt-4 text-xs text-gray-400">
                <p className="font-bold text-orange-500">Customer Problem:</p>
                <p className="mt-1">{selectedTicket.description}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {selectedTicket.replies?.map((rep, idx) => (
                <div key={idx} className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs ${rep.sender === "Admin" ? "ml-auto bg-orange-600/10 border border-orange-500/20 text-orange-200" : "mr-auto bg-slate-900 border border-slate-800 text-gray-300"}`}>
                  <span className="text-[8px] font-mono text-gray-500 font-bold mb-1">{rep.sender === "Admin" ? "WAO Officer" : "Customer"}</span>
                  <p>{rep.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendTicketReply} className="flex gap-2.5 pt-4 border-t border-slate-900">
              <input type="text" required value={ticketReplyText} onChange={(e) => setTicketReplyText(e.target.value)} placeholder="Type helpdesk response..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
              <button type="submit" className="bg-orange-600 p-3 rounded-xl text-white"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-6">
            <h3 className="font-display font-bold text-lg text-white">Compose Quote response</h3>
            <form onSubmit={handleSendInquiryReply} className="space-y-4 text-xs">
              <textarea required value={inquiryReplyText} onChange={(e) => setInquiryReplyText(e.target.value)} placeholder="Type email response details..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-36 text-white outline-none resize-none" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedInquiry(null)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Email Quote Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-5">
            <h3 className="font-display font-bold text-lg text-white">Register Product Blank</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Product Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">PKR</span>
                  <input 
                    type="number" 
                    step="1" 
                    required 
                    value={prodPrice === 0 ? "" : prodPrice} 
                    onFocus={() => prodPrice === 0 && setProdPrice("")}
                    onBlur={(e) => e.target.value === "" && setProdPrice(0)}
                    onChange={(e) => setProdPrice(e.target.value === "" ? 0 : Number(e.target.value))} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pl-12 text-white outline-none" 
                    placeholder="Price" 
                  />
                </div>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-gray-300 outline-none">
                  {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Image</label>
                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 text-gray-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-900 text-[11px] transition-colors">
                    <Upload className="w-3.5 h-3.5 text-orange-500" />
                    <span>Choose File</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <span className="text-gray-500 text-[11px] truncate flex-1 font-mono">
                    {isCompressing ? "Optimizing & Compressing Asset..." : prodImage ? "Compressed & Optimized ✓" : "No file chosen"}
                  </span>
                  {prodImage && !isCompressing && (
                    <img src={prodImage} alt="Preview" className="w-8 h-8 rounded bg-black object-contain border border-slate-800" />
                  )}
                </div>
              </div>

              <textarea required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Material Description" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-20 text-white outline-none resize-none" />
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isCompressing || isSubmitting}
                  className={`flex-1 text-white font-bold py-3 rounded-xl transition-all ${isCompressing || isSubmitting ? "bg-orange-800/40 cursor-not-allowed text-gray-500" : "bg-orange-600 hover:bg-orange-500"}`}
                >
                  {isSubmitting ? "Saving Object Live..." : isCompressing ? "Processing Asset..." : "Save Product Blank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-sm space-y-5">
            <h3 className="font-display font-bold text-lg text-white">Generate Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <input type="text" required value={coupCode} onChange={(e) => setCoupCode(e.target.value)} placeholder="E.g., PROMOVIP" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white uppercase outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Discount %</label>
                  <input type="number" min="1" max="99" required value={coupPct} onChange={(e) => setCoupPct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Min Spend (PKR)</label>
                  <input type="number" min="0" required value={coupMin} onChange={(e) => setCoupMin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Activate Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );












//   return (
//     <div className="pt-16 sm:pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 animate-fade-in" id="admin-dashboard-container">
      
//       {/* Title telemetry header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
//         <div>
//           <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">TELEMETRY SYSTEM CONSOLE</span>
//           <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-1">WAO Admin Console</h1>
//           <p className="text-gray-400 text-xs font-mono mt-0.5">Control Plate Matrices, Orders, and AI Ticket Dialogues</p>
//         </div>
//         <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
//           <button
//             onClick={fetchAdminData}
//             className="p-2.5 text-gray-400 hover:text-white rounded-xl border border-slate-900 hover:border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Live Sync
//           </button>
//           <button
//             onClick={handleLogout}
//             className="p-2.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded-xl border border-rose-900/30 transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
//           >
//             Exit Terminal
//           </button>
//         </div>
//       </div>

//       {/* Analytics Bento Cards Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Gross Income Cashflow</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-orange-500">PKR {totalRevenue.toLocaleString()}</div>
//           <p className="text-[11px] text-gray-400">Total authorized order checkouts.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Submissions Queue</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-white">{orders.length} Runs</div>
//           <p className="text-[11px] text-gray-400">Active print sheets scheduled.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">B2B Corporate Inquiries</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-white">{inquiries.length} Quotes</div>
//           <p className="text-[11px] text-gray-400">Unanswered volume leads.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Active Support Tickets</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-rose-500">{activeTicketsCount} Open</div>
//           <p className="text-[11px] text-gray-400">Customer requests needing inspection.</p>
//         </div>
//       </div>

//       {/* Main split tab section */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
//         {/* Left Side: Category switchers */}
//         <div className="lg:col-span-3 space-y-2 bg-slate-950/40 border border-slate-900 rounded-3xl p-4 sm:p-5">
//           <button
//             onClick={() => setActiveTab("orders")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "orders" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <BarChart className="w-4 h-4" />
//             Order Manager ({orders.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("products")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "products" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Layers className="w-4 h-4" />
//             Catalog Products ({products.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("inquiries")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "inquiries" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Users className="w-4 h-4" />
//             Corporate Inquiries ({inquiries.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("coupons")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "coupons" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Tag className="w-4 h-4" />
//             Promo Coupons ({coupons.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("tickets")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "tickets" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <MessageSquare className="w-4 h-4" />
//             Helpdesk Tickets ({tickets.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("banners")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "banners" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Image className="w-4 h-4" />
//             Banners Control
//           </button>
//         </div>

//         {/* Right Side: Tab panel contents */}
//         <div className="lg:col-span-9 bg-slate-950/40 border border-slate-900 p-5 sm:p-8 rounded-3xl min-h-[55vh]">
          
//        {/* TAB 1: ORDER MANAGER */}
// {activeTab === "orders" && (
//   <div className="space-y-6 animate-fade-in">
//     <h3 className="font-display font-bold text-lg text-white">Prism Printing Plate Production Pipeline</h3>
//     <div className="space-y-4">
//       {orders.map(o => (
//         <div key={o._id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
//           <div className="text-xs space-y-1 z-10 w-full sm:flex-1">
//             <div className="flex flex-wrap items-center gap-2">
//               <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{o.id}</span>
//               <span className="font-sans text-gray-400 font-bold">Client: {o.customerName || "N/A"}</span>
//             </div>
//             <h4 className="font-bold text-sm text-white mt-1.5">{o.items?.length || 0} print batches • Total: PKR {Number(o.grandTotal || 0).toLocaleString()}</h4>
            
//             <div className="text-[11px] text-gray-400 pt-1 space-y-0.5 font-sans">
//               <p><span className="text-gray-500 font-medium">Contact Matrix:</span> {o.customerEmail || "No Email Registered"} {o.customerPhone && `| ${o.customerPhone}`}</p>
//               {o.shippingAddress && <p><span className="text-gray-500 font-medium">Logistics Target:</span> {o.shippingAddress}</p>}
              
//               {/* Main Products / Combo Items Rendering Loop */}
//               {o.items && o.items.length > 0 && (
//                 <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 gap-3">
//                   {o.items.map((item, idx) => {
//                     const matchedProductName = item.isGiftCombo ? "Custom Gift Combo Box" : (item.name || item.productName || item.product?.name || "Custom Printed Product");

//                     return (
//                       <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 ${item.isGiftCombo ? "bg-gradient-to-br from-amber-950/10 to-slate-950/80 border-orange-500/20" : "bg-slate-950/70 border-slate-900"}`}>
//                         <div className="flex items-center gap-3">
//                           {/* Thumbnail Handling */}
//                           <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden">
//                             {item.isGiftCombo ? (
//                               <span className="text-sm">🎁</span>
//                             ) : (
//                               <img 
//                                 src={item.customization?.logoUrl || item.image || item.product?.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100"} 
//                                 alt="Asset" 
//                                 className="object-cover w-full h-full" 
//                               />
//                             )}
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
//                               <span>{matchedProductName}</span>
//                               {item.isGiftCombo && (
//                                 <span className="bg-orange-500 text-white text-[8px] px-1 rounded font-mono font-bold uppercase tracking-wider">Bundle</span>
//                               )}
//                             </div>
//                             <div className="text-[10px] text-gray-500 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
//                               <span>Qty: <strong className="text-orange-400">{item.quantity || 1}</strong></span>
//                               <span>•</span>
//                               <span>Category: {item.product?.category || "General"}</span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* FIXED: Agr gift combo hai tou uske andr save huay saare individual items yahan list out honge */}
//                         {item.isGiftCombo && item.comboItems && item.comboItems.length > 0 && (
//                           <div className="mt-1 p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
//                             <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block font-mono">
//                               📦 Bundle Items List ({item.comboItems.length} Products):
//                             </span>
//                             <div className="flex flex-wrap gap-1.5">
//                               {item.comboItems.map((ci, cIdx) => (
//                                 <span 
//                                   key={cIdx} 
//                                   className="bg-slate-900 border border-slate-800 text-gray-200 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-sans font-medium"
//                                 >
//                                   • {ci.name} {ci.isCustomized && "🎨"}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {/* Custom Text/Prompt Check */}
//                         {item.customization?.text && (
//                           <div className="text-[9px] bg-slate-900 text-gray-400 border border-slate-800 px-2 py-1 rounded font-mono max-w-fit">
//                             Custom Text: "{item.customization.text}"
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* Timer block */}
//             {(o.status === "Cancelled" || o.status === "Delivered") && orderTimers[o._id] !== undefined && (
//               <div className="mt-3 flex items-center gap-1.5 text-rose-400 font-mono text-[11px] bg-rose-950/20 border border-rose-900/30 px-3 py-1 rounded-xl w-fit">
//                 <Clock className="w-3.5 h-3.5 animate-pulse text-rose-500" />
//                 <span>Auto-deleting pipeline in: <strong className="text-white font-black">{formatTimerString(orderTimers[o.id])}</strong></span>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10">


//             <button
//   onClick={() => handleManualOrderDelete(o)}
//   className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-[10px] font-bold uppercase transition"
// >
//   Delete Order
// </button>
//           </div>
//         </div>
//       ))}
//       {orders.length === 0 && <p className="text-gray-500 text-xs font-mono">No live manufacturing orders found.</p>}
//     </div>
//   </div>
// )}       

//           {/* TAB 2: PRODUCT CATALOG CRUD */}
//           {activeTab === "products" && (
//             <div className="space-y-6 animate-fade-in">
//               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//                 <h3 className="font-display font-bold text-lg text-white">Registered Core Catalog Materials</h3>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setShowCategoryInput(!showCategoryInput)}
//                     className="bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider px-3 py-2.5 rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5"
//                   >
//                     <FolderPlus className="w-4 h-4 text-orange-500" />
//                     Manage Categories
//                   </button>
//                   <button
//                     onClick={() => setShowProductModal(true)}
//                     className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Register New Blank
//                   </button>
//                 </div>
//               </div>

//               {showCategoryInput && (
//                 <form onSubmit={handleAddCategory} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex gap-3 items-end animate-fade-in">
//                   <div className="flex-1 space-y-1">
//                     <label className="text-[9px] font-semibold text-gray-400 uppercase font-mono">Add Dynamic New Category</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="e.g., Hoodies, Keychains..."
//                       value={newCategoryName}
//                       onChange={(e) => setNewCategoryName(e.target.value)}
//                       className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
//                     />
//                   </div>
//                   <button type="submit" className="bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-orange-400 transition-colors">
//                     Add Block
//                   </button>
//                 </form>
//               )}

//               <div className="flex flex-wrap gap-2 pb-2">
//                 {categories.map((cat, idx) => (
//                   <div key={idx} className="bg-slate-950 text-gray-400 text-[10px] font-mono pl-2.5 pr-1 py-1 rounded-md border border-slate-900 flex items-center gap-1.5">
//                     <span>{cat}</span>
//                     <button 
//                       type="button" 
//                       onClick={() => handleDeleteCategory(cat)} 
//                       className="text-gray-600 hover:text-rose-500 p-0.5 transition-colors"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {products.map(p => (
//                   <div key={p.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 flex justify-between items-center gap-4">
//                     <div className="flex items-center gap-3">
//                       <img src={p.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"} alt="" className="w-10 h-10 rounded bg-slate-950 object-contain p-1 shrink-0" />
//                       <div>
//                         <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
//                         <p className="text-[10px] text-gray-500 font-mono mt-0.5">PKR {Number(p.price).toLocaleString()} | {p.category}</p>
//                       </div>
//                     </div>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-slate-950 text-gray-500 hover:text-rose-500 border border-slate-800 rounded-lg transition-colors">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TAB 3: B2B COMMERCIAL INQUIRIES */}
//           {activeTab === "inquiries" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">B2B Volume Quote Inquiries</h3>
//               <div className="space-y-4">
//                 {inquiries.map(i => (
//                   <div key={i.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 space-y-4">
//                     <div className="flex justify-between items-start">
//                       <div className="text-xs">
//                         <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{i.serviceName}</span>
//                         <h4 className="font-bold text-sm text-white mt-1.5">{i.customerName}</h4>
//                         <p className="text-[10px] text-gray-500 font-mono mt-0.5">Target Run: {i.quantity} units</p>
//                       </div>
//                     </div>
//                     <p className="text-gray-400 text-xs italic">" {i.message} "</p>
//                     {i.replyMessage ? (
//                       <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-gray-300">
//                         <p className="font-bold text-orange-400 uppercase text-[8px] tracking-widest font-mono">Emailed Response Quote:</p>
//                         <p className="mt-1">{i.replyMessage}</p>
//                       </div>
//                     ) : (
//                       <button onClick={() => setSelectedInquiry(i)} className="text-xs text-orange-400 hover:text-orange-300 font-bold underline">
//                         Email PDF Quote reply →
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TAB 4: COUPONS SYSTEM */}
//           {activeTab === "coupons" && (
//             <div className="space-y-6 animate-fade-in">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-display font-bold text-lg text-white">Promo Campaign Coupon Codes</h3>
//                 <button onClick={() => setShowCouponModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors">
//                   Generate Coupon Code
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {coupons.map((c, idx) => (
//                   <div key={c.code || idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 text-center space-y-2">
//                     <span className="font-mono font-bold text-sm text-white bg-slate-950 px-3 py-1 rounded border border-slate-800 inline-block">
//                       {c.code}
//                     </span>
//                     <p className="text-xs text-orange-500 font-bold mt-2">{c.discountPercentage}% Discount</p>
//                     <p className="text-[10px] text-gray-400">Min Spend: PKR {Number(c.minSpend || 0).toLocaleString()}</p>
//                   </div>
//                 ))}
//                 {coupons.length === 0 && <p className="text-gray-500 text-xs font-mono col-span-full text-center py-4">No active verification promo blocks running.</p>}
//               </div>
//             </div>
//           )}

//           {/* TAB 5: SUPPORT TICKETS */}
//           {activeTab === "tickets" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Active Support Helpdesk Queue</h3>
//               <div className="space-y-4">
//                 {tickets.map(tk => (
//                   <div key={tk.id} onClick={() => setSelectedTicket(tk)} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer flex justify-between items-center">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{tk.category}</span>
//                         <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${tk.status === "Open" ? "bg-emerald-950/20 text-emerald-400" : "text-gray-500"}`}>{tk.status}</span>
//                       </div>
//                       <h4 className="font-bold text-sm text-white mt-2">{tk.subject}</h4>
//                     </div>
//                     <span className="text-xs text-orange-500 font-bold">Open chat →</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {activeTab === "banners" && (
//             <div className="space-y-6 animate-fade-in my-0 py-0 sm:py-2">
//               <AdminBannerSettings />
//             </div>
//           )}

//         </div>
//       </div>   
              

//        {/* CHAT/MODAL POPUPS.................................................................................... */}
//       {selectedTicket && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-end">
//           <div className="bg-slate-950 border-l border-slate-900 w-full max-w-lg h-full p-6 flex flex-col justify-between space-y-6">
//             <div>
//               <div className="flex justify-between items-center border-b border-slate-900 pb-4">
//                 <h3 className="font-display font-bold text-base text-white">{selectedTicket.subject}</h3>
//                 <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white text-xs">Close</button>
//               </div>
//               <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900 mt-4 text-xs text-gray-400">
//                 <p className="font-bold text-orange-500">Customer Problem:</p>
//                 <p className="mt-1">{selectedTicket.description}</p>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto space-y-4 py-4">
//               {selectedTicket.replies?.map((rep, idx) => (
//                 <div key={idx} className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs ${rep.sender === "Admin" ? "ml-auto bg-orange-600/10 border border-orange-500/20 text-orange-200" : "mr-auto bg-slate-900 border border-slate-800 text-gray-300"}`}>
//                   <span className="text-[8px] font-mono text-gray-500 font-bold mb-1">{rep.sender === "Admin" ? "WAO Officer" : "Customer"}</span>
//                   <p>{rep.message}</p>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSendTicketReply} className="flex gap-2.5 pt-4 border-t border-slate-900">
//               <input type="text" required value={ticketReplyText} onChange={(e) => setTicketReplyText(e.target.value)} placeholder="Type helpdesk response..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
//               <button type="submit" className="bg-orange-600 p-3 rounded-xl text-white"><Send className="w-4 h-4" /></button>
//             </form>
//           </div>
//         </div>
//       )}

//       {selectedInquiry && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-6">
//             <h3 className="font-display font-bold text-lg text-white">Compose Quote response</h3>
//             <form onSubmit={handleSendInquiryReply} className="space-y-4 text-xs">
//               <textarea required value={inquiryReplyText} onChange={(e) => setInquiryReplyText(e.target.value)} placeholder="Type email response details..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-36 text-white outline-none resize-none" />
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setSelectedInquiry(null)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Email Quote Reply</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showProductModal && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-5">
//             <h3 className="font-display font-bold text-lg text-white">Register Product Blank</h3>
//             <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
//               <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Product Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="relative">
//                   <span className="absolute left-3 top-3 text-gray-500">PKR</span>
//                   <input 
//                     type="number" 
//                     step="1" 
//                     required 
//                     value={prodPrice === 0 ? "" : prodPrice} 
//                     onFocus={(e) => prodPrice === 0 && setProdPrice("")}
//                     onBlur={(e) => e.target.value === "" && setProdPrice(0)}
//                     onChange={(e) => setProdPrice(e.target.value === "" ? 0 : Number(e.target.value))} 
//                     className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pl-12 text-white outline-none" 
//                     placeholder="Price" 
//                   />
//                 </div>
//                 <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-gray-300 outline-none">
//                   {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
//                 </select>
//               </div>
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Image</label>
//                 <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
//                   <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 text-gray-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-900 text-[11px] transition-colors">
//                     <Upload className="w-3.5 h-3.5 text-orange-500" />
//                     <span>Choose File</span>
//                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                   </label>
//                   <span className="text-gray-500 text-[11px] truncate flex-1 font-mono">
//                     {isCompressing ? "Optimizing & Compressing Asset..." : prodImage ? "Compressed & Optimized ✓" : "No file chosen"}
//                   </span>
//                   {prodImage && !isCompressing && (
//                     <img src={prodImage} alt="Preview" className="w-8 h-8 rounded bg-black object-contain border border-slate-800" />
//                   )}
//                 </div>
//               </div>

//               <textarea required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Material Description" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-20 text-white outline-none resize-none" />
              
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button 
//                   type="submit" 
//                   disabled={isCompressing || isSubmitting}
//                   className={`flex-1 text-white font-bold py-3 rounded-xl transition-all ${isCompressing || isSubmitting ? "bg-orange-800/40 cursor-not-allowed text-gray-500" : "bg-orange-600 hover:bg-orange-500"}`}
//                 >
//                   {isSubmitting ? "Saving Object Live..." : isCompressing ? "Processing Asset..." : "Save Product Blank"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showCouponModal && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-sm space-y-5">
//             <h3 className="font-display font-bold text-lg text-white">Generate Coupon</h3>
//             <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
//               <input type="text" required value={coupCode} onChange={(e) => setCoupCode(e.target.value)} placeholder="E.g., PROMOVIP" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white uppercase outline-none" />
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-500">Discount %</label>
//                   <input type="number" min="1" max="99" required value={coupPct} onChange={(e) => setCoupPct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-500">Min Spend (PKR)</label>
//                   <input type="number" min="0" required value={coupMin} onChange={(e) => setCoupMin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
//                 </div>
//               </div>
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Activate Coupon</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
  //);
}








































// import React, { useState, useEffect, useRef } from "react";
// import { BarChart, Users, Tag, MessageSquare, Plus, Trash2, Send, RefreshCw, Layers, FolderPlus, Lock, Eye, EyeOff, Upload, Image, Clock } from "lucide-react";
// import AdminBannerSettings from "./AdminBannerSettings";

// export default function AdminDashboard() {
//   // Authentication State
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [adminEmail, setAdminEmail] = useState("");
//   const [adminPassword, setAdminPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginError, setLoginError] = useState("");

//   // Dashboard states
//   const [activeTab, setActiveTab] = useState("orders");
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [inquiries, setInquiries] = useState([]);
//   const [coupons, setCoupons] = useState([]);
//   const [tickets, setTickets] = useState([]);
 
//   // Order Timers tracking state (stores remaining seconds for each order ID)
//   const [orderTimers, setOrderTimers] = useState({});
//   const intervalsRef = useRef({});

//   const [categories, setCategories] = useState([
//     "Business Cards",
//     "Mugs Printing",
//     "Pen Printing",
//     "T-Shirts",
//     "Caps",
//     "Sticker Printing"
//   ]);

//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [ticketReplyText, setTicketReplyText] = useState("");
//   const [selectedInquiry, setSelectedInquiry] = useState(null);
//   const [inquiryReplyText, setInquiryReplyText] = useState("");

//   const [showProductModal, setShowProductModal] = useState(false);
//   const [prodName, setProdName] = useState("");
//   const [prodDesc, setProdDesc] = useState("");
//   const [prodPrice, setProdPrice] = useState(2500); 
//   const [prodCategory, setProdCategory] = useState("Business Cards");
//   const [prodImage, setProdImage] = useState(""); 
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [showCouponModal, setShowCouponModal] = useState(false);
//   const [coupCode, setCoupCode] = useState("");
//   const [coupPct, setCoupPct] = useState(15);
//   const [coupMin, setCoupMin] = useState(1000);

//   const [newCategoryName, setNewCategoryName] = useState("");
//   const [showCategoryInput, setShowCategoryInput] = useState(false);

//   // Check login session on mount
//   useEffect(() => {
//     const adminSession = localStorage.getItem("wao_admin_logged_in");
//     if (adminSession === "true") {
//       setIsAuthenticated(true);
//       fetchAdminData();
//     }
//     return () => {
//       // Cleanup all active intervals on unmount
//       Object.values(intervalsRef.current).forEach(clearInterval);
//     };
//   }, []);

//   // Optimized Fetch Data Matrix
//   const fetchAdminData = async () => {
//     try {
//       const [oRes, pRes, iRes, cRes, tRes] = await Promise.all([
//         fetch("/api/orders"),
//         fetch("/api/products"),
//         fetch("/api/inquiries"),
//         fetch("/api/coupons"),
//         fetch("/api/support/tickets")
//       ]);

//       if (oRes.ok) {
//         const fetchedOrders = await oRes.json();
//         setOrders(fetchedOrders);
        
//         // Initialize timers for already Delivered/Cancelled orders if needed
//         fetchedOrders.forEach(o => {
//           if ((o.status === "Delivered" || o.status === "Cancelled") && !intervalsRef.current[o.id]) {
//             startOrderCountdown(o.id);
//           }
//         });
//       }
//       if (pRes.ok) {
//         const prodData = await pRes.json();
//         setProducts(Array.isArray(prodData) ? prodData.reverse() : []);
//       }
//       if (iRes.ok) setInquiries(await iRes.json());
//       if (cRes.ok) setCoupons(await cRes.json());
//       if (tRes.ok) setTickets(await tRes.json());
//     } catch (err) {
//       console.error("Failed to load admin telemetry dataset:", err);
//     }
//   };

//   // 2 Minutes Auto-Delete Timer Core Logic
//   const startOrderCountdown = (orderId) => {
//     if (intervalsRef.current[orderId]) return; // Already running

//     setOrderTimers(prev => ({ ...prev, [orderId]: 120 })); // Set 120 seconds (2 mins)

//     intervalsRef.current[orderId] = setInterval(async () => {
//       setOrderTimers(prev => {
//         const currentLeft = prev[orderId];
//         if (currentLeft <= 1) {
//           clearInterval(intervalsRef.current[orderId]);
//           delete intervalsRef.current[orderId];
          
//           // Trigger Auto Delete execution when time hits 0
//           executeOrderDelete(orderId);
          
//           const newTimers = { ...prev };
//           delete newTimers[orderId];
//           return newTimers;
//         }
//         return { ...prev, [orderId]: currentLeft - 1 };
//       });
//     }, 1000);
//   };

//   const stopOrderCountdown = (orderId) => {
//     if (intervalsRef.current[orderId]) {
//       clearInterval(intervalsRef.current[orderId]);
//       delete intervalsRef.current[orderId];
//     }
//     setOrderTimers(prev => {
//       const newTimers = { ...prev };
//       delete newTimers[orderId];
//       return newTimers;
//     });
//   };

//   const executeOrderDelete = async (id) => {
//     try {
//       const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
//       if (res.ok) {
//         setOrders(prev => prev.filter(o => o.id !== id));
//       }
//     } catch (err) {
//       console.error("Error deleting order:", err);
//     }
//   };

//   const handleManualOrderDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this order permanently from records?")) return;
//     stopOrderCountdown(id);
//     await executeOrderDelete(id);
//   };

//   const handleAdminLogin = (e) => {
//     e.preventDefault();
//     setLoginError("");

//     if (adminEmail.trim() === "admin@waoprints.com" && adminPassword === "admin123") {
//       localStorage.setItem("wao_admin_logged_in", "true");
//       setIsAuthenticated(true);
//       fetchAdminData();
//     } else {
//       setLoginError("Invalid Admin Email or Security Password.");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("wao_admin_logged_in");
//     setIsAuthenticated(false);
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsCompressing(true);
//     const reader = new FileReader();
    
//     reader.onload = (event) => {
//       const img = new window.Image();
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const MAX_WIDTH = 500; 
//         const MAX_HEIGHT = 500;
//         let width = img.width;
//         let height = img.height;

//         if (width > height) {
//           if (width > MAX_WIDTH) {
//             height *= MAX_WIDTH / width;
//             width = MAX_WIDTH;
//           }
//         } else {
//           if (height > MAX_HEIGHT) {
//             width *= MAX_HEIGHT / height;
//             height = MAX_HEIGHT;
//           }
//         }

//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, width, height);

//         const compressedBase64 = canvas.toDataURL("image/jpeg", 0.50);
//         setProdImage(compressedBase64);
//         setIsCompressing(false);
//       };
//       img.src = event.target.result;
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleOrderStatusUpdate = async (id, newStatus) => {
//     try {
//       const res = await fetch(`/api/orders/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus })
//       });
//       if (res.ok) {
//         const updated = await res.json();
//         setOrders(orders.map(o => o.id === id ? updated : o));

//         // Manage dynamic timer conditions
//         if (newStatus === "Delivered" || newStatus === "Cancelled") {
//           startOrderCountdown(id);
//         } else {
//           stopOrderCountdown(id);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

   

// //..................................................
// const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     if (!prodName.trim() || !prodImage || isSubmitting) return;

//     setIsSubmitting(true);
//     if (typeof setIsCompressing === "function") setIsCompressing(true);

//     try {
//       // ==== STEP A: Image ko ImgBB Cloud par bhej kar direct URL lena (UPDATED) ====
//       const formData = new FormData();
      
//       // Agar prodImage Base64 string hai, to usey Blob me convert karein
//       if (typeof prodImage === 'string' && prodImage.startsWith('data:')) {
//         const byteString = atob(prodImage.split(',')[1]);
//         const mimeString = prodImage.split(',')[0].split(':')[1].split(';')[0];
//         const ab = new ArrayBuffer(byteString.length);
//         const ia = new Uint8Array(ab);
//         for (let i = 0; i < byteString.length; i++) {
//           ia[i] = byteString.charCodeAt(i);
//         }
//         const blob = new Blob([ab], { type: mimeString });
//         formData.append("image", blob, "uploaded_product.jpg");
//       } else {
//         // Agar pehle se hi File Object hai to direct append karein
//         formData.append("image", prodImage);
//       }

//       const imgbbRes = await fetch("https://api.imgbb.com/1/upload?key=f3c3635aab4aa1c6a9c1169fdf11cb21", {
//         method: "POST",
//         body: formData
//       });

//       const imgbbData = await imgbbRes.json();
      
//       if (!imgbbData.success) {
//         console.error("ImgBB Full Error Response:", imgbbData);
//         throw new Error("ImgBB Upload Failed");
//       }

//       // ImgBB se mila hua short URL string
//       const cloudImageUrl = imgbbData.data.url; 
//       if (typeof setIsCompressing === "function") setIsCompressing(false);

//       // ==== STEP B: Optimistic UI Update (Screen par instant card dikhana) ====
//       const optimisticNewProduct = {
//         id: "temp-" + Date.now(),
//         name: prodName,
//         description: prodDesc,
//         price: Number(prodPrice),
//         category: prodCategory,
//         images: [cloudImageUrl], 
//         isCustomizable: true
//       };

//       setProducts(prev => [optimisticNewProduct, ...prev]);
//       setShowProductModal(false);

//       // ==== STEP C: MongoDB Backend par data save karwana ====
//       const res = await fetch("/api/products", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: prodName,
//           description: prodDesc,
//           price: Number(prodPrice),
//           category: prodCategory,
//           images: [cloudImageUrl],  
//           isCustomizable: true,
//           specifications: { "Material": "Coated Velvet Litho Base" }
//         })
//       });
      
//       if (res.ok) {
//         const created = await res.json();
//         setProducts(prev => prev.map(p => p.id === optimisticNewProduct.id ? created : p));
//         setProdName("");
//         setProdDesc("");
//         setProdImage("");
//         setProdPrice(2500);
//       } else {
//         // Rollback agar database me network ya server issue ki wajah se save na ho
//         setProducts(prev => prev.filter(p => p.id !== optimisticNewProduct.id));
//         console.warn("MongoDB Sync failed, item rolled back.");
//       }
//     } catch (err) {
//       setProducts(prev => prev.filter(p => p.id !== optimisticNewProduct.id));
//       console.error("Upload/Creation Error:", err);
//     } finally {
//       setIsSubmitting(false);
//       if (typeof setIsCompressing === "function") setIsCompressing(false);
//     }
//   };
 

//  //.............................................................





//   const handleDeleteProduct = async (id) => {
//     if (!window.confirm("Verify: Are you sure you want to delete this product?")) return;
//     try {
//       const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
//       if (res.ok) setProducts(products.filter(p => p.id !== id));
//     } catch (err) {
//       console.error(err);
//     }
//   };


  

//   const handleCreateCoupon = async (e) => {
//     e.preventDefault();
//     if (!coupCode.trim()) return;
//     try {
//       const res = await fetch("/api/coupons", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           code: coupCode.trim().toUpperCase(),
//           discountPercentage: coupPct,
//           minSpend: coupMin
//         })
//       });
//       if (res.ok) {
//         const created = await res.json();
//         setCoupons([created, ...coupons]);
//         setShowCouponModal(false);
//         setCoupCode("");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSendTicketReply = async (e) => {
//     e.preventDefault();
//     if (!ticketReplyText.trim() || !selectedTicket) return;
//     try {
//       const res = await fetch(`/api/support/tickets/${selectedTicket.id}/replies`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sender: "Admin", message: ticketReplyText })
//       });
//       if (res.ok) {
//         const updatedTicket = await res.json();
//         setSelectedTicket(updatedTicket);
//         setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
//         setTicketReplyText("");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSendInquiryReply = async (e) => {
//     e.preventDefault();
//     if (!inquiryReplyText.trim() || !selectedInquiry) return;
//     try {
//       const res = await fetch(`/api/inquiries/${selectedInquiry.id}/reply`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ replyMessage: inquiryReplyText })
//       });
//       if (res.ok) {
//         const updated = await res.json();
//         setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? updated : i));
//         setSelectedInquiry(null);
//         setInquiryReplyText("");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleAddCategory = (e) => {
//     e.preventDefault();
//     const cleanCategory = newCategoryName.trim();
//     if (!cleanCategory) return;
//     if (categories.some(cat => cat.toLowerCase() === cleanCategory.toLowerCase())) return;
//     setCategories([...categories, cleanCategory]);
//     setProdCategory(cleanCategory);
//     setNewCategoryName("");
//     setShowCategoryInput(false);
//   };

//   const handleDeleteCategory = (catToDelete) => {
//     if (!window.confirm(`Are you sure you want to delete "${catToDelete}" category?`)) return;
//     const updatedCategories = categories.filter(cat => cat !== catToDelete);
//     setCategories(updatedCategories);
//     if (prodCategory === catToDelete && updatedCategories.length > 0) {
//       setProdCategory(updatedCategories[0]);
//     }
//   };

//   const formatTimerString = (seconds) => {
//     if (seconds === undefined) return "";
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const totalRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
//   const activeTicketsCount = tickets.filter(t => t.status === "Open").length;
// //..........................................................................................................


 
 
//    if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 pt-16 sm:pt-28">
//         <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl animate-scale-up">
//           <div className="text-center space-y-1.5">
//             <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/5">
//               <Lock className="w-5 h-5" />
//             </div>
//             <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
//             <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
//           </div>

//           <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
//             {loginError && (
//               <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
//                 {loginError}
//               </div>
//             )}

//             <div className="space-y-1">
//               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</label>
//               <input
//                 type="email"
//                 required
//                 value={adminEmail}
//                 onChange={(e) => setAdminEmail(e.target.value)}
//                 placeholder="admin@waoprints.com"
//                 className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none transition-all"
//               />
//             </div>

//             <div className="space-y-1 relative">
//               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   required
//                   value={adminPassword}
//                   onChange={(e) => setAdminPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-xs text-white outline-none transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
//                 >
//                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/10 cursor-pointer flex items-center justify-center gap-2 mt-2 uppercase tracking-wider text-[11px]"
//             >
//               Connect Security Portal →
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-16 sm:pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 animate-fade-in" id="admin-dashboard-container">
      
//       {/* Title telemetry header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
//         <div>
//           <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">TELEMETRY SYSTEM CONSOLE</span>
//           <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-1">WAO Admin Console</h1>
//           <p className="text-gray-400 text-xs font-mono mt-0.5">Control Plate Matrices, Orders, and AI Ticket Dialogues</p>
//         </div>
//         <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
//           <button
//             onClick={fetchAdminData}
//             className="p-2.5 text-gray-400 hover:text-white rounded-xl border border-slate-900 hover:border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Live Sync
//           </button>
//           <button
//             onClick={handleLogout}
//             className="p-2.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded-xl border border-rose-900/30 transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
//           >
//             Exit Terminal
//           </button>
//         </div>
//       </div>

//       {/* Analytics Bento Cards Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Gross Income Cashflow</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-orange-500">PKR {totalRevenue.toLocaleString()}</div>
//           <p className="text-[11px] text-gray-400">Total authorized order checkouts.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Submissions Queue</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-white">{orders.length} Runs</div>
//           <p className="text-[11px] text-gray-400">Active print sheets scheduled.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">B2B Corporate Inquiries</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-white">{inquiries.length} Quotes</div>
//           <p className="text-[11px] text-gray-400">Unanswered volume leads.</p>
//         </div>

//         <div className="bg-slate-950/40 border border-slate-900 p-5 sm:p-6 rounded-3xl space-y-2">
//           <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Active Support Tickets</p>
//           <div className="font-display font-black text-2xl sm:text-3xl text-rose-500">{activeTicketsCount} Open</div>
//           <p className="text-[11px] text-gray-400">Customer requests needing inspection.</p>
//         </div>
//       </div>

//       {/* Main split tab section */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
//         {/* Left Side: Category switchers */}
//         <div className="lg:col-span-3 space-y-2 bg-slate-950/40 border border-slate-900 rounded-3xl p-4 sm:p-5">
//           <button
//             onClick={() => setActiveTab("orders")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "orders" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <BarChart className="w-4 h-4" />
//             Order Manager ({orders.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("products")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "products" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Layers className="w-4 h-4" />
//             Catalog Products ({products.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("inquiries")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "inquiries" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Users className="w-4 h-4" />
//             Corporate Inquiries ({inquiries.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("coupons")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "coupons" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Tag className="w-4 h-4" />
//             Promo Coupons ({coupons.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("tickets")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "tickets" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <MessageSquare className="w-4 h-4" />
//             Helpdesk Tickets ({tickets.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("banners")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "banners" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Image className="w-4 h-4" />
//             Banners Control
//           </button>
//         </div>

//         {/* Right Side: Tab panel contents */}
//         <div className="lg:col-span-9 bg-slate-950/40 border border-slate-900 p-5 sm:p-8 rounded-3xl min-h-[55vh]">
          
//           {/* TAB 1: ORDER MANAGER */}
//           {activeTab === "orders" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Prism Printing Plate Production Pipeline</h3>
//               <div className="space-y-4">
//                 {orders.map(o => (
//                   <div key={o.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
//                     <div className="text-xs space-y-1 z-10">
//                       <div className="flex flex-wrap items-center gap-2">
//                         <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{o.id}</span>
//                         <span className="font-sans text-gray-400 font-bold">Client: {o.customerName || "N/A"}</span>
//                       </div>
//                       <h4 className="font-bold text-sm text-white mt-1.5">{o.items?.length || 0} print batches • Total: PKR {Number(o.grandTotal || 0).toLocaleString()}</h4>
                      
//                       <div className="text-[11px] text-gray-400 pt-1 space-y-0.5 font-sans">
//                         <p><span className="text-gray-500 font-medium">Contact Matrix:</span> {o.customerEmail || "No Email Registered"} {o.customerPhone && `| ${o.customerPhone}`}</p>
//                         {o.shippingAddress && <p><span className="text-gray-500 font-medium">Logistics Target:</span> {o.shippingAddress}</p>}
//                         {o.items && o.items.length > 0 && (
//                           <div className="mt-1.5 pt-1.5 border-t border-slate-900/60 text-[10px] font-mono text-gray-500">
//                             {o.items.map((item, idx) => (
//                               <div key={idx}>» {item.name || "Unknown Material"} (x{item.quantity || 1}) - {item.category || "General"}</div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                       {/* Display live timer block only when order is Cancelled or Delivered */}
//                       {(o.status === "Cancelled" || o.status === "Delivered") && orderTimers[o.id] !== undefined && (
//                         <div className="mt-3 flex items-center gap-1.5 text-rose-400 font-mono text-[11px] bg-rose-950/20 border border-rose-900/30 px-3 py-1 rounded-xl w-fit">
//                           <Clock className="w-3.5 h-3.5 animate-pulse text-rose-500" />
//                           <span>Auto-deleting pipeline in: <strong className="text-white font-black">{formatTimerString(orderTimers[o.id])}</strong></span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10">
//                       <select
//                         value={o.status}
//                         onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
//                         className={`bg-slate-950 border rounded-lg p-2 text-[10px] uppercase font-bold outline-none ${
//                           o.status === "Cancelled" ? "border-rose-900/50 text-rose-500" : "border-slate-800 text-orange-400"
//                         }`}
//                       >
//                         <option value="Pending">Pending</option>
//                         <option value="Processing">Processing</option>
//                         <option value="Printing">Printing</option>
//                         <option value="Dispatched">Dispatched</option>
//                         <option value="Delivered">Delivered</option>
//                         <option value="Cancelled">Cancelled (Drop Batch)</option>
//                       </select>

//                       {/* Manual Trash Delete Option */}
//                       <button 
//                         onClick={() => handleManualOrderDelete(o.id)}
//                         className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-gray-500 hover:text-rose-500 hover:border-rose-900/40 transition-all cursor-pointer"
//                         title="Delete Order Permanently"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 {orders.length === 0 && <p className="text-gray-500 text-xs font-mono">No live manufacturing orders found.</p>}
//               </div>
//             </div>
//           )}

//           {/* TAB 2: PRODUCT CATALOG CRUD */}
//           {activeTab === "products" && (
//             <div className="space-y-6 animate-fade-in">
//               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//                 <h3 className="font-display font-bold text-lg text-white">Registered Core Catalog Materials</h3>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setShowCategoryInput(!showCategoryInput)}
//                     className="bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider px-3 py-2.5 rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5"
//                   >
//                     <FolderPlus className="w-4 h-4 text-orange-500" />
//                     Manage Categories
//                   </button>
//                   <button
//                     onClick={() => setShowProductModal(true)}
//                     className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Register New Blank
//                   </button>
//                 </div>
//               </div>

//               {showCategoryInput && (
//                 <form onSubmit={handleAddCategory} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex gap-3 items-end animate-fade-in">
//                   <div className="flex-1 space-y-1">
//                     <label className="text-[9px] font-semibold text-gray-400 uppercase font-mono">Add Dynamic New Category</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="e.g., Hoodies, Keychains..."
//                       value={newCategoryName}
//                       onChange={(e) => setNewCategoryName(e.target.value)}
//                       className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
//                     />
//                   </div>
//                   <button type="submit" className="bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-orange-400 transition-colors">
//                     Add Block
//                   </button>
//                 </form>
//               )}

//               <div className="flex flex-wrap gap-2 pb-2">
//                 {categories.map((cat, idx) => (
//                   <div key={idx} className="bg-slate-950 text-gray-400 text-[10px] font-mono pl-2.5 pr-1 py-1 rounded-md border border-slate-900 flex items-center gap-1.5">
//                     <span>{cat}</span>
//                     <button 
//                       type="button" 
//                       onClick={() => handleDeleteCategory(cat)} 
//                       className="text-gray-600 hover:text-rose-500 p-0.5 transition-colors"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {products.map(p => (
//                   <div key={p.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 flex justify-between items-center gap-4">
//                     <div className="flex items-center gap-3">
//                       <img src={p.images?.[0] || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"} alt="" className="w-10 h-10 rounded bg-slate-950 object-contain p-1 shrink-0" />
//                       <div>
//                         <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
//                         <p className="text-[10px] text-gray-500 font-mono mt-0.5">PKR {Number(p.price).toLocaleString()} | {p.category}</p>
//                       </div>
//                     </div>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-slate-950 text-gray-500 hover:text-rose-500 border border-slate-800 rounded-lg transition-colors">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TAB 3: B2B COMMERCIAL INQUIRIES */}
//           {activeTab === "inquiries" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">B2B Volume Quote Inquiries</h3>
//               <div className="space-y-4">
//                 {inquiries.map(i => (
//                   <div key={i.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 space-y-4">
//                     <div className="flex justify-between items-start">
//                       <div className="text-xs">
//                         <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{i.serviceName}</span>
//                         <h4 className="font-bold text-sm text-white mt-1.5">{i.customerName}</h4>
//                         <p className="text-[10px] text-gray-500 font-mono mt-0.5">Target Run: {i.quantity} units</p>
//                       </div>
//                     </div>
//                     <p className="text-gray-400 text-xs italic">" {i.message} "</p>
//                     {i.replyMessage ? (
//                       <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-gray-300">
//                         <p className="font-bold text-orange-400 uppercase text-[8px] tracking-widest font-mono">Emailed Response Quote:</p>
//                         <p className="mt-1">{i.replyMessage}</p>
//                       </div>
//                     ) : (
//                       <button onClick={() => setSelectedInquiry(i)} className="text-xs text-orange-400 hover:text-orange-300 font-bold underline">
//                         Email PDF Quote reply →
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TAB 4: COUPONS SYSTEM */}
//           {activeTab === "coupons" && (
//             <div className="space-y-6 animate-fade-in">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-display font-bold text-lg text-white">Promo Campaign Coupon Codes</h3>
//                 <button onClick={() => setShowCouponModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors">
//                   Generate Coupon Code
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {coupons.map((c, idx) => (
//                   <div key={c.code || idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 text-center space-y-2">
//                     <span className="font-mono font-bold text-sm text-white bg-slate-950 px-3 py-1 rounded border border-slate-800 inline-block">
//                       {c.code}
//                     </span>
//                     <p className="text-xs text-orange-500 font-bold mt-2">{c.discountPercentage}% Discount</p>
//                     <p className="text-[10px] text-gray-400">Min Spend: PKR {Number(c.minSpend || 0).toLocaleString()}</p>
//                   </div>
//                 ))}
//                 {coupons.length === 0 && <p className="text-gray-500 text-xs font-mono col-span-full text-center py-4">No active verification promo blocks running.</p>}
//               </div>
//             </div>
//           )}

//           {/* TAB 5: SUPPORT TICKETS */}
//           {activeTab === "tickets" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Active Support Helpdesk Queue</h3>
//               <div className="space-y-4">
//                 {tickets.map(tk => (
//                   <div key={tk.id} onClick={() => setSelectedTicket(tk)} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer flex justify-between items-center">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{tk.category}</span>
//                         <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${tk.status === "Open" ? "bg-emerald-950/20 text-emerald-400" : "text-gray-500"}`}>{tk.status}</span>
//                       </div>
//                       <h4 className="font-bold text-sm text-white mt-2">{tk.subject}</h4>
//                     </div>
//                     <span className="text-xs text-orange-500 font-bold">Open chat →</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

           
//            {activeTab === "banners" && (
//             <div className="space-y-6 animate-fade-in my-0 py-0 sm:py-2">
//               <AdminBannerSettings />
               
              
//             </div>
//             )}

//         </div>
//       </div> 

//        {/* CHAT/MODAL POPUPS.................................................................................... */}
//       {selectedTicket && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-end">
//           <div className="bg-slate-950 border-l border-slate-900 w-full max-w-lg h-full p-6 flex flex-col justify-between space-y-6">
//             <div>
//               <div className="flex justify-between items-center border-b border-slate-900 pb-4">
//                 <h3 className="font-display font-bold text-base text-white">{selectedTicket.subject}</h3>
//                 <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white text-xs">Close</button>
//               </div>
//               <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900 mt-4 text-xs text-gray-400">
//                 <p className="font-bold text-orange-500">Customer Problem:</p>
//                 <p className="mt-1">{selectedTicket.description}</p>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto space-y-4 py-4">
//               {selectedTicket.replies?.map((rep, idx) => (
//                 <div key={idx} className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs ${rep.sender === "Admin" ? "ml-auto bg-orange-600/10 border border-orange-500/20 text-orange-200" : "mr-auto bg-slate-900 border border-slate-800 text-gray-300"}`}>
//                   <span className="text-[8px] font-mono text-gray-500 font-bold mb-1">{rep.sender === "Admin" ? "WAO Officer" : "Customer"}</span>
//                   <p>{rep.message}</p>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSendTicketReply} className="flex gap-2.5 pt-4 border-t border-slate-900">
//               <input type="text" required value={ticketReplyText} onChange={(e) => setTicketReplyText(e.target.value)} placeholder="Type helpdesk response..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
//               <button type="submit" className="bg-orange-600 p-3 rounded-xl text-white"><Send className="w-4 h-4" /></button>
//             </form>
//           </div>
//         </div>
//       )}

//       {selectedInquiry && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-6">
//             <h3 className="font-display font-bold text-lg text-white">Compose Quote response</h3>
//             <form onSubmit={handleSendInquiryReply} className="space-y-4 text-xs">
//               <textarea required value={inquiryReplyText} onChange={(e) => setInquiryReplyText(e.target.value)} placeholder="Type email response details..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-36 text-white outline-none resize-none" />
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setSelectedInquiry(null)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Email Quote Reply</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showProductModal && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-w-lg space-y-5">
//             <h3 className="font-display font-bold text-lg text-white">Register Product Blank</h3>
//             <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
//               <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Product Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="relative">
//                   <span className="absolute left-3 top-3 text-gray-500">PKR</span>
//                   <input 
//                     type="number" 
//                     step="1" 
//                     required 
//                     value={prodPrice === 0 ? "" : prodPrice} 
//                     onFocus={(e) => prodPrice === 0 && setProdPrice("")}
//                     onBlur={(e) => e.target.value === "" && setProdPrice(0)}
//                     onChange={(e) => setProdPrice(e.target.value === "" ? 0 : Number(e.target.value))} 
//                     className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pl-12 text-white outline-none" 
//                     placeholder="Price" 
//                   />
//                 </div>
//                 <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-gray-300 outline-none">
//                   {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
//                 </select>
//               </div>
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Image</label>
//                 <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
//                   <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 text-gray-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-900 text-[11px] transition-colors">
//                     <Upload className="w-3.5 h-3.5 text-orange-500" />
//                     <span>Choose File</span>
//                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                   </label>
//                   <span className="text-gray-500 text-[11px] truncate flex-1 font-mono">
//                     {isCompressing ? "Optimizing & Compressing Asset..." : prodImage ? "Compressed & Optimized ✓" : "No file chosen"}
//                   </span>
//                   {prodImage && !isCompressing && (
//                     <img src={prodImage} alt="Preview" className="w-8 h-8 rounded bg-black object-contain border border-slate-800" />
//                   )}
//                 </div>
//               </div>

//               <textarea required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Material Description" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 h-20 text-white outline-none resize-none" />
              
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button 
//                   type="submit" 
//                   disabled={isCompressing || isSubmitting}
//                   className={`flex-1 text-white font-bold py-3 rounded-xl transition-all ${isCompressing || isSubmitting ? "bg-orange-800/40 cursor-not-allowed text-gray-500" : "bg-orange-600 hover:bg-orange-500"}`}
//                 >
//                   {isSubmitting ? "Saving Object Live..." : isCompressing ? "Processing Asset..." : "Save Product Blank"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showCouponModal && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-sm space-y-5">
//             <h3 className="font-display font-bold text-lg text-white">Generate Coupon</h3>
//             <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
//               <input type="text" required value={coupCode} onChange={(e) => setCoupCode(e.target.value)} placeholder="E.g., PROMOVIP" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white uppercase outline-none" />
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-500">Discount %</label>
//                   <input type="number" min="1" max="99" required value={coupPct} onChange={(e) => setCoupPct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-500">Min Spend (PKR)</label>
//                   <input type="number" min="0" required value={coupMin} onChange={(e) => setCoupMin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
//                 </div>
//               </div>
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
//                 <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Activate Coupon</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }




 











//........................................................



      // {showCouponModal && (
      //   <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      //     <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl w-full max-sm space-y-5">
      //       <h3 className="font-display font-bold text-lg text-white">Generate Coupon</h3>
      //       <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
      //         <input type="text" required value={coupCode} onChange={(e) => setCoupCode(e.target.value)} placeholder="E.g., PROMOVIP" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white uppercase outline-none" />
      //         <div className="grid grid-cols-2 gap-4">
      //           <div className="space-y-1">
      //             <label className="text-[10px] font-bold text-gray-500">Discount %</label>
      //             <input type="number" min="1" max="99" required value={coupPct} onChange={(e) => setCoupPct(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
      //           </div>
      //           <div className="space-y-1">
      //             <label className="text-[10px] font-bold text-gray-500">Min Spend (PKR)</label>
      //             <input type="number" min="0" required value={coupMin} onChange={(e) => setCoupMin(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
      //           </div>
      //         </div>
      //         <div className="flex gap-3">
      //           <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 bg-slate-900 text-gray-400 py-3 rounded-xl">Cancel</button>
      //           <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl">Activate Coupon</button>
      //         </div>
      //       </form>
      //     </div>
      //   </div>
      // )}