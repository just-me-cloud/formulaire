import nodemailer from 'nodemailer';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
 
  const { dept, date, summaryHtml } = req.body;
 
  if (!summaryHtml) {
    return res.status(400).json({ error: 'Données manquantes.' });
  }
 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,      // ton adresse Gmail expéditeur
      pass: process.env.GMAIL_APP_PASS,  // mot de passe d'application 16 caractères
    },
  });
 
  const mailOptions = {
    from: `"DigiPlus Consulting" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_DEST,          // ton adresse de réception (peut être la même)
    subject: `[DigiPlus] Nouveau formulaire — ${dept || 'Département'} — ${date || ''}`,
    html: summaryHtml,
  };
 
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur nodemailer:', err);
    return res.status(500).json({ error: err.message });
  }
}