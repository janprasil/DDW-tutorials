import natural from 'natural';
import sentences from './rev.js';

const tokenizer = new natural.WordTokenizer();

sentences.forEach(x => {
  console.log(tokenizer.tokenize(x.reviewText));
  console.log('\n');
});

