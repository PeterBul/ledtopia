// #include <Arduino.h>
#include <ESP8266WiFi.h>      // ESP WiFi library
#include <WebSocketsClient.h> // WebSockets library
#include "FastLED.h"          // FastLED library.
#include <ArduinoJson.h>      // Handle JSON

#define FASTLED_ALLOW_INTERRUPTS 0 // Used for ESP8266.

char ssid[] = "Curium Valley 5G 2.4"; // use your own network ssid and password
char pass[] = "Trastevere2018";

WebSocketsClient webSocket;

#define R_DT 5
#define G_DT 0
#define B_DT 4


bool IS_ON = true;

uint8_t MAX_BRIGHT = 255;

uint8_t SPEED = 10;
uint8_t COLOR_H = 245;
uint8_t COLOR_S = 255;
uint8_t COLOR_V = 80;
uint8_t LIGHT_MODE = 1;

float RAINBOW_SPEED = 10;

float PULSE_SPEED = 130;
float MIN_PULSE_BRIGHT = 100; 
float MAX_PULSE_BRIGHT = 255;

int led = 2;

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

  // LED setup

  pinMode(R_DT, OUTPUT);
  pinMode(G_DT, OUTPUT);
  pinMode(B_DT, OUTPUT);
}

void loop()
{
  webSocket.loop();
  
  if (!IS_ON)
  {
    FastLED.clear();
    FastLED.show();
    return;
  }

  switch (LIGHT_MODE)
  {
  case 0:
    setColor(CHSV(COLOR_H, COLOR_S, COLOR_V));
    break;
  case 1:
    pulse_wave();
    break;
  case 2:
    rainbow_wave(RAINBOW_SPEED, 10);
    break;
  case 3:
    setColor(CHSV(COLOR_H, COLOR_S, COLOR_V));
    break;
  }
}

void printLightValues()
{
  Serial.print("Is on: ");
  Serial.print(IS_ON);
  Serial.print(" Light mode: ");
  Serial.print(LIGHT_MODE);
  Serial.print(" H: ");
  Serial.print(COLOR_H);
  Serial.print(" S: ");
  Serial.print(COLOR_S);
  Serial.print(" V: ");
  Serial.println(COLOR_V);
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  Serial.println(type);
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("Websocket connected");
      break;
    case WStype_TEXT:
      String str = (char *)payload;
      Serial.println(str);
      DynamicJsonDocument state(200);
      deserializeJson(state, str);
      IS_ON = state["o"];
      LIGHT_MODE = state["m"];
      COLOR_H = state["h"];
      COLOR_S = state["s"];
      COLOR_V = state["v"];
      RAINBOW_SPEED = state["rs"];
      PULSE_SPEED = state["ps"];
      break;
  }
}

void rainbow_wave(uint8_t thisSpeed, uint8_t deltaHue)
{ 
  uint8_t thisHue = beat8(thisSpeed, 255);         // A simple rainbow march.
  setColor(CHSV(thisHue, COLOR_S, COLOR_V));
}

void setColor(CRGB color)
{
  printRGB(color);
  analogWrite(R_DT, 255 - color.r);
  analogWrite(G_DT, 255 - color.g);
  analogWrite(B_DT, 255 - color.b);
}

void setColor(CHSV color)
{
  CRGB rgb;
  hsv2rgb_rainbow(color, rgb);
  setColor(rgb);
}

void printRGB(CRGB rgb)
{
  Serial.print(rgb.r);
  Serial.print(", ");
  Serial.print(rgb.g);
  Serial.print(", ");
  Serial.println(rgb.b);
}

void pulse_wave()
{
  float speed = PULSE_SPEED * 10;
  float breath = (exp(sin(millis() / speed * PI)) - 0.36787944) * 108.0;
  breath = map(breath, 0, 255, MIN_PULSE_BRIGHT, MAX_PULSE_BRIGHT);
  setColor(CHSV(COLOR_H, COLOR_S, breath));
}
