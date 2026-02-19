import os
import numpy as np
import tensorflow as tf
import gc
from flask import Flask, request, jsonify, render_template, redirect, url_for
from tensorflow.keras.preprocessing import image
from flask_cors import CORS

# ----------------------------------------
# 1️⃣ Enable GPU Memory Growth
# ----------------------------------------
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        tf.config.experimental.set_memory_growth(gpus[0], True)
        print("GPU memory growth enabled.")
    except Exception as e:
        print("GPU setup error:", e)

# ----------------------------------------
# 2️⃣ Flask Init
# ----------------------------------------
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------
# 3️⃣ Upload Folder
# ----------------------------------------
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ----------------------------------------
# 4️⃣ Load Model ONCE
# ----------------------------------------
MODEL_PATH = os.path.join(BASE_DIR, "model", "checkpoints", "best_model.keras")

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded.")

# ----------------------------------------
# 5️⃣ Class Names
# ----------------------------------------
class_names = [
    'Apple___Apple_scab','Apple___Black_rot','Apple___Cedar_apple_rust','Apple___healthy',
    'Blueberry___healthy','Cherry_(including_sour)___Powdery_mildew','Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot','Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight','Corn_(maize)___healthy','Grape___Black_rot',
    'Grape___Esca_(Black_Measles)','Grape___Leaf_blight_(Isariopsis_Leaf_Spot)','Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)','Peach___Bacterial_spot','Peach___healthy',
    'Pepper,_bell___Bacterial_spot','Pepper,_bell___healthy','Potato___Early_blight',
    'Potato___Late_blight','Potato___healthy','Raspberry___healthy','Soybean___healthy',
    'Squash___Powdery_mildew','Strawberry___Leaf_scorch','Strawberry___healthy',
    'Tomato___Bacterial_spot','Tomato___Early_blight','Tomato___Late_blight',
    'Tomato___Leaf_Mold','Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite','Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus','Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# ----------------------------------------
# 6️⃣ Routes
# ----------------------------------------

# LOGIN PAGE FIRST
@app.route("/")
def login():
    return render_template("1.html")

# DASHBOARD AFTER LOGIN
@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

# ----------------------------------------
# 7️⃣ Prediction API
# ----------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        img = image.load_img(filepath, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array, verbose=0)

        class_index = np.argmax(prediction)
        confidence = np.max(prediction)

        result = {
            "disease": class_names[class_index],
            "confidence": round(float(confidence) * 100, 2)
        }

        os.remove(filepath)

        del img, img_array, prediction
        gc.collect()

        return jsonify(result)

    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({"error": "Prediction failed"}), 500


# ----------------------------------------
# 8️⃣ Run Server
# ----------------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
