const mongoose = require("mongoose")

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Inmedilab")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log("failed to connect");
    })

// Define the schema for the "Users" collection
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

// Create a model based on the schema
const collection = new mongoose.model("Users", LogInSchema)

// Export the model to be used in other files
module.exports = collection