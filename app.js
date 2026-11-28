import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy, serverTimestamp, deleteDoc
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

/* EMAILJS */

const EMAIL_SERVICE_ID = "service_u1tqxtl";
const EMAIL_PUBLIC_KEY = "sA0AhDl6nmEVFqpKr";

const TEMPLATE_PRODUCT_REQUEST = "template_8eqf2pr";
const TEMPLATE_TRACKING = "template_vr7m9e7";

emailjs.init({ publicKey: EMAIL_PUBLIC_KEY });

/* LIVRAISON */

const SHIPPING_PRICE = 3.99;
const FREE_SHIPPING_FROM = 24.99;

/* VARIABLES GLOBALES */

let currentUser = null;
let cart = JSON.parse(localStorage.getItem("polbuy-cart") || "[]");
let activeProduct = null;
let activeImageIndex = 0;
let adminOrdersCache = new Map();

/* OUTILS */

const $ = id => document.getElementById(id);

const money = n =>
  Number(n).toFixed(2).replace(".", ",") + " €";

const isAdmin = () =>
  currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* ENVOI EMAILJS */

async function sendEmail(templateId, params) {
  try {
    const result = await emailjs.send(
      EMAIL_SERVICE_ID,
      templateId,
      params
    );

    console.log("EmailJS envoyé :", result);
    return true;

  } catch (error) {
    console.error("Erreur EmailJS :", error);

    alert(
      "Erreur EmailJS : " +
      (error?.text || error?.message || "Erreur inconnue")
    );

    return false;
  }
}

/* CATALOGUE */

