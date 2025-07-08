<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-full md:w-5/6 h-auto min-h-screen py-10 sm:px-10 md:border-l-2 border-gray-200 md:pt-10 pt-20"
    >
      <div class="flex flex-col gap-y-2 px-4">
        <h1 class="text-3xl sm:text-4xl font-bold">予定の入力方法</h1>
        <p class="text-gray-600">
          このページでは、Tokiwa
          Calendarにおける予定の入力、及び共有方法について解説します。
        </p>
      </div>

      <div class="w-full h-0.5 bg-gray-200 my-10" />

      <div class="flex flex-col gap-y-16 px-4">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">ステップ1：希望時間帯の入力</h2>
            <p class="text-gray-700 leading-relaxed">
              カレンダーから希望の日付を選択し、時間帯を指定します。同じ日付に複数の時間帯候補を設定することも可能です。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/入力_ステップ１.gif"
              alt="単一・複数の両方の時間帯を入力する操作のGIFアニメーション"
              class="rounded-lg shadow-lg border cursor-pointer hover:opacity-80 transition-opacity"
              @click="
                openPopup(
                  '/images/入力_ステップ１.gif',
                  '単一・複数の両方の時間帯を入力する操作のGIFアニメーション'
                )
              "
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row-reverse items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">ステップ2：共有設定の開始</h2>
            <p class="text-gray-700 leading-relaxed">
              入力が完了したら、共有設定を開始します。画面右上の<b
                class="text-blue-600"
                >上向き矢印アイコン</b
              >をクリックし、表示された画面で<b class="text-blue-600"
                >「共有」</b
              >ボタンを選択してください。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/入力_ステップ３.png"
              alt="共有準備の操作手順を示したスクリーンショット"
              class="rounded-lg shadow-lg border cursor-pointer hover:opacity-80 transition-opacity"
              @click="
                openPopup(
                  '/images/入力_ステップ３.png',
                  '共有準備の操作手順を示したスクリーンショット'
                )
              "
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ3：ユーザー名と識別色の設定
            </h2>
            <p class="text-gray-700 leading-relaxed">
              共有カレンダー上で誰の予定かを識別するため、ユーザー名と任意の識別色を設定します。「ユーザー名」を入力後、カラーパレットから表示色を選択してください。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/入力_ステップ４.png"
              alt="名前とカラー設定画面のスクリーンショット"
              class="rounded-lg shadow-lg border cursor-pointer hover:opacity-80 transition-opacity"
              @click="
                openPopup(
                  '/images/入力_ステップ４.png',
                  '名前とカラー設定画面のスクリーンショット'
                )
              "
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row-reverse items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ4：設定の確定とURLの共有
            </h2>
            <p class="text-gray-700 leading-relaxed">
              最後に「確定」ボタンをクリックすると、設定が同期・保存されます。自動生成された専用URLをコピーし、共有先の相手に通知してください。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/入力_ステップ５.gif"
              alt="設定を保存してURLを共有する操作のGIFアニメーション"
              class="rounded-lg shadow-lg border cursor-pointer hover:opacity-80 transition-opacity"
              @click="
                openPopup(
                  '/images/入力_ステップ５.gif',
                  '設定を保存してURLを共有する操作のGIFアニメーション'
                )
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
  <PopupImg
    :is-visible="popupVisible"
    :image-src="popupImageSrc"
    :image-alt="popupImageAlt"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";
import NavigationSection from "~/components/welcome/sections/NavigationSection.vue";
import PopupImg from "~/components/welcome/PopupImg.vue";

const popupVisible = ref(false);
const popupImageSrc = ref("");
const popupImageAlt = ref("");

const openPopup = (src: string, alt: string) => {
  popupImageSrc.value = src;
  popupImageAlt.value = alt;
  popupVisible.value = true;
};

const closePopup = () => {
  popupVisible.value = false;
};
</script>
