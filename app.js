let lists = JSON.parse(localStorage.getItem("lists")) || [];

function saveData() {
  localStorage.setItem("lists", JSON.stringify(lists));
  renderLists();
}

function addList() {
  const name = document.getElementById("listNameInput").value.trim();
  if (!name) return alert("লিস্টের নাম লিখুন!");
  lists.push({ name, items: [] });
  saveData();
  document.getElementById("listNameInput").value = "";
}

function addItem(listIndex) {
  const itemName = prompt("পণ্যের নাম লিখুন:");
  const qty = parseInt(prompt("পরিমাণ লিখুন:"), 10);
  const price = parseInt(prompt("প্রতি ইউনিট দাম লিখুন:"), 10);
  const date = new Date().toLocaleDateString("bn-BD");

  if (!itemName || isNaN(qty) || isNaN(price)) return;
  lists[listIndex].items.push({ itemName, qty, price, date });
  saveData();
}

function deleteList(index) {
  if (confirm("আপনি কি লিস্ট মুছে ফেলতে চান?")) {
    lists.splice(index, 1);
    saveData();
  }
}

function deleteItem(listIndex, itemIndex) {
  lists[listIndex].items.splice(itemIndex, 1);
  saveData();
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";
  lists.forEach((list, i) => {
    let total = list.items.reduce((sum, it) => sum + (it.qty * it.price), 0);
    let html = `<div class="list"><h3>${list.name} - মোট: ${total} টাকা 
                <button onclick="deleteList(${i})">❌ মুছুন</button>
                <button onclick="addItem(${i})">➕ পণ্য যোগ করুন</button></h3>`;
    list.items.forEach((item, j) => {
      html += `<p>${item.itemName} - ${item.qty} × ${item.price} = ${item.qty * item.price} টাকা (${item.date})
               <button onclick="deleteItem(${i},${j})">❌</button></p>`;
    });
    html += "</div>";
    container.innerHTML += html;
  });
}

function exportBackup() {
  const data = JSON.stringify(lists);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup.json";
  a.click();
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
  const element = document.createElement("div");
  lists.forEach(list => {
    let total = list.items.reduce((sum, it) => sum + (it.qty * it.price), 0);
    element.innerHTML += `<h2>${list.name} (মোট: ${total} টাকা)</h2>`;
    list.items.forEach(it => {
      element.innerHTML += `<p>${it.itemName} - ${it.qty} × ${it.price} = ${it.qty * it.price} টাকা (${it.date})</p>`;
    });
    element.innerHTML += "<hr>";
  });
  const opt = { margin: 1, filename: "BazarList.pdf", html2canvas: {}, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } };
  html2pdf().from(element).set(opt).save();
}

renderLists();