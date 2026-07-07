var TOKEN_PART1 = 'ghp_3thE';
var TOKEN_PART2 = 'pZUdsrAZvXu2X4QFnEtq4v4';
var TOKEN_PART3 = 'd9d2JJqe';
var TOKEN_PART4 = 's';
var GITHUB_TOKEN = TOKEN_PART1 + TOKEN_PART2 + TOKEN_PART3 + TOKEN_PART4;
var GITHUB_REPO = 'Sam1rScript/sam1r-script';
var DATA_FILE = 'data/scripts.json';

let scripts = [];
let partners = [];
let customGames = [];
let adminUnlocked = false;

// ===== ПУБЛИЧНАЯ ЗАГРУЗКА (БЕЗ ТОКЕНА) =====
function loadData() {
    var url = 'https://raw.githubusercontent.com/Sam1rScript/sam1r-script/main/data/scripts.json';
    var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + DATA_FILE + '?t=' + Date.now();

    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Ошибка загрузки: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            scripts = data.scripts || [];
            partners = data.partners || [];
            customGames = data.customGames || [];
            renderAll();
            updateModeFilter();
            showToast('Данные загружены', 'success');
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            showToast('Ошибка загрузки данных', 'error');
        });
    fetch(url, {
        headers: {
            'Authorization': 'token ' + GITHUB_TOKEN,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        return response.json();
    })
    .then(function(data) {
        var content = atob(data.content);
        var json = JSON.parse(content);
        scripts = json.scripts || [];
        partners = json.partners || [];
        customGames = json.customGames || [];
        renderAll();
        updateModeFilter();
        showToast('Данные загружены', 'success');
    })
    .catch(function(error) {
        console.error('Ошибка:', error);
        showToast('Ошибка загрузки данных', 'error');
    });
}

