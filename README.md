# 🎄 Christmas Athletic 3D (クリスマスアスレチック 3D)

[![Release](https://img.shields.io/badge/Release-v1.0.0-brightgreen.svg)](https://github.com/youyouboydragonOfficial/Christmas-Athletic-3D/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-gold.svg)]()

> **1000以上のステージと多彩なギミックが待ち受ける、本格3Dクリスマス・プラットフォーマー！**  
> リアルに輝く巨大クリスマスツリーの頂点（ベツレヘムの星）を目指して、雪と氷の世界を駆け抜けろ！

---

## 🎁 ゲームの特徴

* **🌲 リアルな巨大クリスマスツリー（ゴール）**
  * 12層にわたるリアルなモミの木の枝葉構造と自然なしなり、雪化粧
  * 螺旋状に巻きつくイルミネーション（マルチカラーLED・点滅アニメーション）
  * 光沢と反射を再現したガラスオーナメント＆キャンディケーン
  * 頂上で光り輝く黄金の八芒星（タッチでステージクリア！）

* **🗺️ 1000以上のプロシージャル自動生成ステージ**
  * シード値に基づき、Stage 1 〜 Stage 1000（およびそれ以降）の全コースが異なる構造で生成
  * ステージ進行に応じてバイオーム（雪原、氷河、オーロラ、山岳、サンタの工房など）が変化
  * 好きなステージ番号を入力して自由にジャンプできる「ステージ選択」機能付き

* **❄️ ステージごとに異なる多彩なアスレチック・ギミック**
  1. **雪の足場**: 基本の足場
  2. **ツルツル滑る氷の床**: 摩擦が極端に低く、スリル満点のスピードランが楽しめる
  3. **崩れる雪ブロック**: 乗るとグラグラ震えて1秒後に崩落！
  4. **巨大プレゼント箱（トランポリン）**: 上に乗ると通常の2.5倍〜3倍の大ジャンプ！
  5. **動くソリの足場**: 空中を水平・垂直にパトロールする動く床
  6. **回転するキャンディケーン梁**: タイミングを計って飛び越える回転障害物
  7. **落下するツララ**: 下を通ると急降下してくるトラップ
  8. **コレクション・ベル**: ステージ上に散らばる黄金のクリスマスベルを集めてハイスコアを目指す！

* **🎵 歌なしジングルベル（インストゥルメンタルBGM）**
  * パブリックドメイン・公認インストゥルメンタル音源を収録：
    * 🎷 **Upbeat Band**: U.S. Air Force Band of Mid-America による華やかなブラス・ビッグバンド版
    * 🔔 **Gentle Jingle**: オルゴール・チェレスタが優しく響くクラシック版
  * ワンキー（`T` キーまたは画面ボタン）でいつでも即座にBGMを切り替え可能！
  * Web Audio API による心地よいクリスタルジャンプ音、雪の足音、ベルのチャイム、クリアファンファーレを内蔵。

---

## 🎮 操作方法

| キー | 動作 |
|---|---|
| **W, A, S, D** / **↑, ←, ↓, →** | 移動 |
| **SPACE** | ジャンプ（先行入力・コヨーテタイム対応で快適操作） |
| **マウスドラッグ** (右/左) | カメラ視点回転（360度自由オービット） |
| **マウスホイール** | カメラズームイン / ズームアウト |
| **R** | やり直し（クイックリトライ） |
| **ESC** | ステージ選択画面を開く（1〜1000へワープ） |
| **M** | BGMのミュート切替（ON / OFF） |
| **T** | BGMの選曲切替（アップビート ↔ ジェントル） |

---

## 📦 配布パッケージ

本ゲームは以下の形式でリリースされています：

1. **インストール型 (`Christmas-Athletic-3D-Setup-v1.0.0.exe`)**
   * インストールウィザード形式
   * デスクトップショートカットおよびスタートメニューへの登録に対応
2. **非インストール型 / ポータブル版 (`Christmas-Athletic-3D-v1.0.0-win-portable.zip`)**
   * 解凍して `ChristmasAthletic3D.exe` を実行するだけで即座にプレイ可能！

---

## 🏪 Microsoft Store への公開について

本アプリは、Microsoft Store（MSIX / Windows App SDK / MSIX Packaging Tool）への提出に対応した構成となっています。
Microsoft Partner Center アカウントをお持ちの場合、MSIX Packaging Tool を用いて本ポータブルパッケージを数分でストア提出用 `.msix` に変換・署名して公開できます。

---

## 📜 クレジット

* **3D Engine**: Three.js (MIT License)
* **BGM**:
  * "Jingle Bells" (Arrangement by U.S. Air Force Band of Mid-America) - Public Domain
  * "Jingle Bells" (Composed/Arranged by Kevin MacLeod, incompetech.com) - CC BY 3.0
* **Development**: youyouboydragonOfficial
