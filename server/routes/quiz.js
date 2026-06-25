const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const {
            category,
            difficulty,
            limit = 10
        } = req.query;

        const response = await axios.get(
            "https://old.quizapi.io/api/v1/questions",
            {
                params: {
                    apiKey: process.env.QUIZ_API_KEY,
                    category,
                    difficulty,
                    limit
                }
            }
        );

        const questions = response.data.map((q) => {

            const answers = [];

            Object.entries(q.answers).forEach(([key, value]) => {
                if (value !== null) {
                    answers.push({
                        id: key,
                        text: value
                    });
                }
            });

            const correctAnswers = [];

            Object.entries(q.correct_answers).forEach(([key, value]) => {
                if (value === "true") {
                    correctAnswers.push(
                        key.replace("_correct", "")
                    );
                }
            });

            return {
                id: q.id,
                question: q.question,
                description: q.description,
                answers,
                correctAnswers,
                multipleCorrect:
                    q.multiple_correct_answers === "true",
                explanation: q.explanation,
                category: q.category,
                difficulty: q.difficulty
            };
        });

        res.json(questions);

    } catch (err) {

        console.error("========== QuizAPI ERROR ==========");

        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error(err.message);
        }

        res.status(500).json({
            error: "Failed to fetch QuizAPI questions"
        });
    }
});

module.exports = router;