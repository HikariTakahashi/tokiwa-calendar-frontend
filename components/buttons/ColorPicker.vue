<template>
  <div class="flex flex-col sm:flex-row gap-2">
    <!--カラー直接入力-->
    <div class="flex-1 grid grid-cols-2 gap-2">
      <div>
        <p>RGB</p>
        <input
          v-model="rgbInput"
          size="8"
          type="text"
          class="border rounded px-2 py-1"
          @input="updateColorFromRGB"
        />
      </div>
      <div>
        <p>HEX</p>
        <input
          v-model="hexInput"
          size="8"
          type="text"
          class="border rounded px-2 py-1"
          @input="updateColorFromHex"
        />
      </div>
      <div>
        <p>HSV</p>
        <input
          v-model="hsvInput"
          size="8"
          type="text"
          class="border rounded px-2 py-1"
          @input="updateColorFromHSV"
        />
      </div>
      <div>
        <p>HSL</p>
        <input
          v-model="hslInput"
          size="8"
          type="text"
          class="border rounded px-2 py-1"
          @input="updateColorFromHSL"
        />
      </div>
    </div>
    <div class="flex flex-row justify-between gap-2">
      <!--カラーフィールド&スライダー-->
      <div>
        <!--カラーフィールド-->
        <div class="relative border-2 border-gray-600">
          <div
            class="w-32 h-32 cursor-crosshair"
            :style="{
              background: `linear-gradient(to right, white, ${hsvToHex(
                hue,
                100,
                100
              )})`,
            }"
            @mousedown="startColorPick"
            @mousemove="updateColor"
            @mouseup="stopColorPick"
            @mouseleave="stopColorPick"
          >
            <div
              class="absolute inset-0"
              :style="{
                background: 'linear-gradient(to top, black, transparent)',
              }"
            ></div>
            <div
              v-if="isPicking"
              class="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
              :style="{
                left: `${saturation}%`,
                top: `${100 - value}%`,
                transform: 'translate(-50%, -50%)',
              }"
            ></div>
          </div>
        </div>
        <!--Hue変更スライダー-->
        <div class="relative">
          <input
            v-model="hue"
            type="range"
            min="0"
            max="360"
            class="w-full h-8 rounded-lg appearance-none cursor-pointer"
            :style="{
              background:
                'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }"
            @input="updateColorFromHue"
          />
        </div>
      </div>

      <!--色を表示-->
      <div class="flex flex-col max-w-20 gap-y-1.5">
        <div
          class="w-20 h-10 rounded border"
          :style="{ backgroundColor: modelValue }"
        ></div>
        <div class="flex flex-wrap gap-1 justify-center">
          <ColorButton
            color="#ff0000"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#00ff00"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#0000ff"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#dc2626"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#10b981"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#3b82f6"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#eae727"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#ec4899"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#6366f1"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#f59e0b"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#cd0000"
            @update:modelValue="handleColorButtonClick"
          />
          <ColorButton
            color="#7c3aed"
            @update:modelValue="handleColorButtonClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ColorButton from "./ColorButton.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "#3b82f6",
  },
});

const emit = defineEmits(["update:modelValue"]);

const hue = ref(217);
const saturation = ref(76);
const value = ref(96);
const isPicking = ref(false);

// 入力フィールドの値
const rgbInput = ref("59,130,246");
const hexInput = ref("#3b82f6");
const hsvInput = ref("217°,76%,96%");
const hslInput = ref("217°,76%,60%");

const hsvToHex = (h, s, v) => {
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r, g, b;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// RGBからHEXへの変換
const rgbToHex = (r, g, b) => {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// HEXからRGBへの変換
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// RGBからHSVへの変換
const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h,
    s,
    v = max;

  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

// RGBからHSLへの変換
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// HSLからRGBへの変換
const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

// 入力値の更新処理
const updateColorFromRGB = () => {
  const [r, g, b] = rgbInput.value.split(",").map(Number);
  if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    const hex = rgbToHex(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    updateAllValues(hex, hsv, hsl);
  }
};

const updateColorFromHex = () => {
  if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
    const rgb = hexToRgb(hexInput.value);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      updateAllValues(hexInput.value, hsv, hsl);
    }
  }
};

const updateColorFromHSV = () => {
  const match = hsvInput.value.match(/(\d+)°,(\d+)%,(\d+)%/);
  if (match) {
    const [_, h, s, v] = match.map(Number);
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100) {
      const hex = hsvToHex(h, s, v);
      const hsl = rgbToHsl(
        hsvToRgb(h, s, v).r,
        hsvToRgb(h, s, v).g,
        hsvToRgb(h, s, v).b
      );
      updateAllValues(hex, { h, s, v }, hsl);
    }
  }
};

// HSLからの色更新処理
const updateColorFromHSL = () => {
  const match = hslInput.value.match(/(\d+)°,(\d+)%,(\d+)%/);
  if (match) {
    const [_, h, s, l] = match.map(Number);
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
      const rgb = hslToRgb(h, s, l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      updateAllValues(hex, hsv, { h, s, l });
    }
  }
};

// すべての値を更新
const updateAllValues = (hex, hsv, hsl) => {
  hexInput.value = hex;
  hue.value = hsv.h;
  saturation.value = hsv.s;
  value.value = hsv.v;
  if (hsl) {
    hslInput.value = `${hsl.h}°,${hsl.s}%,${hsl.l}%`;
  }
  emit("update:modelValue", hex);
};

const updateColorFromHue = () => {
  updateUserColor();
};

const startColorPick = (event) => {
  isPicking.value = true;
  updateColorFromPosition(event);
};

const updateColor = (event) => {
  if (isPicking.value) {
    updateColorFromPosition(event);
  }
};

const stopColorPick = () => {
  isPicking.value = false;
};

const updateColorFromPosition = (event) => {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  saturation.value = Math.round((x / rect.width) * 100);
  value.value = Math.round(100 - (y / rect.height) * 100);

  updateUserColor();
};

const updateUserColor = () => {
  const newColor = hsvToHex(hue.value, saturation.value, value.value);
  emit("update:modelValue", newColor);
};

// 初期値の設定
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const rgb = hexToRgb(newValue);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        // 入力フィールドの値を更新
        rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
        hexInput.value = newValue;
        hsvInput.value = `${hsv.h}°,${hsv.s}%,${hsv.v}%`;
        hslInput.value = `${hsl.h}°,${hsl.s}%,${hsl.l}%`;
        // HSVの値を更新
        hue.value = hsv.h;
        saturation.value = hsv.s;
        value.value = hsv.v;
      }
    }
  },
  { immediate: true }
);

// ColorButtonのクリックイベントを監視
const handleColorButtonClick = (color) => {
  emit("update:modelValue", color);
};
</script>

<style scoped>
.cursor-crosshair {
  cursor: crosshair;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #666;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #666;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
</style>
