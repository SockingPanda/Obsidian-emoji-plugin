# Obsidian Emoji 插件

[查看更新日志（CHANGELOG）](./CHANGELOG.md)

## 插件简介

Obsidian Emoji 插件的原始版本旨在为用户在 Markdown 文档中快速插入和管理表情包提供简便工具。插件通过自定义的 UI 选择器，让用户从指定文件夹中选择表情并将其插入到文档中。

## 安装指南

### 手动安装
1. 克隆对应版本仓库，或者直接下载压缩包
2. 将文件夹放置在 Obsidian 的插件目录中：
```
.obsidian/plugins/emoji-plugin
```
3. 启动 Obsidian，再设置中启用该第三方插件

## 主要功能与结构

### 1. 表情包文件夹路径
- **默认路径**：插件使用默认路径 `表情包` 作为存储表情文件的位置。
- **功能说明**：用户可以将表情图片放置在此文件夹中，插件会自动加载文件夹中的所有图片作为可插入表情。

### 2. 表情选择器（EmojiModal）
- **表情选择**：当用户打开表情选择器时，会看到所有表情的网格视图。
- **搜索功能**：提供搜索输入框，用户可以通过输入关键字来筛选表情。
- **点击插入**：点击某个表情时，会将表情以 `![[表情路径]]` 的形式插入到当前 Markdown 文件中。

### 3. 表情选择器的键盘交互
- **键盘导航**：在表情选择器中，用户可以通过方向键（上下左右）和 `Tab` 键在表情之间移动，使用 `Enter` 键选择当前选中的表情。
- **选中状态**：表情选中时会使用视觉上的背景变化（蓝色）来突出显示当前选中表情。

### 4. 插件设置（EmojiSettingTab）
- **文件夹路径设置**：插件提供设置界面，用户可以修改表情包的存储路径。
- **文件夹路径自动补全**：用户在输入表情包文件夹路径时，插件会显示匹配的已有文件夹以供选择。

### 5. 插件的命令
- **打开表情选择器**：插件注册了一个命令，用户可以通过快捷键（默认 `Ctrl + E`）或者命令面板来快速打开表情选择器，方便在编写 Markdown 文档时快速插入表情。

