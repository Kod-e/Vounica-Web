# Foundation レイヤー README

Core レイヤーは、このプロジェクトの **一番下の基盤** です。 
OpenAPI Fetch, Auth, JWT認証Token注入, 初期化, API Handler をここでまとめます。 
上の Store, Controller, Viewは、この foundation を使って動きます。


## OpenAPI Fetch Client作成
Foundation レイヤーでは、まず **型安全な API Client** を用意しています。  
バックエンドの FastAPI は OpenAPI schema を自動生成するため、フロント側では次のスクリプトで TypeScript 型を生成できます：

```bash
"gen:api": "openapi-typescript ./openapi.json -o ./src/types/api.d.ts"
```

これにより、バックエンドの schema と同じ定義をそのまま利用でき、フロントで新しい型を二重定義する必要はありません。

API の呼び出し先は Vite の env 機能で管理しています。環境変数 `VITE_API_BASE_URL` を読み込み、`src/lib/apiBase.ts` で共通のユーティリティを定義しました：

```ts
// src/lib/apiBase.ts
export const apiBase = import.meta.env.VITE_API_BASE_URL
```

さらに、本プロジェクトでは **二種類の Client** を分けています。  
- 認証前に使う `authClient.ts`  
- 認証後に token を自動注入する `api.ts`

これにより、未ログイン時とログイン後で処理を分けつつ、どちらも OpenAPI 由来の型を利用して安全に API 呼び出しができます。

## OpenAPI Fetch Handler作成
**目的**：認証まわり（token取得・自動更新・セッション切替）と、  
共通ヘッダー／通知処理を **openapi-fetch のハンドラ** で一元化します。  
ここでは `src/plugins/apiAuth.ts` に token 更新ロジックをまとめ、`api.ts` の `api.use(...)` で  
言語ヘッダー付与・401時の処理・ネットワーク例外の通知を行います。

- **JWT 期限の事前判定**：access token を簡単に decode して、**残り6時間未満なら refresh**。  
- **単発更新（シングルフライト）**：`refreshInFlight` で同時多発の refresh を抑止。  
- **失敗時フォールバック**：refresh 失敗なら **Guest 認証** に切替。  
- **bindAuth**：`getToken / onAuthLost` を `api.ts` の interceptor に注入。  
- **言語ヘッダー**：`Accept-Language / Target-Language` を毎リクエストに付与。  
- **通知**：API エラー本文の `message` を拾って `Notify` に表示。  
- **onError**：ネットワーク断などの非HTTP例外は i18n 文言で通知。

