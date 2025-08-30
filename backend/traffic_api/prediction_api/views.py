from django.shortcuts import render
import numpy as np
import pickle
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tensorflow.keras.models import load_model
import os

# --- Constants ---
MODEL_NAME = "lstm_vehicle_model.h5"
SCALER_NAME = "vehicle_scaler.pkl"
LOOK_BACK = 12  # Must match the value used during training

# --- Build Paths ---
# Construct the full paths to the model and scaler files
# This ensures Django can find them regardless of where you run the server from.
MODEL_PATH = os.path.join(settings.BASE_DIR, 'prediction_api', MODEL_NAME)
SCALER_PATH = os.path.join(settings.BASE_DIR, 'prediction_api', SCALER_NAME)

# --- Load Model and Scaler ---
try:
    model = load_model(MODEL_PATH)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    print(" Django: Model and scaler loaded successfully!")
except Exception as e:
    print(f"Django: Error loading model or scaler: {e}")
    model = None
    scaler = None

class PredictionAPIView(APIView):
    """
    API View to handle traffic prediction requests.
    """
    def post(self, request, *args, **kwargs):
        if not model or not scaler:
            return Response(
                {'error': 'Model or scaler is not available.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Get data from the POST request
        input_sequence = request.data.get('sequence')

        # --- Data Validation ---
        if not input_sequence:
            return Response(
                {'error': 'Missing "sequence" in request body'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(input_sequence) != LOOK_BACK:
            return Response(
                {'error': f'Input sequence must have exactly {LOOK_BACK} timesteps'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Convert to a NumPy array for processing
            input_array = np.array(input_sequence, dtype=float)
            if input_array.shape != (LOOK_BACK, 3):
                return Response(
                    {'error': 'Each timestep must have 3 features'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # --- Preprocessing ---
            scaled_sequence = scaler.transform(input_array)
            reshaped_sequence = np.reshape(scaled_sequence, (1, LOOK_BACK, scaled_sequence.shape[1]))

            # --- Prediction ---
            raw_prediction = model.predict(reshaped_sequence)
            predicted_value_scaled = raw_prediction[0][0]

            # --- Inverse Transform ---
            dummy_for_inverse = np.zeros((1, 3))
            dummy_for_inverse[0, -1] = predicted_value_scaled
            inversed_prediction = scaler.inverse_transform(dummy_for_inverse)
            final_prediction = int(round(inversed_prediction[0, -1]))

            # Return the prediction as a JSON response
            return Response({'predicted_vehicle_count': final_prediction}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Django: An error occurred during prediction: {e}")
            return Response(
                {'error': 'Failed to process prediction request.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

