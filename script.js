document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    checkPhoneNumber(phoneNumber).then(existingCode => {
        if (existingCode) {
            generatePDF(fullName, phoneNumber, existingCode, false);
        } else {
            const newCode = generateNewCode();
            saveUserInfo(fullName, phoneNumber, newCode).then(() => {
                generatePDF(fullName, phoneNumber, newCode, true);
            });
        }
    });
});

function checkPhoneNumber(phoneNumber) {
    return fetch(`https://script.google.com/macros/s/AKfycbzVK55eIuHdTUxPm2RzZ83H3zlRmDHW7Z-R_J4WtFNSYOEKqJJVSwOC4gFYDKugK1S2mA/exec?phone=${phoneNumber}`)
        .then(response => response.json())
        .then(data => data.code);
}

function generateNewCode() {
    const lastCode = localStorage.getItem('lastCode') || 1000;
    const newCode = parseInt(lastCode) + 1;
    localStorage.setItem('lastCode', newCode);
    return newCode;
}

function saveUserInfo(fullName, phoneNumber, code) {
    const date = new Date().toLocaleDateString('az-AZ');
    return fetch('https://script.google.com/macros/s/AKfycbzVK55eIuHdTUxPm2RzZ83H3zlRmDHW7Z-R_J4WtFNSYOEKqJJVSwOC4gFYDKugK1S2mA/exec', {
        method: 'POST',
        body: new URLSearchParams({
            'full-name': fullName,
            'phone-number': phoneNumber,
            'code': code,
            'date': date
        })
    }).then(response => response.json());
}

function generatePDF(fullName, phoneNumber, code, isNew) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set font styles and sizes
    doc.setFont('helvetica');
    doc.setFontSize(14);

    // Add content
    doc.setFont(undefined, 'bold');
    doc.text('İxtiraçı Kodunu Öyrən', 10, 20);

    doc.setFont(undefined, 'normal');
    doc.text(`Ad Soyad Ata adı: ${fullName}`, 10, 30);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 10, 40);
    doc.text(`İxtiraçı kodu: ${code}`, 10, 50);

    const message = isNew
        ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
        : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    doc.text(message, 10, 60);

    // Compress the image before adding
    const logo = new Image();
    logo.src = 'https://i.ibb.co/7XNQPGC/logo.png';
    logo.onload = function () {
        doc.addImage(logo, 'PNG', 10, 70, 40, 40);

        // Open PDF in new tab for mobile devices
        const pdfOutput = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfOutput);
        const link = document.createElement('a');
        link.href = pdfURL;
        link.target = '_blank';
        link.download = 'ixtiraçi_kodu.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
