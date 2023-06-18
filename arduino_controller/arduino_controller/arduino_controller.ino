// #include <Arduino.h>
#include <ESP8266WiFi.h>      // ESP WiFi library
#include <WebSocketsClient.h> // WebSockets library
//#include "FastLED.h"          // FastLED library.
#include <ArduinoJson.h>      // Handle JSON

char ssid[] = "Curium Valley 5G 2.4"; // use your own network ssid and password
char pass[] = "Trastevere2018";

WebSocketsClient webSocket;

int STATE = 1;



void setup()
{
  // delay(10000);
  Serial.begin(115200);
  Serial.println(ssid);
  WiFi.begin(ssid, pass);

  // connection with timeout
  int count = 0;
  while ((WiFi.status() != WL_CONNECTED))
  {
    Serial.print(".");
    delay(500);
    count++;
  }

  Serial.print("Connected");
  Serial.println(WiFi.status() == WL_CONNECTED);
  
  // server.begin();
  Serial.println("Server started");

  webSocket.begin("192.168.32.74", 8000, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(3000, 3000, 2);
}

int cp = 0;

void loop()
{
  webSocket.loop();
  if (millis() - cp > 5000) {
    State = random(0, 5);
    Serial.println(state);
    cp = millis();
  }
}

void sendState()
{
  DynamicJsonDocument doc(200);
  doc["State"] = State;
  char data[200];
  serializeJson(doc, data);
  webSocket.sendTXT(data);
}


void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  Serial.println(type);
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("Websocket connected");
      break;
  }
}
