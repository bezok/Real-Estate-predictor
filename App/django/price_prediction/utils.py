# price_prediction/utils.py
import joblib
import os

# Load the trained model and feature columns
model_path = os.path.join(os.path.dirname(__file__), 'linear_regression_model.pkl')
columns_path = os.path.join(os.path.dirname(__file__), 'model_columns.pkl')
model = joblib.load(model_path)
model_columns = joblib.load(columns_path)
