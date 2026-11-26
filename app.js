
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

/* CONFIGURATION */

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
const PAYPAL_BASE = "https://paypal.me/BUYPOL";

const EMAIL_SERVICE_ID = "service_u1tqxtl";
const EMAIL_PUBLIC_KEY = "x2MvJKVWxwA6DG6Mg";
const TEMPLATE_TRACKING = "template_vr7m9e7";
const TEMPLATE_PRODUCT_REQUEST = "template_e3c8luv";

emailjs.init({ publicKey: EMAIL_PUBLIC_KEY });

const SHIPPING_PRICE = 3.99;
const FREE_SHIPPING_FROM = 24.99;

let currentUser = null;
let cart = JSON.parse(localStorage.getItem("polbuy-cart") || "[]");
let activeProduct = null;
let activeImageIndex = 0;
let adminOrdersCache = new Map();

const $ = id => document.getElementById(id);
const money = n => Number(n).toFixed(2).replace(".", ",") + " €";
const isAdmin = () =>
  currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

async function sendEmail(templateId, params) {
  try {
    await emailjs.send(EMAIL_SERVICE_ID, templateId, params);
    return true;
  } catch (error) {
    console.error("Erreur EmailJS :", error);
    return false;
  }
}

/* CATALOGUE
   Ajoute ici les autres fiches produits et leurs photos.
   Une fiche peut contenir plusieurs photos et plusieurs couleurs. */

