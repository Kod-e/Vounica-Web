# UI レイヤー 

UI レイヤーはとても簡単で、**state を表示するだけ** です。  
自分でデータを持たず、すべて Pinia の state をリアクティブに表示します。  
操作も state の関数を呼ぶだけで、UI 自体はロジックを持ちません。  
私はこの分離が一番わかりやすくて、安心できると思いました。

---

## 構成

UI は大きく三つのレイヤーに分けています：

- **Route の外にある部分**：全ての画面で共通して出る  
  例：`NotifyOver`（通知表示）、`AppBar`  
- **特別な部分**：`Question`  
  → Controller の `is_open` を見て表示するかどうかを決める  
- `Route`部分
この作りは `App.vue` を見ればすぐ分かります。最初からここに骨組みを書いているので、全体も分かりやすいです。

--- 

## Route の外にある部分
(src/App.vue)
```vue
  <AppBar>
    <div v-if="controller.is_open">
      <QuestionView />
    </div>
    <div v-else>
      <RouterView />
    </div>
  </AppBar>
  <NotifyOver />
```


この作りを見ると、QuestionView は Question が始まる時に Route を置き換えて主画面になります。  
でも他の部分には影響しません。つまり、どこからでも簡単に Question を開けます。  
今は Question Agent だけですが、あとで新しい機能を足す時も同じ考え方でできます。  

また、Notify は Vue の Slot を使って外側に置いているので、どこにいても通知を見ることができます。

---

## Question Agent の画面
(src/QuestionAgentView.vue)
考え方は単純です。`questionAgent` の `events` は反応的なので、UI は自動で更新されます。  
上から下への `v-for` だけで時系列に表示できます。受信トークンをそのまま積むことで、進捗のような見え方になります。  
種類ごとに絵文字（またはアイコン）を付けて区別します。`ToolDescription` は複雑な tool call を読みやすい文字列に変換します（未対応のものは一時的に生 JSON を出します）。

```vue
<div v-for="(event, i) in questionAgent.events" :key="i">
  <div class="relative pb-8">
    <span
      v-if="i !== questionAgent.events.length - 1"
      class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
      aria-hidden="true"
    />
    <div class="relative flex space-x-3">
      <div>
        <span
          :class="[
            getBackground(event.type),
            'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
          ]"
        >
          <component
            :is="getIcon(event.type)"
            class="h-5 w-5 text-white"
            aria-hidden="true"
          />
        </span>
      </div>
      <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
        <div v-if="event.type === 'message'">
          <p class="text-sm text-gray-500">
            {{ event.data?.message }}
          </p>
        </div>
        <div v-else-if="event.type === 'thinking'">
          <p class="text-md font-bold text-gray-800">{{ t('thinking') }}</p>
        </div>
        <div v-else-if="event.type === 'tool_call'">
          <ToolDescripton
            :tool_name="event.data?.tool_name ?? ''"
            :tool_data="event.data?.tool_data"
          />
        </div>
        <div v-else-if="event.type === 'result'">
          {{ t('success') }}
        </div>
      </div>
    </div>
  </div>
</div>
```

`controller.isStreaming` は「今ストリーム受信中」を表します。  
この間は `streamText` にトークンを順次つなげ、最下部にだけ表示します。  
終了時に Controller が自動で **1つの message event** を作って `events` に追加し、`streamText` を消します。  
見た目は「流れ終わって次の行へ進む」だけで、同じ画面の中で自然に切り替わります。  
UI の動きはずっと一定で、別部品を使っているようには見えません。

## Record Agent の画面
(src/RecordAgentView.vue)

Record Agent の表示は Question Agent とほとんど同じ仕組みです。  
Controller が持つ `events` を反応的に並べるだけで、UI は自動で更新されます。  

そのためここで二度説明する必要はありません。  
私はこの「同じ型で作れる」という構成がとても分かりやすいと思いました。


## QuestionView
(src/QuestionView.vue)

```vue
<template>
  <div>
    <div v-if="controller.status === 'presenting' || controller.status === 'answered'">
      <QuestionRouteView />
    </div>
    <div v-else-if="controller.status === 'feedback'">
      <QuestionRouteView />
      <FeedBackOver />
    </div>
    <div v-else-if="controller.status === 'evaluating'">
      <RecordAgentView />
    </div>
    <div v-else-if="controller.status === 'finished'">
      <RecordFeedBackView />
    </div>
  </div>
</template>
```

この画面は **question controller の状態** に合わせて、表示を切り替えます。  
controller は問題の進行を管理する **有限状態の流れ** です。

- **presenting / answered**：  
  `QuestionRouteView` を表示します。`QuestionRouteView` は **現在の問題の種類** に合わせて条件表示します。
- **feedback**：  
  `QuestionRouteView` を出しつつ、正誤を知らせる `FeedBackOver` を重ねて表示します。
- **evaluating**（記録中）：  
  `RecordAgentView` を表示します。記録の経過をそのまま見せます。
