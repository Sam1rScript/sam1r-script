var GITHUB_REPO = 'Sam1rScript/sam1r-script';
var DATA_FILE = 'data/scripts.json';

let scripts = [];
let partners = [];
let customGames = [];

function loadData() {
    var url = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/main/' + DATA_FILE + '?t=' + Date.now();
    
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

function copyScript(id) {
    var script = null;
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].id === id) {
            script = scripts[i];
            break;
        }
    }
    if (script) {
        var text = script.code;
        if (script.key) {
            text = 'Key: ' + script.key + '\n\n' + text;
        }
        navigator.clipboard.writeText(text).then(function() {
            showToast('Copied!', 'success');
        }).catch(function() {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied!', 'success');
        });
    }
}

function renderRecentScripts() {
    var container = document.getElementById('recentScripts');
    var recent = scripts.slice(-3).reverse();
    if (!recent.length) {
        container.innerHTML = '<div class="empty-state">No scripts yet</div>';
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
        container.innerHTML = '<div class="empty-state">Scripts not found</div>';
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
    container.innerHTML = '<div class="empty-state">Exploits coming soon</div>';
}

function renderPartners() {
    var container = document.getElementById('partnersList');
    if (!partners.length) {
        container.innerHTML = '<span style="color: rgba(255,255,255,0.2); font-size: 14px;">No partners yet</span>';
    } else {
        var html = '';
        for (var i = 0; i < partners.length; i++) {
            var p = partners[i];
            html += '<a href="' + (p.link || '#') + '" target="_blank" class="partner-tag">' + p.name + '</a>';
        }
        container.innerHTML = html;
    }
    var grid = document.getElementById('partnersGrid');
    if (!partners.length) {
        grid.innerHTML = '<div class="empty-state">No partners yet</div>';
    } else {
        var html = '';
        for (var i = 0; i < partners.length; i++) {
            var p = partners[i];
            html += '<div class="partner-card">' + p.name + '</div>';
        }
        grid.innerHTML = html;
    }
}

function createScriptCard(s, isRecent) {
    var modeLabel = s.mode ? s.mode.toUpperCase().replace(/_/g, ' ') : '';
    var keyBadge = s.key ? '<span class="script-tag" style="background:rgba(52,211,153,0.15);color:#34d399;">Key: ' + s.key + '</span>' : '';
    var html = '';
    html += '<div class="script-card">';
    html += '<div class="script-info">';
    html += '<div class="script-name">' + s.name + ' <span class="script-tag">' + s.category + '</span>';
    if (s.mode) html += '<span class="script-mode-tag">' + modeLabel + '</span>';
    html += keyBadge;
    html += '</div>';
    html += '<div class="script-desc">' + s.desc + '</div>';
    html += '<div class="script-meta">' + s.date + '</div>';
    html += '</div>';
    html += '<div class="script-actions">';
    if (isRecent) {
        html += '<button class="btn-secondary" onclick="document.getElementById(\'page-scripts\').scrollIntoView()">View all</button>';
    } else {
        html += '<button class="btn-secondary" onclick="copyScript(' + s.id + ')">Copy</button>';
    }
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
    all.textContent = 'All modes';
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

function updateStats() {
    document.getElementById('statScripts').textContent = scripts.length;
    document.getElementById('statExploits').textContent = 0;
}

function renderAll() {
    renderRecentScripts();
    renderAllScripts();
    renderExploits();
    renderPartners();
    updateStats();
    updateModeFilter();
}

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
    document.getElementById('scriptsFilter').addEventListener('change', filterScripts);
    document.getElementById('modeFilter').addEventListener('change', filterScripts);
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function(e) {
            e.preventDefault();
            navigate(this.dataset.page);
        });
    }
});
