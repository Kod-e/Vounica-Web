# Foundation レイヤー README

Core レイヤーは、このプロジェクトの **一番下の基盤** です。 
OpenAPI Fetch, Auth, JWT認証Token注入, 初期化, API Handler をここでまとめます。 
上の Store, Controller, Viewは、この foundation を使って動きます。


## OpenAPI Fetch Client作成
Foundation レイヤーでは、まず **型安全な API Client** を用意しています。  
バックエンドの FastAPI は OpenAPI schema を自動生成するため、フロント側では次のスクリプトで TypeScript 型を生成できます：

``bash
"gen:api": "openapi-typescript ./openapi.json -o ./src/types/api.d.ts"
``

これにより、バックエンドの schema と同じ定義をそのまま利用でき、フロントで新しい型を二重定義する必要はありません。

API の呼び出し先は Vite の env 機能で管理しています。環境変数 `VITE_API_BASE_URL` を読み込み、`src/lib/apiBase.ts` で共通のユーティリティを定義しました：

``ts
// src/lib/apiBase.ts
export const apiBase = import.meta.env.VITE_API_BASE_URL
``

さらに、本プロジェクトでは **二種類の Client** を分けています。  
- 認証前に使う `authClient.ts`  
- 認証後に token を自動注入する `api.ts`

これにより、未ログイン時とログイン後で処理を分けつつ、どちらも OpenAPI 由来の型を利用して安全に API 呼び出しができます。
## OpenAPI Fetch Handler作成

## 言語設定

## 初期化