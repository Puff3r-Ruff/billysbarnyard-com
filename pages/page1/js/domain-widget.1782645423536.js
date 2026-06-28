class DomainPurchaseWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const stripeKey = this.getAttribute("stripe-key");

    const init = () => {
      this.stripe = window.Stripe(stripeKey);
      this._render();
    };

    if (window.Stripe) {
      init();
    } else {
      window.addEventListener("stripe-ready", init, { once: true });
    }
  }

  _render() {
    const style = document.createElement("style");
    style.textContent = `
  :host {
    font-family: system-ui;
    display: none;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    background: rgba(0,0,0,0.4); /* shadowed backdrop */
    padding: 20px;
    box-sizing: border-box;
    color: #000000; 
  }
#payBtn {
    margin-top: 10px;
}
  .container {
    width: 100%;
    max-width: 420px;
  }
  .panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    background: white;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15); /* panel shadow */
  }

  .hidden { display: none; }
  .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #0a66ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
#suggestions {
  margin-top: 12px;
}

.suggestion-item {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  background: #f9f9f9;
}

.suggestion-item:hover {
  background: #eef3ff;
  border-color: #0a66ff;
}

  input {
    padding: 8px;
    width: 95%;
    margin-bottom: 8px;
  }

  label {
    display: block;
    margin-top: 12px;
    margin-bottom: 4px;
    font-weight: 500;
  }

  button {
    padding: 10px 14px;
    background: #0a66ff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  button:hover {
    background: #004fcc;
  }
`;

    const wrapper = document.createElement("div");
    wrapper.classList.add("container");
    wrapper.innerHTML = `
      <div id="checker" class="panel">
        <h2>Choose your domain</h2>
        <input id="domain" placeholder="example.com" />
        <button id="checkBtn">Check availability</button>
        <div id="checkStatus"></div>
        <div id="suggestions"></div>
        <div id="confirmArea" class="hidden">
          <button id="confirmBtn">Confirm domain</button>
          <button id="cancelBtn">Cancel</button>
        </div>
      </div>

      <div id="payment" class="panel hidden">
  <h2>Complete your subscription</h2>

  <label>Email</label>
  <input id="email" type="email" placeholder="you@example.com" />

  <label style="margin-top:16px;">
    <input id="skipDomain" type="checkbox" />
    Skip domain purchase (create Cloudflare Pages only)
  </label>

  <slot name="stripe-mount"></slot>

  <button id="payBtn">Start subscription (€15/mo)</button>
  <div id="payStatus"></div>
</div>

<div id="loading" class="panel hidden">
  <h2>Provisioning your project…</h2>
  <div class="spinner"></div>
  <p>Please wait while we set everything up.</p>
</div>
    `;

    this.shadowRoot.append(style, wrapper);

    // Bind elements
    this.domainInput = this.shadowRoot.querySelector("#domain");
    this.emailInput = this.shadowRoot.querySelector("#email");
    this.checkBtn = this.shadowRoot.querySelector("#checkBtn");
    this.confirmBtn = this.shadowRoot.querySelector("#confirmBtn");
    this.cancelBtn = this.shadowRoot.querySelector("#cancelBtn");
    this.checkStatus = this.shadowRoot.querySelector("#checkStatus");
    this.confirmArea = this.shadowRoot.querySelector("#confirmArea");
    this.paymentPanel = this.shadowRoot.querySelector("#payment");
    this.checkerPanel = this.shadowRoot.querySelector("#checker");
    this.payBtn = this.shadowRoot.querySelector("#payBtn");
    this.payStatus = this.shadowRoot.querySelector("#payStatus");
    this.skipDomain = this.shadowRoot.querySelector("#skipDomain");
    this.loadingPanel = this.shadowRoot.querySelector("#loading");
    this.suggestions = this.shadowRoot.querySelector("#suggestions");

    // Events
    this.checkBtn.addEventListener("click", () => this._checkDomain());
    this.confirmBtn.addEventListener("click", () => this._confirmDomain());
    this.cancelBtn.addEventListener("click", () => this._resetChecker());
    this.payBtn.addEventListener("click", () => this._pay());
  }
  
async _waitForRender() {
  while (!this.checkerPanel) {
    await new Promise(r => setTimeout(r, 50));
  }
}

