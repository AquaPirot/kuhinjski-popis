// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';

export const generatePDF = (inventoryData) => {
  const doc = new jsPDF();

  const convertSerbianToLatin = (text) => {
    const cyrillicToLatin = {
      'č': 'c', 'Č': 'C',
      'ć': 'c', 'Ć': 'C',
      'š': 's', 'Š': 'S',
      'ž': 'z', 'Ž': 'Z',
      'đ': 'd', 'Đ': 'D'
    };
    return text.replace(/[čćšžđČĆŠŽĐ]/g, (char) => cyrillicToLatin[char] || char);
  };

  doc.setFont('helvetica');

  doc.setFontSize(20);
  doc.text('POPIS ARTIKALA', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Datum: ${inventoryData.datum}`, 20, 40);
  doc.text(`Sastavio: ${convertSerbianToLatin(inventoryData.sastavio)}`, 20, 50);

  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);

  let yPosition = 70;

  const itemsByCategory = {};
  inventoryData.items.forEach((item) => {
    if (item.quantity > 0) {
      const category = item.category || 'Ostalo';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    }
  });

  const categoryOrder = [
    'MESNE PRERAĐEVINE',
    'MLEČNI PROIZVODI',
    'SIREVI',
    'VOĆE I POVRĆE',
    'ŽITARICE I BRAŠNA',
    'TESTENINE',
    'KONZERVIRANI PROIZVODI',
    'ZAČINI I DODACI',
    'ULJA I SIRĆETA',
    'SLATKI PROGRAM',
    'OSTALO'
  ];

  const sortedCategories = categoryOrder.filter(cat => itemsByCategory[cat]);
  Object.keys(itemsByCategory).forEach(cat => {
    if (!categoryOrder.includes(cat)) {
      sortedCategories.push(cat);
    }
  });

  sortedCategories.forEach((category) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(convertSerbianToLatin(category), 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    itemsByCategory[category].forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      const itemName = convertSerbianToLatin(item.name);
      const text = `${itemName}: ${item.quantity} ${item.unit}`;
      doc.text(text, 30, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
  });

  const totalItems = Object.values(itemsByCategory).flat().length;
  const totalQuantity = Object.values(itemsByCategory).flat()
    .reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Ukupno artikala sa kolicinama: ${totalItems}`, 20, yPosition + 10);
  doc.text(`Ukupna kolicina: ${totalQuantity.toFixed(2)}`, 20, yPosition + 16);
  doc.text(`Generisano: ${new Date().toLocaleString('sr-RS')}`, 20, yPosition + 22);

  const fileName = `popis_${inventoryData.datum}_${convertSerbianToLatin(inventoryData.sastavio)}.pdf`;
  doc.save(fileName);
};