const products = [
  // ==================== NIKE ====================
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
        price: 6.42,
        images: [
          "https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807",
          "https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-ensemble-division",
    brand: "Nike",
    name: "Ensemble Nike Division",
    variants: [
      {
        color: "Noir",
        price: 7.13,
        images: [
          "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
          "https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779",
          "https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779"
        ]
      },
      {
        color: "Noir et menthe / bleu",
        price: 12.00,
        images: [
          "https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75",
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
      "https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp",
      "https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp"
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "nike-ete",
    brand: "Nike",
    name: "Ensemble Nike Running été — Short et T-shirt",
    variants: [
      {
        color: "Bleu",
        price: 2.56,
        images: [
          "https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267"
        ]
      },
      {
        color: "Rose",
        price: 2.56,
        images: [
          "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_rose.png?v=1782133321"
        ]
      },
      {
        color: "Noir",
        price: 2.56,
        images: [
          "https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_noir.png?v=1782133367"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "veste-bresil",
    brand: "Nike",
    name: "Veste Brésil Itaú",
    variants: [
      {
        color: "Noir",
        price: 14.45,
        images: [
          "https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462"
        ]
      },
      {
        color: "Rose",
        price: 14.45,
        images: [
          "https://maillotland.com/cdn/shop/files/IMG-5587.jpg?v=1789297833"
        ]
      },
      {
        color: "Beige",
        price: 14.45,
        images: [
          "https://maillotland.com/cdn/shop/files/Veste_Br_sil_Beige.jpg?v=1788034586"
        ]
      },
      {
        color: "Vert",
        price: 14.45,
        images: [
          "https://maillotland.com/cdn/shop/files/5D7DC9F8-EAEE-41ED-B5F2-ACF023339549.jpg?v=1788030700"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },

  // ==================== NIKE TECH FLEECE ====================
  {
    id: "nike-tech-ensemble",
    brand: "Nike",
    name: "Ensemble Nike Tech Fleece",
    variants: [
      {
        color: "Gris",
        price: 9.54,
        images: [
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375346_1/nike-tech-fleece-jogger-gris-44379-1",
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375346_2/nike-tech-fleece-jogger-gris-44379-2",
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375346_4/nike-tech-fleece-jogger-gris-44379-4",
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375329_1/nike-tech-fleece-windrunner-gris-47019-1",
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375346_7/nike-tech-fleece-jogger-gris-44379-7"
        ]
      },
      {
        color: "Noir",
        price: 9.54,
        images: [
          "https://i8.amplience.net/i/jpl/jd_719968_b?$prod404frFR$&qlt=default&fmt=auto&w=720&h=919",
          "https://i8.amplience.net/i/jpl/jd_719968_f?$prod404frFR$&qlt=default&fmt=auto&w=720&h=919"
        ]
      },
      {
        color: "Bleu",
        price: 9.54,
        images: [
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/8cb91373-5a37-43f4-ae39-f03ec17812bb/M+NK+TECH+FLC+PRO+CB+OH+PANT.png",
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/fc8a5a33-6f57-4c38-893f-9f443a273518/M+NK+TECH+FLC+PRO+CB+OH+PANT.png",
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ba9722f6-e01b-43d4-9bc3-7a8ee1d81e96/M+NK+TECH+FLC+PRO+CB+OH+PANT.png"
        ]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
  },
  {
    id: "nike-tech-haut",
    brand: "Nike",
    name: "Haut Nike Tech Fleece",
    variants: [
      {
        color: "Gris",
        price: 4.59,
        images: [
          "https://asset.snipes.com/images/f_auto,q_80,d_fallback-sni.png/b_rgb:f8f8f8,c_pad,w_680,h_680/if_md:!is_ai_generated!_eq_!true!/l_ai_icon/fl_layer_apply,g_south_east,w_24,x_24,y_24/if_end/dpr_1.0/02375329_1/nike-tech-fleece-windrunner-gris-47019-1"
        ]
      },
      {
        color: "Orange",
        price: 4.59,
        images: [
          "https://m.media-amazon.com/images/I/61-TMVFar3L._AC_SX466_.jpg",
          "https://m.media-amazon.com/images/I/61MqS39aVsL._AC_SX466_.jpg"
        ]
      },
      {
        color: "Bleu PSG",
        price: 4.59,
        images: [
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e85a6559-8860-4ecd-b36b-2feb2867a0a5/PSG+M+NK+TCH+FLC+FZ+WR+HOODIE.png",
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e0049d68-4f6e-4a6e-b91e-dae994433f78/PSG+M+NK+TCH+FLC+FZ+WR+HOODIE.png"
        ]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
  },

  // ==================== C.P. COMPANY ====================
  {
    id: "cp-pullover",
    brand: "C.P. Company",
    name: "Pullover C.P. Company",
    variants: [
      {
        color: "Noir",
        price: 6.34,
        images: [
          "https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490"
        ]
      },
      {
        color: "Blanc",
        price: 6.34,
        images: [
          "https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490"
        ]
      }
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

  // ==================== STONE ISLAND ====================
  {
    id: "stone-pull",
    brand: "Stone Island",
    name: "Stone Island Pull",
    variants: [
      {
        color: "Noir",
        price: 3.46,
        images: [
          "https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey"
        ]
      },
      {
        color: "Blanc",
        price: 3.46,
        images: [
          "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },
  {
    id: "stone-tee",
    brand: "Stone Island",
    name: "Stone Island Cotton T-shirt",
    variants: [
      {
        color: "Noir",
        price: 1.46,
        images: [
          "https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg"
        ]
      },
      {
        color: "Blanc",
        price: 1.46,
        images: [
          "https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey"
        ]
      }
    ],
    sizes: ["XS","S","M","L","XL","XXL","XXXL"]
  },

  // ==================== UNDER ARMOUR ====================
  {
    id: "ua-tech-boy",
    brand: "Under Armour",
    name: "UA Tech 2.0",
    variants: [
      {
        color: "Blanc",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-100_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      },
      {
        color: "Bleu",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-482_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      },
      {
        color: "Noir motif",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-003_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      },
      {
        color: "Orange",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-808_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      },
      {
        color: "Rose",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-673_HS?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      },
      {
        color: "Noir sans motif",
        price: 3.46,
        images: [
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HB?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0",
          "https://underarmour.scene7.com/is/image/Underarmour/PS1363284-001_HF?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0"
        ]
      }
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

    return `
      <article class="product-card">
        <img
          src="${escapeHTML(variant.images[0])}"
          alt="${escapeHTML(product.name)}"
          data-product="${escapeHTML(product.id)}"
        >

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
    element.addEventListener("click", () =>
      openProduct(element.dataset.product)
    );
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

    <img
      class="product-detail-image"
      id="detail-image"
      src="${escapeHTML(variant.images[0])}"
      alt="${escapeHTML(product.name)}"
    >

    <div class="detail-arrows">
      <button id="previous-image">← Précédente</button>
      <span id="image-position">1 / ${variant.images.length}</span>
      <button id="next-image">Suivante →</button>
    </div>

    <p><strong id="detail-price">${money(variant.price)}</strong></p>

    <label class="form-label">Couleur</label>
    <select class="form-field" id="detail-color">
      ${variants.map((v, i) =>
        `<option value="${i}">${escapeHTML(v.color)}</option>`
      ).join("")}
    </select>

    <label class="form-label">Taille</label>
    <select class="form-field" id="detail-size">
      ${(product.sizes || ["Taille unique"]).map(size =>
        `<option>${escapeHTML(size)}</option>`
      ).join("")}
    </select>

    <button class="primary-btn" id="add-to-cart">
      AJOUTER AU PANIER
    </button>
  `;

  $("detail-color").addEventListener("change", () => {
    activeImageIndex = 0;
    updateProductImage();
  });

  $("previous-image").addEventListener("click", () => {
    const images =
      getVariants(product)[Number($("detail-color").value)].images;

    activeImageIndex =
      (activeImageIndex - 1 + images.length) % images.length;

    updateProductImage();
  });

  $("next-image").addEventListener("click", () => {
    const images =
      getVariants(product)[Number($("detail-color").value)].images;

    activeImageIndex = (activeImageIndex + 1) % images.length;

    updateProductImage();
  });

  $("add-to-cart").addEventListener("click", addSelectedProductToCart);
}

function updateProductImage() {
  const variant =
    getVariants(activeProduct)[Number($("detail-color").value)];

  $("detail-image").src = variant.images[activeImageIndex];
  $("detail-price").textContent = money(variant.price);

  $("image-position").textContent =
    `${activeImageIndex + 1} / ${variant.images.length}`;
}

function addSelectedProductToCart() {
  const product = activeProduct;
  const variant =
    getVariants(product)[Number($("detail-color").value)];

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
  return cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );
}

function shippingCost() {
  if (!cart.length || cartSubtotal() >= FREE_SHIPPING_FROM) {
    return 0;
  }

  return SHIPPING_PRICE;
}

function cartTotal() {
  return Number((cartSubtotal() + shippingCost()).toFixed(2));
}

function saveCart() {
  localStorage.setItem("polbuy-cart", JSON.stringify(cart));

  if ($("cart-count")) {
    $("cart-count").textContent =
      cart.reduce((sum, item) => sum + item.quantity, 0);
  }

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

  container.innerHTML = cart.map(item => `
    <div class="cart-line">
      <div>
        <strong>${escapeHTML(item.name)}</strong><br>

        <small>
          ${escapeHTML(item.color)}
          · Taille ${escapeHTML(item.size)}
          · Qté ${Number(item.quantity)}
        </small><br>

        <strong>${money(item.price * item.quantity)}</strong>
      </div>

      <button class="small-btn" data-remove="${escapeHTML(item.key)}">
        Retirer
      </button>
    </div>
  `).join("");

  container.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      cart = cart.filter(item => item.key !== button.dataset.remove);
      saveCart();
    });
  });

  const subtotal = cartSubtotal();
  const shipping = shippingCost();
  const total = cartTotal();

  $("cart-total").innerHTML = `
    <p>Sous-total : <strong>${money(subtotal)}</strong></p>
    <p>
      Livraison :
      <strong>${shipping === 0 ? "Offerte" : money(shipping)}</strong>
    </p>
    <h3>TOTAL : ${money(total)}</h3>
  `;

  $("checkout-area").innerHTML = `
    <div class="notice">
      La commande reste en attente jusqu'à vérification réelle du paiement.
    </div>

    <label class="form-label">Adresse de livraison</label>
    <textarea
      id="delivery-address"
      class="form-field"
      placeholder="Nom, rue, code postal, ville, pays"
    ></textarea>

    <label class="form-label">Téléphone (facultatif)</label>
    <input id="delivery-phone" class="form-field">

    <a
      class="primary-btn"
      style="display:block;text-align:center;text-decoration:none"
      href="${PAYPAL_BASE}/${total.toFixed(2)}"
      target="_blank"
      rel="noopener"
    >
      PAYER ${money(total)} AVEC PAYPAL
    </a>

    <button class="primary-btn" id="place-order">
      ENREGISTRER MA COMMANDE
    </button>
  `;

  $("place-order").addEventListener("click", placeOrder);
}

async function placeOrder() {
  if (!currentUser) {
    alert("Connecte-toi avant de commander.");
    openAccount();
    return;
  }

  if (!cart.length) {
    return alert("Ton panier est vide.");
  }

  const address = $("delivery-address").value.trim();
  const phone = $("delivery-phone").value.trim();

  if (!address) {
    return alert("Indique ton adresse de livraison.");
  }

  const subtotal = Number(cartSubtotal().toFixed(2));
  const shipping = Number(shippingCost().toFixed(2));
  const total = Number(cartTotal().toFixed(2));

  const order = {
    userId: currentUser.uid,
    customerName: currentUser.displayName || currentUser.email,
    customerEmail: currentUser.email,
    address,
    phone,
    items: cart.map(item => ({ ...item })),
    subtotal,
    shipping,
    total,
    paymentMethod: "PayPal",
    paymentVerified: false,
    status: "En attente de vérification du paiement",
    carrier: "",
    trackingNumber: "",
    trackingStatus: "",
    trackingLocation: "",
    estimatedDelivery: "",
    createdAt: serverTimestamp()
  };

  try {
    const result = await addDoc(collection(db, "orders"), order);

    cart = [];
    saveCart();
    closeOverlay("cart-overlay");

    alert(
      "Commande enregistrée : " + result.id +
      "\nTotal : " + money(total) +
      "\nLe paiement reste à vérifier manuellement."
    );

    openAccount();

  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'enregistrement : " + error.message);
  }
}

/* COMPTE CLIENT ET DEMANDE DE PRODUIT */

function openAccount() {
  renderAccount();
  openOverlay("account-overlay");
}

$("account-open")?.addEventListener("click", openAccount);

function renderAccount() {
  const area = $("account-content");
  if (!area) return;

  if (!currentUser) {
    area.innerHTML = `
      <h3>Connexion</h3>

      <label class="form-label">E-mail</label>
      <input id="auth-email" class="form-field" type="email">

      <label class="form-label">Mot de passe</label>
      <input id="auth-password" class="form-field" type="password">

      <button class="primary-btn" id="login-btn">
        SE CONNECTER
      </button>

      <button class="primary-btn" id="register-btn">
        CRÉER UN COMPTE
      </button>

      <button class="primary-btn" id="google-btn">
        CONTINUER AVEC GOOGLE
      </button>

      <div id="auth-error"></div>
    `;

    $("login-btn").addEventListener("click", () => emailAuth(false));
    $("register-btn").addEventListener("click", () => emailAuth(true));
    $("google-btn").addEventListener("click", googleLogin);

    return;
  }

  area.innerHTML = `
    <p>
      Connecté avec :
      <strong>${escapeHTML(currentUser.email)}</strong>
    </p>

    <section class="account-section">
      <h3>Mes commandes</h3>
      <div id="customer-orders">Chargement...</div>
    </section>

    <section class="account-section">
      <h3>Demander un produit</h3>

      <p>
        Tu recherches un article qui n'est pas dans la boutique ?
        Envoie-nous ta demande ici, nous ajouterons l'article sous 24h.
      </p>

      <form id="account-request-form">
        <label class="form-label">Ton nom</label>
        <input
          class="form-field"
          name="name"
          required
          value="${escapeHTML(currentUser.displayName || "")}"
        >

        <label class="form-label">Ton e-mail</label>
        <input
          class="form-field"
          name="email"
          type="email"
          required
          value="${escapeHTML(currentUser.email || "")}"
        >

        <label class="form-label">Marque recherchée</label>
        <input
          class="form-field"
          name="brand"
          required
          placeholder="Ex : Nike, Adidas..."
        >

        <label class="form-label">Nom du produit</label>
        <input
          class="form-field"
          name="product"
          required
          placeholder="Nom de l'article"
        >

        <label class="form-label">Description ou lien (facultatif)</label>
        <textarea
          class="form-field"
          name="description"
          placeholder="Décris le produit ou colle un lien"
        ></textarea>

        <button class="primary-btn" type="submit">
          ENVOYER MA DEMANDE
        </button>

        <p id="account-request-message" role="status"></p>
      </form>
    </section>

    <button class="primary-btn" id="logout-btn">
      SE DÉCONNECTER
    </button>
  `;

  $("logout-btn").addEventListener("click", () => signOut(auth));

  const requestForm = $("account-request-form");

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const message = $("account-request-message");
    const submitButton =
      formElement.querySelector('button[type="submit"]');

    const form = new FormData(formElement);

    const request = {
      userId: currentUser.uid,
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      product: String(form.get("product") || "").trim(),
      description: String(form.get("description") || "").trim(),
      createdAt: serverTimestamp()
    };

    if (
      !request.name ||
      !request.email ||
      !request.brand ||
      !request.product
    ) {
      message.textContent = "Complète les champs obligatoires.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "ENVOI EN COURS...";

    try {
      await addDoc(collection(db, "productRequests"), request);

      const sent = await sendEmail(TEMPLATE_PRODUCT_REQUEST, {
        to_email: ADMIN_EMAIL,
        customer_name: request.name,
        customer_email: request.email,
        brand: request.brand,
        product: request.product,
        description: request.description
      });

      formElement.reset();

      message.textContent = sent
        ? "Demande enregistrée et e-mail envoyé à POL BUY."
        : "Demande enregistrée dans ton compte, mais l'e-mail n'a pas été envoyé. POL BUY pourra retrouver la demande dans Firebase.";

      formElement.elements.email.value = currentUser.email || "";

    } catch (error) {
      console.error("Erreur demande produit :", error);
      message.textContent = "Erreur : " + error.message;

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "ENVOYER MA DEMANDE";
    }
  });

  loadCustomerOrders();
}

async function emailAuth(register) {
  const email = $("auth-email").value.trim();
  const password = $("auth-password").value;

  try {
    if (!email || !password) {
      throw new Error("Complète les champs.");
    }

    if (register) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }

  } catch (error) {
    $("auth-error").textContent = error.message;
  }
}

async function googleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    $("auth-error").textContent = error.message;
  }
}

async function loadCustomerOrders() {
  if (!currentUser) return;

  const target = $("customer-orders");
  if (!target) return;

  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid)
    );

    const snap = await getDocs(q);
    target.innerHTML = "";

    if (snap.empty) {
      target.textContent = "Aucune commande pour le moment.";
      return;
    }

    snap.forEach(orderDoc => {
      const order = orderDoc.data();
      const div = document.createElement("div");

      div.className = "admin-order";

      div.innerHTML = `
        <div>
          <strong>
            Commande ${escapeHTML(orderDoc.id.slice(0, 8))}
          </strong><br>

          <small>${escapeHTML(order.status)}</small><br>

          <small>
            Transporteur :
            ${escapeHTML(order.carrier || "Non renseigné")}
          </small><br>

          <small>
            Suivi :
            ${escapeHTML(order.trackingNumber || "Non renseigné")}
          </small><br>

          <small>${escapeHTML(order.trackingStatus || "")}</small><br>

          <small>
            Livraison estimée :
            ${escapeHTML(order.estimatedDelivery || "Non renseignée")}
          </small>
        </div>

        <strong>${money(order.total)}</strong>
      `;

      target.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    target.textContent = "Impossible de charger les commandes.";
  }
}

/* ADMINISTRATION : COMMANDES */

$("admin-open")?.addEventListener("click", async () => {
  if (!isAdmin()) {
    return alert("Accès réservé à l'administrateur.");
  }

  openOverlay("admin-overlay");
  await renderAdmin();
});

async function renderAdmin() {
  if (!isAdmin()) return;

  const area = $("admin-content");
  if (!area) return;

  area.innerHTML = "<p>Chargement...</p>";

  try {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );

    area.innerHTML = "";
    adminOrdersCache.clear();

    let ordersHTML = "";

    snap.forEach(orderDoc => {
      const o = orderDoc.data();
      const id = orderDoc.id;

      adminOrdersCache.set(id, o);

      const statuses = [
        "En attente de vérification du paiement",
        "Payée — paiement vérifié",
        "Préparation",
        "Expédiée",
        "Livrée",
        "Annulée"
      ];

      ordersHTML += `
        <div class="admin-order" style="display:block">
          <strong>Commande ${escapeHTML(id)}</strong>

          <p>
            Client :
            ${escapeHTML(o.customerName)}
            —
            ${escapeHTML(o.customerEmail)}
          </p>

          <p>Adresse : ${escapeHTML(o.address)}</p>

          <p>
            Articles :
            ${(o.items || []).map(i =>
              `${escapeHTML(i.name)} (${escapeHTML(i.color)}, ${escapeHTML(i.size)}) × ${Number(i.quantity)}`
            ).join("<br>")}
          </p>

          <p><strong>Total : ${money(o.total)}</strong></p>

          <p>
            Paiement vérifié :
            ${o.paymentVerified ? "Oui" : "Non"}
          </p>

          <label class="form-label">Statut</label>

          <select class="form-field" id="status-${escapeHTML(id)}">
            ${statuses.map(s =>
              `<option ${o.status === s ? "selected" : ""}>${escapeHTML(s)}</option>`
            ).join("")}
          </select>

          <label class="form-label">Transporteur</label>
          <input
            class="form-field"
            id="carrier-${escapeHTML(id)}"
            value="${escapeHTML(o.carrier || "")}"
          >

          <label class="form-label">Numéro de suivi</label>
          <input
            class="form-field"
            id="tracking-${escapeHTML(id)}"
            value="${escapeHTML(o.trackingNumber || "")}"
          >

          <label class="form-label">État du suivi</label>
          <input
            class="form-field"
            id="trackstatus-${escapeHTML(id)}"
            value="${escapeHTML(o.trackingStatus || "")}"
          >

          <label class="form-label">Localisation</label>
          <input
            class="form-field"
            id="location-${escapeHTML(id)}"
            value="${escapeHTML(o.trackingLocation || "")}"
          >

          <label class="form-label">Livraison estimée</label>
          <input
            class="form-field"
            id="delivery-${escapeHTML(id)}"
            value="${escapeHTML(o.estimatedDelivery || "")}"
          >

          <button class="primary-btn" data-save="${escapeHTML(id)}">
            ENREGISTRER
          </button>

          <button
            class="primary-btn"
            style="background:#c62828;color:white;margin-top:8px"
            data-delete-order="${escapeHTML(id)}"
          >
            SUPPRIMER LA COMMANDE
          </button>
        </div>
      `;
    });

    area.innerHTML = `
      <section>
        <h3>Commandes (${snap.size})</h3>
        ${ordersHTML || "<p>Aucune commande.</p>"}
      </section>
    `;

    area.querySelectorAll("[data-save]").forEach(button => {
      button.addEventListener("click", () =>
        saveOrderChanges(button.dataset.save)
      );
    });

    area.querySelectorAll("[data-delete-order]").forEach(button => {
      button.addEventListener("click", () =>
        deleteOrder(button.dataset.deleteOrder)
      );
    });

  } catch (error) {
    console.error(error);
    area.innerHTML =
      "Erreur de chargement : " + escapeHTML(error.message);
  }
}

/* SUPPRIMER UNE COMMANDE — AUCUNE CONDITION DE LIVRAISON */

async function deleteOrder(id) {
  if (!isAdmin()) {
    return alert("Accès refusé.");
  }

  const confirmed = confirm(
    "Veux-tu vraiment supprimer définitivement cette commande ?"
  );

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "orders", id));

    adminOrdersCache.delete(id);

    alert("Commande supprimée avec succès.");

    await renderAdmin();

  } catch (error) {
    console.error("Erreur suppression commande :", error);
    alert("Impossible de supprimer la commande : " + error.message);
  }
}

/* ENREGISTRER LES MODIFICATIONS D'UNE COMMANDE */

async function saveOrderChanges(id) {
  if (!isAdmin()) {
    return alert("Accès refusé.");
  }

  const oldOrder = adminOrdersCache.get(id);

  if (!oldOrder) {
    return alert("Commande introuvable.");
  }

  const status = $(`status-${id}`).value;

  if (
    status === "Payée — paiement vérifié" &&
    !oldOrder.paymentVerified
  ) {
    if (!confirm(
      "As-tu réellement vérifié que le paiement est arrivé sur ton compte ?"
    )) {
      return;
    }
  }

  const carrier = $(`carrier-${id}`).value.trim();
  const trackingNumber = $(`tracking-${id}`).value.trim();
  const trackingStatus = $(`trackstatus-${id}`).value.trim();
  const trackingLocation = $(`location-${id}`).value.trim();
  const estimatedDelivery = $(`delivery-${id}`).value.trim();

  const customerEmail =
    oldOrder.customerEmail || oldOrder.email || "";

  try {
    await updateDoc(doc(db, "orders", id), {
      status,
      paymentVerified: status === "Payée — paiement vérifié",
      carrier,
      trackingNumber,
      trackingStatus,
      trackingLocation,
      estimatedDelivery,
      updatedAt: serverTimestamp()
    });

    const trackingChanged =
      trackingNumber !== (oldOrder.trackingNumber || "") ||
      trackingStatus !== (oldOrder.trackingStatus || "") ||
      trackingLocation !== (oldOrder.trackingLocation || "") ||
      estimatedDelivery !== (oldOrder.estimatedDelivery || "") ||
      carrier !== (oldOrder.carrier || "");

    if (trackingChanged && (trackingNumber || trackingStatus)) {

      if (!customerEmail) {
        alert(
          "Commande enregistrée, mais aucun e-mail client n'est enregistré pour cette commande."
        );
        await renderAdmin();
        return;
      }

      const sent = await sendEmail(TEMPLATE_TRACKING, {
        to_email: customerEmail,
        customer_email: customerEmail,
        customer_name: oldOrder.customerName || "Client",
        order_id: id,
        order_status: status,
        status_message: trackingStatus || "Le suivi de votre commande a été mis à jour.",
        carrier: carrier || "À confirmer",
        tracking_number: trackingNumber || "En attente",
        tracking_status: trackingStatus || "",
        tracking_location: trackingLocation || "",
        estimated_delivery: estimatedDelivery || ""
      });

      alert(
        sent
          ? "Commande enregistrée et e-mail de suivi envoyé."
          : "Commande enregistrée, mais e-mail non envoyé. Vérifie EmailJS."
      );

    } else {
      alert("Commande mise à jour. Aucun changement de suivi détecté.");
    }

    await renderAdmin();

  } catch (error) {
    console.error("ERREUR SUIVI :", error);
    alert("Erreur : " + error.message);
  }
}

/* OUVERTURE DU PANIER ET FERMETURE DES FENÊTRES */

$("cart-open")?.addEventListener("click", () => {
  renderCart();
  openOverlay("cart-overlay");
});

function openOverlay(id) {
  $(id)?.classList.add("show");
}

function closeOverlay(id) {
  $(id)?.classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () =>
    closeOverlay(button.dataset.close)
  );
});

document.querySelectorAll(".overlay").forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      overlay.classList.remove("show");
    }
  });
});

