const PAYPAL_URL = "https://www.paypal.com/paypalme/SH0PNOVA/";
const OWNER_EMAIL = "pc2alex.les@gmail.com";

const $ = selector => document.querySelector(selector);
const money = n => new Intl.NumberFormat("fr-FR", {
  style:"currency", currency:"EUR"
}).format(n);

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[c]);
}

let products = load("polbuy_products", [
  {id:1,name:"Veste exemple",brand:"CP Company",price:79.99,category:"adulte",sizes:["S","M","L","XL"],stock:8},
  {id:2,name:"Sweat exemple",brand:"Nike",price:49.99,category:"enfant",sizes:["S","M","L","XL"],stock:12},
  {id:3,name:"T-shirt exemple",brand:"Stone Island",price:34.99,category:"adulte",sizes:["XS","S","M","L","XL","XXL","XXXL"],stock:6},
  {id:4,name:"Ensemble exemple",brand:"Under Armour",price:39.99,category:"enfant",sizes:["S","M","L","XL"],stock:5}
]);

let cart = load("polbuy_cart", []);
let selectedProduct = null;

function persist() {
  save("polbuy_products", products);
  save("polbuy_cart", cart);
}

function openDrawer(id) {
  $("#overlay").classList.add("open");
  $(id).classList.add("open");
}

function closeAll() {
  $("#overlay").classList.remove("open");
  document.querySelectorAll(".drawer,.modal").forEach(el => el.classList.remove("open"));
}

$("#overlay").onclick = closeAll;
document.addEventListener("click", e => {
  if (e.target.matches("[data-close]")) closeAll();
});

$("#year").textContent = new Date().getFullYear();

$("#cartBtn").onclick = () => {
  renderCart();
  openDrawer("#cartDrawer");
};
$("#accountBtn").onclick = () => openDrawer("#accountDrawer");

function renderProducts(filter = "tous") {
  const list = products.filter(p => filter === "tous" || p.category === filter);

  $("#productGrid").innerHTML = list.length
    ? list.map(p => `
      <article class="product">
        <div class="product-image"></div>
        <div class="product-info">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.brand)} · ${p.category === "enfant" ? "Enfant" : "Adulte"}</p>
          <div class="product-bottom">
            <strong>${money(Number(p.price))}</strong>
            <button data-product="${p.id}">Voir</button>
          </div>
        </div>
      </article>
    `).join("")
    : "<p>Aucun article disponible.</p>";
}

$("#productGrid").addEventListener("click", e => {
  const button = e.target.closest("[data-product]");
  if (button) showProduct(Number(button.dataset.product));
});

$("#filterSelect").onchange = e => renderProducts(e.target.value);

document.querySelectorAll("[data-filter]").forEach(link => {
  link.onclick = () => {
    $("#filterSelect").value = link.dataset.filter;
    renderProducts(link.dataset.filter);
  };
});

function showProduct(id) {
  selectedProduct = products.find(p => p.id === id);
  if (!selectedProduct) return;

  const p = selectedProduct;

  $("#productModalContent").innerHTML = `
    <div class="eyebrow">${esc(p.brand)}</div>
    <h2>${esc(p.name)}</h2>
    <p>${money(Number(p.price))}</p>
    <p class="subtitle">Stock disponible : ${Number(p.stock)}</p>
    <p class="subtitle">Choisissez une taille :</p>
    <div class="sizes">
      ${p.sizes.map((size, i) => `
        <button class="${i === 0 ? "selected" : ""}" data-size="${esc(size)}">${esc(size)}</button>
      `).join("")}
    </div>
    <button class="btn" id="addToCart">Ajouter au panier</button>
  `;

  $("#productModalContent").querySelectorAll("[data-size]").forEach(button => {
    button.onclick = () => {
      $("#productModalContent").querySelectorAll("[data-size]").forEach(b => b.classList.remove("selected"));
      button.classList.add("selected");
    };
  });

  $("#addToCart").onclick = () => {
    const size = $("#productModalContent .sizes .selected")?.dataset.size;
    if (!size) return alert("Choisissez une taille.");

    const existing = cart.find(x => x.id === p.id && x.size === size);
    if (existing) existing.qty++;
    else cart.push({id:p.id, size, qty:1});

    persist();
    renderCart();
    closeAll();
  };

  $("#productModal").classList.add("open");
}

function getTotals() {
  const subtotal = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + (product ? Number(product.price) * item.qty : 0);
  }, 0);

  const shipping = subtotal >= 24.99 || subtotal === 0 ? 0 : 3.99;
  return {subtotal, shipping, total:subtotal + shipping};
}

