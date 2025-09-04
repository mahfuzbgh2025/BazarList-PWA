async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("🛒 BazarList রিপোর্ট", 20, y);
  y += 10;

  const allLists = JSON.parse(localStorage.getItem("bazarLists")) || [];

  allLists.forEach(list => {
    doc.setFontSize(14);
    doc.text(`লিস্ট: ${list.name}`, 20, y);
    y += 8;

    let total = 0;
    list.items.forEach(item => {
      let line = `${item.name} - ${item.quantity} (${item.price} টাকা) তারিখ: ${item.date}`;
      doc.setFontSize(12);
      doc.text(line, 25, y);
      y += 7;
      total += parseFloat(item.price) || 0;
    });

    doc.setFontSize(13);
    doc.text(`মোট: ${total} টাকা`, 25, y);
    y += 12;
  });

  doc.save("bazarlist.pdf");
}