async _checkDomain() {
  const domain = this.domainInput.value.trim();
  if (!domain) return this._set(this.checkStatus, "Enter a domain");

  this._set(this.checkStatus, "Checking…");
  this.suggestions.innerHTML = ""; // clear old suggestions

  const res = await fetch("/api/domain/check-domain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  });

  const data = await res.json();

  // Domain NOT available → show suggestions
  if (!data.available) {
    this._set(this.checkStatus, `${domain} is not available`);
    
    this.confirmArea.classList.add("hidden");
    
    if (data.suggestions?.length) {
      this._renderSuggestions(data.suggestions);
    } else {
      this.suggestions.innerHTML = "<p>No suggestions found.</p>";
    }

    return;
  }

  // Domain IS available
  this._set(this.checkStatus, `${domain} is available — €${(data.price / 100).toFixed(2)}`);
  this.confirmArea.classList.remove("hidden");
  this.selectedDomain = domain;
}
  
_renderSuggestions(list) {
  this.suggestions.innerHTML = "<h4>Available alternatives:</h4>";

  list.forEach(s => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = `${s.domain} — €${(s.price / 100).toFixed(2)}`;

    item.addEventListener("click", () => {
      this.domainInput.value = s.domain;
      this.suggestions.innerHTML = "";
      this._set(this.checkStatus, `${s.domain} selected`);
      this.confirmArea.classList.remove("hidden");
      this.selectedDomain = s.domain;
    });

    this.suggestions.appendChild(item);
  });
}

 async open() {
  await this._waitForRender();

  this.style.display = "flex";

  // Reset panels
  this.checkerPanel.classList.remove("hidden");
  this.paymentPanel.classList.add("hidden");
  this.loadingPanel.classList.add("hidden");

  // Clear previous messages
  this._set(this.checkStatus, "");
  this._set(this.payStatus, "");

  // Reset domain + email
  if (this.domainInput) this.domainInput.value = "";
  if (this.emailInput) this.emailInput.value = "";

  // Hide confirm area
  this.confirmArea.classList.add("hidden");
}
  
async close() {
  this.style.display = "none";
}

  async _confirmDomain() {
    this.checkerPanel.classList.add("hidden");
    this.paymentPanel.classList.remove("hidden");

    const res = await fetch("/api/domain/create-subscription-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.emailInput.value.trim(),
        domain: this.selectedDomain
      })
    });

    const { clientSecret, customerId } = await res.json();
    this.clientSecret = clientSecret;
    this.customerId = customerId;

    // Create Elements group
    const elements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0a66ff",
          borderRadius: "8px",
          fontFamily: "system-ui"
        }
      }
    });

    this.elements = elements; // ⭐ store the Elements group

    // Create Payment Element
    this.paymentElement = elements.create("payment");

    // Mount into LIGHT DOM slot target
    const mountTarget = this.querySelector("[slot='stripe-mount']");
    this.paymentElement.mount(mountTarget);
  }

async _pay() {
  this._set(this.payStatus, "Provisioning your project…");

  // 1. Provision GitHub + Cloudflare
  const provisionRes = await fetch("/api/domain/provision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: this.selectedDomain,
      email: this.emailInput.value.trim(),
      customerId: this.customerId,
      skipDomain: this.skipDomain.checked
    })
  });

  const provision = await provisionRes.json();

  if (!provision.ok) {
    this._set(this.payStatus, "Provisioning failed: " + provision.error);
    return;
  }

  // ⭐ NEW: Upload project files to the newly created repo
  const uploadRes = await fetch("/api/github/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: provision.repo,     // ⭐ repo name returned from provisioning
      ID: window.userId,        // ⭐ your user ID
      template: window.template,// ⭐ your template
      files: window.files       // ⭐ your editor files
    })
  });

  const upload = await uploadRes.json();

  if (!upload.success) {
    this._set(this.payStatus, "Upload failed: " + upload.error);
    return;
  }

  // ⭐ Hide payment panel, show loading panel
  this.paymentPanel.classList.add("hidden");
  this.loadingPanel.classList.remove("hidden");

  // 2. Confirm SetupIntent
  const { error } = await this.stripe.confirmSetup({
    elements: this.elements,
    confirmParams: {
      return_url: `${window.location.origin}/BusinessHud`
    }
  });

  if (error) {
    this.loadingPanel.classList.add("hidden");
    this.paymentPanel.classList.remove("hidden");
    this._set(this.payStatus, error.message);
  }
}


  _resetChecker() {
    this.confirmArea.classList.add("hidden");
    this._set(this.checkStatus, "");
  }

  _set(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }
}

customElements.define("domain-purchase-widget", DomainPurchaseWidget);
