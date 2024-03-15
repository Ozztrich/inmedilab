const express = require("express")
const app = express()
const path = require("path")
const hbs=require("hbs")
const collection=require("./mongodb")

const templatePath=path.join(__dirname,'../templates')

app.use(express.json())
app.set("view engine","hbs")
app.set("views",templatePath)
app.use(express.urlencoded({extended:false}))

app.get("/",(req,res)=>{
    res.render("login")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    const data = {
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
    if (!passwordRegex.test(data.password)) {
        res.send("Password must have at least 1 uppercase letter and be between 8 to 16 characters in length");
        return;
    }

    // Check if the two passwords match
    if (data.password !== data.confirmPassword) {
        res.send("Passwords do not match");
        return;
    }

    // Remove the confirmPassword field before saving to database
    delete data.confirmPassword;

    await collection.insertMany([data])

    res.render("home")
})

app.post("/login",async (req,res)=>{
   
    try{
        const check= await collection.findOne({name:req.body.name})
        if(check.password===req.body.password){
            res.render("home")
        }else{
            res.send("wrong password")
        }
    }
    catch{

        res.send("wrong details")
        
    }

})

app.listen(3000,()=>{
    console.log("port connected");
})