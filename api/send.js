import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { recipientEmail, pdfBase64, dept, date, respondant, summaryHtml } = req.body;

  // Vérification basique
  if (!recipientEmail || !pdfBase64) {
    return res.status(400).json({ error: 'Données manquantes (email ou PDF).' });
  }

  // Créer le transporteur SMTP Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,      // ex: tonmail@gmail.com
      pass: process.env.GMAIL_APP_PASS,  // mot de passe d'application 16 caractères
    },
  });

  const nomFichier = `rapport-besoins-${(dept || 'digiplus').replace(/\s+/g, '-').toLowerCase()}-${(date || '').replace(/\//g, '-')}.pdf`;

  const mailOptions = {
    from: `"DigiPlus Consulting" <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: `[DigiPlus Consulting] Rapport de Recueil des Besoins — ${dept || 'Département'} — ${date || ''}`,
    html: summaryHtml || `<p>Veuillez trouver ci-joint le rapport de recueil des besoins du département <strong>${dept}</strong>.</p>`,
    attachments: [
      {
        filename: nomFichier,
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur nodemailer:', err);
    return res.status(500).json({ error: err.message });
  }
}