var JSON_URL = 'https://raw.githubusercontent.com/Sam1rScript/sam1r-script/main/data/scripts.json';
var WEAO_API = 'https://weao.xyz/api/status/exploits';

var allScripts = [];
var allExploits = [];
var isLoading = false;

function loadData() {
    if (isLoading) return;
    isLoading = true;

    var listEl = document.getElementById('scriptsList');
    if (listEl) {
        listEl.innerHTML = '<div class="loading">Загрузка...</div>';
    }

    fetch(JSON_URL + '?t=' + Date.now())
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка: ' + response.status);
            return response.json();
        })
        .then(function(data) {
            allScripts = data.scripts || [];
            renderAll();
            updateFilters();
            isLoading = false;
        })
        .catch(function(error) {
            var listEl = document.getElementById('scriptsList');
            if (listEl) {
                listEl.innerHTML = '<div class="error">Ошибка загрузки: ' + error.message + '</div>';
            }
            isLoading = false;
        });

    loadExploits();
}

function loadExploits() {
    var listEl = document.getElementById('exploitsList');
    if (listEl) {
        listEl.innerHTML = '<div class="loading">Загрузка эксплойтов...</div>';
    }

    fetch(WEAO_API)
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка: ' + response.status);
            return response.json();
        })
        .then(function(data) {
            allExploits = data || [];
            renderExploits();
        })
        .catch(function(error) {
            var listEl = document.getElementById('exploitsList');
            if (listEl) {
                listEl.innerHTML = '<div class="error">Ошибка загрузки эксплойтов: ' + error.message + '</div>';
            }
        });
}

function renderAll() {
    renderStats();
    renderScripts();
}

function renderStats() {
    var panelScripts = document.getElementById('panelScripts');
    var panelExploits = document.getElementById('panelExploits');
    var countLabel = document.getElementById('countLabel');

    if (panelScripts) {
        panelScripts.textContent = allScripts.length;
    }
    if (panelExploits) {
        panelExploits.textContent = allExploits.filter(function(e) {
            return e.hidden !== true && e.private !== true;
        }).length;
    }
    if (countLabel) {
        countLabel.textContent = allScripts.length + ' скриптов';
    }
}

function renderScripts() {
    var container = document.getElementById('scriptsList');
    if (!container) return;

    var searchInput = document.getElementById('searchInput');
    var categoryFilter = document.getElementById('categoryFilter');
    var modeFilter = document.getElementById('modeFilter');

    var search = searchInput ? searchInput.value.toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value : 'all';
    var mode = modeFilter ? modeFilter.value : 'all';

    var filtered = allScripts.filter(function(s) {
        var match = true;
        if (category !== 'all' && s.category !== category) match = false;
        if (mode !== 'all' && s.mode !== mode) match = false;
        if (search && !s.name.toLowerCase().includes(search) && !s.desc.toLowerCase().includes(search)) match =
            false;
        return match;
    });

    if (!filtered.length) {
        container.innerHTML = '<div class="empty">Скриптов не найдено</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        html += createScriptHTML(filtered[i]);
    }
    container.innerHTML = html;
}

