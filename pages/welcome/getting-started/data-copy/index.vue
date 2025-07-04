<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-5/6 h-auto min-h-screen py-6 sm:px-10 border-l-2 border-gray-200"
    >
      <div class="flex flex-col gap-y-2">
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">
          入力した予定のコピー
        </h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」の入力した予定のコピー方法を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-8 px-4">
        <p class="text-base text-gray-700 leading-relaxed">
          Tokiwaでは、カレンダーに入力したあなたの予定や空き時間を、テキスト形式で簡単にコピーできます。
        </p>

        <div class="flex flex-col gap-y-4">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            カレンダー情報を瞬時にテキスト化
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            入力されたスケジュールを分かりやすい文字列として生成します。例えば、以下のように表示されます。
          </p>

          <div class="bg-gray-100 p-4 rounded-lg my-2">
            <p class="text-gray-800 font-mono">
              7/11(金): 7:00~10:00, 20:00~終日
            </p>
          </div>

          <p class="text-base text-gray-700 leading-relaxed">
            これにより、カレンダーを開かなくても、メールやチャットツールで「〇〇さん、この時間帯なら空いてるよ！」と素早く共有したい時に役立ちます。<br /><br />
            カジュアルな連絡から、プロジェクトの進捗報告まで、状況に応じた最適な形式で情報共有をサポートします。
          </p>
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
