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

    // Add header
    doc.setFont(undefined, 'bold');
    doc.text('İxtiraçı Kodunu Öyrən', 105, 20, null, null, 'center');

    // Add user details
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Ad Soyad Ata adı: ${fullName}`, 10, 40);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 10, 50);
    doc.text(`İxtiraçı kodu: ${code}`, 10, 60);

    // Add message
    const message = isNew
        ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
        : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    doc.text(message, 10, 80, { maxWidth: 190 });

    // Add compressed logo
    const logo = new Image();
    logo.src = 'https://i.ibb.co/7XNQPGC/logo.png';
    logo.onload = function () {
        doc.addImage(logo, 'PNG', 10, 100, 40, 40);

        // Generate the PDF
        const pdfOutput = doc.output('datauristring');
        const iframe = document.createElement('iframe');
        iframe.src = pdfOutput;
        iframe.width = '100%';
        iframe.height = '500px';
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';  // Clear previous result
        resultDiv.appendChild(iframe);

        // Create a download link
        const link = document.createElement('a');
        link.href = pdfOutput;
        link.download = 'ixtiraçi_kodu.pdf';
        link.textContent = 'PDF-i Yüklə';
        link.style.display = 'block';
        link.style.marginTop = '10px';
        resultDiv.appendChild(link);
    };
}
