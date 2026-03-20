/**
 * ============================================================
 *  NIZA'S LITTLE OVEN — APPLICATION LOGIC
 *  ⚙️  Developer file — handles all interactivity.
 *     Data lives in data.js. Styles live in style.css.
 * ============================================================
 */

'use strict';

/* ── Helpers ─────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = n => SHOP.currency + Number(n).toLocaleString();
const el  = (tag, cls = '', inner = '') => {
  const e = document.createElement(tag);
  if (cls)   e.className = cls;
  if (inner) e.innerHTML = inner;
  return e;
};

/* ═══════════════════════════════════════════════════════════
   STATE — single source of truth
═══════════════════════════════════════════════════════════ */
const State = (() => {
  let _cart      = [];
  let _co        = { product: null, qty: 1, step: 1, addons: [], details: {} };

  return {
    /* cart */
    getCart:    ()  => _cart,
    cartQty:    ()  => _cart.reduce((s,i) => s + i.qty, 0),
    cartTotal:  ()  => _cart.reduce((s,i) => s + i.price * i.qty, 0),
    addItem(id) {
      const p   = SHOP.products.find(x => x.id === id);
      const hit = _cart.find(x => x.id === id);
      hit ? hit.qty++ : _cart.push({ ...p, qty: 1 });
    },
    changeQty(id, delta) {
      const hit = _cart.find(x => x.id === id);
      if (!hit) return;
      hit.qty += delta;
      if (hit.qty <= 0) _cart = _cart.filter(x => x.id !== id);
    },
    removeItem: id => { _cart = _cart.filter(x => x.id !== id); },
    clearCart:  ()  => { _cart = []; },

    /* checkout */
    getCo:      ()  => _co,
    startCo(productId = null) {
      _co = { product: productId ? SHOP.products.find(x => x.id === productId) : null,
              qty: 1, step: 1, addons: [], details: {} };
    },
    setCoDetails: d  => { _co.details = { ..._co.details, ...d }; },
    setCoStep:    s  => { _co.step = s; },
    setCoQty:     q  => { _co.qty = Math.max(1, q); },
    toggleAddon(id) {
      _co.addons.includes(id)
        ? (_co.addons = _co.addons.filter(x => x !== id))
        : _co.addons.push(id);
    },
    coItems() {
      return _co.product
        ? [{ ..._co.product, qty: _co.qty }]
        : State.getCart();
    },
    coAddonTotal() {
      return _co.addons.reduce((s, id) => {
        const a = SHOP.addons.find(x => x.id === id);
        return s + (a ? a.price : 0);
      }, 0);
    },
    coGrandTotal() {
      return State.coItems().reduce((s,i) => s + i.price * i.qty, 0)
           + State.coAddonTotal();
    },
  };
})();

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
const Toast = (() => {
  let tid;
  return {
    show(msg) {
      const wrap = $('#toastWrap');
      wrap.innerHTML = `<div class="niza-toast">${msg}</div>`;
      const t = wrap.firstChild;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => t.classList.add('show'));
      });
      clearTimeout(tid);
      tid = setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => { wrap.innerHTML = ''; }, 320);
      }, 2700);
    },
  };
})();

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
const Nav = {
  init() {
    this._buildLinks();
    this._scrollSpy();
    window.addEventListener('scroll', () => {
      $('#mainNav').classList.toggle('scrolled', window.scrollY > 30);
      this._scrollSpy();
    }, { passive: true });
  },

  _buildLinks() {
    const ul = $('#navLinksList');
    [{ href: '#home', label: '🏠 Home' },
     { href: '#products', label: '🍰 Products' },
     { href: '#contact', label: '📞 Contact' }].forEach(({ href, label }) => {
      const li = el('li', 'nav-item');
      const a  = el('a', 'nav-link', label);
      a.href   = href;
      a.addEventListener('click', e => {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        a.classList.add('active');
        // collapse mobile menu
        const tog = $('#navToggler');
        if (tog && !tog.closest('.navbar').querySelector('.navbar-collapse')
                                         .classList.contains('collapsed')) {
          tog.click();
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
  },

  _scrollSpy() {
    const sections = ['home', 'products', 'contact'];
    let current = 'home';
    sections.forEach(id => {
      const s = document.getElementById(id);
      if (s && window.scrollY >= s.offsetTop - 130) current = id;
    });
    $$('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  },

  updateCartBadge() {
    $('#cartBadge').textContent = State.cartQty();
  },
};

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
const Hero = {
  init() {
    const tagsWrap = $('#heroTags');
    SHOP.hookTags.forEach(({ icon, text }) => {
      tagsWrap.appendChild(el('span', 'hook-tag', `${icon} ${text}`));
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════════════ */
const Products = {
  init() {
    this._buildFilters();
    this._renderAll('all');
  },

  _buildFilters() {
    const bar = $('#filterBar');
    SHOP.categories.forEach(({ slug, label }) => {
      const btn = el('button', 'filter-btn' + (slug === 'all' ? ' active' : ''), label);
      btn.dataset.slug = slug;
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._renderAll(slug);
      });
      bar.appendChild(btn);
    });
  },

  _renderAll(filter) {
    const grid = $('#productsGrid');
    grid.innerHTML = '';
    const visible = filter === 'all'
      ? SHOP.products
      : SHOP.products.filter(p => p.category === filter);

    visible.forEach(p => grid.appendChild(this._card(p)));

    // animate cards in
    $$('.product-card', grid).forEach((c, i) => {
      c.style.opacity    = '0';
      c.style.transform  = 'translateY(18px)';
      c.style.transition = `opacity .35s ease ${i * .07}s, transform .35s ease ${i * .07}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          c.style.opacity   = '1';
          c.style.transform = 'translateY(0)';
        });
      });
    });
  },

  _card(p) {
    const wrap = el('div', 'col-sm-6 col-lg-4 mb-4');
    const card = el('div', 'product-card position-relative');
    card.innerHTML = `
      ${p.badge ? `<span class="product-badge-label">${p.badge}</span>` : ''}
      <div class="product-emoji-wrap">${p.emoji}</div>
      <div class="p-3">
        <h5 class="mb-1" style="font-family:var(--font-display);font-size:1.1rem">${p.name}</h5>
        <p class="text-muted mb-2" style="font-size:.82rem;line-height:1.5">${p.desc}</p>
        <div class="product-price mb-3">${fmt(p.price)}</div>
        <div class="row g-2">
          <div class="col-6">
            <button class="btn-add-cart" data-id="${p.id}">🛒 Add to Cart</button>
          </div>
          <div class="col-6">
            <button class="btn-quick-checkout" data-id="${p.id}">⚡ Checkout</button>
          </div>
        </div>
      </div>`;

    card.querySelector('.btn-add-cart').addEventListener('click', () => {
      State.addItem(p.id);
      Cart.refresh();
      Nav.updateCartBadge();
      Toast.show(`${p.emoji} ${p.name} added to cart!`);
    });
    card.querySelector('.btn-quick-checkout').addEventListener('click', () => {
      Checkout.open(p.id);
    });

    wrap.appendChild(card);
    return wrap;
  },
};

/* ═══════════════════════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════════════════════ */
const Contact = {
  init() {
    const grid = $('#contactGrid');
    const items = [
      { icon:'📘', label:'Facebook Page',     val:`<a href="${SHOP.contact.facebook}" target="_blank" rel="noopener">Niza's Little Oven — Visit Page</a>` },
      { icon:'💬', label:'Facebook Messenger', val:`<a href="${SHOP.contact.messenger}" target="_blank" rel="noopener">Send us a message on FB</a>` },
      { icon:'📱', label:'Phone / Call',       val:`<a href="tel:${SHOP.contact.phone}">${SHOP.contact.phone}</a>` },
      { icon:'📧', label:'Email Us',           val:`<a href="mailto:${SHOP.contact.email}">${SHOP.contact.email}</a>` },
    ];
    items.forEach(({ icon, label, val }) => {
      const col  = el('div', 'col-sm-6 mb-4');
      col.innerHTML = `
        <div class="contact-card h-100">
          <div class="contact-icon mb-2">${icon}</div>
          <div class="contact-label mb-1">${label}</div>
          <div class="contact-val" style="font-size:.9rem">${val}</div>
        </div>`;
      grid.appendChild(col);
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   CART (Bootstrap Offcanvas)
═══════════════════════════════════════════════════════════ */
const Cart = {
  _offcanvas: null,
  init() {
    this._offcanvas = new bootstrap.Offcanvas('#cartOffcanvas');
    $('#cartNavBtn').addEventListener('click', () => this.open());
    $('#cartProceedBtn').addEventListener('click', () => {
      this._offcanvas.hide();
      Checkout.open();
    });
    this.refresh();
  },
  open()    { this.refresh(); this._offcanvas.show(); },
  refresh() {
    const body  = $('#cartBody');
    const total = $('#cartTotalAmt');
    const c     = State.getCart();

    Nav.updateCartBadge();
    total.textContent = fmt(State.cartTotal());

    if (!c.length) {
      body.innerHTML = `<div class="cart-empty-msg">
        <span class="big-icon">🛒</span>
        Your cart is empty!<br>Pick some sweet cakes 🎂</div>`;
      return;
    }

    body.innerHTML = '';
    c.forEach(item => {
      const row = el('div', 'cart-item-row');
      row.innerHTML = `
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">${fmt(item.price * item.qty)}</div>
          <div class="ci-qty">
            <button class="qty-btn" data-id="${item.id}" data-d="-1">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-d="1">+</button>
          </div>
        </div>
        <button class="ci-remove" data-id="${item.id}">🗑️</button>`;

      row.querySelectorAll('.qty-btn').forEach(b => b.addEventListener('click', () => {
        State.changeQty(+b.dataset.id, +b.dataset.d);
        this.refresh();
      }));
      row.querySelector('.ci-remove').addEventListener('click', () => {
        State.removeItem(+row.querySelector('.ci-remove').dataset.id);
        this.refresh();
      });
      body.appendChild(row);
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   CHECKOUT (3-step modal)
═══════════════════════════════════════════════════════════ */
const Checkout = {
  _modal: null,

  init() {
    this._modal = new bootstrap.Modal('#checkoutModal');
    $('#checkoutModal').addEventListener('hidden.bs.modal', () => {
      State.startCo(); // reset
    });
  },

  open(productId = null) {
    if (!productId && !State.getCart().length) {
      Toast.show('Add some cakes first! 🎂'); return;
    }
    State.startCo(productId);
    this._renderStep();
    this._modal.show();
  },

  _stepTitles: ['🎂 Your Details', '✨ Add-Ons', '📬 Send Your Order'],

  _renderStep() {
    const co   = State.getCo();
    $('#checkoutModalLabel').textContent = this._stepTitles[co.step - 1];
    $('#coBody').innerHTML = '';

    // step dots
    const dots = el('div', 'step-dots mb-3');
    [1,2,3].forEach(i => {
      dots.appendChild(el('div',
        'step-dot' + (i < co.step ? ' done' : i === co.step ? ' active' : '')));
    });
    $('#coBody').appendChild(dots);

    // render correct step
    [null, this._step1, this._step2, this._step3][co.step].call(this);
  },

  /* ── Step 1: customer details ── */
  _step1() {
    const co  = State.getCo();
    const div = el('div');
    div.innerHTML = `
      <div class="mb-3">
        <label class="form-label">Your Name 😊</label>
        <input id="cName" class="form-control" placeholder="e.g. Maria Santos" value="${co.details.name || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label">Phone Number 📱</label>
        <input id="cPhone" class="form-control" placeholder="+63 9XX XXX XXXX" value="${co.details.phone || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label">Delivery / Pickup 📦</label>
        <textarea id="cAddr" class="form-control" rows="2" placeholder="Full address or 'Self-pickup'">${co.details.addr || ''}</textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Special Notes 💌</label>
        <textarea id="cNotes" class="form-control" rows="2" placeholder="e.g. Write Happy Birthday Lara! on the cake">${co.details.notes || ''}</textarea>
      </div>`;

    // quantity if single product
    if (co.product) {
      div.innerHTML += `
        <div class="mb-3">
          <label class="form-label">Quantity</label>
          <div class="d-flex align-items-center gap-2 mt-1">
            <button class="qty-btn" id="qtyMinus">−</button>
            <span id="qtyDisp" class="fw-bold fs-5">${co.qty}</span>
            <button class="qty-btn" id="qtyPlus">+</button>
          </div>
        </div>`;
    }

    div.appendChild(this._summaryBox());
    div.appendChild(this._nextBtn('Next: Add-Ons ✨', () => {
      const name  = $('#cName').value.trim();
      const phone = $('#cPhone').value.trim();
      if (!name || !phone) { Toast.show('Please enter your name & phone 😊'); return; }
      State.setCoDetails({
        name, phone,
        addr:  $('#cAddr').value,
        notes: $('#cNotes').value,
      });
      State.setCoStep(2);
      this._renderStep();
    }));

    $('#coBody').appendChild(div);

    if (co.product) {
      $('#qtyMinus').addEventListener('click', () => {
        State.setCoQty(co.qty - 1);
        $('#qtyDisp').textContent = State.getCo().qty;
        this._refreshSummary();
      });
      $('#qtyPlus').addEventListener('click', () => {
        State.setCoQty(co.qty + 1);
        $('#qtyDisp').textContent = State.getCo().qty;
        this._refreshSummary();
      });
    }
  },

  /* ── Step 2: add-ons ── */
  _step2() {
    const co  = State.getCo();
    const div = el('div');

    const intro = el('p', 'text-muted mb-2', 'Make it extra special! ✨ (optional)');
    intro.style.fontSize = '.85rem';
    div.appendChild(intro);

    const grid = el('div', 'row g-2 mb-3');
    SHOP.addons.forEach(a => {
      const col  = el('div', 'col-6');
      const item = el('div', 'addon-item' + (co.addons.includes(a.id) ? ' selected' : ''));
      item.innerHTML = `
        <input type="checkbox" ${co.addons.includes(a.id) ? 'checked' : ''} style="accent-color:var(--cyan)">
        <div>
          <div class="addon-label">${a.label}</div>
          <div class="addon-price">+${fmt(a.price)}</div>
        </div>`;
      item.addEventListener('click', () => {
        State.toggleAddon(a.id);
        item.classList.toggle('selected', co.addons.includes(a.id));
        item.querySelector('input').checked = co.addons.includes(a.id);
        this._refreshSummary();
      });
      col.appendChild(item);
      grid.appendChild(col);
    });
    div.appendChild(grid);
    div.appendChild(this._summaryBox());
    div.appendChild(this._navBtns(() => {
      State.setCoStep(1); this._renderStep();
    }, () => {
      State.setCoStep(3); this._renderStep();
    }, 'Next: Send Order 📬'));

    $('#coBody').appendChild(div);
  },

  /* ── Step 3: send method ── */
  _step3() {
    const div  = el('div');
    const intro = el('p', 'text-muted mb-3', 'Choose how to send us your order 🎉');
    intro.style.fontSize = '.85rem';
    div.appendChild(intro);

    const methods = [
      { id:'messenger', icon:'💬', name:'Facebook Messenger', desc:'Chat directly with us', fn: this._sendMessenger },
      { id:'fb',        icon:'📘', name:'Facebook Page',      desc:'Order posted to our FB page', fn: this._sendFB },
      { id:'email',     icon:'📧', name:'Email Us',           desc:`Order sent to ${SHOP.contact.email}`, fn: this._sendEmail },
    ];

    const wrap = el('div', 'd-flex flex-column gap-2 mb-3');
    methods.forEach(m => {
      const btn = el('button', 'send-method-btn');
      btn.innerHTML = `
        <span class="sm-icon">${m.icon}</span>
        <div><div class="sm-name">${m.name}</div><div class="sm-desc">${m.desc}</div></div>
        <span class="ms-auto">→</span>`;
      btn.addEventListener('click', () => { m.fn.call(this); });
      wrap.appendChild(btn);
    });
    div.appendChild(wrap);
    div.appendChild(this._summaryBox());
    div.appendChild(el('button', 'btn btn-outline-secondary w-100 rounded-pill mt-2',
      '← Back')).addEventListener('click', () => {
        State.setCoStep(2); this._renderStep();
      });

    $('#coBody').appendChild(div);
  },

  _buildOrderMessage() {
    const co      = State.getCo();
    const items   = State.coItems();
    const grand   = State.coGrandTotal();
    const d       = co.details;
    const addonNames = co.addons.map(id => SHOP.addons.find(x => x.id === id)?.label).join(', ') || 'None';
    return `🎂 NEW ORDER — ${SHOP.name}\n\n`
      + `👤 Name: ${d.name || 'N/A'}\n📱 Phone: ${d.phone || 'N/A'}\n📦 Address: ${d.addr || 'N/A'}\n\n`
      + `🛒 Items:\n${items.map(i => `  ${i.emoji} ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`).join('\n')}\n\n`
      + `✨ Add-Ons: ${addonNames}\n💰 Grand Total: ${fmt(grand)}\n\n`
      + `💌 Notes: ${d.notes || 'None'}`;
  },

  _sendMessenger() {
    const msg = this._buildOrderMessage();
    window.open(`${SHOP.contact.messenger}`, '_blank');
    this._confirmOrder();
  },
  _sendFB() {
    window.open(SHOP.contact.facebook, '_blank');
    this._confirmOrder();
  },
  _sendEmail() {
    const msg = this._buildOrderMessage();
    window.open(
      `mailto:${SHOP.contact.email}?subject=${encodeURIComponent('New Order 🎂 — ' + SHOP.name)}&body=${encodeURIComponent(msg)}`
    );
    this._confirmOrder();
  },

  _confirmOrder() {
    Toast.show("Order sent! We'll confirm soon 🎉");
    setTimeout(() => {
      this._modal.hide();
      State.clearCart();
      Cart.refresh();
    }, 700);
  },

  /* ── UI helpers ── */
  _summaryBox() {
    const items = State.coItems();
    const co    = State.getCo();
    const box   = el('div', 'order-summary-box mb-3');
    box.id      = 'summaryBox';
    const rows  = items.map(i =>
      `<div class="summ-row"><span>${i.emoji} ${i.name} x${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`
    ).join('') + co.addons.map(id => {
      const a = SHOP.addons.find(x => x.id === id);
      return a ? `<div class="summ-row"><span>${a.label}</span><span>+${fmt(a.price)}</span></div>` : '';
    }).join('') + `<div class="summ-row"><span>🎉 Grand Total</span><span>${fmt(State.coGrandTotal())}</span></div>`;
    box.innerHTML = `<div class="summ-title">Order Summary</div>${rows}`;
    return box;
  },

  _refreshSummary() {
    const old = $('#summaryBox');
    if (old) old.replaceWith(this._summaryBox());
  },

  _nextBtn(label, fn) {
    const btn = el('button', 'btn-cyan w-100 mt-2', label);
    btn.style.cssText = 'border-radius:50px;padding:.8rem;font-size:1rem;';
    btn.addEventListener('click', fn);
    return btn;
  },

  _navBtns(backFn, nextFn, nextLabel) {
    const row  = el('div', 'd-flex gap-2 mt-2');
    const back = el('button', 'btn btn-outline-secondary rounded-pill flex-shrink-0', '← Back');
    back.style.padding = '.78rem 1.2rem';
    back.addEventListener('click', backFn);
    const next = el('button', 'btn-cyan flex-grow-1', nextLabel);
    next.style.cssText = 'border-radius:50px;padding:.8rem;font-size:.95rem;';
    next.addEventListener('click', nextFn);
    row.appendChild(back);
    row.appendChild(next);
    return row;
  },
};

/* ═══════════════════════════════════════════════════════════
   CHATBOT
═══════════════════════════════════════════════════════════ */
const Chatbot = {
  _open:    false,
  _history: [],

  init() {
    $('#chatBtn').addEventListener('click', () => this.toggle());
    $('#chatCloseBtn').addEventListener('click', () => this.toggle());
    $('#chatSendBtn').addEventListener('click', () => this._send());
    const inp = $('#chatInput');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') this._send(); });
  },

  toggle() {
    this._open = !this._open;
    $('#chatWindow').classList.toggle('open', this._open);
    if (this._open && !this._history.length) this._greet();
  },

  _greet() {
    this._botMsg(`Hi there! 👋🎂 Welcome to ${SHOP.name}! I can help with cakes, prices, and ordering. What are you looking for?`);
    this._showQuick(['Bento Cake 🎁', 'Round Cakes 🎂', 'Cupcakes 🧁', 'Prices 💰', 'Contact Info 📞', 'Order Now 🛒']);
  },

  _send() {
    const inp  = $('#chatInput');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    this._userMsg(text);
    this._clearQuick();
    setTimeout(() => this._respond(text), 480);
  },

  _respond(text) {
    const lower = text.toLowerCase();

    // special nav shortcut
    if (lower.includes('view products') || lower.includes('order now')) {
      this._botMsg('Heading to Products! 🎂');
      setTimeout(() => {
        this.toggle();
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
      }, 500);
      return;
    }

    // knowledge base lookup
    const match = SHOP.chatKnowledge.find(k =>
      k.triggers.some(t => lower.includes(t))
    );

    if (match) {
      this._botMsg(match.reply);
      if (match.quick) this._showQuick(match.quick);
    } else {
      this._botMsg("Hmm, I'm not sure about that! 🤔 Here's what I can help with:");
      this._showQuick(['Prices 💰', 'Bento Cake 🎁', 'Round Cakes 🎂', 'Cupcakes 🧁', 'Contact Info 📞']);
    }
  },

  _botMsg(text) {
    this._history.push({ role: 'bot', text });
    this._renderMsg(text, 'bot');
  },
  _userMsg(text) {
    this._history.push({ role: 'user', text });
    this._renderMsg(text, 'user');
  },

  _renderMsg(text, role) {
    const msgs = $('#chatMsgs');
    const bub  = el('div', `msg-bubble ${role}`, text.replace(/\n/g, '<br>'));
    msgs.appendChild(bub);
    msgs.scrollTop = msgs.scrollHeight;
  },

  _showQuick(opts) {
    const wrap = $('#chatQuick');
    wrap.innerHTML = '';
    opts.forEach(o => {
      const b = el('button', 'qreply-btn', o);
      b.addEventListener('click', () => {
        this._userMsg(o);
        this._clearQuick();
        setTimeout(() => this._respond(o), 480);
      });
      wrap.appendChild(b);
    });
  },
  _clearQuick() { $('#chatQuick').innerHTML = ''; },
};

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Hero.init();
  Products.init();
  Contact.init();
  Cart.init();
  Checkout.init();
  Chatbot.init();
});
