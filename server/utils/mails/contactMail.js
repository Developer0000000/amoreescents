const nodeMailer = require('nodemailer');

const contactMail = async ({ name, email, query, message }) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            service: process.env.SMTP_SERVICE,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptionsForAdmin = {
            from: `${name} <${email}>`, // User ka name aur email as sender
            to: process.env.SMTP_EMAIL, // Admin ka email
            subject: 'New Contact Form Submission',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
                <h2 style="color: #4CAF50;">New Contact Form Submission</h2>
                <p>You have received a new message:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Name:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Email:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Query:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${query}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Message:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${message}</td>
                  </tr>
                </table>
                <p style="margin-top: 20px;">Please respond to this inquiry at your earliest convenience.</p>
                <p>Best Regards, to <strong><i>[company]</i></strong></p>
              </div>
            `,
        };

        const mailOptionsForUser = {
            from: process.env.SMTP_EMAIL,
            to: email,
            email: email,
            subject: `Thank You for Contacting Us, ${name}!`,
            html: `
                <div style="text-align: center; padding: 20px;">
                <h1 style="color: #4CAF50;">Thank You, ${name}!</h1>
                <p>We have received your message and will get back to you soon.</p>
                <p style="font-size: 14px; color: #555;">Here’s a quick summary of what you submitted:</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Query:</strong> ${query}</li>
                    <li><strong>Message:</strong> ${message}</li>
                </ul>
                
                <h3>If you haven't received an email, please check your <span style="color: #DE3163;"><strong>Spam</strong></span> folder.</h3>
                <p><strong>We appreciate your patience! We will get back to you as soon as possible.</strong></p>
                <p>Best Regards from <strong><i>[company]</i></strong></p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptionsForAdmin);
        await transporter.sendMail(mailOptionsForUser);
        
        console.log(`Email sent successfully to ${email}`);

    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw new Error(error.message);
    }
};

module.exports = contactMail;
