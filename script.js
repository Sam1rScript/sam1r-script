let scripts = [];
let customGames = [];

function loadData() {
    var status = document.getElementById('statusText');
    if (status) status.textContent = 'Загрузка данных...';
    
    fetch('https://raw.githubusercontent.com/ВАШ_НИК/sam1r-script/main/data/scripts.json')
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        })
        .then(function(data) {
            scripts = data.scripts || [];
            customGames = data.customGames || [];
            renderAll();
            if (status) status.textContent = 'Данные загружены';
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            if (status) status.textContent = 'Ошибка загрузки данных';
            showToast('Ошибка загрузки данных', 'error');
        });
}

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
        container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,0.3);">Скрипты не найдены</div>';
    } else {
        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            html += createScriptCard(filtered[i]);
        }
        container.innerHTML = html;
    }
    document.getElementById('scriptsCount').textContent = filtered.length;
}

function createScriptCard(s) {
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
    html += '<button class="btn-secondary" onclick="copyScript(' + s.id + ')">Копировать</button>';
    html += '<button class="btn-primary">Скачать</button>';
    html += '</div>';
    html += '</div>';
    return html;
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

function filterScripts() {
    renderAllScripts();
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

function renderAll() {
    renderAllScripts();
    updateModeFilter();
}

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    document.getElementById('scriptsSearch').addEventListener('input', filterScripts);
    document.getElementById('scriptsFilter').addEventListener('change', filterScripts);
    document.getElementById('modeFilter').addEventListener('change', filterScripts);
});