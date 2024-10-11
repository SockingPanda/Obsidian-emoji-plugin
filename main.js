// 导入 Obsidian 的相关模块
const { Plugin, Modal, PluginSettingTab, Setting, MarkdownView } = require('obsidian');

// 默认设置
const DEFAULT_SETTINGS = {
	emojiFolderPath: '表情包'  // 默认表情包文件夹路径
};


class EmojiModal extends Modal {
    constructor(app, emojis, onSelect, emojiFolderPath) {
        super(app);
        this.emojis = emojis;
        this.onSelect = onSelect;
        this.path = emojiFolderPath;
        this.filteredEmojis = emojis;
        this.selectedIdx = -1;  // 初始化选中索引
    }

    onOpen() {
        const { contentEl } = this;

        // 清空内容并添加搜索框
        contentEl.empty();
        const searchInput = contentEl.createEl('input', {
            type: 'text',
            placeholder: '搜索表情...',
            cls: 'emoji-search-input'
        });

        // 输入搜索时过滤表情包
        searchInput.addEventListener('input', (e) => this.filterEmojis(e.target.value));

        // 创建网格布局的容器
        const gridContainer = contentEl.createEl('div', { cls: 'emoji-grid' });
        this.gridContainer = gridContainer;
        this.renderEmojis();

        // 焦点回到搜索框
        searchInput.focus();
        // 添加键盘事件监听
        searchInput.addEventListener('keydown', (e) => this.handleKeydown(e, searchInput));
    }

    filterEmojis(query) {
        this.filteredEmojis = this.emojis.filter(emoji => emoji.toLowerCase().includes(query.toLowerCase()));
        this.renderEmojis();  // 重新渲染表情包列表
		this.selectedIdx = 0;  // 重置选中索引
    }

    renderEmojis() {
        const gridContainer = this.gridContainer;
        gridContainer.empty();  // 清空现有表情显示
        this.filteredEmojis.forEach((emoji, index) => {
            const emojiContainer = gridContainer.createEl('div', { cls: 'emoji-item', tabIndex: -1 });
            const fullPath = this.app.vault.getAbstractFileByPath(${this.path}/${emoji});
            if (fullPath) {
                const imgPath = this.app.vault.getResourcePath(fullPath);
                const img = emojiContainer.createEl('img', {
                    attr: {
                        src: imgPath,
                        alt: emoji
                    }
                });
                img.addEventListener('click', () => {
                    this.onSelect(emoji);
                    this.close();
                });
            }
            if (index === this.selectedIdx) {  // 根据选中索引设置焦点
                emojiContainer.focus();
            }
        });
    }

