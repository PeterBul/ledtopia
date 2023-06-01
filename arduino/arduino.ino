#include <SoftwareSerial.h>
#include "FastLED.h"          // FastLED library.
#include <ArduinoJson.h>      // Handle JSON

SoftwareSerial mySerial(2, 3); // RX, TX

const byte numChars = 64;
char receivedChars[numChars];

boolean newData = false;

#define FASTLED_ALLOW_INTERRUPTS 0 // Used for ESP8266.

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


// Initialize changeable global variables.
uint8_t MAX_BRIGHT = 255;

bool isOn = true;
uint8_t lightMode = 0;
uint8_t colorH = 60;
uint8_t colorS = 250;
uint8_t colorV = 100;

uint8_t rainbowSpeed = 10;

uint16_t pulseSpeed = 300;

const int IS_ON = 1;
const int LIGHT_MODE = 2;
const int COLOR_H = 3;
const int COLOR_S = 4;
const int COLOR_V = 5;
const int RAINBOW_SPEED = 6;
const int PULSE_SPEED_1 = 7;
const int PULSE_SPEED_2 = 8;

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

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);
  delay(5000);

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

void loop() {
  recvBytes();
  //recvWithStartEndMarkers();
  //showNewData();
  /*
    String incomingString = "";
    boolean stringReady = false;



    if (mySerial.available()) {
    incomingString = mySerial.readString();
    stringReady = true;
    }

    if (stringReady) {
    Serial.println("Received String: " + incomingString);
    int a; int b;
    getBracketIndicies(incomingString, a, b);
    if (a != -1 && b != -1) {
      Serial.println("indicies: " + String(a) + ", " + String(b));

      String str = incomingString.substring(a, b + 1);
      if (str.indexOf("?") == -1) {
        Serial.println(str);
        DynamicJsonDocument state(200);
        deserializeJson(state, str);
        IS_ON = state["on"];
        lightMode = state["mode"];
        colorH = state["hue"];
        colorS = state["saturation"];
        colorV = state["brightness"];
        rainbowSpeed = state["rainbowSpeed"];
        pulseSpeed = state["pulseSpeed"];
      }
    }
    }
  */

  if (!isOn)
  {
    FastLED.clear();
    FastLED.show();
    return;
  }

  switch (lightMode)
  {
    case 0:
      fill_color();
      break;
    case 1:
      pulse_wave();
      break;
    case 2:
      rainbow_wave(rainbowSpeed, 10);
      break;
    case 3:
      bounce();
      break;
  }
}

void getBracketIndicies(String str, int &a, int &b) {

  a = str.indexOf("{");
  b;
  int newRes;

  while (a != -1) {
    newRes = str.indexOf("{", a + 1);
    if (newRes != -1) {
      a = newRes;
    } else {
      break;
    }
  }

  if (a != -1) {
    b = str.indexOf("}", a);
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
  fill_solid(leds, NUM_LEDS, CHSV(colorH, colorS, colorV));
  FastLED.show();
}

void pulse_wave()
{
  float speed = pulseSpeed * 10;
  float breath = (exp(sin(millis() / speed * PI)) - 0.36787944) * 108.0;
  breath = map(breath, 0, 255, MIN_PULSE_BRIGHT, MAX_PULSE_BRIGHT);
  fill_solid(leds, NUM_LEDS, CHSV(colorH, colorS, breath));
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

void recvWithStartEndMarkers() {
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = '<';
  char endMarker = '>';
  char rc;

  while (mySerial.available() > 0 && newData == false) {
    rc = mySerial.read();


    if (recvInProgress == true) {
      if (rc != endMarker) {
        receivedChars[ndx] = rc;
        ndx++;
        if (ndx >= numChars) {
          ndx = numChars - 1;
        }
      }
      else {
        receivedChars[ndx] = '\0'; // terminate the string
        recvInProgress = false;
        ndx = 0;
        newData = true;
      }
    }

    else if (rc == startMarker) {
      recvInProgress = true;
    }
    Serial.print(receivedChars[0], HEX);
    Serial.print(" ");
    Serial.print(receivedChars[1], HEX);
    Serial.print(" ");
    Serial.println(receivedChars[2], HEX);
  }
}

void recvBytes() {
  char startMarker = 0x3C;
  char endMarker = 0x3E;
  while (mySerial.available() > 0) {
    Serial.println(mySerial.peek(), HEX);
    if (mySerial.peek() != startMarker) {
      mySerial.read();
      continue;
    }
    byte arr[11];
    mySerial.readBytes(arr, 11);

    if (arr[10] == endMarker) {
      isOn = arr[IS_ON] ? true : false;
      lightMode = arr[LIGHT_MODE];
      colorH = arr[COLOR_H];
      colorS = arr[COLOR_S];
      colorV = arr[COLOR_V];
      rainbowSpeed = arr[RAINBOW_SPEED];
      pulseSpeed = (arr[PULSE_SPEED_1] << 8) | arr[PULSE_SPEED_2];
      mySerial.write(arr[9]);
      for (int i = 0; i < 11; i++) {
        Serial.print(arr[i]);
        if (i < 9) Serial.print(", ");
      }
      Serial.println();
    }
  }
}

void showNewData() {
  if (newData == true) {
    Serial.print("This just in ... ");
    Serial.println(receivedChars);
    Serial.println(receivedChars[2], HEX);
    newData = false;
    updateLight();
  }
}
void updateLight() {
  bool isOneChar = receivedChars[1] == ':';
  bool isTwoChar = !isOneChar && receivedChars[2] == ':';
  String str = (char*) receivedChars;
  String prop = str.substring(0, str.indexOf(':'));
  Serial.println(prop);
  uint16_t val;
  if (isOneChar) {
    val = receivedChars[2];
  } else {
    val = receivedChars[3];
  }
  setValue(receivedChars[0], val);
}

void setValue(char prop, uint16_t val) {
  switch (prop) {
    case 'o': {
        if (val) {
          isOn = true;
        } else {
          isOn = false;
        }

        break;
      }
    case 'm':
      lightMode = val;
      break;
    case 'h':
      colorH = val;
      break;
    case 's':
      colorS = val;
      break;
    case 'v':
      colorV = val;
      break;
    case 'r':
      rainbowSpeed = val;
      break;
    case 'p':
      pulseSpeed = val;
      break;
  }
}
/*
  void updateLight(String incomingString) {
    int a; int b;
    getBracketIndicies(incomingString, a, b);
    if (a != -1 && b != -1) {
      Serial.println("indicies: " + String(a) + ", " + String(b));

      String str = incomingString.substring(a, b + 1);
      if (str.indexOf("?") == -1) {
        Serial.println(str);
        //decodeWithJSON(str);
      }
    }
  }
*/

void decodeWithJSON(String str) {
  DynamicJsonDocument state(200);
  deserializeJson(state, str);
  isOn = state["o"];
  lightMode = state["m"];
  colorH = state["h"];
  colorS = state["s"];
  colorV = state["v"];
  rainbowSpeed = state["rs"];
  pulseSpeed = state["ps"];
}

void decodeBytes(unsigned long long val) {
  isOn = (bool) (val & 4503599627370496) >> 52;
  lightMode = (val & 4222124650659840) >> 48;
  colorH = (val & 280375465082880) >> 40;
  colorS = (val & 1095216660480) >> 32;
  colorV = (val & 4278190080) >> 24;
  rainbowSpeed = (val & 16711680) >> 16;
  pulseSpeed = val & 65535;
}
