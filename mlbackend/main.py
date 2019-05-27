from flask import Flask, request
from flask_cors import CORS
from learner import handleNewAnswer, getCurrentScore, loadData, getSelectionScores, handleCompleteUpdate
import json

app = Flask(__name__)
CORS(app)


@app.route("/label", methods=['POST'])
def label():
    # print(request.data)
    answer = json.loads(request.data)
    result = json.dumps(handleNewAnswer(answer))
    return result

@app.route("/score", methods=["GET"])
def getScore():
    return getCurrentScore()

@app.route("/update", methods=["GET"])
def triggerUpdate():
    position = handleCompleteUpdate()
    return json.dumps(position)
    

# def getUpdatedDataset():
#     updated_scores = getSelectionScores()
#     response = updated_scores[['isLabeled', 'label', 'score']]
#     return response.to_json()



if __name__ == '__main__':
    app.run(debug=True)

