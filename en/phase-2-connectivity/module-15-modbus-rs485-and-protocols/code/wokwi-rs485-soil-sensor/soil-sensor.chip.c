// soil-sensor.chip.c - Wokwi custom chip for Module 15: "MAX485 module + RS-485 soil sensor" in one chip.
// The side the ESP32 sees is that of a real MAX485 module: RO (to RX2), DI (from TX2), DE_RE (DE+RE joined).
// Imitated: Modbus RTU (frames, CRC, the 3.5-character gap, address, registers, exceptions) and the DE/RE direction.
// NOT imitated: the RS-485 electricity (wires A/B, terminator, bias, cable length). Only real boards can try that.
// Its datasheet is the same as the mock sensor on the second board (Practice 2): server 1, 9600 baud 8N1,
// register 0 = moisture x10, 1 = temperature x10 (signed), 2 = EC, 3 = server address (holding only, writable).
#include "wokwi-api.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BAUD 9600
#define HOLDING_COUNT 4  // registers 0-3, read with function 03, written with function 06
#define INPUT_COUNT 3    // registers 0-2, read with function 04
#define BUFFER_SIZE 256

typedef struct {
  pin_t ro;
  pin_t di;
  pin_t de_re;
  uart_dev_t uart;
  timer_t timer_t35;
  uint32_t attr_moisture;
  uint32_t attr_temperature;
  uint32_t attr_ec;
  uint8_t address;  // the server address now: 1 when the simulation starts, may be changed through register 3
  uint8_t buffer[BUFFER_SIZE];
  uint32_t length;
  uint8_t reply[BUFFER_SIZE];
} chip_state_t;

static uint16_t crc16_modbus(const uint8_t *data, uint32_t len) {
  uint16_t crc = 0xFFFF;
  for (uint32_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (int b = 0; b < 8; b++) {
      crc = (crc & 1) ? (uint16_t)((crc >> 1) ^ 0xA001) : (uint16_t)(crc >> 1);
    }
  }
  return crc;
}

static uint32_t add_crc(uint8_t *buf, uint32_t len) {
  uint16_t crc = crc16_modbus(buf, len);
  buf[len] = (uint8_t)(crc & 0xFF);  // low byte first
  buf[len + 1] = (uint8_t)(crc >> 8);
  return len + 2;
}

static int16_t scale10(float value) {
  return (int16_t)(value * 10.0f + (value >= 0 ? 0.5f : -0.5f));
}

// The register contents right now (from the sliders), the same as on the second board.
static uint16_t register_value(chip_state_t *chip, uint16_t number) {
  if (number == 0) return (uint16_t)scale10(attr_read_float(chip->attr_moisture));
  if (number == 1) return (uint16_t)scale10(attr_read_float(chip->attr_temperature));
  if (number == 2) return (uint16_t)(attr_read_float(chip->attr_ec) + 0.5f);
  return chip->address;
}

static uint32_t exception(chip_state_t *chip, uint8_t function, uint8_t code) {
  chip->reply[0] = chip->address;
  chip->reply[1] = (uint8_t)(function | 0x80);
  chip->reply[2] = code;
  return 3;
}

