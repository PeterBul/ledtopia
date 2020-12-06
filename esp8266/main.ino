#include <ESP8266WiFi.h>      // ESP WiFi library
#include <WebSocketsServer.h> // WebSockets library
#include <ArduinoJson.h>      // Handle JSON
#include "FastLED.h"          // FastLED library.
#include <ArduinoJson.h>

#define FASTLED_ALLOW_INTERRUPTS 0 // Used for ESP8266.

char ssid[] = "Riksheim"; // use your own network ssid and password
char pass[] = "Hope6013";

WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// Fixed definitions cannot change on the fly.
#define LED_DT 4         // Serial data pin
#define LED_CK 11        // Clock pin for WS2801 or APA102
#define COLOR_ORDER GRB  // It's GRB for WS2812B and GBR for APA102
#define LED_TYPE WS2812B // changed toB What kind of strip are you using (APA102, WS2801 or WS2812B)?
#define NUM_LEDS 60      // Number of LED's

// Constant for ball effect
#define GRAVITY -1 // Downward (negative) acceleration of gravity in m/s^2
#define h0 1       // Starting height, in meters, of the ball (strip length)
#define NUM_BALLS 6

bool IS_ON = true;

// Initialize changeable global variables.
uint8_t MAX_BRIGHT = 255;

uint8_t SPEED = 10;
uint8_t COLOR_H = 40;
uint8_t COLOR_S = 250;
uint8_t COLOR_V = 100;
uint8_t LIGHT_MODE = 0;

float RAINBOW_SPEED = 10;

float PULSE_SPEED = 300;
float MIN_PULSE_BRIGHT = 100;
float MAX_PULSE_BRIGHT = 255;

// Variables for bounce effect
float h[NUM_BALLS];                       // An array of heights
float vImpact0 = sqrt(-2 * GRAVITY * h0); // Impact velocity of the ball when it hits the ground if "dropped" from the top of the strip
float vImpact[NUM_BALLS];                 // As time goes on the impact velocity will change, so make an array to store those values
float tCycle[NUM_BALLS];                  // The time since the last time the ball struck the ground
int pos[NUM_BALLS];                       // The integer position of the dot on the strip (LED index)
long tLast[NUM_BALLS];                    // The clock time of the last ground strike
float COR[NUM_BALLS];

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
  webSocket.enableHeartbeat(3000, 3000, 2);

  // LED setup

  LEDS.addLeds<LED_TYPE, LED_DT, COLOR_ORDER>(leds, NUM_LEDS); // For WS2812B

  FastLED.setBrightness(MAX_BRIGHT);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 1000); // FastLED power management set at 5V, 500mA

  for (int i = 0; i < NUM_BALLS; i++)
  { // Initialize variables
    tLast[i] = millis();
    h[i] = h0;
    pos[i] = 0;            // Balls start on the ground
    vImpact[i] = vImpact0; // And "pop" up at vImpact0
    tCycle[i] = 0;
    COR[i] = 0.90 - float(i) / pow(NUM_BALLS, 2);
  }
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
    fill_color();
    break;
  case 1:
    pulse_wave();
    break;
  case 2:
    rainbow_wave(RAINBOW_SPEED, 10);
    break;
  case 3:
    bounce();
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
    IS_ON = state["on"];
    LIGHT_MODE = state["mode"];
    COLOR_H = state["hue"];
    COLOR_S = state["saturation"];
    COLOR_V = state["brightness"];
    RAINBOW_SPEED = state["rainbowSpeed"];
    PULSE_SPEED = state["pulseSpeed"];
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
  float speed = PULSE_SPEED * 10;
  float breath = (exp(sin(millis() / speed * PI)) - 0.36787944) * 108.0;
  breath = map(breath, 0, 255, MIN_PULSE_BRIGHT, MAX_PULSE_BRIGHT);
  fill_solid(leds, NUM_LEDS, CHSV(COLOR_H, COLOR_S, breath));
  FastLED.show();
}

void bounce()
{
  FastLED.clear();
  FastLED.show();
  for (int i = 0; i < NUM_BALLS; i++)
  {
    tCycle[i] = millis() - tLast[i]; // Calculate the time since the last time the ball was on the ground

    // A little kinematics equation calculates positon as a function of time, acceleration (gravity) and intial velocity
    h[i] = 0.5 * GRAVITY * pow(tCycle[i] / 1000, 2.0) + vImpact[i] * tCycle[i] / 1000;

    if (h[i] < 0)
    {
      h[i] = 0;                         // If the ball crossed the threshold of the "ground," put it back on the ground
      vImpact[i] = COR[i] * vImpact[i]; // and recalculate its new upward velocity as it's old velocity * COR
      tLast[i] = millis();

      if (vImpact[i] < 0.01)
        vImpact[i] = vImpact0; // If the ball is barely moving, "pop" it back up at vImpact0
    }
    pos[i] = round(h[i] * (NUM_LEDS - 1) / h0); // Map "h" to a "pos" integer index position on the LED strip
  }

  //Choose color of LEDs, then the "pos" LED on
  for (int i = 0; i < NUM_BALLS; i++)
    leds[pos[i]] = CHSV(uint8_t(i * 40), 255, 255);
  FastLED.show();
  //Then off for the next loop around
  for (int i = 0; i < NUM_BALLS; i++)
  {
    leds[pos[i]] = CRGB::Black;
  }
}
