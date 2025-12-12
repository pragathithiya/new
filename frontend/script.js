const chatbox = document.getElementById("chatbox");
const msgInput = document.getElementById("msg");

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addMessage(sender, text, rawHtml = false) {
  const div = document.createElement("div");
  div.className = "message";
  const label = `<span class='${sender}'>${escapeHtml(sender)}:</span>`;
  if (rawHtml) {
    div.innerHTML = `${label} ${text}`;
  } else {
    div.innerHTML = `${label} ${escapeHtml(text)}`;
  }
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Append a DOM element as a message (keeps structure and event handlers)
function addMessageElement(sender, element) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message';
  const label = document.createElement('span');
  label.className = sender;
  label.textContent = `${sender}: `;
  wrapper.appendChild(label);
  wrapper.appendChild(element);
  chatbox.appendChild(wrapper);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  msgInput.value = "";

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const errText = await res.text();
      addMessage("bot", `Error: ${res.status} ${errText}`);
      return;
    }

    const data = await res.json();
    // If the response includes a products array, render it as a structured list
    if (data && Array.isArray(data.products)) {
      renderProductsResponse(data);
    } else {
      addMessage("bot", data.reply || JSON.stringify(data));
    }
  } catch (e) {
    addMessage("bot", `Network error: ${e.message}`);
  }
}

function renderProductsResponse(data) {
  const container = document.createElement('div');
  container.className = 'product-list';

  // title / reply
  if (data.reply) {
    const h = document.createElement('div');
    h.className = 'product-list-title';
    h.innerHTML = `<strong>${escapeHtml(data.reply)}</strong>`;
    container.appendChild(h);
  }

  const items = data.products || [];
  if (!items.length) {
    const none = document.createElement('div');
    none.textContent = 'No products found.';
    container.appendChild(none);
    addMessageElement('bot', container);
    return;
  }

  // If array of simple strings
  if (typeof items[0] === 'string') {
    const ul = document.createElement('ul');
    items.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
    container.appendChild(ul);
    addMessageElement('bot', container);
    return;
  }

  // Array of objects: render compact list with expandable details
  const ul = document.createElement('ul');
  ul.className = 'product-items';
  items.forEach(p => {
    const li = document.createElement('li');
    li.className = 'product-item';

    const title = document.createElement('div');
    title.className = 'product-title';
    const titleText = `${p.sku || ''} — ${p.name || 'Unnamed'}`.trim();
    title.textContent = titleText;
    li.appendChild(title);

    const details = document.createElement('div');
    details.className = 'product-details';
    details.style.display = 'none';

    const fields = ['id','sku','name','brand','category','price','stock','description'];
    fields.forEach(f => {
      if (p[f] !== undefined && p[f] !== null) {
        const row = document.createElement('div');
        row.className = 'product-field';
        const key = document.createElement('strong');
        key.textContent = `${f}: `;
        const val = document.createElement('span');
        val.textContent = String(p[f]);
        row.appendChild(key);
        row.appendChild(val);
        details.appendChild(row);
      }
    });

    title.addEventListener('click', () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    li.appendChild(details);
    ul.appendChild(li);
  });

  container.appendChild(ul);
  addMessageElement('bot', container);
}

async function fetchProductsSample() {
  const status = document.getElementById('status');
  status.textContent = 'Status: checking server...';
  try {
    const res = await fetch('http://localhost:5000/products?names=true');
    if (!res.ok) {
      status.textContent = `Status: server error ${res.status}`;
      return;
    }
    const names = await res.json();
    status.textContent = `Status: server OK — ${names.length} products`;
    // show first 10 in chatbox so user sees something
    const sample = names.slice(0, 10).map(n => escapeHtml(n)).join('');
    const html = `<strong>Sample products:</strong><ul>${names
      .slice(0, 10)
      .map(n => `<li>${escapeHtml(n)}</li>`)
      .join('')}</ul>`;
    addMessage('bot', html, true);
  } catch (e) {
    status.textContent = 'Status: cannot reach server';
    addMessage('bot', `Network error: ${e.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('load-products');
  const testBtn = document.getElementById('test-server');
  btn.addEventListener('click', fetchProductsSample);
  testBtn.addEventListener('click', fetchProductsSample);
  // Try once on load so page shows content
  fetchProductsSample();
});
