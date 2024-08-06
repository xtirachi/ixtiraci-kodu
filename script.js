document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    showPopup();

    checkPhoneNumber(phoneNumber).then(existingCode => {
        if (existingCode) {
            generateCertificate(fullName, phoneNumber, existingCode, false);
        } else {
            getMaxCode().then(maxCode => {
                const newCode = maxCode + 1;
                saveUserInfo(fullName, phoneNumber, newCode).then(() => {
                    generateCertificate(fullName, phoneNumber, newCode, true);
                });
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
    return fetch(`https://script.google.com/macros/s/AKfycbwFkPt0VNRoXCvBbU2MU8368kqyT_-Rm5AfPyBueBSrc6d6UFIb62zZ0Hq2v4uZ4mM44g/exec?phone=${encodeURIComponent(phoneNumber)}`)
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

function getMaxCode() {
    console.log('Fetching max code');
    return fetch('https://script.google.com/macros/s/AKfycbwFkPt0VNRoXCvBbU2MU8368kqyT_-Rm5AfPyBueBSrc6d6UFIb62zZ0Hq2v4uZ4mM44g/exec?maxCode=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Max code:', data.maxCode);
            return data.maxCode;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function saveUserInfo(fullName, phoneNumber, code) {
    const date = new Date().toLocaleDateString('az-AZ');
    return fetch('https://script.google.com/macros/s/AKfycbwFkPt0VNRoXCvBbU2MU8368kqyT_-Rm5AfPyBueBSrc6d6UFIb62zZ0Hq2v4uZ4mM44g/exec', {
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

    document.getElementById('certificate').style.display = 'block';
    const certificateContainer = document.getElementById('certificate');
    certificateContainer.innerHTML = certificateDiv.innerHTML;

    html2canvas(certificateDiv, { logging: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        // Update the certificate image and download link
        const certificateImage = document.getElementById('certificateImage');
        certificateImage.src = imgData;
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = imgData;
        downloadLink.download = `ixtiraçi_sertifikatı_${phoneNumber}.png`;

        hidePopup();
    }).catch(error => {
        console.error('Error generating certificate:', error);
        hidePopup();
    });
}
 const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = imgData;
        downloadLink.download = `ixtiraçi_sertifikatı_${phoneNumber}.png`;
    }).catch(error => {
        console.error('Error generating certificate:', error);
        hidePopup();
    });
}
