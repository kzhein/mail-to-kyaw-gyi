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
  try {
    if (httpMethod !== 'POST') {
      throw Object.assign(new Error('Please only send POST request!'), {
        status: 400,
      });
    }

    await rateLimit(1, headers['client-ip']).catch(() => {
      throw Object.assign(new Error('You can only send 1 email per minute'), {
        status: 429,
      });
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.kyawzinhein.xyz',
      },
    };
  } catch (error) {
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({
        message: error.message,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.kyawzinhein.xyz',
      },
    };
  }
};
