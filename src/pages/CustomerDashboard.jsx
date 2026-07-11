 import React, { useState, useEffect } from "react";
import { ShoppingBag, FileText, X } from "lucide-react";

export default function CustomerDashboard({
  user,
  onLogout
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Safe extraction of User ID handling both string architectures ('id' or '_id')
  const currentUserId = user?.id || user?._id;

  const fetchCustomerData = async () => {
    if (!currentUserId) return; // Prevent raw undefined API calls
    
    try {
      const ordersRes = await fetch(`/api/orders/user/${currentUserId}`);
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData);
      }
    } catch (err) {
      console.error("Failed to load customer data dashboard:", err);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [currentUserId]);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="customer-dashboard">
      
      {/* Title Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">CLIENT WORKSPACE</span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Hello, {user?.name || "Member"}</h1>
          <p className="text-gray-400 text-xs font-mono mt-0.5">Account ID: {currentUserId || "Fetching..."} | Level: VIP Corporate Member</p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs font-bold text-gray-400 hover:text-white px-4 py-2 rounded-xl border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
        >
          Disconnect Account
        </button>
      </div>

      {/* Workspace Menu Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Single Controlled Option */}
        <div className="lg:col-span-3 bg-slate-950/40 border border-slate-900 rounded-3xl p-5">
          <div className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 bg-orange-500/10 text-orange-400 border-l-4 border-orange-500">
            <ShoppingBag className="w-4 h-4" />
            Order Details ({orders.length})
          </div>
        </div>

        {/* Right Side: Order Listings Grid Panel */}
        <div className="lg:col-span-9 bg-slate-950/40 border border-slate-900 p-6 sm:p-8 rounded-3xl min-h-[50vh]">
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-white">Your Plate Stamping Runs</h3>
            
            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 py-10 text-center">You have not submitted any physical print jobs yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id || ord._id}
                    className="bg-[#090d16] border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-slate-800 transition-colors"
                  >
                    <div className="text-center sm:text-left">
                      <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Job {ord.id || ord._id}
                      </span>
                      <h4 className="font-display font-bold text-sm text-white mt-1.5">{ord.items?.length || 0} items configured</h4>
                      <p className="text-[10px] text-gray-500 font-mono">Date Placed: {ord.createdAt}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Active Status</p>
                        <p className="font-bold text-xs text-orange-500 mt-0.5">{ord.status}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-2 bg-slate-950 border border-slate-900 text-gray-400 hover:text-white hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Open Invoice Proof"
                      >
                        <FileText className="w-4.5 h-4.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PRINTABLE HTML INVOICE MODAL PROOF */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-3xl p-6 sm:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-8 relative font-sans shadow-2xl">
            
            {/* Close */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
              <div>
                <span className="font-black text-2xl tracking-tight text-orange-600 font-display">WAO PRINTS</span>
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">Calibrated Litho Presses Inc.</p>
              </div>
              <div className="text-right text-xs">
                <h4 className="font-extrabold text-base text-slate-900 uppercase">OFFICIAL INVOICE</h4>
                <p className="text-slate-500 mt-1">Order Ref: <span className="font-mono font-bold text-slate-900">{selectedOrder.id || selectedOrder._id}</span></p>
                <p className="text-slate-500">Date: {selectedOrder.createdAt}</p>
              </div>
            </div>

            {/* Split billing / shipment addresses */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 font-mono">Billed & Registered to:</p>
                <p className="font-extrabold text-slate-800">{selectedOrder.customerName}</p>
                <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                <p className="text-slate-500 leading-normal">{selectedOrder.billingAddress}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 font-mono">Shipment Courier Routing:</p>
                <p className="font-extrabold text-slate-800">{selectedOrder.customerName}</p>
                <p className="text-slate-500 leading-normal">{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Configured materials summary list */}
            <div className="space-y-4">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">Items configured & pressed</h5>
              
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                    <th className="pb-2">Material Description</th>
                    <th className="pb-2 text-center">Quantity</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((it, idx) => (
                    <tr key={idx} className="border-b border-slate-100 text-slate-700">
                      <td className="py-3 font-semibold text-slate-900">
                        {it.productName}
                        {it.isCustomized && (
                          <span className="block text-[9px] text-orange-600 font-mono font-bold mt-1 uppercase tracking-wider">
                            ★ Custom Canvas Proof Approved
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-3 text-right font-mono">Rs. {it.price?.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono font-extrabold text-slate-900">Rs. {(it.price * it.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations totals bottom block */}
            <div className="text-slate-950 border-t-2 border-slate-100 pt-6 flex justify-between items-start">
              <div className="text-[10px] text-slate-500 space-y-1 max-w-sm">
                <p className="font-bold text-slate-800">Payment Authorization:</p>
                <p>Gateway: <span className="font-semibold text-slate-800">{selectedOrder.paymentMethod} Secure Port</span></p>
                <p>Status: <span className="text-emerald-600 font-bold uppercase">PAID & APPROVED ✓</span></p>
              </div>

              <div className="text-xs space-y-2 text-right w-48 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>Rs. {(selectedOrder.grandTotal + selectedOrder.discountAmount - selectedOrder.shippingCost - selectedOrder.tax).toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-Rs. {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Courier:</span>
                  <span>Rs. {selectedOrder.shippingCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Sales Tax (8%):</span>
                  <span>Rs. {selectedOrder.tax?.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-950 font-sans">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-slate-950">Rs. {selectedOrder.grandTotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Print Hardcopy
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}















// import React, { useState, useEffect } from "react";
// import { UserCheck, ShoppingBag, Heart, MessageSquare, Plus, Send, FileText, X } from "lucide-react";

// export default function CustomerDashboard({
//   user,
//   onLogout,
//   wishlistProducts,
//   onSelectProduct
// }) {
//   const [activeTab, setActiveTab] = useState("orders");
//   const [orders, setOrders] = useState([]);
//   const [tickets, setTickets] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
  
//   // Create ticket states
//   const [newSubject, setNewSubject] = useState("");
//   const [newCategory, setNewCategory] = useState("Order Issue");
//   const [newDesc, setNewDesc] = useState("");
//   const [creatingTicket, setCreatingTicket] = useState(false);

//   // Ticket reply states
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [replyText, setReplyText] = useState("");

//   const fetchCustomerData = async () => {
//     try {
//       const ordersRes = await fetch(`/api/orders/user/${user.id}`);
//       if (ordersRes.ok) {
//         const oData = await ordersRes.json();
//         setOrders(oData);
//       }

//       const ticketsRes = await fetch(`/api/support/tickets/user/${user.id}`);
//       if (ticketsRes.ok) {
//         const tData = await ticketsRes.json();
//         setTickets(tData);
//       }
//     } catch (err) {
//       console.error("Failed to load customer data dashboard:", err);
//     }
//   };

//   useEffect(() => {
//     fetchCustomerData();
//   }, [user.id]);

//   const handleCreateTicket = async (e) => {
//     e.preventDefault();
//     if (!newSubject.trim() || !newDesc.trim()) return;

//     try {
//       const res = await fetch("/api/support/tickets", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user.id,
//           userName: user.name,
//           subject: newSubject,
//           category: newCategory,
//           description: newDesc
//         })
//       });

//       if (res.ok) {
//         const created = await res.json();
//         setTickets([created, ...tickets]);
//         setNewSubject("");
//         setNewDesc("");
//         setCreatingTicket(false);
//         alert("Support ticket initiated successfully.");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSendReply = async (e) => {
//     e.preventDefault();
//     if (!replyText.trim() || !selectedTicket) return;

//     try {
//       const res = await fetch(`/api/support/tickets/${selectedTicket.id}/replies`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sender: "Customer",
//           message: replyText
//         })
//       });

//       if (res.ok) {
//         const updatedTicket = await res.json();
//         setSelectedTicket(updatedTicket);
//         setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
//         setReplyText("");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="customer-dashboard">
      
//       {/* Title Hero */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
//         <div>
//           <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">CLIENT WORKSPACE</span>
//           <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Hello, {user.name}</h1>
//           <p className="text-gray-400 text-xs font-mono mt-0.5">Account ID: {user.id} | Level: VIP Corporate Member</p>
//         </div>
//         <button
//           onClick={onLogout}
//           className="text-xs font-bold text-gray-400 hover:text-white px-4 py-2 rounded-xl border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
//         >
//           Disconnect Account
//         </button>
//       </div>

//       {/* Workspace Menu Tabs */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
//         {/* Left Side: Navigation side control */}
//         <div className="lg:col-span-3 space-y-2 bg-slate-950/40 border border-slate-900 rounded-3xl p-5">
//           <button
//             onClick={() => setActiveTab("orders")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "orders" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <ShoppingBag className="w-4 h-4" />
//             Active Print Jobs ({orders.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("tickets")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "tickets" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <MessageSquare className="w-4 h-4" />
//             Support Helpdesk ({tickets.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("wishlist")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "wishlist" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <Heart className="w-4 h-4" />
//             Saved Catalogs ({wishlistProducts.length})
//           </button>

//           <button
//             onClick={() => setActiveTab("profile")}
//             className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${
//               activeTab === "profile" ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" : "text-gray-400 hover:text-white"
//             }`}
//           >
//             <UserCheck className="w-4 h-4" />
//             Company Profile
//           </button>
//         </div>

//         {/* Right Side: Tab Panels */}
//         <div className="lg:col-span-9 bg-slate-950/40 border border-slate-900 p-6 sm:p-8 rounded-3xl min-h-[50vh]">
          
//           {/* TAB 1: ORDERS LISTING */}
//           {activeTab === "orders" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Your Plate Stamping Runs</h3>
              
//               {orders.length === 0 ? (
//                 <p className="text-xs text-gray-500 py-10 text-center">You have not submitted any physical print jobs yet.</p>
//               ) : (
//                 <div className="space-y-4">
//                   {orders.map((ord) => (
//                     <div
//                       key={ord.id}
//                       className="bg-[#090d16] border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-slate-800 transition-colors"
//                     >
//                       <div className="text-center sm:text-left">
//                         <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
//                           Job {ord.id}
//                         </span>
//                         <h4 className="font-display font-bold text-sm text-white mt-1.5">{ord.items.length} items configured</h4>
//                         <p className="text-[10px] text-gray-500 font-mono">Date Placed: {ord.createdAt}</p>
//                       </div>

//                       <div className="flex items-center gap-4">
//                         <div className="text-right">
//                           <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Active Status</p>
//                           <p className="font-bold text-xs text-orange-500 mt-0.5">{ord.status}</p>
//                         </div>
//                         <button
//                           onClick={() => setSelectedOrder(ord)}
//                           className="p-2 bg-slate-950 border border-slate-900 text-gray-400 hover:text-white hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
//                           title="Open Invoice Proof"
//                         >
//                           <FileText className="w-4.5 h-4.5" />
//                         </button>
//                       </div>

//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* TAB 2: SUPPORT HELPDESK */}
//           {activeTab === "tickets" && (
//             <div className="space-y-6 animate-fade-in">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-display font-bold text-lg text-white">Active Support Conversations</h3>
//                 <button
//                   onClick={() => setCreatingTicket(true)}
//                   className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Initiate Ticket
//                 </button>
//               </div>

//               {tickets.length === 0 ? (
//                 <p className="text-xs text-gray-500 py-10 text-center">No active support conversations loaded.</p>
//               ) : (
//                 <div className="space-y-4">
//                   {tickets.map(tk => (
//                     <div
//                       key={tk.id}
//                       onClick={() => setSelectedTicket(tk)}
//                       className="bg-[#090d16] border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition-colors cursor-pointer flex justify-between items-center"
//                     >
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{tk.category}</span>
//                           <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
//                             tk.status === "Open" ? "bg-emerald-950/20 text-emerald-400" : "bg-slate-900 text-gray-500"
//                           }`}>
//                             {tk.status}
//                           </span>
//                         </div>
//                         <h4 className="font-bold text-sm text-white mt-2">{tk.subject}</h4>
//                         <p className="text-[10px] text-gray-500 mt-1">Updated: {tk.createdAt}</p>
//                       </div>
//                       <span className="text-xs text-orange-500 font-bold hover:underline">Chat Conversation →</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* TAB 3: SAVED CATALOGS (WISHLIST) */}
//           {activeTab === "wishlist" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Your Saved Design Catalog Blanks</h3>
//               {wishlistProducts.length === 0 ? (
//                 <p className="text-xs text-gray-500 py-10 text-center">No items added to your wishlist blanks.</p>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                   {wishlistProducts.map((prod) => (
//                     <div
//                       key={prod.id}
//                       onClick={() => onSelectProduct(prod)}
//                       className="bg-[#090d16] border border-slate-900 p-4 rounded-2xl flex gap-3.5 items-center cursor-pointer hover:border-slate-800 transition-colors"
//                     >
//                       <img src={prod.images[0]} alt="" className="w-14 h-14 object-contain rounded bg-slate-950 p-1" referrerPolicy="no-referrer" />
//                       <div>
//                         <h4 className="font-bold text-xs text-white hover:text-orange-400 transition-colors">{prod.name}</h4>
//                         <p className="text-[10px] text-gray-500 mt-1">${prod.price}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* TAB 4: PROFILE */}
//           {activeTab === "profile" && (
//             <div className="space-y-6 animate-fade-in">
//               <h3 className="font-display font-bold text-lg text-white">Your Registered Corporate Profile</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#090d16] p-6 rounded-2xl border border-slate-900 text-xs">
//                 <div className="space-y-1">
//                   <p className="text-gray-500 uppercase tracking-wider font-mono">Company Officer Name</p>
//                   <p className="text-white font-bold text-sm">{user.name}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-gray-500 uppercase tracking-wider font-mono">Contact Email</p>
//                   <p className="text-white font-bold text-sm">{user.email}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-gray-500 uppercase tracking-wider font-mono">Phone Number</p>
//                   <p className="text-white font-bold text-sm">{user.phone || "Not Configured"}</p>
//                 </div>
//                 <div className="space-y-1 sm:col-span-2">
//                   <p className="text-gray-500 uppercase tracking-wider font-mono">Default Corporate Billing Address</p>
//                   <p className="text-white font-medium leading-relaxed">{user.address || "Not Configured"}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>

//       </div>

//       {/* SUPPORT HELPDESK TIMELINE CHAT DRAWER */}
//       {selectedTicket && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-end">
//           <div className="bg-slate-950 border-l border-slate-900 w-full max-w-lg h-full p-6 flex flex-col justify-between space-y-6 animate-slide-in">
            
//             {/* Header info */}
//             <div>
//               <div className="flex justify-between items-center border-b border-slate-900 pb-4">
//                 <div>
//                   <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-bold uppercase">{selectedTicket.category}</span>
//                   <h3 className="font-display font-bold text-base text-white mt-1">{selectedTicket.subject}</h3>
//                 </div>
//                 <button
//                   onClick={() => setSelectedTicket(null)}
//                   className="p-2 text-gray-500 hover:text-white rounded-xl border border-slate-900"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Original description message */}
//               <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900 mt-4 text-xs text-gray-400 leading-relaxed">
//                 <p className="font-bold text-white uppercase text-[8px] font-mono text-orange-500">Original Request Details:</p>
//                 <p className="mt-1">{selectedTicket.description}</p>
//               </div>
//             </div>

//             {/* Conversation list viewport */}
//             <div className="flex-1 overflow-y-auto space-y-4 py-4 no-scrollbar">
//               {selectedTicket.replies.map((rep, idx) => (
//                 <div
//                   key={idx}
//                   className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs ${
//                     rep.sender === "Customer"
//                       ? "ml-auto bg-orange-600/10 border border-orange-500/20 text-orange-200"
//                       : "mr-auto bg-slate-900 border border-slate-800 text-gray-300"
//                   }`}
//                 >
//                   <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 font-bold mb-1">
//                     {rep.sender === "Customer" ? "You" : "WAO Officer"} • {rep.createdAt}
//                   </span>
//                   <p className="leading-relaxed whitespace-pre-wrap">{rep.message}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Reply sender form */}
//             <form onSubmit={handleSendReply} className="flex gap-2.5 pt-4 border-t border-slate-900">
//               <input
//                 type="text"
//                 required
//                 value={replyText}
//                 onChange={(e) => setReplyText(e.target.value)}
//                 placeholder="Type reply to WAO helpdesk..."
//                 className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-3 text-xs text-white outline-none"
//               />
//               <button
//                 type="submit"
//                 className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl p-3 flex items-center justify-center cursor-pointer transition-colors"
//               >
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>

//           </div>
//         </div>
//       )}

//       {/* PRINTABLE HTML INVOICE MODAL PROOF */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
//           <div className="bg-white text-slate-950 rounded-3xl p-6 sm:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-8 relative font-sans shadow-2xl">
            
//             {/* Close */}
//             <button
//               onClick={() => setSelectedOrder(null)}
//               className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
//             >
//               <X className="w-4.5 h-4.5" />
//             </button>

//             {/* Invoice Header */}
//             <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
//               <div>
//                 <span className="font-black text-2xl tracking-tight text-orange-600 font-display">WAO PRINTS</span>
//                 <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">Calibrated Litho Presses Inc.</p>
//               </div>
//               <div className="text-right text-xs">
//                 <h4 className="font-extrabold text-base text-slate-900 uppercase">OFFICIAL INVOICE</h4>
//                 <p className="text-slate-500 mt-1">Order Ref: <span className="font-mono font-bold text-slate-900">{selectedOrder.id}</span></p>
//                 <p className="text-slate-500">Date: {selectedOrder.createdAt}</p>
//               </div>
//             </div>

//             {/* Split billing / shipment addresses */}
//             <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
//               <div className="space-y-1">
//                 <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 font-mono">Billed & Registered to:</p>
//                 <p className="font-extrabold text-slate-800">{selectedOrder.customerName}</p>
//                 <p className="text-slate-500">{selectedOrder.customerEmail}</p>
//                 <p className="text-slate-500 leading-normal">{selectedOrder.billingAddress}</p>
//               </div>
//               <div className="space-y-1 text-right">
//                 <p className="font-bold uppercase tracking-wider text-[9px] text-slate-400 font-mono">Shipment Courier Routing:</p>
//                 <p className="font-extrabold text-slate-800">{selectedOrder.customerName}</p>
//                 <p className="text-slate-500 leading-normal">{selectedOrder.shippingAddress}</p>
//               </div>
//             </div>

//             {/* Configured materials summary list */}
//             <div className="space-y-4">
//               <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">Items configured & pressed</h5>
              
//               <table className="w-full text-xs text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
//                     <th className="pb-2">Material Description</th>
//                     <th className="pb-2 text-center">Quantity</th>
//                     <th className="pb-2 text-right">Unit Price</th>
//                     <th className="pb-2 text-right">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedOrder.items.map((it, idx) => (
//                     <tr key={idx} className="border-b border-slate-100 text-slate-700">
//                       <td className="py-3 font-semibold text-slate-900">
//                         {it.productName}
//                         {it.isCustomized && (
//                           <span className="block text-[9px] text-orange-600 font-mono font-bold mt-1 uppercase tracking-wider">
//                             ★ Custom Canvas Proof Approved
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 text-center font-mono">{it.quantity}</td>
//                       <td className="py-3 text-right font-mono">${it.price.toFixed(2)}</td>
//                       <td className="py-3 text-right font-mono font-extrabold text-slate-900">${(it.price * it.quantity).toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Calculations totals bottom block */}
//             <div className="border-t-2 border-slate-100 pt-6 flex justify-between items-start">
//               <div className="text-[10px] text-slate-500 space-y-1 max-w-sm">
//                 <p className="font-bold text-slate-800">Payment Authorization:</p>
//                 <p>Gateway: <span className="font-semibold text-slate-800">{selectedOrder.paymentMethod} Secure Port</span></p>
//                 <p>Status: <span className="text-emerald-600 font-bold uppercase">PAID & APPROVED ✓</span></p>
//               </div>

//               <div className="text-xs space-y-2 text-right w-48 font-mono">
//                 <div className="flex justify-between text-slate-500">
//                   <span>Subtotal:</span>
//                   <span>${(selectedOrder.grandTotal + selectedOrder.discountAmount - selectedOrder.shippingCost - selectedOrder.tax).toFixed(2)}</span>
//                 </div>
//                 {selectedOrder.discountAmount > 0 && (
//                   <div className="flex justify-between text-emerald-600 font-bold">
//                     <span>Discount:</span>
//                     <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between text-slate-500">
//                   <span>Courier:</span>
//                   <span>${selectedOrder.shippingCost.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-slate-500">
//                   <span>Sales Tax (8%):</span>
//                   <span>${selectedOrder.tax.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-950 font-sans">
//                   <span>Grand Total:</span>
//                   <span className="font-mono text-base text-slate-950">${selectedOrder.grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Action buttons */}
//             <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
//               <button
//                 onClick={() => window.print()}
//                 className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
//               >
//                 Print Hardcopy
//               </button>
//               <button
//                 onClick={() => setSelectedOrder(null)}
//                 className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
//               >
//                 Done
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* CREATE TICKET MODAL */}
//       {creatingTicket && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-6 glass-card animate-scale-up">
            
//             <div className="flex justify-between items-center border-b border-slate-900 pb-3">
//               <h3 className="font-display font-bold text-lg text-white">Initiate Helpdesk Ticket</h3>
//               <button onClick={() => setCreatingTicket(false)} className="text-gray-500 hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ticket Category</label>
//                 <select
//                   value={newCategory}
//                   onChange={(e) => setNewCategory(e.target.value)}
//                   className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-orange-500/60"
//                 >
//                   <option value="Order Issue">Order Issue / Delay</option>
//                   <option value="Artwork Check">Artwork / Customizer Issue</option>
//                   <option value="Refund Request">Refund / Re-press Claim</option>
//                   <option value="Other">Other Inquiry</option>
//                 </select>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Subject Title</label>
//                 <input
//                   type="text"
//                   required
//                   value={newSubject}
//                   onChange={(e) => setNewSubject(e.target.value)}
//                   placeholder="E.g., High resolution mask review for mug logo"
//                   className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500/60"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Issue Description Details</label>
//                 <textarea
//                   required
//                   value={newDesc}
//                   onChange={(e) => setNewDesc(e.target.value)}
//                   placeholder="Share details so our print officers can inspect the plate matrices..."
//                   className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none h-28 resize-none focus:border-orange-500/60"
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setCreatingTicket(false)}
//                   className="flex-1 bg-slate-900 hover:bg-slate-800 text-gray-400 py-3 rounded-xl border border-slate-800 cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
//                 >
//                   Initiate Ticket
//                 </button>
//               </div>

//             </form>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
