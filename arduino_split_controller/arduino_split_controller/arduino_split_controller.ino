/*
This is a controller that sends data to Ledtopia.
It is meant to be used on an Arduino or other microcontroller without WiFi.
It sends data to an ESP8266 through a serial connection.
*/

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

int brightness = 255;
void sendState()
{
    delay(5000);
    DynamicJsonDocument doc(200);
    doc["State"] = state;
    doc["Brightness"] = brightness;
    state = (state + 1) % 5;
    char data[200];
    serializeJson(doc, data);
    mySerial.write(data);
    mySerial.write("\n");
    cp = millis();
  
}
