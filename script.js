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
    console.log(`Checking phone number: ${phoneNumber}`);
    return fetch(`https://script.google.com/macros/s/AKfycbz6BmpKtm7KkYxFg08bhDNaL6CL6JbVcTkgS0KN9RXB6CnA1bW77HxcaqbfG4tYAWBAIw/exec?phone=${encodeURIComponent(phoneNumber)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetch response data:', data);
            return data.code;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function generateNewCode() {
    const lastCode = localStorage.getItem('lastCode') || 1000;
    const newCode = parseInt(lastCode) + 1;
    localStorage.setItem('lastCode', newCode);
    return newCode;
}

function saveUserInfo(fullName, phoneNumber, code) {
    const date = new Date().toLocaleDateString('az-AZ');
    return fetch('https://script.google.com/macros/s/AKfycbz6BmpKtm7KkYxFg08bhDNaL6CL6JbVcTkgS0KN9RXB6CnA1bW77HxcaqbfG4tYAWBAIw/exec', {
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
    const certificateDiv = document.createElement('div');
    certificateDiv.innerHTML = `
        <div class="certificate-container">
            <div class="certificate-header">
                <img src="https://i.ibb.co/7XNQPGC/logo.png" alt="Logo">
            </div>
            <h2 class="certificate-title">İxtiraçı Sertifikatı</h2>
            <div class="certificate-content">
                <p><strong>Ad Soyad Ata adı:</strong> ${fullName}</p>
                <p><strong>Telefon nömrəsi:</strong> ${phoneNumber}</p>
                <p><strong>İxtiraçı kodu:</strong> ${code}</p>
                <p>${isNew ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.' : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'}</p>
            </div>
        </div>
    `;
    document.body.appendChild(certificateDiv);

    html2canvas(certificateDiv, { logging: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        // Update the certificate image and download link
        const certificateImage = document.getElementById('certificateImage');
        certificateImage.src = imgData;
        certificateImage.onload = () => {
            document.getElementById('certificate').style.display = 'block';
            hidePopup();
            document.body.removeChild(certificateDiv);
        };

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = imgData;
        downloadLink.download = `ixtiraçi_sertifikatı_${phoneNumber}.png`;
    }).catch(error => {
        console.error('Error generating certificate:', error);
        hidePopup();
    });
}
