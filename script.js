// Toggle folders in sidebar
function setChevronState(chevron, expanded) {
    if (!chevron) return;
    if (chevron.classList.contains('codicon')) {
        chevron.classList.toggle('codicon-chevron-down', expanded);
        chevron.classList.toggle('codicon-chevron-right', !expanded);
        return;
    }
    chevron.textContent = expanded ? '▼' : '▶';
}

const folderToggles = document.querySelectorAll('.folder-toggle');
folderToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        // Find the next sibling that is folder-content
        let content = toggle.nextElementSibling;
        const chevron = toggle.querySelector('.chevron');
        
        if (content && content.classList.contains('folder-content')) {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                setChevronState(chevron, true);
                chevron.classList.remove('collapsed');
            } else {
                content.style.display = 'none';
                setChevronState(chevron, false);
                chevron.classList.add('collapsed');
            }
        }
    });
});

// File click handling
const files = document.querySelectorAll('.tree-item.file');
const tabsContainer = document.querySelector('.tabs-container');
const editorContents = document.querySelectorAll('.editor-content');
const breadcrumbFile = document.getElementById('editor-breadcrumb') ? document.getElementById('editor-breadcrumb').querySelector('span:last-child') : null;

files.forEach(file => {
    file.addEventListener('click', () => {
        const filename = file.dataset.file;
        if (!filename) return;
        
        // highlight sidebar
        document.querySelectorAll('.tree-item.file').forEach(f => f.classList.remove('selected'));
        file.classList.add('selected');

        openFile(filename);
    });
});

function openFile(filename) {
    // Make tab active or create new if not exists
    let tabs = document.querySelectorAll('.tab');
    let exists = false;

    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.file === filename) {
            tab.classList.add('active');
            exists = true;
        }
    });

    if (!exists && filename) {
        const tabHTML = document.createElement('div');
        tabHTML.className = 'tab active';
        tabHTML.dataset.file = filename;
        tabHTML.innerHTML = `<span class="codicon codicon-file-code tab-icon"></span> ${filename} <span class="codicon codicon-close tab-close"></span>`;
        tabsContainer.appendChild(tabHTML);
        
        // Add close event
        tabHTML.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabHTML);
        });

        // Add click event
        tabHTML.addEventListener('click', () => {
            document.querySelectorAll('.tree-item.file').forEach(f => {
                f.classList.remove('selected');
                if(f.dataset.file === filename) f.classList.add('selected');
            });
            openFile(filename);
        });
    }

    // Show right editor content
    editorContents.forEach(content => {
        if (content.dataset.file === filename) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // Update breadcrumb
    if(breadcrumbFile) {
        breadcrumbFile.textContent = filename;
    }
}

function closeTab(tabElement) {
    const filename = tabElement.dataset.file;
    const isActive = tabElement.classList.contains('active');
    tabElement.remove();

    if (isActive) {
        const remainingTabs = document.querySelectorAll('.tab');
        if (remainingTabs.length > 0) {
            const lastTab = remainingTabs[remainingTabs.length - 1];
            const nextFilename = lastTab.dataset.file;
            document.querySelectorAll('.tree-item.file').forEach(f => {
                f.classList.remove('selected');
                if(f.dataset.file === nextFilename) f.classList.add('selected');
            });
            openFile(nextFilename);
        } else {
            // no tabs open, hide all editors
            editorContents.forEach(content => content.style.display = 'none');
            if(breadcrumbFile) breadcrumbFile.textContent = '';
        }
    }
}

// Bind close event to initial tabs
document.querySelectorAll('.tab-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(e.target.closest('.tab'));
    });
});

// Bind click event to initial tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const filename = tab.dataset.file;
        if (!filename) return;
        document.querySelectorAll('.tree-item.file').forEach(f => {
            f.classList.remove('selected');
            if(f.dataset.file === filename) f.classList.add('selected');
        });
        openFile(filename);
    });
});

// Activity bar Icons
const activityIcons = document.querySelectorAll('.activity-icon[data-view]');
const sidebarHeader = document.querySelector('.sidebar-header');
const sidebarViews = document.querySelectorAll('.sidebar-view');

