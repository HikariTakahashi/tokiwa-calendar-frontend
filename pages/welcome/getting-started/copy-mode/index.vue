<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-5/6 h-auto min-h-screen py-10 sm:px-10 border-l-2 border-gray-200"
    >
      <div class="flex flex-col gap-y-2 px-4">
        <h1 class="text-3xl sm:text-4xl font-bold">コピーモードの使い方</h1>
        <p class="text-gray-600">
          一度入力した予定を、他の日付に簡単に複製する機能です。繰り返し同じ予定を入力する手間を省きます。
        </p>
      </div>

      <div class="w-full h-0.5 bg-gray-200 my-10" />

      <div class="flex flex-col gap-y-16 px-4">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ1：コピー元の予定を選択
            </h2>
            <p class="text-gray-700 leading-relaxed">
              はじめに、複製したい予定が入力されている日付をクリックし、時間設定ウィンドウを開きます。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/コピーモード_1.png"
              alt="コピーしたい予定が入力されたカレンダー"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row-reverse items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">
              ステップ2：コピーモードの有効化
            </h2>
            <p class="text-gray-700 leading-relaxed">
              ウィンドウ上部にある<b>コピーアイコン</b>をクリックします。これにより、コピーモードが有効になります。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/コピーモード_2.png"
              alt="コピーアイコンをクリックする箇所の説明"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="md:w-1/2">
            <h2 class="text-2xl font-bold mb-3">ステップ3：他の日付に複製</h2>
            <p class="text-gray-700 leading-relaxed">
              カレンダー上で貼り付けたい日付をクリックすると、予定が複製されます。操作を終了するには、キーボードの<b>Enterキー</b>を押してください。
            </p>
          </div>
          <div class="md:w-1/2">
            <img
              src="/images/コピーモード_3.gif"
              alt="他の日付に予定を貼り付ける操作のGIFアニメーション"
              class="rounded-lg shadow-lg border"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";
import NavigationSection from "~/components/welcome/sections/NavigationSection.vue";
</script>
