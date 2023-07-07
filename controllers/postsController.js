const Post = require("../models/Post");
const User = require("../models/User");
const createPost = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);

    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json({ message: `Your post has been updated` });
    } else {
      res.status(403).json({ message: "You can only update your post" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);

    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json({ message: `Your post has been deleted` });
    } else {
      res.status(403).json({ message: "You can only delete your post" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json({ message: `The post has been liked` });
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json({ message: `The post has been unliked` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getTimelinePost = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    res.status(500).json(error);
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });
    const posts = await Post.find({ userId: user._id });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports = {
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getTimelinePost,
  getUserPosts,
};
