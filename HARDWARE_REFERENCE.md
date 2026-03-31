# ESP32 Hardware Reference Guide

## ESP32-WROOM-32 Pinout

```
                    ┌─────────────────────────┐
                    │   ESP32 WROOM-32        │
                    │     Front View          │
                    │                         │
                    │ USB (Micro-B)           │
                    │        |                │
                    │        ▼                │
                    │                         │
    GND  ║  3V3  ║  EN   RST  │  TX   RX  │  GND
    ║ ║  ║ ║   ║  ║  ║   ║    │  ║    ║  │  ║ ║
    23 ║ 22║  21  ║ 20  ║  19 ║  18  ║ 17║  16
    ║ ║  ║ ║   ║  ║  ║   ║    │  ║    ║  │  ║ ║
    ║ ║  ║ ║   ║  ║  ║   ║    │  ║    ║  │  ║ ║
     5 ║  4║   2  ║  0  ║  35 ║  34  ║ 39║  12
    ║ ║  ║ ║   ║  ║  ║   ║    │  ║    ║  │  ║ ║
    25 ║ 26║  27  ║ 14  ║  13 ║  12  ║ 11║  10
    ║ ║  ║ ║   ║  ║  ║   ║    │  ║    ║  │  ║ ║
    32 ║ 33║ GND  ║ 3V3 ║ GND ║ 3V3  ║ 5V║ GND
    ║  ║ ║      ║     ║ ║ ║     ║ ║
    
    GND  ║ IO25  ║ IO26 ║ IO27 ║ IO14 ║ IO13 ║ IO12 ║ IO11 ║ IO10
    IO32 ║ IO33  ║ GND  ║ 3V3  ║ GND  ║ 3V3  ║ 5V   ║ GND
```

## VL53L0X Sensor Pinout

```
    VL53L0X ToF Sensor
    ┌──────────────────┐
    │                  │
    │ SDA ──┐  ┌─ 3V3  │
    │ SCL ──┤  ├─ GND  │
    │       │  │       │
    │       └──┘       │
    │  (I2C Connector) │
    │                  │
    └──────────────────┘
```

## Connection Wiring Diagram

```
    ┌──────────────────────────────────────┐
    │          ESP32 WROOM-32              │
    │                                      │
    │  GPIO21 (SDA) ──────────────────┐   │
    │                                  │   │
    │  GPIO22 (SCL) ──────────────────┼─┐ │
    │                                  │ │ │
    │  3.3V ───────────────────────────┼─┼─┤ 
    │                                  │ │ │
    │  GND ────────────────────────────┼─┼─┤
    │                                  │ │ │
    └──────────────────────────────────│─│─┘
                                       │ │
                        ┌──────────────┼─┼─────┐
                        │              │ │     │
                        │          ┌───┴─┴──┐  │
                        │          │ VL53L0X │  │
                        │          │  Sensor  │  │
                        │          │          │  │
                        │  SDA ────│ SDA      │  │
                        │  SCL ────│ SCL      │  │
                        │  3.3V ───│ VCC      │  │
                        │  GND ────│ GND      │  │
                        │          │          │  │
                        │          └──────────┘  │
                        │                        │
                        └────────────────────────┘
```

## Detailed Pin Reference

### ESP32 Pins Used by This Project

| Pin | GPIO | Name | Purpose | Connection |
|-----|------|------|---------|-----------|
| 21 | GPIO21 | SDA | I2C Data | VL53L0X SDA |
| 22 | GPIO22 | SCL | I2C Clock | VL53L0X SCL |
| 2 | 3.3V | Power | 3.3V Supply | VL53L0X VCC |
| 3 | GND | Ground | Ground | VL53L0X GND |

### Available GPIO Pins (Unused - for Future Expansion)

