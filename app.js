
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

/* CONFIGURATION FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyCBpBr4GF24awpeBCHsO3r8kwo_tWHI07A",
  authDomain: "pol-buy.firebaseapp.com",
  projectId: "pol-buy",
  storageBucket: "pol-buy.firebasestorage.app",
  messagingSenderId: "751839715611",
  appId: "1:751839715611:web:0a704117974f2e9c31f3be",
  measurementId: "G-7795QRHNRP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAIL = "pol.buy.off@gmail.com";
const ADMIN_EMAIL_LOWER = ADMIN_EMAIL.toLowerCase();
const SHIPPING_PRICE = 3.99;
const FREE_SHIPPING_FROM = 24.99;
const PAYPAL_LINK = "https://paypal.me/BUYPOL";

/* CATALOGUE */
const products = [
  {
    id:"nike-aroswft", brand:"Nike", name:"AROSWFT — Pantalon de survêtement",
    price:6.45, category:"Nike", colors:[
      {name:"Noir", price:6.45, images:["https://img01.ztat.net/article/spp-media-p1/69d82f5926a146be8b4be90ba840fe2e/09884b8ce44240ec9908a752214e2f36.jpg?imwidth=1800"]}
    ]
  },
  {
    id:"nike-trail", brand:"Nike", name:"Pantalon de running Nike Trail",
    price:7.35, category:"Nike", colors:[
      {name:"Noir", price:7.35, images:["https://media.intersport.fr/is/image/intersportfr/DX0855_0SX_FA?$product_grey$&layer=comp&fit=constrain,0&$produit_xl$&fmt=webp"]}
    ]
  },
  {
    id:"nike-division-running", brand:"Nike", name:"Running Nike Division",
    price:9.56, category:"Nike", colors:[
      {name:"Noir", price:9.56, images:["https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"]}
    ]
  },
  {
    id:"nike-zip", brand:"Nike", name:"Haut zip Nike Running Division",
    price:4, category:"Nike", colors:[
      {name:"Noir", price:4, images:[
        "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
        "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
      ]},
      {name:"Vert menthe / bleu", price:7.83, images:[
        "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
        "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
      ]}
    ]
  },
  {
    id:"nike-ensemble-division", brand:"Nike", name:"Ensemble Nike Division",
    price:11.35, category:"Nike", colors:[
      {name:"Noir", price:11.35, images:[
        "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
        "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
        "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
      ]},
      {name:"Noir et menthe / bleu", price:13.65, images:[
        "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
        "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
        "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
      ]}
    ]
  },
  {
    id:"nike-phenom", brand:"Nike", name:"Pantalon Nike Phenom Elite Tokyo",
    price:5.35, category:"Nike", colors:[
      {name:"Noir", price:5.35, images:["https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp"]}
    ]
  },
  {
    id:"nike-ete", brand:"Nike", name:"Ensemble Nike Running été — short + t-shirt",
    price:2.56, category:"Nike", colors:[
      {name:"Bleu", price:2.56, images:["https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267"]},
      {name:"Rose", price:2.56, images:["https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_rose.png?v=1782133321"]},
      {name:"Noir", price:2.56, images:["https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_noir.png?v=1782133367"]}
    ]
  },
  {
    id:"bresil-veste", brand:"Nike", name:"Veste Brésil Itaú",
    price:14.45, category:"Nike", colors:[
      {name:"Noir",price:14.45,images:["https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462"]},
      {name:"Rose",price:14.45,images:["https://maillotland.com/cdn/shop/files/IMG-5587.jpg?v=1789297833"]},
      {name:"Beige",price:14.45,images:["https://maillotland.com/cdn/shop/files/Veste_Br_sil_Beige.jpg?v=1788034586"]},
      {name:"Vert",price:14.45,images:["https://maillotland.com/cdn/shop/files/5D7DC9F8-EAEE-41ED-B5F2-ACF023339549.jpg?v=1788030700"]}
    ]
  },
  {
    id:"cp-pullover", brand:"C.P. Company", name:"Pullover",
    price:6.34, category:"C.P. Company", colors:[
      {name:"Noir",price:6.34,images:["https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490"]},
      {name:"Blanc",price:6.34,images:["https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490"]}
    ]
  },
  {
    id:"cp-bonnet", brand:"C.P. Company", name:"Bonnet en mérinos",
    price:4.86, category:"C.P. Company", colors:[
      {name:"Noir",price:4.86,images:["https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg"]}
    ]
  },
  {
    id:"stone-pull", brand:"Stone Island", name:"Stone Island Pull",
    price:3.46, category:"Stone Island", colors:[
      {name:"Noir",price:3.46,images:["https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey"]},
      {name:"Blanc",price:3.46,images:["https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey"]}
    ]
  },
  {
    id:"stone-tshirt", brand:"Stone Island", name:"Stone Island Cotton T-shirt",
    price:1.46, category:"Stone Island", colors:[
      {name:"Noir",price:1.46,images:["https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg"]},
      {name:"Blanc",price:1.46,images:["https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey"]}
    ]
  },
  {
    id:"ua-tech", brand:"Under Armour", name:"UA Tech 2.0 pour garçon",
    price:3.46, category:"Under Armour", colors:[
      {name:"Blanc",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]},
      {name:"Bleu",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]},
      {name:"Noir motif",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]},
      {name:"Orange",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]},
      {name:"Rose",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]},
      {name:"Noir sans motif",price:3.46,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]}
    ]
  },
  {
    id:"ua-storm", brand:"Under Armour", name:"UA Storm ColdGear Infrared Shield 2.0",
    price:17.99, category:"Under Armour", colors:[
      {name:"Noir",price:17.99,images:[
        "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
        "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_BC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
      ]}
    ]
  }
];

