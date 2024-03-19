const express = require("express") // Importing the express module
const path = require("path") // Importing the path module
const hbs=require("hbs") // Importing the hbs module for handlebars templating
const collection=require("./mongodb") // Importing the mongodb module
const crypto = require('crypto');// Importing the crypto module
const nodemailer = require('nodemailer');// Importing the nodemailer module
const { google } = require('googleapis');// Importing the googleapis module
const OAuth2 = google.auth.OAuth2;// Importing the OAuth2 module
require('dotenv').config();// Importing the fs module

require('dotenv').config(); // Importing the dotenv module to read .env file

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
    }
});

const app = express() // Creating an instance of the express application

const templatePath=path.join(__dirname,'../templates') // Setting the path for the templates directory

app.use(express.json()) // Middleware to parse JSON data
app.set("view engine","hbs") // Setting the view engine to handlebars
app.set("views",templatePath) // Setting the views directory
app.use(express.urlencoded({extended:false})) // Middleware to parse URL-encoded data

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

app.post("/signup", async (req, res) => { // Handling POST request for the /signup route
    const data = { // Extracting data from the request body
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

    await collection.insertMany([data]) // Inserting data into the database

    res.render("home") // Rendering the home template
})

app.post("/login",async (req,res)=>{ // Handling POST request for the /login route
   
    try{
        const check= await collection.findOne({name:req.body.name}) // Finding a document in the database
        if(check.password===req.body.password){ // Checking if the password matches
            res.render("home") // Rendering the home template
        }else{
            res.send("wrong password") // Sending an error message
        }
    }
    catch{

        res.send("wrong details") // Sending an error message
        
    }

})

app.post('/forgot-password', async (req, res) => {
    const email = req.body.email;
    // Lookup user in your database...
    const user = await collection.findOne({ email });
    if (!user) {
        return res.status(400).send('No user with that email');
    }

    const token = crypto.randomBytes(20).toString('hex');
    // Store token in your database...
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await collection.updateOne({ email }, { $set: { resetPasswordToken: token, resetPasswordExpires: user.resetPasswordExpires } });

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
    const user = await collection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).send('Invalid or expired token');
    }

    user.password = newPassword; // Store new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await collection.updateOne({ _id: user._id }, { $set: { password: user.password, resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires } });

    res.send('Password has been updated');
});

app.get('/reset/:token', async (req, res) => {
    const token = req.params.token;
    console.log('Received token:', token);

    // Verify token in your database...
    const user = await collection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
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
})