| Pin | GPIO | Type | Notes |
|-----|------|------|-------|
| 25 | GPIO25 | Output | Can drive LEDs, buttons |
| 26 | GPIO26 | Output | Can drive LEDs, buttons |
| 27 | GPIO27 | Output | Can drive LEDs, buttons |
| 32 | GPIO32 | Input/Output | Can be used for sensors |
| 33 | GPIO33 | Input/Output | Can be used for sensors |
| 5 | GPIO5 | Output | Can use for reset button |
| 12 | GPIO12 | Output | Note: Can't use if boot mode needs 0V |
| 13 | GPIO13 | Output | General purpose |
| 14 | GPIO14 | Output | General purpose |
| 15 | GPIO15 | Output | Note: Can't use if boot mode needs 1V |
| 16 | GPIO16 | Output | General purpose |
| 17 | GPIO17 | Output | General purpose |
| 18 | GPIO18 | Output | Generally safe (SPI option) |
| 19 | GPIO19 | Output | Generally safe |

### Pins NOT Recommended

| Pin | GPIO | Reason |
|-----|------|--------|
| 0 | GPIO0 | Boot mode selection (must be high) |
| 1 | GPIO1 | UART TX (Serial output) |
| 3 | GPIO3 | UART RX (Serial input) |
| 6-11 | GPIO6-11 | Connected to internal flash |
| 12 | GPIO12 | Boot mode (avoid if possible) |
| 15 | GPIO15 | Boot mode (avoid if possible) |
| 35 | GPIO35 | Input only |
| 36 | GPIO36 | Input only |
| 39 | GPIO39 | Input only |
| 34 | GPIO34 | Input only |

## I2C Protocol Details

### I2C Timing
```
Clock Speed: 400kHz (Standard Fast Mode)

Data Line (SDA)
    ___     ___     ___     ___     ___
   | 1 |___| 0 |___| 1 |___| 1 |___| 0 |___
   
Clock Line (SCL)
   ___    ___    ___    ___    ___    ___
  | 1 |__| 0 |__| 1 |__| 1 |__| 0 |__| 1 |__
```

### I2C Pull-up Resistors
- VL53L0X has built-in pull-ups (usually 10kΩ)
- ESP32 has configurable internal pull-ups
- No external resistors needed for short distances (<1m)

## Power Specifications

### ESP32 Power Requirements
- Typical Current: 80-100mA (WiFi active)
- Peak Current: 250-300mA (during transmission)
- Operating Voltage: 3.0V - 3.6V recommended
- USB 5V input (has onboard regulator)

### VL53L0X Power Requirements
- Typical Current: 15-19mA (continuous ranging)
- Operating Voltage: 2.6V - 3.5V
- Logic Levels: 3.3V compatible

### Recommended Power Supply
- Capacity: ≥ 1000mA at 5V
- Type: USB power adapter, battery, or wall supply
- For 24/7 operation: Proper regulated 5V supply with capacitors

## Component Specifications

### ESP32-WROOM-32 Specifications
- MCU: Xtensa dual-core 32-bit LX6
- Clock Speed: 160MHz / 240MHz (configurable)
- Flash: 4MB
- RAM: 520KB
- Wireless: 802.11 b/g/n (2.4GHz)
- Antenna: Onboard PCB antenna
- Temperature: -40°C to +85°C
- Coding: C/C++ via Arduino IDE

### VL53L0X Specifications
- Type: Time-of-Flight (ToF) distance sensor
- Wavelength: 940nm (infrared)
- Measurement Range: 30mm to 1000mm (ideal)
- Measurement Accuracy: ±5% to ±10%
- Update Rate: Up to 50Hz
- Interface: I2C (address: 0x29)
- Temperature: -20°C to +70°C
- Power: 2.6V - 3.5V

## PCB Layout Recommendations

```
For reliable operation, follow these design guidelines:

1. Power Distribution
   5V ──[Capacitor 100µF]──┬─── ESP32 VIn
                            └─── VL53L0X VCC (via regulator)
   
   GND ────────────────────┬─── ESP32 GND
                            └─── VL53L0X GND

2. I2C Wiring (for jumper cables)
   
   ESP32 GPIO21 ────────┬─────── VL53L0X SDA
                        │
                    [4.7kΩ]  (optional, if no pull-ups)
                        │
                        └─────── 3.3V
   
   ESP32 GPIO22 ────────┬─────── VL53L0X SCL
                        │
                    [4.7kΩ]  (optional, if no pull-ups)
                        │
                        └─────── 3.3V

3. Wire Lengths
   - I2C bus: Keep under 1 meter (preferably 30cm)
   - Power supply: Keep under 2 meters
   - Use twisted pair or shielded cable for I2C

4. Decoupling Capacitors
   - 100µF between VCC and GND (bulk)
   - 0.1µF near ESP32 power pins (ceramic)
   - 0.1µF near VL53L0X VCC (ceramic)
```