const viewTitles = {
    'explorer': 'EXPLORER',
    'search': 'SEARCH',
    'scm': 'SOURCE CONTROL',
    'debug': 'RUN AND DEBUG',
    'settings': 'SETTINGS'
};

activityIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const viewName = icon.dataset.view;
        if (!viewName) return;

        const sidebar = document.querySelector('.sidebar');
        const isSidebarHidden = sidebar.classList.contains('sidebar-hidden');
        const isIconActive = icon.classList.contains('active');

        // If clicking the active icon, toggle sidebar
        if (isIconActive) {
            sidebar.classList.toggle('sidebar-hidden');
            icon.classList.toggle('active', !sidebar.classList.contains('sidebar-hidden'));
            return;
        }

        // Otherwise, show the clicked view and make sure sidebar is visible
        sidebar.classList.remove('sidebar-hidden');
        
        // Remove active class from all icons
        document.querySelectorAll('.activity-icon').forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        // Hide all views
        sidebarViews.forEach(view => {
            view.style.display = 'none';
        });

        // Show specific view
        const activeView = document.getElementById('view-' + viewName);
        if (activeView) {
            activeView.style.display = 'block';
        }

        // Update title
        if (sidebarHeader) {
            sidebarHeader.textContent = viewTitles[viewName] || viewName.toUpperCase();
        }
    });
});

// Layout toggles
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const togglePanelBtn = document.getElementById('toggle-panel-btn');

if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('sidebar-hidden');
        
        // Update activity bar active state
        const activeIcon = document.querySelector('.activity-icon.active');
        if (sidebar.classList.contains('sidebar-hidden')) {
            if (activeIcon) activeIcon.classList.remove('active');
        } else {
            // Re-activate the last active view if possible, or explorer by default
            const explorerIcon = document.querySelector('.activity-icon[data-view="explorer"]');
            if (explorerIcon) explorerIcon.classList.add('active');
        }
    });
}

if (togglePanelBtn) {
    togglePanelBtn.addEventListener('click', () => {
        const panel = document.querySelector('.terminal-panel');
        panel.classList.toggle('panel-hidden');
    });
}

// Menu bar - VS Code style: click to open, hover to switch
const menuItems = document.querySelectorAll('.window-menu .menu-item');
const dropdownMenus = document.querySelectorAll('.dropdown-menu');
let menuBarOpen = false;

function closeAllMenus() {
    dropdownMenus.forEach(menu => menu.style.display = 'none');
    menuItems.forEach(mi => mi.classList.remove('menu-active'));
    menuBarOpen = false;
}

function openMenu(item) {
    const menuName = item.dataset.menu;
    const dropdown = document.getElementById(menuName + '-menu');
    if (!dropdown) return;
    dropdownMenus.forEach(menu => menu.style.display = 'none');
    menuItems.forEach(mi => mi.classList.remove('menu-active'));
    dropdown.style.display = 'block';
    const rect = item.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    item.classList.add('menu-active');
    menuBarOpen = true;
}

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menuBarOpen && item.classList.contains('menu-active')) {
            closeAllMenus();
        } else {
            openMenu(item);
        }
    });
    item.addEventListener('mouseenter', () => {
        if (menuBarOpen) openMenu(item);
    });
});

// Hide dropdowns when clicking outside
document.addEventListener('click', () => {
    closeAllMenus();
});

