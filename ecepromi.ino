#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <DHT.h>

// =====================================================
//                 WIFI SETTINGS
// =====================================================

const char* ssid = "MSR@2G";
const char* password = "zxcvzxcv";

// =====================================================
//                 SERVER
// =====================================================

WebServer server(80);

// =====================================================
//                 SENSOR PINS
// =====================================================

// MQ-2 analog output
#define MQ2_PIN 34

// MQ-135 analog output
#define MQ135_PIN 35

// DHT22
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Flame sensor
#define FLAME_PIN 27

// Metal detector
#define METAL_PIN 26

// Ultrasonic
#define TRIG_PIN 5
#define ECHO_PIN 18

// Battery voltage measurement
#define BATTERY_PIN 33

DHT dht(DHT_PIN, DHT_TYPE);

// =====================================================
//                 ROBOT MODE
// =====================================================

String robotMode = "MANUAL";

// =====================================================
//                 BATTERY DIVIDER
// =====================================================

// Example:
// Battery + ---- 100K ---- GPIO33 ---- 27K ---- GND

const float R1 = 100000.0;
const float R2 = 27000.0;

// ESP32 ADC reference
const float ADC_REFERENCE = 3.3;

// =====================================================
//                 DISTANCE FUNCTION
// =====================================================

float readDistance() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(
    ECHO_PIN,
    HIGH,
    30000
  );

  // No echo
  if (duration == 0) {
    return -1.0;
  }

  float distance =
    duration * 0.0343 / 2.0;

  return distance;
}

// =====================================================
//                 BATTERY FUNCTION
// =====================================================

float readBatteryVoltage() {

  int adcValue =
    analogRead(BATTERY_PIN);

  float adcVoltage =
    (adcValue / 4095.0) * ADC_REFERENCE;

  float batteryVoltage =
    adcVoltage * ((R1 + R2) / R2);

  return batteryVoltage;
}

// =====================================================
//                 BATTERY PERCENTAGE
// =====================================================

int calculateBatteryPercentage(
  float voltage
) {

  // Example for 3S Li-ion/LiPo battery

  if (voltage >= 12.6) {
    return 100;
  }

  if (voltage <= 9.0) {
    return 0;
  }

  int percentage =
    ((voltage - 9.0) /
     (12.6 - 9.0)) * 100.0;

  if (percentage < 0) {
    percentage = 0;
  }

  if (percentage > 100) {
    percentage = 100;
  }

  return percentage;
}

// =====================================================
//                 CORS
// =====================================================

void addCORS() {

  server.sendHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  server.sendHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  server.sendHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

// =====================================================
//                 ROOT PAGE
// =====================================================

void handleRoot() {

  addCORS();

  String message = "";

  message +=
    "=================================\n";

  message +=
    "   COAL MINE INSPECTION ROBOT\n";

  message +=
    "=================================\n\n";

  message +=
    "ESP32 Sensor Controller\n";

  message +=
    "Status: ONLINE\n\n";

  message +=
    "Available URLs:\n";

  message +=
    "/data\n";

  message +=
    "/mode?mode=MANUAL\n";

  message +=
    "/mode?mode=AUTO\n";

  message +=
    "/mode?mode=PATROL\n";

  server.send(
    200,
    "text/plain",
    message
  );
}

// =====================================================
//                 SENSOR DATA
// =====================================================

void handleData() {

  // -----------------------------
  // Read MQ sensors
  // -----------------------------

  int mq2 =
    analogRead(MQ2_PIN);

  int mq135 =
    analogRead(MQ135_PIN);

  // -----------------------------
  // Flame
  // -----------------------------

  int flame =
    digitalRead(FLAME_PIN);

  // -----------------------------
  // Metal detector
  // -----------------------------

  int metal =
    digitalRead(METAL_PIN);

  // -----------------------------
  // Distance
  // -----------------------------

  float distance =
    readDistance();

  // -----------------------------
  // Temperature
  // -----------------------------

  float temperature =
    dht.readTemperature();

  // -----------------------------
  // Humidity
  // -----------------------------

  float humidity =
    dht.readHumidity();

  // -----------------------------
  // Battery
  // -----------------------------

  float batteryVoltage =
    readBatteryVoltage();

  int battery =
    calculateBatteryPercentage(
      batteryVoltage
    );

  // =================================================
  // Handle invalid DHT readings
  // =================================================

  if (isnan(temperature)) {
    temperature = 0;
  }

  if (isnan(humidity)) {
    humidity = 0;
  }

  // =================================================
  // Create JSON
  // =================================================

  String json = "{";

  json +=
    "\"mq2\":" +
    String(mq2) +
    ",";

  json +=
    "\"mq135\":" +
    String(mq135) +
    ",";

  json +=
    "\"temperature\":" +
    String(
      temperature,
      1
    ) +
    ",";

  json +=
    "\"humidity\":" +
    String(
      humidity,
      1
    ) +
    ",";

  json +=
    "\"distance\":" +
    String(
      distance,
      1
    ) +
    ",";

  json +=
    "\"flame\":" +
    String(flame) +
    ",";

  json +=
    "\"metal\":" +
    String(metal) +
    ",";

  json +=
    "\"battery\":" +
    String(battery) +
    ",";

  json +=
    "\"batteryVoltage\":" +
    String(
      batteryVoltage,
      2
    ) +
    ",";

  json +=
    "\"mode\":\"" +
    robotMode +
    "\"";

  json += "}";

  // =================================================
  // Send response
  // =================================================

  addCORS();

  server.send(
    200,
    "application/json",
    json
  );

  // =================================================
  // Serial monitor
  // =================================================

  Serial.println(
    "-----------------------------"
  );

  Serial.print("MQ2: ");
  Serial.println(mq2);

  Serial.print("MQ135: ");
  Serial.println(mq135);

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" C");

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  Serial.print("Flame: ");
  Serial.println(flame);

  Serial.print("Metal: ");
  Serial.println(metal);

  Serial.print("Battery: ");
  Serial.print(battery);
  Serial.println(" %");

  Serial.print("Battery Voltage: ");
  Serial.print(batteryVoltage);
  Serial.println(" V");

  Serial.print("Mode: ");
  Serial.println(robotMode);
}

