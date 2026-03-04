"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportTemplate = void 0;
const reportTemplate = (data) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand: #4f46e5;
            --slate-900: #0f172a;
            --slate-600: #475569;
            --slate-400: #94a3b8;
            --slate-100: #f1f5f9;
            --emerald: #10b981;
            --rose: #ef4444;
        }
        body { 
            font-family: 'Inter', sans-serif; 
            padding: 50px; 
            color: var(--slate-900);
            line-height: 1.5;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            border-bottom: 4px solid var(--brand); 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
        }
        .school-info h1 { 
            font-size: 28px; 
            font-weight: 900;
            color: var(--brand); 
            margin: 0; 
            text-transform: uppercase;
            letter-spacing: -0.025em;
        }
        .school-info p { 
            margin: 5px 0 0 0; 
            font-weight: 700; 
            color: var(--slate-600);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .report-title {
            text-align: right;
        }
        .report-title h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 900;
            color: var(--slate-900);
        }
        .report-title p {
            margin: 5px 0 0 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--brand);
        }

        .info-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }
        .info-card {
            background: var(--slate-100);
            padding: 20px;
            border-radius: 16px;
        }
        .info-label {
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--slate-400);
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 700;
            color: var(--slate-900);
        }

        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; }
        th { 
            background: var(--slate-900); 
            color: white; 
            padding: 15px; 
            text-align: left; 
            font-size: 11px; 
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        th:first-child { border-top-left-radius: 12px; }
        th:last-child { border-top-right-radius: 12px; }
        
        td { 
            border-bottom: 1px solid var(--slate-100); 
            padding: 15px; 
            font-size: 14px; 
            font-weight: 500;
        }
        .grade-cell { 
            font-weight: 900; 
            font-size: 16px;
        }
        .pass { color: var(--emerald); }
        .fail { color: var(--rose); }

        .summary-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--brand);
            color: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.2);
        }
        .summary-item h4 {
            margin: 0;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            opacity: 0.8;
        }
        .summary-item p {
            margin: 5px 0 0 0;
            font-size: 32px;
            font-weight: 900;
        }

        .footer { 
            margin-top: 60px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end;
        }
        .signature-box {
            text-align: center;
            width: 200px;
        }
        .signature-line {
            border-top: 2px solid var(--slate-900);
            margin-top: 60px;
            padding-top: 10px;
            font-size: 12px;
            font-weight: 700;
        }
        .stamp-placeholder {
            width: 120px;
            height: 120px;
            border: 3px dashed var(--rose);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--rose);
            font-weight: 900;
            font-size: 10px;
            text-transform: uppercase;
            transform: rotate(-15deg);
            opacity: 0.4;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="school-info">
            <h1>${data.schoolName}</h1>
            <p>République du Sénégal</p>
            <p>Ministère de l'Éducation Nationale</p>
        </div>
        <div class="report-title">
            <h2>BULLETIN DE NOTES</h2>
            <p>${data.period} • ${data.year}</p>
        </div>
    </div>

    <div class="info-grid">
        <div class="info-card">
            <div class="info-label">Élève</div>
            <div class="info-value">${data.studentName}</div>
            <div style="margin-top: 10px">
                <div class="info-label">Matricule</div>
                <div class="info-value">${data.matricule}</div>
            </div>
        </div>
        <div class="info-card">
            <div class="info-label">Classe</div>
            <div class="info-value">${data.className}</div>
            <div style="margin-top: 10px">
                <div class="info-label">Date de Naissance</div>
                <div class="info-value">${data.birthDate}</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Matière</th>
                <th style="text-align: center">Coeff</th>
                <th style="text-align: center">Note / 20</th>
                <th>Appréciation du Professeur</th>
            </tr>
        </thead>
        <tbody>
            ${data.grades.map((g) => `
                <tr>
                    <td><strong>${g.subjectId}</strong></td>
                    <td style="text-align: center">${g.coeff}</td>
                    <td style="text-align: center" class="grade-cell ${Number(g.value) >= 10 ? 'pass' : 'fail'}">${g.value}</td>
                    <td style="font-size: 12px; color: var(--slate-600)">
                        ${Number(g.value) >= 16 ? 'Excellent travail, continuez ainsi.' :
    Number(g.value) >= 14 ? 'Très bon trimestre.' :
        Number(g.value) >= 12 ? 'Bon travail, des efforts à poursuivre.' :
            Number(g.value) >= 10 ? 'Résultats passables.' : 'Insuffisant, doit redoubler d\'efforts.'}
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="summary-section">
        <div class="summary-item">
            <h4>Moyenne Générale</h4>
            <p>${data.average} / 20</p>
        </div>
        <div class="summary-item" style="text-align: center">
            <h4>Moyenne Classe</h4>
            <p>${data.classAverage} / 20</p>
        </div>
        <div class="summary-item" style="text-align: right">
            <h4>Rang</h4>
            <p>${data.rank}</p>
        </div>
    </div>

    <div class="footer">
        <div class="signature-box">
            <div class="stamp-placeholder">Cachet de l'École</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">Signature du Directeur</div>
        </div>
    </div>
</body>
</html>
`;
exports.reportTemplate = reportTemplate;