function renderCart() {
  cart = cart.filter(item => products.some(p => p.id === item.id));
  const totals = getTotals();

  $("#cartItems").innerHTML = cart.length
    ? cart.map(item => {
      const p = products.find(x => x.id === item.id);
      return `
        <div class="cart-line">
          <div>
            <strong>${esc(p.name)}</strong><br>
            ${esc(item.size)} · ${money(p.price)}
            <br>
            <button data-dec="${p.id}" data-size="${esc(item.size)}">−</button>
            ${item.qty}
            <button data-inc="${p.id}" data-size="${esc(item.size)}">+</button>
          </div>
          <strong>${money(p.price * item.qty)}</strong>
        </div>
      `;
    }).join("")
    : "<p>Votre panier est vide.</p>";

  $("#subtotal").textContent = money(totals.subtotal);
  $("#shippingPrice").textContent = totals.shipping ? money(totals.shipping) : "Offerte";
  $("#grandTotal").textContent = money(totals.total);
  $("#cartCount").textContent = cart.reduce((n, item) => n + item.qty, 0);
}

$("#cartItems").addEventListener("click", e => {
  const button = e.target.closest("[data-inc],[data-dec]");
  if (!button) return;

  const id = Number(button.dataset.inc || button.dataset.dec);
  const item = cart.find(x => x.id === id && x.size === button.dataset.size);
  if (!item) return;

  if (button.dataset.inc) item.qty++;
  else item.qty--;

  cart = cart.filter(x => x.qty > 0);
  persist();
  renderCart();
});

$("#checkoutBtn").onclick = () => {
  if (!cart.length) return alert("Votre panier est vide.");
  closeAll();
  $("#checkoutModal").classList.add("open");
};

$("#paypalBtn").onclick = () => {
  const fields = ["firstName","lastName","address","postal","city","country"];

  for (const id of fields) {
    if (!$("#" + id).value.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      $("#" + id).focus();
      return;
    }
  }

  const totals = getTotals();
  const order = {
    id:"PB-" + Date.now(),
    date:new Date().toISOString(),
    items:cart,
    subtotal:totals.subtotal,
    shipping:totals.shipping,
    total:totals.total,
    address:Object.fromEntries(
      ["firstName","lastName","address","postal","city","country","phone"]
      .map(id => [id, $("#" + id).value.trim()])
    ),
    status:"En attente de vérification du paiement"
  };

  const orders = load("polbuy_orders", []);
  orders.unshift(order);
  save("polbuy_orders", orders);

  const amount = totals.total.toFixed(2);
  window.open(PAYPAL_URL + amount, "_blank", "noopener");

  alert("Commande enregistrée dans cette démonstration. Le paiement doit être vérifié dans PayPal avant de confirmer la commande.");

  cart = [];
  persist();
  renderCart();
  closeAll();
};

$("#demoLogin").onclick = () => {
  const email = $("#accountEmail").value.trim();
  if (!email) return alert("Entrez votre adresse e-mail.");

  save("polbuy_demo_user", {email});
  $("#accountInfo").innerHTML = `<p class="notice">Session de démonstration : ${esc(email)}</p>`;
  alert("Connexion de démonstration uniquement. Firebase sera nécessaire pour une vraie connexion.");
};

$("#googleLogin").onclick = () => {
  alert("La connexion Google sera activée après configuration de Firebase.");
};

function showForm(title, fields, submitText, handler) {
  $("#formModalContent").innerHTML = `
    <h2>${title}</h2>
    ${fields}
    <button class="btn" id="formSubmit">${submitText}</button>
  `;

  $("#formSubmit").onclick = () => {
    if (handler()) closeAll();
  };

  $("#formModal").classList.add("open");
}

$("#requestProductBtn").onclick = () => showForm(
  "Demander un produit",
  `
    <div class="field"><label>Marque</label><input id="rqBrand"></div>
    <div class="field"><label>Nom du produit</label><input id="rqName"></div>
    <div class="field"><label>Description ou lien</label><textarea id="rqDesc"></textarea></div>
    <div class="field"><label>Votre e-mail</label><input id="rqEmail" type="email"></div>
  `,
  "Envoyer la demande",
  () => {
    const request = {
      brand:$("#rqBrand").value,
      name:$("#rqName").value,
      description:$("#rqDesc").value,
      email:$("#rqEmail").value,
      date:new Date().toISOString()
    };

    if (!request.brand || !request.name || !request.email) {
      alert("Remplissez les champs obligatoires.");
      return false;
    }

    const requests = load("polbuy_requests", []);
    requests.unshift(request);
    save("polbuy_requests", requests);

    alert("Demande enregistrée localement. L'envoi réel à " + OWNER_EMAIL + " nécessitera un service e-mail.");
    return true;
  }
);

