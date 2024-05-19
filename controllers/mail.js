import nodemailer from 'nodemailer';

export const sendMailusingMailData = async (mailData, res) => {
    const { to, subject, text, html } = mailData;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.MAIL_USERNAME,
            // pass: process.env.MAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    let mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log("Error " + err);
                reject({ success: false, message: "Internal Server Error" });
            } else {
                console.log("Email sent successfully");
                resolve({ success: true, message: "Email sent successfully to all users " });
            }
        });
    });
}


