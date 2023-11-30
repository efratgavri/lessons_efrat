const indexR = require("./index");
const usersR = require("./users");

const toisR = require("./tois");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
 
  app.use("/tois",toisR)
}