$("#refundBtn").onclick = () => showForm(
  "Demander un remboursement",
  `
    <div class="field"><label>Numéro de commande</label><input id="rfOrder"></div>
    <div class="field"><label>Motif</label>
      <select id="rfReason">
        <option>Article non reçu</option>
        <option>Article défectueux</option>
        <option>Mauvaise taille</option>
        <option>Autre</option>
      </select>
    </div>
    <div class="field"><label>Détails</label><textarea id="rfDetails"></textarea></div>
    <div class="field"><label>Votre e-mail</label><input id="rfEmail" type="email"></div>
  `,
  "Envoyer la demande",
  () => {
    const request = {
      order:$("#rfOrder").value,
      reason:$("#rfReason").value,
      details:$("#rfDetails").value,
      email:$("#rfEmail").value,
      date:new Date().toISOString(),
      status:"À examiner"
    };

    if (!request.order || !request.email) {
      alert("Indiquez la commande et votre e-mail.");
      return false;
    }

    const refunds = load("polbuy_refunds", []);
    refunds.unshift(request);
    save("polbuy_refunds", refunds);

    alert("Demande enregistrée. Le vendeur devra l'examiner.");
    return true;
  }
);

$("#adminLoginBtn").onclick = () => {
  const email = prompt("Adresse e-mail administrateur :");

  if (email !== OWNER_EMAIL) {
    alert("Accès refusé.");
    return;
  }

  $("#adminArea").classList.add("open");
  closeAll();
  renderAdmin();
  $("#adminArea").scrollIntoView({behavior:"smooth"});
};

$("#addProductBtn").onclick = () => showForm(
  "Ajouter un produit",
  `
    <div class="field"><label>Nom</label><input id="pName"></div>
    <div class="field"><label>Marque</label>
      <select id="pBrand">
        <option>CP Company</option>
        <option>Stone Island</option>
        <option>Nike</option>
        <option>Under Armour</option>
      </select>
    </div>
    <div class="field"><label>Prix (€)</label><input id="pPrice" type="number" min="0" step="0.01"></div>
    <div class="field"><label>Collection</label>
      <select id="pCategory">
        <option value="adulte">Adulte</option>
        <option value="enfant">Enfant</option>
      </select>
    </div>
    <div class="field"><label>Tailles séparées par des virgules</label><input id="pSizes" value="S, M, L, XL"></div>
    <div class="field"><label>Stock</label><input id="pStock" type="number" min="0" value="1"></div>
  `,
  "Enregistrer le produit",
  () => {
    const product = {
      id:Date.now(),
      name:$("#pName").value,
      brand:$("#pBrand").value,
      price:Number($("#pPrice").value),
      category:$("#pCategory").value,
      sizes:$("#pSizes").value.split(",").map(x => x.trim()).filter(Boolean),
      stock:Number($("#pStock").value)
    };

    if (!product.name || product.price <= 0 || !product.sizes.length) {
      alert("Complétez le nom, le prix et les tailles.");
      return false;
    }

    products.unshift(product);
    persist();
    renderProducts($("#filterSelect").value);
    renderAdmin();
    return true;
  }
);

$("#ordersBtn").onclick = () => {
  const orders = load("polbuy_orders", []);

  $("#adminContent").innerHTML = "<h3>Commandes</h3>" + (
    orders.length
      ? orders.map(order => `
        <div class="admin-item">
          <strong>${esc(order.id)}</strong><br>
          ${esc(order.address.firstName)} ${esc(order.address.lastName)}<br>
          ${esc(order.address.address)}, ${esc(order.address.postal)}
          ${esc(order.address.city)}, ${esc(order.address.country)}<br>
          Total : ${money(order.total)}<br>
          Statut : ${esc(order.status)}
        </div>
      `).join("")
      : "<p>Aucune commande.</p>"
  );
};

function renderAdmin() {
  $("#adminContent").innerHTML = "<h3>Produits</h3>" + products.map(p => `
    <div class="admin-item">
      <strong>${esc(p.name)}</strong> — ${money(p.price)}
      · Stock : ${p.stock}
      <br>
      <button data-delete="${p.id}">Supprimer</button>
    </div>
  `).join("");
}

$("#adminContent").addEventListener("click", e => {
  const button = e.target.closest("[data-delete]");
  if (!button) return;

  if (confirm("Supprimer cet article ?")) {
    products = products.filter(p => p.id !== Number(button.dataset.delete));
    persist();
    renderProducts($("#filterSelect").value);
    renderAdmin();
  }
});

renderProducts();
renderCart();