// Dropdown menu items
const dropdownItems = document.querySelectorAll('.dropdown-menu .menu-item');
dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.textContent.split(' ')[0].toLowerCase(); // Get first word as action
        
        // Hide dropdown after click
        closeAllMenus();
        
        // Handle different menu actions
        switch(action) {
            case 'new':
                if (item.textContent.includes('File')) {
                    alert('Creating new file... (Ctrl+N)');
                } else if (item.textContent.includes('Window')) {
                    alert('Opening new window... (Ctrl+Shift+N)');
                }
                break;
            case 'open':
                if (item.textContent.includes('File')) {
                    alert('Opening file dialog... (Ctrl+O)');
                } else if (item.textContent.includes('Folder')) {
                    alert('Opening folder dialog... (Ctrl+K Ctrl+O)');
                }
                break;
            case 'save':
                if (item.textContent.includes('All')) {
                    alert('Saving all files... (Ctrl+K S)');
                } else {
                    alert('Saving file... (Ctrl+S)');
                }
                break;
            case 'exit':
                if (confirm('Exit VS Code?')) {
                    window.close();
                }
                break;
            case 'undo':
                alert('Undoing last action... (Ctrl+Z)');
                break;
            case 'redo':
                alert('Redoing last action... (Ctrl+Y)');
                break;
            case 'cut':
                alert('Cutting selection... (Ctrl+X)');
                break;
            case 'copy':
                alert('Copying selection... (Ctrl+C)');
                break;
            case 'paste':
                alert('Pasting from clipboard... (Ctrl+V)');
                break;
            case 'find':
                alert('Opening find dialog... (Ctrl+F)');
                break;
            case 'replace':
                alert('Opening replace dialog... (Ctrl+H)');
                break;
            case 'select':
                alert('Selecting all... (Ctrl+A)');
                break;
            case 'expand':
                alert('Expanding selection... (Shift+Alt+Right)');
                break;
            case 'shrink':
                alert('Shrinking selection... (Shift+Alt+Left)');
                break;
            case 'copy':
                if (item.textContent.includes('Up')) {
                    alert('Copying line up... (Shift+Alt+Up)');
                } else if (item.textContent.includes('Down')) {
                    alert('Copying line down... (Shift+Alt+Down)');
                }
                break;
            case 'move':
                if (item.textContent.includes('Up')) {
                    alert('Moving line up... (Alt+Up)');
                } else if (item.textContent.includes('Down')) {
                    alert('Moving line down... (Alt+Down)');
                }
                break;
            case 'command':
                alert('Opening command palette... (Ctrl+Shift+P)');
                break;
            case 'open':
                alert('Opening view...');
                break;
            case 'explorer':
                document.querySelector('[data-view="explorer"]').click();
                break;
            case 'search':
                document.querySelector('[data-view="search"]').click();
                break;
            case 'source':
                document.querySelector('[data-view="scm"]').click();
                break;
            case 'run':
                document.querySelector('[data-view="debug"]').click();
                break;

            case 'terminal':
                alert('Opening terminal... (Ctrl+`)');
                break;
            case 'problems':
                alert('Showing problems panel... (Ctrl+Shift+M)');
                break;
            case 'output':
                alert('Showing output panel... (Ctrl+Shift+U)');
                break;
            case 'back':
                alert('Going back... (Alt+Left)');
                break;
            case 'forward':
                alert('Going forward... (Alt+Right)');
                break;
            case 'go':
                if (item.textContent.includes('File')) {
                    alert('Opening go to file... (Ctrl+P)');
                } else if (item.textContent.includes('Symbol')) {
                    alert('Opening go to symbol... (Ctrl+Shift+O)');
                } else if (item.textContent.includes('Line')) {
                    alert('Opening go to line... (Ctrl+G)');
                }
                break;
            case 'next':
                alert('Switching to next editor... (Ctrl+PageDown)');
                break;
            case 'previous':
                alert('Switching to previous editor... (Ctrl+PageUp)');
                break;
            case 'start':
                document.querySelector('#view-debug button').click();
                break;
            case 'run':
                if (item.textContent.includes('Without')) {
                    alert('Running without debugging... (Ctrl+F5)');
                }
                break;
            case 'stop':
                alert('Stopping debug session... (Shift+F5)');
                break;
            case 'open':
                if (item.textContent.includes('Configurations')) {
                    alert('Opening debug configurations...');
                }
                break;
            case 'add':
                alert('Adding debug configuration...');
                break;
            case 'new':
                if (item.textContent.includes('Terminal')) {
                    alert('Creating new terminal... (Ctrl+Shift+`)');
                }
                break;
            case 'split':
                alert('Splitting terminal... (Ctrl+Shift+5)');
                break;
            case 'run':
                if (item.textContent.includes('Task')) {
                    alert('Running task...');
                }
                break;
            case 'configure':
                alert('Configuring tasks...');
                break;
            case 'clear':
                alert('Clearing terminal...');
                break;
            case 'welcome':
                alert('Opening welcome page...');
                break;
            case 'show':
                alert('Showing all commands... (Ctrl+Shift+P)');
                break;
            case 'documentation':
                alert('Opening documentation...');
                break;
            case 'release':
                alert('Opening release notes...');
                break;
            case 'keyboard':
                alert('Opening keyboard shortcuts... (Ctrl+K Ctrl+S)');
                break;
            case 'about':
                alert('Showing about dialog...');
                break;
            default:
                alert(`Action: ${item.textContent.trim()}`);
        }
    });
});

