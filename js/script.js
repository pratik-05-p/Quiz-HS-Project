// ============================================
// QUIZ MASTER
// Module 1
// ============================================

// ================= DOM ELEMENTS =================

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const category = document.getElementById("category");
const difficulty = document.getElementById("difficulty");
const amount = document.getElementById("amount");

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");

const currentQuestion = document.getElementById("current-question");
const totalQuestion = document.getElementById("total-question");

const scoreElement = document.getElementById("score");

const progressBar = document.getElementById("progress-bar");

const timerElement = document.getElementById("time");

// Result Screen

const finalScore = document.getElementById("final-score");
const resultTotal = document.getElementById("result-total");
const resultCorrect = document.getElementById("result-correct");
const resultWrong = document.getElementById("result-wrong");
const resultPercent = document.getElementById("result-percent");
const performanceMessage =
document.getElementById("performance-message");

// ================= VARIABLES =================

let questions = [];

let currentQuestionIndex = 0;

let score = 0;

let correctCount = 0;

let wrongCount = 0;

let timer;

let timeLeft = 30;

let selectedAnswers = [];

// ================= BUTTON EVENTS =================

startBtn.addEventListener("click", startQuiz);

nextBtn.addEventListener("click", nextQuestion);

restartBtn.addEventListener("click", restartQuiz);

// ============================================
// START QUIZ
// ============================================

async function startQuiz(){

    startScreen.style.display="none";

    resultScreen.style.display="none";

    quizScreen.style.display="block";

    score=0;

    correctCount=0;

    wrongCount=0;

    currentQuestionIndex=0;

    scoreElement.innerHTML="Score : 0";

    questionElement.innerHTML="Loading Questions...";

    await fetchQuestions();

}

// ============================================
// FETCH QUESTIONS
// ============================================

async function fetchQuestions(){

    try{

        let url =
    `https://quiz-hs-project-api.onrender.com/api/quiz?limit=${amount.value}`;

        if(category.value!="")
        url+=`&category=${category.value}`;

        if(difficulty.value!="")
        url+=`&difficulty=${difficulty.value}`;

        const response=await fetch(url);

        questions=await response.json();

        if(!Array.isArray(questions))
        throw new Error("Invalid API Response");

        totalQuestion.innerHTML=questions.length;

        showQuestion();

    }

    catch(error){

        console.error(error);

        questionElement.innerHTML=
        "❌ Failed to Load Quiz Questions.";

    }

}

// ============================================
// SHOW QUESTION
// ============================================

function showQuestion(){

    resetState();

    const q=questions[currentQuestionIndex];

    currentQuestion.innerHTML=currentQuestionIndex+1;

    progressBar.style.width=
    ((currentQuestionIndex+1)/questions.length)*100+"%";

    questionElement.innerHTML=q.question;

    selectedAnswers=[];

    startTimer();

    if(q.multipleCorrect){

        createMultipleQuestion(q);

    }

    else{

        createSingleQuestion(q);

    }

}
// ============================================
// MODULE 2
// CREATE ANSWERS
// ============================================

function createSingleQuestion(q){

    q.answers.forEach(answer=>{

        const button=document.createElement("button");

        button.className="answer-btn";

        button.innerHTML=decodeHTML(answer.text);

        button.dataset.id=answer.id;

        button.addEventListener("click",()=>{

            selectSingleAnswer(button,q);

        });

        answerButtons.appendChild(button);

    });

}

function createMultipleQuestion(q){

    q.answers.forEach(answer=>{

        const button=document.createElement("button");

        button.className="answer-btn";

        button.innerHTML="☐ "+decodeHTML(answer.text);

        button.dataset.id=answer.id;

        button.addEventListener("click",()=>{

            toggleMultiple(button);

        });

        answerButtons.appendChild(button);

    });

    nextBtn.style.display="block";

    nextBtn.innerHTML="Submit Answer";

}

// ============================================
// SINGLE ANSWER
// ============================================

function selectSingleAnswer(button,q){

    stopTimer();

    disableButtons();

    const selected=button.dataset.id;

    const isCorrect=q.correctAnswers.includes(selected);

    if(isCorrect){

        button.classList.add("correct");

        correctCount++;

        let bonus=0;

        if(timeLeft>15){

            bonus=2;

        }

        else if(timeLeft>=5){

            bonus=1;

        }

        score+=3+bonus;

        scoreElement.innerHTML="Score : "+score;

    }

    else{

        wrongCount++;

        button.classList.add("wrong");

    }

    showCorrectAnswers(q);

    showExplanation(q);

    nextBtn.style.display="block";

    nextBtn.innerHTML="Next Question";

}

// ============================================
// MULTIPLE ANSWER
// ============================================

