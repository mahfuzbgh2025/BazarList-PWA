document.addEventListener("DOMContentLoaded", () => {
  const addListBtn = document.getElementById("addListBtn");
  const listNameInput = document.getElementById("listName");
  const listsContainer = document.getElementById("listsContainer");
  const totalAmountEl = document.getElementById("totalAmount");

  let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];

  function renderLists() {
    listsContainer.innerHTML = "";
    let total = 0;

    lists.forEach((item, index) => {
      total += item.price;

      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <strong>${item.name}</strong> - ${item.quantity} (${item.price} টাকা)
        <button onclick="editItem(${index})">✏️ Edit</button>
        <button onclick="deleteItem(${index})">❌ Delete</button>
      `;
      listsContainer.appendChild(div);
    });

    totalAmountEl.textContent = `মোট: ${total} টাকা`;
    localStorage.setItem("bazarLists", JSON.stringify(lists));
  }

  addListBtn.addEventListener("click", () => {
    const name = listNameInput.value.trim();
    if (!name) {
      alert("লিস্টের নাম লিখুন!");
      return;
    }

    const quantity = prompt("পরিমাণ লিখুন (যেমন: 2 কেজি)") || "1";
    const price = parseInt(prompt("মূল্য লিখুন (টাকায়)") || "0");

    lists.push({ name, quantity, price });
    listNameInput.value = "";
    renderLists();
  });

  // Delete Item
  window.deleteItem = (index) => {
    if (confirm("আপনি কি মুছে ফেলতে চান?")) {
      lists.splice(index, 1);
      renderLists();
    }
  };

  // Edit Item
  window.editItem = (index) => {
    const item = lists[index];
    const newName = prompt("নতুন নাম লিখুন:", item.name) || item.name;
    const newQuantity = prompt("পরিমাণ ঠিক করুন:", item.quantity) || item.quantity;
    const newPrice = parseInt(prompt("নতুন মূল্য:", item.price)) || item.price;

    lists[index] = { name: newName, quantity: newQuantity, price: newPrice };
    renderLists();
  };

  // Backup Export
  window.exportBackup = () => {
    const blob = new Blob([JSON.stringify(lists)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bazarlist_backup.json";
    a.click();
  };

  // Import Backup
  window.importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      lists = JSON.parse(e.target.result);
      renderLists();
    };
    reader.readAsText(file);
  };

  renderLists();
});