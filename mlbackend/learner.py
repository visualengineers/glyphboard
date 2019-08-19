import json
import csv
import os
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfTransformer, CountVectorizer
from sklearn.pipeline import Pipeline
from sklearn import metrics
import umap
import pandas as pd
from gb_writer import GlyphboardWriter
from typing import Any
import spacy
from spacy.lang.de.stop_words import STOP_WORDS


nlp = spacy.load('de')


# Classifiers (used for testing)
SGD = SGDClassifier(loss="modified_huber", penalty='l2', alpha=1e-3,
                    random_state=42, max_iter=5, tol=None)

# init tfidf vectorizer
vec = TfidfVectorizer(strip_accents='ascii', max_df=0.5, sublinear_tf=True)
# where to split the data/test set
SPLICE_POINT = 800
# unlabeled data is set to -1
UNLABELED_VALUE = -1


def init():
    print('Updating JSON...')
    updateDatasetJson()
    # print('Cleaning Texts...')
    # cleanupTexts()
    print('Done')

# set environment to a clean state for testing
def mockInit():
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
        'isLabeled': [0] * len(LC_data),
        'entities': [' '] * len(LC_data)
    })

    # split into a partial test set
    test_data = df[SPLICE_POINT+1:]
    saveData(test_data, 'test_data')
    # add selection scores to data
    data_with_scores = getSelectionScores(rest_data=df, train_data=test_data, clf=SGD)
    saveData(data_with_scores)
    resetTrainData()


def loadData(name='data'):
    return pd.read_csv('mlbackend/{}.csv'.format(name), sep=";", encoding="utf-8")


def saveData(data, name='data'):
    with open('mlbackend/{}.csv'.format(name), mode='w', newline='\n', encoding='utf-8') as f:
        data.to_csv(f, sep=";", line_terminator='\n',
                    encoding='utf-8', index=False)

# handle incoming label annotation
def handleNewAnswer(answer):
    newAnswer = {
        'text': answer['text'],
        'docId': answer['documentId'],
        'label': int(answer['answer']),
        'question': answer['questionId']
    }
    train_data = getTrainData()

    test_data = getTestData()

    data = updateDataWithLabel(
        loadData(), newAnswer['docId'], newAnswer['label'])
    # classifiers need some samples, start after 3
    if len(train_data) > 3:
        train_result = train(train_data, test_data, SGD)
        return {
            'train_result': train_result
        }
    else:
        return ''

# handle manual update by user on frontend
def handleCompleteUpdate():
    data = loadData()
    # data = updateDatasetJson()
    tfidf = vec.fit_transform(data.text)
    positions = applyDR(tfidf, withPreviousPos=False, labels=data.label)
    writer = GlyphboardWriter('test_name')
    position_response = writer.write_position(
        positions=positions, algorithm='umap')
    return position_response

# update the whole json containing the data set in the glyphboard backend
def updateDatasetJson():
    with open("mlbackend/test_data.json", "r") as read_file:
        LC_data = json.load(read_file)

    data = loadData()
    data = getSelectionScores(rest_data=data, train_data=getTrainData(), clf=SGD)

    for doc in LC_data:
        doc['features']['1']['31'] = int(
            data.loc[data['id'] == doc['id']].isLabeled.values[0])
        doc['values']['31'] = int(
            data.loc[data['id'] == doc['id']].isLabeled.values[0])
        doc['features']['1']['32'] = float(
            data.loc[data['id'] == doc['id']].score.values[0])
        doc['values']['32'] = float(
            data.loc[data['id'] == doc['id']].score.values[0])
        doc['features']['1']['33'] = int(
            data.loc[data['id'] == doc['id']].label.values[0])
        doc['values']['33'] = int(
            data.loc[data['id'] == doc['id']].label.values[0])
        doc['features']['1']['34'] = str(
            data.loc[data['id'] == doc['id']].entities.values[0])
        doc['values']['34'] = str(
            data.loc[data['id'] == doc['id']].entities.values[0])

    with open("backend/data/mainTfIdf/mainTfIdf.05112018.feature.json", "w") as f:
        json.dump(LC_data, f)

    return data


def updateDataWithLabel(data, docId, label):
    print('before', data.loc[data['id'] == docId])
    data.loc[data['id'] == docId, 'label'] = int(label)
    data.loc[data['id'] == docId, 'isLabeled'] = 1
    print('after', data.loc[data['id'] == docId])
    saveData(data)

    return data


