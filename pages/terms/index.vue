<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-col mt-24 px-40 pb-24">
    <div class="flex flex-col items-center">
      <h1 class="text-2xl font-bold">利用規約・プライバシーポリシー</h1>
    </div>
    <div class="flex items-center gap-y-4 mt-4">
      <p class="text-md text-center">
        本ウェブサイト上で提供するサービス（以下,「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
      </p>
    </div>
    <div class="flex flex-col border-b-2 border-gray-200">
      <h2 class="text-xl font-bold">第1条（適用）</h2>
    </div>
    <div class="flex flex-col items-start gap-y-4 mt-4">
      <p class="text-md">
        本規約は，ユーザーと本プロジェクトとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
      </p>
      <p class="text-md">
        本プロジェクトは本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
      </p>
      <p class="text-md">
        本規約の規定が前条の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。
      </p>
    </div>
    <div class="flex flex-col border-b-2 border-gray-200">
      <h2 class="text-xl font-bold">第2条（利用登録）</h2>
    </div>
    <div class="flex flex-col items-start gap-y-4 mt-4">
      <p class="text-md">
        本サービスにおいては，登録希望者が本規約に同意の上，本プロジェクトの定める方法によって利用登録を申請し，本プロジェクトがこれを承認することによって，利用登録が完了するものとします。
      </p>
      <p class="text-md">
        本プロジェクトは，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
      </p>
      <p class="text-md">利用登録の申請に際して虚偽の事項を届け出た場合</p>
      <p class="text-md">本規約に違反したことがある者からの申請である場合</p>
      <p class="text-md">
        その他，本プロジェクトが利用登録を相当でないと判断した場合
      </p>
    </div>
    <div class="flex flex-col border-b-2 border-gray-200">
      <h2 class="text-xl font-bold">第4条（禁止事項）</h2>
    </div>
    <div class="flex flex-col items-start gap-y-4 mt-4">
      <p class="text-md">法令または公序良俗に違反する行為</p>
      <p class="text-md">犯罪行為に関連する行為</p>
      <p class="text-md">
        本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為
      </p>
      <p class="text-md">
        当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
      </p>
      <p class="text-md">
        本サービスによって得られた情報を商業的に利用する行為
      </p>
      <p class="text-md">当社のサービスの運営を妨害するおそれのある行為</p>
      <p class="text-md">不正アクセスをし，またはこれを試みる行為</p>
      <p class="text-md">
        他のユーザーに関する個人情報等を収集または蓄積する行為
      </p>
      <p class="text-md">不正な目的を持って本サービスを利用する行為</p>
      <p class="text-md">
        本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為
      </p>
      <p class="text-md">他のユーザーに成りすます行為</p>
      <p class="text-md">
        当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為
      </p>
      <p class="text-md">面識のない異性との出会いを目的とした行為</p>
      <p class="text-md">
        当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
      </p>
      <p class="text-md">その他，当社が不適切と判断する行為</p>
    </div>
    <div class="flex flex-col border-b-2 border-gray-200">
      <h2 class="text-xl font-bold">第5条（本サービスの提供の停止等）</h2>
    </div>
    <div class="flex flex-col items-start gap-y-4 mt-4">
      <p class="text-md">
        本プロジェクトは，以下のいずれかの事由に該当する場合には，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
      </p>
    </div>
  </div>

  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "@/components/header/WelcomeHeader.vue";
import NavigationSection from "@/components/welcome/sections/NavigationSection.vue";
</script>
