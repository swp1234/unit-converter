// Unit Converter App - Main Application Logic

class UnitConverterApp {
    constructor() {
        this.currentCategory = 'length';
        this.favorites = [];
        this.history = [];
        this.quickConversions = [];
        this.hasTrackedStart = false;
        this.lastCompleteTrackAt = 0;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupTheme();
        this.setupEventListeners();
        this.setupSwapButtons();
        this.setupPresetChips();
        this.renderFavorites();
        this.renderHistory();
        this.renderQuickConversions();
        this.renderPremiumContent();
    }

    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('unitConverter_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('unitConverter_theme', next);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
        }
    }

    // LocalStorage Management
    loadFromStorage() {
        const stored = localStorage.getItem('unitConverterData');
        if (stored) {
            const data = JSON.parse(stored);
            this.favorites = data.favorites || [];
            this.history = data.history || [];
            this.quickConversions = data.quickConversions || [];
        }
    }

    saveToStorage() {
        localStorage.setItem('unitConverterData', JSON.stringify({
            favorites: this.favorites,
            history: this.history,
            quickConversions: this.quickConversions
        }));
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCategory(e.target.dataset.category));
        });

        // Category content inputs
        document.querySelectorAll('.unit-input').forEach(input => {
            input.addEventListener('input', (e) => this.handleConversion(e));
            input.addEventListener('focus', () => input.parentElement.classList.add('active'));
            input.addEventListener('blur', () => input.parentElement.classList.remove('active'));
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Favorites and history
        document.getElementById('add-favorite-btn')?.addEventListener('click', () => this.addFavorite());
        document.getElementById('clear-history-btn')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('favorites-toggle')?.addEventListener('click', () => this.toggleSection('favorites'));
        document.getElementById('history-toggle')?.addEventListener('click', () => this.toggleSection('history'));

        const quickToggle = document.getElementById('quick-conversions-toggle');
        if (quickToggle) {
            quickToggle.addEventListener('click', () => this.toggleSection('quick-conversions'));
        }

        // Premium content
        document.getElementById('premium-btn')?.addEventListener('click', () => this.showPremiumModal());
        document.getElementById('premium-close-btn')?.addEventListener('click', () => this.closePremiumModal());

        // Ad modal
        document.getElementById('ad-close-btn')?.addEventListener('click', () => this.closeAdModal());

        // Close modals when clicking outside
        document.getElementById('premium-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'premium-modal') this.closePremiumModal();
        });

        document.getElementById('ad-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'ad-modal' && this.adCountdown <= 0) this.closeAdModal();
        });

        // Share & Story Card
        document.getElementById('saveCardBtn')?.addEventListener('click', () => this.generateReferenceCard());
        document.getElementById('shareTwitterBtn')?.addEventListener('click', () => this.shareTwitter());
        document.getElementById('shareUrlBtn')?.addEventListener('click', () => this.copyShareUrl());
        document.getElementById('share-float-btn')?.addEventListener('click', () => this.copyShareUrl(true));

        // Curated book recommendations telemetry
        document.querySelectorAll('#curated-resources-card a.curated-item').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('curated_resource_click', {
                    app_name: 'unit-converter',
                    resource_type: link.dataset.resourceType || 'book',
                    item_id: link.dataset.itemId || '',
                    lang: window.i18n?.getCurrentLanguage() || 'en'
                });
            });
        });
    }

    // Swap buttons for primary conversions
    setupSwapButtons() {
        document.querySelectorAll('.swap-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('.unit-row');
                const inputs = row.querySelectorAll('.unit-input:not(.length-variant):not(.weight-variant):not(.temp-variant):not(.volume-variant):not(.area-variant):not(.speed-variant)');

                if (inputs.length === 2) {
                    const [input1, input2] = inputs;
                    [input1.value, input2.value] = [input2.value, input1.value];

                    // Trigger conversion
                    input1.dispatchEvent(new Event('input'));
                }
            });
        });
    }

    // 빠른 변환 프리셋
    setupPresetChips() {
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const from = chip.dataset.from;
                const to = chip.dataset.to;
                const category = chip.dataset.category;
                const value = chip.dataset.value;

                // 해당 카테고리로 이동
                this.switchCategory(category);

                // 결과 계산
                const result = convert(value, from, to, category);

                // 칩에 결과 표시
                document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                // 해당 카테고리의 첫 번째 입력에 값 설정
                const content = document.getElementById(`${category}-content`);
                if (content) {
                    const inputs = content.querySelectorAll('.unit-input');
                    if (inputs.length >= 2) {
                        inputs[0].value = value;
                        inputs[1].value = result;
                    }
                }

                // 히스토리에 추가
                this.addToHistory(value, from, result, to);
                this.recordConversionTelemetry(category);
            });
        });
    }

    // Category Switching
    switchCategory(category) {
        this.currentCategory = category;

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Update active content
        document.querySelectorAll('.category-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${category}-content`)?.classList.add('active');

        // Clear inputs when switching
        this.clearCategoryInputs(category);
    }

    clearCategoryInputs(category) {
        const content = document.getElementById(`${category}-content`);
        if (content) {
            content.querySelectorAll('.unit-input').forEach(input => {
                input.value = '';
            });
        }
    }

    // Conversion Handler
    handleConversion(e) {
        const input = e.target;
        const row = input.closest('.unit-row');
        if (!row) return;

        const inputs = row.querySelectorAll('.unit-input');
        if (inputs.length < 2) return;

        const [input1, input2] = inputs;
        const isInput1 = input === input1;

        if (isInput1 && input1.value) {
            const result = convert(input1.value, this.getUnit(input1), this.getUnit(input2), this.currentCategory);
            input2.value = result || '';
            this.addToHistory(input1.value, this.getUnit(input1), result, this.getUnit(input2));
            this.recordConversionTelemetry(this.currentCategory);
        } else if (!isInput1 && input2.value) {
            const result = convert(input2.value, this.getUnit(input2), this.getUnit(input1), this.currentCategory);
            input1.value = result || '';
            this.addToHistory(input2.value, this.getUnit(input2), result, this.getUnit(input1));
            this.recordConversionTelemetry(this.currentCategory);
        }
    }

    getUnit(input) {
        const row = input.closest('.unit-row');
        const inputs = row.querySelectorAll('.unit-input');
        return inputs[0] === input ? this.getInputUnit(input, 0) : this.getInputUnit(input, 1);
    }

    getInputUnit(input, position) {
        const label = input.closest('.input-group')?.querySelector('.unit-label')?.textContent || '';
        const dataAttr = input.dataset.unit;

        // Map labels to units
        const unitMap = {
            '평': 'pyeong', '㎡': 'sqm', 'km': 'km', 'm': 'm',
            'kg': 'kg', 'lb': 'lb', '돈': 'don', '냥': 'nyang',
            '℃': 'c', '℉': 'f', 'K': 'k',
            'L': 'l', 'gal': 'gal', '되': 'doe', '홉': 'hop',
            'acre': 'acre',
            'km/h': 'kmh', 'mph': 'mph', 'm/s': 'ms'
        };

        return dataAttr || unitMap[label] || '';
    }

    // History & Favorites
    addToHistory(fromValue, fromUnit, toValue, toUnit) {
        if (!toValue) return;

        const entry = {
            id: Date.now(),
            fromValue: parseFloat(fromValue).toFixed(2),
            fromUnit,
            toValue: parseFloat(toValue).toFixed(4),
            toUnit,
            category: this.currentCategory,
            timestamp: new Date().toLocaleTimeString()
        };

        this.history.unshift(entry);
        if (this.history.length > 50) this.history.pop();

        // Update quick conversions (top 5)
        const existing = this.quickConversions.findIndex(
            q => q.fromUnit === fromUnit && q.toUnit === toUnit
        );
        if (existing !== -1) {
            this.quickConversions.splice(existing, 1);
        }
        this.quickConversions.unshift({
            fromUnit,
            toUnit,
            category: this.currentCategory
        });
        if (this.quickConversions.length > 5) this.quickConversions.pop();

        this.saveToStorage();
        this.renderHistory();
        this.renderQuickConversions();
    }

    renderQuickConversions() {
        const section = document.getElementById('quickConversionsSection');
        const list = document.getElementById('quickConversionsList');

        if (!list) return;

        if (this.quickConversions.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        list.innerHTML = '';

        this.quickConversions.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'quick-conversion-item';

            const span = document.createElement('span');
            span.textContent = `${conv.fromUnit} → ${conv.toUnit}`;

            const btn = document.createElement('button');
            btn.className = 'quick-conversion-copy-btn';
            btn.textContent = window.i18n?.t('messages.copy') || 'Copy';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = `${conv.fromUnit} → ${conv.toUnit}`;
                const msg = window.i18n?.t('messages.copied') || 'Copied!';
                const execCopy = () => {
                    try {
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        ta.setAttribute('readonly', '');
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        document.body.appendChild(ta);
                        ta.select();
                        const ok = document.execCommand('copy');
                        document.body.removeChild(ta);
                        if (ok) this.showToast(msg);
                    } catch (err) {}
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => this.showToast(msg)).catch(execCopy);
                } else {
                    execCopy();
                }
            });

            item.appendChild(span);
            item.appendChild(btn);

            item.addEventListener('click', () => {
                this.loadQuickConversion(conv);
            });

            list.appendChild(item);
        });
    }

    loadQuickConversion(conv) {
        this.switchCategory(conv.category);
        // Find and populate the conversion inputs
        const content = document.getElementById(`${conv.category}-content`);
        if (content) {
            const inputs = content.querySelectorAll('.unit-input');
            inputs.forEach((input, idx) => {
                const label = input.closest('.input-group')?.querySelector('.unit-label')?.textContent || '';
                if (idx === 0 && this.getInputUnit(input, idx) === conv.fromUnit) {
                    input.value = '1';
                    input.dispatchEvent(new Event('input'));
                }
            });
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    addFavorite() {
        const content = document.getElementById(`${this.currentCategory}-content`);
        const inputs = content.querySelectorAll('.unit-input');

        if (inputs.length < 2 || (!inputs[0].value && !inputs[1].value)) {
            this.showToast(window.i18n?.t('messages.enterValue') || 'Please enter a value to convert.');
            return;
        }

        const favorite = {
            id: Date.now(),
            category: this.currentCategory,
            inputs: Array.from(inputs).map((input, idx) => ({
                value: input.value,
                unit: this.getInputUnit(input, idx),
                label: input.closest('.input-group')?.querySelector('label')?.textContent || ''
            }))
        };

        this.favorites.unshift(favorite);
        this.saveToStorage();
        this.renderFavorites();
        this.showToast(window.i18n?.t('messages.saved') || 'Saved!');
    }

    renderFavorites() {
        const list = document.getElementById('favorites-list');
        if (!list) return;
        list.innerHTML = '';

        if (this.favorites.length === 0) {
            list.innerHTML = `<p style="color: var(--text-secondary); font-size: 13px; padding: 8px;">${window.i18n?.t('messages.noFavorites') || 'No saved favorites'}</p>`;
            return;
        }

        this.favorites.forEach(fav => {
            const item = document.createElement('div');
            item.className = 'favorite-item';

            const inputs = fav.inputs;
            const text = inputs.map(inp => `${inp.value || '0'} ${inp.unit}`).join(' = ');

            const span = document.createElement('span');
            span.textContent = text;

            const btn = document.createElement('button');
            btn.className = 'favorite-remove-btn';
            btn.textContent = window.i18n?.t('messages.delete') || 'Delete';
            btn.addEventListener('click', () => {
                this.favorites = this.favorites.filter(f => f.id !== fav.id);
                this.saveToStorage();
                this.renderFavorites();
            });

            item.appendChild(span);
            item.appendChild(btn);

            list.appendChild(item);
        });
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;
        list.innerHTML = '';

        if (this.history.length === 0) {
            list.innerHTML = `<p style="color: var(--text-secondary); font-size: 13px; padding: 8px;">${window.i18n?.t('messages.noHistory') || 'No conversion history'}</p>`;
            return;
        }

        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const contentDiv = document.createElement('div');
            const span = document.createElement('span');
            span.textContent = `${entry.fromValue} ${entry.fromUnit} = ${entry.toValue} ${entry.toUnit}`;
            const timeDiv = document.createElement('div');
            timeDiv.style.fontSize = '11px';
            timeDiv.style.color = 'var(--text-secondary)';
            timeDiv.style.marginTop = '4px';
            timeDiv.textContent = entry.timestamp;

            const btn = document.createElement('button');
            btn.className = 'history-remove-btn';
            btn.textContent = window.i18n?.t('messages.delete') || 'Delete';
            btn.addEventListener('click', () => {
                this.history = this.history.filter(h => h.id !== entry.id);
                this.saveToStorage();
                this.renderHistory();
            });

            contentDiv.appendChild(span);
            contentDiv.appendChild(timeDiv);

            item.appendChild(contentDiv);
            item.appendChild(btn);

            list.appendChild(item);
        });
    }

    clearHistory() {
        this.history = [];
        this.saveToStorage();
        this.renderHistory();
        this.showToast(window.i18n?.t('share.cleared') || 'Conversion history cleared.');
    }

    toggleSection(section) {
        let list, btn;

        if (section === 'favorites') {
            list = document.getElementById('favorites-list');
            btn = document.getElementById('favorites-toggle');
        } else if (section === 'history') {
            list = document.getElementById('history-list');
            btn = document.getElementById('history-toggle');
        } else if (section === 'quick-conversions') {
            list = document.getElementById('quickConversionsList');
            btn = document.getElementById('quick-conversions-toggle');
        }

        if (!list || !btn) return;

        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'flex' : 'none';
        btn.textContent = isHidden ? '▲' : '▼';
    }

    // Premium Content
    renderPremiumContent() {
        // Premium content is shown dynamically in modal
    }

    showPremiumModal() {
        this.showAdModal(() => {
            const modal = document.getElementById('premium-modal');
            if (modal) modal.style.display = 'flex';
            this.populatePremiumContent();
        });
    }

    populatePremiumContent() {
        const container = document.getElementById('premium-content');
        if (!container) return;
        const premiumData = PREMIUM_CONVERSIONS[this.currentCategory] || [];

        container.innerHTML = '';

        if (premiumData.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary);">${window.i18n?.t('messages.noPremium') || 'No advanced conversion options available.'}</p>`;
            return;
        }

        premiumData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'premium-item';

            const formulaLabel = window.i18n?.t('messages.formulaBased') || 'formula-based';
            const text = item.formula ?
                `${item.fromLabel} ↔ ${item.toLabel} (${formulaLabel})` :
                `${item.fromLabel} ↔ ${item.toLabel} (${item.factor})`;

            const strong = document.createElement('strong');
            strong.textContent = text;

            const p = document.createElement('p');
            p.style.marginTop = '8px';
            p.style.color = 'var(--text-secondary)';
            p.style.fontSize = '12px';
            const exampleValue = item.formula ? item.formula(1).toFixed(4) : (item.factor).toFixed(4);
            const exLabel = window.i18n?.t('messages.example') || 'e.g.';
            p.textContent = `${exLabel}: 1 ${item.from} = ${exampleValue} ${item.to}`;

            div.appendChild(strong);
            div.appendChild(p);

            container.appendChild(div);
        });
    }

    closePremiumModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) modal.style.display = 'none';
    }

    // Clean Analytics Helper (no PII / no raw input numbers)
    trackEvent(name, params) {
        if (typeof gtag === 'function') {
            gtag('event', name, params || {});
        }
    }

    recordConversionTelemetry(category) {
        const lang = window.i18n?.getCurrentLanguage() || 'en';
        const mode = category || this.currentCategory || 'length';
        if (!this.hasTrackedStart) {
            this.hasTrackedStart = true;
            this.trackEvent('test_start', {
                app_name: 'unit-converter',
                mode,
                lang
            });
        }
        const now = Date.now();
        if (now - this.lastCompleteTrackAt > 800) {
            this.lastCompleteTrackAt = now;
            this.trackEvent('test_complete', {
                app_name: 'unit-converter',
                result_type: mode,
                lang
            });
        }
    }

    buildShareUrl() {
        const lang = window.i18n?.getCurrentLanguage() || 'en';
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        url.searchParams.set('utm_source', 'share');
        return url.toString();
    }

    async copyShareUrl(allowNative = false) {
        const lang = window.i18n?.getCurrentLanguage() || 'en';
        const shareUrl = this.buildShareUrl();
        const title = document.title;
        if (allowNative && navigator.share) {
            try {
                await navigator.share({ title, url: shareUrl });
                this.trackEvent('share', { method: 'native', app_name: 'unit-converter', lang });
                return;
            } catch (e) {
                if (e && e.name === 'AbortError') return;
            }
        }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch (e) {}
        this.showToast(window.i18n?.t('share.copied') || 'Link copied to clipboard!');
        this.trackEvent('share', { method: 'clipboard', app_name: 'unit-converter', lang });
    }

    shareTwitter() {
        const lang = window.i18n?.getCurrentLanguage() || 'en';
        const shareUrl = this.buildShareUrl();
        const text = window.i18n?.t('header.title') || 'Unit Converter Pro';
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        this.trackEvent('share', { method: 'twitter', app_name: 'unit-converter', lang });
    }

    generateReferenceCard() {
        const canvas = document.getElementById('shareCanvas');
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;

        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#132a2e');
        grad.addColorStop(1, '#091521');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Ambient glow
        ctx.fillStyle = 'rgba(26, 188, 156, 0.16)';
        ctx.beginPath();
        ctx.arc(540, 420, 380, 0, Math.PI * 2);
        ctx.fill();

        const lang = window.i18n?.getCurrentLanguage() || 'en';
        const title = window.i18n?.t('share.cardTitle') || 'Unit Conversion Reference Card';
        const sub = window.i18n?.t('share.cardSub') || 'SI · Customary · Precision Metrology Cheat Sheet';

        ctx.fillStyle = '#1abc9c';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DOPABRAIN METROLOGY STUDIO', W / 2, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 62px sans-serif';
        ctx.fillText(title.slice(0, 32), W / 2, 260);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '32px sans-serif';
        ctx.fillText(sub.slice(0, 52), W / 2, 325);

        const benchmarks = [
            ['Area (Korea / SI)', '1 Pyeong = 3.3058 m²  |  1 m² = 0.3025 Pyeong'],
            ['Mass / Weight', '1 kg = 2.2046 lb  |  1 Don = 3.75 g'],
            ['Temperature', '°F = °C × 9/5 + 32  |  K = °C + 273.15'],
            ['Length / Distance', '1 inch = 25.4 mm  |  1 mile = 1.6093 km'],
            ['Volume', '1 US gal = 3.7854 L  |  1 cup = 236.6 mL'],
            ['Speed', '100 km/h = 62.14 mph  |  1 m/s = 3.6 km/h']
        ];

        let y = 440;
        benchmarks.forEach(([label, formula]) => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.beginPath();
            ctx.roundRect(80, y, W - 160, 175, 26);
            ctx.fill();
            ctx.strokeStyle = 'rgba(26, 188, 156, 0.35)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText(label, 120, y + 66);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText(formula, 120, y + 128);
            y += 205;
        });

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1abc9c';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(`dopabrain.com/unit-converter/?lang=${lang}`, W / 2, 1780);

        try {
            const link = document.createElement('a');
            link.download = `dopabrain-unit-card-${this.currentCategory}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {}

        this.showToast(window.i18n?.t('share.downloadStarted') || 'Saved 1080×1920 conversion reference card!');
        this.trackEvent('save_image', {
            app_name: 'unit-converter',
            result_type: this.currentCategory || 'length',
            lang
        });
    }

    showAdModal(callback) {
        if (callback) callback();
    }

    closeAdModal() {
        const modal = document.getElementById('ad-modal');
        if (modal) modal.style.display = 'none';
    }
}

// i18n 초기화 및 앱 시작
let app;
(async function initI18n() {
    try {
        await i18n.setLanguage(i18n.getCurrentLanguage());

        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        const langOptions = document.querySelectorAll('.lang-option');

        document.querySelector(`[data-lang="${i18n.getCurrentLanguage()}"]`)?.classList.add('active');
        langToggle?.addEventListener('click', () => langMenu.classList.toggle('hidden'));
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) langMenu?.classList.add('hidden');
        });
        langOptions.forEach(opt => {
            opt.addEventListener('click', async () => {
                await i18n.setLanguage(opt.getAttribute('data-lang'));
                langOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                langMenu.classList.add('hidden');
                preserveLanguageLinks();
            });
        });
    } catch (e) {
        console.warn('i18n init failed:', e);
    }

    // 앱 시작
    app = new UnitConverterApp();
    window.unitConverterApp = app;
    preserveLanguageLinks();

    // Hide app loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
    }
})();

function preserveLanguageLinks() {
    try {
        const getLang = () => (window.i18n && typeof window.i18n.getCurrentLanguage === 'function' ? window.i18n.getCurrentLanguage() : null) || new URLSearchParams(window.location.search).get('lang') || 'en';
        const lang = getLang();
        document.querySelectorAll('.related-card, a[href^="/shopping-calc/"], a[href^="/bmi-calculator/"], a[href^="/dday-counter/"], a[href^="/sebatdon-calc/"]').forEach(function(a) {
            const href = a.getAttribute('href');
            if (!href || href.startsWith('/portal/')) return;
            const url = new URL(href, window.location.origin);
            if (lang) {
                url.searchParams.set('lang', lang);
            }
            url.searchParams.set('source', 'unit_converter_result');
            a.setAttribute('href', url.pathname + url.search + url.hash);

            if (!a.__ctaBound) {
                a.__ctaBound = true;
                a.addEventListener('click', function() {
                    if (typeof gtag === 'function') {
                        gtag('event', 'content_cta_click', {
                            cta_surface: 'related_tools',
                            destination: a.getAttribute('href'),
                            source: 'unit_converter_result',
                            lang: getLang()
                        });
                    }
                });
            }
        });
    } catch (e) {}
}
