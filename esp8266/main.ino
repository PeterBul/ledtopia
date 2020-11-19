#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>

WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

bool fade = false;
int pin_led = 2;
int brightness = 0; // how bright the LED is
int fadeAmount = 5; // how many points to fade the LED by

char ssid[] = "Get-2G-D3F386"; // use your own network ssid and password
char pass[] = "ltz5mn2azy";

void setup()
{
  pinMode(pin_led, OUTPUT);
  digitalWrite(pin_led, LOW);

  Serial.begin(9600);
  Serial.println();
  Serial.println("Serial started at 9600");
  Serial.println();

  // Connect to a WiFi network
  Serial.print(F("Connecting to "));
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

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("");
    Serial.print("Failed to connect to ");
    Serial.println(ssid);
    while (1)
      ;
  }

  Serial.println("");
  Serial.println(F("[CONNECTED]"));
  Serial.print("[IP ");
  Serial.print(WiFi.localIP());
  Serial.println("]");

  // start a server
  server.begin();
  Serial.println("Server started");

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop()
{
  webSocket.loop();
  if (fade)
  {
    analogWrite(pin_led, brightness);

    // change the brightness for next time through the loop:
    brightness = brightness + fadeAmount;

    // reverse the direction of the fading at the ends of the fade:
    if (brightness <= 0 || brightness >= 255)
    {
      fadeAmount = -fadeAmount;
    }
    // wait for 30 milliseconds to see the dimming effect
    delay(30);
  }
  delay(5);
}

void webSocketEvent(byte num, WStype_t type, uint8_t *payload, size_t length)
{
  if (type == WStype_TEXT)
  {
    if (payload[0] == '0')
    {
      digitalWrite(pin_led, LOW);
    }
    if (payload[0] == 'F')
    {
      fade = true;
    }
    if (payload[0] == 'N')
    {
      fade = false;
    }
    else if (payload[0] == '1')
    {
      digitalWrite(pin_led, HIGH);
    }
  }

  else
  {
    Serial.print("WStype = ");
    Serial.println(type);
    Serial.print("WS payload = ");
    for (int i = 0; i < length; i++)
    {
      Serial.print((char)payload[i]);
    }
    Serial.println();
  }
}
