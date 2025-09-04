let currentListId = null;

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