```ts
// src/plugins/apiAuth.ts
import { bindAuth } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { authGuest, authRefresh } from '@/lib/authClient'
import { jwtDecode } from 'jwt-decode'

let refreshInFlight: Promise<void> | null = null

// refresh token を使って、access token を一回だけ更新する（同時実行を防ぐ）
function refreshOnce(): Promise<void> {
  if (refreshInFlight) return refreshInFlight
  const s = useAuthStore()
  refreshInFlight = (async () => {
    if (!s.refreshToken) throw new Error('NO_REFRESH_TOKEN')
    const { access_token } = await authRefresh({ refresh_token: s.refreshToken })
    s.setTokens(access_token, s.refreshToken) // 成功：新しい access を保存
  })().finally(() => {
    refreshInFlight = null // 終わったらロック解除
  })
  return refreshInFlight
}

// アプリ起動時に一度だけ呼び出す：token取得と失効時の動作を api に注入
export function installApiAuth() {
  bindAuth({
    async getToken() {
      const s = useAuthStore()
      if (s.accessToken !== '') {
        // JWT を軽く展開して有効期限を確認。残り6時間以上あればそのまま使う
        const decoded = jwtDecode<{ exp: number }>(s.accessToken)
        const now = Date.now()
        const exp = decoded.exp! * 1000
        if (now < exp - 6 * 60 * 60 * 1000) {
          return s.accessToken
        }
        // 残りが少ない：更新を試みる。失敗したら Guest に切替
        try {
          await refreshOnce()
        } catch {
          s.clear()
          const { access_token, refresh_token } = await authGuest()
          s.setTokens(access_token, refresh_token)
        }
        return s.accessToken
      }
      // access が無い：Guest を取得
      const { access_token, refresh_token } = await authGuest()
      s.setTokens(access_token, refresh_token)
      return s.accessToken
    },
    async onAuthLost() {
      // 401 などで現セッションが無効になった時の処理：Guest に切替
      const s = useAuthStore()
      s.clear()
      const { access_token, refresh_token } = await authGuest()
      s.setTokens(access_token, refresh_token)
    },
  })
}
// main.ts 側：app.use(installApiAuth) で一度だけ初期化
```
ただ、正直に言うと開発中は「とりあえず動くこと」を優先して、  
この handler を plugin として分離せず、`api.ts` に直接書いてしまったこともあります。  
そのまま便利だったので後で直さずに残ってしまいました（私の問題です）。  
言語ヘッダーの付与なども、結局 `api.use(...)` 内にまとめて書いたりしました。  
結果として「設計のきれいさ」と「実装の手軽さ」のどちらを取るかで揺れています。
```ts
// src/lib/api.ts（抜粋：request/response/error ハンドラ）
// - リクエスト毎に Authorization と言語ヘッダーを付与
// - エラーボディの message を通知に出す
// - 401 は onAuthLost を呼んで Guest に切替
// - ネットワーク系の失敗は i18n 文言で通知

api.use({
  async onRequest({ request }: { request: Request }) {
    if (!handlers) return request
    const token = await handlers.getToken()
    if (!token) return request
    const headers = new Headers(request.headers)
    const langStore = useLangStore()
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('Accept-Language', langStore.acceptLanguage) // UI 表示の言語
    headers.set('Target-Language', langStore.targetLanguage) // 学習ターゲットの言語
    return new Request(request, { headers })
  },
  async onResponse({ response }: { response: Response }) {
    // 200/201 は成功としてそのまま返す
    if (response.status === 200 || response.status === 201) return response

    const notifyStore = useNotifyStore()
    // エラー本文に message があれば通知に出す（無ければ statusText）
    try {
      const data = await response.json()
      if ((data as { message?: string }).message) {
        notifyStore.addNotify((data as { message: string }).message)
      }
    } catch {
      notifyStore.addNotify(response.statusText)
    }

    // 401：セッション無効 → Guest に切替
    if (response.status === 401 && handlers) {
      await handlers.onAuthLost()
      return response
    }
    throw response
  },
})

api.use({
  onError({ error }: { error: unknown }) {
    // HTTP レスポンス系は上の onResponse で処理済み
    if (error instanceof Response) {
      throw error
    }
    // ネットワーク断・CORS・DNS 失敗など
    const notifyStore = useNotifyStore()
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
    const t = i18n.global.t as (key: string) => string
    const message = isOffline ? t('networkOffline') : t('networkConnectFailed')
    try {
      notifyStore.addNotify(message)
    } catch {}
    throw error
  },
})
```
## 言語設定

このプロジェクトでは **vue-i18n** を使って、UI を多言語化できるようにしています。  
`src/plugins/i18n.ts` で i18n を初期化し、英語（en）・日本語（ja）・中国語（zh）の3言語をサポートしています。  

初期の locale は以下の順で決定します：
1. Pinia の永続化データから復元（前回選択した言語）  
2. それが無ければブラウザの言語設定から推測  
3. 最後に fallback として `en` を使用  

実際の UI では App Bar から `setAcceptLanguage(lang)` を呼ぶことで、**即時に UI 言語が切り替わる**ようになっています。  
また Pinia の `afterRestore` フックで、リロード後も選択言語が保持されます。  

一方、`targetLanguage` は UI には関与せず、**学習の目標言語**として API 通信時のヘッダに含めています。  
リクエストには次の2種類のヘッダが常に付与されます：  
- `Accept-Language`: UI 表示の基準となる言語  
- `Target-Language`: 学習対象の言語  

これにより、フロントエンドの表示とバックエンドの学習文脈を分離しつつ、  
ユーザーが「使う言語」と「学ぶ言語」を自由に切り替えられる仕組みになっています。  

私はこの構成が一番シンプルで、UI と API の責務が明確になると感じました。

## 初期化

フロントエンドのエントリーポイント `main.ts` では、Tailwind CSS の読み込みから始めて、  
Vue アプリケーションの基本的な初期化を行います。Pinia（永続化プラグイン付き）、  
vue-i18n、Vue Router、そして `installApiAuth` をそれぞれ登録し、  
最後に `#app` にマウントしています。シンプルに全部ここでまとめて初期化しています。

```ts
import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { i18n } from '@/plugins/i18n'
import { installApiAuth } from '@/plugins/apiAuth'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(i18n)
app.use(router)
app.use(installApiAuth)

app.mount('#app')
```