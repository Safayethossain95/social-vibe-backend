const express = require("express");
const post_route = express();

const bodyParser = require("body-parser");

// const {
//   cartGet,
//   cartPost,
//   cartEdit,
//   cartDelete,
//   foodPost,
//   foodGet,
//   cartDecrement,
// } = require("../controller/aboutPage/aboutPageController");
const { userPost, editUser, userGet } = require("../controller/mainControllers/mainController");
const { loginController, signupController, authController, logoutController } = require("../controller/mainControllers/authController");

post_route.use(bodyParser.json());
post_route.use(bodyParser.urlencoded({ extended: true }));

// Certificate Images


// post_route.get("/foodget", foodGet);
// post_route.post("/foodpost", foodPost);


// post_route.get("/cartget", cartGet);
// post_route.post("/cartpost", cartPost);
// post_route.post("/cartdecrement", cartDecrement);
// post_route.post("/cartedit/:id", cartEdit);
// post_route.delete("/cartdelete/:id", cartDelete);

 
 post_route.get("/auth/user", authController);
 post_route.post("/logout", logoutController);
 post_route.post("/login", loginController);
 post_route.post("/signup", signupController);
 post_route.get("/userget/:id", userGet);
 post_route.post("/userpost", userPost);
 post_route.post("/useredit", editUser);
 post_route.post("/newsfeedpost", editUser);

module.exports = post_route;
