import numpy as np
from PIL import Image
import json
import tensorflow as tf

# Load .tflite model and allocate tensors
TFLITE_MODEL_PATH = "model/cdd_convert_model.tflite"
LABEL_MAP_PATH = "model/label_map.json"

interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
interpreter.allocate_tensors()

# Get input and output tensor details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Load label map
with open(LABEL_MAP_PATH, "r") as f:
    label_map = json.load(f)
    # Ensure it's a list in correct order
    if isinstance(label_map, dict):
        label_map = [label_map[str(i)] for i in range(len(label_map))]

def preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((260, 260))  # EfficientNetB2 input size
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_image(img_path: str):
    img_array = preprocess_image(img_path)

    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], img_array)

    # Run inference
    interpreter.invoke()

    # Get output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])[0]  # shape: (num_classes,)
    predicted_index = int(np.argmax(output_data))
    prediction = label_map[predicted_index]

    # Create label:probability dict
    probabilities = {label_map[i]: float(output_data[i]) for i in range(len(label_map))}

    return prediction, probabilities
