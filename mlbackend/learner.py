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

vec = TfidfVectorizer()
SPLICE_POINT = 800

# Load Glyphboard data as test
# 3 = Event, 4 = Music

def initData():
    texts = []
    labels = []
    ids = []
    selection_score = []
    peer_labels = []
    with open("mlbackend/test_data.json", "r") as read_file:
        test_data = json.load(read_file)

    

    for doc in test_data:
        ids.append(doc['id'])
        texts.append(doc["values"]["7"])
        selection_score.append(1-doc["features"]["1"]["4"])
        peer_labels.append(doc["features"]["1"]["4"])
        # labels.append(doc["features"]["1"]["4"])
        if (doc["features"]["1"]["4"] > 0.5):
            labels.append(1)
        else:
            labels.append(0)

    df = pd.DataFrame({
        'id': ids,
        'text': texts,
        'label': labels,
        'score': selection_score,
        'peer_label': peer_labels
    })

    # unlabeled = df[:200]    
    test_data = df[SPLICE_POINT+1:]
    test_data.to_csv('mlbackend/test_data.csv', sep=";", encoding="utf8", index=False)
    
    df.loc[:, 'label'] = 0.5
    df.to_csv('mlbackend/data.csv', sep=";", encoding="utf8", index=False)



def loadData():
    return pd.read_csv('mlbackend/data.csv', sep=";", encoding="utf8")

def handleNewAnswer(answer):    
    newAnswer = {
        'text': answer['text'],
        'docId': answer['documentId'],
        'label': int(answer['answer']),
        'question': answer['questionId']
    }
    train_data = getTrainData()

    test_data = pd.read_csv(
        'mlbackend/test_data.csv', delimiter=';', encoding="utf8")

    
    data = updateDataWithLabel(newAnswer['docId'], newAnswer['label'])

    if len(train_data) > 3:
        tfidf = vec.fit_transform(data.text)
        positions = applyDR(tfidf, data.label)
        train_result = train(train_data, test_data, MNB)
        return json.dumps({
            'positions': positions,
            'train_result': train_result
        })
    else:
        return ''

def updateDataWithLabel(docId, label):
    data = loadData()
    print('before', data.loc[data['id'] == docId])
    data.loc[data['id'] == docId, 'label'] = int(label)
    print('after', data.loc[data['id'] == docId])
    data.to_csv('mlbackend/data.csv', sep=";", encoding="utf8", index=False)

    return data


def createMetrics(algo):
    test_data = loadData()
    train_data_df = pd.read_csv("mlbackend/training_data.csv", sep=";")
    train_data_df.label = train_data_df.label.astype(int)
    met = []
    # Create stepwise metrics algo, simulating a history
    for number in range(30, len(train_data_df)):
        train_data_iteration = train_data_df.head(number)
        met.append(train(train_data_iteration, test_data, algo=algo))
    return pd.DataFrame(met)


def train(train_data, test_data, algo: Any) -> dict:
    text_clf = Pipeline([
        ('vect', CountVectorizer()),
        ('tfidf', TfidfTransformer()),
        ('clf', algo),
    ])
    text_clf.fit(train_data.text, train_data.label)
    # text_clf.fit(clean_data, labels)
    predicted = text_clf.predict(test_data.text)
    # print(dataframe.prediction.value_counts())
    # print(metrics.classification_report(test_labels, predicted))
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
    return data.loc[data['label'] != 0.5]

def resetTrainData():
    data = loadData()
    data.loc[:, 'label'] = 0.5
    data.to_csv('mlbackend/data.csv', sep=";", encoding="utf8", index=False)

def cleanupTexts():
    data = loadData()
    clean_data = [preprocessText(text) for text in data.text]

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
    LABEL_IMPACT = 0.6
    labels_arr = np.asarray(labels) * LABEL_IMPACT
    labels_arr = labels_arr.reshape(len(labels_arr), 1)
    with_labels = np.hstack((tfidf.toarray(),labels_arr))
        
    computed_coords = umap.UMAP(min_dist=0.8, random_state=1).fit_transform(with_labels)
    # computed_coords = MulticoreTSNE(n_jobs=4, random_state=1).fit_transform(with_labels)
    df = pd.DataFrame(columns=['x', 'y'])
    df['x'] = computed_coords[:, 0]
    df['y'] = computed_coords[:, 1]

    writer = GlyphboardWriter('test_name')

    # DR *= 2
    print('Writing positions...')    
    positions = writer.write_position(df, 'lsi')
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


# def getDocById(id):
#     for doc in test_data:
#         if id == doc["values"]["2"]:
#             return doc
#     return ''

# initData()