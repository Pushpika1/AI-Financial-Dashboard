from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os


app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
COMBINED_DATA_PATH = os.path.join(DATA_DIR, 'combined_data.csv')
TOP20_SHAREHOLDERS_PATH = os.path.join(DATA_DIR, 'final_top20_shareholders.csv')

@app.route('/api/financials', methods=['GET'])
def get_financials():
    df = pd.read_csv(COMBINED_DATA_PATH)

    year = request.args.get('year')
    currency = request.args.get('currency')

    if year:
        df = df[df['Year'] == int(year)]

    #convert to USD if requested
    if currency and currency.upper() == 'USD':
        rate = 300.0  #rate
        numeric_cols = [
            'Total revenue', 'Cost of sales', 'Gross profit',
            'Selling and distribution expenses', 'Administrative expenses',
            'Other operating expenses', 'Total operating expenses',
            'Net_Profit'
        ]
        for col in numeric_cols:
            df[col] = df[col] / rate

    return jsonify(df.to_dict(orient='records'))

@app.route('/api/shareholders', methods=['GET'])
def get_shareholders():
    df = pd.read_csv(TOP20_SHAREHOLDERS_PATH)
    return jsonify(df.to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True, port=5000)
