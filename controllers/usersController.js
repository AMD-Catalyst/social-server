const User = require("../models/User");
const bcrypt = require("bcrypt");

const updateUser = async (req, res) => {
  try {
    const currentUser = req.params.id;
    const { userId, current_password, password, confirm_password, isAdmin } =
      req.body;

    if (userId === currentUser || isAdmin) {
      if (password) {
        const cUser = await User.findById(currentUser);

        const validPassword = await bcrypt.compare(
          current_password,
          cUser.password
        );

        if (!validPassword) {
          return res.status(400).json({ message: "Invalid Current Password" });
        }

        if (password !== confirm_password) {
          return res.status(400).json({ message: `Password does not match.` });
        }

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await User.findByIdAndUpdate(currentUser, {
        $set: req.body,
      });

      res.status(200).json({ message: `Account has been Updated` });
    } else {
      return res
        .status(403)
        .json({ message: "You can only update your account" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const currentUser = req.params.id;
    const { userId, isAdmin } = req.body;

    if (userId === currentUser || isAdmin) {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: `Account has been Deleted` });
    } else {
      return res
        .status(403)
        .json({ message: "You can only delete your account" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getUser = async (req, res) => {
  try {
    const { userId, username } = req.query;
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
};

const followUser = async (req, res) => {
  try {
    const { id: cId } = req.params;
    const { userId } = req.body;

    if (cId !== userId) {
      const userPromise = User.findById(cId);
      const currentUserPromise = User.findById(userId);

      const [user, currentUser] = await Promise.all([
        userPromise,
        currentUserPromise,
      ]);

      if (!user.followers.includes(userId)) {
        const apUser = user.updateOne({ $push: { followers: userId } });
        const apcUser = currentUser.updateOne({
          $push: { followings: cId },
        });

        await Promise.all([apUser, apcUser]);

        res.status(200).json({ message: `User has been followed` });
      } else {
        res.status(403).json({ message: `You already followed this user` });
      }
    } else {
      res.status(403).json({ message: `You can't follow yourself` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { id: cId } = req.params;
    const { userId } = req.body;

    if (cId !== userId) {
      const userPromise = User.findById(cId);
      const currentUserPromise = User.findById(userId);

      const [user, currentUser] = await Promise.all([
        userPromise,
        currentUserPromise,
      ]);

      if (user.followers.includes(userId)) {
        const apUser = user.updateOne({ $pull: { followers: userId } });
        const apcUser = currentUser.updateOne({
          $pull: { followings: cId },
        });

        await Promise.all([apUser, apcUser]);

        res.status(200).json({ message: `User has been unfollowed` });
      } else {
        res.status(403).json({ message: `You don't follow this user` });
      }
    } else {
      res.status(403).json({ message: `You can't unfollow yourself` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getFollowings = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const followings = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let followingsList = [];
    followings.map((following) => {
      const { _id, username, profilePicture } = following;
      followingsList.push({ _id, username, profilePicture });
    });

    res.status(200).json(followingsList);
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports = {
  updateUser,
  deleteUser,
  getUser,
  followUser,
  unfollowUser,
  getFollowings,
};
