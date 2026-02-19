/**
 * state.js — キャラクター状態管理
 * キャラクターデータの保持と変更通知を担当する
 */

const CharacterState = (() => {
  // キャラクターデータの初期状態
  const defaultCharacter = {
    // 基本情報
    name: '',
    level: 1,

    // 種族・クラス
    race: null,
    class: null,
    racialAbilityBonus: null,  // 種族ボーナスを付与する能力値
    classAbilityBonus: null,   // クラスボーナスを付与する能力値
    meleeAbilityChoice: null,  // 近接攻撃能力値の選択（STR or DEX、ドルイド用）

    // 能力値
    abilityMethod: 'pointbuy', // 'roll', 'pointbuy', 'base13'
    abilities: {
      STR: 10,
      CON: 10,
      DEX: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    },

    // 選択タレント（IDの配列）
    selectedTalents: [],

    // 選択呪文/パワー（IDの配列）
    selectedSpells: [],

    // 選択マニューバ（IDの配列）
    selectedManeuvers: [],

    // バックグラウンド（名前とポイントのオブジェクト配列）
    backgrounds: [
      { name: '', points: 0 },
      { name: '', points: 0 },
      { name: '', points: 0 },
    ],

    // Icon Relationships（{iconId, type, points}の配列）
    iconRelationships: [],

    // One Unique Thing
    oneUniqueThing: '',

    // 装備
    equipment: {
      armor: 'none',
      meleeWeapon: '',
      rangedWeapon: '',
      shield: false,
    },

    // 完成フラグ（各ステップ）
    completedSteps: [],
  };

  // 現在のキャラクターデータ
  let character = JSON.parse(JSON.stringify(defaultCharacter));

  // 変更リスナー
  const listeners = [];

  /**
   * 変更リスナーを登録する
   * @param {Function} listener - 変更時に呼び出されるコールバック
   */
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  };

  /**
   * すべてのリスナーに変更を通知する
   */
  const notify = () => {
    listeners.forEach(listener => listener(character));
  };

  /**
   * キャラクターデータを更新する
   * @param {Object} updates - 更新するプロパティ
   */
  const update = (updates) => {
    character = { ...character, ...updates };
    notify();
  };

  /**
   * ネストされたプロパティを更新する
   * @param {string} path - ドット区切りのプロパティパス
   * @param {*} value - 設定する値
   */
  const updateNested = (path, value) => {
    const keys = path.split('.');
    const newChar = JSON.parse(JSON.stringify(character));
    let obj = newChar;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    character = newChar;
    notify();
  };

  /**
   * 能力値を設定する（種族・クラスボーナスを含む）
   * @param {string} ability - 能力値名（STR, CON等）
   * @param {number} baseValue - ベース値
   */
  const setAbility = (ability, baseValue) => {
    const newAbilities = { ...character.abilities, [ability]: baseValue };
    character = { ...character, abilities: newAbilities };
    notify();
  };

  /**
   * タレントを選択/解除する
   * @param {string} talentId - タレントID
   * @param {number} maxCount - 最大選択数
   */
  const toggleTalent = (talentId, maxCount) => {
    const current = [...character.selectedTalents];
    const index = current.indexOf(talentId);

    if (index > -1) {
      // 選択解除
      current.splice(index, 1);
    } else if (current.length < maxCount) {
      // 選択追加
      current.push(talentId);
    } else {
      return false; // 最大数に達している
    }

    character = { ...character, selectedTalents: current };
    notify();
    return true;
  };

  /**
   * 呪文/パワーを選択/解除する
   * @param {string} spellId - 呪文ID
   */
  const toggleSpell = (spellId) => {
    const current = [...character.selectedSpells];
    const index = current.indexOf(spellId);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(spellId);
    }

    character = { ...character, selectedSpells: current };
    notify();
  };

  /**
   * マニューバを選択/解除する
   * @param {string} maneuverId - マニューバID
   * @param {number} maxCount - 最大選択数
   */
  const toggleManeuver = (maneuverId, maxCount) => {
    const current = [...character.selectedManeuvers || []];
    const index = current.indexOf(maneuverId);

    if (index > -1) {
      current.splice(index, 1);
    } else if (current.length < maxCount) {
      current.push(maneuverId);
    } else {
      return false;
    }

    character = { ...character, selectedManeuvers: current };
    notify();
    return true;
  };

  /**
   * Icon Relationshipを設定する
   * @param {string} iconId - IconのID
   * @param {string} type - 'positive', 'conflicted', 'negative', null
   * @param {number} points - ポイント数（1〜3）
   */
  const setIconRelationship = (iconId, type, points) => {
    let relationships = character.iconRelationships.filter(r => r.iconId !== iconId);

    if (type && points > 0) {
      relationships.push({ iconId, type, points });
    }

    character = { ...character, iconRelationships: relationships };
    notify();
  };

  /**
   * バックグラウンドを更新する
   * @param {number} index - バックグラウンドのインデックス
   * @param {string} name - バックグラウンド名
   * @param {number} points - ポイント数
   */
  const updateBackground = (index, name, points) => {
    const backgrounds = [...character.backgrounds];
    backgrounds[index] = { name, points };
    character = { ...character, backgrounds };
    notify();
  };

  /**
   * バックグラウンドを追加する
   */
  const addBackground = () => {
    const backgrounds = [...character.backgrounds, { name: '', points: 0 }];
    character = { ...character, backgrounds };
    notify();
  };

  /**
   * バックグラウンドを削除する
   * @param {number} index - 削除するインデックス
   */
  const removeBackground = (index) => {
    const backgrounds = character.backgrounds.filter((_, i) => i !== index);
    character = { ...character, backgrounds };
    notify();
  };

  /**
   * ステップを完了済みにマークする
   * @param {number} step - ステップ番号
   */
  const markStepCompleted = (step) => {
    if (!character.completedSteps.includes(step)) {
      const completedSteps = [...character.completedSteps, step];
      character = { ...character, completedSteps };
      notify();
    }
  };

  /**
   * 現在のキャラクターデータを取得する
   */
  const get = () => character;

  /**
   * キャラクターをリセットする
   */
  const reset = () => {
    character = JSON.parse(JSON.stringify(defaultCharacter));
    notify();
  };

  /**
   * キャラクターをJSONとしてエクスポートする
   */
  const exportJSON = () => {
    const data = JSON.stringify(character, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}_13thage.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * JSONからキャラクターをインポートする
   * @param {string} jsonString - JSONデータ
   */
  const importJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      character = { ...defaultCharacter, ...data };
      notify();
      return true;
    } catch (e) {
      console.error('インポートエラー:', e);
      return false;
    }
  };

  return {
    subscribe,
    update,
    updateNested,
    setAbility,
    toggleTalent,
    toggleSpell,
    toggleManeuver,
    setIconRelationship,
    updateBackground,
    addBackground,
    removeBackground,
    markStepCompleted,
    get,
    reset,
    exportJSON,
    importJSON,
  };
})();
