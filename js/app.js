// Unit Converter App - Main Application Logic

class UnitConverterApp {
    constructor() {
        this.currentCategory = 'length';
        this.favorites = [];
        this.history = [];
        this.adIntervalCounter = 0;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupSwapButtons();
        this.renderFavorites();
        this.renderHistory();
        this.renderPremiumContent();
    }

    // LocalStorage Management
    loadFromStorage() {
        const stored = localStorage.getItem('unitConverterData');
        if (stored) {
            const data = JSON.parse(stored);
            this.favorites = data.favorites || [];
            this.history = data.history || [];
        }
    }

    saveToStorage() {
        localStorage.setItem('unitConverterData', JSON.stringify({
            favorites: this.favorites,
            history: this.history
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

        // Favorites and history
        document.getElementById('add-favorite-btn').addEventListener('click', () => this.addFavorite());
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());
        document.getElementById('favorites-toggle').addEventListener('click', () => this.toggleSection('favorites'));
        document.getElementById('history-toggle').addEventListener('click', () => this.toggleSection('history'));

        // Premium content
        document.getElementById('premium-btn').addEventListener('click', () => this.showPremiumModal());
        document.getElementById('premium-close-btn').addEventListener('click', () => this.closePremiumModal());

        // Ad modal
        document.getElementById('ad-close-btn').addEventListener('click', () => this.closeAdModal());

        // Close modals when clicking outside
        document.getElementById('premium-modal').addEventListener('click', (e) => {
            if (e.target.id === 'premium-modal') this.closePremiumModal();
        });

        document.getElementById('ad-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ad-modal' && this.adCountdown <= 0) this.closeAdModal();
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
            this.triggerAdIfNeeded();
        } else if (!isInput1 && input2.value) {
            const result = convert(input2.value, this.getUnit(input2), this.getUnit(input1), this.currentCategory);
            input1.value = result || '';
            this.addToHistory(input2.value, this.getUnit(input2), result, this.getUnit(input1));
            this.triggerAdIfNeeded();
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
        this.saveToStorage();
        this.renderHistory();
    }

    addFavorite() {
        const content = document.getElementById(`${this.currentCategory}-content`);
        const inputs = content.querySelectorAll('.unit-input');

        if (inputs.length < 2 || (!inputs[0].value && !inputs[1].value)) {
            alert('변환 값을 입력하세요.');
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
        alert('저장되었습니다!');
    }

    renderFavorites() {
        const list = document.getElementById('favorites-list');
        list.innerHTML = '';

        if (this.favorites.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px; padding: 8px;">저장된 즐겨찾기가 없습니다</p>';
            return;
        }

        this.favorites.forEach(fav => {
            const item = document.createElement('div');
            item.className = 'favorite-item';

            const inputs = fav.inputs;
            const text = inputs.map(inp => `${inp.value || '0'} ${inp.unit}`).join(' = ');

            item.innerHTML = `
                <span>${text}</span>
                <button class="favorite-remove-btn" data-id="${fav.id}">삭제</button>
            `;

            item.querySelector('.favorite-remove-btn').addEventListener('click', () => {
                this.favorites = this.favorites.filter(f => f.id !== fav.id);
                this.saveToStorage();
                this.renderFavorites();
            });

            list.appendChild(item);
        });
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (this.history.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px; padding: 8px;">변환 기록이 없습니다</p>';
            return;
        }

        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';

            item.innerHTML = `
                <div>
                    <span>${entry.fromValue} ${entry.fromUnit} = ${entry.toValue} ${entry.toUnit}</span>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${entry.timestamp}</div>
                </div>
                <button class="history-remove-btn" data-id="${entry.id}">삭제</button>
            `;

            item.querySelector('.history-remove-btn').addEventListener('click', () => {
                this.history = this.history.filter(h => h.id !== entry.id);
                this.saveToStorage();
                this.renderHistory();
            });

            list.appendChild(item);
        });
    }

    clearHistory() {
        if (confirm('모든 기록을 삭제하시겠습니까?')) {
            this.history = [];
            this.saveToStorage();
            this.renderHistory();
        }
    }

    toggleSection(section) {
        const list = section === 'favorites' ?
            document.getElementById('favorites-list') :
            document.getElementById('history-list');
        const btn = section === 'favorites' ?
            document.getElementById('favorites-toggle') :
            document.getElementById('history-toggle');

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
            document.getElementById('premium-modal').style.display = 'flex';
            this.populatePremiumContent();
        });
    }

    populatePremiumContent() {
        const container = document.getElementById('premium-content');
        const premiumData = PREMIUM_CONVERSIONS[this.currentCategory] || [];

        container.innerHTML = '';

        if (premiumData.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">고급 변환 옵션이 없습니다.</p>';
            return;
        }

        premiumData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'premium-item';

            const text = item.formula ?
                `${item.fromLabel} ↔ ${item.toLabel} (공식 기반)` :
                `${item.fromLabel} ↔ ${item.toLabel} (${item.factor})`;

            div.innerHTML = `
                <strong>${text}</strong>
                <p style="margin-top: 8px; color: var(--text-secondary); font-size: 12px;">
                    예: 1 ${item.from} = ${item.formula ? item.formula(1).toFixed(4) : (item.factor).toFixed(4)} ${item.to}
                </p>
            `;

            container.appendChild(div);
        });
    }

    closePremiumModal() {
        document.getElementById('premium-modal').style.display = 'none';
    }

    // Ad Management
    triggerAdIfNeeded() {
        this.adIntervalCounter++;
        // Show interstitial ad every 10 conversions
        if (this.adIntervalCounter >= 10) {
            this.adIntervalCounter = 0;
            this.showAdModal();
        }
    }

    showAdModal(callback) {
        const modal = document.getElementById('ad-modal');
        const closeBtn = document.getElementById('ad-close-btn');
        const countdownText = document.getElementById('countdown-num');

        modal.style.display = 'flex';
        closeBtn.style.display = 'none';
        this.adCountdown = 5;

        const countdownInterval = setInterval(() => {
            this.adCountdown--;
            countdownText.textContent = this.adCountdown;

            if (this.adCountdown <= 0) {
                clearInterval(countdownInterval);
                closeBtn.style.display = 'block';

                if (callback) {
                    callback();
                    modal.style.display = 'none';
                }
            }
        }, 1000);
    }

    closeAdModal() {
        document.getElementById('ad-modal').style.display = 'none';
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new UnitConverterApp();
});
