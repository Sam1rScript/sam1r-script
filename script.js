let scripts = [];
let partners = [];
let customGames = [];
let adminUnlocked = false;

// ===== ПУБЛИЧНАЯ ЗАГРУЗКА (БЕЗ ТОКЕНА) =====
function loadData() {
    var url = 'https://raw.githubusercontent.com/Sam1rScript/sam1r-script/main/data/scripts.json';
    
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
}

// ===== КОПИРОВАНИЕ =====
function copyScript(id) {
    var script = null;
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].id === id) {
            script = scripts[i];
            break;
        }
    }
    if (script) {
        navigator.clipboard.writeText(script.code).then(function() {
            showToast('Код скопирован', 'success');
        }).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = script.code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Код скопирован', 'success');
        });
    }
}

// ===== ОТОБРАЖЕНИЕ =====
function renderRecentScripts() {
    var container = document.getElementById('recentScripts');
    var recent = scripts.slice(-3).reverse();
    if (!recent.length) {
        container.innerHTML = '<div class="empty-state">Пока нет скриптов</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < recent.length; i++) {
        html += createScriptCard(recent[i], true);
    }
    container.innerHTML = html;
}

function renderAllScripts() {
    var container = document.getElementById('scriptsList');
    var search = document.getElementById('scriptsSearch').value.toLowerCase();
    var category = document.getElementById('scriptsFilter').value;
    var mode = document.getElementById('modeFilter').value;
    var filtered = [];
    for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        var match = true;
        if (category !== 'all' && s.category !== category) match = false;
        if (mode !== 'all' && s.mode !== mode) match = false;
        if (search && !s.name.toLowerCase().includes(search) && !s.desc.toLowerCase().includes(search)) match = false;
        if (match) filtered.push(s);
    }
    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state">Скрипты не найдены</div>';
    } else {
        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            html += createScriptCard(filtered[i], false);
        }
        container.innerHTML = html;
    }
    document.getElementById('scriptsCount').textContent = filtered.length;
}

function renderExploits() {
    var container = document.getElementById('exploitsList');
    container.innerHTML = '<div class="empty-state">Эксплойты появятся позже</div>';
}

function renderPartners() {
    var container = document.getElementById('partnersList');
    if (!partners.length) {
        container.innerHTML = '<span style="color: rgba(255,255,255,0.2); font-size: 14px;">Пока нет партнёров</span>';
    } else {
        var html = '';
        for (var i = 0; i < partners.length; i++) {
            var p = partners[i];
            html += '<a href="' + (p.link || '#') + '" target="_blank" class="partner-tag">';
            if (p.image) html += '<img src="' + p.image + '">';
            html += p.name + '</a>';
        }
        container.innerHTML = html;
    }
    var grid = document.getElementById('partnersGrid');
    if (!partners.length) {
        grid.innerHTML = '<div class="empty-state">Пока нет партнёров</div>';
    } else {
        var html = '';
        for (var i = 0; i < partners.length; i++) {
            var p = partners[i];
            html += '<div class="partner-card">';
            if (p.image) {
                html += '<img src="' + p.image + '">';
            } else {
                html += '<div style="width:64px;height:64px;border-radius:50%;background:rgba(139,92,246,0.2);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:28px;">&#129309;</div>';
            }
            html += '<h4>' + p.name + '</h4>';
            html += '<p>' + (p.desc || '') + '</p>';
            if (p.link) {
                html += '<a href="' + p.link + '" target="_blank" style="color:#8b5cf6;font-size:13px;text-decoration:none;margin-top:6px;display:inline-block;">Перейти &#8594;</a>';
            }
            html += '</div>';
        }
        grid.innerHTML = html;
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
    var html = '';
    html += '<div class="script-card">';
    html += imageDisplay;
    html += '<div class="script-info">';
    html += '<div class="script-name">' + s.name + ' <span class="script-tag">' + s.category + '</span>';
    if (s.mode) html += '<span class="script-mode-tag">' + modeLabel + '</span>';
    html += '</div>';
    html += '<div class="script-desc">' + s.desc + '</div>';
    html += '<div class="script-meta">' + s.date + '</div>';
    html += '</div>';
    html += '<div class="script-actions">';
    if (isRecent) {
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
    var current = select.value;
    select.innerHTML = '';
    var all = document.createElement('option');
    all.value = 'all';
    all.textContent = 'Все режимы';
    select.appendChild(all);
    var games = [];
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].mode && games.indexOf(scripts[i].mode) === -1) {
            games.push(scripts[i].mode);
        }
    }
    games.sort();
    for (var i = 0; i < games.length; i++) {
        var o = document.createElement('option');
        o.value = games[i];
        o.textContent = games[i].toUpperCase().replace(/_/g, ' ');
        select.appendChild(o);
    }
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value === current) {
            select.value = current;
            break;
        }
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
        pages[i].classList.remove('active');
    }
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.dataset.page === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    }
    var hero = document.getElementById('heroWrapper');
    if (hero) {
        if (page === 'home') {
            hero.classList.remove('hidden');
        } else {
            hero.classList.add('hidden');
        }
    }
    if (page === 'admin') {
        checkAdminAccess();
    }
}

function checkAdminAccess() {
    if (adminUnlocked) return;
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
    toast.className = 'toast ' + (type || '');
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
        toast.classList.remove('show');
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
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    document.getElementById('scriptsSearch').addEventListener('input', filterScripts);
    document.getElementById('scriptsFilter').addEventListener('change', filterScripts);
    document.getElementById('modeFilter').addEventListener('change', filterScripts);
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function(e) {
            e.preventDefault();
            navigate(this.dataset.page);
        });
    }
    var dateInput = document.getElementById('scriptDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
});