// Search functionality
const searchInput = document.querySelector('#view-search input:first-child');
const replaceInput = document.querySelector('#view-search input:nth-child(2)');
const searchResults = document.querySelector('#view-search div:last-child');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        if (query.length > 0) {
            searchResults.textContent = `Searching for "${query}"... Found 3 matches in 2 files.`;
        } else {
            searchResults.textContent = 'Search details will appear here. No results found.';
        }
    });
}

// SCM functionality
const commitInput = document.querySelector('#view-scm input');
const commitBtn = document.querySelector('#view-scm button');
const changesHeader = document.querySelector('#view-scm div:nth-child(3)');
const changesList = document.querySelector('#view-scm div:nth-child(4)');

if (commitBtn) {
    commitBtn.addEventListener('click', () => {
        const message = commitInput.value;
        if (message.trim()) {
            alert(`Committed with message: "${message}"`);
            commitInput.value = '';
        } else {
            alert('Please enter a commit message');
        }
    });
}

if (changesHeader) {
    changesHeader.addEventListener('click', () => {
        const chevron = changesHeader.querySelector('.chevron');
        if (changesList.style.display === 'none') {
            changesList.style.display = 'flex';
            setChevronState(chevron, true);
        } else {
            changesList.style.display = 'none';
            setChevronState(chevron, false);
        }
    });
}

// Debug functionality
const runBtn = document.querySelector('#view-debug button');
if (runBtn) {
    runBtn.addEventListener('click', () => {
        alert('Starting debug session...');
    });
}

// Extensions functionality
const extSearchInput = document.querySelector('#view-extensions input');
if (extSearchInput) {
    extSearchInput.addEventListener('input', () => {
        const query = extSearchInput.value;
        if (query.length > 0) {
            alert(`Searching for extensions: "${query}"`);
        }
    });
}

// Settings functionality
const themeSelect = document.querySelector('#view-settings select:first-of-type');
const fontSizeInput = document.querySelector('#view-settings input');
const wordWrapSelect = document.querySelector('#view-settings select:last-of-type');

if (themeSelect) {
    themeSelect.addEventListener('change', () => {
        alert(`Theme changed to: ${themeSelect.value}`);
    });
}

if (fontSizeInput) {
    fontSizeInput.addEventListener('change', () => {
        alert(`Font size changed to: ${fontSizeInput.value}px`);
    });
}

if (wordWrapSelect) {
    wordWrapSelect.addEventListener('change', () => {
        alert(`Word wrap set to: ${wordWrapSelect.value}`);
    });
}

// Terminal tabs
const terminalTabs = document.querySelectorAll('.terminal-header > span:not(.terminal-actions)');
terminalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.terminal-header > span:not(.terminal-actions)').forEach(t => t.classList.remove('terminal-tab-active'));
        tab.classList.add('terminal-tab-active');
    });
});

// Theme switching
const themeToggle = document.getElementById('theme-toggle');
const themePicker = document.getElementById('theme-picker');
const themeItems = document.querySelectorAll('.theme-item');
const themeOrder = ['vs-dark', 'vs-light', 'hc-black'];
let currentTheme = 'vs-dark';