/* CONNEXION */

onAuthStateChanged(auth, user => {
  currentUser = user;

  $("admin-open")?.classList.toggle("hidden", !isAdmin());

  if ($("account-overlay")?.classList.contains("show")) {
    renderAccount();
  }
});

/* DÉMARRAGE */

renderProducts();
saveCart();
/* ==========================================
   POL BUY — ÉVÉNEMENTS SAISONNIERS AUTOMATIQUES
   HALLOWEEN • NOËL • PÂQUES
   -40 % SUR TOUS LES ARTICLES
   LIVRAISON GRATUITE PENDANT LES ÉVÉNEMENTS
========================================== */

const seasonalEvents = {
  halloween: {
    name: "Halloween",
    emoji: "🎃",
    message: "HALLOWEEN CHEZ POL BUY",
    background: "linear-gradient(120deg, #351044, #70234f 55%, #e87518)",
    color: "#fff4df",
    accent: "#ff8a24"
  },

  christmas: {
    name: "Noël",
    emoji: "🎄",
    message: "LA MAGIE DE NOËL CHEZ POL BUY",
    background: "linear-gradient(120deg, #123d35, #176b58 55%, #245b75)",
    color: "#ffffff",
    accent: "#d8f4eb"
  },

  easter: {
    name: "Pâques",
    emoji: "🐰",
    message: "LES OFFRES DE PÂQUES CHEZ POL BUY",
    background: "linear-gradient(120deg, #f8d9e8, #e6dcff 55%, #d9f3e5)",
    color: "#49304f",
    accent: "#8c5a9e"
  }
};

