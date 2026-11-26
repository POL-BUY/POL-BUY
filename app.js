
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

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
const SHIPPING_PRICE = 3.99;
const FREE_SHIPPING_FROM = 24.99;

let currentUser = null;
let cart = JSON.parse(localStorage.getItem("polbuy-cart") || "[]");

const $ = id => document.getElementById(id);
const money = n => Number(n).toFixed(2).replace(".", ",") + " €";
const isAdmin = () =>
  currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function openOverlay(id) {
  $(id)?.classList.add("show");
}

function closeOverlay(id) {
  $(id)?.classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeOverlay(button.dataset.close));
});

document.querySelectorAll(".overlay").forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) overlay.classList.remove("show");
  });
});

/* PANIER */

function cartSubtotal() {
  return cart.reduce((total, item) => {
    return total + Number(item.price) * Number(item.quantity);
  }, 0);
}

function shippingCost() {
  if (cart.length === 0 || cartSubtotal() >= FREE_SHIPPING_FROM) return 0;
  return SHIPPING_PRICE;
}

function cartTotal() {
  return Number((cartSubtotal() + shippingCost()).toFixed(2));
}

function paypalPaymentUrl() {
  const amount = cartTotal().toFixed(2);
  return `${PAYPAL_BASE}/${amount}`;
}

function saveCart() {
  localStorage.setItem("polbuy-cart", JSON.stringify(cart));

  const count = cart.reduce((total, item) => total + item.quantity, 0);
  if ($("cart-count")) $("cart-count").textContent = count;

  renderCart();
}

function renderCart() {
  const container = $("cart-items");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Ton panier est vide.</p>";
    $("cart-total").innerHTML = "";
    $("checkout-area").innerHTML = "";
    return;
  }

  cart.forEach(item => {
    const line = document.createElement("div");
    line.className = "cart-line";

    line.innerHTML = `
      <div>
        <strong>${escapeHTML(item.name)}</strong><br>
        <small>
          ${escapeHTML(item.color)} · Taille ${escapeHTML(item.size)}
          · Quantité ${Number(item.quantity)}
        </small><br>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
      <button class="small-btn" data-remove="${escapeHTML(item.key)}">
        Retirer
      </button>
    `;

    container.appendChild(line);
  });

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
    <p>Livraison : <strong>${shipping === 0 ? "Offerte" : money(shipping)}</strong></p>
    <h3 style="color:#123c2d">TOTAL : ${money(total)}</h3>
  `;

  $("checkout-area").innerHTML = `
    <div class="notice">
      Le montant PayPal sera prérempli avec le total de ton panier.
      La commande reste en attente jusqu'à vérification réelle du paiement.
    </div>

    <label class="form-label">Adresse de livraison</label>
    <textarea
      id="delivery-address"
      class="form-field"
      placeholder="Nom, rue, code postal, ville, pays"
      required
    ></textarea>

    <label class="form-label">Téléphone (facultatif)</label>
    <input
      id="delivery-phone"
      class="form-field"
      placeholder="Téléphone"
    >

    <a
      id="paypal-button"
      href="${paypalPaymentUrl()}"
      target="_blank"
      rel="noopener noreferrer"
      class="primary-btn"
      style="display:block;text-align:center;text-decoration:none"
    >
      PAYER ${money(total)} AVEC PAYPAL
    </a>

    <button class="primary-btn" id="place-order">
      ENREGISTRER MA COMMANDE
    </button>
  `;

  $("place-order").addEventListener("click", placeOrder);
}

/* COMMANDE */

async function placeOrder() {
  if (!currentUser) {
    alert("Connecte-toi à ton compte avant de commander.");
    closeOverlay("cart-overlay");
    openAccount();
    return;
  }

  if (cart.length === 0) {
    alert("Ton panier est vide.");
    return;
  }

  const address = $("delivery-address").value.trim();
  const phone = $("delivery-phone").value.trim();

  if (!address) {
    alert("Indique ton adresse de livraison.");
    return;
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
    items: cart.map(item => ({
      productId: String(item.productId),
      name: String(item.name),
      brand: String(item.brand),
      color: String(item.color),
      size: String(item.size),
      price: Number(item.price),
      quantity: Number(item.quantity)
    })),
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

    alert(
      "Commande enregistrée ! Référence : " + result.id +
      "\nTotal : " + money(total) +
      "\nLe paiement sera vérifié manuellement."
    );

    cart = [];
    saveCart();
    closeOverlay("cart-overlay");
    openAccount();
  } catch (error) {
    console.error("Erreur commande :", error);
    alert("Erreur lors de l'enregistrement : " + error.message);
  }
}

/* COMPTE CLIENT */

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

      <button class="primary-btn" id="login-btn">SE CONNECTER</button>
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
    <p>Connecté avec : ${escapeHTML(currentUser.email)}</p>
    <h3>Mes commandes</h3>
    <div id="customer-orders">Chargement...</div>
    <button class="primary-btn" id="logout-btn">SE DÉCONNECTER</button>
  `;

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
    if (!email || !password) throw new Error("Complète les deux champs.");

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
          <strong>Commande ${orderDoc.id.slice(0, 8)}</strong><br>
          <small>${escapeHTML(order.status)}</small><br>
          <small>${escapeHTML(order.carrier || "Transporteur non renseigné")}</small><br>
          <small>${escapeHTML(order.trackingNumber || "")}</small><br>
          <small>${escapeHTML(order.trackingStatus || "")}</small><br>
          <small>Livraison estimée : ${escapeHTML(order.estimatedDelivery || "Non renseignée")}</small>
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

