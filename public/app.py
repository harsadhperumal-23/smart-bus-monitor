from flask import Flask, jsonify
import serial
import time
import threading

app = Flask(__name__)

COM_PORT = "COM13"
BAUD_RATE = 115200

latest_data = {"distance": 0, "status": "UNKNOWN", "timestamp": None}

def read_serial():
    global latest_data
    print(f"🔄 Attempting to connect to {COM_PORT}...")

    while True:
        try:
            ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
            print(f"✅ SUCCESSFULLY CONNECTED to Arduino on {COM_PORT}!")
            time.sleep(2)

            while True:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8').strip()
                    if line:
                        print(f"Raw: {line}")
                        
                        if "Distance:" in line:
                            try:
                                dist = int(line.split("Distance:")[1].replace("mm", "").strip())
                                latest_data["distance"] = dist
                            except:
                                pass
                        
                        if "STATUS:" in line:
                            status = line.split("STATUS:")[1].strip()
                            latest_data["status"] = status
                            latest_data["timestamp"] = time.time()
                            print(f"✅ LIVE → {dist} mm | {status}")
                
                time.sleep(0.05)

        except serial.SerialException as e:
            print(f"❌ FAILED to open {COM_PORT} → {e}")
            print("   → Make sure Arduino Serial Monitor is CLOSED")
            print("   → Close all terminals and VS Code, then try again")
            time.sleep(4)
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(3)


threading.Thread(target=read_serial, daemon=True).start()


@app.route('/sensor-data')
def sensor_data():
    return jsonify(latest_data)


if __name__ == '__main__':
    print("🚀 Starting Smart Bus Flask Bridge...")
    app.run(host='0.0.0.0', port=5000, debug=False)