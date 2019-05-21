from flask import Flask, request
from flask_cors import CORS
from learner import handleNewAnswer, getCurrentScore
import json

app = Flask(__name__)
CORS(app)


@app.route("/label", methods=['POST'])
def label():
    # print(request.data)
    answer = json.loads(request.data)
    result = json.dumps(handleNewAnswer(answer))
    # return result
    # print(result)
    # print(result)
    return result
    # return result
    # return json.dumps('thanks')

@app.route("/score", methods=["GET"])
def getScore():
    return getCurrentScore()

if __name__ == '__main__':
    app.run(debug=True)

