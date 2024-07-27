document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!fullName || !phoneNumber) {
        alert('Zəhmət olmasa, bütün məlumatları daxil edin.');
        return;
    }

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxN5ftHI2TTOk6R3uo-FW4l2OmjHRubXO32F5wa5aliqDWu_vI6Cv5O1rLip488uAvWQw/exec', {
            method: 'POST',
            body: JSON.stringify({ fullName, phoneNumber }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        generatePDF(data);
    } catch (error) {
        alert('Xəta baş verdi. Zəhmət olmasa, bir daha cəhd edin.');
        console.error('Error:', error);
    }
});

function generatePDF(data) {
    const { fullName, phoneNumber, ixtiraciKodu, message } = data;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.addImage('https://i.ibb.co/7XNQPGC/logo.png', 'PNG', 10, 10, 50, 50);
    doc.setFontSize(16);
    doc.text(`Ad Soyad Ata adı: ${fullName}`, 10, 70);
    doc.text(`Telefon nömrəsi: ${phoneNumber}`, 10, 80);
    doc.text(`İxtiraçı kodu: ${ixtiraciKodu}`, 10, 90);
    doc.setFontSize(12);
    doc.text(message, 10, 110);

    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = '';
    const pdfFrame = document.createElement('iframe');
    pdfFrame.style.width = '100%';
    pdfFrame.style.height = '500px';
    pdfFrame.src = doc.output('datauristring');
    pdfContainer.appendChild(pdfFrame);
}
