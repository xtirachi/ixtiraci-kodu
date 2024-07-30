document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    alert('İxtiraçı sertifikatınız hazırlanır, zəhmət olmasa gözləyin!');

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
    const certificateContainer = document.createElement('div');
    certificateContainer.style.width = '800px';
    certificateContainer.style.height = '600px';
    certificateContainer.style.padding = '20px';
    certificateContainer.style.border = '1px solid #000';
    certificateContainer.style.backgroundColor = '#fff';
    certificateContainer.style.position = 'relative';
    certificateContainer.innerHTML = `
        <div style="text-align: center; font-weight: bold; font-size: 24px; margin-bottom: 20px;">İxtiraçı Kodunu Öyrən</div>
        <div style="margin-bottom: 10px;">Ad Soyad Ata adı: ${fullName}</div>
        <div style="margin-bottom: 10px;">Telefon nömrəsi: ${phoneNumber}</div>
        <div style="margin-bottom: 10px;">İxtiraçı kodu: ${code}</div>
        <div style="margin-top: 20px;">${isNew ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.' : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'}</div>
        <img src="https://i.ibb.co/7XNQPGC/logo.png" style="width: 100px; position: absolute; bottom: 20px; left: 20px;">
    `;

    document.getElementById('result').innerHTML = '';
    document.getElementById('result').appendChild(certificateContainer);

    html2canvas(certificateContainer).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgElement = document.createElement('img');
        imgElement.src = imgData;
        imgElement.style.maxWidth = '100%';
        imgElement.style.marginTop = '20px';
        document.getElementById('result').appendChild(imgElement);
    });
}
