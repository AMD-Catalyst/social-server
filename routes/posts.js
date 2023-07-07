const router = require("express").Router();
const postsController = require("../controllers/postsController");

router.route("/").post(postsController.createPost);

router
  .route("/:id")
  .get(postsController.getPost)
  .put(postsController.updatePost)
  .delete(postsController.deletePost);

router.route("/:id/like").put(postsController.likePost);

router.route("/timeline/:userId").get(postsController.getTimelinePost);

router.route("/profile/:username").get(postsController.getUserPosts);
module.exports = router;
