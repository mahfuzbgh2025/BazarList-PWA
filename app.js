let bazarLists = JSON.parse(localStorage.getItem("bazarLists")) || [];

function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(bazarLists));
}

// লিস্ট যোগ
function addList() {
  const listName = document.getElementById("listNameInput").value.trim();
  if (!listName) return alert("লিস্টের নাম লিখুন");

  bazarLists.push({
    name: listName,
    date: new Date().toLocaleDateString("bn-BD"),
    items: []
  });

  saveData();
  renderLists();
  document.getElementById("listNameInput").value = "";
}

// প্রোডাক্ট যোগ
function addItem(listIndex) {
  const name = prompt("পণ্যের নাম লিখুন:");
  const qty = prompt("পরিমাণ লিখুন:");
  const price = prompt("দাম লিখুন:");

  if (!name || !qty || !price) return;

  bazarLists[listIndex].items.push({
    name,
    qty: parseFloat(qty),
    price: parseFloat(price)
  });

  saveData();
  renderLists();
}

// প্রোডাক্ট ডিলিট
function deleteItem(listIndex, itemIndex) {
  bazarLists[listIndex].items.splice(itemIndex, 1);
  saveData();
  renderLists();
}

// লিস্ট ডিলিট
function deleteList(index) {
  if (!confirm("লিস্ট মুছতে চান?")) return;
  bazarLists.splice(index, 1);
  saveData();
  renderLists();
}

// লিস্ট রেন্ডার
function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  bazarLists.forEach((list, listIndex) => {
    let total = list.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    let div = document.createElement("div");
    div.className = "list-box";
    div.innerHTML = `
      <h2>${list.name} <small>(${list.date})</small></h2>
      <button onclick="addItem(${listIndex})">➕ প্রোডাক্ট যোগ</button>
      <button onclick="deleteList(${listIndex})">❌ লিস্ট ডিলিট</button>
      <ul>
        ${list.items.map((item, i) => `
          <li>
            ${item.name} - ${item.qty} × ${item.price} = ${item.qty * item.price} টাকা
            <button onclick="deleteItem(${listIndex}, ${i})">❌</button>
          </li>
        `).join("")}
      </ul>
      <p><strong>মোট: ${total} টাকা</strong></p>
    `;
    container.appendChild(div);
  });
}

// Backup Export
function exportBackup() {
  const blob = new Blob([JSON.stringify(bazarLists, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bazarlist-backup.json";
  a.click();
}

// Backup Import
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    bazarLists = JSON.parse(e.target.result);
    saveData();
    renderLists();
  };
  reader.readAsText(file);
}

// PDF Download
function downloadPDF() {
  const element = document.getElementById("listsContainer");
  if (!element.innerHTML.trim()) {
    alert("কোনো লিস্ট নেই ডাউনলোড করার মতো।");
    return;
  }
  html2pdf().from(element).save("bazarlist.pdf");
}

// প্রথমবার লোড হলে render
renderLists(); 