// =====================================================
//                 ROBOT MODE
// =====================================================

void handleMode() {

  if (!server.hasArg("mode")) {

    addCORS();

    server.send(
      400,
      "text/plain",
      "Missing mode parameter"
    );

    return;
  }

  robotMode =
    server.arg("mode");

  robotMode.toUpperCase();

  Serial.print(
    "Robot Mode Changed: "
  );

  Serial.println(
    robotMode
  );

  addCORS();

  String response =
    "Robot mode: " +
    robotMode;

  server.send(
    200,
    "text/plain",
    response
  );
}

// =====================================================
//                 OPTIONS / CORS
// =====================================================

void handleOptions() {

  addCORS();

  server.send(
    204
  );
}

// =====================================================
//                 SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println();
  Serial.println(
    "================================="
  );
  Serial.println(
    " COAL MINE INSPECTION ROBOT"
  );
  Serial.println(
    " ESP32 SENSOR CONTROLLER"
  );
  Serial.println(
    "================================="
  );

  // =================================================
  // Sensor pins
  // =================================================

  pinMode(
    MQ2_PIN,
    INPUT
  );

  pinMode(
    MQ135_PIN,
    INPUT
  );

  pinMode(
    FLAME_PIN,
    INPUT
  );

  pinMode(
    METAL_PIN,
    INPUT
  );

  pinMode(
    TRIG_PIN,
    OUTPUT
  );

  pinMode(
    ECHO_PIN,
    INPUT
  );

  pinMode(
    BATTERY_PIN,
    INPUT
  );

  // =================================================
  // Start DHT
  // =================================================

  dht.begin();

  Serial.println(
    "Sensors initialized"
  );

  // =================================================
  // Wi-Fi
  // =================================================

  Serial.println();
  Serial.print(
    "Connecting to Wi-Fi: "
  );

  Serial.println(
    ssid
  );

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    ssid,
    password
  );

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(500);

    Serial.print(".");

    attempts++;

    if (attempts > 60) {

      Serial.println();
      Serial.println(
        "Wi-Fi connection failed!"
      );

      Serial.println(
        "Restarting ESP32..."
      );

      delay(2000);

      ESP.restart();
    }
  }

  Serial.println();
  Serial.println(
    "Wi-Fi Connected!"
  );

  // =================================================
  // Print IP
  // =================================================

  Serial.print(
    "ESP32 IP Address: "
  );

  Serial.println(
    WiFi.localIP()
  );

  // =================================================
  // Start mDNS
  // =================================================

  if (
    MDNS.begin("coalmine")
  ) {

    Serial.println(
      "mDNS started successfully"
    );

    Serial.println(
      "Dashboard address:"
    );

    Serial.println(
      "http://coalmine.local"
    );

  } else {

    Serial.println(
      "mDNS failed!"
    );
  }

  // =================================================
  // Web server routes
  // =================================================

  server.on(
    "/",
    HTTP_GET,
    handleRoot
  );

  server.on(
    "/data",
    HTTP_GET,
    handleData
  );

  server.on(
    "/mode",
    HTTP_GET,
    handleMode
  );

  server.on(
    "/data",
    HTTP_OPTIONS,
    handleOptions
  );

  server.on(
    "/mode",
    HTTP_OPTIONS,
    handleOptions
  );

  // =================================================
  // Start server
  // =================================================

  server.begin();

  Serial.println(
    "HTTP Server Started"
  );

  Serial.println();
  Serial.println(
    "================================="
  );

  Serial.println(
    "READY!"
  );

  Serial.print(
    "IP: http://"
  );

  Serial.println(
    WiFi.localIP()
  );

  Serial.println(
    "mDNS: http://coalmine.local"
  );

  Serial.println(
    "Data: http://coalmine.local/data"
  );

  Serial.println(
    "================================="
  );
}

// =====================================================
//                 LOOP
// =====================================================

void loop() {

  server.handleClient();

  // Keep Wi-Fi alive
  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "Wi-Fi disconnected!"
    );

    WiFi.reconnect();

    delay(1000);
  }
}