const router = require("express").Router();
const usersController = require("../controllers/usersController");

router
  .route("/:id")

  .put(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/").get(usersController.getUser);

router.put("/:id/follow", usersController.followUser);
router.put("/:id/unfollow", usersController.unfollowUser);

router.get("/followings/:userId", usersController.getFollowings);
module.exports = router;