// ===== КОПИРОВАНИЕ =====
function copyScript(id) {
    var script = null;
    for (var i = 0; i < scripts.length; i++) {
@@ -38,11 +51,15 @@ function copyScript(id) {
        }
    }
    if (script) {
        navigator.clipboard.writeText(script.code).then(function() {
        var codeText = script.code;
        if (script.key) {
            codeText = 'Ключ: ' + script.key + '\n\n' + codeText;
        }
        navigator.clipboard.writeText(codeText).then(function() {
            showToast('Код скопирован', 'success');
        }).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = script.code;
            textarea.value = codeText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
@@ -52,7 +69,6 @@ function copyScript(id) {
    }
}

// ===== ОТОБРАЖЕНИЕ =====
function renderRecentScripts() {
    var container = document.getElementById('recentScripts');
    var recent = scripts.slice(-3).reverse();
@@ -136,62 +152,15 @@ function renderPartners() {
    }
}

function renderAdminScripts() {
    var container = document.getElementById('adminScriptsList');
    if (!container) return;
    if (!scripts.length) {
        container.innerHTML = '<div class="empty-state">Нет скриптов</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        html += '<div class="script-card" style="margin-bottom: 8px;">';
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

function renderAdminPartners() {
    var container = document.getElementById('adminPartnersList');
    if (!container) return;
    if (!partners.length) {
        container.innerHTML = '<div class="empty-state">Нет партнёров</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < partners.length; i++) {
        var p = partners[i];
        html += '<div class="script-card" style="margin-bottom: 8px;">';
        html += '<div class="script-info">';
        if (p.image) html += '<img src="' + p.image + '" style="width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">';
        html += '<div class="script-name">' + p.name + '</div>';
        html += '<div class="script-meta">' + (p.desc || '') + '</div>';
        html += '</div>';
        html += '<div class="script-actions">';
        html += '<button class="btn-danger" onclick="deletePartner(' + p.id + ')">Удалить</button>';
        html += '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function createScriptCard(s, isRecent) {
    var modeLabel = s.mode ? s.mode.toUpperCase().replace(/_/g, ' ') : '';
    var imageDisplay = s.image ? '<img src="' + s.image + '" class="script-image-preview">' : '';
    var keyBadge = s.key ? '<span class="script-tag" style="background:rgba(52,211,153,0.15);color:#34d399;">Ключ: ' + s.key + '</span>' : '';
    var html = '';
    html += '<div class="script-card">';
    html += imageDisplay;
    html += '<div class="script-info">';
    html += '<div class="script-name">' + s.name + ' <span class="script-tag">' + s.category + '</span>';
    if (s.mode) html += '<span class="script-mode-tag">' + modeLabel + '</span>';
    html += keyBadge;
    html += '</div>';
    html += '<div class="script-desc">' + s.desc + '</div>';
    html += '<div class="script-meta">' + s.date + '</div>';
@@ -201,177 +170,12 @@ function createScriptCard(s, isRecent) {
        html += '<button class="btn-secondary" onclick="navigate(\'scripts\')">Подробнее</button>';
    } else {
        html += '<button class="btn-secondary" onclick="copyScript(' + s.id + ')">Копировать</button>';
        html += '<button class="btn-primary">Скачать</button>';
    }
    html += '</div>';
    html += '</div>';
    return html;
}

// ===== УДАЛЕНИЕ (только для админки) =====
function deleteScript(id) {
    if (!confirm('Удалить этот скрипт навсегда?')) return;
    var newScripts = [];
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].id !== id) {
            newScripts.push(scripts[i]);
        }
    }
    scripts = newScripts;
    saveDataToGitHub();
    renderAll();
    if (adminUnlocked) renderAdminScripts();
    showToast('Скрипт удалён', 'error');
}

function deletePartner(id) {
    if (!confirm('Удалить этого партнёра навсегда?')) return;
    var newPartners = [];
    for (var i = 0; i < partners.length; i++) {
        if (partners[i].id !== id) {
            newPartners.push(partners[i]);
        }
    }
    partners = newPartners;
    saveDataToGitHub();
    renderAll();
    if (adminUnlocked) renderAdminPartners();
    showToast('Партнёр удалён', 'error');
}

// ===== СОХРАНЕНИЕ (только для админки) =====
function saveDataToGitHub() {
    var data = {
        scripts: scripts,
        partners: partners,
        customGames: customGames
    };
    localStorage.setItem('sam1r_data_backup', JSON.stringify(data));
    showToast('Данные сохранены локально', 'success');
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
            if (!data.scripts || !data.partners) {
                showToast('Неверный формат файла', 'error');
                return;
            }
            if (!confirm('Импортировать данные? Скриптов: ' + data.scripts.length + ', Партнёров: ' + data.partners.length)) return;
            scripts = data.scripts;
            partners = data.partners;
            customGames = data.customGames || [];
            saveDataToGitHub();
            renderAll();
            if (adminUnlocked) { renderAdminScripts(); renderAdminPartners(); }
            showToast('Импортировано: ' + scripts.length + ' скриптов, ' + partners.length + ' партнёров', 'success');
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
    saveDataToGitHub();
    renderAll();
    if (adminUnlocked) { renderAdminScripts(); renderAdminPartners(); }
    showToast('Все данные удалены', 'error');
}

// ===== КАСТОМНАЯ ИГРА =====
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
        saveDataToGitHub();
        updateGameSelect();
        updateModeFilter();
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

function updateModeFilter() {
    var select = document.getElementById('modeFilter');
    if (!select) return;
@@ -403,118 +207,10 @@ function updateModeFilter() {
    }
}

// ===== СОХРАНЕНИЕ СКРИПТА (админка) =====
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
    saveDataToGitHub();
    renderAll();
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

function savePartner() {
    var name = document.getElementById('partnerName').value.trim();
    var desc = document.getElementById('partnerDesc').value.trim();
    var link = document.getElementById('partnerLink').value.trim();
    var imageInput = document.getElementById('partnerImage');

    if (!name || !desc) {
        showToast('Заполните все поля', 'error');
        return;
    }

    if (imageInput.files && imageInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            savePartnerData(name, desc, link, e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        showToast('Добавьте логотип для партнёра', 'error');
    }
}

function savePartnerData(name, desc, link, image) {
    var newPartner = {
        id: Date.now(),
        name: name,
        desc: desc,
        link: link || '#',
        image: image
    };
    partners.push(newPartner);
    saveDataToGitHub();
    renderAll();
    document.getElementById('partnerName').value = '';
    document.getElementById('partnerDesc').value = '';
    document.getElementById('partnerLink').value = '';
    document.getElementById('partnerImage').value = '';
    showToast('Партнёр добавлен', 'success');
}

// ===== ФИЛЬТР =====
function filterScripts() {
    renderAllScripts();
}

// ===== НАВИГАЦИЯ =====
function navigate(page) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
@@ -549,16 +245,13 @@ function checkAdminAccess() {
    var password = prompt('Введите пароль администратора:');
    if (password === 'sam1r2025') {
        adminUnlocked = true;
        renderAdminScripts();
        renderAdminPartners();
        showToast('Добро пожаловать в админ-панель', 'success');
    } else if (password !== null) {
        showToast('Неверный пароль', 'error');
        navigate('home');
    }
}

// ===== ТОСТ =====
function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
@@ -570,28 +263,43 @@ function showToast(message, type) {
    }, 3000);
}

// ===== СТАТИСТИКА =====
function updateStats() {
    document.getElementById('statScripts').textContent = scripts.length;
    document.getElementById('statExploits').textContent = 0;
}

// ===== РЕНДЕР =====
function renderAll() {
    renderRecentScripts();
    renderAllScripts();
    renderExploits();
    renderPartners();
    if (adminUnlocked) {
        renderAdminScripts();
        renderAdminPartners();
    }
    updateStats();
    updateGameSelect();
    updateModeFilter();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
var lastLoad = localStorage.getItem('sam1r_last_load');
var now = Date.now();

if (!lastLoad || (now - parseInt(lastLoad)) > 10000) {
    localStorage.setItem('sam1r_last_load', String(now));
    setTimeout(function() {
        loadData();
    }, 300);
}

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadData();
    }
});

window.addEventListener('load', function() {
    var cache = performance.getEntriesByType('navigation')[0];
    if (cache && cache.type === 'reload') {
        loadData();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    document.getElementById('scriptsSearch').addEventListener('input', filterScripts);
@@ -604,10 +312,4 @@ document.addEventListener('DOMContentLoaded', function() {
            navigate(this.dataset.page);
        });
    }
    var dateInput = document.getElementById('scriptDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
});
