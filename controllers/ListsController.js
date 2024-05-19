import csvParser from 'csv-parser';
import fs from 'fs';
import { sendMailusingMailData } from './mail.js';
import Lists from '../models/lists.js'
import Users from '../models/users.js';

export const createListNormal = async (req, res) => {
    const { title, properties } = req.body;
    if (!title || !properties) {
        return res.status(400).json({ message: "Title and Properties are required" });
    }

    try {
        const newListData = await Lists.create({
            title,
            properties
        })

        if (!newListData) {
            return res.status(400).json({ success: false, message: "Some Fields are missing" });
        } else {
            return res.status(201).json({ success: true, message: "List Created Successfully", result: newListData });
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const createListWithCSV = async (req, res) => {
    const { title, properties } = req.body;
    if (!title || !properties) {
        return res.status(400).json({ message: "Title and Properties are required" });
    }
    try {
        const results = [];
        const errors = [];
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => {
                if (!data.name || !data.email) {
                    errors.push({ row: data, error: 'Name and email are required' });
                } else if (results.find(user => user.email === data.email)) {
                    errors.push({ row: data, error: 'Email must be unique' });
                } else {
                    let properties = {};
                    console.log("This is data", data);
                    for (let key in data) {
                        if (key !== 'name' && key !== 'email') {
                            properties[key] = data[key];
                        }
                    }
                    data.properties = properties;
                    results.push(data);
                }
            })
            .on('end', async () => {
                const users = results.map(result => new Users(result));
                await Users.insertMany(users);
                const newListData = await Lists.create({
                    title,
                    properties,
                    users
                });
                if (!newListData) {
                    return res.status(400).json({ success: false, message: "Some Fields are missing" });
                } else {
                    return res.status(201).json({
                        success: true,
                        message: "List Created Successfully",
                        result: newListData,
                        added: users.length,
                        notAdded: errors.length,
                        total: newListData.users.length,
                        errors
                    });
                }
            });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

function replacePlaceholders(body, user) {
    return body.replace(/\[(\w+)\]/g, (_, placeholder) => {
        if (placeholder in user) {
            return user[placeholder];
        } else if (user.properties && placeholder in user.properties) {
            return user.properties[placeholder];
        } else {
            return '';
        }
    });
}

async function sendMailToUser(user, mailBody) {
    const mailData = {
        to: user.email,
        subject: "Mathon Go Test Mail",
        html: replacePlaceholders(mailBody, user) + `
            <p><a href="${process.env.CLIENT_URL}/lists/unsubscribe?email=${encodeURIComponent(user.email)}">Unsubscribe</a></p>`
    };

    return sendMailusingMailData(mailData).then((res) => {
        if (res.success) {
            return { success: true, message: "Email sent successfully" };
        }
    }).catch((err) => {
        return { success: false, message: "Internal Server Error hain jee---------", err: err };
    });
}

export const sendMailToAllUsers = async (req, res) => {
    const mailBody = `
        <h1>Hey [name] ! </h1>
        <p>
            Thank you for signing up with your email [email].
            We have received your city as [city] and state as [state].
        </p>
        <p> Team MathonGo. </p>`;

    try {
        const users = await Users.find({});
        const allusersLength = users.length;
        if (allusersLength === 0) {
            return res.status(400).json({
                success: false,
                message: "No users found to send mail"
            });
        }
        console.log("This is users", users);
        let failedEmails = [];
        let checkUsersSubsCount = 0;
        for (let user of users) {
            if (user.subscribed) {
                console.log("This is user", user);
                const result = await sendMailToUser(user, mailBody);
                if (!result.success) {
                    failedEmails.push(user.email);
                }
            } else {
                checkUsersSubsCount++;
                console.log("This user is not subscribed !!!!!!!!!!!! ", user);
            }
        }
        if (failedEmails.length > 0) {
            return res.status(500).json({
                success: false,
                message: "Emails not sent to some users",
                failedEmails: failedEmails
            });
        } else {
            if (checkUsersSubsCount === allusersLength) {
                return res.status(400).json({ success: false, message: "All Users are unsubscribed, No emails sent" });
            }
            return res.status(200).json({
                success: true,
                message: "Emails sent successfully to all users"
            });
        }
    } catch (error) {
        console.log("This is error ---> while sending mail to all users", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error - Emails not sent",
            error: error
        });
    }
}

export const unsubscribe = async (req, res) => {
    const { email } = req.query;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        } else {
            if (!user.subscribed) {
                return res.status(400).json({
                    success: false,
                    message: "User is already unsubscribed",
                    user: user
                });
            }
            const unsubscribedUser = await Users.findOneAndUpdate({ email }, {
                subscribed: false
            }, { new: true });

            if (!unsubscribedUser) {
                return res.status(400).json({ success: false, message: "Error unsubscribing user" });
            } else {
                return res.status(200).json({ success: true, message: "User unsubscribed successfully", });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const deleteAllListAndUsers = async (req, res) => {
    try {
        await Lists.deleteMany({});
        await Users.deleteMany({});
        return res.status(200).json({ success: true, message: "All Lists and Users deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error - Lists and Users not deleted",
            error: error
        });
    }
}