let seasonalCurrentEvent = null;

const SEASONAL_DISCOUNT_RATE = 0.40;

/* ==========================================
   CALCUL DE LA DATE DE PÂQUES
========================================== */

function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day, 23, 59, 59);
}

/* ==========================================
   DÉTECTION AUTOMATIQUE DES ÉVÉNEMENTS
========================================== */

function getAutomaticSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // HALLOWEEN : tout le mois d'octobre
  if (month === 9) {
    return "halloween";
  }

  // NOËL : du 1er novembre au 31 décembre
  if (month === 10 || month === 11) {
    return "christmas";
  }

  // PÂQUES : une semaine avant jusqu'au lendemain
  const easter = getEasterDate(year);

  const start = new Date(easter);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(easter);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  if (now >= start && now <= end) {
    return "easter";
  }

  return null;
}

/* ==========================================
   RÉDUCTION ET LIVRAISON
========================================== */

// On vérifie directement la date réelle.
// Cela évite que la livraison dépende uniquement
// de l'affichage des décorations.

function getSeasonalDiscount() {
  return getAutomaticSeason()
    ? SEASONAL_DISCOUNT_RATE
    : 0;
}

function getDiscountedSubtotal() {
  const subtotal = cartSubtotal();

  return Number(
    (subtotal * (1 - getSeasonalDiscount())).toFixed(2)
  );
}

