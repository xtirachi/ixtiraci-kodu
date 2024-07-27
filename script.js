function doPost(e) {
    var params = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById('1b1wQZqZRXkX5ALDL0ntSoMRLZufErSVOLDUHqboBnEg').getSheetByName('Sheet1');
    var data = sheet.getDataRange().getValues();
    var phoneNumber = params.phoneNumber;
    var fullName = params.fullName;

    for (var i = 1; i < data.length; i++) {
        if (data[i][1] === phoneNumber) {
            var existingCode = data[i][2];
            var pdfUrl = createPdf(fullName, phoneNumber, existingCode, false);
            return ContentService.createTextOutput(JSON.stringify({ success: true, code: existingCode, pdfUrl: pdfUrl })).setMimeType(ContentService.MimeType.JSON);
        }
    }

    var newCode = 1001 + data.length - 1;
    sheet.appendRow([fullName, phoneNumber, newCode]);
    var pdfUrl = createPdf(fullName, phoneNumber, newCode, true);
    return ContentService.createTextOutput(JSON.stringify({ success: true, code: newCode, pdfUrl: pdfUrl })).setMimeType(ContentService.MimeType.JSON);
}

function createPdf(fullName, phoneNumber, code, isNew) {
    var doc = DocumentApp.create('İxtiraçı Kodu');
    var body = doc.getBody();

    var logoUrl = 'https://i.ibb.co/7XNQPGC/logo.png';
    var img = UrlFetchApp.fetch(logoUrl).getBlob();
    body.appendImage(img).setWidth(100).setHeight(100);

    body.appendParagraph(`Ad Soyad Ata adı: ${fullName}`);
    body.appendParagraph(`Telefon Nömrəsi: ${phoneNumber}`);
    body.appendParagraph(`İxtiraçı Kodu: ${code}`);

    var message = isNew ? 
        'İxtiraçılar klubuna xoş gəldin! Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.' : 
        'Sən artıq İxtiraçı üzvüsən. Virtual Səyahətlərin zamanı İxtiraçı kodu sənə lazım olacaq! Bu məlumatları telefonunun yaddaşında saxlaya bilərsən.';
    
    body.appendParagraph(message).setFontFamily('Arial').setFontSize(12).setForegroundColor('#333333');

    var pdfBlob = doc.getAs('application/pdf');
    var pdfFile = DriveApp.createFile(pdfBlob);
    var pdfUrl = pdfFile.getUrl();

    return pdfUrl;
}
