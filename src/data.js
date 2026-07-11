export const SERVICES_LIST = [
  {
    id: "business-cards",
    name: "Business Cards",
    description: "Premium silk-matte, linen, gold foil, and velvet texture business cards that make a lasting impression.",
    icon: "CreditCard",
    gallery: [
      "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "What is the standard business card size?", a: "The standard size is 3.5\" x 2\"." },
      { q: "Can I get gold foil or embossed text?", a: "Yes, our luxury card series supports metallic foils and deep spot UV." }
    ]
  },
  {
    id: "mugs-printing",
    name: "Mugs Printing",
    description: "High-grade ceramic and magic color-changing mugs with premium double-sided dye-sublimation print.",
    icon: "CupSoda",
    gallery: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1572119363153-a57bab81f76d?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "Are the mugs microwave and dishwasher safe?", a: "Yes, our ceramic mugs are tested for up to 1000+ dishwashing cycles without fade." }
    ]
  },
  {
    id: "pen-printing",
    name: "Pen Printing",
    description: "Laser engraved metal pens and custom color plastic pens for high-end corporate branding.",
    icon: "PenTool",
    gallery: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "What is the minimum order quantity?", a: "Our premium metal engraved pens have a low minimum order of 25 units." }
    ]
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    description: "Heavyweight ring-spun cotton t-shirts with vibrant DTG, screen-print, or flock transfer branding.",
    icon: "Shirt",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "What printing technique do you use?", a: "We utilize Direct-To-Garment (DTG) for complex designs, and Screen Printing for bulk cost savings." }
    ]
  },
  {
    id: "caps",
    name: "Caps",
    description: "Embroidered and heat-press vinyl customized baseball caps, trucker hats, and beanies.",
    icon: "Crown",
    gallery: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "What is the embroidery setup fee?", a: "We have a one-time vector digitization setup fee of $15, which is completely waived for bulk orders over 50 units." }
    ]
  },
  {
    id: "sticker-printing",
    name: "Sticker Printing",
    description: "Die-cut, kiss-cut, holographic, matte weatherproof vinyl stickers with dynamic permanent adhesives.",
    icon: "Layers",
    gallery: [
      "https://images.unsplash.com/photo-1572375995501-4b0894dbe7d1?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "Can I print custom silhouettes?", a: "Yes, our high-precision optical cutters cut to the exact outer boundaries of your vector masks automatically." }
    ]
  },
  {
    id: "booklets",
    name: "Luxury Booklets",
    description: "Lay-flat, hardbound, perfect-bind, and saddle-stitched catalogs, annual reports, and lookbooks.",
    icon: "BookOpen",
    gallery: [
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=60"
    ],
    faqs: [
      { q: "What paper weights are available?", a: "We support paper weights from 80gsm lightweight bonds to 400gsm premium luxury boards." }
    ]
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-mug-001",
    name: "Luxury Ceramic WAO Mug",
    description: "Sip in style. Our signature 11oz gloss ceramic mug is triple-coated to make colors burst. Features an ergonomic premium curved handle and dishwasher-safe glaze.",
    price: 18.99,
    discountPrice: 14.99,
    category: "Mugs Printing",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1572119363153-a57bab81f76d?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 250,
    deliveryTime: "2-4 Business Days",
    specifications: {
      "Material": "AAA+ Grade Ceramic",
      "Capacity": "11 oz / 325 ml",
      "Finish": "High Gloss White Coating",
      "Print Area": "8.5\" x 3\" Wrap Around"
    },
    isCustomizable: true,
    reviews: [
      { id: "rev-1", userName: "Marcus Vance", userEmail: "marcus@gmail.com", rating: 5, comment: "Prinsts are incredibly sharp. The glossy finish feels very professional!", createdAt: "2026-06-15" },
      { id: "rev-2", userName: "Sarah Lin", userEmail: "sarah@design.co", rating: 4, comment: "Excellent contrast, color stays rich after several hot wash cycles.", createdAt: "2026-06-20" }
    ],
    featured: true
  },
  {
    id: "prod-card-002",
    name: "Premium Linen Business Cards",
    description: "Woven texture that feels like natural fiber. Double-thick linen cards with dynamic foil-stamped options. Ideal for high-profile creatives and luxury realtors.",
    price: 45.00,
    discountPrice: 38.00,
    category: "Business Cards",
    images: [
      "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 5000,
    deliveryTime: "3-5 Business Days",
    specifications: {
      "Material": "350gsm Italian Linen paper",
      "Quantity": "Box of 250 cards",
      "Texture": "Embossed cross-hatch finish",
      "Options": "Spot UV, Gold Foil edges"
    },
    isCustomizable: true,
    reviews: [
      { id: "rev-3", userName: "Alexandra K.", userEmail: "alex@luxuryhomes.com", rating: 5, comment: "They stand out so much compared to standard paper cards. Clients always comment on the texture.", createdAt: "2026-06-29" }
    ],
    featured: true
  },
  {
    id: "prod-shirt-003",
    name: "Ultra-Heavyweight Boxy Tee",
    description: "Our premium streetwear-cut cotton tee. 240gsm thick-combed cotton provides a solid, luxurious drop that holds dynamic DTG print layouts perfectly.",
    price: 32.00,
    discountPrice: 24.99,
    category: "T-Shirts",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 120,
    deliveryTime: "4-7 Business Days",
    specifications: {
      "Material": "100% Combed Organic Cotton",
      "Weight": "240 gsm / 7.1 oz",
      "Stitching": "Double needle hem, pre-shrunk",
      "Care": "Wash cold inside out"
    },
    isCustomizable: true,
    reviews: [
      { id: "rev-4", userName: "Jordan Ross", userEmail: "jordan@street.co", rating: 5, comment: "Perfect heavyweight drape! The printing has zero plastic feel.", createdAt: "2026-07-01" }
    ],
    featured: true
  },
  {
    id: "prod-pen-004",
    name: "Titan Matte Black Laser Pen",
    description: "An elegant aluminum metal ballpoint pen with rubberized soft-touch barrel. Your logo is laser-etched to a gleaming silver shine. Packed in a modern black presentation tube.",
    price: 4.50,
    category: "Pen Printing",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 2500,
    deliveryTime: "5-8 Business Days",
    specifications: {
      "Material": "Anodized Aerospace Aluminum",
      "Ink Color": "Premium Swiss Gel Black Ink",
      "Engraving": "Dual-sided clean fiber laser",
      "Grip": "Zero-slip comfort coating"
    },
    isCustomizable: true,
    reviews: []
  },
  {
    id: "prod-cap-005",
    name: "Retro Five-Panel Custom Hat",
    description: "Classic structured retro aesthetic cap with high-density stitched embroidery on the front panel. Quick-dry performance nylon with breathable brass grommets.",
    price: 22.00,
    discountPrice: 18.00,
    category: "Caps",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 320,
    deliveryTime: "3-6 Business Days",
    specifications: {
      "Material": "Waterproof Ripstop Nylon",
      "Clasp": "Premium adjustable nylon strap with secure clip",
      "Stripe": "Tonal internal comfort band"
    },
    isCustomizable: true,
    reviews: []
  },
  {
    id: "prod-sticker-006",
    name: "Die-Cut Weatherproof Vinyl Stickers",
    description: "Thick, ultra-rugged vinyl protecting designs from scratches, rain, and solar UV radiation. Die-cut to your custom silhouette for water bottle decals or laptop graphics.",
    price: 0.95,
    category: "Sticker Printing",
    images: [
      "https://images.unsplash.com/photo-1572375995501-4b0894dbe7d1?w=600&auto=format&fit=crop&q=60"
    ],
    stock: 25000,
    deliveryTime: "2-3 Business Days",
    specifications: {
      "Material": "Premium 6mil Waterproof Vinyl",
      "Adhesive": "Removable bubble-free acrylic",
      "Laminate": "Pro Matte anti-glare scratch shield"
    },
    isCustomizable: true,
    reviews: []
  }
];

