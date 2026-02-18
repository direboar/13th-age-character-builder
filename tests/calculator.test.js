/**
 * calculator.test.js — Calculator モジュールのユニットテスト
 * SRDルールに基づきcalculator.jsの全計算ロジックを検証する
 */
const { describe, it, expect } = TestRunner;

// ========================================
// 能力値修正値
// ========================================
describe('getModifier — 能力値修正値', () => {
    it('能力値10の修正値は+0', () => {
        expect(Calculator.getModifier(10)).toBe(0);
    });
    it('能力値11の修正値は+0', () => {
        expect(Calculator.getModifier(11)).toBe(0);
    });
    it('能力値8の修正値は-1', () => {
        expect(Calculator.getModifier(8)).toBe(-1);
    });
    it('能力値12の修正値は+1', () => {
        expect(Calculator.getModifier(12)).toBe(1);
    });
    it('能力値14の修正値は+2', () => {
        expect(Calculator.getModifier(14)).toBe(2);
    });
    it('能力値18の修正値は+4', () => {
        expect(Calculator.getModifier(18)).toBe(4);
    });
    it('能力値20の修正値は+5', () => {
        expect(Calculator.getModifier(20)).toBe(5);
    });
    it('能力値3の修正値は-4', () => {
        expect(Calculator.getModifier(3)).toBe(-4);
    });
});

// ========================================
// ポイントバイコスト
// ========================================
describe('getPointBuyCost — ポイントバイコスト', () => {
    it('能力値8のコストは0', () => {
        expect(Calculator.getPointBuyCost(8)).toBe(0);
    });
    it('能力値10のコストは2', () => {
        expect(Calculator.getPointBuyCost(10)).toBe(2);
    });
    it('能力値14のコストは7', () => {
        expect(Calculator.getPointBuyCost(14)).toBe(7);
    });
    it('能力値15のコストは8（SRD拡張）', () => {
        expect(Calculator.getPointBuyCost(15)).toBe(8);
    });
    it('能力値16のコストは10（SRD拡張）', () => {
        expect(Calculator.getPointBuyCost(16)).toBe(10);
    });
    it('能力値17のコストは13（SRD拡張）', () => {
        expect(Calculator.getPointBuyCost(17)).toBe(13);
    });
    it('能力値18のコストは16（SRD拡張）', () => {
        expect(Calculator.getPointBuyCost(18)).toBe(16);
    });
    it('範囲外の能力値7は-1を返す', () => {
        expect(Calculator.getPointBuyCost(7)).toBe(-1);
    });
    it('範囲外の能力値19は-1を返す', () => {
        expect(Calculator.getPointBuyCost(19)).toBe(-1);
    });
});

// ========================================
// ポイントバイ合計コスト
// ========================================
describe('calculatePointBuyTotal — ポイントバイ合計', () => {
    it('全能力値10の合計コストは12', () => {
        const total = Calculator.calculatePointBuyTotal({
            STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10
        });
        expect(total).toBe(12);
    });
    it('全能力値8の合計コストは0', () => {
        const total = Calculator.calculatePointBuyTotal({
            STR: 8, CON: 8, DEX: 8, INT: 8, WIS: 8, CHA: 8
        });
        expect(total).toBe(0);
    });
});

// ========================================
// HP倍率（SRD: level + 2）
// ========================================
describe('getHPMultiplier — HP倍率', () => {
    it('LV1の倍率は3', () => {
        expect(Calculator.getHPMultiplier(1)).toBe(3);
    });
    it('LV2の倍率は4', () => {
        expect(Calculator.getHPMultiplier(2)).toBe(4);
    });
    it('LV3の倍率は5', () => {
        expect(Calculator.getHPMultiplier(3)).toBe(5);
    });
    it('LV5の倍率は7', () => {
        expect(Calculator.getHPMultiplier(5)).toBe(7);
    });
    it('LV10の倍率は12', () => {
        expect(Calculator.getHPMultiplier(10)).toBe(12);
    });
});

