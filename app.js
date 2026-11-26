/* =========================================================
   POL BUY — APP.JS COMPLET
   Catalogue + filtres + panier + compte Firebase + commandes.
   Fichier à charger dans index.html avec type="module".
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, updateDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// CONFIGURATION FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCBp4GR4awpeBCHsO3r8kwo_tWHI07A",
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

const OWNER_EMAIL = "pol.buy.off@gmail.com";

const EMAILJS_SERVICE_ID = "service_u1tqxtl";
const EMAILJS_NEW_ORDER_TEMPLATE_ID = "template_8eqf2pr";
const EMAILJS_TRACKING_TEMPLATE_ID = "template_vr7m9e7";
const EMAILJS_PUBLIC_KEY = "x2MvJKVWxwA6DG6Mg";

// CATALOGUE PRODUITS
const STARTER_PRODUCTS = [
  {
    id: "nike-aroswft-pantalon",
    brand: "Nike",
    category: "Nike",
    name: "AROSWFT – Pantalon de survêtement",
    price: 6.45,
    images: [
      "https://img01.ztat.net/article/spp-media-p1/69d82f5926a146be8b4be90ba840fe2e/09884b8ce44240ec9908a752214e2f36.jpg?imwidth=1800"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-trail-running-pants",
    brand: "Nike",
    category: "Nike",
    name: "Pantalon de running Nike Trail",
    price: 7.35,
    images: [
      "https://media.intersport.fr/is/image/intersportfr/DX0855_0SX_FA?$product_grey$&layer=comp&fit=constrain,0&$produit_xl$&fmt=webp"
    ],
    colors: ["Selon photo"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-running-division",
    brand: "Nike",
    category: "Nike",
    name: "Running Division",
    price: 9.56,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-running-division-zip-noir",
    brand: "Nike",
    category: "Nike",
    name: "Haut zippé Nike Running Division",
    price: 4.00,
    images: [
      "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779"
    ],
    colorImages: {
      "Noir": "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "Vert menthe/bleu": "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807"
    },
    colors: ["Noir", "Vert menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-ensemble-division-noir",
    brand: "Nike",
    category: "Nike",
    name: "Ensemble Nike Division",
    price: 11.13,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    colorImages: {
      "Noir": "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "Menthe/bleu": "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807"
    },
    colors: ["Noir", "Menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-ensemble-division-menthe",
    brand: "Nike",
    category: "Nike",
    name: "Ensemble Nike Division – menthe/bleu",
    price: 12.00,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    colors: ["Menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: false
  },
  {
    id: "nike-zip-running-division-menthe",
    brand: "Nike",
    category: "Nike",
    name: "Haut zippé Nike Running Division – menthe/bleu",
    price: 6.42,
    images: [
      "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807"
    ],
    colors: ["Menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: false
  },
  {
    id: "nike-phenom-elite-tokyo",
    brand: "Nike",
    category: "Nike",
    name: "Pantalon Nike Phenom Elite Tokyo",
    price: 5.35,
    images: [
      "https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-ensemble-running-ete",
    brand: "Nike",
    category: "Nike",
    name: "Ensemble Nike Running été – short et t-shirt",
    price: null,
    priceToSet: true,
    images: [
      "https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267"
    ],
    colors: ["Bleu", "Rose", "Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "nike-veste-bresil-itau",
    brand: "Nike",
    category: "Nike",
    name: "Veste Brésil Itaú",
    price: 14.45,
    images: [
      "https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462"
    ],
    colors: ["Noir", "Rose", "Beige", "Vert"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "cp-company-pullover",
    brand: "C.P. Company",
    category: "C.P. Company",
    name: "C.P. Company – Pullover",
    price: 6.34,
    images: [
      "https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "cp-company-bonnet-menorinos",
    brand: "C.P. Company",
    category: "C.P. Company",
    name: "C.P. Company – Bonnet en mérinos",
    price: 4.86,
    images: [
      "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg"
    ],
    colors: ["Selon photo"],
    sizes: ["Taille unique"],
    active: true
  },
  {
    id: "stone-island-article-a-identifier",
    brand: "Stone Island",
    category: "Stone Island",
    name: "Article Stone Island – nom à préciser",
    price: null,
    priceToSet: true,
    images: [
      "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "stone-island-cotton-tshirt",
    brand: "Stone Island",
    category: "Stone Island",
    name: "Stone Island – T-shirt en coton",
    price: null,
    priceToSet: true,
    images: [
      "https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true
  },
  {
    id: "under-armour-ua-tech-fille",
    brand: "Under Armour",
    category: "Under Armour",
    name: "UA Tech – pour fille",
    price: 1.54,
    images: [],
    colors: ["Noir", "Rose"],
    sizes: ["S", "M", "L", "XL"],
    active: true
  },
  {
    id: "under-armour-ua-tech-20-garcon",
    brand: "Under Armour",
    category: "Under Armour",
    name: "UA Tech 2.0 – pour garçon",
    price: 3.46,
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    colors: ["Blanc", "Bleu", "Noir motif orange", "Rose", "Noir sans motif"],
    sizes: ["S", "M", "L", "XL"],
    active: true
  },
  {
    id: "under-armour-storm-coldgear-shield",
    brand: "Under Armour",
    category: "Under Armour",
    name: "UA Storm ColdGear Infrared Shield 2.0",
    price: 17.99,
    images: [
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    colors: ["Noir"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    active: true
  }
];

const euro = value =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value);

const safe = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

const CART_KEY = "polbuy_cart";
const ADDRESS_KEY = "polbuy_saved_addresses";

let currentUser = null;
let activeCategory = "all";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  document.dispatchEvent(
    new CustomEvent("polbuy:cart-updated", { detail: { cart } })
  );
  renderCart();
}

function cartSubtotal() {
  return getCart().reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );
}

function cartShipping() {
  return cartSubtotal() >= 24.99 ? 0 : 3.99;
}

function productCard(product) {
  const image = product.images?.[0] ||
    Object.values(product.colorImages || {})[0];

  return `
    <article class="product-card" data-product-id="${safe(product.id)}">
      <button class="product-photo-button"
        type="button"
        data-open-product="${safe(product.id)}"
        aria-label="Voir ${safe(product.name)}">
        ${image
          ? `<img class="product-image" src="${safe(image)}"
               alt="${safe(product.name)}" loading="lazy">`
          : `<span class="product-image-placeholder">POL BUY</span>`}
      </button>
      <div class="product-info">
        <p class="product-brand">${safe(product.brand)}</p>
        <h3>${safe(product.name)}</h3>
        <p class="product-price">
          ${product.price == null ? "Prix à confirmer" : euro(product.price)}
        </p>
        <button class="add-to-cart" type="button"
          data-open-product="${safe(product.id)}">
          Voir le produit
        </button>
      </div>
    </article>
  `;
}

function ensureShopStyles() {
  if (document.querySelector("#polbuy-shop-style")) return;

  const style = document.createElement("style");
  style.id = "polbuy-shop-style";

  style.textContent = `
    .product-photo-button {
      display:block;width:100%;padding:0;border:0;
      background:#f4f4f4;cursor:pointer;aspect-ratio:4/5;
      overflow:hidden
    }
    .product-photo-button img {
      width:100%;height:100%;object-fit:cover
    }
    .product-image-placeholder {
      display:grid;place-items:center;height:100%;font-weight:bold
    }
    .product-card .product-info {padding:12px}
    .polbuy-overlay {
      position:fixed;inset:0;background:#0009;z-index:100000;
      display:none;align-items:center;justify-content:center;padding:16px
    }
    .polbuy-overlay.open {display:flex}
    .polbuy-dialog {
      background:#fff;color:#111;width:min(560px,100%);
      max-height:92vh;overflow:auto;padding:22px;border-radius:12px;
      position:relative
    }
    .polbuy-dialog img {
      width:100%;max-height:360px;object-fit:contain;background:#f5f5f5
    }
    .polbuy-dialog label {
      display:grid;gap:6px;margin:12px 0
    }
    .polbuy-dialog select,.polbuy-dialog input {
      padding:11px;border:1px solid #bbb;border-radius:6px;
      width:100%;box-sizing:border-box
    }
    .polbuy-dialog button {
      padding:12px 16px;border:0;background:#111;
      color:white;border-radius:6px;cursor:pointer
    }
    .polbuy-dialog .polbuy-close {
      float:right;background:#eee;color:#111
    }
    .polbuy-cart-row {
      display:grid;grid-template-columns:64px 1fr auto;
      gap:10px;align-items:center;padding:10px 0;
      border-bottom:1px solid #ddd
    }
    .polbuy-cart-row img {
      width:64px;height:76px;object-fit:cover
    }
    .polbuy-admin-order {
      border:1px solid #ddd;padding:12px;margin:10px 0;
      border-radius:8px
    }
  `;

  document.head.appendChild(style);
}

function ensureOverlay(id, title) {
  let node = document.getElementById(id);
  if (node) return node;

  node = document.createElement("div");
  node.id = id;
  node.className = "polbuy-overlay";

  node.innerHTML = `
    <section class="polbuy-dialog" role="dialog" aria-modal="true">
      <button class="polbuy-close" type="button"
        data-overlay-close="${id}">Fermer ✕</button>
      <h2>${title}</h2>
      <div class="polbuy-dialog-content"></div>
    </section>
  `;

  document.body.appendChild(node);
  return node;
}

function openProduct(productId) {
  const product = STARTER_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  ensureShopStyles();

  const modal = ensureOverlay(
    "polbuy-product-modal",
    "Détails du produit"
  );

  const host = modal.querySelector(".polbuy-dialog-content");
  const colors = product.colors || ["Non précisée"];
  const sizes = product.sizes || ["Taille unique"];
  const firstColor = colors[0];

  const photo =
    product.colorImages?.[firstColor] ||
    product.images?.[0] ||
    "";

  host.innerHTML = `
    <img id="polbuy-detail-image"
      src="${safe(photo)}" alt="${safe(product.name)}">

    <h3>${safe(product.brand)} — ${safe(product.name)}</h3>

    <p><strong>
      ${product.price == null ? "Prix à confirmer" : euro(product.price)}
    </strong></p>

    <label>Couleur
      <select id="polbuy-detail-color">
        ${colors.map(color =>
          `<option value="${safe(color)}">${safe(color)}</option>`
        ).join("")}
      </select>
    </label>

    <label>Taille
      <select id="polbuy-detail-size">
        ${sizes.map(size =>
          `<option value="${safe(size)}">${safe(size)}</option>`
        ).join("")}
      </select>
    </label>

    <button type="button" id="polbuy-detail-add"
      ${product.price == null ? "disabled" : ""}>
      ${product.price == null ? "Prix à confirmer" : "Ajouter au panier"}
    </button>
  `;

  modal.classList.add("open");

  host.querySelector("#polbuy-detail-color").addEventListener(
    "change",
    event => {
      const src =
        product.colorImages?.[event.target.value] ||
        product.images?.[0] ||
        "";

      const image = host.querySelector("#polbuy-detail-image");
      if (src) image.src = src;
    }
  );

  host.querySelector("#polbuy-detail-add").addEventListener(
    "click",
    () => {
      addProductToCart(
        product,
        host.querySelector("#polbuy-detail-color").value,
        host.querySelector("#polbuy-detail-size").value
      );

      modal.classList.remove("open");
      openCart();
    }
  );
}

function getVisibleProducts() {
  return STARTER_PRODUCTS.filter(product =>
    product.active !== false &&
    (activeCategory === "all" || product.category === activeCategory)
  );
}

function renderProducts() {
  const grid = document.querySelector(
    "#product-grid, #productGrid, [data-product-grid]"
  );

  if (!grid) return;

  grid.innerHTML = getVisibleProducts().map(productCard).join("");
}

async function loadProducts() {
  renderProducts();

  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (!snapshot.empty) {
      const remote = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const byId = new Map(
        STARTER_PRODUCTS.map(p => [p.id, p])
      );

      remote.forEach(product => {
        byId.set(product.id, {
          ...byId.get(product.id),
          ...product
        });
      });

      window.POL_BUY.products = [...byId.values()];
      renderProducts();
    }
  } catch (error) {
    console.warn(
      "Firestore indisponible : affichage du catalogue intégré.",
      error
    );
  }
}

async function importStarterCatalog() {
  try {
    for (const product of STARTER_PRODUCTS) {
      const { id, ...data } = product;

      await setDoc(
        doc(db, "products", id),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    alert("Catalogue importé dans Firestore.");
  } catch (error) {
    console.error(error);
    alert("Import impossible : vérifie les règles Firestore.");
  }
}

function addProductToCart(product, color, size) {
  if (!product || product.price == null) return;

  const cart = getCart();

  const existing = cart.find(item =>
    item.productId === product.id &&
    item.color === color &&
    item.size === size
  );

  if (existing) {
    existing.quantity = Number(existing.quantity || 1) + 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image:
        product.colorImages?.[color] ||
        product.images?.[0] ||
        "",
      color,
      size,
      quantity: 1
    });
  }

  saveCart(cart);
}

function addToCartFromCard(button) {
  const card = button.closest("[data-product-id]");
  const product = STARTER_PRODUCTS.find(
    p => p.id === card?.dataset.productId
  );

  if (product) openProduct(product.id);
}

function renderCart() {
  const cart = getCart();

  const lines = document.querySelector(
    "#cart-lines, #cartItems, [data-cart-lines]"
  );

  const html = cart.length
    ? cart.map((item, index) => `
      <div class="polbuy-cart-row">
        ${item.image
          ? `<img src="${safe(item.image)}" alt="">`
          : ""}
        <div>
          <strong>${safe(item.name)}</strong>
          <p>
            ${safe(item.color)} · ${safe(item.size)}
            · Qté ${item.quantity}
          </p>
          <strong>${euro(item.price * item.quantity)}</strong>
        </div>
        <div>
          <button type="button" data-qty-minus="${index}">−</button>
          <button type="button" data-qty-plus="${index}">+</button>
          <button type="button" data-remove-cart="${index}">
            Supprimer
          </button>
        </div>
      </div>
    `).join("")
    : "<p>Ton panier est vide.</p>";

  if (lines) lines.innerHTML = html;

  const totalText =
    `Sous-total : ${euro(cartSubtotal())} · ` +
    `Livraison : ${cartShipping() === 0
      ? "offerte"
      : euro(cartShipping())} · ` +
    `Total : ${euro(cartSubtotal() + cartShipping())}`;

  const totalNode = document.querySelector(
    "#cart-total, [data-cart-total]"
  );

  if (totalNode) totalNode.textContent = totalText;

  document.querySelectorAll("[data-cart-count]").forEach(node => {
    node.textContent = cart.reduce(
      (sum, item) => sum + Number(item.quantity || 1),
      0
    );
  });

  const modal = document.getElementById("polbuy-cart-modal");

  if (modal?.classList.contains("open")) {
    modal.querySelector(".polbuy-dialog-content").innerHTML = `
      ${html}
      <p><strong>${totalText}</strong></p>

      <button type="button" id="polbuy-open-address">
        Choisir / ajouter une adresse
      </button>

      <p id="polbuy-current-address">
        Adresse enregistrée dans ce navigateur : à sélectionner
      </p>

      <p>Après validation de la commande, effectue le paiement via PayPal :</p>

      <a href="https://paypal.me/BUYPOL"
        target="_blank" rel="noopener">
        Payer avec PayPal
      </a>

      <button type="button" id="polbuy-checkout">
        Valider ma commande
      </button>
    `;
  }
}

function openCart() {
  ensureShopStyles();

  const modal = ensureOverlay("polbuy-cart-modal", "Mon panier");
  modal.classList.add("open");

  renderCart();
}
// COMPTE CLIENT — fenêtre de connexion / inscription
function ensureAccountModal() {
  let modal = document.querySelector(
    "#account-modal, [data-account-modal]"
  );

  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "polbuy-account-modal";

  modal.innerHTML = `
    <div class="polbuy-modal-backdrop" data-close-account></div>

    <section class="polbuy-modal-panel"
      role="dialog" aria-modal="true"
      aria-labelledby="polbuy-account-title">

      <button type="button"
        class="polbuy-modal-close"
        data-close-account aria-label="Fermer">×</button>

      <h2 id="polbuy-account-title">Mon compte POL BUY</h2>

      <div id="polbuy-account-content"></div>
    </section>
  `;

  document.body.appendChild(modal);

  if (!document.querySelector("#polbuy-account-styles")) {
    const style = document.createElement("style");
    style.id = "polbuy-account-styles";

    style.textContent = `
      #polbuy-account-modal {
        position:fixed;inset:0;z-index:99999;
        display:none;align-items:center;justify-content:center;
        padding:18px;font-family:Arial,sans-serif
      }
      #polbuy-account-modal.is-open {display:flex}
      .polbuy-modal-backdrop {
        position:absolute;inset:0;background:#0009
      }
      .polbuy-modal-panel {
        position:relative;background:#fff;color:#111;
        width:min(440px,100%);max-height:90vh;
        overflow:auto;padding:28px;border-radius:12px;
        box-shadow:0 12px 50px #0004
      }
      .polbuy-modal-panel h2 {margin:0 32px 20px 0}
      .polbuy-modal-close {
        position:absolute;right:14px;top:10px;
        border:0;background:none;font-size:30px;cursor:pointer
      }
      .polbuy-account-form {display:grid;gap:12px}
      .polbuy-account-form input {
        box-sizing:border-box;width:100%;padding:12px;
        border:1px solid #bbb;border-radius:6px
      }
      .polbuy-account-form button,.polbuy-account-action {
        padding:12px;background:#111;color:#fff;
        border:0;border-radius:6px;cursor:pointer
      }
      .polbuy-account-form button:disabled {opacity:.5}
      .polbuy-account-switch {
        display:flex;gap:8px;flex-wrap:wrap;margin-top:12px
      }
      .polbuy-account-switch button {
        background:#eee;color:#111
      }
      .polbuy-account-message {
        font-size:14px;min-height:18px;color:#a00
      }
    `;

    document.head.appendChild(style);
  }

  return modal;
}

function showAccountMessage(message, isError = true) {
  const node = document.querySelector("#polbuy-account-message");

  if (node) {
    node.textContent = message;
    node.style.color = isError ? "#b00020" : "#087443";
  }
}

function renderAccountContent(mode = "login") {
  const host = document.querySelector("#polbuy-account-content");
  if (!host) return;

  if (currentUser) {
    host.innerHTML = `
      <p>Connecté avec <strong>${safe(currentUser.email)}</strong></p>

      <div class="polbuy-account-form">
        <button type="button" id="polbuy-my-orders">
          Mes commandes
        </button>

        <button type="button" id="polbuy-logout">
          Se déconnecter
        </button>
      </div>

      <p id="polbuy-account-message"
        class="polbuy-account-message"></p>

      <div id="polbuy-orders-list"></div>
    `;

    return;
  }

  const register = mode === "register";

  host.innerHTML = `
    <form id="polbuy-auth-form" class="polbuy-account-form">

      <h3>${register ? "Créer un compte" : "Connexion"}</h3>

      ${register
        ? `<input name="name" type="text"
             placeholder="Ton prénom et nom"
             autocomplete="name" required>`
        : ""}

      <input name="email" type="email"
        placeholder="Adresse e-mail"
        autocomplete="email" required>

      <input name="password" type="password"
        placeholder="Mot de passe (6 caractères minimum)"
        autocomplete="${register ? "new-password" : "current-password"}"
        minlength="6" required>

      <button type="submit">
        ${register ? "Créer mon compte" : "Me connecter"}
      </button>

      <button type="button" id="polbuy-google-login">
        Continuer avec Google
      </button>
    </form>

    <div class="polbuy-account-switch">
      <button type="button" id="polbuy-show-login">
        Connexion
      </button>

      <button type="button" id="polbuy-show-register">
        Créer un compte
      </button>
    </div>

    <p id="polbuy-account-message"
      class="polbuy-account-message"></p>
  `;
}

function openAccount(mode = "login") {
  const modal = ensureAccountModal();

  modal.classList.add("is-open");
  modal.style.display = "flex";

  renderAccountContent(mode);
}

function closeAccount() {
  const modal = document.querySelector(
    "#polbuy-account-modal, #account-modal, [data-account-modal]"
  );

  if (modal) {
    modal.classList.remove("is-open");

    if (modal.id === "polbuy-account-modal") {
      modal.style.display = "none";
    }
  }
}

async function registerAccount(email, password, name) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (name) {
    await updateProfile(credential.user, {
      displayName: name
    });
  }

  return credential.user;
}

async function loginAccount(email, password) {
  return (
    await signInWithEmailAndPassword(auth, email, password)
  ).user;
}

async function loginWithGoogle() {
  return (
    await signInWithPopup(auth, new GoogleAuthProvider())
  ).user;
}

async function logoutAccount() {
  await signOut(auth);
}

// COMMANDES ET ESPACE CLIENT
async function createOrder(details = {}) {
  if (!auth.currentUser) {
    openAccount("login");
    throw new Error("Connecte-toi pour passer commande.");
  }

  const cart = getCart();

  if (!cart.length) {
    throw new Error("Le panier est vide.");
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 24.99 ? 0 : 3.99;

  const orderData = {
    userId: auth.currentUser.uid,
    customerEmail: auth.currentUser.email,
    customerName:
      details.name ||
      auth.currentUser.displayName ||
      "",
    address: details.address || "",
    items: cart,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "pending_payment_check",
    paymentVerified: false,
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(
    collection(db, "orders"),
    orderData
  );

  if (window.emailjs?.send) {
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_NEW_ORDER_TEMPLATE_ID,
        {
          to_email: OWNER_EMAIL,
          order_id: ref.id,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          items: cart.map(item =>
            `${item.name} x${item.quantity}`
          ).join(", "),
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: (subtotal + shipping).toFixed(2),
          status: "Paiement à vérifier"
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Email de commande non envoyé", error);
    }
  }

  saveCart([]);

  return ref.id;
}

async function getMyOrders() {
  if (!auth.currentUser) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid)
    )
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function showMyOrders() {
  const host = document.querySelector("#polbuy-orders-list");
  if (!host) return;

  host.textContent = "Chargement…";

  try {
    const orders = await getMyOrders();

    host.innerHTML = orders.length
      ? orders.map(order => `
        <div class="cart-item">
          <strong>Commande ${safe(order.id)}</strong>
          <p>État : ${safe(order.status || "En attente")}</p>
          <p>Total : ${euro(Number(order.total || 0))}</p>
          <p>
            Suivi :
            ${safe(order.trackingNumber || "Pas encore disponible")}
          </p>
        </div>
      `).join("")
      : "<p>Aucune commande pour le moment.</p>";

  } catch (error) {
    host.textContent =
      "Impossible de charger les commandes. Vérifie les règles Firestore.";

    console.error(error);
  }
}

// ADMINISTRATEUR : custom claim Firebase admin=true obligatoire.
async function requireAdmin() {
  if (!auth.currentUser) {
    throw new Error("Connexion nécessaire.");
  }

  const token = await auth.currentUser.getIdTokenResult(true);

  if (token.claims.admin !== true) {
    throw new Error(
      "Droits administrateur Firebase requis (admin=true)."
    );
  }
}

async function getAllOrders() {
  await requireAdmin();

  const snapshot = await getDocs(
    collection(db, "orders")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function verifyPayment(orderId) {
  await requireAdmin();

  await updateDoc(
    doc(db, "orders", orderId),
    {
      paymentVerified: true,
      status: "paid",
      paymentVerifiedAt: serverTimestamp()
    }
  );
}

async function cancelOrder(orderId) {
  await requireAdmin();

  await updateDoc(
    doc(db, "orders", orderId),
    {
      status: "cancelled",
      cancelledAt: serverTimestamp()
    }
  );
}

async function updateTracking(orderId, data) {
  await requireAdmin();

  const update = {
    carrier: data.carrier || "",
    trackingNumber: data.trackingNumber || "",
    trackingStatus: data.trackingStatus || "",
    trackingLocation: data.trackingLocation || "",
    estimatedDelivery: data.estimatedDelivery || "",
    status: "shipped"
  };

  await updateDoc(
    doc(db, "orders", orderId),
    update
  );

  const orderSnapshot = await getDocs(
    query(
      collection(db, "orders"),
      where("__name__", "==", orderId)
    )
  );

  const order = orderSnapshot.docs[0]?.data();

  if (order && window.emailjs?.send) {
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TRACKING_TEMPLATE_ID,
        {
          to_email: order.customerEmail,
          customer_name: order.customerName || "",
          order_id: orderId,
          status: "Expédiée",
          carrier: update.carrier,
          tracking_number: update.trackingNumber,
          tracking_status: update.trackingStatus,
          tracking_location: update.trackingLocation,
          estimated_delivery: update.estimatedDelivery
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Email de suivi non envoyé", error);
    }
  }
}

async function requestProduct(data) {
  return addDoc(
    collection(db, "productRequests"),
    {
      userId: auth.currentUser?.uid || null,
      email: data.email || auth.currentUser?.email || "",
      brand: data.brand || "",
      name: data.name || "",
      description: data.description || "",
      link: data.link || "",
      createdAt: serverTimestamp()
    }
  );
}
// GESTION DES ADRESSES
// Elles sont enregistrées dans le navigateur de l'utilisateur.
function getAddresses() {
  try {
    return JSON.parse(
      localStorage.getItem(ADDRESS_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

function saveAddresses(addresses) {
  localStorage.setItem(
    ADDRESS_KEY,
    JSON.stringify(addresses)
  );
}

function openAddressBook() {
  ensureShopStyles();

  const modal = ensureOverlay(
    "polbuy-address-modal",
    "Mes adresses"
  );

  const host = modal.querySelector(
    ".polbuy-dialog-content"
  );

  const addresses = getAddresses();

  host.innerHTML = `
    <label>Choisir une adresse
      <select id="polbuy-address-select">
        <option value="">Sélectionner…</option>

        ${addresses.map((address, index) => `
          <option value="${index}">
            ${safe(address.label || address.name + " — " + address.city)}
          </option>
        `).join("")}
      </select>
    </label>

    <div id="polbuy-address-selected"></div>

    <h3>Ajouter une adresse</h3>

    <form id="polbuy-address-form">

      <label>Nom de l'adresse
        <input name="label"
          placeholder="Maison, travail…"
          required>
      </label>

      <label>Nom complet
        <input name="name" required>
      </label>

      <label>Adresse
        <input name="street" required>
      </label>

      <label>Code postal
        <input name="zip" required>
      </label>

      <label>Ville
        <input name="city" required>
      </label>

      <label>Pays
        <input name="country" value="France" required>
      </label>

      <label>Téléphone
        <input name="phone" type="tel">
      </label>

      <button type="submit">
        Ajouter l'adresse
      </button>
    </form>
  `;

  const select = host.querySelector(
    "#polbuy-address-select"
  );

  const showSelected = () => {
    const address = getAddresses()[Number(select.value)];

    host.querySelector(
      "#polbuy-address-selected"
    ).textContent = address
      ? `${address.name}, ${address.street}, ${address.zip} ${address.city}, ${address.country}`
      : "";
  };

  select.addEventListener("change", showSelected);

  showSelected();

  modal.classList.add("open");
}

function getSelectedAddress() {
  const modal = document.getElementById(
    "polbuy-address-modal"
  );

  const index = Number(
    modal?.querySelector("#polbuy-address-select")?.value
  );

  return getAddresses()[index] || null;
}

// DASHBOARD ADMINISTRATEUR
async function openAdminDashboard() {
  if (!auth.currentUser) {
    openAccount("login");
    throw new Error(
      "Connecte-toi avec le compte administrateur."
    );
  }

  const token = await auth.currentUser.getIdTokenResult(true);

  if (token.claims.admin !== true) {
    alert(
      "Accès refusé : le compte doit avoir le droit administrateur admin=true dans Firebase."
    );
    return;
  }

  ensureShopStyles();

  const modal = ensureOverlay(
    "polbuy-admin-modal",
    "Dashboard administrateur"
  );

  const host = modal.querySelector(
    ".polbuy-dialog-content"
  );

  modal.classList.add("open");
  host.textContent = "Chargement des commandes…";

  try {
    const orders = await getAllOrders();

    host.innerHTML = `
      <p>${orders.length} commande(s)</p>

      ${orders.map(order => `
        <article class="polbuy-admin-order">

          <strong>Commande ${safe(order.id)}</strong>

          <p>
            ${safe(order.customerName)}
            · ${safe(order.customerEmail)}
          </p>

          <p>
            ${euro(Number(order.total || 0))}
            · ${safe(order.status)}
          </p>

          <p>
            Adresse :
            ${safe(order.address?.street || order.address || "Non renseignée")}
          </p>

          <button type="button"
            data-admin-paid="${safe(order.id)}">
            Confirmer paiement
          </button>

          <button type="button"
            data-admin-cancel="${safe(order.id)}">
            Annuler
          </button>

          <form data-admin-tracking="${safe(order.id)}">

            <input name="carrier"
              placeholder="Transporteur (DPD, Colissimo…)"
              required>

            <input name="trackingNumber"
              placeholder="Numéro de suivi"
              required>

            <input name="trackingStatus"
              placeholder="Statut">

            <input name="trackingLocation"
              placeholder="Lieu">

            <input name="estimatedDelivery"
              placeholder="Livraison estimée">

            <button type="submit">
              Enregistrer le suivi
            </button>
          </form>

        </article>
      `).join("") || "<p>Aucune commande.</p>"}
    `;

  } catch (error) {
    host.textContent =
      "Erreur de chargement : " + error.message;
  }
}

// GESTION DES CLICS
document.addEventListener("click", event => {

  const openProductButton = event.target.closest(
    "[data-open-product]"
  );

  if (openProductButton) {
    openProduct(openProductButton.dataset.openProduct);
    return;
  }

  const closeOverlay = event.target.closest(
    "[data-overlay-close]"
  );

  if (closeOverlay) {
    document.getElementById(
      closeOverlay.dataset.overlayClose
    )?.classList.remove("open");

    return;
  }

  const addressButton = event.target.closest(
    "#address-open, [data-address-open]"
  );

  if (addressButton) {
    event.preventDefault();
    openAddressBook();
    return;
  }

  const adminButton = event.target.closest(
    "#admin-open, [data-admin-open]"
  );

  if (adminButton) {
    event.preventDefault();

    openAdminDashboard().catch(error => {
      alert(error.message);
    });

    return;
  }

  const minusButton = event.target.closest(
    "[data-qty-minus]"
  );

  if (minusButton) {
    const cart = getCart();
    const index = Number(minusButton.dataset.qtyMinus);

    if (cart[index]) {
      cart[index].quantity = Math.max(
        1,
        cart[index].quantity - 1
      );

      saveCart(cart);
    }

    return;
  }

  const plusButton = event.target.closest(
    "[data-qty-plus]"
  );

  if (plusButton) {
    const cart = getCart();
    const index = Number(plusButton.dataset.qtyPlus);

    if (cart[index]) {
      cart[index].quantity++;
      saveCart(cart);
    }

    return;
  }

  const paidButton = event.target.closest(
    "[data-admin-paid]"
  );

  if (paidButton) {
    verifyPayment(paidButton.dataset.adminPaid)
      .then(openAdminDashboard)
      .catch(error => alert(error.message));

    return;
  }

  const cancelButton = event.target.closest(
    "[data-admin-cancel]"
  );

  if (cancelButton) {
    cancelOrder(cancelButton.dataset.adminCancel)
      .then(openAdminDashboard)
      .catch(error => alert(error.message));

    return;
  }

  const addressOpenButton = event.target.closest(
    "#polbuy-open-address"
  );

  if (addressOpenButton) {
    openAddressBook();
    return;
  }

  const checkoutButton = event.target.closest(
    "#polbuy-checkout"
  );

  if (checkoutButton) {
    const address = getSelectedAddress();

    if (!address) {
      alert(
        "Choisis ou ajoute une adresse avant de commander."
      );

      openAddressBook();
      return;
    }

    createOrder({ address })
      .then(orderId => {
        alert(
          "Commande créée : " + orderId +
          ". Paiement à vérifier manuellement."
        );

        document.getElementById(
          "polbuy-cart-modal"
        )?.classList.remove("open");
      })
      .catch(error => alert(error.message));

    return;
  }

  const addButton = event.target.closest(
    "[data-add-product]"
  );

  if (addButton) {
    addToCartFromCard(addButton);
  }

  const removeButton = event.target.closest(
    "[data-remove-cart]"
  );

  if (removeButton) {
    const cart = getCart();

    cart.splice(
      Number(removeButton.dataset.removeCart),
      1
    );

    saveCart(cart);
  }

  if (event.target.closest(
    "#account-open, #accountBtn, #account-button, [data-account-open]"
  )) {
    event.preventDefault();
    openAccount("login");
  }

  if (event.target.closest(
    "#cart-open, #cartBtn, [data-cart-open]"
  )) {
    event.preventDefault();
    openCart();
  }

  if (event.target.closest("[data-close-account]")) {
    closeAccount();
  }

  if (event.target.closest("#polbuy-show-login")) {
    renderAccountContent("login");
  }

  if (event.target.closest("#polbuy-show-register")) {
    renderAccountContent("register");
  }

  if (event.target.closest("#polbuy-google-login")) {
    loginWithGoogle()
      .then(closeAccount)
      .catch(error => showAccountMessage(error.message));
  }

  if (event.target.closest("#polbuy-logout")) {
    logoutAccount()
      .then(() => renderAccountContent())
      .catch(error => showAccountMessage(error.message));
  }

  if (event.target.closest("#polbuy-my-orders")) {
    showMyOrders();
  }

  if (event.target.closest(
    "#import-products-btn, [data-import-products]"
  )) {
    importStarterCatalog();
  }
});

// FORMULAIRES
document.addEventListener("submit", async event => {

  // Ajouter une adresse
  if (event.target.id === "polbuy-address-form") {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(event.target)
    );

    const addresses = getAddresses();

    addresses.push(data);

    saveAddresses(addresses);

    openAddressBook();

    return;
  }

  // Enregistrer le suivi d'une commande
  if (event.target.matches("[data-admin-tracking]")) {
    event.preventDefault();

    const form = event.target;

    const data = Object.fromEntries(
      new FormData(form)
    );

    updateTracking(
      form.dataset.adminTracking,
      data
    )
      .then(openAdminDashboard)
      .catch(error => alert(error.message));

    return;
  }

  // Connexion / inscription
  if (event.target.id !== "polbuy-auth-form") {
    return;
  }

  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);

  const email = String(
    data.get("email") || ""
  ).trim();

  const password = String(
    data.get("password") || ""
  );

  const submit = form.querySelector(
    'button[type="submit"]'
  );

  if (submit) submit.disabled = true;

  try {
    if (form.querySelector('[name="name"]')) {
      await registerAccount(
        email,
        password,
        String(data.get("name") || "").trim()
      );
    } else {
      await loginAccount(email, password);
    }

    closeAccount();

  } catch (error) {
    const messages = {
      "auth/invalid-credential":
        "E-mail ou mot de passe incorrect.",

      "auth/email-already-in-use":
        "Cette adresse e-mail possède déjà un compte.",

      "auth/weak-password":
        "Le mot de passe doit contenir au moins 6 caractères.",

      "auth/invalid-email":
        "Adresse e-mail invalide.",

      "auth/popup-closed-by-user":
        "Fenêtre Google fermée."
    };

    showAccountMessage(
      messages[error.code] || error.message
    );

  } finally {
    if (submit) submit.disabled = false;
  }
});

// FILTRES
document.addEventListener("change", event => {

  if (event.target.matches(
    "#category-filter, #filterSelect, [data-category-filter]"
  )) {
    activeCategory = event.target.value || "all";

    if (["all", "Tous", "Toutes"].includes(activeCategory)) {
      activeCategory = "all";
    }

    renderProducts();
  }
});

// ÉTAT DE CONNEXION
onAuthStateChanged(auth, user => {

  currentUser = user;

  document.body.dataset.loggedIn = user
    ? "true"
    : "false";

  document.querySelectorAll(
    "#account-open, #accountBtn, #account-button, [data-account-open]"
  ).forEach(button => {
    button.setAttribute(
      "aria-label",
      user
        ? `Mon compte (${user.email})`
        : "Mon compte"
    );
  });

  // Le raccourci dashboard n'est affiché que pour l'adresse propriétaire.
  // Les droits réels restent contrôlés par le custom claim Firebase.
  if (
    user?.email === OWNER_EMAIL &&
    !document.querySelector("#polbuy-admin-shortcut")
  ) {
    const button = document.createElement("button");

    button.id = "polbuy-admin-shortcut";
    button.type = "button";
    button.textContent = "Dashboard admin";

    button.addEventListener("click", () => {
      openAdminDashboard().catch(error => {
        alert(error.message);
      });
    });

    (
      document.querySelector("header nav, header, nav") ||
      document.body
    ).appendChild(button);
  }

  if (!user) {
    document.querySelector(
      "#polbuy-admin-shortcut"
    )?.remove();
  }

  const modal = document.querySelector(
    "#polbuy-account-modal"
  );

  if (modal?.classList.contains("is-open")) {
    renderAccountContent();
  }
});

// INITIALISATION
function initPolBuy() {
  loadProducts();
  renderCart();

  const filter = document.querySelector(
    "#category-filter, #filterSelect, [data-category-filter]"
  );

  if (filter) {
    activeCategory = filter.value || "all";

    filter.addEventListener("change", () => {
      activeCategory = filter.value || "all";
      renderProducts();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initPolBuy,
    { once: true }
  );
} else {
  initPolBuy();
}

// API POL BUY
window.POL_BUY = {
  app,
  db,
  auth,
  OWNER_EMAIL,

  products: STARTER_PRODUCTS,

  adultSizes: [
    "XS", "S", "M", "L", "XL", "XXL", "XXXL"
  ],

  childSizes: [
    "S", "M", "L", "XL"
  ],

  shoeSizes: [
    "36", "36.5", "37", "37.5", "38",
    "38.5", "39", "39.5", "40", "40.5",
    "41", "41.5", "42", "42.5", "43"
  ],

  renderProducts,
  loadProducts,
  importStarterCatalog,

  getCart,
  renderCart,
  openCart,
  openProduct,

  openAddressBook,
  getAddresses,

  openAdminDashboard,

  createOrder,
  getMyOrders,
  getAllOrders,
  verifyPayment,
  cancelOrder,
  updateTracking,
  requestProduct,

  registerAccount,
  loginAccount,
  loginWithGoogle,
  logoutAccount,
  openAccount
};
