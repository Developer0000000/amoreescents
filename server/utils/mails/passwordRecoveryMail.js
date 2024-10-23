const nodeMailer = require("nodemailer");

const passwordRecoveryMail = async (options) => {

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

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: (`
            <h2>${options.message}</h2>
            <br />
            <br />
            <button style="background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 3px; user-select: text; cursor: pointer">${options.resetToken}</button>
        `),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }

}

module.exports = passwordRecoveryMail