// LIVRAISON GRATUITE PENDANT CHAQUE ÉVÉNEMENT

shippingCost = function () {
  if (!cart.length) {
    return 0;
  }

  if (getAutomaticSeason() !== null) {
    return 0;
  }

  return SHIPPING_PRICE;
};

// TOTAL FINAL AVEC REMISE ET LIVRAISON

cartTotal = function () {
  return Number(
    (getDiscountedSubtotal() + shippingCost()).toFixed(2)
  );
};

/* ==========================================
   AFFICHAGE DU PANIER
========================================== */

renderCart = function () {
  const container = $("cart-items");

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = "<p>Ton panier est vide.</p>";

    $("cart-total").innerHTML = "";
    $("checkout-area").innerHTML = "";

    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-line">
      <div>
        <strong>${escapeHTML(item.name)}</strong><br>

        <small>
          ${escapeHTML(item.color)} · Taille ${escapeHTML(item.size)}
          · Qté ${Number(item.quantity)}
        </small><br>

        <strong>${money(item.price * item.quantity)}</strong>
      </div>

      <button class="small-btn" data-remove="${escapeHTML(item.key)}">
        Retirer
      </button>
    </div>
  `).join("");

  container.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      cart = cart.filter(item => item.key !== button.dataset.remove);
      saveCart();
    });
  });

  const subtotal = Number(cartSubtotal().toFixed(2));

  const discount = Number(
    (subtotal * getSeasonalDiscount()).toFixed(2)
  );

  const discountedSubtotal = getDiscountedSubtotal();
  const shipping = shippingCost();
  const total = cartTotal();

  const activeSeason = getAutomaticSeason();

  $("cart-total").innerHTML = `
    <p>
      Sous-total :
      <strong>${money(subtotal)}</strong>
    </p>

    ${discount > 0 ? `
      <p style="color:#16834a;font-weight:800">
        🎉 Réduction saisonnière de 40 % :
        <strong>−${money(discount)}</strong>
      </p>
    ` : ""}

    <p>
      Livraison :
      <strong style="color:${shipping === 0 && activeSeason ? "#16834a" : "inherit"}">
        ${shipping === 0 && activeSeason ? "GRATUITE 🎁" : money(shipping)}
      </strong>
    </p>

    ${discount > 0 ? `
      <p>
        Sous-total après réduction :
        <strong>${money(discountedSubtotal)}</strong>
      </p>
    ` : ""}

    <h3 style="font-size:22px">
      TOTAL : ${money(total)}
    </h3>
  `;

  $("checkout-area").innerHTML = `
    <div class="notice">
      ${activeSeason
        ? "🎉 OFFRE SAISONNIÈRE : −40 % ET LIVRAISON GRATUITE !"
        : "Livraison : 3,99 €"}
      <br>
      La commande reste en attente jusqu'à vérification réelle du paiement.
    </div>

    <label class="form-label">
      Adresse de livraison
    </label>

    <textarea
      id="delivery-address"
      class="form-field"
      placeholder="Nom, rue, code postal, ville, pays">
    </textarea>

    <label class="form-label">
      Téléphone (facultatif)
    </label>

    <input
      id="delivery-phone"
      class="form-field"
    >

    <a
      class="primary-btn"
      style="display:block;text-align:center;text-decoration:none"
      href="${PAYPAL_BASE}/${total.toFixed(2)}"
      target="_blank"
      rel="noopener">

      PAYER ${money(total)} AVEC PAYPAL
    </a>

    <button class="primary-btn" id="place-order">
      ENREGISTRER MA COMMANDE
    </button>
  `;

  $("place-order").addEventListener("click", placeOrder);
};

/* ==========================================
   ENREGISTREMENT DE LA COMMANDE
========================================== */

placeOrder = async function () {
  if (!currentUser) {
    alert("Connecte-toi avant de commander.");
    openAccount();
    return;
  }

  if (!cart.length) {
    return alert("Ton panier est vide.");
  }

  const address = $("delivery-address").value.trim();
  const phone = $("delivery-phone").value.trim();

  if (!address) {
    return alert("Indique ton adresse de livraison.");
  }

  // Recalcul au moment de la commande
  const activeSeason = getAutomaticSeason();

  const subtotal = Number(cartSubtotal().toFixed(2));

  const discount = Number(
    (subtotal * (activeSeason ? SEASONAL_DISCOUNT_RATE : 0)).toFixed(2)
  );

  const shipping = cart.length
    ? (activeSeason ? 0 : SHIPPING_PRICE)
    : 0;

  const total = Number(
    (subtotal - discount + shipping).toFixed(2)
  );

  const order = {
    userId: currentUser.uid,
    customerName: currentUser.displayName || currentUser.email,
    customerEmail: currentUser.email,

    address,
    phone,

    items: cart.map(item => ({ ...item })),

    subtotal,
    discount,
    discountRate: activeSeason ? SEASONAL_DISCOUNT_RATE : 0,
    seasonalEvent: activeSeason || "",

    shipping,
    total,

    paymentMethod: "PayPal",
    paymentVerified: false,
    status: "En attente de vérification du paiement",

    carrier: "",
    trackingNumber: "",
    trackingStatus: "",
    trackingLocation: "",
    estimatedDelivery: "",

    createdAt: serverTimestamp()
  };

  try {
    const result = await addDoc(collection(db, "orders"), order);

    cart = [];

    saveCart();

    closeOverlay("cart-overlay");

    alert(
      "Commande enregistrée : " + result.id +
      "\nTotal : " + money(total) +
      "\nLe paiement reste à vérifier manuellement."
    );

    openAccount();

  } catch (error) {
    console.error(error);

    alert(
      "Erreur lors de l'enregistrement : " + error.message
    );
  }
};

/* ==========================================
   STYLES DES SAISONS
========================================== */

function installSeasonalStyles() {
  if (document.getElementById("pol-seasonal-styles")) return;

  const style = document.createElement("style");

  style.id = "pol-seasonal-styles";

  style.textContent = `

    #pol-season-banner {
      display: none;
      position: relative;
      isolation: isolate;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
      padding: 26px 18px;
      text-align: center;
      font-size: clamp(20px, 3vw, 30px);
      font-weight: 900;
      letter-spacing: 1px;
      border-bottom: 4px solid var(--pol-season-accent, #fff);
    }

    #pol-season-banner .pol-season-subtitle {
      display: block;
      margin-top: 9px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    #pol-season-scene {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 997;
      pointer-events: none;
      overflow: hidden;
    }

    #pol-season-scene .pol-scene-corner {
      position: absolute;
      font-size: clamp(38px, 6vw, 76px);
      opacity: .95;
      filter: drop-shadow(0 4px 5px #0002);
    }

    #pol-season-scene .pol-scene-left {
      left: 12px;
      top: 105px;
    }

    #pol-season-scene .pol-scene-right {
      right: 12px;
      top: 105px;
    }

    /* FLOCONS QUI TOMBENT */

    #pol-season-scene .pol-snow {
      position: absolute;
      top: -50px;
      color: #fff;
      text-shadow: 0 1px 5px #7aa9c9;
      line-height: 1;
      opacity: .95;
      animation-name: polSnowFall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    @keyframes polSnowFall {
      0% {
        transform: translateY(-10vh) rotate(0deg);
      }

      100% {
        transform: translateY(115vh) rotate(360deg);
      }
    }

    #pol-holiday-countdown {
      position: fixed;
      left: 14px;
      bottom: 14px;
      z-index: 996;
      padding: 10px 14px;
      border-radius: 12px;
      background: #182b36;
      color: white;
      border: 1px solid #ffffff55;
      box-shadow: 0 5px 20px #0002;
      font-size: 12px;
      font-weight: 700;
    }

    .pol-season-product-tag {
      display: inline-block;
      margin: 8px 0;
      padding: 6px 10px;
      border-radius: 7px;
      background: #167747;
      color: white;
      font-weight: 900;
    }

    @media (max-width: 600px) {
      #pol-holiday-countdown {
        left: 8px;
        bottom: 8px;
        font-size: 11px;
      }

      #pol-season-scene .pol-scene-left {
        left: 3px;
      }

      #pol-season-scene .pol-scene-right {
        right: 3px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================
   CRÉATION DES ÉLÉMENTS
