/**
 * Smart Bus Monitor - ESP32 Passenger Counter
 * 
 * Hardware Connection:
 * VL53L0X I2C Sensor:
 *   - SDA (GPIO21)
 *   - SCL (GPIO22)
 *   - VCC (3.3V)
 *   - GND (GND)
 * 
 * Features:
 *   - Continuous distance measurement
 *   - Person detection (distance < 800mm threshold)
 *   - Debouncing to prevent multiple counts
 *   - WiFi connectivity
 *   - HTTP POST to backend API
 *   - Serial debug logging
 */

#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "VL53L0X.h"

// ============ WiFi Configuration ============
const char* SSID = "YOUR_WIFI_SSID";
const char* PASSWORD = "YOUR_WIFI_PASSWORD";

// ============ Backend API Configuration ============
const char* API_SERVER = "http://192.168.1.100:5000";  // Change to your backend IP
const char* BUS_ID = "BUS001";  // Unique bus identifier

// ============ VL53L0X Sensor Setup ============
VL53L0X sensor;
const uint16_t DISTANCE_THRESHOLD = 800;  // mm - Distance threshold for person detection

// ============ Passenger Counting Logic ============
int passengerCount = 0;
bool objectDetected = false;
bool previousObjectState = false;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 500;  // 500ms debounce

// ============ I2C Configuration ============
const int SDA_PIN = 21;
const int SCL_PIN = 22;
const int I2C_FREQ = 400000;  // 400kHz I2C frequency

// ============ Timing Configuration ============
unsigned long lastUpdateTime = 0;
const unsigned long UPDATE_INTERVAL = 2000;  // Send data every 2 seconds

void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n===== Smart Bus Passenger Counter =====");
  Serial.println("Starting initialization...");

  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN, I2C_FREQ);
  Serial.println("[I2C] Initialized on GPIO21 (SDA), GPIO22 (SCL)");

  // Initialize VL53L0X sensor
  if (!sensor.init()) {
    Serial.println("[ERROR] Failed to initialize VL53L0X sensor!");
    while (1) {
      delay(1000);
      Serial.println("[ERROR] Halting...");
    }
  }
  Serial.println("[SENSOR] VL53L0X initialized successfully");
  
  sensor.setTimeout(500);
  
  // Start continuous ranging measurement
  sensor.startContinuous(33);  // 33ms measurement interval
  Serial.println("[SENSOR] Continuous measurement started (33ms interval)");

  // Connect to WiFi
  connectToWiFi();

  Serial.println("[SYSTEM] Initialization complete!\n");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Connection lost. Reconnecting...");
    connectToWiFi();
  }

  // Read distance from sensor
  uint16_t distance = sensor.readRangeContinuousMillimeters();

  // Check if sensor reading is valid
  if (sensor.timeoutOccurred()) {
    Serial.println("[SENSOR] Reading timeout!");
    delay(50);
    return;
  }

  // Detect object based on threshold
  previousObjectState = objectDetected;
  objectDetected = (distance < DISTANCE_THRESHOLD);

  // Debug output every 10 readings
  static int readCount = 0;
  if (readCount++ >= 10) {
    Serial.print("[SENSOR] Distance: ");
    Serial.print(distance);
    Serial.print("mm | Object Detected: ");
    Serial.print(objectDetected ? "YES" : "NO");
    Serial.print(" | Passenger Count: ");
    Serial.println(passengerCount);
    readCount = 0;
  }

  // Debounce and count passengers
  if (objectDetected && !previousObjectState) {
    // Object just entered detection zone
    unsigned long currentTime = millis();
    
    if (currentTime - lastDebounceTime > DEBOUNCE_DELAY) {
      passengerCount++;
      lastDebounceTime = currentTime;
      
      Serial.print("[COUNT] Person detected! Passenger count: ");
      Serial.println(passengerCount);
    }
  }

  // Send data to backend at intervals
  if (millis() - lastUpdateTime >= UPDATE_INTERVAL) {
    sendToBackend();
    lastUpdateTime = millis();
  }

  delay(50);  // Small delay to prevent overwhelming the loop
}

/**
 * Connect to WiFi network
 */
void connectToWiFi() {
  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[ERROR] Failed to connect to WiFi");
  }
}

/**
 * Send passenger count to backend API
 */
void sendToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] WiFi not connected. Skipping update.");
    return;
  }

  HTTPClient http;
  String url = String(API_SERVER) + "/api/bus/snapshot";
  
  Serial.print("[API] Sending POST to: ");
  Serial.println(url);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  String jsonPayload = "{\"busId\":\"" + String(BUS_ID) + "\",\"passengerCount\":" + String(passengerCount) + "}";
  
  Serial.print("[API] Payload: ");
  Serial.println(jsonPayload);

  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("[API] Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("[API] Response: ");
    Serial.println(response);
  } else {
    Serial.print("[API] Error sending request: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

/**
 * Optional: Reset passenger count (can be triggered by button or API)
 * Usage: Send GET request to /reset endpoint
 */
void resetPassengerCount() {
  passengerCount = 0;
  lastDebounceTime = 0;
  objectDetected = false;
  previousObjectState = false;
  Serial.println("[RESET] Passenger count reset to 0");
}
