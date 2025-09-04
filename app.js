// লোকাল ডেটা রাখার জন্য
let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

// লিস্ট রেন্ডার করা
function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach(list => {
    const listDiv = document.createElement("div");
    listDiv.className = "list";

    // লিস্টের নাম + ডিলিট বাটন
    const header = document.createElement("h2");
    header.textContent = list.name + " 📝";
    listDiv.appendChild(header);

    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ প্রোডাক্ট যোগ করুন";
    addBtn.onclick = () => addProduct(list.id);
    listDiv.appendChild(addBtn);

    // প্রোডাক্ট লিস্ট
    const ul = document.createElement("ul");
    let total = 0;

    list.products.forEach(product => {
      const li = document.createElement("li");
      li.textContent = `${product.name} - ${product.qty} (${product.price} টাকা) = ${product.qty * product.price} টাকা`;

      total += product.qty * product.price;

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = () => editProduct(list.id, product.id);

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌ Delete";
      delBtn.onclick = () => deleteProduct(list.id, product.id);

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
  lists.push({ id: Date.now(), name, products: [] });
  document.getElementById("listNameInput").value = "";
  renderLists();
}

// প্রোডাক্ট যোগ করা
function addProduct(listId) {
  const name = prompt("প্রোডাক্ট নাম লিখুন:");
  if (!name) return;

  let qty = prompt("পরিমাণ লিখুন:");
  let price = prompt("প্রতি ইউনিটের দাম লিখুন:");

  qty = parseFloat(qty);
  price = parseFloat(price);

  if (isNaN(qty) || isNaN(price)) {
    alert("সংখ্যা সঠিকভাবে লিখুন!");
    return;
  }

  const list = lists.find(l => l.id === listId);
  list.products.push({ id: Date.now(), name, qty, price });
  renderLists();
}

// প্রোডাক্ট এডিট
function editProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  const product = list.products.find(p => p.id === productId);

  const name = prompt("প্রোডাক্ট নাম পরিবর্তন করুন:", product.name);
  let qty = prompt("পরিমাণ পরিবর্তন করুন:", product.qty);
  let price = prompt("দাম পরিবর্তন করুন:", product.price);

  qty = parseFloat(qty);
  price = parseFloat(price);

  if (name) product.name = name;
  if (!isNaN(qty)) product.qty = qty;
  if (!isNaN(price)) product.price = price;

  renderLists();
}

// প্রোডাক্ট ডিলিট
function deleteProduct(listId, productId) {
  const list = lists.find(l => l.id === listId);
  list.products = list.products.filter(p => p.id !== productId);
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

// ডেটা সেভ
function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

// প্রথমবার লোড হলে
renderLists();