function labelForTheme(theme) {
    switch (theme) {
        case 'vs-light': return 'Light';
        case 'hc-black': return 'High Contrast';
        default: return 'Dark';
    }
}

function applyThemeToRoot(theme) {
    const root = document.documentElement;

    if (theme === 'vs-light') {
        root.style.setProperty('--vscode-editor-background', '#ffffff');
        root.style.setProperty('--vscode-editor-foreground', '#000000');
        root.style.setProperty('--vscode-activityBar-background', '#f3f3f3');
        root.style.setProperty('--vscode-activityBar-foreground', '#000000');
        root.style.setProperty('--vscode-activityBar-activeBorder', '#007acc');
        root.style.setProperty('--vscode-sideBar-background', '#f3f3f3');
        root.style.setProperty('--vscode-statusBar-background', '#007acc');
        root.style.setProperty('--vscode-statusBar-foreground', '#ffffff');
        root.style.setProperty('--vscode-titleBar-activeBackground', '#dddddd');
        root.style.setProperty('--vscode-titleBar-activeForeground', '#000000');
        root.style.setProperty('--vscode-tab-activeBackground', '#ffffff');
        root.style.setProperty('--vscode-tab-inactiveBackground', '#f3f3f3');
        root.style.setProperty('--vscode-panel-background', '#ffffff');
        root.style.setProperty('--vscode-panel-border', '#e0e0e0');
    } else if (theme === 'hc-black') {
        root.style.setProperty('--vscode-editor-background', '#000000');
        root.style.setProperty('--vscode-editor-foreground', '#ffffff');
        root.style.setProperty('--vscode-activityBar-background', '#000000');
        root.style.setProperty('--vscode-activityBar-foreground', '#ffffff');
        root.style.setProperty('--vscode-activityBar-activeBorder', '#ffff00');
        root.style.setProperty('--vscode-sideBar-background', '#000000');
        root.style.setProperty('--vscode-statusBar-background', '#ffffff');
        root.style.setProperty('--vscode-statusBar-foreground', '#000000');
        root.style.setProperty('--vscode-titleBar-activeBackground', '#000000');
        root.style.setProperty('--vscode-titleBar-activeForeground', '#ffffff');
        root.style.setProperty('--vscode-tab-activeBackground', '#000000');
        root.style.setProperty('--vscode-tab-inactiveBackground', '#111111');
        root.style.setProperty('--vscode-panel-background', '#000000');
        root.style.setProperty('--vscode-panel-border', '#444444');
    } else {
        // default: vs-dark
        root.style.setProperty('--vscode-editor-background', '#1f1f1f');
        root.style.setProperty('--vscode-editor-foreground', '#cccccc');
        root.style.setProperty('--vscode-activityBar-background', '#181818');
        root.style.setProperty('--vscode-activityBar-foreground', '#858585');
        root.style.setProperty('--vscode-activityBar-activeBorder', '#0078d4');
        root.style.setProperty('--vscode-sideBar-background', '#181818');
        root.style.setProperty('--vscode-statusBar-background', '#181818');
        root.style.setProperty('--vscode-statusBar-foreground', '#ffffff');
        root.style.setProperty('--vscode-titleBar-activeBackground', '#181818');
        root.style.setProperty('--vscode-titleBar-activeForeground', '#cccccc');
        root.style.setProperty('--vscode-tab-activeBackground', '#1f1f1f');
        root.style.setProperty('--vscode-tab-inactiveBackground', '#181818');
        root.style.setProperty('--vscode-panel-background', '#1f1f1f');
        root.style.setProperty('--vscode-panel-border', '#2b2b2b');
    }
}

