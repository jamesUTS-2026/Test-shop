/**
 * ============================================================
 *  NIZA'S LITTLE OVEN — SHOP DATA FILE
 *  ✏️  OWNER: Edit this file to update your shop content.
 *  No coding knowledge needed — just change the values below!
 * ============================================================
 */

const SHOP = {

  // ─── BUSINESS INFO ──────────────────────────────────────────
  name:     "Niza's Little Oven",
  tagline:  "Freshly Baked with Love",
  currency: "₱",
  country:  "Philippines 🇵🇭",

  // ─── CONTACT DETAILS ────────────────────────────────────────
  contact: {
    phone:     "+63 998 225 9279",
    email:     "littleovenn@gmail.com",
    facebook:  "https://www.facebook.com/share/1NjCMN41cH/",
    messenger: "https://www.facebook.com/share/1NjCMN41cH/",
    // messengerPageId: "nizaslittleoven",  // ← uncomment & set your FB page username for direct Messenger deep-link
    messengerPageId: "",
  },

  // ─── HOMEPAGE HOOK TAGS ─────────────────────────────────────
  //  Add or remove tags freely (max 6 looks best)
  hookTags: [
    { icon: "🎨", text: "Custom Designs"      },
    { icon: "🥚", text: "Fresh Ingredients"   },
    { icon: "📦", text: "Made-to-Order"       },
    { icon: "💕", text: "Baked with Love"     },
    { icon: "🎂", text: "Bento Cakes"         },
    { icon: "⭐", text: "5-Star Taste"        },
  ],

  // ─── FILTER CATEGORIES ──────────────────────────────────────
  //  slug must match the "category" field in products below
  categories: [
    { slug: "all",      label: "All 🎉"         },
    { slug: "bento",    label: "Bento Cake 🎁"  },
    { slug: "round",    label: "Round Cake 🎂"   },
    { slug: "cupcake",  label: "Cupcakes 🧁"    },
  ],

  // ─── PRODUCTS ───────────────────────────────────────────────
  //  id        – unique number, don't repeat
  //  name      – product name shown on card
  //  emoji     – big visual icon (or swap with an img URL later)
  //  price     – number only (no ₱ sign)
  //  category  – must match a slug above
  //  desc      – short description on card
  //  badge     – small label top-right ("Bestseller", "New", null to hide)
  products: [
    {
      id: 1,
      name:     "8pcs Cupcake One Bento",
      emoji:    "🎁",
      price:    450,
      category: "bento",
      desc:     "8 gorgeous cupcakes in a stunning bento box — perfect as a gift or celebration treat!",
      badge:    "Bestseller",
    },
    {
      id: 2,
      name:     "Little Big Cake (5×2.5)",
      emoji:    "🎂",
      price:    350,
      category: "round",
      desc:     "A sweet little round cake — just the right size for intimate celebrations and small parties!",
      badge:    "Popular",
    },
    {
      id: 3,
      name:     "Round Cake 6×4",
      emoji:    "🍰",
      price:    800,
      category: "round",
      desc:     "A beautiful 6-inch round cake, 4 layers deep — perfect for birthdays and special occasions!",
      badge:    null,
    },
    {
      id: 4,
      name:     "Round Cake 7×4",
      emoji:    "🌟",
      price:    900,
      category: "round",
      desc:     "Our larger 7-inch round cake — feeds more guests with the same delicious homemade taste!",
      badge:    "Fan Fave",
    },
    {
      id: 5,
      name:     "12pcs Cupcakes Set",
      emoji:    "🧁",
      price:    1200,
      category: "cupcake",
      desc:     "12 beautifully decorated cupcakes — ideal for parties, giveaways, and celebrations!",
      badge:    "Party Fave",
    },
  ],

  // ─── CHECKOUT ADD-ONS ───────────────────────────────────────
  //  Shown on Step 2 of the checkout flow
  addons: [
    { id: "candles", label: "Birthday Candles 🕯️",   price: 50  },
    { id: "topper",  label: "Custom Topper ✨",        price: 100 },
    { id: "card",    label: "Message Card 💌",         price: 50  },
    { id: "box",     label: "Gift Box 🎁",             price: 80  },
    { id: "ribbon",  label: "Satin Ribbon 🎀",         price: 40  },
    { id: "extra",   label: "Extra Decoration 🌸",     price: 150 },
  ],

  // ─── CHATBOT KNOWLEDGE BASE ─────────────────────────────────
  //  The bot uses these to answer questions.
  //  "triggers" are words/phrases it listens for.
  //  "reply"    is what it says back.
  //  "quick"    are quick-reply buttons shown after.
  chatKnowledge: [
    {
      triggers: ["bento", "bento cake"],
      reply:    "🎁 Our Bento Cake is SO popular!\n\n8pcs Cupcake One Bento — ₱450\n\nIncludes 8 beautifully decorated cupcakes in a gift bento box. Great for birthdays, anniversaries, or any sweet celebration!",
      quick:    ["Order Now 🛒", "Round Cakes 🎂", "Prices 💰"],
    },
    {
      triggers: ["round", "round cake", "cake"],
      reply:    "🎂 Our Round Cakes are freshly baked to order:\n\n🎂 Little Big (5×2.5) — ₱350\n🍰 6×4 Round Cake — ₱800\n🌟 7×4 Round Cake — ₱900\n\nAll can be customised with your design!",
      quick:    ["Order Now 🛒", "Bento Cake 🎁", "Prices 💰"],
    },
    {
      triggers: ["cupcake", "cupcakes", "12pcs"],
      reply:    "🧁 Our 12pcs Cupcakes Set is ₱1,200!\n\n12 beautifully decorated cupcakes — perfect for parties, giveaways, and celebrations. Please order at least 3 days in advance!",
      quick:    ["Order Now 🛒", "Bento Cake 🎁", "Prices 💰"],
    },
    {
      triggers: ["price", "prices", "cost", "magkano", "how much"],
      reply:    "💰 Full Price List:\n\n🎁 8pcs Bento Cake — ₱450\n🎂 Little Big (5×2.5) — ₱350\n🍰 6×4 Round Cake — ₱800\n🌟 7×4 Round Cake — ₱900\n🧁 12pcs Cupcakes — ₱1,200\n\nAll in Philippine Peso (₱).",
      quick:    ["Order Now 🛒", "Contact Info 📞"],
    },
    {
      triggers: ["order", "buy", "bili", "checkout"],
      reply:    "Ready to order? 🎉 Browse our Products section, pick your cake and click Checkout! I'll walk you through quantity, add-ons, and how to send your order.",
      quick:    ["View Products 🍰", "Prices 💰"],
    },
    {
      triggers: ["contact", "number", "phone", "call", "email", "facebook", "messenger"],
      reply:    "📞 Reach us anytime!\n\n📱 Phone: +63 998 225 9279\n📧 Email: littleovenn@gmail.com\n📘 Facebook: Niza's Little Oven\n💬 Messenger: via our FB page\n\nWe usually reply within a few hours! 💕",
      quick:    ["Prices 💰", "Order Now 🛒"],
    },
    {
      triggers: ["delivery", "deliver", "ship", "pickup", "pick up"],
      reply:    "📦 We offer both delivery and self-pickup!\n\nJust let us know your preferred option when you checkout. For delivery, please include your full address. For pickup, we'll coordinate a time with you!",
      quick:    ["Order Now 🛒", "Contact Info 📞"],
    },
    {
      triggers: ["custom", "design", "personalise", "personalize"],
      reply:    "🎨 Yes, we do fully custom designs!\n\nJust share your idea, theme, or reference photo when you checkout or message us directly. We love bringing your vision to life!",
      quick:    ["Order Now 🛒", "Prices 💰"],
    },
  ],
};
