const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const typeDefs = require("./schemas/schema");
const resolvers = require("./resolvers/index");
const jwt = require("jsonwebtoken");
const { graphqlUploadExpress } = require("graphql-upload");
const path = require("path");

dotenv.config(); 
connectDB(); 

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(graphqlUploadExpress());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to authenticate user from JWT token in request headers.
const authMiddleware = ({ req }) => {
    const token = req.headers.authorization || ""; 
    try {
        if (token) {
            const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
            return { user: decoded }; 
        }
    } catch (error) {
        console.log("Invalid Token"); 
    }
    return { user: null }; 
};

// Initialize Apollo Server 
const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: authMiddleware 
});

// Start the Apollo Server and apply middleware to Express app
async function startServer() {
    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.SERVER_PORT; 
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}/graphql`));
}

startServer(); 
