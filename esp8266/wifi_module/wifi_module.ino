#include <ESP8266WiFi.h>      // ESP WiFi library
#include <WebSocketsClient.h> // WebSockets library
#include <ArduinoJson.h>      // Handle JSON

#define FASTLED_ALLOW_INTERRUPTS 0 // Used for ESP8266.

char ssid[] = "Curium Valley 5G 2.4"; // use your own network ssid and password
char pass[] = "Trastevere2018";

WebSocketsClient webSocket;

uint8_t isOn = true;
uint8_t lightMode = 10;
uint8_t colorH = 60;
uint8_t colorS = 250;
uint8_t colorV = 100;
uint8_t rainbowSpeed = 10;
uint16_t pulseSpeed = 300;
bool isReceivedOk = true;

void setup()
{
  Serial.begin(115200);
  Serial.setRxBufferSize(256);
  //Serial.write(ssid);
  WiFi.begin(ssid, pass);
  // connection with timeout
  int count = 0;

  while ((WiFi.status() != WL_CONNECTED))
  {
    //Serial.write(".");
    delay(500);
    count++;
  }
  
  webSocket.begin("192.168.32.74", 8000, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(3000, 3000, 2);
}

unsigned long lastMillis = 0;

void loop()
{
  webSocket.loop();
  recvString();
  if (millis() - lastMillis > 50 && !isReceivedOk) {
    lastMillis = millis();
    writeByteArrayToSerial();
  }
}

uint8_t rnd;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  switch (type) {
    case WStype_TEXT:
      const char* str = (char *)payload;
      decodeJsonAllValues(str);
      break;
  }
}

const unsigned int MAX_MESSAGE_LENGTH = 256;

void recvString() {
  while (Serial.available() > 0) {
    static char message[MAX_MESSAGE_LENGTH];
    static unsigned int message_pos = 0;
    char inChar = Serial.read();

    if ((message_pos >= MAX_MESSAGE_LENGTH - 1)) {
      message_pos = 0;
    } else if (inChar != '\n') {
      message[message_pos] = inChar;
      message_pos++;

      if (message_pos >= MAX_MESSAGE_LENGTH) {
        message_pos = MAX_MESSAGE_LENGTH - 1;
      }
    } else {
      if (message[0] == rnd) {
        isReceivedOk = true;
        message_pos = 0;
        return;
      }
      message[message_pos] = '\0'; 
      message_pos = 0;
      webSocket.sendTXT(message);
    }

  }
}


void recvOk() {
  char rc;
  while (Serial.available() > 0) {
    rc = Serial.read();
    if (rc == rnd) {
      isReceivedOk = true;
    }
  }
}

const char startMarker = 0x3C;
const char endMarker = 0x3E;

void decodeJsonAllValues(const char* str) {

  DynamicJsonDocument state(200);
  deserializeJson(state, str);
  isOn = state["o"];
  lightMode = state["m"];
  colorH = state["h"];
  colorS = state["s"];
  colorV = state["v"];
  rainbowSpeed = state["rs"];
  pulseSpeed = state["ps"];
  rnd = random(255);
  isReceivedOk = false;
  writeByteArrayToSerial();
}

void writeByteArrayToSerial() {

  byte arr[11] = { 
    startMarker, 
    isOn ? 0x1 : 0x0,
    lightMode,
    colorH,
    colorS,
    colorV,
    rainbowSpeed,
    (pulseSpeed & 0xFF00) >> 8,
    (pulseSpeed & 0xFF),
    rnd,
    endMarker
    };
  Serial.write(arr, 11);
}
