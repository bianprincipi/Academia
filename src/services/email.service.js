const sgMail = require('@sendgrid/mail');

// Solo configurar si existe la API key
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendResetPasswordEmail = async (email, nombre, resetToken) => {
  // Si no hay API key configurada, solo simular el envío
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('⚠️  SendGrid no configurado. Email simulado a:', email);
    console.log('🔗 Token de recuperación:', resetToken);
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Recuperación de Contraseña - SGA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${nombre},</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Sistema de Gestión Académica Universitaria
        </p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

module.exports = {
  sendResetPasswordEmail
};