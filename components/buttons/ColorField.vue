<template>
  <div class="flex flex-row justify-between gap-0.5">
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

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
  if (!event.target || !event.target.getBoundingClientRect) {
    return;
  }

  try {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    saturation.value = Math.round((x / rect.width) * 100);
    value.value = Math.round(100 - (y / rect.height) * 100);

    updateUserColor();
  } catch (error) {}
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
        // HSVの値を更新
        hue.value = hsv.h;
        saturation.value = hsv.s;
        value.value = hsv.v;
      }
    }
  },
  { immediate: true }
);
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
