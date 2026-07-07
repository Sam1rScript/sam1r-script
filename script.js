var JSON_URL = 'https://raw.githubusercontent.com/Sam1rScript/sam1r-script/main/data/scripts.json';
        var allScripts = [];
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
                panelExploits.textContent = 0;
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
                if (search && !s.name.toLowerCase().includes(search) && !s.desc.toLowerCase().includes(search)) match = false;
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
        }

        var searchInput = document.getElementById('searchInput');
        var categoryFilter = document.getElementById('categoryFilter');
        var modeFilter = document.getElementById('modeFilter');

        if (searchInput) {
            searchInput.addEventListener('input', filterScripts);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterScripts);
        }
        if (modeFilter) {
            modeFilter.addEventListener('change', filterScripts);
        }

        loadData();

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) loadData();
        });