## Breadboard Layout Example

```
ESP32                           VL53L0X
┌─────────────────────┐        ┌────────────────┐
│ GND   3V3  EN  RST  │        │ SDA  SCL  VCC  │
├─────────────────────┤        │  │    │    │   │
│                     │◄──┐    │  │    │    │   │
│              GPIO21 │   │    └──┼────┼────┼───┘
│              GPIO22 │   │       │    │    │
│                 GND ├───┼───────┼────┼────┘
│                3.3V ├───┘       │    │
│                     │           │    │
│                     │           └────┴── GND
│                     │
└─────────────────────┘

Breadboard Connections:
GPIO21 ─► Red Wire ─► SDA (VL53L0X)
GPIO22 ─► Yellow Wire ─► SCL (VL53L0X)
3.3V ──► Blue Wire ──► VCC (VL53L0X)
GND ───► Black Wire ──► GND (VL53L0X)
```

## Troubleshooting Checklist

### Physical Connection
- [ ] USB cable is connected to ESP32
- [ ] VL53L0X is securely on breadboard
- [ ] Jumper wires are firmly seated
- [ ] No loose connections

### Power Supply
- [ ] ESP32 power LED is on (red light)
- [ ] Voltage between 3.3V and GND is ~3.3V
- [ ] No power is being shorted to GND

### I2C Bus
- [ ] GPIO21 and GPIO22 are not used by Serial pins
- [ ] Both SDA and SCL lines are properly connected
- [ ] Pull-up resistors present (if needed)
- [ ] No capacitive loads causing bus issues

### Sensor
- [ ] Sensor lens is clean (no fingerprints/dust)
- [ ] Sensor is not in direct sunlight (interferes with IR)
- [ ] Sensor is pointing at the measurement target
- [ ] Distance to target is within range (30-1000mm)

## Optional: Reset Button Circuit

For a physical reset button (GPIO5):

```
                      ┌─────┐
                      │ GND │
                      └──┬──┘
                         │
                        /
                       / Button (normally open)
                      /
                      │
                      ├──[10kΩ]──┬─── 3.3V
                      │          │
                      └──────────┴─── GPIO5 (ESP32)

Code to read button:
  const int RESET_BUTTON = 5;
  pinMode(RESET_BUTTON, INPUT_PULLUP);
  
  if (digitalRead(RESET_BUTTON) == LOW) {
    resetPassengerCount();
  }
```

## Optional: Status LED Circuit

For visual feedback (GPIO25):

```
            GPIO25 ──┬──[330Ω]──┐
                     │          │
                    [LED]      GND
                     │
                     │
                   Anode (+)
```

Code to control LED:
```cpp
const int LED_PIN = 25;
pinMode(LED_PIN, OUTPUT);

// Blink on WiFi connect
digitalWrite(LED_PIN, HIGH);
delay(100);
digitalWrite(LED_PIN, LOW);

// Blink on API success
digitalWrite(LED_PIN, HIGH);
delay(50);
digitalWrite(LED_PIN, LOW);
```

---

## Safety Notes

⚠️ Important:
- Do NOT connect 5V directly to GPIO pins (max 3.3V)
- Do NOT connect 3.3V devices to 5V supply (except ESP32 USB)
- Do NOT exceed GPIO current: ~12mA max per pin
- Do NOT use GPIO0 or GPIO15 while programming
- Do NOT connect sensors during power-on sequence
- Always power down before making connections

⚡ Best Practices:
- Always use a current-limiting resistor with LEDs (330Ω recommended)
- Use a dedicated 5V power supply with USB adapter for stability
- Keep I2C wires short and grouped together
- Avoid running in direct sunlight (IR sensors get confused)
- Ground yourself to avoid static discharge

---

**Last Updated**: March 30, 2024
**Compatibility**: ESP32-WROOM-32, Arduino IDE 2.0+
