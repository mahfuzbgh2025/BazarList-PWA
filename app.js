// PDF ডাউনলোড
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // লোগো যোগ করা
  const logo = new Image();
  logo.src = "logo.png"; // আপনার রিপোতে আপলোড করা logo.png ব্যবহার হবে

  logo.onload = function () {
    doc.addImage(logo, "PNG", 160, 10, 30, 30); // ডানদিকে লোগো
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("🛒 BazarList রিপোর্ট", 20, 25);

    let y = 50; // লিস্ট শুরুর জায়গা

    lists.forEach(list => {
      doc.setFontSize(14);
      doc.text(`লিস্ট: ${list.name}`, 20, y);
      y += 8;

      let total = 0;
      list.items.forEach(item => {
        let line = `${item.name} - ${item.qty} (${item.price} টাকা) তারিখ: ${item.date}`;
        doc.setFontSize(12);
        doc.text(line, 25, y);
        y += 7;
        total += item.qty * item.price;
      });

      doc.setFontSize(13);
      doc.text(`মোট: ${total} টাকা`, 25, y);
      y += 12;
    });

    doc.save("bazarlist.pdf");
  };
}