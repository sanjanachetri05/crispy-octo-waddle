// === Configuration ===
const TIMER_SECONDS = 30; // total quiz time, change as needed

// === DOM Elements ===
const homeSection = document.getElementById('home-section');
const quizSection = document.getElementById('quiz-section');
const resultSection = document.getElementById('result-section');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const timerSpan = document.getElementById('time-remaining');
const scoreDiv = document.getElementById('score');
const answersReviewDiv = document.getElementById('answers-review');

// === State ===
let questions = [];
let userAnswers = {};
let currentIndex = 0;
let timer = null;
let timeLeft = 0;

// === Functions ===
function showSection(section) {
  homeSection.style.display = 'none';
  quizSection.style.display = 'none';
  resultSection.style.display = 'none';
  section.style.display = 'block';
}

function startQuiz() {
  fetch('backend/get_questions.php')
    .then(res => res.json())
    .then(data => {
      questions = data.questions;
      userAnswers = {};
      currentIndex = 0;
      timeLeft = TIMER_SECONDS;
      showSection(quizSection);
      showQuestion();
      updateTimer();
      timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
          clearInterval(timer);
          submitQuiz();
        }
      }, 1000);
    })
    .catch(e => {
      alert('Error fetching quiz questions.');
    });
}

function updateTimer() {
  const mm = String(Math.floor(timeLeft / 60)).padStart(2,'0');
  const ss = String(timeLeft % 60).padStart(2,'0');
  timerSpan.textContent = mm + ':' + ss;
}

function showQuestion() {
  const q = questions[currentIndex];
  if (!q) return;
  questionContainer.textContent = `Q${currentIndex+1}: ${q.text}`;
  optionsContainer.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => {
      document.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      userAnswers[q.id] = opt.id;
      nextBtn.style.display = (currentIndex < questions.length-1) ? 'block' : 'none';
      submitBtn.style.display = (currentIndex === questions.length-1) ? 'block' : 'none';
    };
    if (userAnswers[q.id] === opt.id) btn.classList.add('selected');
    optionsContainer.appendChild(btn);
  });
  // Buttons visibility
  nextBtn.style.display = (userAnswers[q.id] && currentIndex < questions.length-1) ? 'block' : 'none';
  submitBtn.style.display = (userAnswers[q.id] && currentIndex === questions.length-1) ? 'block' : 'none';
}

function nextQuestion() {
  if(currentIndex < questions.length-1) {
    currentIndex++;
    showQuestion();
  }
}

function submitQuiz() {
  clearInterval(timer);
  // If user hasn't answered all, fill with undefined
  questions.forEach(q => { if(!userAnswers[q.id]) userAnswers[q.id] = null; });
  showSection(resultSection);
  scoreDiv.textContent = 'Checking results...';
  // send POST to backend for scoring
  fetch('backend/submit_answers.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ answers: userAnswers })
  })
  .then(res => res.json())
  .then(data => {
    scoreDiv.textContent = `Your score: ${data.score} out of ${data.total}`;
    answersReviewDiv.innerHTML = '';
    data.details.forEach((det,i) => {
      const q = questions.find(qq => qq.id == det.question_id);
      const userOpt = det.options.find(opt => opt.id == det.selected_option);
      const correctOpt = det.options.find(opt => opt.id == det.correct_option);
      answersReviewDiv.innerHTML += `<div><b>Q${i+1}: ${q.text}</b><br> 
        Your answer: <span class="${det.is_correct ? 'correct':'incorrect'}">${userOpt ? userOpt.text : 'No answer'}</span><br>
        Correct answer: <span class="correct">${correctOpt.text}</span></div><hr>`;
    });
  })
  .catch(e => {
    scoreDiv.textContent = 'Error grading quiz.';
  })
}

function restartQuiz() {
  showSection(homeSection);
}

// === Event Listeners ===
startBtn.onclick = startQuiz;
nextBtn.onclick = nextQuestion;
submitBtn.onclick = submitQuiz;
restartBtn.onclick = restartQuiz;

// Start on home section
document.addEventListener('DOMContentLoaded', ()=>{
  showSection(homeSection);
});
