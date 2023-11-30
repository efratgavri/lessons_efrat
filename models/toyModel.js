const mongoose = require("mongoose");
const Joi = require("joi");

const toySchema = new mongoose.Schema({
  name:String,
  info:String,
  category:String,
  img_url:String,
  price:Number,
  // בנוסף כל רשומה בברירת מחדל שמייצר אותה
  // ייתן לה את התאריך של עכשיו
  date_create:{
    type:Date, default:Date.now()
  },
  user_id:String
})

exports.ToyModel = mongoose.model("tois",toySchema);

exports.validateToy = (_reqBody) => {
  let schemaJoi = Joi.object({
    name:Joi.string().min(2).max(99).required(),
    info:Joi.string().min(2).max(99).required(),
    category:Joi.string().min(2).max(99).required(),
  
    img_url:Joi.string().min(2).max(99).allow(null,""),
    price:Joi.number().min(2).max(5000).required()
  })
  return schemaJoi.validate(_reqBody)
}