function toggleMultiple(button){

    const id=button.dataset.id;

    if(selectedAnswers.includes(id)){

        selectedAnswers=
        selectedAnswers.filter(x=>x!==id);

        button.classList.remove("correct");

        button.innerHTML=
        "☐ "+button.innerHTML.substring(2);

    }

    else{

        selectedAnswers.push(id);

        button.classList.add("correct");

        button.innerHTML=
        "☑ "+button.innerHTML.substring(2);

    }

}

// ============================================
// HELPER FUNCTIONS
// ============================================

function disableButtons(){

    Array.from(answerButtons.children).forEach(btn=>{

        btn.disabled=true;

    });

}

function showCorrectAnswers(q){

    Array.from(answerButtons.children).forEach(btn=>{

        if(q.correctAnswers.includes(btn.dataset.id)){

            btn.classList.add("correct");

        }

    });

}
// ============================================
// NEXT QUESTION
// ============================================

function nextQuestion(){

    const q = questions[currentQuestionIndex];

    // Handle multiple-correct questions
    if(q.multipleCorrect && nextBtn.innerHTML==="Submit Answer"){

        stopTimer();

        disableButtons();

        let allCorrect=true;

        // Check every selected answer
        selectedAnswers.forEach(ans=>{

            if(!q.correctAnswers.includes(ans)){

                allCorrect=false;

            }

        });

        if(selectedAnswers.length!==q.correctAnswers.length){

            allCorrect=false;

        }

        if(allCorrect){

            correctCount++;

            let bonus=0;

            if(timeLeft>15){

                bonus=2;

            }

            else if(timeLeft>=5){

                bonus=1;

            }

            score+=4+bonus;

        }

        else{

            wrongCount++;

        }

        scoreElement.innerHTML="Score : "+score;

        showCorrectAnswers(q);

        showExplanation(q);

        nextBtn.innerHTML="Next Question";

        return;

    }

    currentQuestionIndex++;

    if(currentQuestionIndex<questions.length){

        showQuestion();

    }

    else{

        finishQuiz();

    }

}

// ============================================
// TIMER
// ============================================

function startTimer(){

    clearInterval(timer);

    timeLeft=30;

    timerElement.innerHTML=timeLeft;

    timer=setInterval(()=>{

        timeLeft--;

        timerElement.innerHTML=timeLeft;

        if(timeLeft<=0){

            clearInterval(timer);

            nextBtn.style.display="block";

            if(nextBtn.innerHTML!=="Submit Answer"){

                nextBtn.innerHTML="Next Question";

            }

        }

    },1000);

}

function stopTimer(){

    clearInterval(timer);

}

// ============================================
// EXPLANATION
// ============================================

function showExplanation(q){

    if(!q.explanation) return;

    const div=document.createElement("div");

    div.className="explanation-box";

    div.style.marginTop="20px";
    div.style.padding="15px";
    div.style.background="#152341";
    div.style.color="white";
    div.style.borderRadius="10px";
    div.style.lineHeight="1.6";

    div.innerHTML=

    "<strong>Explanation</strong><br><br>"+

    decodeHTML(q.explanation);

    answerButtons.appendChild(div);

}

// ============================================
// RESET
// ============================================

function resetState(){

    clearInterval(timer);

    answerButtons.innerHTML="";

    nextBtn.style.display="none";

}

// ============================================
// FINISH QUIZ
// ============================================

function finishQuiz(){

    stopTimer();

    quizScreen.style.display="none";

    resultScreen.style.display="block";

    finalScore.innerHTML=score;

    resultTotal.innerHTML=questions.length;

    resultCorrect.innerHTML=correctCount;

    resultWrong.innerHTML=wrongCount;

    const percentage=Math.round(

        (correctCount/questions.length)*100

    );

    resultPercent.innerHTML=percentage+"%";

    if(percentage>=90){

        performanceMessage.innerHTML="🏆 Excellent";

    }

    else if(percentage>=70){

        performanceMessage.innerHTML="👏 Good Work";

    }

    else if(percentage>=50){

        performanceMessage.innerHTML="🙂 Nice Try";

    }

    else{

        performanceMessage.innerHTML="📚 Keep Practicing";

    }

}

// ============================================
// RESTART QUIZ
// ============================================

function restartQuiz(){

    resultScreen.style.display="none";

    startScreen.style.display="block";

    score=0;

    correctCount=0;

    wrongCount=0;

    currentQuestionIndex=0;

}

// ============================================
// HTML DECODE
// ============================================

function decodeHTML(text){

    if(!text) return "";

    const txt=document.createElement("textarea");

    txt.innerHTML=text;

    return txt.value;

}