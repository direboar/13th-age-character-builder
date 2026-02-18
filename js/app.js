/**
 * app.js — アプリケーションメインコントローラー
 * ウィザードのナビゲーションと各ステップの管理を担当する
 */

const app = (() => {
    // ステップ定義
    const STEPS = [
        { id: 1, module: StepRace, label: '種族選択' },
        { id: 2, module: StepClass, label: 'クラス選択' },
        { id: 3, module: StepAbilities, label: '能力値決定' },
        { id: 4, module: StepTalents, label: 'タレント選択' },
        { id: 5, module: StepSpells, label: '呪文/パワー' },
        { id: 6, module: StepBackgrounds, label: 'バックグラウンド' },
        { id: 7, module: StepIcons, label: 'Icon関係' },
        { id: 8, module: StepDetails, label: '詳細情報' },
        { id: 9, module: StepSummary, label: '完成・出力' },
    ];

    let currentStep = 1;

    /**
     * アプリケーションを初期化する
     */
    const init = async () => {
        showLoading(true);

        try {
            // 最初のステップを描画
            await renderStep(currentStep);
            updateNavigation();
        } catch (e) {
            console.error('初期化エラー:', e);
            showToast('アプリケーションの初期化に失敗しました', 'error');
        } finally {
            showLoading(false);
        }
    };

    /**
     * 指定されたステップを描画する
     * @param {number} stepNum - ステップ番号
     */
    const renderStep = async (stepNum) => {
        const step = STEPS.find(s => s.id === stepNum);
        if (!step) return;

        showLoading(true);
        try {
            const container = document.getElementById('stepContainer');
            const html = await step.module.render();
            container.innerHTML = html;

            // マウント後の処理（非同期処理が必要なコンポーネント用）
            if (step.module.onMount) {
                await step.module.onMount();
            }

            // ステップ番号を更新
            const stepNumEl = document.getElementById('currentStepNum');
            if (stepNumEl) stepNumEl.textContent = stepNum;

            // スクロールをトップに戻す
            container.scrollTop = 0;
        } catch (e) {
            console.error(`ステップ${stepNum}の描画エラー:`, e);
            showToast('ステップの読み込みに失敗しました', 'error');
        } finally {
            showLoading(false);
        }
    };

    /**
     * 次のステップに進む
     */
    const nextStep = async () => {
        const step = STEPS.find(s => s.id === currentStep);

        // バリデーション
        if (step && step.module.validate && !step.module.validate()) {
            return;
        }

        // ステップを完了済みにマーク
        CharacterState.markStepCompleted(currentStep);

        if (currentStep < STEPS.length) {
            currentStep++;
            await renderStep(currentStep);
            updateNavigation();
        }
    };

    /**
     * 前のステップに戻る
     */
    const prevStep = async () => {
        if (currentStep > 1) {
            currentStep--;
            await renderStep(currentStep);
            updateNavigation();
        }
    };

    /**
     * 指定したステップにジャンプする（完了済みステップのみ）
     * @param {number} stepNum - ジャンプ先ステップ番号
     */
    const goToStep = async (stepNum) => {
        const character = CharacterState.get();
        if (stepNum > currentStep && !character.completedSteps.includes(stepNum - 1)) {
            showToast('前のステップを完了してください', 'error');
            return;
        }

        currentStep = stepNum;
        await renderStep(currentStep);
        updateNavigation();
    };

    /**
     * ナビゲーションUIを更新する
     */
    const updateNavigation = () => {
        const character = CharacterState.get();

        // 前へ/次へボタン
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');

        if (btnPrev) btnPrev.disabled = currentStep <= 1;
        if (btnNext) {
            btnNext.disabled = currentStep >= STEPS.length;
            btnNext.textContent = currentStep >= STEPS.length ? '完成！' : '次へ →';
        }

        // サイドナビのステップ状態
        STEPS.forEach(step => {
            const navItem = document.getElementById(`navStep${step.id}`);
            if (!navItem) return;

            navItem.classList.remove('active', 'completed');

            if (step.id === currentStep) {
                navItem.classList.add('active');
            } else if (character.completedSteps.includes(step.id)) {
                navItem.classList.add('completed');
            }

            // クリックでジャンプ
            navItem.onclick = () => goToStep(step.id);
        });
    };

    /**
     * ローディングオーバーレイを表示/非表示にする
     * @param {boolean} show - 表示するか
     */
    const showLoading = (show) => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    };

    /**
     * トースト通知を表示する
     * @param {string} message - メッセージ
     * @param {string} type - 'success', 'error', 'info'
     */
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // 3秒後に削除
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // DOMContentLoaded後に初期化
    document.addEventListener('DOMContentLoaded', init);

    return {
        nextStep,
        prevStep,
        goToStep,
        showToast,
        showLoading,
    };
})();
