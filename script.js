var JSON_URL = 'https://raw.githubusercontent.com/Sam1rScript/sam1r-script/main/data/scripts.json';
        var allScripts = [];

        function loadData() {
            fetch(JSON_URL + '?t=' + Date.now())
                .then(function(response) {
                    if (!response.ok) throw new Error('Ошибка: ' + response.status);
                    return response.json();
                })
                .then(function(data) {
                    allScripts = data.scripts || [];
                    renderAll();
                    updateFilters();
                })
                .catch(function(error) {
                    document.getElementById('scriptsList').innerHTML = '<div class="error">Ошибка загрузки: ' + error.message + '</div>';
                });
        }

        function renderAll() {
            renderStats();
            renderScripts();
        }

        function renderStats() {
            document.getElementById('statScripts').textContent = allScripts.length;
            document.getElementById('statExploits').textContent = 0;
            document.getElementById('countLabel').textContent = allScripts.length + ' скриптов';
        }

        function renderScripts() {
            var container = document.getElementById('scriptsList');
            var search = document.getElementById('searchInput').value.toLowerCase();
            var category = document.getElementById('categoryFilter').value;
            var mode = document.getElementById('modeFilter').value;

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

        document.getElementById('searchInput').addEventListener('input', filterScripts);
        document.getElementById('categoryFilter').addEventListener('change', filterScripts);
        document.getElementById('modeFilter').addEventListener('change', filterScripts);

        loadData();

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) loadData();
        });
