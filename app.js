const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
// המודול של אי אן וי דואג שהאפליקציה תכיר את הקובץ אינוורמינט שמכיל 
// משתנים סודיים והגדרות של השרת

const {routesInit} = require("./routes/config_routes")
require("./db/mongoconnect");

const app = express();

// נותן גישה לכל הדומיינים לגשת לשרת שלנו
app.use(cors());
// כדי שנוכל לקבל באדי
app.use(express.json());
// הגדרת תקיית הפאבליק כתקייה ראשית
app.use(express.static(path.join(__dirname,"public")))

routesInit(app);

const server = http.createServer(app);

console.log("env",process.env.TEST, process.env.USER_DB)

// console.log(process.env.TEST);
let port = 3002
// let port = process.env.PORT || 3000
server.listen(port);

