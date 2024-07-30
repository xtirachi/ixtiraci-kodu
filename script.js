document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    showPopup();

    checkPhoneNumber(phoneNumber).then(existingCode => {
        if (existingCode) {
            generateCertificate(fullName, phoneNumber, existingCode, false);
        } else {
            const newCode = generateNewCode();
            saveUserInfo(fullName, phoneNumber, newCode).then(() => {
                generateCertificate(fullName, phoneNumber, newCode, true);
            });
        }
    });
});

function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
}

function hidePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

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

function generateCertificate(fullName, phoneNumber, code, isNew) {
    const certificateContent = `
        <div class="certificate-container">
            <div class="certificate-header">
                <img src="https://i.ibb.co/7XNQPGC/logo.png" alt="Logo">
            </div>
            <h2 class="certificate-title">İxtiraçı Kodunu Öyrən</h2>
            <div class="certificate-content">
                <p><strong>Ad Soyad Ata adı:</strong> ${fullName}</p>
                <p><strong>Telefon nömrəsi:</strong> ${phoneNumber}</p>
                <p><strong>İxtiraçı kodu:</strong> ${code}</p>
                <p>${isNew ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.' : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'}</p>
            </div>
        </div>
    `;

    const certificateDiv = document.createElement('div');
    certificateDiv.innerHTML = certificateContent;
    document.body.appendChild(certificateDiv);

    html2canvas(certificateDiv).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        document.getElementById('certificateImage').src = imgData;
        document.getElementById('downloadLink').href = imgData;
        document.getElementById('certificate').style.display = 'block';
        hidePopup();
        document.body.removeChild(certificateDiv);
    });
}
