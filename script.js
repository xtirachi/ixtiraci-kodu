// script.js
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    try {
        // Check if phone number exists
        let response = await fetch(`https://script.google.com/macros/s/AKfycby0cFYR3gXl8CxEv_22nlbjLINEipHS2UwWWdjxd3PBlfd__UjE3GIwx-vjhCpFVNjYsA/exec?phone=${phoneNumber}`);
        let data = await response.json();
        
        if (data.exists) {
            // Phone number exists, fetch existing code
            generatePDF(fullName, phoneNumber, data.code);
        } else {
            // Phone number does not exist, fetch latest code and save new data
            response = await fetch(`https://script.google.com/macros/s/AKfycby0cFYR3gXl8CxEv_22nlbjLINEipHS2UwWWdjxd3PBlfd__UjE3GIwx-vjhCpFVNjYsA/exec?latest=true`);
            data = await response.json();
            
            const newCode = data.latestCode + 1;
            await fetch(`https://script.google.com/macros/s/AKfycby0cFYR3gXl8CxEv_22nlbjLINEipHS2UwWWdjxd3PBlfd__UjE3GIwx-vjhCpFVNjYsA/exec`, {
                method: 'POST',
                body: JSON.stringify({ fullName, phoneNumber, code: newCode }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            generatePDF(fullName, phoneNumber, newCode);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function generatePDF(fullName, phoneNumber, code) {
    const docDefinition = {
        content: [
            { text: 'User Information', style: 'header' },
            `Full Name: ${fullName}`,
            `Phone Number: ${phoneNumber}`,
            `Code: ${code}`
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            }
        }
    };
    
    pdfMake.createPdf(docDefinition).getBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const iframe = document.getElementById('pdfFrame');
        iframe.src = url;
        iframe.style.display = 'block';
        window.open(url, '_blank');
    });
}