function switchTheme(theme) {
    currentTheme = themeOrder.includes(theme) ? theme : 'vs-dark';
    const monacoEditor = window.editor || window.monacoEditor;
    if (monacoEditor && window.monaco?.editor?.setTheme) {
        window.monaco.editor.setTheme(currentTheme);
    }

    applyThemeToRoot(currentTheme);
    themeItems.forEach(item => {
        item.classList.toggle('active', item.dataset.theme === currentTheme);
    });

    if (themeToggle) {
        themeToggle.textContent = `Theme · ${labelForTheme(currentTheme)}`;
    }

    try {
        localStorage.setItem('vscode-ui-theme', currentTheme);
    } catch (err) {
        // ignore storage errors (private mode)
    }
}

if (themeToggle && themePicker) {
    // Left click cycles through themes quickly
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = themeOrder.indexOf(currentTheme);
        const next = themeOrder[(idx + 1) % themeOrder.length];
        switchTheme(next);
    });

    // Right-click (or long press on touch) opens the picker for manual choice
    themeToggle.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        themePicker.style.display = themePicker.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!themePicker.contains(event.target) && event.target !== themeToggle) {
            themePicker.style.display = 'none';
        }
    });
}

if (themeItems.length) {
    themeItems.forEach(item => {
        item.addEventListener('click', () => {
            const theme = item.dataset.theme;
            switchTheme(theme);
            if (themePicker) {
                themePicker.style.display = 'none';
            }
        });
    });

    const savedTheme = (() => {
        try {
            return localStorage.getItem('vscode-ui-theme');
        } catch (err) {
            return null;
        }
    })();
    switchTheme(savedTheme || 'vs-dark');
}

// VS Code Style Editor Logic
const codeInput = document.querySelector('.code-input-area');
const gutter = document.querySelector('.editor-gutter');
const codePreview = document.getElementById('code-preview-text');
const suggestionBox = document.querySelector('.code-suggestions');

function updateEditor() {
    if (!codeInput || !gutter) return;
    
    // Update Line Numbers
    const text = codeInput.innerText || codeInput.textContent;
    const lines = text.split(/\r?\n/);
    
    let gutterHTML = '';
    for (let i = 1; i <= lines.length; i++) {
        gutterHTML += `<div class="line-number">${i}</div>`;
    }
    gutter.innerHTML = gutterHTML;

    // Update Preview with Syntax Highlighting
    if (codePreview) {
        if (!text.trim()) {
            codePreview.innerHTML = '<span class="hljs-comment">// start typing to see content</span>';
        } else {
            codePreview.innerHTML = highlightCode(text);
        }
    }
}

