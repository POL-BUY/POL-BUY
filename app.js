
// POL BUY — Catalogue produits
// Firebase + EmailJS

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// CONFIGURATION FIREBASE
  apiKey: "AIzaSyCBpBr4GF24awpeBCHsO3r8kwo_tWHI07A",
  authDomain: "pol-buy.firebaseapp.com",
  projectId: "pol-buy",
  storageBucket: "pol-buy.firebasestorage.app",
  messagingSenderId: "751839715611",
  appId: "1:751839715611:web:0a704117974f2e9c31f3be",
  measurementId: "G-7795QRHNRP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "pol.buy.off@gmail.com";

// EMAILJS
const EMAILJS_SERVICE = "service_u1tqxtl";
const EMAILJS_NEW_ORDER = "template_8eqf2pr";
const EMAILJS_TRACKING = "template_vr7m9e7";
const EMAILJS_PUBLIC_KEY = "x2MvJKVWxwA6DG6Mg";

// CATALOGUE POL BUY
const products = [
  {
    id: "nike-1",
    brand: "Nike",
    name: "AROSWFT - Pantalon de survêtement",
    price: 6.45,
    images: [
      "https://img01.ztat.net/article/spp-media-p1/69d82f5926a146be8b4be90ba840fe2e/09884b8ce44240ec9908a752214e2f36.jpg?imwidth=1800"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-2",
    brand: "Nike",
    name: "Pantalon de running Nike Trail",
    price: 7.35,
    images: [
      "https://media.intersport.fr/is/image/intersportfr/DX0855_0SX_FA?$product_grey$&layer=comp&fit=constrain,0&$produit_xl$&fmt=webp"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-3",
    brand: "Nike",
    name: "Running Nike Division",
    price: 9.56,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-4",
    brand: "Nike",
    name: "Haut zip Nike Running Division",
    price: 4,
    images: [
      "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-5",
    brand: "Nike",
    name: "Ensemble Nike Division",
    price: 11.13,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
      "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-6",
    brand: "Nike",
    name: "Ensemble Nike Division menthe",
    price: 12,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
      "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
      "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
    ],
    colors: ["Noir et menthe"],
    category: "Nike"
  },
  {
    id: "nike-7",
    brand: "Nike",
    name: "Haut zip Nike Running Division menthe",
    price: 6.42,
    images: [
      "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
      "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
    ],
    colors: ["Menthe"],
    category: "Nike"
  },
  {
    id: "nike-8",
    brand: "Nike",
    name: "Pantalon Nike Phenom Elite Tokyo",
    price: 5.35,
    images: [
      "https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp"
    ],
    colors: ["Noir"],
    category: "Nike"
  },
  {
    id: "nike-9",
    brand: "Nike",
    name: "Ensemble Nike Running été",
    price: null,
    images: [
      "https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267",
      "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_rose.png?v=1782133321",
      "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_noir.png?v=1782133367"
    ],
    colors: ["Bleu", "Rose", "Noir"],
    category: "Nike",
    priceToSet: true
  },
  {
    id: "nike-10",
    brand: "Nike",
    name: "Veste Brésil Itaú",
    price: 14.45,
    images: [
      "https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462",
      "https://maillotland.com/cdn/shop/files/IMG-5587.jpg?v=1789297833",
      "https://maillotland.com/cdn/shop/files/Veste_Br_sil_Beige.jpg?v=1788034586",
      "https://maillotland.com/cdn/shop/files/5D7DC9F8-EAEE-41ED-B5F2-ACF023339549.jpg?v=1788030700"
    ],
    colors: ["Noir", "Rose", "Beige", "Vert"],
    category: "Nike"
  },
  {
    id: "cp-1",
    brand: "C.P. Company",
    name: "C.P. Company Pullover",
    price: 6.34,
    images: [
      "https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490",
      "https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490"
    ],
    colors: ["Noir", "Blanc"],
    category: "C.P. Company"
  },
  {
    id: "cp-2",
    brand: "C.P. Company",
    name: "C.P. Company Bonnet en merinos",
    price: 4.86,
    images: [
      "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg"
    ],
    colors: ["Selon disponibilité"],
    category: "C.P. Company"
  },
  {
    id: "stone-1",
    brand: "Stone Island",
    name: "Stone Island - Produit noir et blanc",
    price: null,
    images: [
      "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey",
      "https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey"
    ],
    colors: ["Noir", "Blanc"],
    category: "Stone Island",
    priceToSet: true
  },
  {
    id: "stone-2",
    brand: "Stone Island",
    name: "Stone Island Cotton T-shirt",
    price: null,
    images: [
      "https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg",
      "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey"
    ],
    colors: ["Noir", "Blanc"],
    category: "Stone Island",
    priceToSet: true
  },
  {
    id: "ua-1",
    brand: "Under Armour",
    name: "UA Tech pour fille",
    price: 1.54,
    images: [],
    colors: ["Noir", "Rose"],
    category: "Under Armour"
  },
  {
    id: "ua-2",
    brand: "Under Armour",
    name: "UA Tech 2.0 pour garçon",
    price: 3.46,
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    colors: ["Blanc", "Bleu", "Noir motif orange", "Rose", "Noir sans motif"],
    category: "Under Armour"
  },
  {
    id: "ua-3",
    brand: "Under Armour",
    name: "UA Storm ColdGear Infrared Shield 2.0",
    price: 17.99,
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_BC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    colors: ["Noir"],
    category: "Under Armour"
  }
];

// TAILLES
const adultSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const childSizes = ["S", "M", "L", "XL"];
const shoeSizes = [
  "36", "36.5", "37", "37.5", "38", "38.5",
  "39", "39.5", "40", "40.5", "41", "41.5",
  "42", "42.5", "43"
];

// PANIER LOCAL
let cart = JSON.parse(localStorage.getItem("polbuy_cart") || "[]");

function saveCart() {
  localStorage.setItem("polbuy_cart", JSON.stringify(cart));
}

function addToCart(productId, size, color) {
  const product = products.find(p => p.id === productId);
  if (!product || product.price == null) {
    alert("Prix indisponible pour ce produit.");
    return;
  }

  cart.push({
    productId,
    name: product.name,
    price: product.price,
    size,
    color,
    quantity: 1
  });

  saveCart();
  alert("Produit ajouté au panier !");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// AFFICHAGE DES PRODUITS
function displayProducts(category = "all") {
  const grid = document.querySelector("#product-grid");
  if (!grid) return;

  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category);

  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${
          product.images.length
            ? `<img src="${product.images[0]}" alt="${product.name}" loading="lazy">`
            : `<div class="no-image">Image à ajouter</div>`
        }
      </div>
      <h3>${product.name}</h3>
      <p>${product.price == null ? "Prix à confirmer" : product.price.toFixed(2) + " €"}</p>
      <p>Couleurs : ${product.colors.join(", ")}</p>
      <select class="product-size" aria-label="Taille">
        ${adultSizes.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>
      <select class="product-color" aria-label="Couleur">
        ${product.colors.map(c => `<option value="${c}">${c}</option>`).join("")}
      </select>
      <button data-add="${product.id}" ${product.price == null ? "disabled" : ""}>
        Ajouter au panier
      </button>
    </article>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      addToCart(
        button.dataset.add,
        card.querySelector(".product-size").value,
        card.querySelector(".product-color").value
      );
    });
  });
}

