document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    checkPhoneNumber(phoneNumber).then(existingCode => {
        if (existingCode) {
            generateAndDisplayPDF(fullName, phoneNumber, existingCode, false);
        } else {
            getLatestCode().then(latestCode => {
                const newCode = latestCode + 1;
                saveUserInfo(fullName, phoneNumber, newCode).then(() => {
                    generateAndDisplayPDF(fullName, phoneNumber, newCode, true);
                });
            });
        }
    }).catch(error => {
        console.error('Error checking phone number:', error);
    });
});

function checkPhoneNumber(phoneNumber) {
    return fetch(`https://script.google.com/macros/s/AKfycbzDsM67CKYBZkNwf4cYMvUjtncb8OerLZvdzVpXCIEuKHP-5Q7Ir-SOVTbbROnDoKJnPw/exec?phone=${phoneNumber}`)
        .then(response => response.json())
        .then(data => data.code);
}

function getLatestCode() {
    return fetch(`https://script.google.com/macros/s/AKfycbzDsM67CKYBZkNwf4cYMvUjtncb8OerLZvdzVpXCIEuKHP-5Q7Ir-SOVTbbROnDoKJnPw/exec?latest=true`)
        .then(response => response.json())
        .then(data => data.latestCode);
}

function saveUserInfo(fullName, phoneNumber, code) {
    const currentDate = new Date().toLocaleDateString();
    return fetch('https://script.google.com/macros/s/AKfycbzDsM67CKYBZkNwf4cYMvUjtncb8OerLZvdzVpXCIEuKHP-5Q7Ir-SOVTbbROnDoKJnPw/exec', {
        method: 'POST',
        body: new URLSearchParams({
            'full-name': fullName,
            'phone-number': phoneNumber,
            'code': code,
            'date': currentDate
        })
    }).then(response => response.json()).catch(error => {
        console.error('Error saving user info:', error);
    });
}

function generateAndDisplayPDF(fullName, phoneNumber, code, isNew) {
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
                        image: 'https://i.ibb.co/7XNQPGC/logo.png',
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
        if (dataUrl) {
            console.log('PDF Data URL:', dataUrl); // Debugging log
            const iframe = document.createElement('iframe');
            iframe.src = dataUrl;
            resultContainer.appendChild(iframe);
            document.getElementById('result').classList.remove('hidden');
        } else {
            console.error('Error generating PDF data URL.');
        }
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });

    pdfMake.createPdf(docDefinition).open(); // Open PDF in new tab
}