========================================== */

function createSeasonalElements() {
  if (!$("pol-season-banner")) {
    const banner = document.createElement("div");

    banner.id = "pol-season-banner";

    document.body.prepend(banner);
  }

  if (!$("pol-season-scene")) {
    const scene = document.createElement("div");

    scene.id = "pol-season-scene";

    document.body.appendChild(scene);
  }

  if (!$("pol-holiday-countdown")) {
    const countdown = document.createElement("div");

    countdown.id = "pol-holiday-countdown";

    document.body.appendChild(countdown);
  }
}

/* ==========================================
   APPLICATION AUTOMATIQUE DES DÉCORATIONS
========================================== */

function applySeasonalEvent() {
  const banner = $("pol-season-banner");
  const scene = $("pol-season-scene");

  if (!banner || !scene) return;

  seasonalCurrentEvent = getAutomaticSeason();

  document.documentElement.removeAttribute("data-pol-season");

  scene.innerHTML = "";

  document.querySelectorAll(".pol-season-product-tag")
    .forEach(tag => tag.remove());

  if (!seasonalCurrentEvent) {
    banner.style.display = "none";
    scene.style.display = "none";

    return;
  }

  const event = seasonalEvents[seasonalCurrentEvent];

  document.documentElement.dataset.polSeason = seasonalCurrentEvent;

  banner.style.display = "block";
  banner.style.background = event.background;
  banner.style.color = event.color;

  banner.style.setProperty(
    "--pol-season-accent",
    event.accent
  );

  banner.innerHTML = `
    ${event.emoji} ${event.message} ${event.emoji}

    <span class="pol-season-subtitle">
      −40 % SUR TOUS LES ARTICLES • LIVRAISON GRATUITE
    </span>
  `;

  scene.style.display = "block";

  /* HALLOWEEN */

  if (seasonalCurrentEvent === "halloween") {
    scene.innerHTML = `
      <span class="pol-scene-corner pol-scene-left">🕸️</span>
      <span class="pol-scene-corner pol-scene-right">🦇</span>

      <span class="pol-scene-corner"
        style="left:12px;bottom:35px">
        🎃
      </span>

      <span class="pol-scene-corner"
        style="right:12px;bottom:35px">
        🕷️
      </span>
    `;
  }

  /* NOËL */

  if (seasonalCurrentEvent === "christmas") {
    const flakes = Array.from({ length: 40 }, (_, i) => {
      const left = (i * 37 + 7) % 100;
      const size = 12 + (i % 5) * 4;
      const duration = 7 + (i % 8) * 1.5;
      const delay = (i % 10) * -1.7;

      return `
        <span
          class="pol-snow"
          style="
            left:${left}%;
            font-size:${size}px;
            animation-duration:${duration}s;
            animation-delay:${delay}s;
          ">
          ❄
        </span>
      `;
    }).join("");

    scene.innerHTML = flakes + `

      <span class="pol-scene-corner pol-scene-left">
        🎄
      </span>

      <span class="pol-scene-corner pol-scene-right">
        🎁
      </span>

      <span class="pol-scene-corner"
        style="left:12px;bottom:35px">
        🎁
      </span>

      <span class="pol-scene-corner"
        style="right:12px;bottom:35px">
        🎄
      </span>
    `;
  }

  /* PÂQUES */

  if (seasonalCurrentEvent === "easter") {
    scene.innerHTML = `

      <span class="pol-scene-corner pol-scene-left">
        🐰
      </span>

      <span class="pol-scene-corner pol-scene-right">
        🐣
      </span>

      <span class="pol-scene-corner"
        style="left:12px;bottom:35px">
        🥚
      </span>

      <span class="pol-scene-corner"
        style="right:12px;bottom:35px">
        🌷
      </span>
    `;
  }

  /* ÉTIQUETTES SUR LES PRODUITS */

  document.querySelectorAll(".product-card").forEach(card => {
    const tag = document.createElement("div");

    tag.className = "pol-season-product-tag";

    tag.textContent = "−40 % OFFRE SAISONNIÈRE";

    card.appendChild(tag);
  });
}

