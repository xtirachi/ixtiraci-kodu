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
    const docDefinition = {
        content: [
            {
                image: 'https://i.ibb.co/7XNQPGC/logo.png',
                width: 50,
                alignment: 'right'
            },
            {
                text: 'UAV OPERATORS CERTIFICATE',
                style: 'header'
            },
            {
                text: 'UNITED STATES OF AMERICA',
                style: 'subheader'
            },
            {
                text: `UAVID-${code}`,
                style: 'code'
            },
            {
                columns: [
                    {
                        width: '*',
                        text: [
                            { text: 'First: ', bold: true },
                            fullName.split(' ')[0] || '',
                            '\n',
                            { text: 'Last: ', bold: true },
                            fullName.split(' ')[1] || '',
                            '\n',
                            { text: 'Phone: ', bold: true },
                            phoneNumber,
                            '\n',
                            { text: 'İxtiraçı kodu: ', bold: true },
                            code
                        ]
                    },
                    {
                        width: 50,
                        image: 'https://via.placeholder.com/50',
                        alignment: 'right'
                    }
                ]
            },
            {
                text: isNew
                    ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.'
                    : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.',
                style: 'message'
            }
        ],
        styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 14, margin: [0, 0, 0, 10] },
            code: { fontSize: 12, color: 'red', margin: [0, 0, 0, 20] },
            message: { fontSize: 10, margin: [0, 20, 0, 0] }
        }
    };

    const resultContainer = document.getElementById('pdf-viewer');
    resultContainer.innerHTML = ''; // Clear previous result

    pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
        const iframe = document.createElement('iframe');
        iframe.src = dataUrl;
        iframe.className = 'w-full h-96';
        resultContainer.appendChild(iframe);
        document.getElementById('result').classList.remove('hidden');
    });

    pdfMake.createPdf(docDefinition).download('ixtiraçi_kodu.pdf'); // Enable download on mobile
}
