import json
import csv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import chi2
from sklearn.cross_validation import train_test_split
import numpy as np
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import SGDClassifier
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn import metrics
from sklearn.manifold import MDS, TSNE
from sklearn.decomposition import TruncatedSVD
from MulticoreTSNE import MulticoreTSNE
import umap
import pandas as pd
import random
from gb_writer import GlyphboardWriter
# from sklearn.model_selection import GridSearchCV
from typing import Any
import spacy
from spacy.lang.de.stop_words import STOP_WORDS


nlp = spacy.load('de')


# Classifiers
SGD = SGDClassifier(loss='hinge', penalty='l2', alpha=1e-3,
                    random_state=42, max_iter=5, tol=None)
MNB = MultinomialNB()
LR = LogisticRegression()
SVC = LinearSVC()

vec = TfidfVectorizer(strip_accents='ascii', max_df=0.5, sublinear_tf=True)
SPLICE_POINT = 800
UNLABELED_VALUE = -1

# Load Glyphboard data as test
# 3 = Event, 4 = Music

def initData():
    texts = []
    labels = []
    ids = []
    peer_labels = []
    with open("mlbackend/test_data.json", "r") as read_file:
        LC_data = json.load(read_file)

    for doc in LC_data:
        ids.append(doc['id'])
        texts.append(doc["values"]["7"])
        peer_labels.append(doc["features"]["1"]["4"])
        # simulate all as labeled (for test_data)
        if (doc["features"]["1"]["4"] > 0.5):
            labels.append(1)
        else:
            labels.append(0)

    df = pd.DataFrame({
        'id': ids,
        'text': texts,
        'label': labels,
        'peer_label': peer_labels,
        'score': [0] * len(LC_data),
        'isLabeled': [False]  * len(LC_data)
    })
   
    test_data = df[SPLICE_POINT+1:]
    test_data.to_csv('mlbackend/test_data.csv', sep=";", encoding="utf8", index=False)
    
    data_with_scores = getSelectionScores()
    data_with_scores.to_csv('mlbackend/data.csv', sep=";", encoding="utf8", index=False)
    # resetTrainData()

def loadData():
    return pd.read_csv('mlbackend/data.csv', sep=";", encoding="utf8")

def saveData(data):
    data.to_csv('mlbackend/data.csv', sep=";", encoding="utf8", index=False)

def handleNewAnswer(answer):    
    newAnswer = {
        'text': answer['text'],
        'docId': answer['documentId'],
        'label': int(answer['answer']),
        'question': answer['questionId']
    }
    train_data = getTrainData()

    test_data = getTestData()
    
    data = updateDataWithLabel(newAnswer['docId'], newAnswer['label'])
    data = loadData()
    if len(train_data) > 3:
        # tfidf = vec.fit_transform(data.text)
        # positions = applyDR(tfidf, data.label)
        train_result = train(train_data, test_data, SGD)
        return {
            # 'positions': positions,
            'train_result': train_result
        }
    else:
        return ''

def updateDataWithLabel(docId, label):
    data = loadData()
    print('before', data.loc[data['id'] == docId])
    data.loc[data['id'] == docId, 'label'] = int(label)
    data.loc[data['id'] == docId, 'isLabeled'] = True
    print('after', data.loc[data['id'] == docId])
    saveData(data)

    return data


def createMetrics(algo):
    test_data = getTestData()
    train_data_df = getTrainData()
    train_data_df.label = train_data_df.label.astype(int)
    met = []
    # Create stepwise metrics algo, simulating a history
    for number in range(30, len(train_data_df)):
        train_data_iteration = train_data_df.head(number)
        met.append(train(train_data_iteration, test_data, algo=algo))
    return pd.DataFrame(met)


