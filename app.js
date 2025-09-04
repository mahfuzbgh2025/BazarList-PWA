let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

function saveToLocalStorage() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন!");
  lists.push({ name, products: [] });
  document.getElementById("listNameInput").value = "";
  saveToLocalStorage();
}

function addProduct(listIndex) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <h3>নতুন প্রোডাক্ট যোগ করুন</h3>
    <input id="productName" placeholder="প্রোডাক্ট নাম">
    <input id="productQty" type="number" placeholder="পরিমাণ">
    <input id="productPrice" type="number" placeholder="দাম (৳)">
    <input id="productDate" type="date">
    <button onclick="saveProduct(${listIndex})">✅ সেভ</button>
    <button onclick="closeProductForm()">❌ বাতিল</button>
  `;
  document.body.appendChild(modal);
}

function saveProduct(listIndex) {
  const name = document.getElementById("productName").value.trim();
  const qty = parseFloat(document.getElementById("productQty").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const date = document.getElementById("productDate").value;
  if (!name || isNaN(qty) || isNaN(price)) return alert("সব ঘর পূরণ করুন!");

  lists[listIndex].products.push({ name, qty, price, date });
  closeProductForm();
  saveToLocalStorage();
}

function closeProductForm() {
  document.querySelector(".modal").remove();
}

function deleteProduct(listIndex, productIndex) {
  lists[listIndex].products.splice(productIndex, 1);
  saveToLocalStorage();
}

function editProduct(listIndex, productIndex) {
  const product = lists[listIndex].products[productIndex];
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <h3>প্রোডাক্ট এডিট করুন</h3>
    <input id="productName" value="${product.name}">
    <input id="productQty" type="number" value="${product.qty}">
    <input id="productPrice" type="number" value="${product.price}">
    <input id="productDate" type="date" value="${product.date}">
    <button onclick="updateProduct(${listIndex}, ${productIndex})">✅ আপডেট</button>
    <button onclick="closeProductForm()">❌ বাতিল</button>
  `;
  document.body.appendChild(modal);
}

function updateProduct(listIndex, productIndex) {
  const name = document.getElementById("productName").value.trim();
  const qty = parseFloat(document.getElementById("productQty").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const date = document.getElementById("productDate").value;

  if (!name || isNaN(qty) || isNaN(price)) return alert("সব ঘর পূরণ করুন!");

  lists[listIndex].products[productIndex] = { name, qty, price, date };
  closeProductForm();
  saveToLocalStorage();
}

function deleteList(index) {
  if (confirm("আপনি কি নিশ্চিত লিস্ট মুছতে চান?")) {
    lists.splice(index, 1);
    saveToLocalStorage();
  }
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";
  lists.forEach((list, i) => {
    let total = list.products.reduce((sum, p) => sum + p.price, 0);
    const listDiv = document.createElement("div");
    listDiv.className = "list";
    listDiv.innerHTML = `
      <h2>${list.name} - মোট: ${total} টাকা</h2>
      <button onclick="addProduct(${i})">➕ প্রোডাক্ট যোগ করুন</button>
      <button onclick="deleteList(${i})">🗑️ লিস্ট ডিলিট</button>
      <ul>
        ${list.products.map((p, j) => `
          <li>
            ${p.name} (${p.qty}) - ${p.price} টাকা 
            <small>${p.date || ""}</small>
            <span>
              <button onclick="editProduct(${i}, ${j})">✏️</button>
              <button onclick="deleteProduct(${i}, ${j})">❌</button>
            </span>
          </li>
        `).join("")}
      </ul>
    `;
    container.appendChild(listDiv);
  });
}

/* Backup */
function exportBackup() {
  const blob = new Blob([JSON.stringify(lists)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bazar_backup.json";
  a.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    saveToLocalStorage();
  };
  reader.readAsText(file);
}

/* PDF Download */
function downloadPDF() {
  const content = document.getElementById("listsContainer").innerText;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bazarlist.pdf";
  a.click();
}

renderLists();