document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!fullName || !phoneNumber) {
        alert('Bütün məlumatları doldurun');
        return;
    }

    const response = await fetch('https://script.google.com/macros/s/AKfycbzDTF5S5AHR5jyXBc8iFhEg3xR8h96YGMFQMgon40o-UOWpvx2zDKXYfKjZsAEFSUQA2w/exec', {
        method: 'POST',
        body: JSON.stringify({ fullName, phoneNumber }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const result = await response.json();
    
    if (result.success) {
        generatePDF(result.data);
    } else {
        document.getElementById('result').innerText = result.message;
    }
});

function generatePDF(data) {
    const { fullName, phoneNumber, code, isNew } = data;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('İxtiraçı Kodu', 105, 20, null, null, 'center');
    doc.setFontSize(16);
    doc.text(`Ad Soyad Ata adı: ${fullName}`, 20, 40);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 20, 50);
    doc.text(`İxtiraçı kodu: ${code}`, 20, 60);
    
    const message = isNew ? 'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.' : 'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    
    doc.text(message, 20, 80);
    
    doc.addImage('https://i.ibb.co/7XNQPGC/logo.png', 'PNG', 150, 10, 40, 40);
    
    doc.save('IxtiraciKodu.pdf');
}
