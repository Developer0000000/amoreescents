const nodeMailer = require('nodemailer');

const sendOrderConfirmationEmail = async ({ email, name, orderId, orderItems, totalAmount }) => {
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
        // console.log(orderItems[0])
        const orderItemsHtml = orderItems.map(item => `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    <a href="${item.productUrl}" style="color: #4CAF50;">${item.name}</a>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.qty}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">Rs ${item.price}</td>
            </tr>
        `).join('');

        // Mail for the admin
        const mailOptionsForAdmin = {
            from: `${name} <${email}>`,
            to: process.env.SMTP_EMAIL,
            subject: `New Order Received - Order #${orderId}`,
            html: `
                <div style="padding: 20px; background-color: #f4f4f4; color: #333;">
                    <h1 style="color: #4CAF50;">New Order Received</h1>
                    <p>A new order has been placed:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Order ID:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Customer Name:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Customer Email:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Order Items:</td>
                        </tr>
                        ${orderItemsHtml}
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Amount:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">Rs ${totalAmount}</td>
                        </tr>
                    </table>
                    <p>Please review the order and ensure timely processing.</p>
                    <p>Best Regards, <strong><i>[Your Company Name]</i></strong></p>
                </div>
            `,
        };

        // Mail for the user
        const mailOptionsForUser = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: `Order Confirmation - Order #${orderId}`,
            html: `
                <div style="text-align: center; padding: 20px;">
                    <h1 style="color: #4CAF50;">Thank You for Your Order, ${name}!</h1>
                    <h2>Your order has been placed successfully & is now being processed. The Order will be delivered within 2-4 working days. We appreciate your patience!</h2>
                    <p>Here are the details:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Product</td>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Quantity</td>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Price</td>
                        </tr>
                        ${orderItemsHtml}
                        <tr style="background-color: #f9f9f9;">
                            <td colspan="2" style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Amount</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">Rs ${totalAmount}</td>
                        </tr>
                    </table>
                    <h3>If you haven't received an email, please check your <span style="color: #DE3163;"><strong>Spam</strong></span> folder.</h3>
                    <p>If you have any questions or concerns, feel free to contact us.</p>
                    <p>Thank you for shopping with us!</p>
                    <p>Best Regards from <strong><i>[Your Company Name]</i></strong></p>
                </div>
            `,
        };

        // Send emails
        await transporter.sendMail(mailOptionsForAdmin);
        await transporter.sendMail(mailOptionsForUser);

        console.log(`Order confirmation email sent successfully to ${email} and admin`);

    } catch (error) {
        console.error(`Error sending order confirmation email:`, error);
        throw new Error(error.message);
    }
};

module.exports = sendOrderConfirmationEmail;

