const mongoose=require("mongoose");

        
const URI=process.env.URI 
console.log(URI) 
const connectDb= async()=>{ 
    try{
       await mongoose.connect(URI)
        console.log("DB Connected successfully")
    }catch(err){ 
        console.log(`DB Error: ${err.message}`);
        process.exit(1)
    }
}
  
module.exports = connectDb       