const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/Inmedilab")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect");
})

const LogInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection= new mongoose.model("Colleciton1",LogInSchema)

module.exports=collection