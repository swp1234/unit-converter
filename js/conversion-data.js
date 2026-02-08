// Conversion formulas and utilities

const CONVERSIONS = {
    length: {
        // Primary: m <-> km
        main: {
            m: { to: 'km', factor: 0.001 },
            km: { to: 'm', factor: 1000 }
        }
    },

    weight: {
        // Primary: kg <-> lb
        main: {
            kg: { to: 'lb', factor: 2.20462 },
            lb: { to: 'kg', factor: 0.453592 }
        },
        // Traditional Korean units
        don: { to: 'kg', factor: 0.00375, custom: true },  // 돈 (don) = 3.75g
        nyang: { to: 'kg', factor: 0.0375, custom: true }  // 냥 (nyang) = 37.5g
    },

    temperature: {
        // Primary: C <-> F
        main: {
            c: { to: 'f', formula: (c) => (c * 9/5) + 32 },
            f: { to: 'c', formula: (f) => (f - 32) * 5/9 }
        },
        // Kelvin
        k: { to: 'c', formula: (k) => k - 273.15, custom: true }
    },

    volume: {
        // Primary: L <-> gal
        main: {
            l: { to: 'gal', factor: 0.264172 },
            gal: { to: 'l', factor: 3.78541 }
        },
        // Traditional Korean units
        doe: { to: 'l', factor: 18.039, custom: true },  // 되 (doe) ≈ 18.039L
        hop: { to: 'l', factor: 1.8039, custom: true }   // 홉 (hop) ≈ 1.8039L
    },

    area: {
        // Primary: sqm <-> pyeong
        main: {
            sqm: { to: 'pyeong', factor: 0.302506 },
            pyeong: { to: 'sqm', factor: 3.305785 }
        },
        // Acre
        acre: { to: 'sqm', factor: 4046.86, custom: true }
    },

    speed: {
        // Primary: kmh <-> mph
        main: {
            kmh: { to: 'mph', factor: 0.621371 },
            mph: { to: 'kmh', factor: 1.60934 }
        },
        // m/s
        ms: { to: 'kmh', factor: 3.6, custom: true }
    }
};

// Premium content - advanced conversions
const PREMIUM_CONVERSIONS = {
    length: [
        { from: 'nm', fromLabel: '나노미터 (nm)', to: 'μm', toLabel: '마이크로미터 (μm)', factor: 0.001 },
        { from: 'mm', fromLabel: '밀리미터 (mm)', to: 'inch', toLabel: '인치 (inch)', factor: 0.0393701 },
        { from: 'yard', fromLabel: '야드 (yard)', to: 'm', toLabel: '미터 (m)', factor: 0.9144 },
        { from: 'mile', fromLabel: '마일 (mile)', to: 'km', toLabel: '킬로미터 (km)', factor: 1.60934 }
    ],
    weight: [
        { from: 'g', fromLabel: '그램 (g)', to: 'oz', toLabel: '온스 (oz)', factor: 0.035274 },
        { from: 'mg', fromLabel: '밀리그램 (mg)', to: 'g', toLabel: '그램 (g)', factor: 0.001 },
        { from: 'ton', fromLabel: '톤 (ton)', to: 'kg', toLabel: '킬로그램 (kg)', factor: 1000 },
        { from: 'stone', fromLabel: '스톤 (stone)', to: 'kg', toLabel: '킬로그램 (kg)', factor: 6.35029 }
    ],
    temperature: [
        { from: 'c', fromLabel: '섭씨 (℃)', to: 'k', toLabel: '켈빈 (K)', formula: (c) => c + 273.15 },
        { from: 'f', fromLabel: '화씨 (℉)', to: 'k', toLabel: '켈빈 (K)', formula: (f) => (f - 32) * 5/9 + 273.15 }
    ],
    volume: [
        { from: 'ml', fromLabel: '밀리리터 (ml)', to: 'fl-oz', toLabel: '액량 온스 (fl oz)', factor: 0.033814 },
        { from: 'cup', fromLabel: '컵 (cup)', to: 'ml', toLabel: '밀리리터 (ml)', factor: 236.588 },
        { from: 'pint', fromLabel: '파인트 (pint)', to: 'l', toLabel: '리터 (L)', factor: 0.473176 },
        { from: 'barrel', fromLabel: '배럴 (barrel)', to: 'l', toLabel: '리터 (L)', factor: 158.987 }
    ],
    area: [
        { from: 'sqcm', fromLabel: '제곱센티미터 (㎠)', to: 'sqinch', toLabel: '제곱인치 (in²)', factor: 0.1550 },
        { from: 'sqfoot', fromLabel: '제곱피트 (ft²)', to: 'sqm', toLabel: '제곱미터 (㎡)', factor: 0.092903 },
        { from: 'hectare', fromLabel: '헥타르 (ha)', to: 'acre', toLabel: '에이커 (acre)', factor: 2.47105 }
    ],
    speed: [
        { from: 'knot', fromLabel: '노트 (knot)', to: 'kmh', toLabel: '시간당 킬로미터 (km/h)', factor: 1.852 },
        { from: 'fts', fromLabel: '초당 피트 (ft/s)', to: 'ms', toLabel: '초당 미터 (m/s)', factor: 0.3048 }
    ]
};