export const INITIAL_PORTFOLIO = [
  {
    id: "port-1",
    title: "Verve Coffee Roasters Packagings",
    description: "Sleek, textured kraft-paper stand up coffee bags printed with biodegradable soy ink. Custom spot gloss on emblem.",
    category: "Packaging",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60",
    likes: 420,
    shares: 88,
    isFeatured: true
  },
  {
    id: "port-2",
    title: "Solis Tech Summit Merchandise",
    description: "Dynamic neon gradient premium box set containing custom Five-panel hats, laser black gel pens, and custom heavyweight hoodies.",
    category: "Merchandise",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60",
    likes: 310,
    shares: 45,
    isFeatured: true
  },
  {
    id: "port-3",
    title: "Aura Luxury Brand Booklets",
    description: "Linen-hardbound corporate brand guideline portfolios printed with liquid silver foil and heavy 300gsm layflat pages.",
    category: "Branding",
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=60",
    likes: 580,
    shares: 112,
    isFeatured: true
  }
];

export const TESTIMONIALS = [
  {
    quote: "WAO PRINTS transformed our corporate merch. The heavy boxy tees are premium streetwear grade, and our employees refuse to take them off.",
    author: "Elena Rostov",
    role: "Brand Director, Solis Tech",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60"
  },
  {
    quote: "The Mug Customizer is pure magic. Uploading our vectors, resizing, and getting immediate feedback from the built-in Gemini analyzer saved us weeks of email loops.",
    author: "Daveed Mercer",
    role: "Creative Lead, Verve Roasters",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60"
  },
  {
    quote: "Absolute color precision. Our linen cards look spectacular. These are by far the finest business cards we've ever distributed.",
    author: "Julianne Croft",
    role: "Managing Principal, Croft Real Estate",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60"
  }
];

export const FAQS = [
  {
    q: "How does the Live Customizer and Gemini analysis work?",
    a: "When you upload an image, PDF, or logo to our customizer, our real-time 3D canvas rendering generates a preview. Simultaneously, the Google Gemini API analyzes your asset, checks for print safety margins, background cleanliness, color contrast, and suggests high-precision adjustments to guarantee a pristine physical result."
  },
  {
    q: "Can I receive a digital invoice and print physical copies?",
    a: "Absolutely. Every order instantly generates an elegant HTML/PDF invoice downloadable directly from your Customer Dashboard. Admins can also download and print layouts directly."
  },
  {
    q: "What payment systems do you support?",
    a: "We support Stripe (Credit Cards/Apple Pay), secure direct Bank Wire Transfers with reference matching, and standard Cash on Delivery (COD) for selected local regions."
  },
  {
    q: "Do you offer wholesale/bulk pricing for businesses?",
    a: "Yes! In our services page, you can complete our quick Bulk Inquiry Form. Our system routes these inquiries straight to our Admin CRM for rapid custom quotes."
  }
];
