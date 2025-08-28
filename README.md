# Vounica プロジェクト概要

> 名前の後半「unica」は Latin 語から来ました。前半の「vo」は voice（声）、vocabulary（単語）などの意味を考えられます。  
> 全体の意味は「一人一人に unique な language learning コースを作る」です。

Vounica は、AI を利用した **言語学習支援プラットフォーム** です。  
ユーザーが自分で書いた日記や興味のある内容をもとに、システムが自動で問題（Question）を作成し、  
解答や間違いを記録（Record）して、次の問題に反映します。

この **QuestionAgent → RecordAgent → QuestionAgent のループ** によって、  
使えば使うほどシステムがユーザーを理解し、個別最適な学習体験を提供します。

従来の固定カリキュラム型アプリと違い、Vounica は **ユーザー自身の生活・興味・文脈** を中心に学習内容を生成するため、  
「自分の言葉」で学べるのが特徴です。

## Demo

https://vounica.com

## InstallとAccess

### 1. リポジトリを clone

```bash
git clone https://github.com/Kod-e/Vounica-Web.git
cd Vounica-Web
```

### 3. Build

```bash
npm run install
npm run build
```

### 4. Access

- Dist Path ./dist
- Dev Acccess

```bash
npm run dev
```

## 使用している技術

### frontend：Vue 3 + Pinia + OpenAPI Fetch

- Vue3 + Pinia を使うと、UI は data を管理せず、ただ表示するだけです。imperative な code はほとんど不要です。
- backend の FastAPI が出す OpenAPI schema をそのまま使えるので、frontend で model を作り直す必要はありません。

## アーキテクチャ図 (Frontend)

Vounicaのバックエンドは以下のような構成になっています。  
Core → Infra → Service → API の4層に分かれ、それぞれが明確に役割を持っています。

<p align="center">
  <img src="https://static.vounica.com/image/frontend.webp" alt="Frontend" width="600"/>
</p>

---

## プロジェクト構成

## ScreenShots

### Question Agent 冷スタート

最初にユーザーが「学びたい内容」を入力すると、Question Agent が冷スタートします。  
学習履歴や文法・語彙の記録がない状態から診断テストを作成し、段階的に問題を生成します。

<p align="center">
  <img src="https://static.vounica.com/image/qstagent/1.webp" alt="Cold Start Input" width="400"/>
  <img src="https://static.vounica.com/image/qstagent/2.webp" alt="Cold Start Output" width="400"/>
</p>

### Question Type Examples

Vounica では主に 3 種類の問題形式をサポートしています。  
下記は Choice, Match, Assembly の画面例です。

<p align="center">
  <img src="https://static.vounica.com/image/question/1.webp" alt="Choice Question" width="280"/>
  <img src="https://static.vounica.com/image/question/2.webp" alt="Match Question" width="280"/>
  <img src="https://static.vounica.com/image/question/3.webp" alt="Assembly Question" width="280"/>
</p>

### Database View

ユーザーの回答や習得状態はフロントエンドから DB として確認できます。  
以下は Memory と Vocab の例です。

<p align="center">
  <img src="https://static.vounica.com/image/database/1.webp" alt="Memory View" width="400"/>
  <img src="https://static.vounica.com/image/database/2.webp" alt="Vocab View" width="400"/>
</p>
