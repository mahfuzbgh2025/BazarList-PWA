/* ============== BazarList App ============== */
(() => {
  const STORAGE_KEY = "bazarListsV2";

  /** @type {{id:string,name:string,createdAt:number,items:Array<{id:string,name:string,qty:number,price:number,date:string}>}[]} */
  let lists = load();

  // ---------- helpers ----------
  const $ = (q) => document.querySelector(q);
  const today = () => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth()+1).padStart(2,'0');
    const d = String(t.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };
  const uid = () => Math.random().toString(36).slice(2,10);
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(lists)); }
  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ console.warn("Load failed, starting fresh", e); return []; }
  }

  // ---------- rendering ----------
  function render(){
    const wrap = $("#listsContainer");
    wrap.innerHTML = "";

    if(lists.length === 0){
      const empty = document.createElement('div');
      empty.className = "card";
      empty.innerHTML = `<p class="meta">এখনো কোনো লিস্ট নেই। উপরে নাম লিখে “লিস্ট যোগ করুন” বাটনে ক্লিক করুন।</p>`;
      wrap.appendChild(empty);
      return;
    }

    lists.forEach(list => {
      const card = document.createElement('article');
      card.className = "card";
      card.dataset.id = list.id;

      const total = list.items.reduce((s,it)=> s + (Number(it.price)||0), 0);

      card.innerHTML = `
        <header>
          <div>
            <h3>${escapeHtml(list.name)}
              <span class="badge">${list.items.length} আইটেম</span>
            </h3>
            <div class="meta">তৈরি: ${formatDate(list.createdAt)}</div>
          </div>
          <div class="row">
            <button class="btn small ghost" data-act="rename">✏️ নাম বদল</button>
            <button class="btn small ghost" data-act="pdfOne">🖨️ PDF</button>
            <button class="btn small" style="background:var(--accent)" data-act="deleteList">🗑️ লিস্ট ডিলিট</button>
          </div>
        </header>

        <div class="row">
          <input type="text" placeholder="প্রোডাক্ট" data-field="pname">
          <input type="number" min="1" value="1" class="qty" style="width:90px" data-field="qty">
          <input type="number" min="0" step="1" placeholder="দাম" class="price" style="width:120px" data-field="price">
          <input type="date" style="width:160px" value="${today()}" data-field="date">
          <button class="btn small primary" data-act="addItem">➕ যোগ</button>
        </div>

        <div class="items">
          ${list.items.map(item => `
            <div class="item" data-item="${item.id}">
              <div>${escapeHtml(item.name)}</div>
              <div class="qty">${Number(item.qty)}</div>
              <div class="price">${Number(item.price)} টাকা</div>
              <div>${escapeHtml(item.date)}</div>
              <div class="row">
                <button class="btn small ghost" data-act="editItem">✏️</button>
                <button class="btn small" style="background:var(--accent)" data-act="delItem">🗑️</button>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="tot">
          <div class="total">মোট: <strong>${total}</strong> টাকা</div>
        </div>
      `;

      // event delegation for this card
      card.addEventListener('click', (ev)=>{
        const btn = ev.target.closest('button');
        if(!btn) return;
        const act = btn.dataset.act;
        if(!act) return;

        if(act === 'addItem'){
          const pname = card.querySelector('[data-field="pname"]').value.trim();
          const qty   = Number(card.querySelector('[data-field="qty"]').value || 1);
          const price = Number(card.querySelector('[data-field="price"]').value || 0);
          const date  = card.querySelector('[data-field="date"]').value || today();
          if(!pname){ alert("প্রোডাক্টের নাম লিখুন"); return; }
          list.items.push({id:uid(), name:pname, qty, price, date});
          save(); render();
        }

        if(act === 'editItem'){
          const rid = btn.closest('.item').dataset.item;
          const it = list.items.find(i=>i.id===rid);
          if(!it) return;
          const n = prompt("প্রোডাক্টের নাম", it.name) ?? it.name;
          const q = Number(prompt("পরিমাণ", it.qty) ?? it.qty);
          const p = Number(prompt("দাম", it.price) ?? it.price);
          const d = prompt("তারিখ (YYYY-MM-DD)", it.date) ?? it.date;
          Object.assign(it, {name:n.trim()||it.name, qty:q, price:p, date:d});
          save(); render();
        }

        if(act === 'delItem'){
          const rid = btn.closest('.item').dataset.item;
          const ix = list.items.findIndex(i=>i.id===rid);
          if(ix>-1 && confirm("আইটেম ডিলিট করবেন?")){
            list.items.splice(ix,1);
            save(); render();
          }
        }

        if(act === 'deleteList'){
          if(confirm(`"${list.name}" লিস্টটি ডিলিট করবেন?`)){
            lists = lists.filter(x=>x.id!==list.id);
            save(); render();
          }
        }

        if(act === 'rename'){
          const newName = prompt("নতুন লিস্টের নাম", list.name);
          if(newName && newName.trim()){
            list.name = newName.trim();
            save(); render();
          }
        }

        if(act === 'pdfOne'){
          printLists([list]);
        }
      });

      wrap.appendChild(card);
    });
  }

  // ---------- actions (top) ----------
  function addList(){
    const input = $("#listNameInput");
    const name = input.value.trim();
    if(!name){ alert("লিস্টের নাম দিন"); return; }
    lists.push({id:uid(), name, createdAt:Date.now(), items:[]});
    input.value = "";
    save(); render();
  }

  function exportBackup(){
    const data = JSON.stringify({version:2, exportedAt:Date.now(), lists}, null, 2);
    const blob = new Blob([data], {type:"application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `bazarlist-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importBackup(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try{
        const obj = JSON.parse(fr.result);
        if(obj && Array.isArray(obj.lists)){
          lists = obj.lists;
          save(); render();
          alert("ইমপোর্ট সফল ✅");
        }else{
          alert("ফাইল ফরম্যাট সঠিক নয়");
        }
      }catch(err){
        alert("ইমপোর্ট ব্যর্থ");
      }
      e.target.value = ""; // allow re-select
    };
    fr.readAsText(file);
  }

  function downloadPDF(){
    // সব লিস্ট প্রিন্ট করবে
    if(lists.length === 0){ alert("প্রিন্ট করার মতো কিছু নেই"); return; }
    printLists(lists);
  }

  // ---------- printing (no external lib) ----------
  function printLists(srcLists){
    const div = document.getElementById('printArea');
    div.innerHTML = srcLists.map(L => {
      const total = L.items.reduce((s,it)=>s+(Number(it.price)||0),0);
      const rows = L.items.map((it,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${escapeHtml(it.name)}</td>
          <td class="print-right">${Number(it.qty)}</td>
          <td class="print-right">${Number(it.price)}</td>
          <td>${escapeHtml(it.date)}</td>
        </tr>
      `).join("");

      return `
        <section style="margin:0 0 22px">
          <h2 class="print-title">${escapeHtml(L.name)}</h2>
          <div class="print-date">তৈরি: ${formatDate(L.createdAt)} | মোট: ${total} টাকা</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>#</th><th>প্রোডাক্ট</th><th>পরিমাণ</th><th>দাম</th><th>তারিখ</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="5">কোনো আইটেম নেই</td></tr>`}</tbody>
            <tfoot>
              <tr>
                <th colspan="3">মোট</th>
                <th class="print-right">${total}</th>
                <th>টাকা</th>
              </tr>
            </tfoot>
          </table>
        </section>
      `;
    }).join("");

    // print view
    window.print();
    // cleanup not strictly necessary
  }

  // ---------- utils ----------
  function escapeHtml(s){
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }
  function formatDate(ts){
    try{
      const d = new Date(ts);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const dd = String(d.getDate()).padStart(2,'0');
      return `${dd}/${m}/${y}`;
    }catch{ return ""; }
  }

  // expose globals used in index.html
  window.addList = addList;
  window.exportBackup = exportBackup;
  window.importBackup = importBackup;
  window.downloadPDF = downloadPDF;

  // initial render
  render();
})();