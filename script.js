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
    const doc = new jsPDF('landscape');

    // Background and border
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F'); // A4 landscape size

    // Add the logo
    doc.addImage('https://i.ibb.co/7XNQPGC/logo.png', 'PNG', 250, 10, 35, 35);

    // Add user information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('UAV OPERATORS CERTIFICATE', 15, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('UNITED STATES OF AMERICA', 15, 28);

    // Add red text
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(14);
    doc.text(`UAVID-${code}`, 15, 38);

    // Add blue text
    doc.setTextColor(0, 0, 255);
    doc.setFontSize(10);
    doc.text('First', 15, 50);
    doc.text('Last', 55, 50);

    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(fullName, 15, 60); // Assuming fullName contains both first and last name

    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 15, 70);
    doc.text(`İxtiraçı kodu: ${code}`, 15, 80);

    // Add the welcome message
    doc.setFontSize(10);
    const message = isNew
        ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
        : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    doc.text(message, 15, 90, { maxWidth: 260 });

    // Add photo placeholder or user's photo if available
    // For this example, we'll use a placeholder image
    doc.addImage('https://via.placeholder.com/50', 'PNG', 250, 50, 35, 45);

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
