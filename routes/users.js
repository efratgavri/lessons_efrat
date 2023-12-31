// 3
const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel")
const router = express.Router();



//https://lesson-try.onrender.com/users/
router.get("/", async (req, res) => {
  res.json({ msg: "Users work" })
})
//https://lesson-try.onrender.com/users/myInfo
// אזור שמחזיר למשתמש את הפרטים שלו לפי הטוקן שהוא שולח
router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

// רק משתמש אדמין יוכל להגיע ולהציג את רשימת 
// כל המשתמשים
router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//https://lesson-try.onrender.com/users/
router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  // במידה ויש טעות בריק באדי שהגיע מצד לקוח
  // יווצר מאפיין בשם אירור ונחזיר את הפירוט של הטעות
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // נרצה להצפין את הסיסמא בצורה חד כיוונית
    // 10 - רמת הצפנה שהיא מעולה לעסק בינוני , קטן
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();
    user.password = "***";
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })

    }
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})

// האדמין יוכל למחוק את כל הרשומות ויוזרים יוכלו למחוק רק את של עצמם
//https://lesson-try.onrender.com/users/:656879826ed6befb4fee0ece 
router.delete("/:delId", auth, async (req, res) => {
  try {
    let delId = req.params.delId;
    let data;
    // אם אדמין יכול למחוק כל רשומה אם לא בודק שהמשתמש
    // הרשומה היוזר איי די שווה לאיי די של המשתמש
    if (req.tokenData.role == "admin") {
      data = await UserModel.deleteOne({ _id: delId })

    }
    else {
      data = await UserModel.deleteOne({ _id: delId, _id: req.tokenData._id })
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

// האדמין יוכל לערוך את כל הרשומות ויוזרים יוכלו לערוך רק את של עצמם
// https://lesson-try.onrender.com/users/:656bbeca726385d315918361
router.put("/:editId", auth, async (req, res) => {
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let editId = req.params.editId;
    let data;
    if (req.tokenData.role == "admin") {
      req.body.password = await bcrypt.hash(req.body.password, 10)
      data = await UserModel.updateOne({ _id: editId }, req.body)
    }
    else {
      req.body.password = await bcrypt.hash(req.body.password, 10)
      data = await UserModel.updateOne({ _id: editId, _id: req.tokenData._id }, req.body)
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})
// router.put("/:idEdit", auth, async (req, res) => {
//   let idEdit = req.params.idEdit;
//   let validBody = userValid(req.body);
//   if (validBody.error) {
//     return res.status(400).json(validBody.error.details);
//   }
//   try{

//     let data;
//     if (req.tokenData._role == "admin") {
//       req.body.password = await bcrypt.hash(req.body.password, 10)

//       data = await UserModel.updateOne({ _id: idEdit }, req.body);
//     }
//     else if (idEdit == req.tokenData.user_id) {
//       req.body.password = await bcrypt.hash(req.body.password, 10)

//       data = await UserModel.updateOne({ _id: idEdit }, req.body);
//     }
//     else {
//       data = [{ status: "failed", msg: "You are trying to do an operation that is not enabled!" }]
//     }
//     res.json(data);

//   }
//   catch (err) {
//     console.log(err);
//     res.status(500).json({ err })
//   }
// })
// שינוי בלוג אין אנחנו שולחים גם רול בקייאט טוקן
// https://lesson-try.onrender.com/users/login
router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    // .details -> מחזיר בפירוט מה הבעיה צד לקוח
    return res.status(400).json(validBody.error.details);
  }
  try {
    // קודם כל לבדוק אם המייל שנשלח קיים  במסד
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }
    // אם הסיסמא שנשלחה בבאדי מתאימה לסיסמא המוצפנת במסד של אותו משתמש
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }
    // מייצרים טוקן לפי שמכיל את האיידי של המשתמש
    let token = createToken(user._id, user.role);
    res.json({ token });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;