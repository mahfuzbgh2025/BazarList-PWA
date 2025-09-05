let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

function saveData() {
  localStorage.setItem("bazarLists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন!");
  lists.push({ name, products: [] });
  saveData();
  document.getElementById("listNameInput").value = "";
}

function addProduct(listIndex) {
  const pname = prompt("পণ্যের নাম লিখুন:");
  const qty = prompt("পরিমাণ (যেমন: ২ কেজি):");
  const price = parseFloat(prompt("দাম (টাকায়):")) || 0;
  const date = new Date().toLocaleDateString("bn-BD");

  if (pname) {
    lists[listIndex].products.push({ pname, qty, price, date });
    saveData();
  }
}

function deleteList(index) {
  if (confirm("আপনি কি লিস্টটি মুছে ফেলতে চান?")) {
    lists.splice(index, 1);
    saveData();
  }
}

function deleteProduct(listIndex, productIndex) {
  lists[listIndex].products.splice(productIndex, 1);
  saveData();
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  lists.forEach((list, listIndex) => {
    let total = list.products.reduce((sum, p) => sum + p.price, 0);

    let div = document.createElement("div");
    div.className = "list";

    div.innerHTML = `
      <h3>${list.name} <button onclick="deleteList(${listIndex})">❌</button></h3>
      <button onclick="addProduct(${listIndex})">➕ নতুন প্রোডাক্ট</button>
      <ul>
        ${list.products
          .map(
            (p, i) =>
              `<li>${p.pname} - ${p.qty} (${p.price} টাকা) 🗓️ ${p.date}
                <button onclick="deleteProduct(${listIndex},${i})">❌</button>
              </li>`
          )
          .join("")}
      </ul>
      <strong>মোট: ${total} টাকা</strong>
    `;

    container.appendChild(div);
  });
}

function exportBackup() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(lists));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "bazar_backup.json");
  dlAnchor.click();
}

function importBackup(event) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    lists = JSON.parse(fileReader.result);
    saveData();
  };
  fileReader.readAsText(event.target.files[0]);
}

function downloadPDF() {
  let content = "🛒 Bazar List\n\n";
  lists.forEach((list) => {
    content += `📌 ${list.name}\n`;
    list.products.forEach(
      (p) =>
        (content += `- ${p.pname} (${p.qty}) = ${p.price} টাকা | ${p.date}\n`)
    );
    content += `মোট: ${list.products.reduce(
      (sum, p) => sum + p.price,
      0
    )} টাকা\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bazarlist.pdf";
  link.click();
}

renderLists();