    handleKeydown(e) {
        e.stopPropagation();  // 阻止事件冒泡

		let focusableItems = Array.from(this.gridContainer.children);  // Collecting all focusable items

        // 判断焦点是否在输入框
        let focusOnInput = (document.activeElement === this.searchInput);

        if (focusOnInput) {
            if (e.key === "Tab") {
                e.preventDefault(); // 阻止默认 Tab 行为
                // 焦点移到表情网格的第一个表情
                if (focusableItems.length > 0) {
                    this.selectedIdx = 0;
                    focusableItems[this.selectedIdx].focus();
                    this.updateSelection();
                }
            } else {
                // 在输入框中，其他按键默认处理（允许输入搜索关键字）
                return;
            }
        } else {
            // 焦点不在输入框时
            if (["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
                e.preventDefault(); // 阻止默认行为

                switch (e.key) {
                    case "Tab":
                        // Tab 键在表情间循环
                        this.selectedIdx = (this.selectedIdx + 1) % focusableItems.length;
                        focusableItems[this.selectedIdx].focus();
                        this.updateSelection();
                        break;
                    case "Enter":
                        // 选择当前表情
                        this.onSelect(this.filteredEmojis[this.selectedIdx]);
                        this.close();
                        break;
                    case "ArrowRight":
                        // 向右移动
                        this.moveSelection(1);
                        break;
                    case "ArrowLeft":
                        // 向左移动
                        this.moveSelection(-1);
                        break;
                    case "ArrowDown":
                        // 向下移动（假设每行有 5 个表情）
                        this.moveSelection(5);
                        break;
                    case "ArrowUp":
                        // 向上移动
                        this.moveSelection(-5);
                        break;
                }
            } else {
                // 按下其他键时，焦点回到输入框
                this.searchInput.focus();
            }
        }

		this.updateSelection(); // 更新视觉效果

    }

	moveSelection(offset) {
		let focusableItems = Array.from(this.gridContainer.children); 
        this.selectedIdx = (this.selectedIdx + offset + focusableItems.length) % focusableItems.length;
        focusableItems[this.selectedIdx].focus();
        this.updateSelection();
    }

    updateSelection() {
        // 更新选择状态，并确保选中项处于可视区域
        Array.from(this.gridContainer.children).forEach((child, index) => {
            if (index === this.selectedIdx) {
                child.classList.add('selected');  // 为选中项添加样式
                child.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                child.classList.remove('selected');
            }
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


// 设置界面
class EmojiSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// 获取所有文件夹路径
	getAllFolders() {
		const files = this.app.vault.getAllLoadedFiles();
		const folders = new Set();
		files.forEach(file => {
			if (file.parent) {
				folders.add(file.parent.path);
			}
		});
		return Array.from(folders);
	}

	display() {
		let { containerEl } = this;

		// 清空现有设置
		containerEl.empty();

		// 插入标题
		containerEl.createEl('h1', { text: 'Emoji Plugin Settings' });

		// 获取所有文件夹路径
		const folders = this.getAllFolders();

		// 创建表情包文件夹路径的输入框
		new Setting(containerEl)
			.setName('表情包文件夹路径')
			.setDesc('指定表情包文件存储的文件夹路径')
			.addText(text => {
				text
					.setPlaceholder('例如: 表情包')
					.setValue(this.plugin.settings.emojiFolderPath)  // 设置当前值
					.onChange(async (value) => {
						this.plugin.settings.emojiFolderPath = value;
						await this.plugin.saveSettings(); // 保存设置
					});
				
				// 实现自动匹配功能
				text.inputEl.addEventListener('input', (e) => {
					let inputValue = e.target.value.toLowerCase();
					// 清除之前的提示
					let suggestionDiv = containerEl.querySelector('.folder-suggestions');
					if (suggestionDiv) suggestionDiv.remove();

					// 匹配文件夹路径
					let matchingFolders = folders.filter(folder => folder.toLowerCase().includes(inputValue));

					// 如果有匹配项，显示提示
					if (matchingFolders.length > 0 && inputValue.length > 0) {
						suggestionDiv = containerEl.createEl('div', { cls: 'folder-suggestions' });
						matchingFolders.slice(0, 5).forEach(folder => {
							let folderEl = suggestionDiv.createEl('div', { text: folder, cls: 'folder-suggestion-item' });

							// 点击提示项时，自动填充输入框
							folderEl.addEventListener('click', () => {
								text.setValue(folder);
								this.plugin.settings.emojiFolderPath = folder;
								this.plugin.saveSettings(); // 保存设置
								suggestionDiv.remove(); // 移除提示
							});
						});
						containerEl.appendChild(suggestionDiv);
					}
				});
			});
	}
}
module.exports = class EmojiPlugin extends Plugin {
	// 存储表情包使用频率
	emojiUsage = {};
	settings = DEFAULT_SETTINGS;

	// 插件加载时
	async onload() {
		await this.loadSettings(); // 加载插件设置

		// 添加设置界面
		this.addSettingTab(new EmojiSettingTab(this.app, this));
		
		this.addCommand({
			id: 'open-emoji-picker',
			name: 'Open Emoji Picker',
			callback: () => this.showEmojiPicker(),
			hotkeys: [
				{
					modifiers: ["Mod"],
					key: 'e',  // 例如：使用 Ctrl+E 快捷键触发
				}
			]
		});
	}

	// 展示表情包选择框
	showEmojiPicker(editor, query) {
		const allEmojis = this.getAllEmojis(); // 获取所有表情包（可以从某个目录读取）
		let filteredEmojis = this.filterEmojis(allEmojis, query);
		this.sortEmojisByUsage(filteredEmojis);

		// 创建 UI 弹窗展示表情包
		let emojiModal = new EmojiModal(this.app, filteredEmojis, (selectedEmoji) => {
			let activeLeaf = this.app.workspace.activeLeaf;
			if (activeLeaf) {
				let editor = activeLeaf.view instanceof MarkdownView ? activeLeaf.view.editor : null;
				if (editor) {
					// 构建完整的 Markdown 图片链接
					let markdownLink = ![[${this.settings.emojiFolderPath}/${selectedEmoji}]];
					editor.replaceSelection(markdownLink);
					this.updateEmojiUsage(selectedEmoji);
				} else {
					console.log("No active editor found or not a Markdown file.");
				}
			}
		}, this.settings.emojiFolderPath);
		emojiModal.open();
	}

	// 获取所有表情包，使用用户设置的文件夹路径
	getAllEmojis() {
		const files = this.app.vault.getFiles();
		return files.filter(file => file.path.startsWith(this.settings.emojiFolderPath + '/')).map(file => file.name);
	}
	// 过滤表情包名称
	filterEmojis(emojis, query) {
		if (!query) return emojis;
		return emojis.filter(emoji => emoji.toLowerCase().includes(query.toLowerCase()));
	}

	// 按使用频率排序
	sortEmojisByUsage(emojis) {
		emojis.sort((a, b) => (this.emojiUsage[b] || 0) - (this.emojiUsage[a] || 0));
	}

	// 更新表情包使用频率
	updateEmojiUsage(emoji) {
		if (!this.emojiUsage[emoji]) this.emojiUsage[emoji] = 0;
		this.emojiUsage[emoji]++;
	}

	// 加载插件设置
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// 保存插件设置
	async saveSettings() {
		await this.saveData(this.settings);
	}
};