const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../schema");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");


const router = express.Router();

// Zod schema for signup validation
const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
});

// Signup Route
router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs",
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
        return res.status(409).json({
            message: "Email already taken",
        });
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    await Account.create({
        userId: user._id,
        balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.status(201).json({
        message: "User created successfully",
        token,
    });
});

// Zod schema for signin validation
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

// Signin Route
router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs",
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials",
        });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
        token,
    });
});

// Zod schema for update validation
const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

// Update User Route
router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid update inputs",
        });
    }

    await User.updateOne(
        { _id: req.userId }, // Corrected query filter
        { $set: req.body }   // Corrected update operation
    );

    res.json({
        message: "Updated successfully",
    });
});

// Get Users in Bulk
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } },
        ],
    });

    res.json({
        users: users.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        })),
    });
});

module.exports = router;
