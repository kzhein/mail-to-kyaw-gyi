const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD,
  },
});

exports.handler = async ({ body, httpMethod }, context) => {
  const { text } = JSON.parse(body);

  if (httpMethod === 'POST') {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        subject: 'Message from a visitor',
        text,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Mail sent successfully!',
        }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        }),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Please send only POST request!',
    }),
  };
};
