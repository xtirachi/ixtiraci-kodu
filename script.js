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
    return fetch(`https://script.google.com/macros/s/AKfycbzw1oetgdWIgVPcqdntsqMyWisnUXL2wQG7HoT4NbICP8nXEda7GM10llcqXf6qX2HT7w/exec?phone=${phoneNumber}`)
        .then(response => response.json())
        .then(data => data.code);
}

function generateNewCode() {
    // This function should generate a unique 4-digit code.
    // For simplicity, this example increments from 1001 stored in the browser.
    const lastCode = localStorage.getItem('lastCode') || 1000;
    const newCode = parseInt(lastCode) + 1;
    localStorage.setItem('lastCode', newCode);
    return newCode;
}

function saveUserInfo(fullName, phoneNumber, code) {
    return fetch('https://script.google.com/macros/s/AKfycbzw1oetgdWIgVPcqdntsqMyWisnUXL2wQG7HoT4NbICP8nXEda7GM10llcqXf6qX2HT7w/exec/exec', {
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
