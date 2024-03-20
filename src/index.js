const express = require("express") // Importing the express module
const app = express() // Creating an instance of the express application
const path = require("path") // Importing the path module
const hbs=require("hbs") // Importing the hbs module for handlebars templating
const { User: userCollection, Quote: quoteCollection } = require('./mongodb');
const crypto = require('crypto');// Importing the crypto module
const nodemailer = require('nodemailer');// Importing the nodemailer module
const { google } = require('googleapis');// Importing the googleapis module
const bcrypt = require('bcrypt');
const OAuth2 = google.auth.OAuth2;// Importing the OAuth2 module
const session = require('express-session');// Importing the express-session module

require('dotenv').config(); // Importing the dotenv module to read .env file

app.use(session({
    secret: process.env.SESSION_SECRET,// Secret key for the session
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}))


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'  // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'javier.durancedillo@gmail.com',//Email from which the mail will be sent
        //these values come from the .env file in the root directory, modify them to your own values
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
      }
});



const templatePath=path.join(__dirname,'../templates') // Setting the path for the templates directory

app.use(express.json()) // Middleware to parse JSON data
app.set("view engine","hbs") // Setting the view engine to handlebars
app.set("views",templatePath) // Setting the views directory
app.use(express.urlencoded({extended:false})) // Middleware to parse URL-encoded data

function checkAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get("/",(req,res)=>{ // Handling GET request for the root route
    res.render("login") // Rendering the login template
})

app.get("/signup",(req,res)=>{ // Handling GET request for the /signup route
    res.render("signup") // Rendering the signup template
})

app.get("/forgot-password",(req,res)=>{ // Handling GET request for the /forgot-password route
    res.render("forgot-password") // Rendering the forgot-password template
})

app.get("/reset-password",(req,res)=>{ // Handling GET request for the /reset-password route
    res.render("reset-password") // Rendering the reset-password template
})
app.get("/quote", checkAuthenticated, (req, res) => {
    res.render("quote");
});

app.post("/signup", async (req, res) => { // Handling POST request for the /signup route
    const data = { // Extracting data from the request body
        userName: req.body.userName,
        name: req.body.name,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword, 
        email: req.body.email,
        lastName: req.body.lastName,
        age: req.body.age,
        phone: req.body.phone,
        companyName: req.body.companyName
    }

    // Check if password meets the requirements
    const passwordRegex = /^(?=.*[A-Z]).{8,16}$/;
    if (!passwordRegex.test(data.password)) { // Checking if password matches the regex pattern
        res.send("Password must have at least 1 uppercase letter and be between 8 to 16 characters in length");
        return;
    }

    // Check if the two passwords match
    if (data.password !== data.confirmPassword) { // Checking if passwords match
        res.send("Passwords do not match");
        return;
    }

    // Remove the confirmPassword field before saving to database
    delete data.confirmPassword;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10); // Using a salt factor of 10

        // Replace the plain password with the hashed one
        data.password = hashedPassword;

        await userCollection.insertMany([data]) // Inserting data into the database
        res.render("home");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup.");
    }
})

app.post("/quote", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized");
    }
    const user = await userCollection.findOne({ _id: req.session.userId });
    if (!user) {
        return res.status(404).send("User not found");
    }
    const newQuote = new Quote({
        author: user._id,
        requiredStudies: 'Some studies',
        registryDate: new Date(),
        companySocialReason: 'Company Social Reason',
        companyPlant: 'Company Plant',
        companyPhoneNumber: 'Company Phone Number',
        companyMainActivity: 'Company Main Activity',
        companyEmployerRegistry: 'Company Employer Registry',
        companyRFC: 'Company RFC',
        companyLegalRepresentative: 'Company Legal Representative',
        companyAdministrativeTurn: 'Company Administrative Turn',
        companyFirstTurn: 'Company First Turn',
        companySecondTurn: 'Company Second Turn',
        companyThirdTurn: 'Company Third Turn',
        companyPhysicalLocation: {
            streetNameAndNumber: 'Street Name and Number',
            colony: 'Colony',
            municipality: 'Municipality',
            state: 'State',
            postalCode: 'Postal Code'
        },
        recipient: {
            name: 'Recipient Name',
            positionInCompany: 'Position in Company',
            grade: 'Grade',
            email: 'Recipient Email',
            phoneNumber: 'Recipient Phone Number',
            additionalComments: 'Additional Comments'
        },
        billingInformation: {
            socialReason: 'Billing Social Reason',
            streetNameAndNumber: 'Billing Street Name and Number',
            colony: 'Billing Colony',
            municipality: 'Billing Municipality',
            state: 'Billing State',
            postalCode: 'Billing Postal Code'
        }
    });

    try {
        await quoteCollection.insertOne(newQuote);
        res.send('Quote created successfully');
    } catch (error) {
        console.error("Error creating quote:", error);
        res.status(500).send("An error occurred while creating the quote.");
    }
});


app.post("/login",async (req,res)=>{ // Handling POST request for the /login route
    const userName = req.body.userName;
    const password = req.body.password;

   try {
        // Find the user in the database
        const check = await userCollection.findOne({ userName });
        if (!check) {
            res.send("User not found");
            return;
        }

        // Compare the hashed password with the provided password
        const isPasswordMatch = await bcrypt.compare(password, check.password);
        if (isPasswordMatch) {
            req.session.userId = check._id;// Setting the session variable
            res.render("home");
        } else {
            res.send("Incorrect password");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login.");
    }

})

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
})

app.post('/forgot-password', async (req, res) => {
    const email = req.body.email;
    // Lookup user in your database...
    const user = await userCollection.findOne({ email });
    if (!user) {
        return res.status(400).send('No user with that email');
    }

    const token = crypto.randomBytes(20).toString('hex');
    // Store token in your database...
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await userCollection.updateOne({ email }, { $set: { resetPasswordToken: token, resetPasswordExpires: user.resetPasswordExpires } });

    const mailOptions = {
        from: 'javier.durancedillo@gmail.com', // sender address
        to: email, // receiver is the user's email
        subject: 'Password Reset', // Subject line
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://localhost:3000/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n' // plain text body
    };
    smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.error(error);  // Add this line
            return res.status(500).send('Error sending email');
        }
        res.send('Password reset email sent');
    });
});

app.post('/reset-password', async (req, res) => {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    // Verify token and update password in your database...
    const user = await userCollection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).send('Invalid or expired token');
    }

    user.password = newPassword; // Store new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10); // Using a salt factor of 10

        // Replace the plain password with the hashed one
        user.password = hashedPassword;

    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).send("An error occurred during password reset.");
    }


    await userCollection.updateOne({ _id: user._id }, { $set: { password: user.password, resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires } });

    res.send('Password has been updated');
});

app.get('/reset/:token', async (req, res) => {
    const token = req.params.token;
    console.log('Received token:', token);

    // Verify token in your database...
    const user = await userCollection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (user) {
        console.log('Found user with matching token. Token expires at:', user.resetPasswordExpires);
    } else {
        console.log('No user found with matching token, or token has expired.');
    }

    if (!user) {
        return res.status(400).send('Invalid or expired token');
    }

    // Render password reset form...
    res.render('reset-password', { token: token });
});

app.listen(3000,()=>{ // Starting the server on port 3000
    console.log("port connected");
});
