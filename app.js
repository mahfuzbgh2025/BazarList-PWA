// লোকাল ডেটা রাখার জন্য
let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];
let currentListId = null;

// লিস্ট রেন্ডার করা
function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach(list => {
    const listDiv = document.createElement("div");
    listDiv.className = "list";

    // লিস্টের নাম
    const header = document.createElement("h2");
    header.textContent = list.name + " 📝";
    listDiv.appendChild(header);

    // প্রোডাক্ট যোগ বাটন
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ প্রোডাক্ট যোগ করুন";
    addBtn.onclick = () => addProduct(list.id);
    listDiv.appendChild(addBtn);

    // প্রোডাক্ট লিস্ট
    const ul = document.createElement("ul");
    let total = 0;

    list.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - ${item.qty} (${item.price} টাকা, তারিখ: ${item.date}) = ${item.qty * item.price} টাকা`;

      total += item.qty * item.price;

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = () => editProduct(list.id, item.id);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌ Delete";
      delBtn.onclick = () => deleteProduct(list.id, item.id);

      li.appendChild(editBtn);
      li.appendChild(delBtn);
      ul.appendChild(li);
    });

    listDiv.appendChild(ul);

    // মোট দেখানো
    const totalP = document.createElement("p");
    totalP.textContent = `মোট: ${total} টাকা`;
    listDiv.appendChild(totalP);

    container.appendChild(listDiv);
  });

  saveData();
}

// নতুন লিস্ট যোগ করা
function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) {
    alert("লিস্টের নাম লিখুন!");
    return;
  }
  lists.push({ id: Date.now(), name, items: [] });
  document.getElementById("listNameInput").value = "";
  renderLists();
}

// প্রোডাক্ট ফর্ম খোলা
function addProduct(listId) {
  currentListId = listId;
  document.getElementById("productFormModal").style.display = "block";
  document.getElementById("productDate").value = new Date().toISOString().split("T")[0]; // default আজকের তারিখ
}

// ফর্ম বন্ধ করা
function closeProductForm() {
  document.getElementById("productFormModal").style.display = "none";
  currentListId = null;
}

// প্রোডাক্ট সেভ
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

  // Reset form
  document.getElementById("productName").value = "";
  document.getElementById("productQty").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productDate").value = "";

  closeProductForm();
  renderLists();
}

// প্রোডাক্ট এডিট
function editProduct(listId, itemId) {
  const list = lists.find(l => l.id === listId);
  const item = list.items.find(p => p.id === itemId);

  const name = prompt("প্রোডাক্ট নাম পরিবর্তন করুন:", item.name);
  const date = prompt("তারিখ পরিবর্তন করুন:", item.date);
  let qty = prompt("পরিমাণ পরিবর্তন করুন:", item.qty);
  let price = prompt("দাম পরিবর্তন করুন:", item.price);

  qty = parseFloat(qty);
  price = parseFloat(price);

  if (name) item.name = name;
  if (date) item.date = date;
  if (!isNaN(qty)) item.qty = qty;
  if (!isNaN(price)) item.price = price;

  renderLists();
}

// প্রোডাক্ট ডিলিট
function deleteProduct(listId, itemId) {
  const list = lists.find(l => l.id === listId);
  list.items = list.items.filter(p => p.id !== itemId);
  renderLists();
}

// ব্যাকআপ এক্সপোর্ট
function exportBackup() {
  const data = JSON.stringify(lists);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "bazarlist-backup.json";
  a.click();
}

// ব্যাকআপ ইমপোর্ট
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    lists = JSON.parse(e.target.result);
    renderLists();
  };
  reader.readAsText(file);
}

// PDF ডাউনলোড (লোগোসহ)
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // লোগো লোড
  const loadLogo = () => {
    return new Promise((resolve) => {
      const logo = new Image();
      logo.src = "logo.png";
      logo.onload = () => resolve(logo);
    });
  };

  const logo = await loadLogo();

  // হেডারে লোগো + টাইটেল
  doc.addImage(logo, "PNG", 160, 10, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("🛒 BazarList রিপোর্ট", 20, 25);

  let y = 50; // লিস্ট শুরু

  lists.forEach(list => {
    doc.setFontSize(14);
    doc.text(`লিস্ট: ${list.name}`, 20, y);
    y += 8;

    let total = 0;
    list.items.forEach(item => {
      let line = `${item.name} - ${item.qty} (${item.price} টাকা) তারিখ: ${item.date}`;
      doc.setFontSize(12);
      doc.text(line, 25, y);
      y += 7;
      total += item.qty * item.price;
    });

    doc.setFontSize(13);
    doc.text(`মোট: ${total} টাকা`, 25, y);
    y += 12;
  });

  doc.save("bazarlist.pdf");
}

// ডেটা সেভ
function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// প্রথমবার লোড হলে
renderLists();