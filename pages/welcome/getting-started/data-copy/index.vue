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
        <h1 class="text-3xl sm:text-4xl font-bold">テキストコピーの方法</h1>
        <p class="text-gray-600">
          このページでは、カレンダーの予定をテキスト形式でコピーする方法を紹介します。
        </p>
      </div>

      <div class="w-full h-0.5 bg-gray-200 my-10" />

      <div class="flex flex-col gap-y-8 px-4">
        <p class="text-base text-gray-700 leading-relaxed">
          カレンダーに入力した複数の予定を、メールやチャットで共有しやすいテキスト形式に変換し、ワンクリックでクリップボードにコピーする機能です。
        </p>

        <div class="flex flex-col gap-y-16 mt-8">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="md:w-1/2">
              <h2 class="text-2xl font-bold mb-3">
                ステップ1：時間データ一覧を開く
              </h2>
              <p class="text-gray-700 leading-relaxed">
                カレンダーに予定が入力された状態で、画面右上の<b>上向き矢印アイコン</b>をクリックし、「時間データ一覧」を開きます。
              </p>
            </div>
            <div class="md:w-1/2">
              <img
                src="/images/スクリプト_1.png"
                alt="時間データ一覧を開くアイコンを指したカレンダー画面"
                class="rounded-lg shadow-lg border"
              />
            </div>
          </div>

          <div class="flex flex-col md:flex-row-reverse items-center gap-8">
            <div class="md:w-1/2">
              <h2 class="text-2xl font-bold mb-3">
                ステップ2：テキストをコピー
              </h2>
              <p class="text-gray-700 leading-relaxed">
                一覧画面の右下にある<b>「コピー」</b>ボタンをクリックします。これだけで、整形されたテキストがクリップボードに保存されます。
              </p>
            </div>
            <div class="md:w-1/2">
              <img
                src="/images/スクリプト_2.png"
                alt="コピーボタンをクリックする箇所の説明"
                class="rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>

        <div class="mt-8">
          <h2 class="text-2xl font-bold mb-4">出力されるテキストの例</h2>
          <p class="text-gray-700 leading-relaxed mb-3">
            コピーしたテキストは、以下のような形式でメールやチャットツールに貼り付けできます。
          </p>
          <pre
            class="bg-gray-100 p-4 rounded-lg my-2 text-gray-800 font-mono text-sm whitespace-pre-wrap"
          ><code>7/8(火): 15:00~20:00
7/9(水): 15:00~20:00
7/10(木): 15:00~20:00
7/11(金): 15:00~20:00
7/15(火): 04:00~10:00, 12:00~15:00
7/16(水): 04:00~10:00, 12:00~15:00
7/17(木): 15:00~20:00
7/18(金): 15:00~20:00</code></pre>
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
