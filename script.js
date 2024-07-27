document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    fetch('https://script.google.com/macros/s/AKfycbzlp4-YqmAwEU7g4fxOH2lxX9Y0g0m51FdxPs8Ov5p9q3zvwWZXL95d9DFEQ8oinE9k2g/exec', {
        method: 'POST',
        body: JSON.stringify({ fullName, phoneNumber }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            generatePDF(fullName, phoneNumber, data.code, false);
        } else {
            generatePDF(fullName, phoneNumber, data.code, true);
        }
    })
    .catch(error => console.error('Error:', error));
});

function generatePDF(fullName, phoneNumber, code, isNew) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Ad Soyad Ata adı: ${fullName}`, 10, 20);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 10, 30);
    doc.text(`İxtiraçı kodu: ${code}`, 10, 40);

    if (isNew) {
        doc.text('İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.', 10, 50);
    } else {
        doc.text('Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.', 10, 50);
    }

    doc.addImage('https://i.ibb.co/7XNQPGC/logo.png', 'PNG', 10, 60, 50, 50);

    const pdfOutput = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfOutput);
    window.open(pdfURL, '_blank');
}