function highlightCode(code) {
    // Simple HTML/JS Highlighting
    return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Keywords
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends|new|this)\b/g, '<span class="hljs-keyword">$1</span>')
        // Strings
        .replace(/(['"`])(.*?)\1/g, '<span class="hljs-string">$1$2$1</span>')
        // Tags
        .replace(/(&lt;\/?[\w\s="'-]+&gt;)/g, '<span class="pink">$1</span>')
        // Comments
        .replace(/(\/\/.*)/g, '<span class="hljs-comment">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="hljs-number">$1</span>');
}

if (codeInput) {
    codeInput.addEventListener('input', () => {
        updateEditor();
        renderSuggestions(currentToken());
    });

    codeInput.addEventListener('keydown', (e) => {
        // Handle Tab key
        if (e.key === 'Tab' && (!suggestionBox || suggestionBox.hidden)) {
            e.preventDefault();
            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const tabNode = document.createTextNode('    ');
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            sel.removeAllRanges();
            sel.addRange(range);
            updateEditor();
        }
        
        // Suggestion navigation
        if (suggestionBox && !suggestionBox.hidden) {
            const items = suggestionBox.querySelectorAll('.code-suggestion-item');
            if (items.length) {
                if (e.key === 'ArrowDown') {
                    suggestionIndex = (suggestionIndex + 1) % items.length;
                    setActiveSuggestion(items);
                    e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                    suggestionIndex = (suggestionIndex - 1 + items.length) % items.length;
                    setActiveSuggestion(items);
                    e.preventDefault();
                } else if (e.key === 'Enter') {
                    const chosen = items[suggestionIndex];
                    if (chosen) {
                        insertSnippet(chosen.dataset.insert || chosen.textContent);
                        e.preventDefault();
                    }
                } else if (e.key === 'Escape') {
                    suggestionBox.hidden = true;
                }
            }
        }
    });

    // Initial call
    updateEditor();
}

// Suggestions (keep existing list but update logic for positioning)
const snippetList = [
    { label: '<h1></h1>', insert: '<h1></h1>', hint: 'Heading' },
    { label: '<h2></h2>', insert: '<h2></h2>', hint: 'Sub-heading' },
    { label: '<a href=""></a>', insert: '<a href=""></a>', hint: 'Link' },
    { label: 'href=""', insert: 'href=""', hint: 'Attribute' },
    { label: '<div class=""></div>', insert: '<div class=""></div>', hint: 'Container' },
    { label: '<section></section>', insert: '<section></section>', hint: 'Section' },
    { label: '<p></p>', insert: '<p></p>', hint: 'Paragraph' },
    { label: '<button></button>', insert: '<button></button>', hint: 'Button' }
];

let suggestionIndex = -1;

function currentToken() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return '';
    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(codeInput);
    preRange.setEnd(range.endContainer, range.endOffset);
    const text = preRange.toString();
    const match = text.match(/([<]?[\w-]*)$/);
    return match ? match[1] : '';
}

function renderSuggestions(token = '') {
    if (!suggestionBox) return;
    const normalized = (token || '').toLowerCase();
    if (!normalized || (normalized === '<' && token !== '<')) {
        suggestionBox.hidden = true;
        return;
    }

    const matches = snippetList.filter(s => 
        s.label.toLowerCase().includes(normalized) || 
        s.hint.toLowerCase().includes(normalized)
    ).slice(0, 6);

    if (!matches.length) {
        suggestionBox.hidden = true;
        return;
    }

    suggestionBox.innerHTML = matches.map((s, i) => `
        <div class="code-suggestion-item ${i === 0 ? 'active' : ''}" data-insert="${s.insert.replace(/"/g, '&quot;')}">
            <span>${s.label.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
            <span style="opacity: 0.5; font-size: 10px;">${s.hint}</span>
        </div>
    `).join('');

    suggestionIndex = 0;
    suggestionBox.hidden = false;

    // Position suggestion box near cursor
    const sel = window.getSelection();
    if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const parentRect = codeInput.getBoundingClientRect();
        suggestionBox.style.top = (rect.bottom - parentRect.top + 5) + 'px';
        suggestionBox.style.left = (rect.left - parentRect.left) + 'px';
    }

    // Add click events to new items
    suggestionBox.querySelectorAll('.code-suggestion-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            insertSnippet(item.dataset.insert);
        });
    });
}

function setActiveSuggestion(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === suggestionIndex);
    });
}

function insertSnippet(text) {
    if (!codeInput) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    
    // Find token to replace
    const token = currentToken();
    if (token) {
        // Move start back by token length
        range.setStart(range.endContainer, range.endOffset - token.length);
    }
    
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
    
    suggestionBox.hidden = true;
    updateEditor();
}

