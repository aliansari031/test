import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import { ArrowRight, Mail, Lock, User as UserIcon, Sparkles, X, Eye, EyeOff } from "lucide-react";

export default function App() {
  // 1. Sync router paths based on current URL path
  const getInitialTabFromUrl = () => {
    const path = window.location.pathname;
    if (path === "/admin/login") return "admin-login";
    if (path === "/admin/dashboard") return "admin";
    if (path === "/services") return "services";
    if (path === "/portfolio") return "portfolio";
    if (path === "/shop") return "shop";
    if (path === "/about") return "about";
    if (path === "/terms") return "terms";
    if (path === "/cart") return "cart";
    if (path === "/checkout") return "checkout";
    if (path === "/dashboard") return "dashboard";
    return "home";
  };

  const [currentTab, setCurrentTab] = useState(getInitialTabFromUrl);
  const [products, setProducts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // PERSISTENCE SOLUTION: Initialize user directly from localStorage to prevent logout on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("wao_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");

  // Standalone Admin Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Wishlist and Cart
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Checkout params
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState(null);

  // Handle browser URL synchronization for all routes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === "/admin/login") {
        setCurrentTab("admin-login");
      } else if (path === "/admin/dashboard") {
        const isAdmin = localStorage.getItem("wao_admin_logged_in") === "true";
        if (isAdmin) {
          setCurrentTab("admin");
        } else {
          window.history.pushState({}, "", "/admin/login");
          setCurrentTab("admin-login");
        }
      } else if (path === "/") {
        setCurrentTab("home");
        setSelectedProduct(null);
      } else {
        // Automatically sync standard customer paths
        const cleanTab = path.replace("/", "");
        setCurrentTab(cleanTab);
        setSelectedProduct(null);
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Sync products and portfolio on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) setProducts(await prodRes.json());

        const portRes = await fetch("/api/portfolio");
        if (portRes.ok) setPortfolio(await portRes.json());
      } catch (err) {
        console.error("Failed to load catalog datasets:", err);
      }
    };
    fetchInitialData();
  }, []);

  // Handle Standalone Admin Login Action
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError("");

    if (adminEmail.trim() === "admin@waoprints.com" && adminPassword === "admin123") {
      localStorage.setItem("wao_admin_logged_in", "true");
      window.history.pushState({}, "", "/admin/dashboard");
      setCurrentTab("admin");
    } else {
      setAdminError("Invalid Admin Email or Security Password.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("wao_admin_logged_in");
    window.history.pushState({}, "", "/");
    setCurrentTab("home");
  };

  // Handle Dynamic Wishlist Toggle
  const handleToggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  // Custom Gift Combo Box Handler
  const handleAddComboToCart = (comboItems, totalPrice) => {
    const newComboCartItem = {
      isGiftCombo: true,
      quantity: 1,
      finalPrice: totalPrice,
      comboItems: comboItems,
      product: {
        name: "Custom Gift Combo Box",
        images: comboItems[0]?.image ? [comboItems[0].image] : [],
        category: "Premium Bundle"
      }
    };

    setCartItems((prevItems) => [...prevItems, newComboCartItem]);
    localStorage.removeItem("wao_gift_combo");
    window.dispatchEvent(new Event("wao_combo_updated"));
    handleTabChangeWithReset("cart");
  };

  const handleUpdateQuantity = (idx, newQty) => {
    setCartItems(cartItems.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (idx) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleProceedToCheckout = (discount, coupon) => {
    setCheckoutDiscount(discount);
    setCheckoutCoupon(coupon);
    
    if (!user) {
      setShowLoginModal(true);
    } else {
      handleTabChangeWithReset("checkout");
    }
  };

  // User Registration & Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = registerMode ? "/api/auth/register" : "/api/auth/login";
      const payload = registerMode 
        ? { email: loginEmail, password: loginPassword, name: registerName }
        : { email: loginEmail, password: loginPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const loggedUser = await res.json();
        
        if (loggedUser.role === "Admin" || loginEmail === "admin@waoprints.com") {
          alert("Unauthorized access. Admin profiles must authenticate through terminal interface.");
          return;
        }

        // Save to state AND save to localStorage so it persists on reload
        setUser(loggedUser);
        localStorage.setItem("wao_user", JSON.stringify(loggedUser));
        
        setShowLoginModal(false);
        setLoginEmail("");
        setLoginPassword("");
        setRegisterName("");
        
        if (cartItems.length > 0 && currentTab === "cart") {
          handleTabChangeWithReset("checkout");
        } else {
          handleTabChangeWithReset("dashboard");
        }
      } else {
        const errData = await res.json();
        alert(errData.message || "Authentication credentials failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with central authentication authority.");
    }
  };

  const handleLogout = () => {
    // Clear user storage completely
    localStorage.removeItem("wao_user");
    setUser(null);
    handleTabChangeWithReset("home");
  };

  // Central Router Handler to trigger actual path changes in browser URL
  const handleTabChangeWithReset = (tab) => {
    if (tab === "login") {
      setShowLoginModal(true);
    } else {
      // Dynamic URL Push mapping
      const targetPath = tab === "home" ? "/" : `/${tab}`;
      window.history.pushState({}, "", targetPath);
      
      setSelectedProduct(null);
      setCurrentTab(tab);
    }
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  const isHoldingAdminTerminal = currentTab === "admin-login" || currentTab === "admin";

  return (
    <div className="bg-[#03060d] min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative pb-10">
      
      {/* 1. FLOATING NAVIGATION BAR */}
      {!isHoldingAdminTerminal && (
        <Navbar
          currentTab={currentTab === "checkout" ? "shop" : currentTab}
          onTabChange={handleTabChangeWithReset}
          cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
          wishlistCount={wishlist.length}
          user={user}
          onLogout={handleLogout}
          onAddComboToCart={handleAddComboToCart}
        />
      )}

      {/* 2. ROUTED VIEWS SWITCH */}
      <main className="min-h-[80vh]">
        
        {/* STANDALONE ADMIN LOGIN PAGE */}
        {currentTab === "admin-login" && (
          <div className="min-h-[90vh] bg-slate-950 flex items-center justify-center p-4 pt-24">
            <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
                <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
                {adminError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
                    {adminError}
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
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Connect Security Portal →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STANDALONE ADMIN DASHBOARD TRACK */}
        {currentTab === "admin" && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}

        {/* REGULAR WEBSITE INTERFACES */}
        {!isHoldingAdminTerminal && (
          <>
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                onBack={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddComboToCart={handleAddComboToCart}
              />
            ) : (
              <>
                {currentTab === "home" && (
                  <Home
                    featuredProducts={products}
                    portfolioProjects={portfolio}
                    onTabChange={handleTabChangeWithReset}
                    onSelectProduct={setSelectedProduct}
                  />
                )}

                {currentTab === "services" && <Services />}
                {currentTab === "portfolio" && <Portfolio />}

                {currentTab === "shop" && (
                  <Shop
                    products={products}
                    onSelectProduct={setSelectedProduct}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}

                {currentTab === "about" && <About />}
                {currentTab === "terms" && <Terms />}

                {currentTab === "cart" && (
                  <Cart
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onProceedToCheckout={handleProceedToCheckout}
                    onBackToShop={() => handleTabChangeWithReset("shop")}
                  />
                )}

                {currentTab === "checkout" && (
                  <Checkout
                    cartItems={cartItems}
                    user={user}
                    discountAmount={checkoutDiscount}
                    couponCode={checkoutCoupon}
                    onOrderPlaced={(order) => {
                      setCartItems([]);
                      alert(`Order Placed Successfully! Code: ${order.id}`);
                      handleTabChangeWithReset("dashboard");
                    }}
                    onBackToCart={() => handleTabChangeWithReset("cart")}
                  />
                )}

                {currentTab === "dashboard" && user && (
                  <CustomerDashboard
                    user={user}
                    onLogout={handleLogout}
                    wishlistProducts={wishlistProducts}
                    onSelectProduct={setSelectedProduct}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 3. RESPONSIVE FOOTER */}
      {!isHoldingAdminTerminal && <Footer onTabChange={handleTabChangeWithReset} />}

      {/* 4. CLIENT ONLY LOGIN / REGISTER POPUP PANEL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" id="login-modal-overlay">
          <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative glass-card">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl border border-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-white">
                {registerMode ? "Create Client Account" : "Customer Portal Access"}
              </h3>
              <p className="text-xs text-gray-400">
                {registerMode ? "Create your account to order print bundles." : "Enter your design panel credentials."}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {registerMode && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="E.g., David Miller"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
                    />
                    <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {registerMode ? "Sign Up" : "Log In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-900">
              <button
                onClick={() => setRegisterMode(!registerMode)}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
              >
                {registerMode ? "Already have an account? Sign In" : "New corporate customer? Register Here"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}




















// import React, { useState, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Services from "./pages/Services";
// import Portfolio from "./pages/Portfolio";
// import Shop from "./pages/Shop";
// import ProductDetail from "./pages/ProductDetail";
// import Cart from "./pages/Cart";
// import Checkout from "./pages/Checkout";
// import CustomerDashboard from "./pages/CustomerDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import Terms from "./pages/Terms";
// import { ArrowRight, Mail, Lock, User as UserIcon, Sparkles, X, Eye, EyeOff } from "lucide-react";

// export default function App() {
//   // Sync router paths based on current URL parameters for clean standalone screens
//   const getInitialTabFromUrl = () => {
//     const path = window.location.pathname;
//     if (path === "/admin/login") return "admin-login";
//     if (path === "/admin/dashboard") return "admin";
//     return "home";
//   };

//   const [currentTab, setCurrentTab] = useState(getInitialTabFromUrl);
//   const [products, setProducts] = useState([]);
//   const [portfolio, setPortfolio] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // User state (Only for Customers on main site)
//   const [user, setUser] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [registerMode, setRegisterMode] = useState(false);
//   const [registerName, setRegisterName] = useState("");

//   // Standalone Admin Form State
//   const [adminEmail, setAdminEmail] = useState("");
//   const [adminPassword, setAdminPassword] = useState("");
//   const [showAdminPassword, setShowAdminPassword] = useState(false);
//   const [adminError, setAdminError] = useState("");

//   // Wishlist and Cart
//   const [wishlist, setWishlist] = useState([]);
//   const [cartItems, setCartItems] = useState([]);

//   // Checkout params
//   const [checkoutDiscount, setCheckoutDiscount] = useState(0);
//   const [checkoutCoupon, setCheckoutCoupon] = useState(null);

//   // Handle browser URL synchronization without massive dependencies
//   useEffect(() => {
//     const handleLocationChange = () => {
//       const path = window.location.pathname;
//       if (path === "/admin/login") {
//         setCurrentTab("admin-login");
//       } else if (path === "/admin/dashboard") {
//         const isAdmin = localStorage.getItem("wao_admin_logged_in") === "true";
//         if (isAdmin) {
//           setCurrentTab("admin");
//         } else {
//           window.history.pushState({}, "", "/admin/login");
//           setCurrentTab("admin-login");
//         }
//       } else {
//         setSelectedProduct(null);
//       }
//     };

//     window.addEventListener("popstate", handleLocationChange);
//     return () => window.removeEventListener("popstate", handleLocationChange);
//   }, []);

//   // Sync products and portfolio on mount
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const prodRes = await fetch("/api/products");
//         if (prodRes.ok) setProducts(await prodRes.json());

//         const portRes = await fetch("/api/portfolio");
//         if (portRes.ok) setPortfolio(await portRes.json());
//       } catch (err) {
//         console.error("Failed to load catalog datasets:", err);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   // Handle Standalone Admin Login Action
//   const handleAdminLoginSubmit = (e) => {
//     e.preventDefault();
//     setAdminError("");

//     if (adminEmail.trim() === "admin@waoprints.com" && adminPassword === "admin123") {
//       localStorage.setItem("wao_admin_logged_in", "true");
//       window.history.pushState({}, "", "/admin/dashboard");
//       setCurrentTab("admin");
//     } else {
//       setAdminError("Invalid Admin Email or Security Password.");
//     }
//   };

//   const handleAdminLogout = () => {
//     localStorage.removeItem("wao_admin_logged_in");
//     window.history.pushState({}, "", "/");
//     setCurrentTab("home");
//   };

//   // Handle Dynamic Wishlist Toggle
//   const handleToggleWishlist = (id) => {
//     if (wishlist.includes(id)) {
//       setWishlist(wishlist.filter(item => item !== id));
//     } else {
//       setWishlist([...wishlist, id]);
//     }
//   };

//   // Add Item to Shopping Cart (Standard Items)
//   const handleAddToCart = (item) => {
//     setCartItems([...cartItems, item]);
//   };

//   // Custom Gift Combo Box Handler
//   const handleAddComboToCart = (comboItems, totalPrice) => {
//     const newComboCartItem = {
//       isGiftCombo: true,
//       quantity: 1,
//       finalPrice: totalPrice,
//       comboItems: comboItems,
//       product: {
//         name: "Custom Gift Combo Box",
//         images: comboItems[0]?.image ? [comboItems[0].image] : [],
//         category: "Premium Bundle"
//       }
//     };

//     setCartItems((prevItems) => [...prevItems, newComboCartItem]);
    
//     // Clear local storage metrics once bundle pushes to global pipeline
//     localStorage.removeItem("wao_gift_combo");
//     window.dispatchEvent(new Event("wao_combo_updated"));
    
//     // Smooth redirect directly to cart view for high operational conversion
//     setCurrentTab("cart");
//   };

//   const handleUpdateQuantity = (idx, newQty) => {
//     setCartItems(cartItems.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
//   };

//   const handleRemoveItem = (idx) => {
//     setCartItems(cartItems.filter((_, i) => i !== idx));
//   };

//   const handleProceedToCheckout = (discount, coupon) => {
//     setCheckoutDiscount(discount);
//     setCheckoutCoupon(coupon);
    
//     if (!user) {
//       setShowLoginModal(true);
//     } else {
//       setCurrentTab("checkout");
//     }
//   };

//   // User/Customer Login Request ONLY (Removes Admin Bypass from frontend modal)
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = registerMode ? "/api/auth/register" : "/api/auth/login";
//       const payload = registerMode 
//         ? { email: loginEmail, password: loginPassword, name: registerName }
//         : { email: loginEmail, password: loginPassword };

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (res.ok) {
//         const loggedUser = await res.json();
        
//         // Block Admin Roles from logging in through client panel interface
//         if (loggedUser.role === "Admin" || loginEmail === "admin@waoprints.com") {
//           alert("Unauthorized access. Admin profiles must authenticate through terminal interface.");
//           return;
//         }

//         setUser(loggedUser);
//         setShowLoginModal(false);
//         setLoginEmail("");
//         setLoginPassword("");
//         setRegisterName("");
        
//         if (cartItems.length > 0 && currentTab === "cart") {
//           setCurrentTab("checkout");
//         } else {
//           setCurrentTab("dashboard");
//         }
//       } else {
//         const errData = await res.json();
//         alert(errData.message || "Authentication credentials failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error communicating with central authentication authority.");
//     }
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setCurrentTab("home");
//   };

//   const handleTabChangeWithReset = (tab) => {
//     if (tab === "login") {
//       setShowLoginModal(true);
//     } else {
//       // Clear paths if navigating away to standard tabs
//       if (window.location.pathname.startsWith("/admin")) {
//         window.history.pushState({}, "", "/");
//       }
//       setSelectedProduct(null);
//       setCurrentTab(tab);
//     }
//   };

//   const wishlistProducts = products.filter(p => wishlist.includes(p.id));
//   const isHoldingAdminTerminal = currentTab === "admin-login" || currentTab === "admin";

//   return (
//     <div className="bg-[#03060d] min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative pb-10">
      
//       {/* 1. FLOATING NAVIGATION BAR - Hidden if on Admin Pages */}
//       {!isHoldingAdminTerminal && (
//         <Navbar
//           currentTab={currentTab === "checkout" ? "shop" : currentTab}
//           onTabChange={handleTabChangeWithReset}
//           cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
//           wishlistCount={wishlist.length}
//           user={user}
//           onLogout={handleLogout}
//           onAddComboToCart={handleAddComboToCart} // <-- YEH PROP MISSING THA, AB LINK HO GAYA HAI!
//         />
//       )}

//       {/* 2. ROUTED VIEWS SWITCH */}
//       <main className="min-h-[80vh]">
        
//         {/* STANDALONE ADMIN LOGIN PAGE (waoprinter.com/admin/login) */}
//         {currentTab === "admin-login" && (
//           <div className="min-h-[90vh] bg-slate-950 flex items-center justify-center p-4 pt-24">
//             <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl">
//               <div className="text-center space-y-1.5">
//                 <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
//                   <Lock className="w-5 h-5" />
//                 </div>
//                 <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
//                 <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
//               </div>

//               <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
//                 {adminError && (
//                   <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
//                     {adminError}
//                   </div>
//                 )}

//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</label>
//                   <input
//                     type="email"
//                     required
//                     value={adminEmail}
//                     onChange={(e) => setAdminEmail(e.target.value)}
//                     placeholder="admin@waoprints.com"
//                     className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-white outline-none"
//                   />
//                 </div>

//                 <div className="space-y-1 relative">
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
//                   <div className="relative">
//                     <input
//                       type={showAdminPassword ? "text" : "password"}
//                       required
//                       value={adminPassword}
//                       onChange={(e) => setAdminPassword(e.target.value)}
//                       placeholder="••••••••"
//                       className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-white outline-none"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowAdminPassword(!showAdminPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
//                     >
//                       {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] cursor-pointer"
//                 >
//                   Connect Security Portal →
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* STANDALONE ADMIN DASHBOARD TRACK */}
//         {currentTab === "admin" && (
//           <AdminDashboard onLogout={handleAdminLogout} />
//         )}

//         {/* REGULAR WEBSITE INTERFACES */}
//         {!isHoldingAdminTerminal && (
//           <>
//             {selectedProduct ? (
//               <ProductDetail
//                 product={selectedProduct}
//                 onBack={() => setSelectedProduct(null)}
//                 onAddToCart={handleAddToCart}
//                 wishlist={wishlist}
//                 onToggleWishlist={handleToggleWishlist}
//                 onAddComboToCart={handleAddComboToCart}
//               />
//             ) : (
//               <>
//                 {currentTab === "home" && (
//                   <Home
//                     featuredProducts={products}
//                     portfolioProjects={portfolio}
//                     onTabChange={handleTabChangeWithReset}
//                     onSelectProduct={setSelectedProduct}
//                   />
//                 )}

//                 {currentTab === "services" && <Services />}
//                 {currentTab === "portfolio" && <Portfolio />}

//                 {currentTab === "shop" && (
//                   <Shop
//                     products={products}
//                     onSelectProduct={setSelectedProduct}
//                     wishlist={wishlist}
//                     onToggleWishlist={handleToggleWishlist}
//                   />
//                 )}

//                 {currentTab === "about" && <About />}
//                 {currentTab === "terms" && <Terms />}

//                 {currentTab === "cart" && (
//                   <Cart
//                     cartItems={cartItems}
//                     onUpdateQuantity={handleUpdateQuantity}
//                     onRemoveItem={handleRemoveItem}
//                     onProceedToCheckout={handleProceedToCheckout}
//                     onBackToShop={() => handleTabChangeWithReset("shop")}
//                   />
//                 )}

//                 {currentTab === "checkout" && (
//                   <Checkout
//                     cartItems={cartItems}
//                     user={user}
//                     discountAmount={checkoutDiscount}
//                     couponCode={checkoutCoupon}
//                     onOrderPlaced={(order) => {
//                       setCartItems([]);
//                       alert(`Order Placed Successfully! Code: ${order.id}`);
//                       setCurrentTab("dashboard");
//                     }}
//                     onBackToCart={() => setCurrentTab("cart")}
//                   />
//                 )}

//                 {currentTab === "dashboard" && user && (
//                   <CustomerDashboard
//                     user={user}
//                     onLogout={handleLogout}
//                     wishlistProducts={wishlistProducts}
//                     onSelectProduct={setSelectedProduct}
//                   />
//                 )}
//               </>
//             )}
//           </>
//         )}
//       </main>

//       {/* 3. RESPONSIVE FOOTER - Hidden if on Admin Pages */}
//       {!isHoldingAdminTerminal && <Footer onTabChange={handleTabChangeWithReset} />}

//       {/* 4. CLIENT ONLY LOGIN / REGISTER POPUP PANEL */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" id="login-modal-overlay">
//           <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative glass-card">
            
//             <button
//               onClick={() => setShowLoginModal(false)}
//               className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl border border-slate-900 transition-colors cursor-pointer"
//             >
//               <X className="w-4 h-4" />
//             </button>

//             <div className="text-center space-y-2">
//               <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
//                 <Sparkles className="w-6 h-6 animate-pulse" />
//               </div>
//               <h3 className="font-display font-extrabold text-xl text-white">
//                 {registerMode ? "Create Client Account" : "Customer Portal Access"}
//               </h3>
//               <p className="text-xs text-gray-400">
//                 {registerMode ? "Create your account to order print bundles." : "Enter your design panel credentials."}
//               </p>
//             </div>

//             <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
//               {registerMode && (
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       required
//                       value={registerName}
//                       onChange={(e) => setRegisterName(e.target.value)}
//                       placeholder="E.g., David Miller"
//                       className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                     />
//                     <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     required
//                     value={loginEmail}
//                     onChange={(e) => setLoginEmail(e.target.value)}
//                     placeholder="customer@example.com"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     required
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     placeholder="••••••••"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
//               >
//                 {registerMode ? "Sign Up" : "Log In"}
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </form>

//             <div className="text-center pt-2 border-t border-slate-900">
//               <button
//                 onClick={() => setRegisterMode(!registerMode)}
//                 className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
//               >
//                 {registerMode ? "Already have an account? Sign In" : "New corporate customer? Register Here"}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

























// import React, { useState, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Services from "./pages/Services";
// import Portfolio from "./pages/Portfolio";
// import Shop from "./pages/Shop";
// import ProductDetail from "./pages/ProductDetail";
// import Cart from "./pages/Cart";
// import Checkout from "./pages/Checkout";
// import CustomerDashboard from "./pages/CustomerDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import Terms from "./pages/Terms";
// import { ArrowRight, Mail, Lock, User as UserIcon, Sparkles, X, Eye, EyeOff } from "lucide-react";

// export default function App() {
//   // Sync router paths based on current URL parameters for clean standalone screens
//   const getInitialTabFromUrl = () => {
//     const path = window.location.pathname;
//     if (path === "/admin/login") return "admin-login";
//     if (path === "/admin/dashboard") return "admin";
//     return "home";
//   };

//   const [currentTab, setCurrentTab] = useState(getInitialTabFromUrl);
//   const [products, setProducts] = useState([]);
//   const [portfolio, setPortfolio] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // User state (Only for Customers on main site)
//   const [user, setUser] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [registerMode, setRegisterMode] = useState(false);
//   const [registerName, setRegisterName] = useState("");

//   // Standalone Admin Form State
//   const [adminEmail, setAdminEmail] = useState("");
//   const [adminPassword, setAdminPassword] = useState("");
//   const [showAdminPassword, setShowAdminPassword] = useState(false);
//   const [adminError, setAdminError] = useState("");

//   // Wishlist and Cart
//   const [wishlist, setWishlist] = useState([]);
//   const [cartItems, setCartItems] = useState([]);

//   // Checkout params
//   const [checkoutDiscount, setCheckoutDiscount] = useState(0);
//   const [checkoutCoupon, setCheckoutCoupon] = useState(null);

//   // Handle browser URL synchronization without massive dependencies
//   useEffect(() => {
//     const handleLocationChange = () => {
//       const path = window.location.pathname;
//       if (path === "/admin/login") {
//         setCurrentTab("admin-login");
//       } else if (path === "/admin/dashboard") {
//         const isAdmin = localStorage.getItem("wao_admin_logged_in") === "true";
//         if (isAdmin) {
//           setCurrentTab("admin");
//         } else {
//           window.history.pushState({}, "", "/admin/login");
//           setCurrentTab("admin-login");
//         }
//       } else {
//         setSelectedProduct(null);
//       }
//     };

//     window.addEventListener("popstate", handleLocationChange);
//     return () => window.removeEventListener("popstate", handleLocationChange);
//   }, []);

//   // Sync products and portfolio on mount
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const prodRes = await fetch("/api/products");
//         if (prodRes.ok) setProducts(await prodRes.json());

//         const portRes = await fetch("/api/portfolio");
//         if (portRes.ok) setPortfolio(await portRes.json());
//       } catch (err) {
//         console.error("Failed to load catalog datasets:", err);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   // Handle Standalone Admin Login Action
//   const handleAdminLoginSubmit = (e) => {
//     e.preventDefault();
//     setAdminError("");

//     if (adminEmail.trim() === "admin@waoprints.com" && adminPassword === "admin123") {
//       localStorage.setItem("wao_admin_logged_in", "true");
//       window.history.pushState({}, "", "/admin/dashboard");
//       setCurrentTab("admin");
//     } else {
//       setAdminError("Invalid Admin Email or Security Password.");
//     }
//   };

//   const handleAdminLogout = () => {
//     localStorage.removeItem("wao_admin_logged_in");
//     window.history.pushState({}, "", "/");
//     setCurrentTab("home");
//   };

//   // Handle Dynamic Wishlist Toggle
//   const handleToggleWishlist = (id) => {
//     if (wishlist.includes(id)) {
//       setWishlist(wishlist.filter(item => item !== id));
//     } else {
//       setWishlist([...wishlist, id]);
//     }
//   };

//   // Add Item to Shopping Cart
//   const handleAddToCart = (item) => {
//     setCartItems([...cartItems, item]);
//   };

//   const handleUpdateQuantity = (idx, newQty) => {
//     setCartItems(cartItems.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
//   };

//   const handleRemoveItem = (idx) => {
//     setCartItems(cartItems.filter((_, i) => i !== idx));
//   };

//   const handleProceedToCheckout = (discount, coupon) => {
//     setCheckoutDiscount(discount);
//     setCheckoutCoupon(coupon);
    
//     if (!user) {
//       setShowLoginModal(true);
//     } else {
//       setCurrentTab("checkout");
//     }
//   };

//   // User/Customer Login Request ONLY (Removes Admin Bypass from frontend modal)
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = registerMode ? "/api/auth/register" : "/api/auth/login";
//       const payload = registerMode 
//         ? { email: loginEmail, password: loginPassword, name: registerName }
//         : { email: loginEmail, password: loginPassword };

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (res.ok) {
//         const loggedUser = await res.json();
        
//         // Block Admin Roles from logging in through client panel interface
//         if (loggedUser.role === "Admin" || loginEmail === "admin@waoprints.com") {
//           alert("Unauthorized access. Admin profiles must authenticate through terminal interface.");
//           return;
//         }

//         setUser(loggedUser);
//         setShowLoginModal(false);
//         setLoginEmail("");
//         setLoginPassword("");
//         setRegisterName("");
        
//         if (cartItems.length > 0 && currentTab === "cart") {
//           setCurrentTab("checkout");
//         } else {
//           setCurrentTab("dashboard");
//         }
//       } else {
//         const errData = await res.json();
//         alert(errData.message || "Authentication credentials failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error communicating with central authentication authority.");
//     }
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setCurrentTab("home");
//   };

//   const handleTabChangeWithReset = (tab) => {
//     if (tab === "login") {
//       setShowLoginModal(true);
//     } else {
//       // Clear paths if navigating away to standard tabs
//       if (window.location.pathname.startsWith("/admin")) {
//         window.history.pushState({}, "", "/");
//       }
//       setSelectedProduct(null);
//       setCurrentTab(tab);
//     }
//   };

//   const wishlistProducts = products.filter(p => wishlist.includes(p.id));
//   const isHoldingAdminTerminal = currentTab === "admin-login" || currentTab === "admin";

//   return (
//     <div className="bg-[#03060d] min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative pb-10">
      
//       {/* 1. FLOATING NAVIGATION BAR - Hidden if on Admin Pages */}
//       {!isHoldingAdminTerminal && (
//         <Navbar
//           currentTab={currentTab === "checkout" ? "shop" : currentTab}
//           onTabChange={handleTabChangeWithReset}
//           cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
//           wishlistCount={wishlist.length}
//           user={user}
//           onLogout={handleLogout}
//         />
//       )}

//       {/* 2. ROUTED VIEWS SWITCH */}
//       <main className="min-h-[80vh]">
        
//         {/* STANDALONE ADMIN LOGIN PAGE (waoprinter.com/admin/login) */}
//         {currentTab === "admin-login" && (
//           <div className="min-h-[90vh] bg-slate-950 flex items-center justify-center p-4 pt-24">
//             <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl">
//               <div className="text-center space-y-1.5">
//                 <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
//                   <Lock className="w-5 h-5" />
//                 </div>
//                 <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
//                 <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
//               </div>

//               <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
//                 {adminError && (
//                   <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
//                     {adminError}
//                   </div>
//                 )}

//                 <div className="space-y-1">
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</label>
//                   <input
//                     type="email"
//                     required
//                     value={adminEmail}
//                     onChange={(e) => setAdminEmail(e.target.value)}
//                     placeholder="admin@waoprints.com"
//                     className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-white outline-none"
//                   />
//                 </div>

//                 <div className="space-y-1 relative">
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
//                   <div className="relative">
//                     <input
//                       type={showAdminPassword ? "text" : "password"}
//                       required
//                       value={adminPassword}
//                       onChange={(e) => setAdminPassword(e.target.value)}
//                       placeholder="••••••••"
//                       className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-white outline-none"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowAdminPassword(!showAdminPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
//                     >
//                       {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] cursor-pointer"
//                 >
//                   Connect Security Portal →
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* STANDALONE ADMIN DASHBOARD TRACK */}
//         {currentTab === "admin" && (
//           <AdminDashboard onLogout={handleAdminLogout} />
//         )}

//         {/* REGULAR WEBSITE INTERFACES */}
//         {!isHoldingAdminTerminal && (
//           <>
//             {selectedProduct ? (
//               <ProductDetail
//                 product={selectedProduct}
//                 onBack={() => setSelectedProduct(null)}
//                 onAddToCart={handleAddToCart}
//                 wishlist={wishlist}
//                 onToggleWishlist={handleToggleWishlist}
//               />
//             ) : (
//               <>
//                 {currentTab === "home" && (
//                   <Home
//                     featuredProducts={products}
//                     portfolioProjects={portfolio}
//                     onTabChange={handleTabChangeWithReset}
//                     onSelectProduct={setSelectedProduct}
//                   />
//                 )}

//                 {currentTab === "services" && <Services />}
//                 {currentTab === "portfolio" && <Portfolio />}

//                 {currentTab === "shop" && (
//                   <Shop
//                     products={products}
//                     onSelectProduct={setSelectedProduct}
//                     wishlist={wishlist}
//                     onToggleWishlist={handleToggleWishlist}
//                   />
//                 )}

//                 {currentTab === "about" && <About />}
//                 {currentTab === "track-order" && <TrackOrder />}
//                 {currentTab === "terms" && <Terms />}

//                 {currentTab === "cart" && (
//                   <Cart
//                     cartItems={cartItems}
//                     onUpdateQuantity={handleUpdateQuantity}
//                     onRemoveItem={handleRemoveItem}
//                     onProceedToCheckout={handleProceedToCheckout}
//                     onBackToShop={() => handleTabChangeWithReset("shop")}
//                   />
//                 )}

//                 {currentTab === "checkout" && (
//                   <Checkout
//                     cartItems={cartItems}
//                     user={user}
//                     discountAmount={checkoutDiscount}
//                     couponCode={checkoutCoupon}
//                     onOrderPlaced={(order) => {
//                       setCartItems([]);
//                       alert(`Order Placed Successfully! Code: ${order.id}`);
//                       setCurrentTab("dashboard");
//                     }}
//                     onBackToCart={() => setCurrentTab("cart")}
//                   />
//                 )}

//                 {currentTab === "dashboard" && user && (
//                   <CustomerDashboard
//                     user={user}
//                     onLogout={handleLogout}
//                     wishlistProducts={wishlistProducts}
//                     onSelectProduct={setSelectedProduct}
//                   />
//                 )}
//               </>
//             )}
//           </>
//         )}
//       </main>

//       {/* 3. RESPONSIVE FOOTER - Hidden if on Admin Pages */}
//       {!isHoldingAdminTerminal && <Footer onTabChange={handleTabChangeWithReset} />}

//       {/* 4. CLIENT ONLY LOGIN / REGISTER POPUP PANEL */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" id="login-modal-overlay">
//           <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative glass-card">
            
//             <button
//               onClick={() => setShowLoginModal(false)}
//               className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl border border-slate-900 transition-colors cursor-pointer"
//             >
//               <X className="w-4 h-4" />
//             </button>

//             <div className="text-center space-y-2">
//               <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
//                 <Sparkles className="w-6 h-6 animate-pulse" />
//               </div>
//               <h3 className="font-display font-extrabold text-xl text-white">
//                 {registerMode ? "Create Client Account" : "Customer Portal Access"}
//               </h3>
//               <p className="text-xs text-gray-400">
//                 {registerMode ? "Create your account to order print bundles." : "Enter your design panel credentials."}
//               </p>
//             </div>

//             <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
//               {registerMode && (
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       required
//                       value={registerName}
//                       onChange={(e) => setRegisterName(e.target.value)}
//                       placeholder="E.g., David Miller"
//                       className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                     />
//                     <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     required
//                     value={loginEmail}
//                     onChange={(e) => setLoginEmail(e.target.value)}
//                     placeholder="customer@example.com"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     required
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     placeholder="••••••••"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
//               >
//                 {registerMode ? "Sign Up" : "Log In"}
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </form>

//             <div className="text-center pt-2 border-t border-slate-900">
//               <button
//                 onClick={() => setRegisterMode(!registerMode)}
//                 className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
//               >
//                 {registerMode ? "Already have an account? Sign In" : "New corporate customer? Register Here"}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }




















// import React, { useState, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Services from "./pages/Services";
// import Portfolio from "./pages/Portfolio";
// import Shop from "./pages/Shop";
// import ProductDetail from "./pages/ProductDetail";
// import Cart from "./pages/Cart";
// import Checkout from "./pages/Checkout";
// import TrackOrder from "./pages/TrackOrder";
// import CustomerDashboard from "./pages/CustomerDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import Terms from "./pages/Terms";
// import { ArrowRight, Mail, Lock, User as UserIcon, Sparkles, X } from "lucide-react";

// export default function App() {
//   const [currentTab, setCurrentTab] = useState("home");
//   const [products, setProducts] = useState([]);
//   const [portfolio, setPortfolio] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // User state
//   const [user, setUser] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [registerMode, setRegisterMode] = useState(false);
//   const [registerName, setRegisterName] = useState("");

//   // Wishlist and Cart
//   const [wishlist, setWishlist] = useState([]);
//   const [cartItems, setCartItems] = useState([]);

//   // Checkout params
//   const [checkoutDiscount, setCheckoutDiscount] = useState(0);
//   const [checkoutCoupon, setCheckoutCoupon] = useState(null);

//   // Sync products and portfolio on mount
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const prodRes = await fetch("/api/products");
//         if (prodRes.ok) setProducts(await prodRes.json());

//         const portRes = await fetch("/api/portfolio");
//         if (portRes.ok) setPortfolio(await portRes.json());
//       } catch (err) {
//         console.error("Failed to load catalog datasets:", err);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   // Handle Dynamic Wishlist Toggle
//   const handleToggleWishlist = (id) => {
//     if (wishlist.includes(id)) {
//       setWishlist(wishlist.filter(item => item !== id));
//     } else {
//       setWishlist([...wishlist, id]);
//     }
//   };

//   // Add Item to Shopping Cart
//   const handleAddToCart = (item) => {
//     setCartItems([...cartItems, item]);
//   };

//   const handleUpdateQuantity = (idx, newQty) => {
//     setCartItems(cartItems.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
//   };

//   const handleRemoveItem = (idx) => {
//     setCartItems(cartItems.filter((_, i) => i !== idx));
//   };

//   const handleProceedToCheckout = (discount, coupon) => {
//     setCheckoutDiscount(discount);
//     setCheckoutCoupon(coupon);
    
//     if (!user) {
//       // Force user login/registration before payment
//       setShowLoginModal(true);
//     } else {
//       setCurrentTab("checkout");
//     }
//   };

//   // User Login Request
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = registerMode ? "/api/auth/register" : "/api/auth/login";
//       const payload = registerMode 
//         ? { email: loginEmail, password: loginPassword, name: registerName }
//         : { email: loginEmail, password: loginPassword };

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (res.ok) {
//         const loggedUser = await res.json();
//         setUser(loggedUser);
//         setShowLoginModal(false);
//         setLoginEmail("");
//         setLoginPassword("");
//         setRegisterName("");
        
//         // If checking out, transition immediately
//         if (cartItems.length > 0 && currentTab === "cart") {
//           setCurrentTab("checkout");
//         } else if (loggedUser.role === "Admin") {
//           setCurrentTab("admin");
//         } else {
//           setCurrentTab("dashboard");
//         }
//       } else {
//         const errData = await res.json();
//         alert(errData.message || "Authentication credentials failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error communicating with central authentication authority.");
//     }
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setCurrentTab("home");
//   };

//   const handleTabChangeWithReset = (tab) => {
//     if (tab === "login") {
//       setShowLoginModal(true);
//     } else {
//       setSelectedProduct(null);
//       setCurrentTab(tab);
//     }
//   };

//   // Map wishlist strings to actual product items
//   const wishlistProducts = products.filter(p => wishlist.includes(p.id));

//   return (
//     <div className="bg-[#03060d] min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative pb-10">
      
//       {/* 1. COMPREHENSIVE FLOATING NAVIGATION BAR */}
//       <Navbar
//         currentTab={currentTab === "checkout" ? "shop" : currentTab}
//         onTabChange={handleTabChangeWithReset}
//         cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
//         wishlistCount={wishlist.length}
//         user={user}
//         onLogout={handleLogout}
//       />

//       {/* 2. ROUTED VIEWS SWITCH */}
//       <main className="min-h-[80vh]">
//         {selectedProduct ? (
//           <ProductDetail
//             product={selectedProduct}
//             onBack={() => setSelectedProduct(null)}
//             onAddToCart={handleAddToCart}
//             wishlist={wishlist}
//             onToggleWishlist={handleToggleWishlist}
//           />
//         ) : (
//           <>
//             {currentTab === "home" && (
//               <Home
//                 featuredProducts={products}
//                 portfolioProjects={portfolio}
//                 onTabChange={handleTabChangeWithReset}
//                 onSelectProduct={setSelectedProduct}
//               />
//             )}

//             {currentTab === "services" && <Services />}

//             {currentTab === "portfolio" && <Portfolio />}

//             {currentTab === "shop" && (
//               <Shop
//                 products={products}
//                 onSelectProduct={setSelectedProduct}
//                 wishlist={wishlist}
//                 onToggleWishlist={handleToggleWishlist}
//               />
//             )}

//             {currentTab === "about" && <About />}

//             {currentTab === "track-order" && <TrackOrder />}

//             {currentTab === "terms" && <Terms />}

//             {currentTab === "cart" && (
//               <Cart
//                 cartItems={cartItems}
//                 onUpdateQuantity={handleUpdateQuantity}
//                 onRemoveItem={handleRemoveItem}
//                 onProceedToCheckout={handleProceedToCheckout}
//                 onBackToShop={() => handleTabChangeWithReset("shop")}
//               />
//             )}

//             {currentTab === "checkout" && (
//               <Checkout
//                 cartItems={cartItems}
//                 user={user}
//                 discountAmount={checkoutDiscount}
//                 couponCode={checkoutCoupon}
//                 onOrderPlaced={(order) => {
//                   setCartItems([]);
//                   alert(`Order Placed Successfully! Code: ${order.id}`);
//                   setCurrentTab("dashboard");
//                 }}
//                 onBackToCart={() => setCurrentTab("cart")}
//               />
//             )}

//             {currentTab === "dashboard" && user && (
//               <CustomerDashboard
//                 user={user}
//                 onLogout={handleLogout}
//                 wishlistProducts={wishlistProducts}
//                 onSelectProduct={setSelectedProduct}
//               />
//             )}

//             {currentTab === "admin" && user && user.role === "Admin" && (
//               <AdminDashboard />
//             )}
//           </>
//         )}
//       </main>

//       {/* 3. RESPONSIVE FOOTER DIRECTORY */}
//       <Footer onTabChange={handleTabChangeWithReset} />

//       {/* 4. PREMIUM LOGIN / REGISTER POPUP PANEL */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in" id="login-modal-overlay">
//           <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative glass-card animate-scale-up">
            
//             {/* Close button */}
//             <button
//               onClick={() => setShowLoginModal(false)}
//               className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl border border-slate-900 transition-colors cursor-pointer"
//             >
//               <X className="w-4 h-4" />
//             </button>

//             <div className="text-center space-y-2">
//               <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
//                 <Sparkles className="w-6 h-6 animate-pulse" />
//               </div>
//               <h3 className="font-display font-extrabold text-xl text-white">
//                 {registerMode ? "Create WAO Account" : "Access Brand Portal"}
//               </h3>
//               <p className="text-xs text-gray-400">
//                 {registerMode ? "Initiate VIP corporate credentials in 30 seconds." : "Enter corporate credentials to access active design sheets."}
//               </p>
              
//               {/* Login Help Helpers & Instant Demo Accessees */}
//               {!registerMode && (
//                 <div className="p-3 bg-orange-500/5 text-orange-400 border border-orange-500/10 rounded-2xl space-y-2.5 mt-2 text-left">
//                   <div>
//                     <p className="font-bold uppercase tracking-wider font-mono text-[9px] text-gray-400">Demo Quick Access</p>
//                     <p className="text-[10px] text-gray-500 leading-normal mt-0.5">Click a role below to instantly log in with pre-seeded database telemetry:</p>
//                   </div>
//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         setLoginEmail("admin@waoprints.com");
//                         setLoginPassword("admin123");
//                         try {
//                           const res = await fetch("/api/auth/login", {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({ email: "admin@waoprints.com", password: "admin123" })
//                           });
//                           if (res.ok) {
//                             const resData = await res.json();
//                             setUser(resData.user);
//                             setShowLoginModal(false);
//                             setCurrentTab("admin");
//                           }
//                         } catch (err) {
//                           console.error(err);
//                         }
//                       }}
//                       className="bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/20 font-bold text-[10px] uppercase tracking-wider py-2.5 px-2 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
//                     >
//                       <span>⚡ Login Admin</span>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         setLoginEmail("sarah.j@gmail.com");
//                         setLoginPassword("customer123");
//                         try {
//                           const res = await fetch("/api/auth/login", {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({ email: "sarah.j@gmail.com", password: "customer123" })
//                           });
//                           if (res.ok) {
//                             const resData = await res.json();
//                             setUser(resData.user);
//                             setShowLoginModal(false);
//                             setCurrentTab("dashboard");
//                           }
//                         } catch (err) {
//                           console.error(err);
//                         }
//                       }}
//                       className="bg-slate-800/80 hover:bg-slate-800 text-gray-300 border border-slate-700 font-bold text-[10px] uppercase tracking-wider py-2.5 px-2 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
//                     >
//                       <span>👤 Login Customer</span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
//               {registerMode && (
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Corporate Name</label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       required
//                       value={registerName}
//                       onChange={(e) => setRegisterName(e.target.value)}
//                       placeholder="E.g., David Miller"
//                       className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                     />
//                     <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     required
//                     value={loginEmail}
//                     onChange={(e) => setLoginEmail(e.target.value)}
//                     placeholder="E.g., designer@company.com"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Security Password</label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     required
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     placeholder="••••••••"
//                     className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl py-3 px-4 pl-10 text-white outline-none"
//                   />
//                   <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
//               >
//                 {registerMode ? "Initiate VIP Credentials" : "Connect Security Portal"}
//                 <ArrowRight className="w-4 h-4" />
//               </button>

//             </form>

//             <div className="text-center pt-2 border-t border-slate-900">
//               <button
//                 onClick={() => setRegisterMode(!registerMode)}
//                 className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
//               >
//                 {registerMode ? "Already possess portal credentials? Sign In" : "Need corporate account access? Register Account"}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