- **finished**（完了）：  
  `RecordFeedBackView` を表示して、記録と問題の結果をまとめて見せます。

私はこの切替が単純で分かりやすいと思いました。UI は状態を見るだけで、余計な処理を持ちません。

## Choice & Assembly & Match View

この3つの View だけは、答えの判定ロジックをページ内に直接持っています。  
本来は「UIはロジックを持たない」という方針ですが、ここは **一問ごとの判定** なのでシンプルに書いた方が分かりやすいと考えました。  
状態は全局ではなく、その場の reactive state にだけ保持しています。

### Choice
選択した答えを保存し、submit 時に正答と比較します。

```ts
function onSelect(option: string) {
  controller.status = 'answered'
  question.value.answer = option
}
function onSubmit() {
  if (question.value.answer === question.value.correct_answer) {
    controller.correct()
  } else {
    controller.incorrect()
  }
}
```

### Assembly
単語の bank と answer を行き来させ、最後に正規化して判定します。

```ts
function moveToAnswer(i: number) {
  answer.value.push(bank.value.splice(i, 1)[0])
}
function onSubmit() {
  const norm = (t: string[]) => t.join(' ').toLowerCase().replace(/\s+/g, ' ').trim()
  controller[join(norm(answer.value) === norm(question.value.correct_answer) ? 'correct' : 'incorrect')]()
}
```

### Match
左右のペアを作って保存し、submit 時に正答と比較します。

```ts
function updateAnswerAndStatus() {
  question.value.answer = question.value.left_options
    .filter((l) => pairs[l])
    .map((l) => [l, pairs[l]])
  controller.status = question.value.answer.length === question.value.left_options.length ? 'answered' : 'presenting'
}
function onSubmit() {
  const corr = question.value.correct_answer
  const ans = question.value.answer
  const isSame = ans.length === corr.length && ans.every((p, i) => p[1] === corr[i][1])
  controller[isSame ? 'correct' : 'incorrect']()
}
```

このように、処理はすべて View 内で閉じていて、問題単位で自己完結しています。

## Story & Mistake & Memory & Vocab & Grammar の View

ここでは **Story** を例にします。  
分類がある View（Story / Memory）は **タブ + カテゴリ** が増えるだけで、他はとても単純です。  
基本は Controller の関数を呼ぶだけ（取得・前へ・次へ）で、現在ページの内容を列で表示します。  
私はこの作りが分かりやすく、同じ型で他の View にも広げやすいと思いました。

### 例：Story View（カテゴリ付き）

- 初期化で `fetchCategories()` を呼ぶ  
- 画面上部は **タブ**（`selectedCategory` を切替）  
- 本文は `stories` を `v-for` で並べる  
- 下部は **前へ / 次へ** ボタン（`prevPage()` / `nextPage()`）

``vue
<!-- タブ（PC） -->
<nav class="-mb-px flex space-x-8" aria-label="Tabs">
  <a
    v-for="tab in tabs"
    :key="tab.name"
    @click="storyStore.selectCategory(tab.name)"
    :class="tab.name === storyStore.selectedCategory ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
    class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
  >{{ tab.name }}</a>
</nav>
``

``vue
<!-- 一覧表示 -->
<ul role="list" class="divide-y divide-gray-100">
  <li v-for="story in stories" :key="story.id!" class="py-5">
    <p class="text-sm/6 text-gray-900 break-all">{{ story.content }}</p>
    <div class="mt-2 flex items-center justify-between">
      <p class="text-xs/5 text-gray-500">{{ t('summary') }}: {{ story.summary }}</p>
      <p class="text-xs/5 text-gray-500">
        {{ t('updated_at') }} <time :datetime="story.updated_at">{{ story.updated_at }}</time>
      </p>
    </div>
  </li>
</ul>
``

``vue
<!-- ページ操作 -->
<div class="mt-8 flex justify-between">
  <button @click="storyStore.prevPage()">
    {{ storyStore.isLoading ? 'Loading...' : t('prevPage') }}
  </button>
  <button @click="storyStore.nextPage()">
    {{ storyStore.isLoading ? 'Loading...' : t('nextPage') }}
  </button>
</div>
``

``ts
// 最小の初期化（setup）
const storyStore = storyController()
onMounted(() => { storyStore.fetchCategories() })
const tabs = computed(() => storyStore.categories.map((c) => ({ name: c })))
const stories = computed(() => storyStore.stories)
``

### 他 View との違い

- **Memory**：Story と同じく **タブ + カテゴリ** を持つ（関数名だけ異なる）  
- **Mistake / Vocab / Grammar**：カテゴリがないぶん、**タブ部分が無い**。  
  → 取得（`fetchXxx`）、前へ（`prevPage`）、次へ（`nextPage`）をそのまま呼ぶだけ。  
  → 本文は現在ページの配列を `v-for` で並べるだけ。

このように、**型（型式）は全て同じ** にしているので、読む側も作る側も迷いません。