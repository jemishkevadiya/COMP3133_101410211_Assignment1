const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userResolver = {
    Query: {
        // Find an User by their email.
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) throw new Error("User not found");

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new Error("Invalid password");

            // Generate JWT Token.
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.TOKEN_EXPIRY || "1h" }
            );

            // Return token user details.
            return { token, user };
        }
    },
    Mutation: {
        // Find an user first to check if it's exist or not.
        signup: async (_, { username, email, password }) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) throw new Error("Email already in use");

            // Hashing password before saving in database.
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, email, password: hashedPassword });

            await newUser.save();
            return newUser;
        }
    }
};

module.exports = userResolver;
