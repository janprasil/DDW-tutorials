import nltk
import matplotlib.pyplot as plt
import wikipedia

from collections import Counter
from nltk.corpus import brown
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.sentiment.util import *
from nltk.stem import WordNetLemmatizer
from nltk.stem.porter import PorterStemmer
from string import punctuation
from collections import Counter

def extractEntities(ne_chunked):
  data = {}
  for entity in ne_chunked:
      if isinstance(entity, nltk.tree.Tree):
          text = " ".join([word for word, tag in entity.leaves()])
          ent = entity.label()
          data[text] = ent
      else:
          continue
  return data

text = None
with open('doc2.txt', 'r') as f:
    text = f.read()

## PART 1
sentences = nltk.sent_tokenize(text)
tokens = [nltk.word_tokenize(s) for s in sentences]
tagged = [nltk.pos_tag(sent) for sent in tokens]

## PART 2
tokens = nltk.word_tokenize(text)
tagged = nltk.pos_tag(tokens)
ne_chunked = nltk.ne_chunk(tagged, binary=False)
#print(extractEntities(ne_chunked))

## PART 3
tokens = nltk.word_tokenize(text)
tagged = nltk.pos_tag(tokens)

grammar = "NP: {<DT>?<JJ>*<NN|NNS>}"
cp = nltk.RegexpParser(grammar)
result = cp.parse(tagged)
print(extractEntities(result))
#result.draw()

results = wikipedia.search("Wikipedia")
if (len(results) > 0):
  page = wikipedia.page(results[0])
  print(page.summary)