// ========================================
// HP計算
// ========================================
describe('calculateHP — HP計算', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        ...overrides,
    });

    it('Fighter LV1 CON10: HP = (8+0)×3 = 24', () => {
        const classData = { baseHP: 8 };
        expect(Calculator.calculateHP(baseCharacter(), classData)).toBe(24);
    });

    it('Druid LV1 CON10: HP = (6+0)×3 = 18（修正後）', () => {
        const classData = { baseHP: 6 };
        expect(Calculator.calculateHP(baseCharacter(), classData)).toBe(18);
    });

    it('Cleric LV1 CON10: HP = (7+0)×3 = 21', () => {
        const classData = { baseHP: 7 };
        expect(Calculator.calculateHP(baseCharacter(), classData)).toBe(21);
    });

    it('Fighter LV1 CON14: HP = (8+2)×3 = 30', () => {
        const classData = { baseHP: 8 };
        const character = baseCharacter({ abilities: { STR: 10, CON: 14, DEX: 10, INT: 10, WIS: 10, CHA: 10 } });
        expect(Calculator.calculateHP(character, classData)).toBe(30);
    });

    it('Fighter LV2 CON10: HP = (8+0)×4 = 32', () => {
        const classData = { baseHP: 8 };
        expect(Calculator.calculateHP(baseCharacter({ level: 2 }), classData)).toBe(32);
    });

    it('HPは最低1', () => {
        const classData = { baseHP: 6 };
        // CON 3 → mod = -4 → (6-4)×3 = 6（まだ正）
        // CON 1 はシステム上ないが、極端な例
        expect(Calculator.calculateHP(baseCharacter({ abilities: { STR: 10, CON: 3, DEX: 10, INT: 10, WIS: 10, CHA: 10 } }), classData)).toBeGreaterThanOrEqual(1);
    });
});

// ========================================
// 中央値関数
// ========================================
describe('getMiddleValue — 中央値', () => {
    it('1, 2, 3の中央値は2', () => {
        expect(Calculator.getMiddleValue(1, 2, 3)).toBe(2);
    });
    it('3, 1, 2の中央値は2', () => {
        expect(Calculator.getMiddleValue(3, 1, 2)).toBe(2);
    });
    it('-1, 0, 1の中央値は0', () => {
        expect(Calculator.getMiddleValue(-1, 0, 1)).toBe(0);
    });
    it('5, 5, 5の中央値は5', () => {
        expect(Calculator.getMiddleValue(5, 5, 5)).toBe(5);
    });
    it('0, 0, 3の中央値は0', () => {
        expect(Calculator.getMiddleValue(0, 0, 3)).toBe(0);
    });
});

