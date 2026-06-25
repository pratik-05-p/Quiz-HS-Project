const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import Quiz Routes
const quizRoutes = require("./routes/quiz");

// Use Quiz Routes
app.use("/api/quiz", quizRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Quiz API Backend Running 🚀"
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});