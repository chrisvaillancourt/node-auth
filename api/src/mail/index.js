import nodemailer from 'nodemailer';

// TODO refactor to use classes
let testAccount;
let transporter;

function createTestAccount() {
  return nodemailer.createTestAccount();
}
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendEmail({
  from = 'topher@gmail.com',
  to = 'topher@gmail.com',
  subject,
  html,
}) {
  try {
    if (!testAccount) testAccount = await createTestAccount();
    if (!transporter) transporter = createTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(info);
    console.log(nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error(`There was an error sending email: ${error}`);
  }
}
