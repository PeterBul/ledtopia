#include <ESP8266WiFi.h>      // ESP WiFi library
#include <WebSocketsServer.h> // WebSockets library
#include <ArduinoJson.h>      // Handle JSON
#include "FastLED.h"          // FastLED library.
#include <ArduinoJson.h>

#define FASTLED_ALLOW_INTERRUPTS 0 // Used for ESP8266.

char ssid[] = "Get-2G-D3F386"; // use your own network ssid and password
char pass[] = "ltz5mn2azy";

WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// Fixed definitions cannot change on the fly.
#define LED_DT 4         // Serial data pin
#define LED_CK 11        // Clock pin for WS2801 or APA102
#define COLOR_ORDER GRB  // It's GRB for WS2812B and GBR for APA102
#define LED_TYPE WS2812B // changed toB What kind of strip are you using (APA102, WS2801 or WS2812B)?
#define NUM_LEDS 60      // Number of LED's

// Initialize changeable global variables.
uint8_t MAX_BRIGHT = 255;

uint8_t SPEED = 10;
uint8_t COLOR_H = 40;
uint8_t COLOR_S = 250;
uint8_t COLOR_V = 100;
uint8_t LIGHT_MODE = 0;

float PULSE_SPEED = 500;
float MIN_PULSE_BRIGHT = 100;
float MAX_PULSE_BRIGHT = 255;

struct CRGB leds[NUM_LEDS]; // Initialize our LED array.

void setup()
{
  Serial.begin(9600);
  Serial.println(ssid);
  WiFi.begin(ssid, pass);

  // connection with timeout
  int count = 0;
  while ((WiFi.status() != WL_CONNECTED) && count < 17)
  {
    Serial.print(".");
    delay(500);
    count++;
  }

  server.begin();
  Serial.println("Server started");

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // LED setup

  LEDS.addLeds<LED_TYPE, LED_DT, COLOR_ORDER>(leds, NUM_LEDS); // For WS2812B

  FastLED.setBrightness(MAX_BRIGHT);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 1000); // FastLED power management set at 5V, 500mA
}

void loop()
{
  webSocket.loop();

  switch (LIGHT_MODE)
  {
  case 0:
    fill_color();
    break;
  case 1:
    pulse_wave();
    break;
  case 2:
    rainbow_wave(10, 10);
    break;
  }
}

void webSocketEvent(byte num, WStype_t type, uint8_t *payload, size_t length)
{
  if (type == WStype_TEXT)
  {
    String str = (char *)payload;
    DynamicJsonDocument state(200);
    deserializeJson(state, str);
    LIGHT_MODE = state["mode"];
    COLOR_H = state["hue"];
    COLOR_S = state["saturation"];
    COLOR_V = state["brightness"];
  }
}

void rainbow_wave(uint8_t thisSpeed, uint8_t deltaHue)
{ // The fill_rainbow call doesn't support brightness levels.
  // uint8_t thisHue = beatsin8(thisSpeed,0,255);                // A simple rainbow wave.
  uint8_t thisHue = beat8(thisSpeed, 255);         // A simple rainbow march.
  fill_rainbow(leds, NUM_LEDS, thisHue, deltaHue); // Use FastLED's fill_rainbow routine.
  FastLED.show();
}

void fill_color()
{
  fill_solid(leds, NUM_LEDS, CHSV(COLOR_H, COLOR_S, COLOR_V));
  FastLED.show();
}

void pulse_wave()
{
  float speed = 3000.0;
  float breath = (exp(sin(millis() / speed * PI)) - 0.36787944) * 108.0;
  breath = map(breath, 0, 255, MIN_PULSE_BRIGHT, MAX_PULSE_BRIGHT);
  fill_solid(leds, NUM_LEDS, CHSV(COLOR_H, COLOR_S, breath));
  FastLED.show();
}
