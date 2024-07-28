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
    return fetch(`https://script.google.com/macros/s/AKfycbwXZ7b7v2rsGIytMHQMFqHIxu5sP60VFbyfC8bd3ycqi9SDN8j2SIkYw3z79Wn0gKmTwQ/exec?phone=${phoneNumber}`)
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
    return fetch('https://script.google.com/macros/s/AKfycbwXZ7b7v2rsGIytMHQMFqHIxu5sP60VFbyfC8bd3ycqi9SDN8j2SIkYw3z79Wn0gKmTwQ/exec', {
        method: 'POST',
        body: new URLSearchParams({
            'full-name': fullName,
            'phone-number': phoneNumber,
            'code': code
        })
    }).then(response => response.json());
}

function generatePDF(fullName, phoneNumber, code, isNew) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set up the ID card layout
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, 190, 90, 'F'); // Draw the card background

    // Add the logo
    doc.addImage('https://i.ibb.co/7XNQPGC/logo.png', 'PNG', 15, 15, 30, 30);

    // Add user information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(fullName, 60, 25);
    doc.setFontSize(12);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 60, 35);
    doc.text(`İxtiraçı kodu: ${code}`, 60, 45);

    // Add the welcome message
    doc.setFontSize(10);
    const message = isNew
        ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
        : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    doc.text(message, 60, 55, { maxWidth: 130 });

    // Add border and additional styling
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 90); // Draw the card border

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
}
