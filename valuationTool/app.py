from flask import Flask, jsonify, request
import pickle
import hashlib
from functools import wraps
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:5173", "http://localhost:5001"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Load model
MODEL_PATH = 'model/predictor_02.pickle'
model = None

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Model loading error: {e}")
    raise RuntimeError("Failed to load ML model")

# Validation ranges
VALIDATION_RANGES = {
    'Baths': {'min': 1, 'max': 10},
    'Beds': {'min': 2, 'max': 20},
    'Land_size': {'min': 40, 'max': 1000},  # in perches
    'House_size': {'min': 1000, 'max': 10000}  # in sq.ft
}

DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Monaragala', 'Mullativu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

def validate_input(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        data = request.get_json()
        
        required_fields = ['Baths', 'Beds', 'Land_size', 'House_size', 'district', 'town']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'error': 'Missing fields', 'missing': missing}), 400

        errors = []
        try:
            baths = int(data['Baths'])
            beds = int(data['Beds'])
            land_size = float(data['Land_size'])
            house_size = float(data['House_size'])
        except ValueError:
            return jsonify({'error': 'Invalid number format'}), 400

        # Standard Range Validation
        for field, ranges in VALIDATION_RANGES.items():
            value = float(data[field])
            if not (ranges['min'] <= value <= ranges['max']):
                errors.append(f"{field} must be between {ranges['min']} and {ranges['max']}")

        # Logical Real-World Validations
        if baths > beds:
            errors.append("Bathrooms cannot exceed the number of bedrooms")
        if baths > beds / 2:
            errors.append("Bathrooms should not be more than half the bedrooms")
        if house_size > land_size * 100:
            errors.append("House size cannot be larger than available land")
        if house_size < beds * 80:
            errors.append("Each bedroom should have at least 80 sq. ft of house size")

        # Validate district
        if data['district'] not in DISTRICTS:
            errors.append(f"Invalid district. Must be one of: {', '.join(DISTRICTS)}")

        # Validate town exists
        if not isinstance(data['town'], str) or not data['town'].strip():
            errors.append("Town must be a non-empty string")

        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        return f(*args, **kwargs)
    return wrapper

@app.route('/predict', methods=['POST'])
@validate_input
def predict():
    try:
        data = request.get_json()
        print("🔹 Received Data:", data)
        
        features = [
            float(data['Baths']),
            float(data['Beds']),
            float(data['Land_size']),
            float(data['House_size'])
        ]
        
        district_encoding = [1 if d == data['district'] else 0 for d in DISTRICTS]
        features += district_encoding

        town_hash = int(hashlib.sha256(data['town'].strip().encode('utf-8')).hexdigest(), 16) % 219
        town_encoding = [1 if i == town_hash else 0 for i in range(219)]
        features += town_encoding

        if len(features) != 247:
            raise ValueError(f"Expected 247 features, got {len(features)}")

        prediction = model.predict([features])
        predicted_price = float(prediction[0])

        print("✅ Prediction Success:", predicted_price)

        return jsonify({
            'success': True,
            'predicted_price': predicted_price,
            'currency': 'LKR',
            'features_used': len(features)
        })
    except Exception as e:
        print("❌ Prediction Error:", str(e))
        return jsonify({
            'success': False,
            'error': 'Prediction failed',
            'details': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None, 'ready': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)