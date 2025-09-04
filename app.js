// সব ডেটা লিস্ট ধরে রাখার জন্য
let lists = [];

// নতুন লিস্ট যোগ করা
function addList() {
  const nameInput = document.getElementById("listNameInput");
  const listName = nameInput.value.trim();
  if (!listName) return alert("লিস্টের নাম লিখুন");

  const newList = {
    id: Date.now(),
    name: listName,
    date: new Date().toLocaleDateString("bn-BD"),
    products: []
  };

  lists.push(newList);
  nameInput.value = "";
  renderLists();
  saveData();
}

// লিস্ট রেন্ডার করা
function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  let grandTotal = 0;

  lists.forEach(list => {
    let listTotal = list.products.reduce((sum, p) => sum + (p.price * p.qty), 0);
    grandTotal += listTotal;

    const listDiv = document.createElement("div");
    listDiv.className = "list";

    listDiv.innerHTML = `
      <h3>${list.name} <small>(${list.date})</small></h3>
      <div id="products-${list.id}">
        ${list.products.map(p => `
          <div>
            ${p.name} - ${p.qty} × ${p.price} = ${p.qty * p.price} টাকা
            <button onclick="editProduct(${list.id}, ${p.id})">✏️ Edit</button>
            <button onclick="deleteProduct(${list.id}, ${p.id})">❌ Delete</button>
          </div>
        `).join("")}
      </div>
      <button onclick="addProduct(${list.id})">➕ প্রোডাক্ট যোগ করুন</button>
      <p><strong>মোট: ${listTotal} টাকা</strong></p>
      <hr>
    `;

    container.appendChild(listDiv);
  });

  if (lists.length > 0) {
    const totalDiv = document.createElement("h2");
    totalDiv.textContent = `সর্বমোট: ${grandTotal} টাকা`;
    container.appendChild(totalDiv);
  }
}

// প্রোডাক্ট যোগ করা
function addProduct(listId) {
  const name = prompt("প্রোডাক্ট নাম লিখুন:");
  const qty = parseFloat(prompt("পরিমাণ লিখুন:"));
  const price = parseFloat(prompt("প্রতি ইউনিটের দাম লিখুন:"));
  if (!name || isNaN(qty) || isNaN(price)) return;

  const list = lists.find(l => l.id === listId);
  list.products.push({ id: Date.now(), name, qty, price });
  renderLists();
  saveData();
}

// প্রোডাক্ট এডিট করা
function editProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  const product = list.products.find(p => p.id === productId);

  const newName = prompt("নতুন নাম:", product.name) || product.name;
  const newQty = parseFloat(prompt("নতুন পরিমাণ:", product.qty)) || product.qty;
  const newPrice = parseFloat(prompt("নতুন দাম:", product.price)) || product.price;

  product.name = newName;
  product.qty = newQty;
  product.price = newPrice;

  renderLists();
  saveData();
}

// প্রোডাক্ট ডিলিট করা
function deleteProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  list.products = list.products.filter(p => p.id !== productId);
  renderLists();
  saveData();
}

// ব্যাকআপ এক্সপোর্ট
function exportBackup() {
  const dataStr = JSON.stringify(lists, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bazarlist_backup.json";
  link.click();
}

// ব্যাকআপ ইম্পোর্ট
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    renderLists();
    saveData();
  };
  reader.readAsText(file);
}

// লোকালস্টোরেজে ডেটা সেভ
function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// লোকালস্টোরেজ থেকে ডেটা লোড
function loadData() {
  const saved = localStorage.getItem("bazarLists");
  if (saved) lists = JSON.parse(saved);
  renderLists();
}

// PDF ডাউনলোড
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("🛒 BazarList রিপোর্ট", 20, y);
  y += 10;

  lists.forEach(list => {
    doc.setFontSize(14);
    doc.text(`${list.name} (${list.date})`, 20, y);
    y += 8;

    list.products.forEach(p => {
      doc.setFontSize(12);
      doc.text(`${p.name} - ${p.qty} × ${p.price} = ${p.qty * p.price} টাকা`, 25, y);
      y += 7;
    });

    let listTotal = list.products.reduce((sum, p) => sum + (p.price * p.qty), 0);
    doc.text(`মোট: ${listTotal} টাকা`, 25, y);
    y += 12;
  });

  doc.save("BazarList.pdf");
}

// শুরুতে ডেটা লোড হবে
window.onload = loadData;