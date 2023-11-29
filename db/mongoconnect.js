const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery' , false);

    await mongoose.connect('mongodb://127.0.0.1:27017/maor23');
    // await mongoose.connect('mongodb+srv://{config.userDb}:{config.userPass}@cluster0.foomjir.mongodb.net/Maor24')
    console.log("mongo connect started1111");
 
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

