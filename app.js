let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

function saveLists() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
}

function addList() {
  const listName = document.getElementById("listNameInput").value.trim();
  if (!listName) return alert("লিস্টের নাম লিখুন!");

  lists.push({ name: listName, items: [] });
  saveLists();
  renderLists();
  document.getElementById("listNameInput").value = "";
}

function addItem(listIndex) {
  const name = prompt("পণ্যের নাম লিখুন:");
  const qty = prompt("পরিমাণ লিখুন:");
  const price = prompt("দাম লিখুন:");
  const date = prompt("তারিখ লিখুন (DD/MM/YYYY):");

  if (name && qty && price) {
    lists[listIndex].items.push({ name, qty, price: parseFloat(price), date });
    saveLists();
    renderLists();
  }
}

function deleteList(index) {
  if (confirm("আপনি কি এই লিস্টটি মুছে ফেলতে চান?")) {
    lists.splice(index, 1);
    saveLists();
    renderLists();
  }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(lists)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bazar_backup.json";
  a.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    lists = JSON.parse(e.target.result);
    saveLists();
    renderLists();
  };
  reader.readAsText(file);
}

function downloadPDF() {
  let content = "Bazar List\n\n";
  lists.forEach(list => {
    content += `📋 ${list.name}\n`;
    let total = 0;
    list.items.forEach(item => {
      content += `- ${item.name}, ${item.qty}, ${item.price} টাকা, তারিখ: ${item.date}\n`;
      total += item.price;
    });
    content += `👉 মোট: ${total} টাকা\n\n`;
  });

  const blob = new Blob([content], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bazarlist.pdf";
  a.click();
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach((list, index) => {
    let total = list.items.reduce((sum, i) => sum + i.price, 0);
    const div = document.createElement("div");
    div.className = "list-box";
    div.innerHTML = `
      <h3>${list.name} (মোট: ${total} টাকা)</h3>
      <ul>
        ${list.items.map(i => `<li>${i.name} - ${i.qty} - ${i.price} টাকা - ${i.date}</li>`).join("")}
      </ul>
      <button onclick="addItem(${index})">➕ নতুন প্রোডাক্ট</button>
      <button onclick="deleteList(${index})">❌ লিস্ট মুছুন</button>
    `;
    container.appendChild(div);
  });
}

renderLists();