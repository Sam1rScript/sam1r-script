// ===== НАСТРОЙКИ GitHub =====
var GITHUB_TOKEN = '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';
var GITHUB_REPO = 'Sam1rScript/sam1r-script';
var DATA_FILE = 'data/scripts.json';

// ===== ОСТАЛЬНОЙ КОД =====

let scripts = [];
let partners = [];
let customGames = [];

function loadData() {
    updateStatus('Загрузка данных...', 'loading');
    
    fetch('https://raw.githubusercontent.com/' + GITHUB_REPO + '/main/' + DATA_FILE)
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        })
        .then(function(data) {
            scripts = data.scripts || [];
            partners = data.partners || [];
            customGames = data.customGames || [];
            renderAdminScripts();
            updateGameSelect();
            updateStatus('Данные загружены', 'ok');
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            updateStatus('Ошибка загрузки данных. Проверьте токен и репозиторий.', 'error');
            showToast('Ошибка загрузки данных', 'error');
        });
}

function updateStatus(text, type) {
    var status = document.getElementById('statusText');
    if (status) {
        status.innerHTML = text;
        status.className = 'status-text ' + (type || '');
    }
}

function syncData() {
    loadData();
}

function saveToGitHub(data) {
    updateStatus('Сохранение на GitHub...', 'loading');
    
    var jsonData = JSON.stringify(data, null, 2);
    var base64Data = btoa(unescape(encodeURIComponent(jsonData)));
    
    var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + DATA_FILE;
    
    fetch(url, {
        headers: {
            'Authorization': 'token ' + GITHUB_TOKEN,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Ошибка получения файла');
        return response.json();
    })
    .then(function(fileInfo) {
        var sha = fileInfo.sha;
        
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + GITHUB_TOKEN,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Обновление скриптов',
                content: base64Data,
                sha: sha,
                branch: 'main'
            })
        });
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Ошибка сохранения');
        return response.json();
    })
    .then(function() {
        updateStatus('Данные сохранены на GitHub', 'ok');
        showToast('Данные сохранены на GitHub', 'success');
    })
    .catch(function(error) {
        console.error('Ошибка:', error);
        updateStatus('Ошибка сохранения: ' + error.message, 'error');
        showToast('Ошибка сохранения на GitHub', 'error');
    });
}

function deleteScript(id) {
    if (!confirm('Удалить этот скрипт навсегда?')) return;
    var newScripts = [];
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].id !== id) {
            newScripts.push(scripts[i]);
        }
    }
    scripts = newScripts;
    var data = { scripts: scripts, partners: partners, customGames: customGames };
    saveToGitHub(data);
    renderAdminScripts();
    showToast('Скрипт удалён', 'error');
}

function toggleCustomGame() {
    var select = document.getElementById('scriptMode');
    var customGroup = document.getElementById('customGameGroup');
    if (select && customGroup) {
        customGroup.style.display = select.value === 'other' ? 'block' : 'none';
    }
}

function addCustomGame(gameName) {
    var trimmed = gameName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed) return null;
    var exists = false;
    for (var i = 0; i < customGames.length; i++) {
        if (customGames[i] === trimmed) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        customGames.push(trimmed);
        updateGameSelect();
    }
    return trimmed;
}

function updateGameSelect() {
    var select = document.getElementById('scriptMode');
    if (!select) return;
    var current = select.value;
    select.innerHTML = '';
    var games = [
        { value: 'doors', label: 'DOORS' },
        { value: 'sab', label: 'SAB' },
        { value: 'gag', label: 'GAG 2' },
        { value: 'bloxfruits', label: 'BLOX FRUITS' },
        { value: 'arsenal', label: 'ARSENAL' }
    ];
    for (var i = 0; i < games.length; i++) {
        var o = document.createElement('option');
        o.value = games[i].value;
        o.textContent = games[i].label;
        select.appendChild(o);
    }
    for (var i = 0; i < customGames.length; i++) {
        var o = document.createElement('option');
        o.value = customGames[i];
        o.textContent = customGames[i].toUpperCase().replace(/_/g, ' ');
        select.appendChild(o);
    }
    var o = document.createElement('option');
    o.value = 'other';
    o.textContent = 'Другое';
    select.appendChild(o);
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value === current) {
            select.value = current;
            break;
        }
    }
}