function createScriptHTML(s) {
    var modeLabel = s.mode ? s.mode.toUpperCase().replace(/_/g, ' ') : '';
    var tag = s.category ? '<span class="script-tag">' + s.category + '</span>' : '';
    var modeTag = s.mode ? '<span class="script-mode">' + modeLabel + '</span>' : '';

    return '<div class="script">' +
        '<div class="script-header">' +
        '<span class="script-name">' + (s.name || 'Без названия') + '</span>' +
        tag + modeTag +
        '</div>' +
        '<div class="script-desc">' + (s.desc || '') + '</div>' +
        '<div class="script-meta">' + (s.date || '') + '</div>' +
        '<div class="script-code">' +
        '<button class="copy-btn" onclick="copyCode(this, \'' + s.code.replace(/'/g, "\\'") + '\')">Копировать</button>' +
        s.code +
        '</div>' +
        '</div>';
}

function copyCode(btn, code) {
    navigator.clipboard.writeText(code).then(function() {
        btn.textContent = 'Скопировано!';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = 'Копировать';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(function() {
        var textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = 'Скопировано!';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = 'Копировать';
            btn.classList.remove('copied');
        }, 2000);
    });
}

function renderExploits() {
    var container = document.getElementById('exploitsList');
    if (!container) return;

    var searchInput = document.getElementById('exploitSearch');
    var platformFilter = document.getElementById('exploitPlatformFilter');
    var statusFilter = document.getElementById('exploitStatusFilter');

    var search = searchInput ? searchInput.value.toLowerCase() : '';
    var platform = platformFilter ? platformFilter.value : 'all';
    var status = statusFilter ? statusFilter.value : 'all';

    var filtered = allExploits.filter(function(e) {
        if (e.hidden === true || e.private === true) return false;

        var match = true;
        if (platform !== 'all' && e.platform !== platform) match = false;
        if (status === 'updated' && e.updateStatus !== true) match = false;
        if (status === 'outdated' && e.updateStatus !== false) match = false;
        if (search && !e.title.toLowerCase().includes(search)) match = false;
        return match;
    });

    var countLabel = document.getElementById('exploitCount');
    if (countLabel) {
        countLabel.textContent = filtered.length + ' эксплойтов';
    }
    var panelExploits = document.getElementById('panelExploits');
    if (panelExploits) {
        panelExploits.textContent = allExploits.filter(function(e) {
            return e.hidden !== true && e.private !== true;
        }).length;
    }

    if (!filtered.length) {
        container.innerHTML = '<div class="empty">Эксплойтов не найдено</div>';
        return;
    }

    filtered.sort(function(a, b) {
        if (a.updateStatus === b.updateStatus) return 0;
        if (a.updateStatus === true) return -1;
        return 1;
    });

    var html = '<div class="exploit-row">';
    for (var i = 0; i < filtered.length; i++) {
        html += createExploitHTML(filtered[i]);
    }
    html += '</div>';

    container.innerHTML = html;
}

function createExploitHTML(e) {
    var statusText = e.updateStatus ? 'Updated' : 'Not Updated';
    var statusClass = e.updateStatus ? 'status-updated' : 'status-outdated';
    var dotClass = e.updateStatus ? 'dot-updated' : 'dot-outdated';

    var costDisplay = e.cost || (e.free ? 'Free' : 'Unknown');
    var costClass = e.free ? 'exploit-free' : '';

    var uncDisplay = '';
    if (e.uncStatus === true) {
        uncDisplay = 'sUNC';
    } else if (e.uncStatus === false) {
        uncDisplay = 'sUNC';
    }

    return '<div class="exploit-card">' +
        '<div class="exploit-info">' +
        '<span class="exploit-name">' + e.title + '</span>' +
        '<span class="exploit-version">' + e.version + '</span>' +
        '<div class="exploit-meta">' +
        'Last updated: ' + e.updatedDate +
        (uncDisplay ? ' | ' + uncDisplay : '') +
        '</div>' +
        '</div>' +
        '<div class="exploit-status">' +
        '<span class="status-dot ' + dotClass + '"></span>' +
        '<span class="' + statusClass + '">' + statusText + '</span>' +
        '<span class="exploit-cost ' + costClass + '">' + costDisplay + '</span>' +
        '</div>' +
        '</div>';
}

function updateFilters() {
    var select = document.getElementById('modeFilter');
    if (!select) return;

    var current = select.value;
    var modes = {};
    for (var i = 0; i < allScripts.length; i++) {
        if (allScripts[i].mode) {
            modes[allScripts[i].mode] = true;
        }
    }
    var keys = Object.keys(modes).sort();
    select.innerHTML = '<option value="all">Все режимы</option>';
    for (var i = 0; i < keys.length; i++) {
        var label = keys[i].toUpperCase().replace(/_/g, ' ');
        select.innerHTML += '<option value="' + keys[i] + '">' + label + '</option>';
    }
    if (current) select.value = current;
}

function filterScripts() {
    renderScripts();
}

function filterExploits() {
    renderExploits();
}

function switchTab(tab) {
    document.querySelectorAll('.panel-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.content-section').forEach(function(el) {
        el.classList.remove('active');
    });

    var target = document.getElementById('content-' + tab);
    if (target) target.classList.add('active');

    if (tab === 'scripts') {
        setTimeout(function() {
            renderScripts();
        }, 100);
    }

    if (tab === 'exploits') {
        setTimeout(function() {
            renderExploits();
        }, 100);
    }
}

var searchInput = document.getElementById('searchInput');
var categoryFilter = document.getElementById('categoryFilter');
var modeFilter = document.getElementById('modeFilter');
var exploitSearch = document.getElementById('exploitSearch');
var exploitPlatformFilter = document.getElementById('exploitPlatformFilter');
var exploitStatusFilter = document.getElementById('exploitStatusFilter');

if (searchInput) {
    searchInput.addEventListener('input', filterScripts);
}
if (categoryFilter) {
    categoryFilter.addEventListener('change', filterScripts);
}
if (modeFilter) {
    modeFilter.addEventListener('change', filterScripts);
}
if (exploitSearch) {
    exploitSearch.addEventListener('input', filterExploits);
}
if (exploitPlatformFilter) {
    exploitPlatformFilter.addEventListener('change', filterExploits);
}
if (exploitStatusFilter) {
    exploitStatusFilter.addEventListener('change', filterExploits);
}

loadData();

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) loadData();
});
