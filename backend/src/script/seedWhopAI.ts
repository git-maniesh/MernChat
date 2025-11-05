// AI Features Source code link =>


import "dotenv/config"
import UserModel from "../models/user.model"
import connectDatabase from "../config/database.config"


export const CreateWhoopAI = async()=>{
    const existingWhoopAI = await UserModel.findOne({ isAI:true})
    if(existingWhoopAI){
        console.log("whoop ai already exists")
        await UserModel.deleteOne({_id:existingWhoopAI._id})
        // return whoopAI
    }
   const whoopAI = await UserModel.create({
        name:"Whop AI",
        isAI:true,
        avatar:"https://res.cloudinary.com/dur8g9faa/image/upload/v1762143911/ur5xiptwrqzhw5rytono.jpg" //avatar

    })
    console.log("Whoop created ", whoopAI._id)
    return whoopAI

}



const seedWhopAI = async()=>{
    try{
        await connectDatabase();
        await CreateWhoopAI()
        console.log("Seeding Completed")
        process.exit(0)

    }catch(error){
        console.log("Seeding Failed", error)
        process.exit(1)

    }
}

seedWhopAI()