/* ADMINISTRATION */

$("admin-open")?.addEventListener("click", async () => {
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
  area.innerHTML = "<p>Chargement...</p>";

  try {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );

    area.innerHTML = "";

    if (snap.empty) {
      area.textContent = "Aucune commande.";
      return;
    }

    snap.forEach(orderDoc => {
      const o = orderDoc.data();
      const id = orderDoc.id;
      const card = document.createElement("div");

      card.style.cssText = "border:1px solid #e8ebe6;padding:17px;margin:15px 0";

      card.innerHTML = `
        <strong>Commande ${escapeHTML(id)}</strong>
        <p>Client : ${escapeHTML(o.customerName)} — ${escapeHTML(o.customerEmail)}</p>
        <p>Adresse : ${escapeHTML(o.address)}</p>
        <p>Articles : ${(o.items || []).map(item =>
          `${escapeHTML(item.name)} (${escapeHTML(item.color)}, ${escapeHTML(item.size)}) × ${Number(item.quantity)}`
        ).join("<br>")}</p>
        <p><strong>Total : ${money(o.total)}</strong></p>
        <p>Paiement vérifié : ${o.paymentVerified ? "Oui" : "Non"}</p>

        <label class="form-label">Statut</label>
        <select class="form-field" id="status-${id}">
          ${[
            "En attente de vérification du paiement",
            "Payée — paiement vérifié",
            "Préparation",
            "Expédiée",
            "Livrée",
            "Annulée"
          ].map(status =>
            `<option ${o.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>

        <label class="form-label">Transporteur</label>
        <input class="form-field" id="carrier-${id}" value="${escapeHTML(o.carrier || "")}">

        <label class="form-label">Numéro de suivi</label>
        <input class="form-field" id="tracking-${id}" value="${escapeHTML(o.trackingNumber || "")}">

        <label class="form-label">État du suivi</label>
        <input class="form-field" id="trackstatus-${id}" value="${escapeHTML(o.trackingStatus || "")}">

        <label class="form-label">Localisation</label>
        <input class="form-field" id="location-${id}" value="${escapeHTML(o.trackingLocation || "")}">

        <label class="form-label">Livraison estimée</label>
        <input class="form-field" id="delivery-${id}" value="${escapeHTML(o.estimatedDelivery || "")}">

        <button class="primary-btn" data-save="${id}">ENREGISTRER</button>
      `;

      area.appendChild(card);
    });

    area.querySelectorAll("[data-save]").forEach(button => {
      button.addEventListener("click", () => saveOrderChanges(button.dataset.save));
    });
  } catch (error) {
    console.error(error);
    area.textContent = "Erreur de chargement des commandes.";
  }
}

async function saveOrderChanges(id) {
  if (!isAdmin()) {
    alert("Accès refusé.");
    return;
  }

  const status = $(`status-${id}`).value;

  if (
    status === "Payée — paiement vérifié" &&
    !confirm("As-tu réellement vérifié que le paiement est arrivé sur ton compte ?")
  ) {
    return;
  }

  try {
    await updateDoc(doc(db, "orders", id), {
      status,
      paymentVerified: status === "Payée — paiement vérifié",
      carrier: $(`carrier-${id}`).value.trim(),
      trackingNumber: $(`tracking-${id}`).value.trim(),
      trackingStatus: $(`trackstatus-${id}`).value.trim(),
      trackingLocation: $(`location-${id}`).value.trim(),
      estimatedDelivery: $(`delivery-${id}`).value.trim(),
      updatedAt: serverTimestamp()
    });

    alert("Commande mise à jour.");
    await renderAdmin();
  } catch (error) {
    console.error(error);
    alert("Erreur : " + error.message);
  }
}

/* DEMANDE D'ARTICLE */

$("request-form")?.addEventListener("submit", async event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  const request = {
    name: String(form.get("name") || "").trim(),
    email: String(form.get("email") || "").trim(),
    brand: String(form.get("brand") || "").trim(),
    product: String(form.get("product") || "").trim(),
    description: String(form.get("description") || "").trim(),
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "productRequests"), request);

    $("request-message").innerHTML =
      '<div class="notice">Merci ! Ta demande a bien été envoyée.</div>';

    event.currentTarget.reset();
  } catch (error) {
    console.error("Erreur demande produit :", error);

    $("request-message").innerHTML =
      `<div class="notice">Échec de l'envoi : ${escapeHTML(error.code || error.message)}</div>`;
  }
});

/* OUVERTURE DU PANIER */

$("cart-open")?.addEventListener("click", () => {
  renderCart();
  openOverlay("cart-overlay");
});

/* ÉTAT DE CONNEXION */

onAuthStateChanged(auth, user => {
  currentUser = user;

  if ($("admin-open")) {
    $("admin-open").classList.toggle("hidden", !isAdmin());
  }

  if ($("account-overlay")?.classList.contains("show")) {
    renderAccount();
  }
});

saveCart();