function saveScript() {
    var name = document.getElementById('scriptName').value.trim();
    var desc = document.getElementById('scriptDesc').value.trim();
    var category = document.getElementById('scriptCategory').value;
    var mode = document.getElementById('scriptMode').value;
    var date = document.getElementById('scriptDate').value;
    var code = document.getElementById('scriptCode').value.trim();
    var imageInput = document.getElementById('scriptImage');

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

    if (imageInput.files && imageInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            saveScriptData(name, desc, category, mode, date, code, e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        showToast('Добавьте картинку для скрипта', 'error');
    }
}

function saveScriptData(name, desc, category, mode, date, code, image) {
    var newScript = {
        id: Date.now(),
        name: name,
        desc: desc,
        category: category,
        mode: mode,
        date: date || new Date().toISOString().split('T')[0],
        code: code,
        image: image
    };
    scripts.push(newScript);
    
    var data = { scripts: scripts, partners: partners, customGames: customGames };
    saveToGitHub(data);
    
    renderAdminScripts();
    document.getElementById('scriptName').value = '';
    document.getElementById('scriptDesc').value = '';
    document.getElementById('scriptCode').value = '';
    document.getElementById('scriptDate').value = '';
    document.getElementById('scriptImage').value = '';
    document.getElementById('customGameInput').value = '';
    document.getElementById('customGameGroup').style.display = 'none';
    document.getElementById('scriptMode').value = 'doors';
    showToast('Скрипт добавлен', 'success');
}

function exportData() {
    var data = {
        scripts: scripts,
        partners: partners,
        customGames: customGames,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sam1r_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Данные экспортированы', 'success');
}

function importData(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (!data.scripts) {
                showToast('Неверный формат файла', 'error');
                return;
            }
            if (!confirm('Импортировать данные? Скриптов: ' + data.scripts.length)) return;
            scripts = data.scripts;
            partners = data.partners || [];
            customGames = data.customGames || [];
            var saveData = { scripts: scripts, partners: partners, customGames: customGames };
            saveToGitHub(saveData);
            renderAdminScripts();
            showToast('Импортировано: ' + scripts.length + ' скриптов', 'success');
        } catch (error) {
            showToast('Ошибка чтения файла', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (!confirm('Удалить ВСЕ данные? Это нельзя отменить!')) return;
    if (!confirm('Точно удалить всё?')) return;
    scripts = [];
    partners = [];
    customGames = [];
    var data = { scripts: scripts, partners: partners, customGames: customGames };
    saveToGitHub(data);
    renderAdminScripts();
    showToast('Все данные удалены', 'error');
}

function renderAdminScripts() {
    var container = document.getElementById('adminScriptsList');
    if (!container) return;
    if (!scripts.length) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);">Нет скриптов</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        html += '<div class="script-card">';
        html += '<div class="script-info">';
        html += '<div class="script-name">' + s.name + ' <span class="script-tag">' + s.category + '</span><span class="script-mode-tag">' + (s.mode || '').toUpperCase().replace(/_/g, ' ') + '</span></div>';
        html += '<div class="script-meta">' + s.date + '</div>';
        html += '</div>';
        html += '<div class="script-actions">';
        html += '<button class="btn-danger" onclick="deleteScript(' + s.id + ')">Удалить</button>';
        html += '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || '');
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

function checkAdminKey() {
    var key = document.getElementById('adminKey').value;
    var error = document.getElementById('authError');
    if (key === 'sam1r2025') {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('adminLayout').classList.add('active');
        var dateInput = document.getElementById('scriptDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        loadData();
    } else {
        error.textContent = 'Неверный ключ! Попробуйте снова.';
        document.getElementById('adminKey').value = '';
        document.getElementById('adminKey').focus();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('adminKey').focus();
});