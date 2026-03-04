export const reportTemplate = (data: any) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand: #4f46e5;
            --brand-dark: #3730a3;
            --slate-900: #0f172a;
            --slate-600: #475569;
            --slate-400: #94a3b8;
            --slate-100: #f1f5f9;
            --slate-50: #f8fafc;
            --emerald: #10b981;
            --rose: #ef4444;
        }
        * { box-sizing: border-box; }
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            padding: 40px; 
            color: var(--slate-900);
            line-height: 1.4;
            background: white;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 2px solid var(--slate-100); 
            padding-bottom: 30px; 
            margin-bottom: 30px; 
        }
        .school-logo {
            width: 80px;
            height: 80px;
            background: var(--brand);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 32px;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
        }
        .school-info { flex: 1; margin-left: 25px; }
        .school-info h1 { 
            font-size: 24px; 
            font-weight: 800;
            color: var(--slate-900); 
            margin: 0; 
            letter-spacing: -0.02em;
        }
        .school-info p { 
            margin: 4px 0 0 0; 
            font-weight: 600; 
            color: var(--slate-400);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .report-badge {
            background: var(--brand);
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            text-align: right;
        }
        .report-badge h2 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
        .report-badge p { margin: 2px 0 0 0; font-size: 10px; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.1em; }

        .main-grid {
            display: grid;
            grid-template-cols: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .student-card {
            background: var(--slate-50);
            border: 1px solid var(--slate-100);
            padding: 25px;
            border-radius: 24px;
            display: flex;
            gap: 25px;
            align-items: center;
        }
        .student-photo {
            width: 100px;
            height: 100px;
            background: var(--slate-200);
            border-radius: 20px;
            border: 4px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .student-details h3 { margin: 0; font-size: 22px; font-weight: 800; }
        .student-details p { margin: 5px 0 0 0; font-size: 12px; font-weight: 600; color: var(--slate-400); }
        .student-details .matricule { 
            display: inline-block; 
            margin-top: 10px; 
            background: white; 
            padding: 4px 12px; 
            border-radius: 8px; 
            font-weight: 800; 
            color: var(--brand);
            font-size: 11px;
            border: 1px solid var(--slate-100);
        }

        .stats-sidebar {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }
        .mini-stat {
            background: white;
            border: 1px solid var(--slate-100);
            padding: 15px;
            border-radius: 18px;
            text-align: center;
        }
        .mini-stat label { font-size: 9px; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; }
        .mini-stat value { display: block; font-size: 18px; font-weight: 800; color: var(--slate-900); margin-top: 2px; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; }
        th { 
            background: var(--slate-50); 
            color: var(--slate-400); 
            padding: 12px 15px; 
            text-align: left; 
            font-size: 9px; 
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 2px solid var(--slate-100);
        }
        
        td { 
            padding: 15px; 
            font-size: 13px; 
            font-weight: 600;
            border-bottom: 1px solid var(--slate-50);
        }
        .grade-box {
            background: var(--slate-900);
            color: white;
            width: 45px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-weight: 800;
            margin: 0 auto;
        }
        .grade-box.fail { background: var(--rose); }
        .grade-box.pass { background: var(--brand); }

        .results-panel {
            margin-top: 30px;
            background: var(--slate-900);
            border-radius: 25px;
            padding: 30px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        .results-panel::before {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 200px; height: 200px;
            background: var(--brand);
            filter: blur(80px);
            opacity: 0.3;
        }
        .main-avg h4 { margin: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.6; }
        .main-avg .value { font-size: 48px; font-weight: 800; letter-spacing: -0.04em; margin-top: 5px; }
        
        .other-results { display: flex; gap: 40px; text-align: right; }
        .res-item h5 { margin: 0; font-size: 9px; font-weight: 700; text-transform: uppercase; opacity: 0.5; }
        .res-item p { margin: 2px 0 0 0; font-size: 20px; font-weight: 800; }

        .footer { 
            margin-top: 40px; 
            display: grid;
            grid-template-cols: 1fr 1fr 1fr;
            gap: 20px;
        }
        .signature-area {
            text-align: center;
            padding: 20px;
        }
        .signature-area label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--slate-400); display: block; margin-bottom: 40px; }
        .sig-line { border-top: 1px solid var(--slate-200); padding-top: 10px; font-size: 11px; font-weight: 700; }

        .qr-placeholder {
            width: 80px; height: 80px;
            border: 1px solid var(--slate-100);
            border-radius: 12px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: var(--slate-300);
            text-align: center;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="display: flex; align-items: center;">
            <div class="school-logo">${data.schoolName.substring(0, 1)}</div>
            <div class="school-info">
                <h1>${data.schoolName}</h1>
                <p>Éducation & Excellence &bull; Sénégal</p>
            </div>
        </div>
        <div class="report-badge">
            <h2>BULLETIN SCOLAIRE</h2>
            <p>${data.period} &bull; SESSION ${data.year}</p>
        </div>
    </div>

    <div class="main-grid">
        <div class="student-card">
            <div class="student-photo"></div>
            <div class="student-details">
                <h3>${data.studentName}</h3>
                <p>Né(e) le ${data.birthDate} &bull; Nationalité Sénégalaise</p>
                <div class="matricule">MATRICULE : ${data.matricule}</div>
            </div>
        </div>
        <div class="stats-sidebar">
            <div class="mini-stat">
                <label>Classe</label>
                <value>${data.className}</value>
            </div>
            <div class="mini-stat">
                <label>Absences</label>
                <value style="color: var(--rose)">${data.absences || 0}</value>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30%">Matières</th>
                <th style="text-align: center">Coefficient</th>
                <th style="text-align: center">Note / 20</th>
                <th>Appréciations & Observations</th>
            </tr>
        </thead>
        <tbody>
            ${data.grades.map((g: any) => `
                <tr>
                    <td style="color: var(--slate-900); font-weight: 700;">${g.subjectName || g.subjectId}</td>
                    <td style="text-align: center; color: var(--slate-400)">${g.coeff}</td>
                    <td style="text-align: center">
                        <div class="grade-box ${Number(g.value) >= 10 ? 'pass' : 'fail'}">${g.value}</div>
                    </td>
                    <td style="font-size: 11px; color: var(--slate-600); line-height: 1.5">
                        ${g.comment || (Number(g.value) >= 16 ? 'Excellent travail.' : Number(g.value) >= 12 ? 'Bon ensemble.' : 'Doit s\'impliquer davantage.')}
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="results-panel">
        <div class="main-avg">
            <h4>Moyenne Trimestrielle</h4>
            <div class="value">${data.average} <span style="font-size: 18px; opacity: 0.4">/ 20</span></div>
        </div>
        <div class="other-results">
            <div class="res-item">
                <h5>Moy. Classe</h5>
                <p>${data.classAverage}</p>
            </div>
            <div class="res-item">
                <h5>Rang</h5>
                <p style="color: var(--brand)">${data.rank}<sup>${data.rank === 1 ? 'er' : 'ème'}</sup></p>
            </div>
            <div class="res-item">
                <h5>Effectif</h5>
                <p>${data.classSize || '--'}</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="signature-area">
            <label>Authentification</label>
            <div class="qr-placeholder">CERTIFIÉ SGS<br/>SCANNER POUR VÉRIFIER</div>
        </div>
        <div class="signature-area">
            <label>Cachet de l'établissement</label>
            <div style="height: 60px"></div>
        </div>
        <div class="signature-area">
            <label>Le Directeur</label>
            <div class="sig-line">M. EL HADJI DIOP</div>
        </div>
    </div>
</body>
</html>
`;
