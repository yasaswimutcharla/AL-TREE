import { QUIZ_QUESTIONS } from './src/data/treeData.ts';
import { calculateQuestionPoints, calculateTotalQuizPoints, MAX_QUIZ_POINTS } from './src/components/views/QuizView.tsx';

console.log('Testing Quiz & Points Logic...');

// Test 1: Exactly 14 questions
if (QUIZ_QUESTIONS.length !== 14) {
  throw new Error(`Expected 14 questions, found ${QUIZ_QUESTIONS.length}`);
}
console.log('✅ Test 1 passed: Exactly 14 quiz questions.');

// Test 2: Correct answer awards +5 points
const q0 = QUIZ_QUESTIONS[0];
const confirmed = { [q0.id]: true };
const timeouts = {};
const answersCorrect = { [q0.id]: q0.correctAnswerIndex };
const ptsCorrect = calculateQuestionPoints(q0.id, confirmed, timeouts, answersCorrect);
if (ptsCorrect !== 5) {
  throw new Error(`Expected 5 points for correct answer, got ${ptsCorrect}`);
}
console.log('✅ Test 2 passed: Correct answer awards +5 points.');

// Test 3: Incorrect answer deducts 2 points (−2)
const answersWrong = { [q0.id]: (q0.correctAnswerIndex + 1) % 4 };
const ptsWrong = calculateQuestionPoints(q0.id, confirmed, timeouts, answersWrong);
if (ptsWrong !== -2) {
  throw new Error(`Expected -2 points for incorrect answer, got ${ptsWrong}`);
}
console.log('✅ Test 3 passed: Incorrect answer deducts 2 points (−2).');

// Test 4: Timeout awards 0 points
const timeoutsActive = { [q0.id]: true };
const ptsTimeout = calculateQuestionPoints(q0.id, confirmed, timeoutsActive, answersCorrect);
if (ptsTimeout !== 0) {
  throw new Error(`Expected 0 points for timeout, got ${ptsTimeout}`);
}
console.log('✅ Test 4 passed: Timeout awards 0 points.');

// Test 5: Unanswered awards 0 points
const confirmedUnanswered = { [q0.id]: true };
const ptsUnanswered = calculateQuestionPoints(q0.id, confirmedUnanswered, {}, {});
if (ptsUnanswered !== 0) {
  throw new Error(`Expected 0 points for unanswered, got ${ptsUnanswered}`);
}
console.log('✅ Test 5 passed: Unanswered question awards 0 points.');

// Test 6: Perfect quiz attempt (all 14 correct) = 70 points
const allConfirmed = {};
const allCorrect = {};
QUIZ_QUESTIONS.forEach(q => {
  allConfirmed[q.id] = true;
  allCorrect[q.id] = q.correctAnswerIndex;
});
const totalPerfect = calculateTotalQuizPoints(allConfirmed, {}, allCorrect);
if (totalPerfect !== 70) {
  throw new Error(`Expected 70 points for perfect quiz, got ${totalPerfect}`);
}
console.log('✅ Test 6 passed: 14 correct answers = exactly 70 points.');

// Test 7: Mixed quiz attempt (10 correct = +50, 4 incorrect = -8 -> total 42 pts)
const mixedConfirmed = {};
const mixedAnswers = {};
QUIZ_QUESTIONS.forEach((q, idx) => {
  mixedConfirmed[q.id] = true;
  if (idx < 10) {
    mixedAnswers[q.id] = q.correctAnswerIndex; // 10 correct * 5 = +50
  } else {
    mixedAnswers[q.id] = (q.correctAnswerIndex + 1) % 4; // 4 incorrect * -2 = -8
  }
});
const totalMixed = calculateTotalQuizPoints(mixedConfirmed, {}, mixedAnswers);
if (totalMixed !== 42) {
  throw new Error(`Expected 42 points for mixed quiz, got ${totalMixed}`);
}
console.log('✅ Test 7 passed: Mixed score (10 correct, 4 incorrect) = 42 points.');

// Test 8: All incorrect clamped to 0 minimum
const allWrongAnswers = {};
QUIZ_QUESTIONS.forEach(q => {
  allWrongAnswers[q.id] = (q.correctAnswerIndex + 1) % 4;
});
const totalAllWrong = calculateTotalQuizPoints(allConfirmed, {}, allWrongAnswers);
if (totalAllWrong !== 0) {
  throw new Error(`Expected 0 points minimum floor, got ${totalAllWrong}`);
}
console.log('✅ Test 8 passed: Negative quiz score cleanly floored at 0 pts.');

// Test 9: Topic overall score combination
const vizScore = 30;
const totalTopicMax = vizScore + totalPerfect;
if (totalTopicMax !== 100) {
  throw new Error(`Expected 100 max topic score, got ${totalTopicMax}`);
}
console.log('✅ Test 9 passed: 30 viz pts + 70 quiz pts = 100 total topic points.');

console.log('ALL TESTS PASSED SUCCESSFULLY!');
