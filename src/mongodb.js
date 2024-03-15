const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/Inmedilab")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect");
})

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }
})

const collection= new mongoose.model("Users",LogInSchema)

module.exports=collection