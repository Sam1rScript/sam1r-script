// ===== СОХРАНЕНИЕ СКРИПТА (БЕЗ КАРТИНКИ) =====
function saveScript() {
    var name = document.getElementById('scriptName').value.trim();
    var desc = document.getElementById('scriptDesc').value.trim();
    var category = document.getElementById('scriptCategory').value;
    var mode = document.getElementById('scriptMode').value;
    var date = document.getElementById('scriptDate').value;
    var code = document.getElementById('scriptCode').value.trim();

    if (mode === 'other') {
        var customInput = document.getElementById('customGameInput').value.trim();
        if (!customInput) {
            showToast('Введите название игры', 'error');
            return;
        }
        var newGame = addCustomGame(customInput);
        if (newGame) {
            mode = newGame;
        } else {
            showToast('Ошибка при добавлении игры', 'error');
            return;
        }
    }

    if (!name || !desc || !code) {
        showToast('Заполните все поля', 'error');
        return;
    }

    saveScriptData(name, desc, category, mode, date, code);
}

function saveScriptData(name, desc, category, mode, date, code) {
    var newScript = {
        id: Date.now(),
        name: name,
        desc: desc,
        category: category,
        mode: mode,
        date: date || new Date().toISOString().split('T')[0],
        code: code
    };
    
    scripts.push(newScript);
    
    var data = { scripts: scripts, partners: partners, customGames: customGames };
    saveToGitHub(data);
    
    document.getElementById('scriptName').value = '';
    document.getElementById('scriptDesc').value = '';
    document.getElementById('scriptCode').value = '';
    document.getElementById('scriptDate').value = '';
    document.getElementById('customGameInput').value = '';
    document.getElementById('customGameGroup').style.display = 'none';
    document.getElementById('scriptMode').value = 'doors';
    showToast('Скрипт добавлен', 'success');
}