def train(train_data, test_data, algo: Any) -> dict:
    text_clf = Pipeline([
        # ('vect', CountVectorizer()),
        ('tfidf', vec),
        ('clf', algo),
    ])
    text_clf.fit(train_data.text, train_data.label)
    predicted = text_clf.predict(test_data.text)
    addHistory(metrics.f1_score(test_data.label, predicted))
    result = {
        'precision': metrics.precision_score(test_data.label, predicted),
        'recall': metrics.recall_score(test_data.label, predicted),
        'f1': metrics.f1_score(test_data.label, predicted),
        'f1_history': getHistory()
    }
    return result

def getTrainData():
    data = loadData()
    return data.loc[data['isLabeled'] == True]

def getTestData():
    return pd.read_csv('mlbackend/test_data.csv', delimiter=';', encoding="utf8")

def resetTrainData():
    data = loadData()
    data.loc[:, 'label'] = UNLABELED_VALUE
    saveData(data)

def cleanupTexts():
    data = loadData()
    for idx, text in enumerate(data.text):
        data.loc[idx, 'text'] = preprocessText(text)
        
    saveData(data)

def mockTraining(amount):
    data = loadData()
    for i in range(amount):
        data.loc[i, 'isLabeled'] = True
        if data.loc[i].peer_label > 0.5:
            data.loc[i, 'label'] = 1
        else:
            data.loc[i, 'label'] = 0        
    saveData(data)

def simulateTraining(iterations):
    test_data = getTestData()
    mockTraining(iterations)
    train_data = getTrainData()
    train(train_data, test_data, SGD)

def getHistory():
    history = []
    with open(
            "mlbackend/metrics.csv", "r", encoding="utf8") as file:
        reader = csv.reader(file, delimiter=';')
        for line in reader:
            history.append(line[0])
        file.close()
    return history


def addHistory(metrics):
    with open(
            "mlbackend/metrics.csv", "a",  newline="", encoding="utf8") as file:
        writer = csv.writer(file, delimiter=';')
        writer.writerow([str(metrics)])
        file.close()

def getCurrentScore() -> int:
    return getHistory().pop()

def applyDR(tfidf, labels = []):    
    # pre_computed = TruncatedSVD(n_components=100, random_state=1).fit_transform(tfidf.toarray())
    # LABEL_IMPACT = 0
    labels_arr = np.asarray(labels)
    labels_arr = labels_arr.reshape(len(labels_arr), 1)
    # with_labels = np.hstack((tfidf.toarray(), labels_arr))
    computed_coords = umap.UMAP(min_dist=0.8, random_state=1).fit(tfidf.toarray())
    computed_coords = computed_coords.embedding_
    # computed_coords = MulticoreTSNE(n_jobs=4, random_state=1).fit_transform(with_labels)
    df = pd.DataFrame(columns=['x', 'y'])
    df['x'] = computed_coords[:, 0]
    df['y'] = computed_coords[:, 1]

    writer = GlyphboardWriter('test_name')

    # DR *= 2
    print('Writing positions...')    
    positions = writer.write_position(positions=df, algorithm='umap')
    return positions

def preprocessText(text: str) -> str:
    # print('Original: ', text)
    doc = nlp(text)
    # Remove Stop Words and get Lemmas
    return ' '.join([token.text for token in doc if not token.is_stop])
    # for word in doc:
    #     if word.is_stop == True:
    #         print('Stop %s', word)
    # print(word.lemma_)

#             # Get NER
#     for ent in doc.ents:
#         print(ent.text, ent.start_char, ent.end_char, ent.label_)

def getSelectionScores(clf = MNB, train_data = getTestData()): 
    rest_data = loadData()
    text_clf = Pipeline([
        # ('vect', CountVectorizer()),
        ('tfidf', vec),
        ('clf', clf),
    ])
    text_clf.fit(train_data.text, train_data.label)
    prs = text_clf.predict_proba(rest_data.text) 
    result_pos = [1-2*abs(x[1]-0.5)  for x in prs]
    rest_data['score'] = result_pos
    return rest_data

# def getCurrentDataset():
#     return load

# initData()
