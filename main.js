document.addEventListener('DOMContentLoaded', () => {
    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW Registered'))
                .catch(err => console.log('SW Failed', err));
        });
    }

    // --- DOM Elements ---
    const inputView = document.getElementById('input-view');
    const loadingView = document.getElementById('loading-view');
    const readyView = document.getElementById('ready-view');
    const bottomNav = document.getElementById('bottom-nav');
    const simpleFooter = document.getElementById('simple-footer');

    const generateBtn = document.getElementById('generate-btn');
    const projectIdea = document.getElementById('project-idea');
    const userApiKey = document.getElementById('user-api-key');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedFields = document.getElementById('advanced-fields');

    const resultProjectName = document.getElementById('result-project-name');
    const aiSummaryList = document.getElementById('ai-summary-list');
    const fileExplorer = document.getElementById('file-explorer');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const restartBtn = document.getElementById('restart-btn');

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const previewOverlay = document.getElementById('file-preview-overlay');
    const previewFilename = document.getElementById('preview-filename');
    const previewContent = document.getElementById('preview-content');
    const closePreview = document.getElementById('close-preview');

    const byokModal = document.getElementById('byok-modal');
    const closeByokModal = document.getElementById('close-byok-modal');
    const openSettingsFromModal = document.getElementById('open-settings-from-modal');

    const historyModal = document.getElementById('history-modal');
    const closeHistory = document.getElementById('close-history');
    const openHistoryBtm = document.getElementById('open-history-btm');
    const historyList = document.getElementById('history-list');

    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const openSettingsNav = document.getElementById('open-settings-nav');
    const openSettingsBtm = document.getElementById('open-settings-btm');
    const settingsApiKey = document.getElementById('settings-api-key');
    const dailyCountDisplay = document.getElementById('daily-count-display');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // New Success Features Elements
    const tabStructure = document.getElementById('tab-structure');
    const tabRoadmap = document.getElementById('tab-roadmap');
    const tabPresentation = document.getElementById('tab-presentation');
    const viewStructure = document.getElementById('view-structure');
    const viewRoadmap = document.getElementById('view-roadmap');
    const viewPresentation = document.getElementById('view-presentation');

    const roadmapList = document.getElementById('roadmap-list');
    const resourceList = document.getElementById('resource-list');
    const presentationTips = document.getElementById('presentation-tips');
    const aiInsightBox = document.getElementById('ai-insight-box');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');

    let currentProjectData = null;

    // --- State Management ---
    const PROMPT_LIMIT = 5;

    function getUsage() {
        const today = new Date().toDateString();
        let usage = JSON.parse(localStorage.getItem('usageStats') || '{}');
        if (usage.date !== today) {
            usage = { date: today, count: 0 };
            localStorage.setItem('usageStats', JSON.stringify(usage));
        }
        return usage;
    }

    function incrementUsage() {
        const usage = getUsage();
        usage.count += 1;
        localStorage.setItem('usageStats', JSON.stringify(usage));
        updateUsageDisplay();
    }

    function updateUsageDisplay() {
        const usage = getUsage();
        if (dailyCountDisplay) {
            dailyCountDisplay.textContent = `${usage.count} / ${PROMPT_LIMIT}`;
        }
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem('generationHistory') || '[]');
    }

    function saveToHistory(data) {
        const history = getHistory();
        const entry = {
            id: Date.now(),
            projectName: data.projectName,
            idea: projectIdea.value,
            data: data,
            timestamp: new Date().toLocaleString()
        };
        history.unshift(entry);
        localStorage.setItem('generationHistory', JSON.stringify(history.slice(0, 20))); // Keep last 20
    }

    // --- Persistence & Initialization ---
    const savedIdea = localStorage.getItem('projectIdea');
    const savedKey = localStorage.getItem('userApiKey');
    if (savedIdea) projectIdea.value = savedIdea;
    if (savedKey) {
        userApiKey.value = savedKey;
        settingsApiKey.value = savedKey;
        advancedToggle.checked = true;
        advancedFields.classList.remove('hidden');
    }
    updateUsageDisplay();

    // --- Theme Logic ---
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });

    // --- Modal Logic ---
    function toggleModal(modal, show) {
        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    openSettingsNav.onclick = () => toggleModal(settingsModal, true);
    openSettingsBtm.onclick = () => toggleModal(settingsModal, true);
    closeSettings.onclick = () => toggleModal(settingsModal, false);

    openHistoryBtm.onclick = () => {
        renderHistoryList();
        toggleModal(historyModal, true);
    };
    closeHistory.onclick = () => toggleModal(historyModal, false);

    closeByokModal.onclick = () => toggleModal(byokModal, false);
    openSettingsFromModal.onclick = () => {
        toggleModal(byokModal, false);
        toggleModal(settingsModal, true);
    };

    settingsApiKey.oninput = () => {
        const key = settingsApiKey.value.trim();
        userApiKey.value = key; // Sync with primary input
        localStorage.setItem('userApiKey', key);
    };

    clearHistoryBtn.onclick = () => {
        if (confirm('Are you sure you want to clear all generation history?')) {
            localStorage.removeItem('generationHistory');
            renderHistoryList();
        }
    };

    // --- UI Interactions ---
    advancedToggle.addEventListener('change', () => {
        advancedFields.classList.toggle('hidden', !advancedToggle.checked);
    });

    projectIdea.addEventListener('input', () => {
        localStorage.setItem('projectIdea', projectIdea.value);
    });

    userApiKey.addEventListener('input', () => {
        const key = userApiKey.value.trim();
        settingsApiKey.value = key; // Sync with settings
        localStorage.setItem('userApiKey', key);
    });

    // --- Tab Switching Logic ---
    const tabs = [tabStructure, tabRoadmap, tabPresentation];
    const views = [viewStructure, viewRoadmap, viewPresentation];

    function switchTab(activeTab, activeView) {
        tabs.forEach(t => {
            t.classList.remove('border-b-2', 'border-primary', 'text-primary');
            t.classList.add('text-slate-500');
        });
        views.forEach(v => v.classList.add('hidden'));

        activeTab.classList.add('border-b-2', 'border-primary', 'text-primary');
        activeTab.classList.remove('text-slate-500');
        activeView.classList.remove('hidden');
    }

    tabStructure.onclick = () => switchTab(tabStructure, viewStructure);
    tabRoadmap.onclick = () => switchTab(tabRoadmap, viewRoadmap);
    tabPresentation.onclick = () => switchTab(tabPresentation, viewPresentation);

    // --- Project Assistant Logic ---
    async function askAssistant(question) {
        if (!currentProjectData || !question.trim()) return;

        const originalText = sendChat.innerHTML;
        sendChat.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">sync</span>';
        sendChat.disabled = true;

        try {
            const apiKey = userApiKey.value.trim();
            const prompt = `You are the BlueprintAI Assistant. I am working on the project "${currentProjectData.projectName}" with this idea: "${projectIdea.value}".
            User Question: "${question}"
            Provide a helpful, expert response in 2-3 short sentences.`;

            let responseText = "";
            if (apiKey) {
                const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "Meta-Llama-3.3-70B-Instruct",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });
                const result = await response.json();
                responseText = result.choices[0].message.content.trim();
            } else {
                // Fallback for demo or if no key
                responseText = "To get real-time answers about your project, please add your SambaNova API Key in Settings! I can help you with specific implementation steps or optimization tips once connected.";
            }

            const bubble = document.createElement('div');
            bubble.className = 'text-xs bg-primary/10 p-3 rounded-xl border border-primary/20 mt-2 fade-in';
            bubble.innerHTML = `<strong>You:</strong> ${question}<br><span class="text-slate-300 mt-1 block">${responseText}</span>`;
            aiInsightBox.appendChild(bubble);
            aiInsightBox.scrollTop = aiInsightBox.scrollHeight;
            chatInput.value = '';
        } catch (e) {
            console.error(e);
        } finally {
            sendChat.innerHTML = originalText;
            sendChat.disabled = false;
        }
    }

    sendChat.onclick = () => askAssistant(chatInput.value);
    chatInput.onkeydown = (e) => { if (e.key === 'Enter') askAssistant(chatInput.value); };

    async function generateDirectly(idea, apiKey) {
        const prompt = `Act as BlueprintAI. Create a logical and detailed project structure for the following idea: "${idea}".
        
        CRITICAL INSTRUCTIONS:
        1. Match the NATURE of the project. If it is a school project, use appropriate folders (e.g., research, diagrams, assets) and file types (e.g., .txt, .md, .pdf-placeholder).
        2. DO NOT assume this is a software development project unless the user mentions coding, apps, or specific programming languages.
        3. Provide high-quality, realistic starter content for every file created.
        
        Return ONLY a raw JSON object with NO markdown, NO backticks.
        {
          "projectName": "string",
          "folders": [ { "name": "string", "files": [ { "name": "string", "content": "string" } ] } ],
          "roadmap": ["Step 1", "Step 2", "Step 3"],
          "resources": [ { "label": "Resource Name", "url": "https://..." } ],
          "presentationTips": ["Tip 1", "Tip 2"],
          "initialInsight": "Brief expert commentary."
        }`;

        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "Meta-Llama-3.3-70B-Instruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Direct API connection failed');
        }

        const result = await response.json();
        let text = result.choices[0].message.content.trim();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    }

    // --- Generation Logic ---
    generateBtn.addEventListener('click', async () => {
        const idea = projectIdea.value.trim();
        const apiKey = userApiKey.value.trim();
        const usage = getUsage();

        if (!idea) {
            alert('Please enter a project idea.');
            return;
        }

        // Logic Check: If no key AND limit reached, show BYOK modal
        if (!apiKey && usage.count >= PROMPT_LIMIT) {
            toggleModal(byokModal, true);
            return;
        }

        // Switch to loading state
        inputView.classList.add('hidden');
        simpleFooter.classList.add('hidden');
        loadingView.classList.remove('hidden');

        try {
            let data;
            if (apiKey) {
                // --- SECURE: DIRECT BROWSER-TO-AI CONNECTION ---
                console.log('--- Direct Client-Side Request (Secure) ---');
                data = await generateDirectly(idea, apiKey);
            } else {
                // --- FREE TIER: SERVER-SIDE RELAY ---
                console.log('--- Server-Relayed Request (Free Tier) ---');
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idea })
                });

                if (response.status === 404) {
                    throw new Error('Free Tier is unavailable on this static host. Please provide your own API Key in Settings.');
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error('Server returned a non-JSON response. Ensure the backend is running.');
                }

                data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server error');
            }

            currentProjectData = data;
            saveToHistory(data);
            if (!apiKey) incrementUsage();
            renderResult(data);

        } catch (error) {
            console.error('Generation Error:', error);
            alert(`Error: ${error.message}`);
            resetView();
        }
    });

    function resetView() {
        loadingView.classList.add('hidden');
        inputView.classList.remove('hidden');
        simpleFooter.classList.remove('hidden');
    }

    function renderResult(data) {
        loadingView.classList.add('hidden');
        readyView.classList.remove('hidden');
        bottomNav.classList.remove('hidden');

        resultProjectName.textContent = data.projectName || 'BlueprintAI Architecture';

        // Render Summary
        aiSummaryList.innerHTML = '';
        const features = data.folders ? data.folders.map(f => f.name).slice(0, 4) : ['Source', 'Assets'];
        features.forEach(feat => {
            const li = document.createElement('li');
            li.className = 'flex items-center gap-2 fade-in';
            li.innerHTML = `
                <span class="material-symbols-outlined text-emerald-500 text-sm">check</span>
                <span>${feat.charAt(0).toUpperCase() + feat.slice(1)} Module scaffolded</span>
            `;
            aiSummaryList.appendChild(li);
        });

        // Render File Explorer
        renderFileTree(data.folders || []);

        // Render Roadmap
        roadmapList.innerHTML = '';
        (data.roadmap || ['Initialize project', 'Develop core components', 'Review and Test']).forEach((step, idx) => {
            const div = document.createElement('div');
            div.className = 'flex gap-4 fade-in';
            div.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="size-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">${idx + 1}</div>
                    ${idx < (data.roadmap?.length || 3) - 1 ? '<div class="w-px flex-1 bg-primary/20 my-1"></div>' : ''}
                </div>
                <div class="pb-4">
                    <p class="text-slate-300 text-sm font-medium mt-1">${step}</p>
                </div>
            `;
            roadmapList.appendChild(div);
        });

        // Render Resources
        resourceList.innerHTML = '';
        (data.resources || [{ label: 'GitHub Guides', url: 'https://github.com/git-guides' }]).forEach(res => {
            const a = document.createElement('a');
            a.href = res.url;
            a.target = '_blank';
            a.className = 'p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/10 transition-all flex items-center gap-3 group';
            a.innerHTML = `
                <span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">open_in_new</span>
                <span class="text-xs font-bold text-slate-300">${res.label}</span>
            `;
            resourceList.appendChild(a);
        });

        // Render Presentation Tips
        presentationTips.innerHTML = '';
        (data.presentationTips || ['Start with a strong hook', 'Focus on the problem you solve']).forEach(tip => {
            const div = document.createElement('div');
            div.className = 'flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-xl fade-in';
            div.innerHTML = `
                <span class="material-symbols-outlined text-amber-500 text-sm">tips_and_updates</span>
                <p class="text-xs text-slate-400 leading-relaxed">${tip}</p>
            `;
            presentationTips.appendChild(div);
        });

        // Set Initial Insight
        aiInsightBox.innerHTML = data.initialInsight || "Welcome to your new project! I've analyzed your requirements and generated a structure optimized for scale and performance.";

        // Reset to structure tab
        switchTab(tabStructure, viewStructure);
    }

    function renderFileTree(folders) {
        fileExplorer.innerHTML = '';
        if (folders.length === 0) {
            fileExplorer.innerHTML = '<div class="text-slate-500 italic p-4">Empty structure generated.</div>';
            return;
        }

        folders.forEach((folder, folderIdx) => {
            const folderId = `folder-${folderIdx}`;
            const folderEl = document.createElement('div');
            folderEl.className = 'mb-1';

            const header = document.createElement('div');
            header.className = 'flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group transition-colors';
            header.innerHTML = `
                <span class="material-symbols-outlined text-amber-400 text-sm">folder</span>
                <span class="font-bold text-slate-300 group-hover:text-white">${folder.name}</span>
                <span class="material-symbols-outlined text-xs text-slate-500 ml-auto transition-transform duration-200" id="icon-${folderId}">expand_more</span>
            `;

            const filesContainer = document.createElement('div');
            filesContainer.id = folderId;
            filesContainer.className = 'ml-4 pl-4 border-l border-slate-800 overflow-hidden transition-all duration-300';

            header.onclick = () => {
                filesContainer.classList.toggle('hidden');
                const icon = document.getElementById(`icon-${folderId}`);
                if (icon) icon.classList.toggle('-rotate-90');
            };

            if (folder.files) {
                folder.files.forEach(file => {
                    const fileEl = document.createElement('div');
                    fileEl.className = 'flex items-center gap-2 py-1 px-2 hover:bg-primary/10 rounded cursor-pointer group transition-colors text-slate-400 hover:text-primary';

                    let icon = 'description';
                    const name = file.name.toLowerCase();
                    if (name.endsWith('.html')) icon = 'html';
                    else if (name.endsWith('.js')) icon = 'javascript';
                    else if (name.endsWith('.css')) icon = 'css';
                    else if (name.endsWith('.md')) icon = 'markdown';
                    else if (name.endsWith('.json')) icon = 'settings';
                    else if (name.endsWith('.txt')) icon = 'article';

                    fileEl.innerHTML = `
                        <span class="material-symbols-outlined text-sm">${icon}</span>
                        <span class="text-xs font-mono">${file.name}</span>
                    `;

                    fileEl.onclick = (e) => {
                        e.stopPropagation();
                        openPreview(file);
                    };

                    filesContainer.appendChild(fileEl);
                });
            }

            folderEl.appendChild(header);
            folderEl.appendChild(filesContainer);
            fileExplorer.appendChild(folderEl);
        });
    }

    function renderHistoryList() {
        const history = getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                    <span class="material-symbols-outlined text-6xl opacity-20">history_toggle_off</span>
                    <p>No history yet. Start architecting!</p>
                </div>
            `;
            return;
        }

        history.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'history-item p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 cursor-pointer';
            itemEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-slate-200 truncate pr-4">${item.projectName || 'Untitled Project'}</h3>
                    <span class="text-[10px] text-slate-500 font-mono uppercase bg-black/40 px-2 py-1 rounded">${item.timestamp}</span>
                </div>
                <p class="text-xs text-slate-400 line-clamp-1 italic">"${item.idea}"</p>
            `;
            itemEl.onclick = () => {
                currentProjectData = item.data;
                renderResult(item.data);
                toggleModal(historyModal, false);
            };
            historyList.appendChild(itemEl);
        });
    }

    function openPreview(file) {
        previewFilename.textContent = file.name;
        previewContent.textContent = file.content;

        let icon = 'description';
        const name = file.name.toLowerCase();
        if (name.endsWith('.html')) icon = 'html';
        else if (name.endsWith('.js')) icon = 'javascript';
        else if (name.endsWith('.css')) icon = 'css';
        else if (name.endsWith('.md')) icon = 'markdown';

        document.getElementById('preview-icon').textContent = icon;
        previewOverlay.classList.remove('hidden');
        previewOverlay.classList.add('flex');
    }

    closePreview.onclick = () => {
        previewOverlay.classList.add('hidden');
        previewOverlay.classList.remove('flex');
    };

    downloadZipBtn.addEventListener('click', () => {
        if (!currentProjectData) return;

        const zip = new JSZip();
        (currentProjectData.folders || []).forEach(folder => {
            const folderRef = zip.folder(folder.name);
            (folder.files || []).forEach(file => {
                folderRef.file(file.name, file.content);
            });
        });

        const name = (currentProjectData.projectName || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    });

    restartBtn.addEventListener('click', () => {
        readyView.classList.add('hidden');
        bottomNav.classList.add('hidden');
        inputView.classList.remove('hidden');
        simpleFooter.classList.remove('hidden');
        scrollTo(0, 0);
    });
});
