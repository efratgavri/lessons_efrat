const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")

exports.auth = (req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url 66666"})
  }
  try{
    let decodeToken = jwt.verify(token,config.tokenSecret);
    // add to req , so the next function will recognize
    // the tokenData/decodeToken
    req.tokenData = decodeToken;
  
    // 12311
    next();
  }
  catch(err){
    console.log(err);
    return res.status(401).json({msg:"Token invalid or expired, log in again or you hacker!"})
  }
}