
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,updateProfile} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {getFirestore,collection,addDoc,getDocs,query,where,doc,updateDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const firebaseConfig={
  apiKey:'AIzaSyCBp4GR4awpeBCHsO3r8kwo_tWHI07A',
  authDomain:'pol-buy.firebaseapp.com',
  projectId:'pol-buy',
  storageBucket:'pol-buy.firebasestorage.app',
  messagingSenderId:'751839715611',
  appId:'1:751839715611:web:0a704117974f2e9c31f3be',
  measurementId:'G-7795QRHNRP'
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const OWNER='pol.buy.off@gmail.com';

const EJS={
  service:'service_u1tqxtl',
  order:'template_8eqf2pr',
  tracking:'template_vr7m9e7',
  key:'x2MvJKVWxwA6DG6Mg'
};

const u='https://underarmour.scene7.com/is/image/Underarmour/';
const ua=(code,view)=>`${u}PS1363284-${code}_${view}?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0`;

const PRODUCTS=[
{id:'n1',brand:'Nike',category:'Nike',name:'AROSWFT – Pantalon de survêtement black',price:6.45,colors:['Noir'],sizes:'adult',images:['https://img01.ztat.net/article/spp-media-p1/69d82f5926a146be8b4be90ba840fe2e/09884b8ce44240ec9908a752214e2f36.jpg?imwidth=1800']},

{id:'n2',brand:'Nike',category:'Nike',name:'Pantalon de running Nike Trail',price:7.35,colors:['Selon photo'],sizes:'adult',images:['https://media.intersport.fr/is/image/intersportfr/DX0855_0SX_FA?$product_grey$&layer=comp&fit=constrain,0&$produit_xl$&fmt=webp']},

{id:'n3',brand:'Nike',category:'Nike',name:'Running Nike Division',price:9.56,colors:['Selon photo'],sizes:'adult',images:['https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75']},

{
id:'n4',
brand:'Nike',
category:'Nike',
name:'Haut zip Nike Running Division',
price:4,
colors:['Noir','Vert menthe/bleu'],
colorPrices:{'Noir':4,'Vert menthe/bleu':7.83},
sizes:'adult',
gallery:{
  'Noir':[
    'https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779',
    'https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779'
  ],
  'Vert menthe/bleu':[
    'https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807',
    'https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808'
  ]
}},

{
id:'n5',
brand:'Nike',
category:'Nike',
name:'Ensemble Nike Division',
price:11.35,
colors:['Noir','Noir et menthe/bleu'],
colorPrices:{'Noir':11.35,'Noir et menthe/bleu':13.65},
sizes:'adult',
gallery:{
  'Noir':[
    'https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75',
    'https://tonrunning.com/cdn/shop/files/FCF8F5AA-A5D3-47B5-A420-4518C27DAE1E_2048x2048.png?v=1790045779',
    'https://tonrunning.com/cdn/shop/files/38214FDF-2C59-4BBE-A3CE-3884740D0C8E_2048x2048.png?v=1790045779'
  ],
  'Noir et menthe/bleu':[
    'https://fast-shop.app/_next/image?url=https%3A%2F%2Fi.ibb.co%2F5hzqCm5P%2F05c9d4879eb3.jpg&w=1920&q=75',
    'https://tonrunning.com/cdn/shop/files/CF4771F7-120D-4173-A1CD-130BB07D3885_2048x2048.png?v=1790045807',
    'https://tonrunning.com/cdn/shop/files/593A4D9B-254F-4F7F-B050-DA47238642BA_2048x2048.png?v=1790045808'
  ]
}},

{id:'n6',brand:'Nike',category:'Nike',name:'Pantalon Nike Phenom Elite Tokyo',price:5.35,colors:['Noir'],sizes:'adult',images:['https://i1.t4s.cz/products/dh1483-010/nike-phenom-elite-tokyo-men-s-knit-running-pants-381819-dh1483-011-960.webp']},

{
id:'n7',
brand:'Nike',
category:'Nike',
name:'Ensemble Nike Running été – short et t-shirt',
price:2.56,
colors:['Bleu','Rose','Noir'],
sizes:'adult',
gallery:{
  'Bleu':['https://dropcityparis.com/cdn/shop/files/photopageproduitnikeetebleu.png?v=1782133267'],
  'Rose':['https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_rose.png?v=1782133321'],
  'Noir':['https://dropcityparis.com/cdn/shop/files/photo_page_produit_nike_ete_noir.png?v=1782133367']
}},

{
id:'n8',
brand:'Nike',
category:'Nike',
name:'Veste Brésil Itaú',
price:14.45,
colors:['Noir','Rose','Beige','Vert'],
sizes:'adult',
gallery:{
  'Noir':['https://maillotland.com/cdn/shop/files/WhatsApp_Image_2026-08-29_at_21.54.05.jpg?v=1788034462'],
  'Rose':['https://maillotland.com/cdn/shop/files/IMG-5587.jpg?v=1789297833'],
  'Beige':['https://maillotland.com/cdn/shop/files/Veste_Br_sil_Beige.jpg?v=1788034586'],
  'Vert':['https://maillotland.com/cdn/shop/files/5D7DC9F8-EAEE-41ED-B5F2-ACF023339549.jpg?v=1788030700']
}},

{
id:'c1',
brand:'C.P. Company',
category:'C.P. Company',
name:'C.P. Company Pullover',
price:6.34,
colors:['Noir','Blanc'],
sizes:'adult',
gallery:{
  'Noir':['https://www.yoox.com/images/items/14/14493809pk_14_f.jpg?impolicy=crop&width=387&height=490'],
  'Blanc':['https://www.yoox.com/images/items/14/14493809dp_14_f.jpg?impolicy=crop&width=387&height=490']
}},

{
id:'c2',
brand:'C.P. Company',
category:'C.P. Company',
name:'Bonnet en mérinos',
price:4.86,
colors:['Selon photo'],
sizes:['Taille unique'],
images:['https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/a71a15cceb4196f36208123c79023614.jpg']
},

{
id:'s1',
brand:'Stone Island',
category:'Stone Island',
name:'Article Stone Island (nom à préciser)',
price:null,
colors:['Noir','Blanc'],
sizes:'adult',
gallery:{
  'Noir':['https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614274_1000.jpg?ov=lightgrey'],
  'Blanc':['https://cdn-images.farfetch-contents.com/39/97/85/22/39978522_99261882_1000.jpg?ov=lightgrey']
}},

{
id:'s2',
brand:'Stone Island',
category:'Stone Island',
name:'Stone Island Cotton T-shirt',
price:null,
colors:['Noir','Blanc'],
sizes:'adult',
gallery:{
  'Noir':['https://i.etsystatic.com/54513826/r/il/d0b87b/7533878689/il_1588xN.7533878689_639l.jpg'],
  'Blanc':['https://cdn-images.farfetch-contents.com/25/37/28/56/25372856_75614301_1000.jpg?ov=lightgrey']
}},

{
id:'u1',
brand:'Under Armour',
category:'Under Armour',
name:'UA Tech pour fille',
price:1.54,
colors:['Noir','Rose'],
sizes:'child',
images:[]
},

{
id:'u2',
brand:'Under Armour',
category:'Under Armour',
name:'UA Tech 2.0 pour garçon',
price:3.46,
colors:['Blanc','Bleu','Noir motif orange','Rose','Noir sans motif','Autre (code 808)'],
sizes:'child',
gallery:{
  'Blanc':[ua('100','HF'),ua('100','HB')],
  'Bleu':[ua('482','HF'),ua('482','HB')],
  'Noir motif orange':[ua('003','HF'),ua('003','HB')],
  'Rose':[ua('673','HB'),ua('673','HS')],
  'Noir sans motif':[ua('001','HB'),ua('001','HF')],
  'Autre (code 808)':[ua('808','HB'),ua('808','HS')]
}},

{
id:'u3',
brand:'Under Armour',
category:'Under Armour',
name:'UA Storm ColdGear Infrared Shield 2.0',
price:17.99,
colors:['Noir'],
sizes:'adult',
images:[
  'https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_FC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0',
  'https://underarmour.scene7.com/is/image/Underarmour/V5-1371587-002_BC?rp=standard-0pad%7Cpdp&qlt=85&bgc=f0f0f0&wid=800&hei=1000&op_usm=1.75%2C0.3%2C2%2C0'
]}
];

const $=(s,r=document)=>r.querySelector(s);
const fmt=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const adult=['XS','S','M','L','XL','XXL','XXXL'];
const child=['S','M','L','XL'];
let user=null,filter='all';

const CART='polbuy_cart';
const ADDR='polbuy_addresses';
const cart=()=>JSON.parse(localStorage.getItem(CART)||'[]');

function saveCart(c){
  localStorage.setItem(CART,JSON.stringify(c));
  renderCart();
}

function price(p,c){
  return p.colorPrices?.[c]??p.price;
}

function pics(p,c){
  return p.gallery?.[c]??p.images??[];
}

function render(){
  const grid=$('#product-grid');
  if(!grid)return;

  grid.innerHTML=PRODUCTS
    .filter(p=>filter==='all'||p.category===filter)
    .map(p=>{
      let im=pics(p,p.colors[0])[0];

      return `<article class="product-card">
        <button class="product-photo-button" data-open="${p.id}" style="display:block;width:100%;border:0;padding:0;cursor:pointer;aspect-ratio:4/5;background:#f3f3f3">
          <img src="${esc(im||'')}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:contain">
        </button>
        <div class="product-info">
          <p class="product-brand">${esc(p.brand)}</p>
          <h3>${esc(p.name)}</h3>
          <p class="product-price">${p.price==null?'Prix à confirmer':fmt(p.price)}</p>
          <button class="add-to-cart" data-open="${p.id}">Voir le produit</button>
        </div>
      </article>`;
    }).join('');
}

function modal(id,title){
  let m=document.getElementById(id);

  if(!m){
    m=document.createElement('div');
    m.id=id;
    m.className='pb-overlay';
    m.innerHTML=`
      <section class="pb-panel">
        <button class="pb-close" data-close="${id}">Fermer ✕</button>
        <h2>${title}</h2>
        <div class="pb-content"></div>
      </section>`;
    document.body.append(m);
  }

  return m;
}

function openProduct(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;

  let m=modal('pb-product','Produit');
  let h=$('.pb-content',m);
  let color=p.colors[0];
  let idx=0;

  const sizes=Array.isArray(p.sizes)
    ?p.sizes
    :p.sizes==='child'?child:adult;

  const draw=()=>{
    let a=pics(p,color);
    idx=Math.max(0,Math.min(idx,a.length-1));

    $('#pb-img',h).src=a[idx]||'';
    $('#pb-count',h).textContent=a.length?`${idx+1} / ${a.length}`:'Photo non disponible';
    $('#pb-price',h).textContent=price(p,color)==null?'Prix à confirmer':fmt(price(p,color));
    $('#pb-add',h).disabled=price(p,color)==null;
  };

  h.innerHTML=`
    <div class="pb-gallery">
      <button id="pb-prev">‹</button>
      <img id="pb-img" alt="${esc(p.name)}">
      <button id="pb-next">›</button>
    </div>
    <p id="pb-count"></p>
    <h3>${esc(p.brand)} – ${esc(p.name)}</h3>
    <strong id="pb-price"></strong>
    <label>Couleur
      <select id="pb-color">${p.colors.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
    </label>
    <label>Taille
      <select id="pb-size">${sizes.map(s=>`<option>${s}</option>`).join('')}</select>
    </label>
    <button id="pb-add">Ajouter au panier</button>`;

  m.classList.add('open');
  draw();

  $('#pb-color',h).onchange=e=>{
    color=e.target.value;
    idx=0;
    draw();
  };

  $('#pb-prev',h).onclick=()=>{
    let a=pics(p,color);
    if(a.length){
      idx=(idx-1+a.length)%a.length;
      draw();
    }
  };

  $('#pb-next',h).onclick=()=>{
    let a=pics(p,color);
    if(a.length){
      idx=(idx+1)%a.length;
      draw();
    }
  };

  $('#pb-add',h).onclick=()=>{
    let c=cart();
    let z=$('#pb-size',h).value;
    let found=c.find(x=>x.id===id&&x.color===color&&x.size===z);

    if(found)found.qty++;
    else c.push({
      id,
      name:p.name,
      brand:p.brand,
      price:price(p,color),
      color,
      size:z,
      qty:1,
      image:pics(p,color)[0]||''
    });

    saveCart(c);
    m.classList.remove('open');
    openCart();
  };
}

function totals(){
  let sub=cart().reduce((s,x)=>s+x.price*x.qty,0);
  let ship=sub>=24.99?0:3.99;
  return{sub,ship,total:sub+ship};
}

function renderCart(){
  let c=cart();
  let n=c.reduce((s,x)=>s+x.qty,0);

  document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=n);

  let m=$('#pb-cart');
  if(!m?.classList.contains('open'))return;

  let h=$('.pb-content',m);
  let t=totals();

  h.innerHTML=(c.map((x,i)=>`
    <div class="pb-line">
      ${x.image?`<img src="${esc(x.image)}">`:''}
      <div>
        <b>${esc(x.name)}</b>
        <p>${esc(x.color)} · ${esc(x.size)} · ${x.qty} × ${fmt(x.price)}</p>
        <button data-minus="${i}">−</button>
        <button data-plus="${i}">+</button>
        <button data-remove="${i}">Supprimer</button>
      </div>
    </div>`).join('')||'<p>Panier vide.</p>')+
    `<p>
      Sous-total : ${fmt(t.sub)}<br>
      Livraison : ${t.ship?fmt(t.ship):'Offerte'}<br>
      <b>Total : ${fmt(t.total)}</b>
    </p>
    <button id="pb-address">Mes adresses</button>
    <p>Paiement PayPal :
      <a href="https://paypal.me/BUYPOL" target="_blank" rel="noopener">paypal.me/BUYPOL</a>.
      La commande reste en attente jusqu'à vérification manuelle.
    </p>
    <button id="pb-order" ${c.length?'':'disabled'}>Valider la commande</button>`;
}

function openCart(){
  let m=modal('pb-cart','Mon panier');
  m.classList.add('open');
  renderCart();
}

function openAccount(){
  let m=modal('pb-account','Mon compte POL BUY');
  let h=$('.pb-content',m);
  m.classList.add('open');

  if(user){
    h.innerHTML=`
      <p>Connecté : ${esc(user.email)}</p>
      <button id="pb-orders">Mes commandes</button>
      <button id="pb-logout">Déconnexion</button>
      <div id="pb-orders-list"></div>`;
    return;
  }

  h.innerHTML=`
    <form id="pb-auth">
      <input name="name" placeholder="Nom (pour créer un compte)">
      <input name="email" type="email" placeholder="E-mail" required>
      <input name="password" type="password" placeholder="Mot de passe (6 caractères minimum)" minlength="6" required>
      <button>Connexion / inscription</button>
    </form>
    <button id="pb-google">Continuer avec Google</button>
    <p>Pour créer un compte, renseigne aussi ton nom.</p>
    <p id="pb-auth-error"></p>`;
}

async function createOrder(){
  if(!user){
    openAccount();
    throw Error('Connecte-toi avant de commander.');
  }

  let c=cart();
  if(!c.length)throw Error('Panier vide');

  let a=JSON.parse(localStorage.getItem(ADDR)||'[]');
  let address=a[Number($('#pb-address-select')?.value)||0];

  if(!address)throw Error('Ajoute une adresse avant de valider.');

  let t=totals();

  let data={
    userId:user.uid,
    customerEmail:user.email,
    customerName:user.displayName||'',
    address,
    items:c,
    subtotal:t.sub,
    shipping:t.ship,
    total:t.total,
    status:'pending_payment_check',
    paymentVerified:false,
    createdAt:serverTimestamp()
  };

  let ref=await addDoc(collection(db,'orders'),data);

  if(window.emailjs?.send){
    try{
      await window.emailjs.send(EJS.service,EJS.order,{
        to_email:OWNER,
        order_id:ref.id,
        customer_name:data.customerName,
        customer_email:user.email,
        items:c.map(x=>`${x.name} (${x.color}/${x.size}) x${x.qty}`).join(', '),
        subtotal:t.sub.toFixed(2),
        shipping:t.ship.toFixed(2),
        total:t.total.toFixed(2),
        status:'Paiement à vérifier'
      },EJS.key);
    }catch(e){
      console.warn(e);
    }
  }

  saveCart([]);
  alert('Commande créée : '+ref.id+'. Paiement à vérifier manuellement.');
  $('#pb-cart').classList.remove('open');
}

function addressBook(){
  let m=modal('pb-address','Mes adresses');
  let h=$('.pb-content',m);
  let a=JSON.parse(localStorage.getItem(ADDR)||'[]');

  h.innerHTML=`
    <label>Adresse enregistrée
      <select id="pb-address-select">
        <option value="">Choisir…</option>
        ${a.map((x,i)=>`<option value="${i}">${esc(x.label+' – '+x.city)}</option>`).join('')}
      </select>
    </label>
    <form id="pb-address-form">
      <input name="label" placeholder="Nom (maison…)" required>
      <input name="name" placeholder="Nom complet" required>
      <input name="street" placeholder="Adresse" required>
      <input name="zip" placeholder="Code postal" required>
      <input name="city" placeholder="Ville" required>
      <input name="country" value="France" required>
      <button>Enregistrer l'adresse</button>
    </form>`;

  m.classList.add('open');
}

async function admin(){
  if(!user)throw Error('Connecte-toi.');

  let token=await user.getIdTokenResult(true);

  if(token.claims.admin!==true){
    throw Error('Accès admin refusé : le compte doit avoir le custom claim Firebase admin=true.');
  }

  let m=modal('pb-admin','Dashboard administrateur');
  let h=$('.pb-content',m);
  m.classList.add('open');

  let snap=await getDocs(collection(db,'orders'));
  let orders=snap.docs.map(d=>({id:d.id,...d.data()}));

  h.innerHTML=orders.map(o=>`
    <article class="pb-order">
      <b>Commande ${esc(o.id)}</b>
      <p>${esc(o.customerEmail)} · ${fmt(o.total||0)} · ${esc(o.status)}</p>
      <p>${esc(o.address?.street||'')}</p>
      <button data-paid="${o.id}">Confirmer paiement</button>
      <button data-cancel="${o.id}">Annuler</button>
      <form data-track="${o.id}">
        <input name="carrier" placeholder="DPD, Colissimo…" required>
        <input name="trackingNumber" placeholder="Numéro de suivi" required>
        <input name="trackingStatus" placeholder="Statut">
        <input name="trackingLocation" placeholder="Lieu">
        <input name="estimatedDelivery" placeholder="Livraison estimée">
        <button>Enregistrer le suivi</button>
      </form>
    </article>`).join('')||'Aucune commande.';
}

async function myOrders(){
  let s=await getDocs(query(collection(db,'orders'),where('userId','==',user.uid)));

  $('#pb-orders-list').innerHTML=s.docs.map(d=>{
    let o=d.data();
    return `<p>Commande ${esc(d.id)} — ${esc(o.status)} — ${fmt(o.total||0)} — Suivi : ${esc(o.trackingNumber||'en attente')}</p>`;
  }).join('')||'Aucune commande.';
}

document.addEventListener('click',async e=>{
  let b=e.target.closest('button');
  if(!b)return;

  try{
    if(b.dataset.open)openProduct(b.dataset.open);
    if(b.dataset.close)$('#'+b.dataset.close).classList.remove('open');
    if(b.id==='cart-open'||b.id==='cartBtn')openCart();
    if(b.id==='account-open'||b.id==='accountBtn')openAccount();
    if(b.id==='admin-open')await admin();
    if(b.id==='pb-address')addressBook();
    if(b.id==='pb-order')await createOrder();

    if(b.id==='pb-google'){
      await signInWithPopup(auth,new GoogleAuthProvider());
      $('#pb-account').classList.remove('open');
    }

    if(b.id==='pb-logout')await signOut(auth);
    if(b.id==='pb-orders')await myOrders();

    if(b.dataset.minus!==undefined){
      let c=cart(),i=+b.dataset.minus;
      c[i].qty=Math.max(1,c[i].qty-1);
      saveCart(c);
    }

    if(b.dataset.plus!==undefined){
      let c=cart();
      c[+b.dataset.plus].qty++;
      saveCart(c);
    }

    if(b.dataset.remove!==undefined){
      let c=cart();
      c.splice(+b.dataset.remove,1);
      saveCart(c);
    }

    if(b.dataset.paid){
      await updateDoc(doc(db,'orders',b.dataset.paid),{
        paymentVerified:true,
        status:'paid',
        paymentVerifiedAt:serverTimestamp()
      });
      await admin();
    }

    if(b.dataset.cancel){
      await updateDoc(doc(db,'orders',b.dataset.cancel),{
        status:'cancelled',
        cancelledAt:serverTimestamp()
      });
      await admin();
    }
  }catch(err){
    alert(err.message);
  }
});

document.addEventListener('submit',async e=>{
  if(e.target.id==='pb-auth'){
    e.preventDefault();
    let d=new FormData(e.target);

    try{
      let name=d.get('name');
      let email=d.get('email');
      let pass=d.get('password');

      if(name){
        let c=await createUserWithEmailAndPassword(auth,email,pass);
        await updateProfile(c.user,{displayName:name});
      }else{
        await signInWithEmailAndPassword(auth,email,pass);
      }

      $('#pb-account').classList.remove('open');
    }catch(x){
      $('#pb-auth-error').textContent=x.message;
    }
  }

  if(e.target.id==='pb-address-form'){
    e.preventDefault();
    let a=JSON.parse(localStorage.getItem(ADDR)||'[]');
    a.push(Object.fromEntries(new FormData(e.target)));
    localStorage.setItem(ADDR,JSON.stringify(a));
    addressBook();
  }

  if(e.target.dataset.track){
    e.preventDefault();

    let d=Object.fromEntries(new FormData(e.target));
    let id=e.target.dataset.track;

    await updateDoc(doc(db,'orders',id),{...d,status:'shipped'});

    let q=await getDocs(query(collection(db,'orders'),where('__name__','==',id)));
    let o=q.docs[0]?.data();

    if(o&&window.emailjs?.send){
      try{
        await window.emailjs.send(EJS.service,EJS.tracking,{
          to_email:o.customerEmail,
          customer_name:o.customerName||'',
          order_id:id,
          status:'Expédiée',
          carrier:d.carrier,
          tracking_number:d.trackingNumber,
          tracking_status:d.trackingStatus,
          tracking_location:d.trackingLocation,
          estimated_delivery:d.estimatedDelivery
        },EJS.key);
      }catch(x){
        console.warn(x);
      }
    }

    await admin();
  }
});

$('#category-filter')?.addEventListener('change',e=>{
  filter=e.target.value;
  render();
});

onAuthStateChanged(auth,u=>{
  user=u;
  document.body.dataset.loggedIn=u?'true':'false';
});

const style=document.createElement('style');

style.textContent=`
.pb-overlay{display:none;position:fixed;inset:0;background:#0009;z-index:9999;align-items:center;justify-content:center;padding:14px}
.pb-overlay.open{display:flex}
.pb-panel{position:relative;background:white;color:#111;padding:24px;width:min(620px,100%);max-height:92vh;overflow:auto;border-radius:10px}
.pb-close{float:right;padding:8px}
.pb-content label{display:grid;gap:6px;margin:12px 0}
.pb-content input,.pb-content select{padding:11px;width:100%;border:1px solid #bbb}
.pb-content button{padding:10px 14px;margin:4px;background:#111;color:#fff;border:0;cursor:pointer}
.pb-gallery{display:grid;grid-template-columns:42px 1fr 42px;gap:8px;align-items:center}
.pb-gallery img{width:100%;height:360px;object-fit:contain;background:#f5f5f5}
.pb-gallery button{font-size:30px}
.pb-line{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #ddd}
.pb-line img{width:65px;height:80px;object-fit:contain}
.pb-order{border:1px solid #ddd;padding:12px;margin:12px 0}
.pb-order form{display:grid;gap:8px}
`;

document.head.append(style);
render();
renderCart();

window.POL_BUY={
  app,auth,db,
  products:PRODUCTS,
  render,openCart,openAccount,openProduct,createOrder,admin
};
