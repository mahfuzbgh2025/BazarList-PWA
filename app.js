let lists = JSON.parse(localStorage.getItem("lists")) || [];

function saveData() {
  localStorage.setItem("lists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন");

  lists.push({ name, items: [] });
  document.getElementById("listNameInput").value = "";
  saveData();
}

function addItem(listIndex) {
  const product = prompt("পণ্যের নাম দিন:");
  const qty = prompt("পরিমাণ দিন:");
  const price = prompt("মূল্য দিন:");
  const date = prompt("তারিখ দিন (DD/MM/YYYY):");

  if (!product || !qty || !price) return;

  lists[listIndex].items.push({
    product,
    qty,
    price: parseFloat(price),
    date: date || new Date().toLocaleDateString("bn-BD")
  });

  saveData();
}

function deleteItem(listIndex, itemIndex) {
  lists[listIndex].items.splice(itemIndex, 1);
  saveData();
}

function deleteList(index) {
  if (confirm("আপনি কি লিস্ট মুছে ফেলতে চান?")) {
    lists.splice(index, 1);
    saveData();
  }
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach((list, listIndex) => {
    let total = list.items.reduce((sum, item) => sum + item.price, 0);

    let div = document.createElement("div");
    div.className = "list";

    div.innerHTML = `
      <h2>${list.name} (মোট: ${total} টাকা)</h2>
      <button onclick="addItem(${listIndex})">➕ প্রোডাক্ট যোগ করুন</button>
      <button onclick="deleteList(${listIndex})">❌ লিস্ট মুছুন</button>
      <ul>
        ${list.items.map((item, itemIndex) => `
          <li>
            ${item.product} - ${item.qty} - ${item.price} টাকা - [${item.date}]
            <button onclick="deleteItem(${listIndex}, ${itemIndex})">❌</button>
          </li>
        `).join("")}
      </ul>
    `;

    container.appendChild(div);
  });
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(lists)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bazarlist-backup.json";
  link.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    saveData();
  };
  reader.readAsText(file);
}

function downloadPDF() {
  let content = "BazarList Report\n\n";
  lists.forEach(list => {
    content += `লিস্ট: ${list.name}\n`;
    list.items.forEach(item => {
      content += `- ${item.product}, ${item.qty}, ${item.price} টাকা, তারিখ: ${item.date}\n`;
    });
    content += `মোট: ${list.items.reduce((sum, i) => sum + i.price, 0)} টাকা\n\n`;
  });

  const blob = new Blob([content], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "BazarList.pdf";
  link.click();
}

renderLists();