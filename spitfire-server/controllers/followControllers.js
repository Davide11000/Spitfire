const Follow = require("../models/followModel");

exports.follow = async (req, res) => {
    try { 
        const follower = req.user.username;
        const following = req.params.username;

        if (follower === following) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const existingFollowing = await Follow.findFollowing(follower);
        if (existingFollowing.some(f => f.following === following)){
            return res.status(400).json({ message: "You are already following this user" });
        }

        const result = await Follow.follow(follower, following);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

exports.unfollow = async (req, res) => {
    try { 
        const follower = req.user.username;
        const following = req.params.username;

        const existingFollowing = await Follow.findFollowing(follower);
        if (!existingFollowing.some(f => f.following === following)){
            return res.status(400).json({ message: "You are not following this user" });
        }

        const result = await Follow.unfollow(follower, following);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getFollowers = async (req, res) => {
    try { 
        const userUsername = req.params.username;

        const followers = await Follow.findFollowers(userUsername);

        res.json(followers);


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getFollowing = async (req, res) => {
    try { 
        const userUsername = req.params.username;

        const followers = await Follow.findFollowing(userUsername);

        res.json(followers);


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
