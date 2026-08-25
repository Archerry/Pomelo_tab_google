# Pomelo Tab — Chrome Web Store 上架填写指南

更新日期：2026-08-25

本指南对应 Pomelo Tab `1.0.0`、Manifest V3，以及 Chrome Web Store Developer Dashboard 当前的商品详情、隐私权规范和发布流程。后台中文翻译可能微调；遇到差异时，以括号内英文名称和字段含义为准。

## 准备文件

- 扩展 ZIP：`release/pomelo-tab-v1.0.0.zip`
- 商店图标：`release/store-listing/assets/icon-128.png`
- 截图：`release/store-listing/assets/screenshots/01-privacy-onboarding.png` 至 `04-insights.png`
- 小型宣传图：`release/store-listing/assets/promo/promo-small-440x280.png`
- 大型宣传图：`release/store-listing/assets/promo/promo-marquee-1400x560.png`
- 隐私政策地址：`https://archerry.github.io/Pomelo_tab_google/privacy.html`
- 支持页面：`https://github.com/Archerry/Pomelo_tab_google/issues`
- 项目主页：`https://github.com/Archerry/Pomelo_tab_google`

## 1. 软件包（Package）

你已经有 Pomelo Tab 商品条目，因此进入该条目后打开 **软件包 / Package**，选择上传新软件包或替换软件包，上传：

```text
release/pomelo-tab-v1.0.0.zip
```

上传后确认：

- Name：`Pomelo Tab`
- Version：`1.0.0`
- Manifest：`V3`
- 默认语言：English
- 简体中文本地化存在

## 2. 商品详情（Store listing）

### 2.1 英文默认详情

名称（Name）：

```text
Pomelo Tab
```

简短说明（Summary）：

```text
Turn every new tab into a calm workspace for tabs, bookmarks, history, shortcuts, search, and local usage insights.
```

详细说明（Detailed description）：

```text
Pomelo Tab turns Chrome's new-tab page into a focused browser workspace.

Keep the things you use every day close at hand:

• See open tabs grouped by website, then open, focus, or close them.
• Find bookmarks and recent history without leaving the new tab.
• Create up to eight Quick Access shortcuts with compact site icons.
• Search Google, enter a URL, or search across tabs, bookmarks, history, and shortcuts.
• Review locally calculated site-usage insights for 7 days, 30 days, or all time.
• Choose a light or dark appearance and add an optional greeting name.

Privacy is part of the product. Pomelo Tab asks before reading browser data. Tabs, bookmarks, history, shortcuts, preferences, and usage insights are processed locally and stored in Chrome on your device. They are not transmitted to the publisher, sold, or used for advertising. Access can be paused and locally stored usage insights can be cleared from Settings.

Pomelo Tab has no account, cloud sync, analytics SDK, advertising, or remotely hosted code.
```

类别（Category）：

```text
Productivity
```

语言（Language）：

```text
English
```

主页网址（Homepage URL，如有）：

```text
https://github.com/Archerry/Pomelo_tab_google
```

支持网址（Support URL，如有）：

```text
https://github.com/Archerry/Pomelo_tab_google/issues
```

### 2.2 简体中文本地化

在商品详情中添加 **简体中文 / Chinese (Simplified)** 本地化。

名称：

```text
Pomelo Tab
```

简短说明：

```text
把每个新标签页变成清爽的浏览器工作台，集中管理标签、书签、历史、快捷入口与本地使用统计。
```

详细说明：

```text
Pomelo Tab 将 Chrome 新标签页变成一个专注、清爽的浏览器工作台。

日常使用的信息都集中在一个页面：

• 按站点整理已打开的标签页，并可打开、切换或关闭标签页；
• 直接查找书签和近期浏览历史；
• 添加最多 8 个 Quick Access 快捷入口，并展示简洁的站点图标；
• 使用 Google 搜索、直接输入网址，或统一搜索标签页、书签、历史与快捷入口；
• 查看在本机计算的 7 天、30 天或全部站点使用统计；
• 切换浅色或深色外观，并可设置问候语中显示的名称。

隐私是产品体验的一部分。Pomelo Tab 会在读取浏览器数据前征得同意。标签页、书签、历史、快捷入口、偏好和使用统计只在本机处理，并保存在本设备的 Chrome 存储中，不会传输给发布者、出售或用于广告。你可以随时在设置中暂停访问，并清除本地使用统计。

Pomelo Tab 不需要账号，不提供云同步，不包含分析 SDK、广告或远程托管代码。
```

类别选择 **生产力工具 / Productivity**。

### 2.3 图片素材

依次上传：

1. 商店图标：`release/store-listing/assets/icon-128.png`
2. 截图 1：`01-privacy-onboarding.png`
3. 截图 2：`02-open-tabs.png`
4. 截图 3：`03-bookmarks-history.png`
5. 截图 4：`04-insights.png`
6. 小型宣传图（Small promo tile）：`promo-small-440x280.png`
7. 大型宣传图（Marquee promo tile，可选）：`promo-marquee-1400x560.png`