// Initial Setup
const initialActiveFile = document.querySelector('.tab.active');
if (initialActiveFile) {
    openFile(initialActiveFile.dataset.file);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl key combinations
    if (e.ctrlKey) {
        switch(e.key) {
            case 'n':
                if (e.shiftKey) {
                    alert('New Window (Ctrl+Shift+N)');
                } else {
                    alert('New File (Ctrl+N)');
                }
                e.preventDefault();
                break;
            case 'o':
                alert('Open File (Ctrl+O)');
                e.preventDefault();
                break;
            case 's':
                if (e.shiftKey) {
                    alert('Save As (Ctrl+Shift+S)');
                } else {
                    alert('Save (Ctrl+S)');
                }
                e.preventDefault();
                break;
            case 'z':
                alert('Undo (Ctrl+Z)');
                e.preventDefault();
                break;
            case 'y':
                alert('Redo (Ctrl+Y)');
                e.preventDefault();
                break;
            case 'x':
                alert('Cut (Ctrl+X)');
                e.preventDefault();
                break;
            case 'c':
                alert('Copy (Ctrl+C)');
                e.preventDefault();
                break;
            case 'v':
                alert('Paste (Ctrl+V)');
                e.preventDefault();
                break;
            case 'f':
                if (e.shiftKey) {
                    document.querySelector('[data-view="search"]').click();
                    alert('Search (Ctrl+Shift+F)');
                } else {
                    alert('Find (Ctrl+F)');
                }
                e.preventDefault();
                break;
            case 'h':
                alert('Replace (Ctrl+H)');
                e.preventDefault();
                break;
            case 'a':
                alert('Select All (Ctrl+A)');
                e.preventDefault();
                break;
            case 'p':
                if (e.shiftKey) {
                    alert('Command Palette (Ctrl+Shift+P)');
                } else {
                    alert('Go to File (Ctrl+P)');
                }
                e.preventDefault();
                break;
            case 'g':
                if (e.shiftKey) {
                    document.querySelector('[data-view="scm"]').click();
                    alert('Source Control (Ctrl+Shift+G)');
                } else {
                    alert('Go to Line (Ctrl+G)');
                }
                e.preventDefault();
                break;
            case 'd':
                if (e.shiftKey) {
                    document.querySelector('[data-view="debug"]').click();
                    alert('Debug (Ctrl+Shift+D)');
                }
                e.preventDefault();
                break;

            case 'e':
                if (e.shiftKey) {
                    document.querySelector('[data-view="explorer"]').click();
                    alert('Explorer (Ctrl+Shift+E)');
                }
                e.preventDefault();
                break;
            case 'm':
                if (e.shiftKey) {
                    alert('Problems (Ctrl+Shift+M)');
                }
                e.preventDefault();
                break;
            case 'u':
                if (e.shiftKey) {
                    alert('Output (Ctrl+Shift+U)');
                }
                e.preventDefault();
                break;
            case 'k':
                // Handle Ctrl+K combinations
                document.addEventListener('keydown', function handler(e2) {
                    if (e2.ctrlKey && e2.key === 'o') {
                        alert('Open Folder (Ctrl+K Ctrl+O)');
                        e2.preventDefault();
                    } else if (e2.ctrlKey && e2.key === 's') {
                        alert('Save All (Ctrl+K S)');
                        e2.preventDefault();
                    }
                    document.removeEventListener('keydown', handler);
                });
                e.preventDefault();
                break;
        }
    }
    
    // Alt key combinations
    if (e.altKey) {
        switch(e.key) {
            case 'ArrowLeft':
                alert('Go Back (Alt+Left)');
                e.preventDefault();
                break;
            case 'ArrowRight':
                alert('Go Forward (Alt+Right)');
                e.preventDefault();
                break;
        }
    }
    
    // F keys
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch(e.key) {
            case 'F5':
                document.querySelector('#view-debug button').click();
                e.preventDefault();
                break;
        }
    }
    
    // Shift+Alt combinations
    if (e.shiftKey && e.altKey) {
        switch(e.key) {
            case 'ArrowUp':
                alert('Copy Line Up (Shift+Alt+Up)');
                e.preventDefault();
                break;
            case 'ArrowDown':
                alert('Copy Line Down (Shift+Alt+Down)');
                e.preventDefault();
                break;
            case 'ArrowLeft':
                alert('Shrink Selection (Shift+Alt+Left)');
                e.preventDefault();
                break;
            case 'ArrowRight':
                alert('Expand Selection (Shift+Alt+Right)');
                e.preventDefault();
                break;
        }
    }
    
    // Alt combinations
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch(e.key) {
            case 'ArrowUp':
                alert('Move Line Up (Alt+Up)');
                e.preventDefault();
                break;
            case 'ArrowDown':
                alert('Move Line Down (Alt+Down)');
                e.preventDefault();
                break;
        }
    }
    
    // Special keys
    if (e.key === 'F4' && e.altKey) {
        if (confirm('Exit VS Code?')) {
            window.close();
        }
        e.preventDefault();
    }
});
