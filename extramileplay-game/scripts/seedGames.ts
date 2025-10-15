import { seedGameQuestions } from '../app/lib/firebase/seedGameData';

seedGameQuestions().catch(err => {
  console.error(err);
  process.exit(1);
});