/* ==========================================
   COMPTE À REBOURS
========================================== */

function getNextHoliday() {
  const now = new Date();
  const year = now.getFullYear();

  const dates = [
    {
      key: "halloween",
      date: new Date(year, 9, 31, 23, 59, 59)
    },
    {
      key: "christmas",
      date: new Date(year, 11, 25, 23, 59, 59)
    },
    {
      key: "easter",
      date: getEasterDate(year)
    }
  ];

  for (const item of dates) {
    if (item.date <= now) {
      item.date = item.key === "easter"
        ? getEasterDate(year + 1)
        : new Date(
            year + 1,
            item.key === "halloween" ? 9 : 11,
            item.key === "halloween" ? 31 : 25,
            23, 59, 59
          );
    }
  }

  dates.sort((a, b) => a.date - b.date);

  return dates[0];
}

function updateHolidayCountdown() {
  const target = $("pol-holiday-countdown");

  if (!target) return;

  const next = getNextHoliday();

  const difference = Math.max(
    0,
    next.date.getTime() - Date.now()
  );

  const days = Math.floor(difference / 86400000);

  const hours = Math.floor(
    (difference % 86400000) / 3600000
  );

  const minutes = Math.floor(
    (difference % 3600000) / 60000
  );

  const seconds = Math.floor(
    (difference % 60000) / 1000
  );

  target.textContent =
    `${seasonalEvents[next.key].emoji} ${seasonalEvents[next.key].name} : ` +
    `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

/* ==========================================
   DÉMARRAGE AUTOMATIQUE
========================================== */

function startPOLBuyEvents() {
  installSeasonalStyles();

  createSeasonalElements();

  applySeasonalEvent();

  updateHolidayCountdown();

  // Actualise aussi le panier au démarrage
  renderCart();

  // Vérifie régulièrement si la saison a changé
  setInterval(() => {
    updateHolidayCountdown();

    const currentSeason = getAutomaticSeason();

    if (currentSeason !== seasonalCurrentEvent) {
      applySeasonalEvent();
      renderCart();
    }
  }, 1000);
}

startPOLBuyEvents();
