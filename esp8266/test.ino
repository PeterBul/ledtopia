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

#if FASTLED_VERSION < 3001000
#error "Requires FastLED 3.1 or later; check github for latest code."
#endif

// Fixed definitions cannot change on the fly.
#define LED_DT 4         // Serial data pin
#define LED_CK 11        // Clock pin for WS2801 or APA102
#define COLOR_ORDER GRB  // It's GRB for WS2812B and GBR for APA102
#define LED_TYPE WS2812B // changed toB What kind of strip are you using (APA102, WS2801 or WS2812B)?
#define NUM_LEDS 60      // Number of LED's

// Initialize changeable global variables.
uint8_t max_bright = 255; // Overall brightness definition. It can be changed on the fly.

uint8_t the_speed = 10;
uint8_t color_r = 10;
uint8_t color_g = 10;
uint8_t color_b = 10;

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

  FastLED.setBrightness(max_bright);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 1000); // FastLED power management set at 5V, 500mA
}

void loop()
{
  webSocket.loop();
  fill_solid(leds, NUM_LEDS, CRGB(color_r, color_g, color_b));
  FastLED.show();
}

void webSocketEvent(byte num, WStype_t type, uint8_t *payload, size_t length)
{
  if (type == WStype_TEXT)
  {
    String str = (char *)payload;
    Serial.print(str);
    DynamicJsonDocument state(200);
    deserializeJson(state, str);
    color_r = state["color"]["r"];
    color_g = state["color"]["g"];
    color_b = state["color"]["b"];
  }
}

void rainbow_wave(uint8_t thisSpeed, uint8_t deltaHue)
{ // The fill_rainbow call doesn't support brightness levels.

  // uint8_t thisHue = beatsin8(thisSpeed,0,255);                // A simple rainbow wave.
  uint8_t thisHue = beat8(thisSpeed, 255); // A simple rainbow march.

  fill_rainbow(leds, NUM_LEDS, thisHue, deltaHue); // Use FastLED's fill_rainbow routine.
}
