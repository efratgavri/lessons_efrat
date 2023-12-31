const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToyModel, validateToy } = require("../models/toyModel");
const { date } = require("joi");
const router = express.Router();


//https://lesson-try.onrender.com/tois/
router.get("/", async (req, res) => {
    // Math.min -> המספר המקסימלי יהיה 20 כדי שהאקר לא ינסה
    // להוציא יותר אם אין צורך בזה מבחינת הלקוח
    let perPage = Math.min(req.query.perPage, 20) || 4;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    // מחליט אם הסורט מהקטן לגדול 1 או גדול לקטן 1- מינוס 
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ToyModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }

})
///https://lesson-try.onrender.com/tois/
router.post("/", auth, async (req, res) => {
    let valdiateBody = validateToy(req.body);
    if (valdiateBody.error) {
        return res.status(400).json(valdiateBody.error.details)
    }
    try {
        let toy = new ToyModel(req.body);
        // הוספת מאפיין האיי די של המשתמש
        // בהמשך יעזור לנו לזהות שירצה למחוק או לערוך רשומה
        //  tokenData._id; -> מגיע מפונקציית האוט מהטוקן ומכיל את 
        // האיי די של המשתמש
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})




//https://lesson-try.onrender.com/tois/search?s=laptop
router.get("/search", async (req, res) => {
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i");
        let perPage = 10;
        let page = req.query.page || 1;

        let data = await ToyModel.find({
            $or: [
                { name: searchReg },
                { info: searchReg }
            ]
        })
        .limit(perPage )
            .skip((page - 1) * perPage);;

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err });
    }
});



// האדמין יוכל לערוך את כל הרשומות ויוזרים יוכלו לערוך רק את של עצמם
router.put("/:editId",auth, async(req,res) => {
    let validBody = validateToy(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details);
    }
   
    try{
      let editId = req.params.editId;
      let data;
       let status;
      if(req.tokenData.role == "admin"){
        data = await ToyModel.updateOne({_id:editId},req.body)
        status = [{
          status:"200 success",
          msg:"admin update"
        }]
      }
      else{
         data = await ToyModel.updateOne({_id:editId,user_id:req.tokenData._id},req.body)
         status = [{
          status:"200 success",
          msg:"user update"
        }]
      }
      if(data.modifiedCount==0){
        data=[{msg:"eror updete, you not update nothing or this toy not belong to you,try again"}];
        status=[{
          status:"faild",
          msg:"enable update"
        }]
      }
      res.json(data,status);
    }
    
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })
  
  
  // האדמין יוכל למחוק את כל הרשומות ויוזרים יוכלו למחוק רק את של עצמם
  //https://lesson-try.onrender.com/users/656c26da6db050fa810c3fb2
  router.delete("/:delId",auth, async(req,res) => {
    try{
      let delId = req.params.delId;
      let data;
      // אם אדמין יכול למחוק כל רשומה אם לא בודק שהמשתמש
      // הרשומה היוזר איי די שווה לאיי די של המשתמש
      if(req.tokenData.role == "admin"){
        data = await ToyModel.deleteOne({_id:delId})
      }
      else{
        data = await ToyModel.deleteOne({_id:delId,user_id:req.tokenData._id})
      }
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })


///https://lesson-try.onrender.com/tois/category?category=Electronics
  router.get("/category", async (req, res) => {
    try {
        let perPage = 10;
        let page = req.query.page || 1;
        let category = req.query.category;

        if (!category) {
            return res.status(400).json({ msg: "חובה לספק קטגוריה לחיפוש" });
        }

        let data = await ToyModel.find({ category: category })
            .limit(perPage)
            .skip((page - 1) * perPage);

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "התרחשה שגיאה, אנא נסה שוב מאוחר יותר", err });
    }
});

//https://lesson-try.onrender.com/tois/prices?perPage=10&&min=20&max=80
router.get("/prices", async (req, res) => {
  let perPage = req.query.perPage || 5;
  let page = req.query.page || 1;

  // Extracting minimum and maximum price from query parameters
  let minPrice = req.query.min || 0;
  let maxPrice = req.query.max || Number.MAX_SAFE_INTEGER;

  try {
    let data = await ToyModel.find({
      // Filtering by price within the specified range
      price: { $gte: minPrice, $lte: maxPrice }
    })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "There was an error, please try again later", err });
  }
});

//https://lesson-try.onrender.com/tois/single/65687670c6e99d6e07462df4
router.get("/single/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    const data = await ToyModel.findById(itemId);

    if (!data) {
      return res.status(404).json({ msg: "לא נמצאה רשומה עם המזהה שסופק" });
    }

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "התרחשה שגיאה, אנא נסה שוב מאוחר יותר", err });
  }
});


module.exports = router;