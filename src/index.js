const express = require("express") // Importing the express module
const path = require("path") // Importing the path module
const hbs=require("hbs") // Importing the hbs module for handlebars templating
const collection=require("./mongodb") // Importing the mongodb module

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

app.listen(3000,()=>{ // Starting the server on port 3000
    console.log("port connected");
})
