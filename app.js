let lists = JSON.parse(localStorage.getItem("lists")) || [];

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  const date = document.getElementById("listDateInput").value || new Date().toLocaleDateString("bn-BD");

  if (!name) return alert("⚠️ লিস্টের নাম লিখুন");

  lists.push({ name, date, items: [], total: 0 });
  saveLists();

  document.getElementById("listNameInput").value = "";
  document.getElementById("listDateInput").value = "";
}

function addProduct(listIndex) {
  const product = document.getElementById(`product-${listIndex}`).value.trim();
  const qty = document.getElementById(`qty-${listIndex}`).value.trim();
  const price = parseFloat(document.getElementById(`price-${listIndex}`).value);

  if (!product || !qty || isNaN(price)) {
    alert("⚠️ সব ঘর পূরণ করুন (নাম, পরিমাণ, দাম)");
    return;
  }

  lists[listIndex].items.push({ product, qty, price });
  lists[listIndex].total = lists[listIndex].items.reduce((sum, i) => sum + i.price, 0);
  saveLists();
}

function deleteProduct(listIndex, itemIndex) {
  lists[listIndex].items.splice(itemIndex, 1);
  lists[listIndex].total = lists[listIndex].items.reduce((sum, i) => sum + i.price, 0);
  saveLists();
}

function deleteList(index) {
  if (confirm("⚠️ আপনি কি লিস্টটি ডিলিট করতে চান?")) {
    lists.splice(index, 1);
    saveLists();
  }
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  let grandTotal = 0;

  lists.forEach((list, index) => {
    const div = document.createElement("div");
    div.className = "list";

    let itemsHTML = list.items.map((item, i) => `
      <div>
        📌 ${item.product} (${item.qty}) - ${item.price} টাকা
        <button onclick="deleteProduct(${index}, ${i})">❌</button>
      </div>
    `).join("");

    div.innerHTML = `
      <h3>${list.name} 📅 (${list.date})</h3>
      ${itemsHTML || "<p>⚠️ কোনো প্রোডাক্ট যোগ করা হয়নি</p>"}
      <p><strong>মোট: ${list.total} টাকা</strong></p>
      <input type="text" id="product-${index}" placeholder="পণ্যের নাম">
      <input type="text" id="qty-${index}" placeholder="পরিমাণ (কেজি/টি)">
      <input type="number" id="price-${index}" placeholder="দাম (৳)">
      <button onclick="addProduct(${index})">➕ প্রোডাক্ট যোগ করুন</button>
      <br>
      <button onclick="deleteList(${index})">❌ লিস্ট ডিলিট</button>
      <hr>
    `;
    container.appendChild(div);

    grandTotal += list.total;
  });

  if (lists.length > 0) {
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<h2>✅ সব লিস্টের মোট: ${grandTotal} টাকা</h2>`;
    container.appendChild(totalDiv);
  }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(lists)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bazarlist.json";
  a.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    saveLists();
  };
  reader.readAsText(file);
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("🛒 BazarList", 10, 10);

  let y = 20;
  let grandTotal = 0;

  lists.forEach((list, index) => {
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${list.name} (${list.date})`, 10, y);
    y += 6;

    doc.setFontSize(12);
    list.items.forEach((item) => {
      doc.text(`- ${item.product} (${item.qty}) = ${item.price} টাকা`, 15, y);
      y += 6;
    });

    doc.text(`মোট: ${list.total} টাকা`, 15, y);
    y += 10;

    grandTotal += list.total;
  });

  doc.setFontSize(14);
  doc.text(`✅ সব লিস্টের মোট যোগফল: ${grandTotal} টাকা`, 10, y + 5);

  doc.save("bazarlist.pdf");
}

// Init
renderLists();