const adultSizes = ["XS","S","M","L","XL","XXL","XXXL"];
const childSizes = ["S","M","L","XL"];
const shoeSizes = ["36","36.5","37","37.5","38","38.5","39","39.5","40","40.5","41","41.5","42","42.5","43"];

let currentUser = null;
let currentProduct = null;
let currentColorIndex = 0;
let currentImageIndex = 0;
let selectedSize = "";
let selectedColor = "";
let cart = JSON.parse(localStorage.getItem("polbuy-cart") || "[]");

const $ = id => document.getElementById(id);
const money = n => Number(n).toFixed(2).replace(".", ",") + " €";
const isAdmin = () => currentUser?.email?.toLowerCase() === ADMIN_EMAIL_LOWER;

function openOverlay(id) { $(id).classList.add("show"); }
function closeOverlay(id) { $(id).classList.remove("show"); }

document.querySelectorAll("[data-close]").forEach(btn =>
  btn.addEventListener("click", () => closeOverlay(btn.dataset.close))
);
document.querySelectorAll(".overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.remove("show");
  });
});

/* AFFICHAGE DES PRODUITS */
function renderProducts(category = "Tous") {
  const grid = $("product-grid");
  grid.innerHTML = "";
  products.filter(p => category === "Tous" || p.category === category).forEach(product => {
    const firstColor = product.colors[0];
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img class="product-photo" src="${firstColor.images[0]}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">À partir de ${money(Math.min(...product.colors.map(c => c.price)))}</div>
        <button class="product-open">DÉCOUVRIR</button>
      </div>`;
    card.querySelector("img").addEventListener("click", () => showProduct(product.id));
    card.querySelector("button").addEventListener("click", () => showProduct(product.id));
    grid.appendChild(card);
  });
}

$("category-filter").addEventListener("click", e => {
  const button = e.target.closest("[data-category]");
  if (!button) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.category);
});

/* FICHE PRODUIT */
function showProduct(id) {
  currentProduct = products.find(p => p.id === id);
  currentColorIndex = 0;
  currentImageIndex = 0;
  selectedColor = currentProduct.colors[0].name;
  selectedSize = "";
  renderProductDetail();
  openOverlay("product-overlay");
}

function activeColor() {
  return currentProduct.colors[currentColorIndex];
}

function renderProductDetail() {
  const color = activeColor();
  $("detail-brand").textContent = currentProduct.brand;
  $("detail-name").textContent = currentProduct.name;
  $("detail-price").textContent = money(color.price);
  $("detail-image").src = color.images[currentImageIndex] || color.images[0];

  $("detail-colors").innerHTML = "";
  currentProduct.colors.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "choice" + (i === currentColorIndex ? " selected" : "");
    btn.textContent = c.name;
    btn.addEventListener("click", () => {
      currentColorIndex = i;
      currentImageIndex = 0;
      selectedColor = c.name;
      renderProductDetail();
    });
    $("detail-colors").appendChild(btn);
  });

  const sizes = currentProduct.id.includes("bonnet") ? ["Taille unique"]
    : currentProduct.id.includes("ua-tech") ? childSizes
    : adultSizes;

  $("detail-sizes").innerHTML = "";
  sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.className = "choice" + (selectedSize === size ? " selected" : "");
    btn.textContent = size;
    btn.addEventListener("click", () => {
      selectedSize = size;
      renderProductDetail();
    });
    $("detail-sizes").appendChild(btn);
  });

  $("gallery-prev").style.display = color.images.length > 1 ? "" : "none";
  $("gallery-next").style.display = color.images.length > 1 ? "" : "none";
}

$("gallery-prev").addEventListener("click", () => {
  const images = activeColor().images;
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  renderProductDetail();
});
$("gallery-next").addEventListener("click", () => {
  const images = activeColor().images;
  currentImageIndex = (currentImageIndex + 1) % images.length;
  renderProductDetail();
});

/* PANIER */
function saveCart() {
  localStorage.setItem("polbuy-cart", JSON.stringify(cart));
  $("cart-count").textContent = cart.reduce((n, item) => n + item.quantity, 0);
  renderCart();
}

$("add-to-cart").addEventListener("click", () => {
  if (!selectedSize) {
    alert("Choisis une taille avant d'ajouter l'article au panier.");
    return;
  }
  const color = activeColor();
  const key = `${currentProduct.id}|${color.name}|${selectedSize}`;
  const existing = cart.find(item => item.key === key);
  if (existing) existing.quantity += 1;
  else cart.push({
    key, productId: currentProduct.id, name: currentProduct.name,
    brand: currentProduct.brand, color: color.name, size: selectedSize,
    price: color.price, quantity: 1
  });
  saveCart();
  closeOverlay("product-overlay");
  openOverlay("cart-overlay");
});

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
function shippingCost() {
  return cartSubtotal() >= FREE_SHIPPING_FROM || cart.length === 0 ? 0 : SHIPPING_PRICE;
}
function renderCart() {
  const container = $("cart-items");
  container.innerHTML = "";
  if (!cart.length) {
    container.innerHTML = "<p>Ton panier est vide pour le moment.</p>";
    $("cart-total").innerHTML = "";
    $("checkout-area").innerHTML = "";
    return;
  }
  cart.forEach(item => {
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML = `
      <div><strong>${item.name}</strong><br>
      <small>${item.color} · Taille ${item.size} · Qté ${item.quantity}</small><br>
      <strong>${money(item.price * item.quantity)}</strong></div>
      <button class="small-btn" data-remove="${item.key}">Retirer</button>`;
    container.appendChild(line);
  });
  container.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      cart = cart.filter(item => item.key !== btn.dataset.remove);
      saveCart();
    });
  });
  $("cart-total").innerHTML = `
    <p>Sous-total : <strong>${money(cartSubtotal())}</strong></p>
    <p>Livraison : <strong>${shippingCost() === 0 ? "Offerte" : money(shippingCost())}</strong></p>
    <h3 style="color:#123c2d">Total : ${money(cartSubtotal() + shippingCost())}</h3>`;
  $("checkout-area").innerHTML = `
    <div class="notice">Le paiement est vérifié manuellement par POL BUY. Une commande n'est considérée comme payée qu'après vérification réelle du paiement.</div>
    <label class="form-label">Adresse de livraison</label>
    <input id="delivery-address" class="form-field" placeholder="Nom, rue, code postal, ville, pays" required>
    <label class="form-label">Téléphone (facultatif)</label>
    <input id="delivery-phone" class="form-field" placeholder="Téléphone">
    <a href="${PAYPAL_LINK}" target="_blank" rel="noopener" class="primary-btn" style="display:block;text-align:center;text-decoration:none">OUVRIR PAYPAL</a>
    <button class="primary-btn" id="place-order">CONFIRMER MA COMMANDE</button>`;
  $("place-order").addEventListener("click", placeOrder);
}

/* COMMANDES */
async function placeOrder() {
  if (!currentUser) {
    alert("Connecte-toi à ton compte avant de commander.");
    closeOverlay("cart-overlay");
    openAccount();
    return;
  }
  const address = $("delivery-address").value.trim();
  if (!address) {
    alert("Indique ton adresse de livraison.");
    return;
  }
  const order = {
    userId: currentUser.uid,
    customerName: currentUser.displayName || currentUser.email,
    customerEmail: currentUser.email,
    address,
    phone: $("delivery-phone").value.trim(),
    items: cart,
    subtotal: Number(cartSubtotal().toFixed(2)),
    shipping: Number(shippingCost().toFixed(2)),
    total: Number((cartSubtotal() + shippingCost()).toFixed(2)),
    status: "En attente de vérification du paiement",
    paymentVerified: false,
    carrier: "",
    trackingNumber: "",
    trackingStatus: "",
    trackingLocation: "",
    estimatedDelivery: "",
    createdAt: serverTimestamp()
  };
  try {
    const ref = await addDoc(collection(db, "orders"), order);
    alert("Commande enregistrée. Référence : " + ref.id + ". Le paiement sera vérifié manuellement.");
    cart = [];
    saveCart();
    closeOverlay("cart-overlay");
    openAccount();
  } catch (error) {
    console.error(error);
    alert("Impossible d'enregistrer la commande. Vérifie la configuration Firebase.");
  }
}

/* COMPTE CLIENT */
function openAccount() {
  renderAccount();
  openOverlay("account-overlay");
}
$("account-open").addEventListener("click", openAccount);

function renderAccount() {
  const area = $("account-content");
  if (!currentUser) {
    area.innerHTML = `
      <p>Connecte-toi ou crée ton compte client.</p>
      <label class="form-label">Adresse e-mail</label>
      <input id="auth-email" class="form-field" type="email" placeholder="adresse@email.com">
      <label class="form-label">Mot de passe</label>
      <input id="auth-password" class="form-field" type="password" placeholder="Mot de passe">
      <button class="primary-btn" id="login-btn">SE CONNECTER</button>
      <button class="primary-btn" id="register-btn" style="background:#d7b94b;color:#123c2d">CRÉER UN COMPTE</button>
      <button class="primary-btn" id="google-btn" style="background:#fff;color:#123c2d;border:1px solid #ddd">CONTINUER AVEC GOOGLE</button>
      <div id="auth-error" class="notice hidden"></div>`;
    $("login-btn").addEventListener("click", () => emailAuth(false));
    $("register-btn").addEventListener("click", () => emailAuth(true));
    $("google-btn").addEventListener("click", googleLogin);
    return;
  }

  area.innerHTML = `
    <div class="notice">Connecté avec : ${escapeHTML(currentUser.email || "")}</div>
    <h3>Mes commandes</h3>
    <div id="customer-orders">Chargement...</div>
    <button class="primary-btn" id="logout-btn">SE DÉCONNECTER</button>`;
  $("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    renderAccount();
  });
  loadCustomerOrders();
}

async function emailAuth(register) {
  const email = $("auth-email").value.trim();
  const password = $("auth-password").value;
  try {
    if (!email || !password) throw new Error("Renseigne ton e-mail et ton mot de passe.");
    if (register) await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const box = $("auth-error");
    box.classList.remove("hidden");
    box.textContent = error.message;
  }
}
async function googleLogin() {
  try { await signInWithPopup(auth, googleProvider); }
  catch (error) {
    const box = $("auth-error");
    box.classList.remove("hidden");
    box.textContent = error.message;
  }
}

async function loadCustomerOrders() {
  if (!currentUser) return;
  const target = $("customer-orders");
  try {
    const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
    const snap = await getDocs(q);
    target.innerHTML = "";
    if (snap.empty) {
      target.textContent = "Aucune commande pour le moment.";
      return;
    }
    snap.forEach(d => {
      const o = d.data();
      const div = document.createElement("div");
      div.className = "admin-order";
      div.innerHTML = `
        <div><strong>Commande ${d.id.slice(0,8)}</strong><br>
        <small>${escapeHTML(o.status || "")}</small><br>
        <small>${escapeHTML(o.carrier || "Transporteur non renseigné")} ${escapeHTML(o.trackingNumber || "")}</small>
        <br><small>${escapeHTML(o.trackingStatus || "")} ${escapeHTML(o.trackingLocation || "")}</small>
        <br><small>Livraison estimée : ${escapeHTML(o.estimatedDelivery || "Non renseignée")}</small></div>
        <strong>${money(o.total || 0)}</strong>`;
      target.appendChild(div);
    });
  } catch (error) {
    target.textContent = "Impossible de charger les commandes.";
    console.error(error);
  }
}

/* ADMINISTRATION */
$("admin-open").addEventListener("click", async () => {
  if (!isAdmin()) {
    alert("Accès réservé à l'administrateur.");
    return;
  }
  openOverlay("admin-overlay");
  await renderAdmin();
});

async function renderAdmin() {
  if (!isAdmin()) return;
  const area = $("admin-content");
  area.innerHTML = "<p>Chargement des commandes...</p>";
  try {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    area.innerHTML = "";
    if (snap.empty) {
      area.innerHTML = "<p>Aucune commande pour le moment.</p>";
      return;
    }

    snap.forEach(d => {
      const o = d.data();
      const card = document.createElement("div");
      card.style.cssText = "border:1px solid #e8ebe6;padding:17px;margin:15px 0";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <strong>Commande ${d.id}</strong>
          <span class="admin-tag">${escapeHTML(o.status || "")}</span>
        </div>
        <p><strong>Client :</strong> ${escapeHTML(o.customerName || "")} — ${escapeHTML(o.customerEmail || "")}</p>
        <p><strong>Adresse :</strong> ${escapeHTML(o.address || "")}</p>
        <p><strong>Articles :</strong> ${(o.items || []).map(i =>
          `${escapeHTML(i.name)} (${escapeHTML(i.color)}, ${escapeHTML(i.size)}) × ${i.quantity}`
        ).join("<br>")}</p>
        <p><strong>Total :</strong> ${money(o.total || 0)}</p>
        <label class="form-label">Statut de commande</label>
        <select class="form-field" id="status-${d.id}">
          ${["En attente de vérification du paiement","Payée — paiement vérifié","Préparation","Expédiée","Livrée","Annulée"].map(s =>
            `<option ${o.status === s ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
        <label class="form-label">Transporteur</label>
        <input class="form-field" id="carrier-${d.id}" placeholder="DPD, Colissimo..." value="${escapeHTML(o.carrier || "")}">
        <label class="form-label">Numéro de suivi</label>
        <input class="form-field" id="tracking-${d.id}" value="${escapeHTML(o.trackingNumber || "")}">
        <label class="form-label">État du suivi</label>
        <input class="form-field" id="trackstatus-${d.id}" value="${escapeHTML(o.trackingStatus || "")}">
        <label class="form-label">Localisation du colis</label>
        <input class="form-field" id="location-${d.id}" value="${escapeHTML(o.trackingLocation || "")}">
        <label class="form-label">Livraison estimée</label>
        <input class="form-field" id="delivery-${d.id}" placeholder="Ex. 12/12/2026" value="${escapeHTML(o.estimatedDelivery || "")}">
        <button class="primary-btn" data-save="${d.id}">ENREGISTRER LES MODIFICATIONS</button>`;
      area.appendChild(card);
    });

    area.querySelectorAll("[data-save]").forEach(btn => {
      btn.addEventListener("click", () => saveOrderChanges(btn.dataset.save));
    });
  } catch (error) {
    console.error(error);
    area.innerHTML = "<p>Erreur de chargement. Vérifie les règles Firestore.</p>";
  }
}

async function saveOrderChanges(id) {
  if (!isAdmin()) {
    alert("Accès refusé.");
    return;
  }
  const status = $(`status-${id}`).value;
  const carrier = $(`carrier-${id}`).value.trim();
  const trackingNumber = $(`tracking-${id}`).value.trim();
  const trackingStatus = $(`trackstatus-${id}`).value.trim();
  const trackingLocation = $(`location-${id}`).value.trim();
  const estimatedDelivery = $(`delivery-${id}`).value.trim();

  try {
    await updateDoc(doc(db, "orders", id), {
      status,
      paymentVerified: status === "Payée — paiement vérifié",
      carrier, trackingNumber, trackingStatus, trackingLocation,
      estimatedDelivery,
      updatedAt: serverTimestamp()
    });
    alert("Commande mise à jour.");
    await renderAdmin();
  } catch (error) {
    console.error(error);
    alert("Mise à jour refusée. Vérifie les règles de sécurité Firestore.");
  }
}

/* DEMANDE D'ARTICLE */
$("request-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const request = {
    name: form.get("name"),
    email: form.get("email"),
    brand: form.get("brand"),
    product: form.get("product"),
    description: form.get("description"),
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, "productRequests"), request);
    $("request-message").innerHTML = '<div class="notice">Merci ! Ta demande a bien été envoyée.</div>';
    e.currentTarget.reset();
  } catch (error) {
    console.error(error);
    $("request-message").innerHTML = '<div class="notice">Envoi impossible pour le moment. Réessaie plus tard.</div>';
  }
});

/* SÉCURITÉ D'AFFICHAGE */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}

/* AUTHENTIFICATION */
onAuthStateChanged(auth, user => {
  currentUser = user;
  $("admin-open").classList.toggle("hidden", !isAdmin());
  if ($("account-overlay").classList.contains("show")) renderAccount();
});

$("cart-open").addEventListener("click", () => {
  renderCart();
  openOverlay("cart-overlay");
});

renderProducts();
saveCart();
