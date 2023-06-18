#include <SoftwareSerial.h>
#include <ArduinoJson.h>      // Handle JSON

SoftwareSerial mySerial(2, 3); // RX, TX

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);
  delay(5000);
}

void loop() {
  sendState();
}

int state = 0;
int cp = 0;

void sendState()
{
  delay(5000);
    DynamicJsonDocument doc(200);
    doc["State"] = state;
    state = (state + 1) % 5;
    char data[200];
    serializeJson(doc, data);
    mySerial.write(data);
    mySerial.write("\n");
    cp = millis();
  
}
