import nltk
import matplotlib.pyplot as plt

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

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

text = None
with open('doc2.txt', 'r') as f:
    text = f.read()

sentences = nltk.sent_tokenize(text)
tokens = [nltk.word_tokenize(s) for s in sentences]
tagged = [nltk.pos_tag(sent) for sent in tokens]

tokens = nltk.word_tokenize(text)

### Preprocessing
counter = Counter(tokens);
print(counter.most_common()[0]);

nopunc_tokens = [token for token in tokens if token not in punctuation]
### Postprocessing
counter = Counter(nopunc_tokens);
print(counter.most_common()[0]);

stems = {token:stemmer.stem(token) for token in tokens}
lemmas = {token:lemmatizer.lemmatize(token) for token in tokens}

# ### Stems
# counter = Counter(stems);
# print(counter.most_common()[0]);

# ### Lemas
# counter = Counter(lemmas);
# print(counter.most_common()[0]);

### Chunked
tagged = nltk.pos_tag(tokens)
ne_chunked = nltk.ne_chunk(tagged, binary=False)
# print(extractEntities(ne_chunked))
counter = Counter(extractEntities(ne_chunked).values());
print(counter.most_common()[0]);

### Sentiment
vader_analyzer = SentimentIntensityAnalyzer()
print(vader_analyzer.polarity_scores(text))


