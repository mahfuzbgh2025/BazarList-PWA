let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];
let currentListId = null;

// লিস্ট রেন্ডার
function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach(list => {
    let total = list.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    const div = document.createElement("div");
    div.className = "list";

    div.innerHTML = `
      <h2>${list.name}</h2>
      <button onclick="showProductForm(${list.id})">➕ প্রোডাক্ট যোগ করুন</button>
      <ul>
        ${list.items.map(item => `
          <li>
            ${item.name} - ${item.qty} x ${item.price} = ${item.qty * item.price} টাকা
            <small>(${item.date})</small>
            <button onclick="editProduct(${list.id}, ${item.id})">✏️ Edit</button>
            <button onclick="deleteProduct(${list.id}, ${item.id})">❌ Delete</button>
          </li>
        `).join("")}
      </ul>
      <p><b>মোট:</b> ${total} টাকা</p>
    `;

    container.appendChild(div);
  });

  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// নতুন লিস্ট যোগ
function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন!");

  lists.push({ id: Date.now(), name, items: [] });
  document.getElementById("listNameInput").value = "";
  renderLists();
}

// প্রোডাক্ট ফর্ম দেখানো
function showProductForm(listId) {
  currentListId = listId;
  document.getElementById("productFormModal").style.display = "block";
}

// প্রোডাক্ট ফর্ম বন্ধ করা
function closeProductForm() {
  document.getElementById("productFormModal").style.display = "none";
  document.getElementById("productName").value = "";
  document.getElementById("productQty").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDate").value = "";
}

// প্রোডাক্ট সেভ করা
function saveProduct() {
  const name = document.getElementById("productName").value.trim();
  const qty = parseFloat(document.getElementById("productQty").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const date = document.getElementById("productDate").value;

  if (!name || isNaN(qty) || isNaN(price) || !date) {
    alert("সব ফিল্ড পূরণ করুন!");
    return;
  }

  const list = lists.find(l => l.id === currentListId);
  list.items.push({ id: Date.now(), name, qty, price, date });

  closeProductForm();
  renderLists();
}

// প্রোডাক্ট ডিলিট
function deleteProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  list.items = list.items.filter(item => item.id !== productId);
  renderLists();
}

// প্রোডাক্ট এডিট
function editProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  const item = list.items.find(i => i.id === productId);

  document.getElementById("productName").value = item.name;
  document.getElementById("productQty").value = item.qty;
  document.getElementById("productPrice").value = item.price;
  document.getElementById("productDate").value = item.date;

  deleteProduct(listId, productId); // আগেরটা মুছে ফেলে নতুন যোগ হবে
  showProductForm(listId);
}

// Backup Export
function exportBackup() {
  const blob = new Blob([JSON.stringify(lists, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bazarlist_backup.json";
  link.click();
}

// Backup Import
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    renderLists();
  };
  reader.readAsText(file);
}

// PDF Download
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  doc.text("🛒 BazarList", 10, y);
  y += 10;

  lists.forEach(list => {
    doc.text(`📌 ${list.name}`, 10, y);
    y += 10;
    list.items.forEach(item => {
      doc.text(`- ${item.name} | ${item.qty} x ${item.price} = ${item.qty * item.price} টাকা (${item.date})`, 10, y);
      y += 8;
    });
    let total = list.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
    doc.text(`মোট: ${total} টাকা`, 10, y);
    y += 12;
  });

  doc.save("bazarlist.pdf");
}

// প্রথমবার লোড হলে রেন্ডার
renderLists();