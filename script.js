document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value + " (Aktiv Votsap)";
    document.getElementById('popup').style.display = 'block';

    checkPhoneNumber(phoneNumber).then(existingCode => {
        if (existingCode) {
            generateImage(fullName, phoneNumber, existingCode, false);
        } else {
            const newCode = generateNewCode();
            saveUserInfo(fullName, phoneNumber, newCode).then(() => {
                generateImage(fullName, phoneNumber, newCode, true);
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

function generateImage(fullName, phoneNumber, code, isNew) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const idWidth = 500;
    const idHeight = 300;

    // Set canvas dimensions
    canvas.width = idWidth;
    canvas.height = idHeight;

    // Load background image
    const background = new Image();
    background.src = 'https://i.ibb.co/G96Nn1Q/id-background.png'; // Use an appropriate ID background image URL
    background.onload = function () {
        ctx.drawImage(background, 0, 0, idWidth, idHeight);

        // Draw logo
        const logo = new Image();
        logo.src = 'https://i.ibb.co/7XNQPGC/logo.png';
        logo.onload = function () {
            ctx.drawImage(logo, 20, 20, 100, 50);

            // Draw text
            ctx.font = '20px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText('İxtiraçı Kodunu Öyrən', 150, 40);
            ctx.font = '16px Arial';
            ctx.fillText(`Ad Soyad Ata adı: ${fullName}`, 20, 100);
            ctx.fillText(`Telefon nömrəsi: ${phoneNumber}`, 20, 130);
            ctx.fillText(`İxtiraçı kodu: ${code}`, 20, 160);

            const message = isNew
                ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
                : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
            ctx.fillText(message, 20, 190, idWidth - 40);

            // Convert canvas to image and display it
            const dataURL = canvas.toDataURL('image/png');
            const img = new Image();
            img.src = dataURL;
            img.alt = 'İxtiraçı Sertifikatı';
            img.style.width = '100%';
            img.style.height = 'auto';

            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';
            resultDiv.appendChild(img);

            // Create download link
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'ixtiraci_sertifikati.png';
            link.textContent = 'İxtiraçı sertifikatını yüklə';
            link.style.display = 'block';
            link.style.marginTop = '10px';
            resultDiv.appendChild(link);

            // Hide popup
            document.getElementById('popup').style.display = 'none';
        };
    };
}