// One complete frame has arrived (the cable quiet >= 3.5 characters): check it and answer.
static void process_frame(chip_state_t *chip) {
  uint32_t n = chip->length;
  chip->length = 0;
  if (n < 4 || crc16_modbus(chip->buffer, n) != 0) {
    printf("Broken frame or wrong CRC (%u bytes): staying silent, like a real device.\n", (unsigned)n);
    return;
  }
  uint8_t destination = chip->buffer[0];
  uint8_t function = chip->buffer[1];
  if (destination != chip->address && destination != 0) {
    return;  // for another server: stay silent
  }
  uint16_t a = (uint16_t)((chip->buffer[2] << 8) | chip->buffer[3]);
  uint16_t b = (uint16_t)((chip->buffer[4] << 8) | chip->buffer[5]);
  uint32_t m = 0;
  if (function == 0x03 || function == 0x04) {
    if (destination == 0) return;  // a broadcast (address 0) is never answered
    uint16_t limit = (function == 0x03) ? HOLDING_COUNT : INPUT_COUNT;
    if (n != 8 || b == 0 || b > 125) {
      m = exception(chip, function, 0x03);  // ILLEGAL DATA VALUE
    } else if (b > limit || a > limit - b) {
      m = exception(chip, function, 0x02);  // ILLEGAL DATA ADDRESS
    } else {
      chip->reply[m++] = chip->address;
      chip->reply[m++] = function;
      chip->reply[m++] = (uint8_t)(b * 2);
      for (uint16_t i = a; i < a + b; i++) {
        uint16_t v = register_value(chip, i);
        chip->reply[m++] = (uint8_t)(v >> 8);  // high byte first (big-endian)
        chip->reply[m++] = (uint8_t)(v & 0xFF);
      }
    }
  } else if (function == 0x06) {
    if (n != 8 || a >= HOLDING_COUNT) {
      if (destination == 0) return;
      m = exception(chip, function, n != 8 ? 0x03 : 0x02);
    } else {
      memcpy(chip->reply, chip->buffer, 6);  // the normal reply of function 06 = an echo of the request
      m = 6;
      if (a == 3 && b >= 1 && b <= 247) {
        chip->address = (uint8_t)b;
        printf("Server address changed to %u (a new simulation = back to 1).\n", (unsigned)b);
      } else if (a == 3) {
        printf("Address %u refused: must be 1 to 247.\n", (unsigned)b);
      } else {
        printf("Someone wrote register %u: ignored, registers 0-2 are read-only.\n", (unsigned)a);
      }
      if (destination == 0) return;  // broadcast: carried out, but not answered
    }
  } else {
    if (destination == 0) return;
    m = exception(chip, function, 0x01);  // ILLEGAL FUNCTION
  }
  if (pin_read(chip->de_re) == HIGH) {
    printf("The ESP32's DE/RE is still HIGH: its receiver is off, this reply will be lost.\n");
    return;  // like a real module: the ESP32's MAX485 receiver is off, so the reply never reaches RX2
  }
  m = add_crc(chip->reply, m);
  if (!uart_write(chip->uart, chip->reply, m)) {
    printf("UART busy, reply dropped.\n");
  }
}

static void on_t35(void *user_data) {
  process_frame((chip_state_t *)user_data);
}

static void on_rx_data(void *user_data, uint8_t byte) {
  chip_state_t *chip = (chip_state_t *)user_data;
  if (pin_read(chip->de_re) == LOW) {
    return;  // the ESP32's MAX485 transmitter is off (DE LOW): this byte never reaches the cable
  }
  if (chip->length < BUFFER_SIZE) {
    chip->buffer[chip->length++] = byte;
  }
  // The 3.5-character gap at 9600 baud: about 4 ms (4010 us). Restarted on every new byte.
  timer_start(chip->timer_t35, 4010, false);
}

static void on_write_done(void *user_data) {
  (void)user_data;
}

void chip_init(void) {
  chip_state_t *chip = (chip_state_t *)calloc(1, sizeof(chip_state_t));
  chip->ro = pin_init("RO", INPUT_PULLUP);  // the official UART API example's pattern: chip TX pin = INPUT_PULLUP
  chip->di = pin_init("DI", INPUT);
  chip->de_re = pin_init("DE_RE", INPUT_PULLDOWN);
  chip->attr_moisture = attr_init_float("moisture", 58.5f);
  chip->attr_temperature = attr_init_float("temperature", 25.3f);
  chip->attr_ec = attr_init_float("ec", 1200.0f);
  chip->address = 1;

  const timer_config_t timer_cfg = {
    .user_data = chip,
    .callback = on_t35,
  };
  chip->timer_t35 = timer_init(&timer_cfg);

  const uart_config_t uart_cfg = {
    .user_data = chip,
    .rx = chip->di,
    .tx = chip->ro,
    .baud_rate = BAUD,
    .rx_data = on_rx_data,
    .write_done = on_write_done,
  };
  chip->uart = uart_init(&uart_cfg);
  printf("Mock RS-485 soil sensor ready: address 1, %u baud 8N1.\n", (unsigned)BAUD);
}