// AFFICHAGE PANIER
function displayCart() {
  const container = document.querySelector("#cart-lines");
  if (!container) return;

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <span>${item.name} — ${item.size} — ${item.color}</span>
      <span>${item.price.toFixed(2)} €</span>
      <button data-remove="${index}">Supprimer</button>
    </div>
  `).join("");

  const total = getCartTotal();
  const shipping = total >= 24.99 ? 0 : 3.99;

  const totalElement = document.querySelector("#cart-total");
  if (totalElement) {
    totalElement.textContent =
      `Total : ${(total + shipping).toFixed(2)} € (livraison ${shipping === 0 ? "offerte" : "3,99 €"})`;
  }

  container.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      removeFromCart(Number(button.dataset.remove));
      displayCart();
    });
  });
}

// CONNEXION EMAIL
async function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

async function logout() {
  await signOut(auth);
}

// COMMANDES
async function createOrder(customerDetails) {
  const user = auth.currentUser;
  if (!user) throw new Error("Connecte-toi avant de commander.");
  if (!cart.length) throw new Error("Ton panier est vide.");

  const subtotal = getCartTotal();
  const shipping = subtotal >= 24.99 ? 0 : 3.99;
  const total = subtotal + shipping;

  const order = {
    userId: user.uid,
    customerEmail: user.email,
    customerName: customerDetails.name || "",
    address: customerDetails.address || "",
    items: cart,
    subtotal,
    shipping,
    total,
    status: "pending_payment_check",
    paymentVerified: false,
    createdAt: serverTimestamp()
  };

  const orderRef = await addDoc(collection(db, "orders"), order);

  // Notification EmailJS
  if (window.emailjs) {
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_NEW_ORDER,
        {
          to_email: ADMIN_EMAIL,
          order_id: orderRef.id,
          customer_name: order.customerName,
          customer_email: user.email,
          items: cart.map(i => `${i.name} x${i.quantity}`).join(", "),
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          status: "Paiement à vérifier"
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Email non envoyé :", error);
    }
  }

  cart = [];
  saveCart();
  return orderRef.id;
}

// COMMANDES CLIENT
async function getMyOrders() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ADMIN : commandes
async function getAllOrders() {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Accès administrateur refusé.");
  }

  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ADMIN : validation manuelle du paiement
async function verifyPayment(orderId) {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Accès administrateur refusé.");
  }

  await updateDoc(doc(db, "orders", orderId), {
    paymentVerified: true,
    status: "paid",
    paymentVerifiedAt: serverTimestamp()
  });
}

// ADMIN : annulation
async function cancelOrder(orderId) {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Accès administrateur refusé.");
  }

  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled",
    cancelledAt: serverTimestamp()
  });
}

// ADMIN : suivi livraison
async function updateTracking(orderId, data) {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Accès administrateur refusé.");
  }

  await updateDoc(doc(db, "orders", orderId), {
    carrier: data.carrier || "",
    trackingNumber: data.trackingNumber || "",
    trackingStatus: data.trackingStatus || "",
    trackingLocation: data.trackingLocation || "",
    estimatedDelivery: data.estimatedDelivery || "",
    status: "shipped"
  });
}

// DEMANDE PRODUIT
async function requestProduct(data) {
  const user = auth.currentUser;

  return addDoc(collection(db, "productRequests"), {
    userId: user ? user.uid : null,
    email: data.email || (user ? user.email : ""),
    brand: data.brand || "",
    name: data.name || "",
    description: data.description || "",
    link: data.link || "",
    createdAt: serverTimestamp()
  });
}

// NOTIFICATIONS CLIENT
async function createNotification(userId, message) {
  return addDoc(collection(db, "notifications"), {
    userId,
    message,
    read: false,
    createdAt: serverTimestamp()
  });
}

async function getMyNotifications() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// INITIALISATION
document.addEventListener("DOMContentLoaded", () => {
  displayProducts();

  const categoryFilter = document.querySelector("#category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", e => {
      displayProducts(e.target.value);
    });
  }

  const cartButton = document.querySelector("#cart-open");
  if (cartButton) {
    cartButton.addEventListener("click", displayCart);
  }

  onAuthStateChanged(auth, user => {
    document.body.dataset.loggedIn = user ? "true" : "false";
  });
});

// FONCTIONS ACCESSIBLES DEPUIS LE HTML
window.POLBUY = {
  products,
  adultSizes,
  childSizes,
  shoeSizes,
  displayProducts,
  displayCart,
  addToCart,
  register,
  login,
  loginGoogle,
  logout,
  createOrder,
  getMyOrders,
  getAllOrders,
  verifyPayment,
  cancelOrder,
  updateTracking,
  requestProduct,
  getMyNotifications
};
