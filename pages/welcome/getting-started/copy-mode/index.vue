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
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">コピーモード</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」のコピーモードの使い方を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-8 px-4">
        <p class="text-base text-gray-700 leading-relaxed">
          同じ予定や空き時間を何度も入力する手間から解放されませんか？<br />
          Tokiwaのコピーモードは、一度登録した情報をワンタップで複製し、カレンダー作成を劇的に効率化する機能です。
        </p>

        <div class="flex flex-col gap-y-3">
          <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2">
            瞬時に複製、時間を有効活用
          </h2>
          <p class="text-base text-gray-700 leading-relaxed pt-2">
            すでに登録済みの予定や空き時間を選択し、コピーモードを有効にするだけ。あとは、複製したい日付をタップするだけで、瞬時に同じ内容が反映されます。例えば、「終日OK」といった定型的な空き時間や、毎週繰り返されるミーティングなど、頻繁に入力する情報も、一度作ればあとは貼り付けるだけ。<br /><br />
            これにより、これまで手作業で費やしていた入力時間を大幅に削減し、あなたはもっと重要なタスクに集中できるようになります。Tokiwaのコピーモードで、スマートなカレンダー管理を体験してください。
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