const products = [
  {
    id: "nike-aroswft",
    brand: "Nike",
    name: "AROSWFT — Pantalon de survêtement",
    price: 6.45,
    color: "Noir",
    images: [
      "https://img01.ztat.net/article/spp-media-p1/69d82f5926a146be8b4be90ba840fe2e/09884b8ce44240ec9908a752214e2f36.jpg?imwidth=1800"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-trail",
    brand: "Nike",
    name: "Pantalon de running Nike Trail",
    price: 7.35,
    color: "Noir",
    images: [
      "https://media.intersport.fr/is/image/intersportfr/DX0855_0SX_FA?$product_grey$&layer=comp&fit=constrain,0&$produit_xl$&fmt=webp"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-division",
    brand: "Nike",
    name: "Running Nike Division",
    price: 9.56,
    color: "Noir",
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-zip",
    brand: "Nike",
    name: "Haut zip Nike Running Division",
    variants: [
      {
        color: "Noir",
        price: 4.00,
        images: [
          "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
          "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
        ]
      },
      {
        color: "Vert menthe / bleu",
        price: 7.83,
        images: [
          "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
          "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-phenom",
    brand: "Nike",
    name: "Pantalon Nike Phenom Elite Tokyo",
    price: 5.35,
    color: "Noir",
    images: [
      "https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "cp-pullover",
    brand: "C.P. Company",
    name: "Pullover",
    variants: [
      {color:"Noir",price:6.34,images:["https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490"]},
      {color:"Blanc",price:6.34,images:["https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490"]}
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "cp-beanie",
    brand: "C.P. Company",
    name: "Bonnet en mérinos",
    price: 4.86,
    color: "Noir",
    images: [
      "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg"
    ],
    sizes: ["Taille unique"]
  },
  {
    id: "stone-pull",
    brand: "Stone Island",
    name: "Stone Island Pull",
    variants: [
      {color:"Noir",price:3.46,images:["https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey"]},
      {color:"Blanc",price:3.46,images:["https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey"]}
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "stone-tee",
    brand: "Stone Island",
    name: "Stone Island Cotton T-shirt",
    variants: [
      {color:"Noir",price:1.46,images:["https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg"]},
      {color:"Blanc",price:1.46,images:["https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey"]}
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "ua-tech-boy",
    brand: "Under Armour",
    name: "UA Tech 2.0 pour garçon",
    price: 3.46,
    color: "Blanc",
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    sizes: ["S","M","L","XL"]
  },
  {
    id: "ua-storm",
    brand: "Under Armour",
    name: "UA Storm ColdGear Infrared Shield 2.0",
    price: 17.99,
    color: "Noir",
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_BC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  }
];

/* BOUTIQUE */

function getVariants(product) {
  return product.variants || [{
    color: product.color || "Unique",
    price: product.price,
    images: product.images
  }];
}

function renderProducts() {
  const grid = $("product-grid");
  if (!grid) return;

  grid.innerHTML = products.map(product => {
    const variant = getVariants(product)[0];
    const image = variant.images[0];

    return `
      <article class="product-card">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}"
          data-product="${escapeHTML(product.id)}">
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.brand)}</p>
        <strong>${money(variant.price)}</strong>
        <button class="primary-btn" data-product="${escapeHTML(product.id)}">
          VOIR LE PRODUIT
        </button>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-product]").forEach(element => {
    element.addEventListener("click", () => openProduct(element.dataset.product));
  });
}

function openProduct(id) {
  activeProduct = products.find(product => product.id === id);
  activeImageIndex = 0;
  if (!activeProduct) return;
  renderProductDetail();
  openOverlay("product-overlay");
}

function renderProductDetail() {
  const product = activeProduct;
  const variants = getVariants(product);
  const variant = variants[0];

  $("product-detail").innerHTML = `
    <h2>${escapeHTML(product.name)}</h2>
    <p>${escapeHTML(product.brand)}</p>
    <img class="product-detail-image" id="detail-image"
      src="${escapeHTML(variant.images[activeImageIndex] || variant.images[0])}"
      alt="${escapeHTML(product.name)}">
    <div class="detail-arrows">
      <button id="previous-image">← Précédente</button>
      <span id="image-position">${activeImageIndex + 1} / ${variant.images.length}</span>
      <button id="next-image">Suivante →</button>
    </div>
    <p><strong id="detail-price">${money(variant.price)}</strong></p>
    <label class="form-label">Couleur</label>
    <select class="form-field" id="detail-color">
      ${variants.map((v,i)=>`<option value="${i}">${escapeHTML(v.color)}</option>`).join("")}
    </select>
    <label class="form-label">Taille</label>
    <select class="form-field" id="detail-size">
      ${(product.sizes || ["Taille unique"]).map(s=>`<option>${escapeHTML(s)}</option>`).join("")}
    </select>
    <button class="primary-btn" id="add-to-cart">AJOUTER AU PANIER</button>
  `;

  $("detail-color").addEventListener("change", () => {
    activeImageIndex = 0;
    updateProductImage();
  });

  $("previous-image").addEventListener("click", () => {
    const images = getVariants(product)[Number($("detail-color").value)].images;
    activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
    updateProductImage();
  });

  $("next-image").addEventListener("click", () => {
    const images = getVariants(product)[Number($("detail-color").value)].images;
    activeImageIndex = (activeImageIndex + 1) % images.length;
    updateProductImage();
  });

  $("add-to-cart").addEventListener("click", addSelectedProductToCart);
}

function updateProductImage() {
  const variant = getVariants(activeProduct)[Number($("detail-color").value)];
  $("detail-image").src = variant.images[activeImageIndex];
  $("detail-price").textContent = money(variant.price);
  $("image-position").textContent = `${activeImageIndex + 1} / ${variant.images.length}`;
}

function addSelectedProductToCart() {
  const product = activeProduct;
  const variant = getVariants(product)[Number($("detail-color").value)];
  const size = $("detail-size").value;
  const key = `${product.id}-${variant.color}-${size}`;

  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      color: variant.color,
      size,
      price: Number(variant.price),
      quantity: 1
    });
  }

  saveCart();
  closeOverlay("product-overlay");
  openOverlay("cart-overlay");
}

/* PANIER */

function cartSubtotal() {
  return cart.reduce((sum,item)=>sum + Number(item.price)*Number(item.quantity),0);
}

function shippingCost() {
  if (!cart.length || cartSubtotal() >= FREE_SHIPPING_FROM) return 0;
  return SHIPPING_PRICE;
}

function cartTotal() {
  return Number((cartSubtotal()+shippingCost()).toFixed(2));
}

function saveCart() {
  localStorage.setItem("polbuy-cart",JSON.stringify(cart));
  $("cart-count").textContent = cart.reduce((sum,item)=>sum+item.quantity,0);
  renderCart();
}

function renderCart() {
  const container = $("cart-items");
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = "<p>Ton panier est vide.</p>";
    $("cart-total").innerHTML = "";
    $("checkout-area").innerHTML = "";
    return;
  }

  container.innerHTML = cart.map(item=>`
    <div class="cart-line">
      <div>
        <strong>${escapeHTML(item.name)}</strong><br>
        <small>${escapeHTML(item.color)} · Taille ${escapeHTML(item.size)} · Qté ${item.quantity}</small><br>
        <strong>${money(item.price*item.quantity)}</strong>
      </div>
      <button class="small-btn" data-remove="${escapeHTML(item.key)}">Retirer</button>
    </div>
  `).join("");

  container.querySelectorAll("[data-remove]").forEach(button=>{
    button.addEventListener("click",()=>{
      cart=cart.filter(item=>item.key!==button.dataset.remove);
      saveCart();
    });
  });

  const subtotal=cartSubtotal();
  const shipping=shippingCost();
  const total=cartTotal();

  $("cart-total").innerHTML=`
    <p>Sous-total : <strong>${money(subtotal)}</strong></p>
    <p>Livraison : <strong>${shipping===0?"Offerte":money(shipping)}</strong></p>
    <h3>TOTAL : ${money(total)}</h3>
  `;

  $("checkout-area").innerHTML=`
    <div class="notice">La commande reste en attente jusqu'à vérification réelle du paiement.</div>
    <label class="form-label">Adresse de livraison</label>
    <textarea id="delivery-address" class="form-field" required placeholder="Nom, rue, code postal, ville, pays"></textarea>
    <label class="form-label">Téléphone (facultatif)</label>
    <input id="delivery-phone" class="form-field">
    <a class="primary-btn" style="display:block;text-align:center;text-decoration:none"
      href="${PAYPAL_BASE}/${total.toFixed(2)}" target="_blank" rel="noopener">
      PAYER ${money(total)} AVEC PAYPAL
    </a>
    <button class="primary-btn" id="place-order">ENREGISTRER MA COMMANDE</button>
  `;

  $("place-order").addEventListener("click",placeOrder);
}

async function placeOrder() {
  if (!currentUser) {
    alert("Connecte-toi avant de commander.");
    openAccount();
    return;
  }

  if (!cart.length) return alert("Ton panier est vide.");

  const address=$("delivery-address").value.trim();
  const phone=$("delivery-phone").value.trim();

  if (!address) return alert("Indique ton adresse de livraison.");

  const subtotal=Number(cartSubtotal().toFixed(2));
  const shipping=Number(shippingCost().toFixed(2));
  const total=Number(cartTotal().toFixed(2));

  const order={
    userId:currentUser.uid,
    customerName:currentUser.displayName || currentUser.email,
    customerEmail:currentUser.email,
    address,phone,
    items:cart.map(item=>({...item})),
    subtotal,shipping,total,
    paymentMethod:"PayPal",
    paymentVerified:false,
    status:"En attente de vérification du paiement",
    carrier:"",
    trackingNumber:"",
    trackingStatus:"",
    trackingLocation:"",
    estimatedDelivery:"",
    createdAt:serverTimestamp()
  };

  try {
    const result=await addDoc(collection(db,"orders"),order);

    const emailSent=await sendEmail(TEMPLATE_NEW_ORDER,{
      to_email:ADMIN_EMAIL,
      order_id:result.id,
      customer_name:order.customerName,
      customer_email:order.customerEmail,
      items:order.items.map(i=>`${i.name} — ${i.color} — ${i.size} × ${i.quantity} — ${money(i.price)}`).join("\n"),
      subtotal:money(subtotal),
      shipping:money(shipping),
      total:money(total),
      status:order.status
    });

    cart=[];
    saveCart();
    closeOverlay("cart-overlay");

    alert(
      "Commande enregistrée : "+result.id+
      "\nTotal : "+money(total)+
      "\nNotification e-mail : "+(emailSent?"envoyée":"non envoyée, vérifie EmailJS")+
      "\nLe paiement reste à vérifier manuellement."
    );

    openAccount();
  } catch(error) {
    console.error(error);
    alert("Erreur lors de l'enregistrement : "+error.message);
  }
}

/* COMPTE CLIENT */

function openAccount() {
  renderAccount();
  openOverlay("account-overlay");
}

$("account-open").addEventListener("click",openAccount);

function renderAccount() {
  const area=$("account-content");

  if (!currentUser) {
    area.innerHTML=`
      <h3>Connexion</h3>
      <label class="form-label">E-mail</label>
      <input id="auth-email" class="form-field" type="email">
      <label class="form-label">Mot de passe</label>
      <input id="auth-password" class="form-field" type="password">
      <button class="primary-btn" id="login-btn">SE CONNECTER</button>
      <button class="primary-btn" id="register-btn">CRÉER UN COMPTE</button>
      <button class="primary-btn" id="google-btn">CONTINUER AVEC GOOGLE</button>
      <div id="auth-error"></div>
    `;

    $("login-btn").addEventListener("click",()=>emailAuth(false));
    $("register-btn").addEventListener("click",()=>emailAuth(true));
    $("google-btn").addEventListener("click",googleLogin);
    return;
  }

  area.innerHTML=`
    <p>Connecté avec : ${escapeHTML(currentUser.email)}</p>
    <h3>Mes commandes</h3>
    <div id="customer-orders">Chargement...</div>
    <button class="primary-btn" id="logout-btn">SE DÉCONNECTER</button>
  `;

  $("logout-btn").addEventListener("click",()=>signOut(auth));
  loadCustomerOrders();
}

async function emailAuth(register) {
  const email=$("auth-email").value.trim();
  const password=$("auth-password").value;

  try {
    if (!email || !password) throw new Error("Complète les champs.");
    if (register) await createUserWithEmailAndPassword(auth,email,password);
    else await signInWithEmailAndPassword(auth,email,password);
  } catch(error) {
    $("auth-error").textContent=error.message;
  }
}

async function googleLogin() {
  try {
    await signInWithPopup(auth,googleProvider);
  } catch(error) {
    $("auth-error").textContent=error.message;
  }
}

async function loadCustomerOrders() {
  if (!currentUser) return;

  const target=$("customer-orders");

  try {
    const q=query(collection(db,"orders"),where("userId","==",currentUser.uid));
    const snap=await getDocs(q);
    target.innerHTML="";

    if (snap.empty) {
      target.textContent="Aucune commande pour le moment.";
      return;
    }

    snap.forEach(orderDoc=>{
      const order=orderDoc.data();
      const div=document.createElement("div");
      div.className="admin-order";
      div.innerHTML=`
        <div>
          <strong>Commande ${escapeHTML(orderDoc.id.slice(0,8))}</strong><br>
          <small>${escapeHTML(order.status)}</small><br>
          <small>Transporteur : ${escapeHTML(order.carrier||"Non renseigné")}</small><br>
          <small>Suivi : ${escapeHTML(order.trackingNumber||"Non renseigné")}</small><br>
          <small>${escapeHTML(order.trackingStatus||"")}</small><br>
          <small>Livraison estimée : ${escapeHTML(order.estimatedDelivery||"Non renseignée")}</small>
        </div>
        <strong>${money(order.total)}</strong>
      `;
      target.appendChild(div);
    });
  } catch(error) {
    console.error(error);
    target.textContent="Impossible de charger les commandes.";
  }
}

/* ADMINISTRATION */

$("admin-open").addEventListener("click",async()=>{
  if (!isAdmin()) return alert("Accès réservé à l'administrateur.");
  openOverlay("admin-overlay");
  await renderAdmin();
});

async function renderAdmin() {
  if (!isAdmin()) return;

  const area=$("admin-content");
  area.innerHTML="<p>Chargement...</p>";

  try {
    const snap=await getDocs(query(collection(db,"orders"),orderBy("createdAt","desc")));
    area.innerHTML="";
    adminOrdersCache.clear();

    if (snap.empty) {
      area.textContent="Aucune commande.";
      return;
    }

    snap.forEach(orderDoc=>{
      const o=orderDoc.data();
      const id=orderDoc.id;
      adminOrdersCache.set(id,o);

      const card=document.createElement("div");
      card.className="admin-order";
      card.style.display="block";

      const statuses=[
        "En attente de vérification du paiement",
        "Payée — paiement vérifié",
        "Préparation","Expédiée","Livrée","Annulée"
      ];

      card.innerHTML=`
        <strong>Commande ${escapeHTML(id)}</strong>
        <p>Client : ${escapeHTML(o.customerName)} — ${escapeHTML(o.customerEmail)}</p>
        <p>Adresse : ${escapeHTML(o.address)}</p>
        <p>Articles : ${(o.items||[]).map(i=>
          `${escapeHTML(i.name)} (${escapeHTML(i.color)}, ${escapeHTML(i.size)}) × ${Number(i.quantity)}`
        ).join("<br>")}</p>
        <p><strong>Total : ${money(o.total)}</strong></p>
        <p>Paiement vérifié : ${o.paymentVerified?"Oui":"Non"}</p>

        <label class="form-label">Statut</label>
        <select class="form-field" id="status-${id}">
          ${statuses.map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
        </select>

        <label class="form-label">Transporteur</label>
        <input class="form-field" id="carrier-${id}" value="${escapeHTML(o.carrier||"")}">

        <label class="form-label">Numéro de suivi</label>
        <input class="form-field" id="tracking-${id}" value="${escapeHTML(o.trackingNumber||"")}">

        <label class="form-label">État du suivi</label>
        <input class="form-field" id="trackstatus-${id}" value="${escapeHTML(o.trackingStatus||"")}">

        <label class="form-label">Localisation</label>
        <input class="form-field" id="location-${id}" value="${escapeHTML(o.trackingLocation||"")}">

        <label class="form-label">Livraison estimée</label>
        <input class="form-field" id="delivery-${id}" value="${escapeHTML(o.estimatedDelivery||"")}">

        <button class="primary-btn" data-save="${id}">ENREGISTRER</button>
      `;

      area.appendChild(card);
    });

    area.querySelectorAll("[data-save]").forEach(button=>{
      button.addEventListener("click",()=>saveOrderChanges(button.dataset.save));
    });
  } catch(error) {
    console.error(error);
    area.textContent="Erreur de chargement : "+error.message;
  }
}

async function saveOrderChanges(id) {
  if (!isAdmin()) return alert("Accès refusé.");

  const oldOrder=adminOrdersCache.get(id);
  const status=$(`status-${id}`).value;

  if (status==="Payée — paiement vérifié" && !oldOrder.paymentVerified) {
    if (!confirm("As-tu réellement vérifié que le paiement est arrivé sur ton compte ?")) return;
  }

  const carrier=$(`carrier-${id}`).value.trim();
  const trackingNumber=$(`tracking-${id}`).value.trim();
  const trackingStatus=$(`trackstatus-${id}`).value.trim();
  const trackingLocation=$(`location-${id}`).value.trim();
  const estimatedDelivery=$(`delivery-${id}`).value.trim();

  try {
    await updateDoc(doc(db,"orders",id),{
      status,
      paymentVerified:status==="Payée — paiement vérifié",
      carrier,trackingNumber,trackingStatus,trackingLocation,
      estimatedDelivery,
      updatedAt:serverTimestamp()
    });

    const trackingChanged =
      trackingNumber !== (oldOrder.trackingNumber||"") ||
      trackingStatus !== (oldOrder.trackingStatus||"") ||
      trackingLocation !== (oldOrder.trackingLocation||"") ||
      estimatedDelivery !== (oldOrder.estimatedDelivery||"") ||
      carrier !== (oldOrder.carrier||"");

    if (trackingChanged && (trackingNumber || trackingStatus)) {
      const sent=await sendEmail(TEMPLATE_TRACKING,{
        to_email:oldOrder.customerEmail,
        customer_name:oldOrder.customerName,
        order_id:id,
        status,
        carrier,
        tracking_number:trackingNumber,
        tracking_status:trackingStatus,
        tracking_location:trackingLocation,
        estimated_delivery:estimatedDelivery
      });

      alert(sent?"Commande enregistrée et e-mail de suivi envoyé.":"Commande enregistrée, mais e-mail non envoyé. Vérifie EmailJS.");
    } else {
      alert("Commande mise à jour.");
    }

    await renderAdmin();
  } catch(error) {
    console.error(error);
    alert("Erreur : "+error.message);
  }
}

/* DEMANDE DE PRODUIT */

$("request-form").addEventListener("submit",async event=>{
  event.preventDefault();

  const form=new FormData(event.currentTarget);

  const request={
    name:String(form.get("name")||"").trim(),
    email:String(form.get("email")||"").trim(),
    brand:String(form.get("brand")||"").trim(),
    product:String(form.get("product")||"").trim(),
    description:String(form.get("description")||"").trim(),
    createdAt:serverTimestamp()
  };

  if (!request.name || !request.email || !request.brand || !request.product) {
    $("request-message").textContent="Complète les champs obligatoires.";
    return;
  }

  try {
    await addDoc(collection(db,"productRequests"),request);

    const sent=await sendEmail(TEMPLATE_PRODUCT_REQUEST,{
      customer_name:request.name,
      customer_email:request.email,
      brand:request.brand,
      product:request.product,
      description:request.description
    });

    $("request-message").innerHTML=`
      <div class="notice">
        Ta demande a été enregistrée.
        ${sent?"L'e-mail a été envoyé à POL BUY.":"L'e-mail n'a pas pu être envoyé. La demande reste enregistrée."}
      </div>
    `;

    event.currentTarget.reset();
  } catch(error) {
    console.error(error);
    $("request-message").textContent="Erreur : "+error.message;
  }
});

/* OUVERTURE DU PANIER ET FERMETURE DES FENÊTRES */

$("cart-open").addEventListener("click",()=>{
  renderCart();
  openOverlay("cart-overlay");
});

function openOverlay(id) {
  $(id)?.classList.add("show");
}

function closeOverlay(id) {
  $(id)?.classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button=>{
  button.addEventListener("click",()=>closeOverlay(button.dataset.close));
});

document.querySelectorAll(".overlay").forEach(overlay=>{
  overlay.addEventListener("click",event=>{
    if (event.target===overlay) overlay.classList.remove("show");
  });
});

/* CONNEXION */

onAuthStateChanged(auth,user=>{
  currentUser=user;

  $("admin-open").classList.toggle("hidden",!isAdmin());

  if ($("account-overlay").classList.contains("show")) {
    renderAccount();
  }
});

/* DÉMARRAGE */

renderProducts();
saveCart();