def createMetrics(algo, train_data):
    test_data = getTestData()
    met = []
    # Create stepwise metrics algo, simulating a history
    for number in range(30, len(train_data)):
        train_data_iteration = train_data.head(number)
        print(train_data_iteration)
        met.append(train(train_data_iteration, test_data, algo=algo))
    return pd.DataFrame(met)


def train(train_data, test_data, algo: Any) -> dict:
    text_clf = Pipeline([
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
    return data.loc[data['isLabeled'] == 1]


def getTestData():
    return pd.read_csv('mlbackend/test_data.csv', delimiter=';', encoding="utf-8")


def resetTrainData():
    data = loadData()
    data.loc[:, 'label'] = UNLABELED_VALUE
    data.loc[:, 'isLabeled'] = 0
    saveData(data)

# mock a number of iterations
def mockTraining(amount):
    data = loadData()
    for i in range(amount):
        data.loc[i, 'isLabeled'] = 1
        if data.loc[i].peer_label > 0.5:
            data.loc[i, 'label'] = 1
        else:
            data.loc[i, 'label'] = 0
    saveData(data)

# simulate a number of iterations and set up a clean enviroenment (for tests and demo)
def simulateTraining(iterations):
    test_data = getTestData()
    mockTraining(iterations)
    train_data = getTrainData()
    train(train_data, test_data, SGD)

# return all previous metrics
def getHistory():
    history = []
    with open(
            "mlbackend/metrics.csv", "r", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=';')
        for line in reader:
            history.append(line[0])
        file.close()
    return history

# add a metric to the history
def addHistory(metrics):
    with open(
            "mlbackend/metrics.csv", "a",  newline="", encoding="utf-8") as file:
        writer = csv.writer(file, delimiter=';')
        writer.writerow([str(metrics)])
        file.close()


def getCurrentScore() -> int:
    return getHistory().pop()

# calculate coordinates
# withPreviousPos: tells if each iteration should be influenced by the last one
def applyDR(tfidf, labels=[], withPreviousPos=False, factor=1):
    if withPreviousPos:
        previousPositions = loadData('previousPositions').values
    else:
        previousPositions = 'spectral'
    labels_arr = np.asarray(labels)
    labels_arr = labels_arr.reshape(len(labels_arr), 1)
    computed_coords = umap.UMAP(init=previousPositions, min_dist=0.8,
                                random_state=1, learning_rate=0.5).fit(tfidf.toarray(), y=labels_arr)
    computed_coords = computed_coords.embedding_
    saveData(pd.DataFrame(computed_coords), 'previousPositions')
    computed_coords *= factor
    df = pd.DataFrame(columns=['x', 'y'])
    df['x'] = computed_coords[:, 0]
    df['y'] = computed_coords[:, 1]

    return df

# clean up texts routine
def cleanupTexts():
    data = loadData()
    for idx, text in enumerate(data.text):
        data.loc[idx, 'text'] = preprocessText(text)
        data.loc[idx, 'entities'] = extractNER(text)

    saveData(data)

def preprocessText(text: str) -> str:
    doc = nlp(text)
    # Remove Stop Words and get Lemmas
    return ' '.join([token.text for token in doc if not token.is_stop])

# return entities from a text
def extractNER(text):
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append(ent.text)
    if (len(entities) > 0):
        return ', '.join(entities)
    else:
        return ''

# Set scores by uncertainty selection
def getSelectionScores(rest_data, train_data, clf=SGD):
    text_clf = Pipeline([
        ('tfidf', vec),
        ('clf', clf),
    ])
    text_clf.fit(train_data.text, train_data.label)
    prs = text_clf.predict_proba(rest_data.text)
    result_pos = [1-2*abs(x[1]-0.5) for x in prs]
    rest_data['score'] = result_pos
    return rest_data

# Display words that influence the classification (used in jupyter notebook)
def analyseImportantFeatures(clf=SGD):
    train_data = getTrainData()
    tfidf = vec.fit_transform(train_data.text)
    clf.fit(tfidf, train_data.label)
    feature_names = vec.get_feature_names()
    coefs_with_fns = sorted(zip(clf.coef_[0], feature_names))
    top = zip(coefs_with_fns[:20], coefs_with_fns[:-(20 + 1):-1])
    for (coef_1, fn_1), (coef_2, fn_2) in top:
        print('\t%.4f\t%-15s\t\t%.4f\t%-15s' % (coef_1, fn_1, coef_2, fn_2))
