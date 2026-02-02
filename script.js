let cart = [];
let currentSelection = null; 
const tele = window.Telegram.WebApp;
tele.expand();

// Navigation Pages
function showPage(pageId, navEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    navEl.classList.add('active');
}

// Navigation Onglets Panier
function switchTab(tabName) {
    document.getElementById('content-panier').style.display = (tabName === 'panier') ? 'block' : 'none';
    document.getElementById('content-commandes').style.display = (tabName === 'commandes') ? 'block' : 'none';
    document.getElementById('btn-tab-panier').classList.toggle('active', tabName === 'panier');
    document.getElementById('btn-tab-commandes').classList.toggle('active', tabName === 'commandes');
}

// Ouverture Produit
function openProduct(name, farm, tag, video, desc, prices) {
    currentSelection = null;
    const addBtn = document.getElementById('btn-add-cart');
    addBtn.disabled = true;
    addBtn.innerText = "Sélectionnez une quantité";
    addBtn.style.background = "#2c2c2e"; 

    document.getElementById('detail-title').innerText = name;
    document.getElementById('detail-farm').innerText = farm;
    document.getElementById('detail-tag').innerText = tag;
    document.getElementById('detail-desc').innerText = desc;
    document.getElementById('detail-video').src = video;
    
    const grid = document.getElementById('weight-selector');
    grid.innerHTML = '';
    
    for (const [weight, price] of Object.entries(prices)) {
        const btn = document.createElement('button');
        btn.className = 'weight-btn';
        btn.innerHTML = `<span style="font-size:16px;">${weight}</span><br><span style="opacity:0.7; font-size:12px;">${price}€</span>`;
        btn.onclick = () => selectWeight(btn, name, weight, price);
        grid.appendChild(btn);
    }
    
    document.getElementById('product-detail-page').classList.add('active');
}

// Sélection Poids
function selectWeight(btnElement, productName, weight, price) {
    document.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    currentSelection = {
        name: `${productName} (${weight})`,
        price: price
    };
    
    const addBtn = document.getElementById('btn-add-cart');
    addBtn.disabled = false;
    addBtn.style.background = "var(--accent-blue)";
    addBtn.innerText = `Ajouter au panier - ${price}€`;
    
    tele.HapticFeedback.selectionChanged();
}

// Ajouter au panier
function confirmAddToCart() {
    if (currentSelection) {
        cart.push(currentSelection);
        updateCartUI();
        closeProduct();
        tele.HapticFeedback.notificationOccurred('success');
    }
}

function closeProduct() {
    document.getElementById('product-detail-page').classList.remove('active');
}

// MISE À JOUR PANIER ET BADGE
function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const btn = document.getElementById('btn-valider-panier');
    const badge = document.getElementById('nav-cart-badge');

    // Mise à jour du badge rouge
    if (cart.length > 0) {
        badge.style.display = 'flex';
        badge.innerText = cart.length;
    } else {
        badge.style.display = 'none';
    }
    
    // Affichage liste
    if (cart.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:50px; opacity:0.5;">Votre panier est vide 🐥<br><small>Allez voir nos pépites !</small></div>';
        btn.style.display = 'none';
        return;
    }

    list.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        list.innerHTML += `
            <div style="background:#2c2c2e; padding:15px; border-radius:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.1);">
                <div>
                    <b style="font-size:14px;">${item.name}</b><br>
                    <span style="color:#0A84FF; font-weight:bold;">${item.price}€</span>
                </div>
                <button onclick="removeItem(${index})" style="color:#ff453a; background:rgba(255,69,58,0.1); padding:8px 12px; border-radius:10px; border:none; font-weight:bold; font-size:12px;">Supprimer</button>
            </div>`;
    });
    
    btn.style.display = 'block';
    btn.innerText = `Commander (${total}€) ➔`;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
    tele.HapticFeedback.impactOccurred('light');
}

// Navigation Commande
function goToStep2() {
    document.getElementById('step-1-cart').style.display = 'none';
    document.getElementById('step-2-delivery').style.display = 'block';
}

function goToStep1() {
    document.getElementById('step-1-cart').style.display = 'block';
    document.getElementById('step-2-delivery').style.display = 'none';
}

function toggleDeliveryFields() {
    const mode = document.querySelector('input[name="delivery-mode"]:checked').value;
    document.getElementById('meetup-fields').style.display = mode === 'meetup' ? 'block' : 'none';
    document.getElementById('livraison-fields').style.display = mode === 'livraison' ? 'block' : 'none';
}

function finaliserCommande() {
    const mode = document.querySelector('input[name="delivery-mode"]:checked').value;
    const loc = mode === 'meetup' ? document.getElementById('meetup-location').value : document.getElementById('delivery-address').value;
    
    if (mode === 'livraison' && loc.trim().length < 5) {
        tele.showAlert("Veuillez entrer une adresse valide.");
        return;
    }

    let recap = "";
    let total = 0;
    cart.forEach(i => {
        recap += `- ${i.name} : ${i.price}€\n`;
        total += i.price;
    });

    const data = {
        recapitulatif: recap,
        total: total + "€",
        mode: mode === 'meetup' ? "📍 Meet-up" : "🚚 Livraison",
        adresse: loc
    };

    tele.showConfirm(`Confirmer la commande de ${total}€ ?`, (confirm) => {
        if(confirm) {
            tele.sendData(JSON.stringify(data));
        }
    });
}
