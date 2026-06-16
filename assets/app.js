(function () {
    'use strict';

    let techniques = [];
    const activeTags = new Set();

    const $ = (id) => document.getElementById(id);
    const tmpl = (id) => document.getElementById(id).content.cloneNode(true);

    const grid = $('techniques-grid');
    const searchInput = $('search');
    const resultsCount = $('results-count');
    const modalOverlay = $('modal-overlay');
    const modalContent = $('modal-content');

    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        }
    });

    function renderMarkdown(container, text) {
        if (!text) return;
        const raw = marked.parse(text);
        const clean = DOMPurify.sanitize(raw);
        const doc = new DOMParser().parseFromString(clean, 'text/html');
        while (doc.body.firstChild) {
            container.appendChild(document.adoptNode(doc.body.firstChild));
        }
    }

    fetch('assets/data.json')
        .then(r => r.json())
        .then(data => {
            techniques = data;
            buildFilters();
            renderCards();
            handleHash();
        });

    function buildFilters() {
        const tags = [...new Set(techniques.flatMap(t => t.tags || []))].sort();
        const container = $('tag-filters');
        for (const tag of tags) {
            const frag = tmpl('filter-btn-template');
            const btn = frag.querySelector('.filter-btn');
            btn.textContent = tag;
            btn.dataset.value = tag.toLowerCase();
            btn.addEventListener('click', () => {
                const val = tag.toLowerCase();
                if (activeTags.has(val)) {
                    activeTags.delete(val);
                    btn.classList.remove('active');
                } else {
                    activeTags.add(val);
                    btn.classList.add('active');
                }
                renderCards();
            });
            container.appendChild(frag);
        }
    }

    function renderCards() {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = techniques.filter(t => {
            const name = (t.name || '').toLowerCase();
            const desc = (typeof t.description === 'string' ? t.description : '').toLowerCase();
            const exploitation = (typeof t.exploitation === 'string' ? t.exploitation : '').toLowerCase();
            const tags = (t.tags || []).map(x => x.toLowerCase());

            const matchesSearch = !query ||
                name.includes(query) || desc.includes(query) ||
                exploitation.includes(query) ||
                tags.some(x => x.includes(query));

            const matchesTags = activeTags.size === 0 ||
                tags.some(x => activeTags.has(x));

            return matchesSearch && matchesTags;
        });

        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        grid.replaceChildren();
        for (const t of filtered) {
            grid.appendChild(createCard(t));
        }
        resultsCount.textContent = filtered.length;
    }

    function createCard(t) {
        const frag = tmpl('card-template');
        const card = frag.querySelector('.technique-card');
        card.dataset.slug = t._slug;
        card.querySelector('.card-name').textContent = t.name;
        card.querySelector('.card-id').textContent = t.id;
        card.querySelector('.card-description').textContent =
            typeof t.description === 'string' ? t.description.trim() : '';

        const tagsContainer = card.querySelector('.card-tags');
        for (const tag of (t.tags || [])) {
            tagsContainer.appendChild(createTag(tag));
        }

        card.addEventListener('click', () => { window.location.hash = t._slug; });
        return frag;
    }

    function createTag(text) {
        const frag = tmpl('tag-template');
        const span = frag.querySelector('.tag');
        span.textContent = text;
        return frag;
    }

    function openModal(slug) {
        const t = techniques.find(x => x._slug === slug);
        if (!t) return;

        modalContent.replaceChildren();
        const frag = tmpl('modal-detail-template');

        frag.querySelector('.technique-name').textContent = t.name;
        frag.querySelector('.technique-id').textContent = t.id;
        frag.querySelector('.meta-author').textContent = `Author: ${t.author || ''}`;

        const tagsEl = frag.querySelector('.technique-tags');
        for (const tag of (t.tags || [])) {
            tagsEl.appendChild(createTag(tag));
        }

        // Description
        const descSection = frag.querySelector('[data-section="description"]');
        if (t.description) {
            renderMarkdown(descSection.querySelector('.section-content'), t.description);
        } else {
            descSection.remove();
        }

        // Exploitation
        const exploitSection = frag.querySelector('[data-section="exploitation"]');
        if (t.exploitation) {
            renderMarkdown(exploitSection.querySelector('.section-content'), t.exploitation);
        } else {
            exploitSection.remove();
        }

        // References
        const refSection = frag.querySelector('[data-section="references"]');
        if (t.references && t.references.length > 0) {
            const list = refSection.querySelector('.references-list');
            for (const ref of t.references) {
                const li = tmpl('reference-template');
                const link = li.querySelector('.ref-url');
                link.href = ref.url;
                link.textContent = ref.url;
                li.querySelector('.ref-description').textContent = ref.description || '';
                list.appendChild(li);
            }
        } else {
            refSection.remove();
        }

        modalContent.appendChild(frag);
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        history.replaceState(null, '', window.location.pathname);
    }

    $('modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    function handleHash() {
        const hash = window.location.hash.slice(1);
        if (hash) openModal(hash);
    }
    window.addEventListener('hashchange', handleHash);

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(renderCards, 150);
    });
})();