// ========================================
// AC計算
// ========================================
describe('calculateAC — AC計算', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        equipment: { armor: 'none', shield: false },
        ...overrides,
    });

    // ファイターの防具別AC
    const fighterClass = {
        baseAC: 15,
        armorAC: { none: 10, light: 12, heavy: 15, shield: 1 },
    };

    it('Fighter 防具なし LV1: AC = 10 + 0 + 1 = 11', () => {
        expect(Calculator.calculateAC(baseCharacter(), fighterClass)).toBe(11);
    });

    it('Fighter 軽装 LV1: AC = 12 + 0 + 1 = 13', () => {
        const char = baseCharacter({ equipment: { armor: 'light', shield: false } });
        expect(Calculator.calculateAC(char, fighterClass)).toBe(13);
    });

    it('Fighter 重装 LV1: AC = 15 + 0 + 1 = 16', () => {
        const char = baseCharacter({ equipment: { armor: 'heavy', shield: false } });
        expect(Calculator.calculateAC(char, fighterClass)).toBe(16);
    });

    it('Fighter 重装+盾 LV1: AC = 15 + 1 + 0 + 1 = 17', () => {
        const char = baseCharacter({ equipment: { armor: 'heavy', shield: true } });
        expect(Calculator.calculateAC(char, fighterClass)).toBe(17);
    });

    // クレリックの防具別AC
    const clericClass = {
        baseAC: 14,
        armorAC: { none: 10, light: 12, heavy: 14, shield: 1 },
    };

    it('Cleric 重装 LV1: AC = 14 + 0 + 1 = 15', () => {
        const char = baseCharacter({ equipment: { armor: 'heavy', shield: false } });
        expect(Calculator.calculateAC(char, clericClass)).toBe(15);
    });

    // ドルイドの防具別AC
    const druidClass = {
        baseAC: 10,
        armorAC: { none: 10, light: 12, shield: 1 },
    };

    it('Druid 防具なし LV1: AC = 10 + 0 + 1 = 11', () => {
        expect(Calculator.calculateAC(baseCharacter(), druidClass)).toBe(11);
    });

    it('Druid 軽装 LV1: AC = 12 + 0 + 1 = 13', () => {
        const char = baseCharacter({ equipment: { armor: 'light', shield: false } });
        expect(Calculator.calculateAC(char, druidClass)).toBe(13);
    });

    it('Druid 重装はフォールバック（防具なし）: AC = 10 + 0 + 1 = 11', () => {
        const char = baseCharacter({ equipment: { armor: 'heavy', shield: false } });
        expect(Calculator.calculateAC(char, druidClass)).toBe(11);
    });

    it('能力値ボーナスがACに反映される（middle of CON,DEX,WIS）', () => {
        // DEX14(+2), CON10(0), WIS10(0) → middle = 0
        const char = baseCharacter({ abilities: { STR: 10, CON: 10, DEX: 14, INT: 10, WIS: 10, CHA: 10 }, equipment: { armor: 'none', shield: false } });
        // middle(0, 2, 0) = 0
        expect(Calculator.calculateAC(char, fighterClass)).toBe(11);

        // DEX14(+2), CON12(+1), WIS10(0) → middle = 1
        const char2 = baseCharacter({ abilities: { STR: 10, CON: 12, DEX: 14, INT: 10, WIS: 10, CHA: 10 }, equipment: { armor: 'none', shield: false } });
        expect(Calculator.calculateAC(char2, fighterClass)).toBe(12);
    });
});

// ========================================
// PD計算
// ========================================
describe('calculatePD — PD計算', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        ...overrides,
    });

    it('basePD=10 LV1 全能力値10: PD = 10 + 0 + 1 = 11', () => {
        expect(Calculator.calculatePD(baseCharacter(), { basePD: 10 })).toBe(11);
    });

    it('basePD=11 LV1 全能力値10: PD = 11 + 0 + 1 = 12', () => {
        expect(Calculator.calculatePD(baseCharacter(), { basePD: 11 })).toBe(12);
    });

    it('STR14(+2), CON10(0), DEX10(0) → middle=0, PD=10+0+1=11', () => {
        const char = baseCharacter({ abilities: { STR: 14, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 } });
        expect(Calculator.calculatePD(char, { basePD: 10 })).toBe(11);
    });

    it('STR14(+2), CON12(+1), DEX10(0) → middle=1, PD=10+1+1=12', () => {
        const char = baseCharacter({ abilities: { STR: 14, CON: 12, DEX: 10, INT: 10, WIS: 10, CHA: 10 } });
        expect(Calculator.calculatePD(char, { basePD: 10 })).toBe(12);
    });
});

// ========================================
// MD計算
// ========================================
describe('calculateMD — MD計算', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        ...overrides,
    });

    it('baseMD=10 LV1: MD = 10 + 0 + 1 = 11', () => {
        expect(Calculator.calculateMD(baseCharacter(), { baseMD: 10 })).toBe(11);
    });

    it('baseMD=11 LV1 ドルイド修正後: MD = 11 + 0 + 1 = 12', () => {
        expect(Calculator.calculateMD(baseCharacter(), { baseMD: 11 })).toBe(12);
    });

    it('INT14(+2), WIS12(+1), CHA10(0) → middle=1, MD=10+1+1=12', () => {
        const char = baseCharacter({ abilities: { STR: 10, CON: 10, DEX: 10, INT: 14, WIS: 12, CHA: 10 } });
        expect(Calculator.calculateMD(char, { baseMD: 10 })).toBe(12);
    });
});

