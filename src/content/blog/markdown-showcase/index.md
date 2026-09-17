---
title: Markdown showcase
description: Every Markdown element the blog supports, on one page, to check how each one renders.
date: 2026-09-17
draft: true
---

This post exists to check rendering. It is a draft, so it only appears in the dev server.

## Headings

### Third-level heading

#### Fourth-level heading

##### Fifth-level heading

###### Sixth-level heading

## Text

A paragraph with **bold**, _italic_, **_bold italic_**, ~~strikethrough~~, `inline code`, and a [link to GitHub](https://github.com/11gather11). A bare URL becomes a link too: https://11gather11.com.

A second paragraph that is long enough to wrap onto several lines, so the line height, the reading measure and the spacing between paragraphs can all be judged at once on both wide and narrow screens.

Line one of a hard break  
line two after two trailing spaces.

日本語の段落です。**強調**や_斜体_、`インラインコード`も混ぜて、行の高さと折り返しを確認します。English words mixed into Japanese text.

日本語の文章は単語の間にスペースを入れないため、ブラウザは文字の途中でも自由に折り返してしまい、「シンタックスハイライト」や「アクセシビリティ」のような長い言葉が行の終わりで二つに分かれることがあります。文節の区切りをあらかじめ推定しておけば、読みやすい位置で改行できるようになり、スマートフォンのような狭い画面でも文章の流れを追いやすくなります。

## Lists

- Unordered item
- Item with nested list
  - Nested item
  - Another nested item
    - Third level
- Last item

1. First ordered item
2. Second ordered item
   1. Nested ordered item
   2. Another one
3. Third ordered item

- [x] Completed task
- [ ] Open task

## Quotes and alerts

> A plain blockquote.
>
> With a second paragraph.

> [!NOTE]
> A note alert.

> [!TIP]
> A tip alert.

> [!IMPORTANT]
> An important alert.

> [!WARNING]
> A warning alert.

> [!CAUTION]
> A caution alert.

## Code

```ts
// A TypeScript block with a comment
import { readFile } from 'node:fs/promises'

export async function loadConfig(path: string): Promise<Record<string, unknown>> {
	const text = await readFile(path, 'utf8')
	return JSON.parse(text) as Record<string, unknown>
}
```

```tsx
export function Greeting({ name }: { name: string }) {
	return <p className='text-lg'>Hello, {name}!</p>
}
```

```nix
{ pkgs, ... }:
{
  devShells.default = pkgs.mkShellNoCC {
    packages = [ pkgs.nodejs_24 pkgs.pnpm_12 ];
  };
}
```

```sh
pnpm install --frozen-lockfile
pnpm build
```

```css
.article-body pre {
	overflow-x: auto;
}
```

```json
{ "name": "11gather11.com", "private": true }
```

```
A plain code block without a language, with a line long enough to overflow horizontally on a phone screen so scrolling can be checked.
```

## Tables

| Left aligned | Centered | Right aligned |
| :----------- | :------: | ------------: |
| alpha        |    1     |          1.00 |
| beta         |    22    |         22.50 |
| gamma        |   333    |        333.75 |

## Images

![The site's Open Graph image: ivory and navy halves with the logo on the seam](/og.png)

![The site icon](/icon.svg)

A relative image stored in the post's directory, published with a content hash:

![A gradient from ivory to navy](./gradient.png)

The same image with a title, which can become a caption, and explicit dimensions:

![A gradient from ivory to navy](./gradient.png "A gradient from the site's ivory to its navy"){width=960 height=540}

## Footnotes

Here is a sentence with a footnote.[^1] And another one.[^note]

[^1]: The first footnote.

[^note]: A named footnote with `code`.

## Horizontal rule

---

## HTML

<details>
<summary>Collapsible section</summary>

Hidden content inside a details element.

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd>