不填写 YouTube 视频，不勾选成熟内容。

## 3. 隐私权规范（Privacy practices）

### 3.1 单一用途（Single purpose）

```text
Pomelo Tab replaces Chrome's new-tab page with a local browser workspace for managing open tabs, bookmarks, recent history, shortcuts, search, and on-device site-usage insights.
```

### 3.2 权限理由（Permission justifications）

`storage`：

```text
Stores the user's theme, optional greeting name, Quick Access shortcuts, privacy-consent choice, and aggregated site-usage insights locally in Chrome storage. Pomelo Tab has no external database or cloud sync.
```

`tabs`：

```text
Lists open tabs so the user can view, focus, open, and close them from the new-tab workspace. It also reads the active tab's URL to aggregate time by domain locally after the user grants consent.
```

`favicon`：

```text
Uses Chrome's built-in favicon API to show recognizable website icons beside tabs, bookmarks, history entries, and shortcuts. It does not contact a third-party favicon service.
```

`bookmarks`：

```text
Reads bookmark titles and URLs so the user can search, view, and open bookmarks from the new-tab workspace.
```

`history`：

```text
Reads recent history titles, URLs, and visit dates so the user can search, view, and reopen recent pages from the new-tab workspace.
```

`alarms`：

```text
Runs a once-per-minute local task that records the active website domain in on-device usage aggregates. The task exits before reading browser state unless the user has granted consent.
```

### 3.3 远程代码（Remote code）

选择：

```text
No
```

如果出现说明框，粘贴：

```text
Pomelo Tab does not use or execute remotely hosted code. All executable JavaScript is included in the uploaded extension package.
```

### 3.4 用户数据类别（User data）

勾选：

- **Personally identifiable information / 个人身份信息**：用户可以在本机问候语中输入可选名称。
- **Web history / 网络历史记录**：扩展处理书签、历史记录、标签页 URL 和当前活动域名。

不要勾选：

- Health information
- Financial and payment information
- Authentication information
- Personal communications
- Location
- Website content
- User activity（Pomelo Tab 不记录点击、滚动、按键或鼠标位置）

如果你看到的 **User activity** 说明明确把“当前网站停留时长”归入这一类，则保守地勾选，并使用以下说明：

```text
Pomelo Tab records only the active website domain and elapsed time in local Chrome storage to provide on-device usage insights. It does not record clicks, scrolling, keystrokes, mouse position, or page content, and it does not transmit this data.
```

### 3.5 数据用途认证

对以下声明全部确认或勾选：

- 数据只用于已披露的单一用途；
- 不出售或向第三方传输用户数据；
- 不用于个性化广告；
- 不用于信用评估或借贷；
- 不用于与扩展单一用途无关的目的；
- 发布者和其他人员不会读取用户数据，因为数据只在设备本地处理；
- 对 Chrome API 数据的使用符合 Limited Use 要求。

### 3.6 隐私政策网址

复制粘贴：

```text
https://archerry.github.io/Pomelo_tab_google/privacy.html
```

## 4. 测试说明（Test instructions，如后台要求）

账号或测试凭据：

```text
No account or test credentials are required.
```

审核步骤：

```text
Open a new Chrome tab after installing Pomelo Tab. On first run, review the browser-data disclosure and select "Enable Pomelo Tab". The Open Tabs, Bookmarks, History, and Insights views will then become available. Open Settings to pause browser-data access or clear locally stored usage insights. All browser data is processed locally and is not transmitted.
```

## 5. 发布者与支持信息

支持邮箱（Support email）必须填写你在 Chrome Web Store 开发者账号中能够收信并完成验证的邮箱。不要把邮箱提交到项目源码；只填写在 Google 后台。

支持网址：

```text
https://github.com/Archerry/Pomelo_tab_google/issues
```

## 6. 发布范围（Distribution）

- 可见性：`Public`
- 地区：`All regions`
- 定价：`Free`
- 应用内购买：`No`
- 成熟内容：`No`

如果后台询问交易者身份（Trader status），必须根据你的真实主体情况选择，不能由项目代码代填。

## 7. 提交前检查

1. 在无痕窗口打开隐私政策 URL，确认无需登录。
2. 在 **Preview / 预览** 中分别检查英文和简体中文商品详情。
3. 确认所有隐私权和权限字段已保存，没有黄色或红色警告。
4. 确认支持邮箱已经验证。
5. 确认上传的软件包是本项目 `release/pomelo-tab-v1.0.0.zip` 的最新版本。
6. 点击 **Submit for review / 提交审核**。

提交审核会正式把当前版本发送给 Google。执行最后一步前，建议再次确认页面显示的版本号为 `1.0.0`。