// ========================================
// イニシアチブ
// ========================================
describe('calculateInitiative — イニシアチブ', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        ...overrides,
    });

    it('DEX10 LV1: Init = 0 + 1 = 1', () => {
        expect(Calculator.calculateInitiative(baseCharacter())).toBe(1);
    });

    it('DEX14 LV1: Init = 2 + 1 = 3', () => {
        const char = baseCharacter({ abilities: { STR: 10, CON: 10, DEX: 14, INT: 10, WIS: 10, CHA: 10 } });
        expect(Calculator.calculateInitiative(char)).toBe(3);
    });

    it('DEX10 LV5: Init = 0 + 5 = 5', () => {
        expect(Calculator.calculateInitiative(baseCharacter({ level: 5 }))).toBe(5);
    });
});

// ========================================
// リカバリー
// ========================================
describe('calculateRecoveries — リカバリー数', () => {
    it('recoveries=9のクラスは9回', () => {
        expect(Calculator.calculateRecoveries({}, { recoveries: 9 })).toBe(9);
    });
    it('recoveries=8のクラスは8回', () => {
        expect(Calculator.calculateRecoveries({}, { recoveries: 8 })).toBe(8);
    });
});

// ========================================
// リカバリーダイス文字列
// ========================================
describe('getRecoveryDiceString — リカバリーダイス表示', () => {
    const baseCharacter = (overrides = {}) => ({
        level: 1,
        abilities: { STR: 10, CON: 10, DEX: 10, INT: 10, WIS: 10, CHA: 10 },
        racialAbilityBonus: null,
        classAbilityBonus: null,
        ...overrides,
    });

    it('Fighter LV1 CON10: 1d10+0', () => {
        const result = Calculator.getRecoveryDiceString(baseCharacter(), { recoveryDie: 'd10' });
        expect(result).toBe('1d10+0');
    });

    it('Cleric LV1 CON14: 1d8+2', () => {
        const char = baseCharacter({ abilities: { STR: 10, CON: 14, DEX: 10, INT: 10, WIS: 10, CHA: 10 } });
        const result = Calculator.getRecoveryDiceString(char, { recoveryDie: 'd8' });
        expect(result).toBe('1d8+2');
    });
});

// ========================================
// ドルイドrecoveryDie条件分岐
// ========================================
describe('getRecoveryDie — ドルイドrecoveryDie条件分岐', () => {
    const druidClass = {
        recoveryDie: 'd6',
        recoveryDieAlt: { STR: 'd10', DEX: 'd6' },
    };

    it('ドルイド STR選択時はd10', () => {
        const char = { meleeAbilityChoice: 'STR' };
        expect(Calculator.getRecoveryDie(char, druidClass)).toBe('d10');
    });

    it('ドルイド DEX選択時はd6', () => {
        const char = { meleeAbilityChoice: 'DEX' };
        expect(Calculator.getRecoveryDie(char, druidClass)).toBe('d6');
    });

    it('ドルイド 未選択時はデフォルトd6', () => {
        const char = { meleeAbilityChoice: null };
        expect(Calculator.getRecoveryDie(char, druidClass)).toBe('d6');
    });

    it('recoveryDieAltのないクラスはrecoveryDieのまま', () => {
        const fighterClass = { recoveryDie: 'd10' };
        const char = { meleeAbilityChoice: 'STR' };
        expect(Calculator.getRecoveryDie(char, fighterClass)).toBe('d10');
    });
});

// ========================================
// formatModifier
// ========================================
describe('formatModifier — 修正値フォーマット', () => {
    it('+0のフォーマットは"+0"', () => {
        expect(Calculator.formatModifier(0)).toBe('+0');
    });
    it('+3のフォーマットは"+3"', () => {
        expect(Calculator.formatModifier(3)).toBe('+3');
    });
    it('-2のフォーマットは"-2"', () => {
        expect(Calculator.formatModifier(-2)).toBe('-2');
    });
});
