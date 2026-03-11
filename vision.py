import cv2
import requests
from ultralytics import YOLO

# Load the AI Model (will download automatically on first run)
model = YOLO('yolov8n.pt') 

# Use 0 for your Laptop Webcam, or a URL for an IP Camera
cap = cv2.VideoCapture(0)

print("🚀 AI Vision started. Counting heads...")

while True:
    success, frame = cap.read()
    if not success: break

    # Run AI Detection (class 0 is 'person')
    results = model(frame, classes=[0], verbose=False)
    heads = len(results[0].boxes)

    # Send the count to your Node.js server
    try:
        requests.post("http://localhost:3000/update-crowd", json={"count": heads})
    except:
        pass # Server might be offline

    # Optional: Visual Feedback (Press 'q' to close)
    annotated_frame = results[0].plot()
    cv2.imshow("Hospital CCTV Feed", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()