const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const isLabs = window.location.hostname.includes('labs.perplexity.ai');
    const isMain = window.location.hostname.includes('perplexity.ai') && !isLabs;

    const mainSelectors = [
        'div.items-stretch.md\\:items-center.fill-mode-both.fixed.bottom-0.left-0.right-0.top-0.bg-backdrop\\/70.backdrop-blur-sm.animate-in.fade-in.ease-outExpo.duration-200',
        'div.max-w-\\[400px\\].overflow-hidden.rounded-xl.md\\:flex.md\\:max-w-\\[960px\\].border-borderMain\\/50',
        'relative.flex.flex-col.p-lg.md\\:w-\\[45\\%\\].md\\:p-xl',
        'md\\:h-\\[55\\%\\].md\\:w-\\[55\\%\\]',
        'rounded-lg.p-md.duration-300.ease-out.animate-in.fade-in.\\!p-lg.border-borderMain\\/50.ring-borderMain\\/50.divide-borderMain\\/50.dark\\:divide-borderMainDark\\/50.dark\\:ring-borderMainDark\\/50.dark\\:border-borderMainDark\\/50.bg-offset.dark\\:bg-offsetDark',
        
    ];

    const labsSelectors = [
        'div.flex.items-center.gap-sm'
    ];


    // Perplexity keeps Discover, Finance, Personal CFO, Health, Academic and
    // Patents behind the top-right menu, two clicks away. A user can promote
    // any of them into its left sidebar from Settings; nothing is added unless
    // they ask for it, so the default install leaves Perplexity's UI alone.
    //
    // The menu entries do not exist in the DOM until that menu is opened, so
    // they cannot be moved -- each one is rebuilt by cloning a real sidebar
    // row, which inherits Perplexity's markup, spacing and theming. Icons come
    // from their own sprite.
    const AVAILABLE_SHORTCUTS = [
        { id: 'discover', label: 'Discover',     path: '/discover', icon: 'pplx-icon-compass' },
        { id: 'finance',  label: 'Finance',      path: '/finance',  icon: 'pplx-icon-chart-area-line' },
        { id: 'cfo',      label: 'Personal CFO', path: '/cfo',      icon: 'pplx-icon-wallet' },
        { id: 'health',   label: 'Health',       path: '/health',   icon: 'pplx-icon-heart' },
        { id: 'academic', label: 'Academic',     path: '/academic', icon: 'pplx-icon-school' },
        { id: 'patents',  label: 'Patents',      path: '/patents',  icon: 'pplx-icon-gavel' },
    ];

    const INJECTED_ATTR = 'data-simplexity-shortcut';
    let enabledIds = [];
    let injecting = false;

    function setLabel(clone, text) {
        // The label is the truncating text node in the cloned row. Matching on
        // the class is far more reliable than walking for "the last leaf with
        // text", which picked the wrong node and left every row reading "New".
        const el = clone.querySelector('[class*="truncate"]')
            || [...clone.querySelectorAll('div, span')]
                .reverse()
                .find((d) => d.children.length === 0 && d.textContent.trim().length > 0);
        if (el) el.textContent = text;
        return !!el;
    }

    function syncSidebarLinks() {
        if (injecting) return;

        const nav = document.querySelector('nav[class*="group/sidebar"]');
        if (!nav) return;

        injecting = true;
        try {
            // Drop anything the user has since unticked.
            nav.querySelectorAll('[' + INJECTED_ATTR + ']').forEach((el) => {
                if (!enabledIds.includes(el.getAttribute(INJECTED_ATTR))) el.remove();
            });

            const wanted = AVAILABLE_SHORTCUTS.filter((s) => enabledIds.includes(s.id));
            if (!wanted.length) return;

            // Never clone one of our own rows, or the edits compound.
            const templateAnchor = [...nav.querySelectorAll('a[href^="/"][class*="absolute"]')]
                .find((a) => !a.closest('[' + INJECTED_ATTR + ']'));
            if (!templateAnchor) return;

            const template = templateAnchor.closest('[class*="collapsible-sidebar-section"]');
            if (!template || !template.parentElement) return;

            let after = template;
            const existing = nav.querySelectorAll('[' + INJECTED_ATTR + ']');
            if (existing.length) after = existing[existing.length - 1];

            for (const link of wanted) {
                if (nav.querySelector('[' + INJECTED_ATTR + '="' + link.id + '"]')) continue;

                const clone = template.cloneNode(true);
                clone.setAttribute(INJECTED_ATTR, link.id);

                const anchor = clone.querySelector('a[href]');
                if (!anchor) continue;
                anchor.setAttribute('href', link.path);
                anchor.setAttribute('aria-label', link.label);

                const use = clone.querySelector('svg use');
                if (use) {
                    use.setAttribute('xlink:href', '#' + link.icon);
                    use.setAttribute('href', '#' + link.icon);
                }

                // If the label cannot be set the row would read as a copy of
                // whatever was cloned, which is worse than not adding it.
                if (!setLabel(clone, link.label)) continue;

                after.parentElement.insertBefore(clone, after.nextSibling);
                after = clone;
            }
        } finally {
            injecting = false;
        }
    }

    // querySelectorAll throws a SyntaxError on a malformed selector, and this
    // runs inside a DOMContentLoaded listener, so one bad entry took the whole
    // script down with it -- including the MutationObserver registration below.
    // That is why nag screens were never actually being removed. Isolate each
    // selector so a future typo degrades instead of disabling everything.
    function removeNagScreens(selectors) {
        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((el) => {
                    el.remove();
                });
            } catch (err) {
                console.warn('[simplexity] skipping invalid nag-screen selector:', selector, err.message);
            }
        });
    }

    if (isLabs) {
        removeNagScreens(labsSelectors);
    } else if (isMain) {
        removeNagScreens(mainSelectors);
        syncSidebarLinks();
    }


    const observer = new MutationObserver(() => {
        if (isLabs) {
            removeNagScreens(labsSelectors);
        } else if (isMain) {
            removeNagScreens(mainSelectors);
            syncSidebarLinks();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    ipcRenderer.invoke('get-sidebar-shortcuts').then((ids) => {
        enabledIds = Array.isArray(ids) ? ids : [];
        syncSidebarLinks();
    }).catch(() => {});

    // Applying changes without a reload keeps Settings feeling immediate.
    ipcRenderer.on('sidebar-shortcuts-changed', (_event, ids) => {
        enabledIds = Array.isArray(ids) ? ids : [];
        syncSidebarLinks();
    });
});
