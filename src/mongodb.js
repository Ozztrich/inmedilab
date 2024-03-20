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
const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
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
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
})

// Define schema for the "Quote" collection
const QuoteSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    requiredStudies: {
        type: String,
        required: true
    },
    registryDate: {
        type: Date,
        required: true
    },
    companySocialReason: {
        type: String,
        required: true
    },
    companyPlant: {
        type: String,
        required: true
    },
    companyPhoneNumber: {
        type: String,
        required: true
    },
    companyMainActivity: {
        type: String,
        required: true
    },
    companyEmployerRegistry: {
        type: String,
        required: true
    },
    companyRFC: {
        type: String,
        required: true
    },
    companyLegalRepresentative: {
        type: String,
        required: true
    },
    companyAdministrativeTurn: {
        type: String,
        required: true
    },
    companyFirstTurn: {
        type: String,
        required: true
    },
    companySecondTurn: {
        type: String,
        required: true
    },
    companyThirdTurn: {
        type: String,
        required: true
    },
    companyPhysicalLocation: {
        streetNameAndNumber: {
            type: String,
            required: true
        },
        colony: {
            type: String,
            required: true
        },
        municipality: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    recipient: {
        name: {
            type: String,
            required: true
        },
        positionInCompany: {
            type: String,
            required: true
        },
        grade: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        additionalComments: {
            type: String
        }
    },
    billingInformation: {
        socialReason: {
            type: String,
            required: true
        },
        streetNameAndNumber: {
            type: String,
            required: true
        },
        colony: {
            type: String,
            required: true
        },
        municipality: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    }
})

// Create a model based on the user schema
const User = mongoose.model("Users", UserSchema);

// Create a model based on the quote schema
const Quote= mongoose.model("Quote", QuoteSchema);

// Export the models to be used in other files
module.exports = { User, Quote };