// Conversion function
function convert(value, from, to, category) {
    if (value === '' || value === null) return '';

    const num = parseFloat(value);
    if (isNaN(num)) return '';

    // Temperature special handling (uses formulas)
    if (category === 'temperature') {
        if (from === 'c' && to === 'f') return (num * 9/5 + 32).toFixed(2);
        if (from === 'f' && to === 'c') return ((num - 32) * 5/9).toFixed(2);
        if (from === 'c' && to === 'k') return (num + 273.15).toFixed(2);
        if (from === 'k' && to === 'c') return (num - 273.15).toFixed(2);
    }

    // Get the conversion factor
    const conversionData = CONVERSIONS[category];
    let factor;

    if (conversionData.main[from] && conversionData.main[from].to === to) {
        factor = conversionData.main[from].factor;
        return (num * factor).toFixed(4).replace(/\.?0+$/, '');
    }

    if (conversionData.main[to] && conversionData.main[to].to === from) {
        factor = conversionData.main[to].factor;
        return (num * factor).toFixed(4).replace(/\.?0+$/, '');
    }

    // Handle custom conversions (through sqm/kg/l base)
    if (category === 'length') {
        if (from === 'pyeong' && to === 'km') return (num * 3.305785 / 1000000).toFixed(6);
        if (from === 'km' && to === 'pyeong') return (num * 1000000 / 3.305785).toFixed(2);
        if (from === 'pyeong' && to === 'm') return (num * 3.305785).toFixed(2);
        if (from === 'm' && to === 'pyeong') return (num / 3.305785).toFixed(4);
        if (from === 'km' && to === 'm') return (num * 1000).toFixed(2);
        if (from === 'm' && to === 'km') return (num / 1000).toFixed(6);
    }

    if (category === 'weight') {
        if (from === 'don' && to === 'nyang') return (num / 10).toFixed(2);
        if (from === 'nyang' && to === 'don') return (num * 10).toFixed(2);
        if (from === 'don' && to === 'kg') return (num * 0.00375).toFixed(4);
        if (from === 'kg' && to === 'don') return (num / 0.00375).toFixed(1);
        if (from === 'nyang' && to === 'kg') return (num * 0.0375).toFixed(4);
        if (from === 'kg' && to === 'nyang') return (num / 0.0375).toFixed(2);
        if (from === 'don' && to === 'lb') return (num * 0.00375 * 2.20462).toFixed(3);
        if (from === 'lb' && to === 'don') return (num / 2.20462 / 0.00375).toFixed(1);
    }

    if (category === 'volume') {
        if (from === 'doe' && to === 'hop') return (num * 10).toFixed(2);
        if (from === 'hop' && to === 'doe') return (num / 10).toFixed(2);
        if (from === 'doe' && to === 'l') return (num * 18.039).toFixed(2);
        if (from === 'l' && to === 'doe') return (num / 18.039).toFixed(3);
        if (from === 'hop' && to === 'l') return (num * 1.8039).toFixed(3);
        if (from === 'l' && to === 'hop') return (num / 1.8039).toFixed(2);
        if (from === 'doe' && to === 'gal') return (num * 18.039 * 0.264172).toFixed(2);
        if (from === 'gal' && to === 'doe') return (num / 18.039 / 0.264172).toFixed(3);
    }

    if (category === 'area') {
        if (from === 'acre' && to === 'pyeong') return (num * 4046.86 * 0.302506).toFixed(1);
        if (from === 'pyeong' && to === 'acre') return (num / 4046.86 / 0.302506).toFixed(6);
        if (from === 'acre' && to === 'sqm') return (num * 4046.86).toFixed(2);
        if (from === 'sqm' && to === 'acre') return (num / 4046.86).toFixed(6);
    }

    if (category === 'speed') {
        if (from === 'ms' && to === 'kmh') return (num * 3.6).toFixed(2);
        if (from === 'kmh' && to === 'ms') return (num / 3.6).toFixed(3);
        if (from === 'ms' && to === 'mph') return (num * 3.6 * 0.621371).toFixed(2);
        if (from === 'mph' && to === 'ms') return (num / 0.621371 / 3.6).toFixed(3);
    }

    return '';
}

// Format number for display
function formatNumber(num) {
    if (num === '' || num === null) return '';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '';

    // Remove trailing zeros and decimal point if necessary
    return parsed.toString().replace(/\.?0+$/, '');
}
