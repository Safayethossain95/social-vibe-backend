const express = require("express");
const post_route = express();

const bodyParser = require("body-parser");

const {
  cartGet,
  cartPost,
  cartEdit,
  cartDelete,
  foodPost,
  foodGet,
  cartDecrement,
} = require("../controller/aboutPage/aboutPageController");
const { userPost } = require("../controller/mainControllers/mainController");

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

 post_route.post("/userpost", userPost);

module.exports = post_route;
