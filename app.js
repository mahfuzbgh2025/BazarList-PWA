let lists = JSON.parse(localStorage.getItem("lists")) || {};

function saveData() {
  localStorage.setItem("lists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (name && !lists[name]) {
    lists[name] = [];
    document.getElementById("listNameInput").value = "";
    saveData();
  }
}

function addProduct(listName) {
  const product = document.getElementById(`productName-${listName}`).value.trim();
  const qty = document.getElementById(`productQty-${listName}`).value.trim();
  const price = parseFloat(document.getElementById(`productPrice-${listName}`).value);

  if (!product || !qty || isNaN(price)) {
    alert("সব ঘর পূরণ করুন (নাম, পরিমাণ, দাম)");
    return;
  }

  lists[listName].push({
    product,
    qty,
    price,
    date: new Date().toISOString().split("T")[0],
  });

  document.getElementById(`productName-${listName}`).value = "";
  document.getElementById(`productQty-${listName}`).value = "";
  document.getElementById(`productPrice-${listName}`).value = "";

  saveData();
}

function deleteProduct(listName, index) {
  lists[listName].splice(index, 1);
  saveData();
}

function editProduct(listName, index) {
  const item = lists[listName][index];
  const newProduct = prompt("পণ্যের নাম পরিবর্তন করুন:", item.product);
  const newQty = prompt("পরিমাণ পরিবর্তন করুন:", item.qty);
  const newPrice = parseFloat(prompt("দাম পরিবর্তন করুন:", item.price));
  if (newProduct && newQty && !isNaN(newPrice)) {
    lists[listName][index] = {
      product: newProduct,
      qty: newQty,
      price: newPrice,
      date: new Date().toISOString().split("T")[0],
    };
    saveData();
  }
}

function deleteList(listName) {
  delete lists[listName];
  saveData();
}

function calculateTotal(listName) {
  return lists[listName].reduce((sum, item) => sum + item.price, 0);
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  for (const listName in lists) {
    const div = document.createElement("div");
    div.className = "list-item";

    const productsHTML = lists[listName]
      .map(
        (item, i) => `
        <div class="product-row">
          <span>📌 <strong>${item.product}</strong> (${item.qty}) - ${item.price}৳ <small>[${item.date}]</small></span>
          <div>
            <button onclick="editProduct('${listName}', ${i})">✏️ এডিট</button>
            <button onclick="deleteProduct('${listName}', ${i})">🗑️ ডিলিট</button>
          </div>
        </div>
      `
      )
      .join("");

    const total = calculateTotal(listName);

    div.innerHTML = `
      <h3>📂 ${listName}</h3>
      ${productsHTML || "<p>কোনো পণ্য যোগ করা হয়নি</p>"}
      <p><strong>মোট: ${total}৳</strong></p>
      <input type="text" id="productName-${listName}" placeholder="পণ্যের নাম">
      <input type="text" id="productQty-${listName}" placeholder="পরিমাণ (কেজি/টি)">
      <input type="number" id="productPrice-${listName}" placeholder="দাম (৳)">
      <button onclick="addProduct('${listName}')">➕ প্রোডাক্ট যোগ করুন</button>
      <br>
      <button onclick="deleteList('${listName}')">❌ লিস্ট মুছুন</button>
      <hr>
    `;
    container.appendChild(div);
  }
}

function exportBackup() {
  const data = JSON.stringify(lists);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bazarlist-backup.json";
  a.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      lists = JSON.parse(e.target.result);
      saveData();
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}

renderLists();