const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD,
  },
});

const rateLimit = require('lambda-rate-limiter')({
  interval: 60 * 1000, // one minute
}).check;

exports.handler = async ({ body, httpMethod, headers }, context) => {
  if (httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Please send only POST request!',
      }),
    };
  }

  try {
    await rateLimit(1, headers['client-ip']).catch(() => {
      const error = new Error('You can only send 1 email per minute');
      error.status = 429;
      throw error;
    });

    const { text } = JSON.parse(body);

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
      statusCode: error.status || 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
