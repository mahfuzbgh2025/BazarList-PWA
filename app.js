document.addEventListener("DOMContentLoaded", () => {
  let lists = JSON.parse(localStorage.getItem("bazarLists")) || [];
  renderLists();

  const listsContainer = document.getElementById("listsContainer");
  const listNameInput = document.getElementById("listName");

  // ✅ নতুন লিস্ট তৈরি
  window.createList = () => {
    const name = listNameInput.value.trim();
    if (!name) {
      alert("দয়া করে লিস্টের নাম লিখুন");
      return;
    }
    lists.push({ id: Date.now(), name, items: [] });
    listNameInput.value = "";
    saveLists();
    renderLists();
  };

  // ✅ Render Lists & Items
  function renderLists() {
    listsContainer.innerHTML = "";
    let totalAmount = 0;

    lists.forEach((list) => {
      const div = document.createElement("div");
      div.className = "list";

      const h2 = document.createElement("h2");
      h2.textContent = list.name;
      div.appendChild(h2);

      // ➕ Add Item Form
      const form = document.createElement("form");
      form.className = "item-form";
      form.innerHTML = `
        <input type="text" placeholder="পণ্যের নাম" required>
        <input type="date" required>
        <input type="number" placeholder="দাম (৳)" required>
        <input type="number" step="0.1" placeholder="পরিমাণ (কেজি/লিটার)">
        <button type="submit">➕</button>
      `;
      div.appendChild(form);

      const ul = document.createElement("ul");
      div.appendChild(ul);

      // Render Items
      list.items.forEach((item) => {
        totalAmount += item.amount;
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <strong>${item.name}</strong> (${item.date}) - ৳${item.amount}
            ${item.quantity ? `, ${item.quantity} কেজি` : ""}
          </div>
          <div>
            <button class="edit">✏️</button>
            <button class="delete">🗑️</button>
          </div>
        `;

        // Edit Item
        li.querySelector(".edit").addEventListener("click", () => {
          const newName = prompt("পণ্যের নাম পরিবর্তন করুন:", item.name);
          if (newName !== null) item.name = newName;

          const newDate = prompt("তারিখ পরিবর্তন করুন:", item.date);
          if (newDate !== null) item.date = newDate;

          const newAmount = prompt("দাম পরিবর্তন করুন (৳):", item.amount);
          if (newAmount !== null) item.amount = parseFloat(newAmount) || item.amount;

          const newQty = prompt("পরিমাণ পরিবর্তন করুন (কেজি/লিটার):", item.quantity);
          if (newQty !== null) item.quantity = parseFloat(newQty) || item.quantity;

          saveLists();
          renderLists();
        });

        // Delete Item
        li.querySelector(".delete").addEventListener("click", () => {
          if (confirm("আপনি কি নিশ্চিত যে এই আইটেম মুছতে চান?")) {
            list.items = list.items.filter((i) => i !== item);
            saveLists();
            renderLists();
          }
        });

        ul.appendChild(li);
      });

      // Add Item Submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const [name, date, amount, qty] = form.querySelectorAll("input");
        const newItem = {
          id: Date.now(),
          name: name.value,
          date: date.value,
          amount: parseFloat(amount.value),
          quantity: parseFloat(qty.value) || 0,
        };
        list.items.push(newItem);
        saveLists();
        renderLists();
        form.reset();
      });

      listsContainer.appendChild(div);
    });

    // ✅ মোট খরচ দেখানো
    const totalDiv = document.createElement("div");
    totalDiv.className = "total-container";
    totalDiv.textContent = `মোট খরচ: ৳${totalAmount}`;
    listsContainer.appendChild(totalDiv);
  }

  // ✅ Save to LocalStorage
  function saveLists() {
    localStorage.setItem("bazarLists", JSON.stringify(lists));
  }

  // ✅ Export Backup
  window.exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lists));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "bazarlist-backup.json");
    dl.click();
  };

  // ✅ Import Backup
  window.importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        lists = JSON.parse(e.target.result);
        saveLists();
        renderLists();
        alert("Backup restore সফল হয়েছে ✅");
      } catch {
        alert("ফাইল সঠিক নয় ❌");
      }
    };
    reader.readAsText(file);
  };
});
