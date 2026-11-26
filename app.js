
/* =========================================================
   POL BUY — APP.JS COMPLET
   Catalogue + filtres + panier + compte Firebase + commandes.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, doc, setDoc,
  updateDoc, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// CONFIGURATION FIREBASE
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

const OWNER_EMAIL = "pol.buy.off@gmail.com";

const EMAILJS_SERVICE_ID = "service_u1tqxtl";
const EMAILJS_NEW_ORDER_TEMPLATE_ID = "template_8eqf2pr";
const EMAILJS_TRACKING_TEMPLATE_ID = "template_vr7m9e7";
const EMAILJS_PUBLIC_KEY = "x2MvJKVWxwA6DG6Mg";

const CART_KEY = "polbuy_cart";
let currentUser = null;
let activeCategory = "all";

// =========================================================
// CATALOGUE COMPLET
// =========================================================

const STARTER_PRODUCTS = [

  // ---------------- NIKE ----------------

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
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
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
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-running-division",
    brand: "Nike",
    category: "Nike",
    name: "Running Nike Division",
    price: 9.56,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-running-division-zip-noir",
    brand: "Nike",
    category: "Nike",
    name: "Haut zippé Nike Running Division noir",
    price: 4.00,
    images: [
      "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-ensemble-division-noir",
    brand: "Nike",
    category: "Nike",
    name: "Ensemble Nike Division noir",
    price: 11.13,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
      "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
      "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
    ],
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-ensemble-division-menthe",
    brand: "Nike",
    category: "Nike",
    name: "Ensemble Nike Division menthe/bleu",
    price: 12.00,
    images: [
      "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
      "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
      "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
    ],
    colors: ["Menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-zip-running-division-menthe",
    brand: "Nike",
    category: "Nike",
    name: "Haut zippé Nike Running Division menthe/bleu",
    price: 6.42,
    images: [
      "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
      "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
    ],
    colors: ["Menthe/bleu"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
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
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
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
      "https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267",
      "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_rose.png?v=1782133321",
      "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_noir.png?v=1782133367"
    ],
    colors: ["Bleu", "Rose", "Noir"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "nike-veste-bresil-itau",
    brand: "Nike",
    category: "Nike",
    name: "Veste Brésil Itaú",
    price: 14.45,
    images: [
      "https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462",
      "https://maillotland.com/cdn/shop/files/IMG-5587.jpg?v=1789297833",
      "https://maillotland.com/cdn/shop/files/Veste_Br_sil_Beige.jpg?v=1788034586",
      "https://maillotland.com/cdn/shop/files/5D7DC9F8-EAEE-41ED-B5F2-ACF023339549.jpg?v=1788030700"
    ],
    colors: ["Noir", "Rose", "Beige", "Vert"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  // ---------------- C.P. COMPANY ----------------

  {
    id: "cp-company-pullover",
    brand: "C.P. Company",
    category: "C.P. Company",
    name: "C.P. Company Pullover",
    price: 6.34,
    images: [
      "https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490",
      "https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "cp-company-bonnet-menorinos",
    brand: "C.P. Company",
    category: "C.P. Company",
    name: "C.P. Company Bonnet en mérinos",
    price: 4.86,
    images: [
      "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg"
    ],
    colors: ["Selon photo"],
    sizes: ["Taille unique"],
    active: true
  },

  // ---------------- STONE ISLAND ----------------

  {
    id: "stone-island-article",
    brand: "Stone Island",
    category: "Stone Island",
    name: "Stone Island – article noir et blanc",
    price: null,
    priceToSet: true,
    images: [
      "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey",
      "https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  {
    id: "stone-island-cotton-tshirt",
    brand: "Stone Island",
    category: "Stone Island",
    name: "Stone Island Cotton T-shirt",
    price: null,
    priceToSet: true,
    images: [
      "https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg",
      "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey"
    ],
    colors: ["Noir", "Blanc"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    active: true
  },

  // ---------------- UNDER ARMOUR ----------------

  {
    id: "under-armour-ua-tech-fille",
    brand: "Under Armour",
    category: "Under Armour",
    name: "UA Tech pour fille",
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
    colors: [
      "Blanc",
      "Bleu",
      "Noir motif orange",
      "Rose",
      "Noir sans motif"
    ],
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
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
      "https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_BC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
    ],
    colors: ["Noir"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    active: true
  }

];

// =========================================================
// OUTILS
// =========================================================

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

// =========================================================
// AFFICHAGE DES PRODUITS
// =========================================================

function productCard(product) {
  const image = product.images?.[0];

  const colorOptions = (product.colors || [])
    .map(color =>
      `<option value="${safe(color)}">${safe(color)}</option>`
    ).join("");

  const sizeOptions = (product.sizes || ["Taille unique"])
    .map(size =>
      `<option value="${safe(size)}">${safe(size)}</option>`
    ).join("");

  return `
    <article class="product-card" data-product-id="${safe(product.id)}">

      <div class="product-image-wrap">
        ${
          image
            ? `<img class="product-image"
                 src="${safe(image)}"
                 alt="${safe(product.name)}"
                 loading="lazy"
                 onerror="this.style.display='none'">`
            : `<div class="product-image-placeholder">POL BUY</div>`
        }
      </div>

      <div class="product-info">
        <p class="product-brand">${safe(product.brand)}</p>
        <h3>${safe(product.name)}</h3>

        <p class="product-price">
          ${product.price == null ? "Prix à confirmer" : euro(product.price)}
        </p>

        ${
          product.images?.length > 1
            ? `<div class="product-gallery">
                ${product.images.slice(1).map(url =>
                  `<img src="${safe(url)}"
                        alt="${safe(product.name)}"
                        loading="lazy"
                        onerror="this.style.display='none'">`
                ).join("")}
              </div>`
            : ""
        }

        <label>
          Couleur
          <select class="product-color">
            ${colorOptions || `<option>Non précisée</option>`}
          </select>
        </label>

        <label>
          Taille
          <select class="product-size">
            ${sizeOptions}
          </select>
        </label>

        <button class="add-to-cart"
                type="button"
                data-add-product="${safe(product.id)}"
                ${product.price == null ? "disabled" : ""}>
          ${product.price == null ? "Prix à confirmer" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  `;
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

  if (!grid) {
    console.error("Élément #product-grid introuvable dans index.html");
    return;
  }

  grid.innerHTML = getVisibleProducts().map(productCard).join("");
}

async function loadProducts() {
  // Affiche immédiatement le catalogue intégré.
  renderProducts();

  // Essaie ensuite de récupérer les produits Firestore.
  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (!snapshot.empty) {
      console.log("Produits Firestore chargés :", snapshot.size);
    }
  } catch (error) {
    console.warn(
      "Firestore indisponible : le catalogue intégré reste affiché.",
      error
    );
  }
}

// Import manuel du catalogue dans Firestore.
async function importStarterCatalog() {
  try {
    for (const product of STARTER_PRODUCTS) {
      const { id, ...data } = product;

      await setDoc(doc(db, "products", id), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    alert("Catalogue POL BUY importé dans Firestore.");
  } catch (error) {
    console.error(error);
    alert("Import impossible. Vérifie les règles Firestore.");
  }
}

// =========================================================
// PANIER
// =========================================================

function addToCartFromCard(button) {
  const card = button.closest("[data-product-id]");

  if (!card) return;

  const product = STARTER_PRODUCTS.find(
    item => item.id === card.dataset.productId
  );

  if (!product || product.price == null) return;

  const color =
    card.querySelector(".product-color")?.value || "Non précisée";

  const size =
    card.querySelector(".product-size")?.value || "Taille unique";

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
      image: product.images?.[0] || "",
      color,
      size,
      quantity: 1
    });
  }

  saveCart(cart);

  button.textContent = "Ajouté ✓";

  setTimeout(() => {
    if (button.isConnected) {
      button.textContent = "Ajouter au panier";
    }
  }, 1200);
}

function renderCart() {
  const cart = getCart();

  const lines = document.querySelector(
    "#cart-lines, #cartItems, [data-cart-lines]"
  );

  if (lines) {
    lines.innerHTML = cart.length
      ? cart.map((item, index) => `
          <div class="cart-item">
            <span>
              ${safe(item.name)} —
              ${safe(item.color)} —
              ${safe(item.size)} × ${item.quantity}
            </span>

            <strong>${euro(item.price * item.quantity)}</strong>

            <button type="button" data-remove-cart="${index}">
              Supprimer
            </button>
          </div>
        `).join("")
      : "<p>Ton panier est vide.</p>";
  }

  const totalNode = document.querySelector(
    "#cart-total, [data-cart-total]"
  );

  if (totalNode) {
    totalNode.textContent =
      `Sous-total : ${euro(cartSubtotal())} · ` +
      `Livraison : ${cartShipping() === 0 ? "offerte" : euro(cartShipping())} · ` +
      `Total : ${euro(cartSubtotal() + cartShipping())}`;
  }

  document.querySelectorAll("[data-cart-count]").forEach(node => {
    node.textContent = cart.reduce(
      (number, item) => number + Number(item.quantity || 1),
      0
    );
  });
}

// =========================================================
// COMPTE CLIENT — FENÊTRE DE CONNEXION AUTOMATIQUE
// =========================================================

function ensureAccountModal() {
  let modal = document.querySelector(
    "#account-modal, [data-account-modal], #polbuy-account-modal"
  );

  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "polbuy-account-modal";

  modal.innerHTML = `
    <div class="polbuy-modal-backdrop" data-close-account></div>

    <section class="polbuy-modal-panel"
             role="dialog"
             aria-modal="true">

      <button type="button"
              class="polbuy-modal-close"
              data-close-account>
        ×
      </button>

      <h2>Mon compte POL BUY</h2>

      <div id="polbuy-account-content"></div>

    </section>
  `;

  document.body.appendChild(modal);

  if (!document.querySelector("#polbuy-account-styles")) {
    const style = document.createElement("style");
    style.id = "polbuy-account-styles";

    style.textContent = `
      #polbuy-account-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        font-family: Arial, sans-serif;
      }

      #polbuy-account-modal.is-open {
        display: flex;
      }

      .polbuy-modal-backdrop {
        position: absolute;
        inset: 0;
        background: #0009;
      }

      .polbuy-modal-panel {
        position: relative;
        background: white;
        color: #111;
        width: min(440px, 100%);
        max-height: 90vh;
        overflow: auto;
        padding: 28px;
        border-radius: 12px;
        box-shadow: 0 12px 50px #0004;
      }

      .polbuy-modal-close {
        position: absolute;
        right: 14px;
        top: 10px;
        border: 0;
        background: none;
        font-size: 30px;
        cursor: pointer;
      }

      .polbuy-account-form {
        display: grid;
        gap: 12px;
      }

      .polbuy-account-form input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px;
        border: 1px solid #bbb;
        border-radius: 6px;
      }

      .polbuy-account-form button {
        padding: 12px;
        background: #111;
        color: white;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
      }

      .polbuy-account-switch {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      .polbuy-account-switch button {
        padding: 10px;
        background: #eee;
        color: #111;
        border: 0;
        cursor: pointer;
      }

      .polbuy-account-message {
        font-size: 14px;
        color: #b00020;
      }
    `;

    document.head.appendChild(style);
  }

  return modal;
}

function showAccountMessage(message) {
  const node = document.querySelector("#polbuy-account-message");

  if (node) {
    node.textContent = message;
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

      <p id="polbuy-account-message"></p>
      <div id="polbuy-orders-list"></div>
    `;

    return;
  }

  const register = mode === "register";

  host.innerHTML = `
    <form id="polbuy-auth-form" class="polbuy-account-form">

      <h3>${register ? "Créer un compte" : "Connexion"}</h3>

      ${
        register
          ? `<input name="name"
                    type="text"
                    placeholder="Ton prénom et nom"
                    required>`
          : ""
      }

      <input name="email"
             type="email"
             placeholder="Adresse e-mail"
             autocomplete="email"
             required>

      <input name="password"
             type="password"
             placeholder="Mot de passe (6 caractères minimum)"
             minlength="6"
             required>

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
  const modal = document.querySelector("#polbuy-account-modal");

  if (modal) {
    modal.classList.remove("is-open");
    modal.style.display = "none";
  }
}

// =========================================================
// AUTHENTIFICATION FIREBASE
// =========================================================

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
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return credential.user;
}

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  const credential = await signInWithPopup(auth, provider);

  return credential.user;
}

async function logoutAccount() {
  await signOut(auth);
}

// =========================================================
// COMMANDES
// =========================================================

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
    customerName: details.name || auth.currentUser.displayName || "",
    address: details.address || "",
    items: cart,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "pending_payment_check",
    paymentVerified: false,
    createdAt: serverTimestamp()
  };

  const orderRef = await addDoc(
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
          order_id: orderRef.id,
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

  return orderRef.id;
}

async function getMyOrders() {
  if (!auth.currentUser) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid)
    )
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
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
            <p>Suivi : ${safe(order.trackingNumber || "Pas encore disponible")}</p>
          </div>
        `).join("")
      : "<p>Aucune commande pour le moment.</p>";

  } catch (error) {
    host.textContent =
      "Impossible de charger les commandes. Vérifie les règles Firestore.";

    console.error(error);
  }
}

// =========================================================
// ADMINISTRATION
// =========================================================

function requireAdmin() {
  if (!auth.currentUser) {
    throw new Error("Connexion nécessaire.");
  }

  if (auth.currentUser.email !== OWNER_EMAIL) {
    throw new Error("Réservé à l'administrateur.");
  }
}

async function getAllOrders() {
  requireAdmin();

  const snapshot = await getDocs(collection(db, "orders"));

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

async function verifyPayment(orderId) {
  requireAdmin();

  await updateDoc(doc(db, "orders", orderId), {
    paymentVerified: true,
    status: "paid",
    paymentVerifiedAt: serverTimestamp()
  });
}

async function cancelOrder(orderId) {
  requireAdmin();

  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled",
    cancelledAt: serverTimestamp()
  });
}

async function updateTracking(orderId, data) {
  requireAdmin();

  const update = {
    carrier: data.carrier || "",
    trackingNumber: data.trackingNumber || "",
    trackingStatus: data.trackingStatus || "",
    trackingLocation: data.trackingLocation || "",
    estimatedDelivery: data.estimatedDelivery || "",
    status: "shipped"
  };

  await updateDoc(doc(db, "orders", orderId), update);
}

// =========================================================
// DEMANDE D'UN PRODUIT
// =========================================================

async function requestProduct(data) {
  return addDoc(collection(db, "productRequests"), {
    userId: auth.currentUser?.uid || null,
    email: data.email || auth.currentUser?.email || "",
    brand: data.brand || "",
    name: data.name || "",
    description: data.description || "",
    link: data.link || "",
    createdAt: serverTimestamp()
  });
}

// =========================================================
// ÉVÉNEMENTS DES BOUTONS
// =========================================================

document.addEventListener("click", event => {

  // Ajouter au panier
  const addButton = event.target.closest("[data-add-product]");

  if (addButton) {
    addToCartFromCard(addButton);
  }

  // Supprimer du panier
  const removeButton = event.target.closest("[data-remove-cart]");

  if (removeButton) {
    const cart = getCart();

    cart.splice(Number(removeButton.dataset.removeCart), 1);

    saveCart(cart);
  }

  // BOUTON COMPTE : plusieurs anciens identifiants acceptés
  if (
    event.target.closest(
      "#account-open, #accountBtn, #account-button, [data-account-open]"
    )
  ) {
    event.preventDefault();
    openAccount("login");
  }

  // BOUTON PANIER
  if (
    event.target.closest(
      "#cart-open, #cartBtn, [data-cart-open]"
    )
  ) {
    event.preventDefault();
    renderCart();

    const panel = document.querySelector(
      "#cart-modal, #cart-panel, [data-cart-modal]"
    );

    if (panel) {
      panel.hidden = false;
      panel.classList.add("is-open");
    }
  }

  // Fermer compte
  if (event.target.closest("[data-close-account]")) {
    closeAccount();
  }

  // Passer de connexion à inscription
  if (event.target.closest("#polbuy-show-login")) {
    renderAccountContent("login");
  }

  if (event.target.closest("#polbuy-show-register")) {
    renderAccountContent("register");
  }

  // Connexion Google
  if (event.target.closest("#polbuy-google-login")) {
    loginWithGoogle()
      .then(closeAccount)
      .catch(error => showAccountMessage(error.message));
  }

  // Déconnexion
  if (event.target.closest("#polbuy-logout")) {
    logoutAccount()
      .then(() => renderAccountContent())
      .catch(error => showAccountMessage(error.message));
  }

  // Commandes client
  if (event.target.closest("#polbuy-my-orders")) {
    showMyOrders();
  }

  // Import catalogue
  if (
    event.target.closest(
      "#import-products-btn, [data-import-products]"
    )
  ) {
    importStarterCatalog();
  }
});

// Formulaire connexion / inscription
document.addEventListener("submit", async event => {
  if (event.target.id !== "polbuy-auth-form") return;

  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);

  const email = String(data.get("email") || "").trim();
  const password = String(data.get("password") || "");

  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) submitButton.disabled = true;

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
      "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
      "auth/email-already-in-use": "Cette adresse possède déjà un compte.",
      "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/popup-closed-by-user": "Fenêtre Google fermée."
    };

    showAccountMessage(
      messages[error.code] || error.message
    );

  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

// Filtre catégories
document.addEventListener("change", event => {
  if (
    event.target.matches(
      "#category-filter, #filterSelect, [data-category-filter]"
    )
  ) {
    activeCategory = event.target.value || "all";

    if (["Tous", "Toutes"].includes(activeCategory)) {
      activeCategory = "all";
    }

    renderProducts();
  }
});

// État de connexion Firebase
onAuthStateChanged(auth, user => {
  currentUser = user;

  document.body.dataset.loggedIn = user ? "true" : "false";

  document.querySelectorAll(
    "#account-open, #accountBtn, #account-button, [data-account-open]"
  ).forEach(button => {
    button.setAttribute(
      "aria-label",
      user ? `Mon compte (${user.email})` : "Mon compte"
    );
  });

  const modal = document.querySelector("#polbuy-account-modal");

  if (modal?.classList.contains("is-open")) {
    renderAccountContent();
  }
});

// =========================================================
// DÉMARRAGE
// =========================================================

function initPolBuy() {
  loadProducts();
  renderCart();

  const filter = document.querySelector(
    "#category-filter, #filterSelect, [data-category-filter]"
  );

  if (filter) {
    activeCategory = filter.value || "all";
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

// FONCTIONS ACCESSIBLES DEPUIS LE RESTE DU SITE
window.POL_BUY = {
  app,
  db,
  auth,
  OWNER_EMAIL,
  products: STARTER_PRODUCTS,

  adultSizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  childSizes: ["S", "M", "L", "XL"],
  shoeSizes: [
    "36", "36.5", "37", "37.5", "38", "38.5",
    "39", "39.5", "40", "40.5", "41", "41.5",
    "42", "42.5", "43"
  ],

  renderProducts,
  loadProducts,
  importStarterCatalog,
  getCart,
  renderCart,
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
