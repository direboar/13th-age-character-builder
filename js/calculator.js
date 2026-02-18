/**
 * calculator.js — 13th Age ステータス計算エンジン
 * 13th Age固有の計算ロジックをすべて集約する
 */

const Calculator = (() => {

    /**
     * 能力値修正値を計算する
     * @param {number} score - 能力値
     * @returns {number} 修正値
     */
    const getModifier = (score) => {
        return Math.floor((score - 10) / 2);
    };

    /**
     * 修正値を表示用文字列に変換する（+/-付き）
     * @param {number} modifier - 修正値
     * @returns {string} 表示用文字列
     */
    const formatModifier = (modifier) => {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    };

    /**
     * 3つの値の中央値を求める（13th Age固有のAC/PD/MD計算）
     * 同値が2つ以上ある場合はその値を中央値とする
     * @param {number} a - 値1
     * @param {number} b - 値2
     * @param {number} c - 値3
     * @returns {number} 中央値
     */
    const getMiddleValue = (a, b, c) => {
        const sorted = [a, b, c].sort((x, y) => x - y);
        return sorted[1];
    };

    /**
     * 実際の能力値（種族・クラスボーナス込み）を計算する
     * @param {Object} character - キャラクターデータ
     * @returns {Object} 能力値オブジェクト
     */
    const getEffectiveAbilities = (character) => {
        const abilities = { ...character.abilities };

        // 種族ボーナス（+2）を適用
        if (character.racialAbilityBonus && abilities[character.racialAbilityBonus] !== undefined) {
            abilities[character.racialAbilityBonus] += 2;
        }

        // クラスボーナス（+2）を適用
        if (character.classAbilityBonus && abilities[character.classAbilityBonus] !== undefined) {
            abilities[character.classAbilityBonus] += 2;
        }

        return abilities;
    };

    /**
     * すべての能力値修正値を計算する
     * @param {Object} character - キャラクターデータ
     * @returns {Object} 修正値オブジェクト
     */
    const getAllModifiers = (character) => {
        const abilities = getEffectiveAbilities(character);
        const modifiers = {};
        for (const [key, value] of Object.entries(abilities)) {
            modifiers[key] = getModifier(value);
        }
        return modifiers;
    };

    /**
     * HPを計算する
     * 計算式: (クラスbaseHP + CON修正値) × 3 （LV1）
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {number} HP
     */
    const calculateHP = (character, classData) => {
        if (!classData) return 0;
        const mods = getAllModifiers(character);
        const conMod = mods.CON || 0;
        const hpValue = classData.baseHP + conMod;
        // LV1: × 3、LV2〜4: × 4、LV5〜7: × 5、LV8〜10: × 6（将来実装）
        const multiplier = getHPMultiplier(character.level);
        return Math.max(1, hpValue * multiplier);
    };

    /**
     * レベルに応じたHP倍率を返す
     * SRD: LV1=×3, LV2=×4, LV3=×5, ... LV10=×12
     * @param {number} level - レベル
     * @returns {number} 倍率
     */
    const getHPMultiplier = (level) => {
        return level + 2;
    };

    /**
     * ACを計算する
     * 計算式: 防具別baseAC + middle(CON, DEX, WIS) + レベル
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {number} AC
     */
    const calculateAC = (character, classData) => {
        if (!classData) return 0;
        const mods = getAllModifiers(character);
        const middleMod = getMiddleValue(mods.CON || 0, mods.DEX || 0, mods.WIS || 0);

        // 防具タイプに応じたbaseACを取得
        let baseAC = classData.baseAC;
        if (classData.armorAC && character.equipment) {
            const armorType = character.equipment.armor || 'none';
            // そのクラスが装備可能な防具かどうかチェック
            if (classData.armorAC[armorType] !== undefined) {
                baseAC = classData.armorAC[armorType];
            } else {
                // 装備不可の防具タイプの場合はデフォルト（なし）にフォールバック
                baseAC = classData.armorAC['none'] || classData.baseAC;
            }
            // 盾ボーナスを加算
            if (character.equipment.shield && classData.armorAC['shield']) {
                baseAC += classData.armorAC['shield'];
            }
        }

        return baseAC + middleMod + character.level;
    };

    /**
     * PDを計算する
     * 計算式: クラスbasePD + middle(STR, CON, DEX) + レベル
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {number} PD
     */
    const calculatePD = (character, classData) => {
        if (!classData) return 0;
        const mods = getAllModifiers(character);
        const middleMod = getMiddleValue(mods.STR || 0, mods.CON || 0, mods.DEX || 0);
        return classData.basePD + middleMod + character.level;
    };

    /**
     * MDを計算する
     * 計算式: クラスbaseMD + middle(INT, WIS, CHA) + レベル
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {number} MD
     */
    const calculateMD = (character, classData) => {
        if (!classData) return 0;
        const mods = getAllModifiers(character);
        const middleMod = getMiddleValue(mods.INT || 0, mods.WIS || 0, mods.CHA || 0);
        return classData.baseMD + middleMod + character.level;
    };

    /**
     * イニシアチブボーナスを計算する
     * 計算式: DEX修正値 + レベル
     * @param {Object} character - キャラクターデータ
     * @returns {number} イニシアチブボーナス
     */
    const calculateInitiative = (character) => {
        const mods = getAllModifiers(character);
        return (mods.DEX || 0) + character.level;
    };

    /**
     * リカバリー数を計算する
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {number} リカバリー数
     */
    const calculateRecoveries = (character, classData) => {
        if (!classData) return 8;
        return classData.recoveries || 8;
    };

    /**
     * リカバリーダイスを計算する（表示用）
     * 計算式: レベル × recoveryDie + CON修正値
     * ドルイドの場合、近接攻撃能力値がSTRならd10、DEXならd6
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {string} リカバリーダイス表示文字列
     */
    const getRecoveryDiceString = (character, classData) => {
        if (!classData) return '—';
        const mods = getAllModifiers(character);
        const conMod = mods.CON || 0;
        const die = getRecoveryDie(character, classData);
        const modStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
        return `${character.level}${die}${modStr}`;
    };

    /**
     * 有効なリカバリーダイスを取得する
     * ドルイドなどrecoveryDieAltを持つクラスの場合、
     * 近接攻撃能力値の選択に応じてダイスが変わる
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {string} ダイス文字列（例: 'd10'）
     */
    const getRecoveryDie = (character, classData) => {
        if (classData.recoveryDieAlt && character.meleeAbilityChoice) {
            return classData.recoveryDieAlt[character.meleeAbilityChoice] || classData.recoveryDie || 'd8';
        }
        return classData.recoveryDie || 'd8';
    };

    /**
     * 近接攻撃ボーナスを計算する
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {string} 攻撃ボーナス表示文字列
     */
    const getMeleeAttackBonus = (character, classData) => {
        if (!classData) return '—';
        const mods = getAllModifiers(character);
        let abilityMod = 0;

        if (classData.meleeAttack) {
            const ability = classData.meleeAttack.ability;
            if (ability === 'STR_OR_DEX') {
                abilityMod = Math.max(mods.STR || 0, mods.DEX || 0);
            } else {
                abilityMod = mods[ability] || 0;
            }
        }

        const total = abilityMod + character.level;
        return formatModifier(total);
    };

    /**
     * 遠距離攻撃ボーナスを計算する
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {string} 攻撃ボーナス表示文字列
     */
    const getRangedAttackBonus = (character, classData) => {
        if (!classData) return '—';
        const mods = getAllModifiers(character);
        const dexMod = mods.DEX || 0;
        const total = dexMod + character.level;
        return formatModifier(total);
    };

    /**
     * すべての計算済みステータスを返す
     * @param {Object} character - キャラクターデータ
     * @param {Object} classData - クラスデータ
     * @returns {Object} 計算済みステータス
     */
    const calculateAll = (character, classData) => {
        const abilities = getEffectiveAbilities(character);
        const modifiers = getAllModifiers(character);

        return {
            abilities,
            modifiers,
            hp: calculateHP(character, classData),
            ac: calculateAC(character, classData),
            pd: calculatePD(character, classData),
            md: calculateMD(character, classData),
            initiative: calculateInitiative(character),
            recoveries: calculateRecoveries(character, classData),
            recoveryDice: getRecoveryDiceString(character, classData),
            meleeAttackBonus: getMeleeAttackBonus(character, classData),
            rangedAttackBonus: getRangedAttackBonus(character, classData),
        };
    };

    /**
     * ポイントバイのコストを返す
     * @param {number} score - 能力値
     * @returns {number} コスト
     */
    const getPointBuyCost = (score) => {
        const costs = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7,
            15: 8, 16: 10, 17: 13, 18: 16
        };
        return costs[score] !== undefined ? costs[score] : -1;
    };

    /**
     * ポイントバイの合計コストを計算する
     * @param {Object} abilities - 能力値オブジェクト（ボーナス前）
     * @returns {number} 合計コスト
     */
    const calculatePointBuyTotal = (abilities) => {
        return Object.values(abilities).reduce((sum, score) => {
            return sum + getPointBuyCost(score);
        }, 0);
    };

    /**
     * Base 13ランダム生成を実行する
     * @returns {Object} 生成された能力値
     */
    const rollBase13 = () => {
        const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
        const keys = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'];
        const scores = [
            13 + dice[0] - dice[1],
            13 + dice[1] - dice[2],
            13 + dice[2] - dice[3],
            13 + dice[3] - dice[4],
            13 + dice[4] - dice[5],
            13 + dice[5] - dice[0],
        ];

        const result = {};
        keys.forEach((key, i) => {
            result[key] = Math.max(3, Math.min(20, scores[i]));
        });
        return result;
    };

    /**
     * 4d6ドロップ最低値でロールする
     * @returns {number} ロール結果
     */
    const roll4d6DropLowest = () => {
        const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => a - b);
        return rolls.slice(1).reduce((sum, n) => sum + n, 0);
    };

    /**
     * 全能力値を4d6ドロップ最低値でロールする
     * @returns {Object} ロール結果
     */
    const rollAllAbilities = () => {
        const keys = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'];
        const result = {};
        keys.forEach(key => {
            result[key] = roll4d6DropLowest();
        });
        return result;
    };

    /**
     * バックグラウンドポイントの合計を計算する
     * @param {Array} backgrounds - バックグラウンド配列
     * @returns {number} 合計ポイント
     */
    const getTotalBackgroundPoints = (backgrounds) => {
        return backgrounds.reduce((sum, bg) => sum + (bg.points || 0), 0);
    };

    /**
     * Icon Relationshipポイントの合計を計算する
     * @param {Array} iconRelationships - Icon Relationship配列
     * @returns {number} 合計ポイント
     */
    const getTotalIconPoints = (iconRelationships) => {
        return iconRelationships.reduce((sum, rel) => sum + (rel.points || 0), 0);
    };

    return {
        getModifier,
        formatModifier,
        getMiddleValue,
        getEffectiveAbilities,
        getAllModifiers,
        calculateHP,
        getHPMultiplier,
        calculateAC,
        calculatePD,
        calculateMD,
        calculateInitiative,
        calculateRecoveries,
        getRecoveryDiceString,
        getRecoveryDie,
        getMeleeAttackBonus,
        getRangedAttackBonus,
        calculateAll,
        getPointBuyCost,
        calculatePointBuyTotal,
        rollBase13,
        rollAllAbilities,
        getTotalBackgroundPoints,
        getTotalIconPoints,
    };
})();
