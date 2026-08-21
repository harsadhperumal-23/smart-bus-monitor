#define ENTRY_SENSOR 2
#define EXIT_SENSOR 3

const int TOTAL_SLOTS = 10;

int carsInside = 0;

bool entryDetected = false;
bool exitDetected = false;

void setup() {
  Serial.begin(9600);

  pinMode(ENTRY_SENSOR, INPUT);
  pinMode(EXIT_SENSOR, INPUT);

  Serial.println("Smart Parking System Started");
  displayParkingStatus();
}

void loop() {

  // Most IR obstacle sensors give LOW when an object is detected
  int entryState = digitalRead(ENTRY_SENSOR);
  int exitState = digitalRead(EXIT_SENSOR);

  // -------- CAR ENTERING --------
  if (entryState == LOW && !entryDetected) {

    entryDetected = true;

    if (carsInside < TOTAL_SLOTS) {
      carsInside++;

      Serial.println("Car Entered!");
      displayParkingStatus();
    }
    else {
      Serial.println("Parking Full! Entry Not Allowed.");
    }

    delay(1000); // Prevent multiple counting
  }

  // Reset entry sensor detection
  if (entryState == HIGH) {
    entryDetected = false;
  }


  // -------- CAR EXITING --------
  if (exitState == LOW && !exitDetected) {

    exitDetected = true;

    if (carsInside > 0) {
      carsInside--;

      Serial.println("Car Exited!");
      displayParkingStatus();
    }
    else {
      Serial.println("No cars inside!");
    }

    delay(1000); // Prevent multiple counting
  }

  // Reset exit sensor detection
  if (exitState == HIGH) {
    exitDetected = false;
  }
}


// -------- DISPLAY STATUS --------
void displayParkingStatus() {

  int availableSlots = TOTAL_SLOTS - carsInside;

  Serial.println("-----------------------");
  Serial.print("Cars Inside: ");
  Serial.println(carsInside);

  Serial.print("Available Slots: ");
  Serial.println(availableSlots);

  if (availableSlots == 0) {
    Serial.println("PARKING FULL");
  }
  else {
    Serial.println("PARKING AVAILABLE");
  }

  Serial.println("-----------------------");
}