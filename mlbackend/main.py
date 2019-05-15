from flask import Flask, request
from flask_cors import CORS
from learner import handleNewAnswer
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
    print(result)
    return json.dumps(result)
    # return result
    # return json.dumps('thanks')


if __name__ == '__main__':
    app.run(debug=True)
