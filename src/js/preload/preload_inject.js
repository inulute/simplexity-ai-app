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
    // Patents behind the top-right menu, which is two clicks away. These add
    // them to its own left sidebar instead.
    //
    // The menu entries do not exist in the DOM until the menu is opened, so
    // they cannot be moved -- we build our own. Each item is cloned from a real
    // sidebar entry so it inherits Perplexity's markup, spacing and theming,
    // and the icons reference their own sprite (651 symbols, all six verified
    // present). That survives styling changes far better than hand-written CSS.
    const SIDEBAR_LINKS = [
        { label: 'Discover',     path: '/discover', icon: 'pplx-icon-compass' },
        { label: 'Finance',      path: '/finance',  icon: 'pplx-icon-chart-area-line' },
        { label: 'Personal CFO', path: '/cfo',      icon: 'pplx-icon-wallet' },
        { label: 'Health',       path: '/health',   icon: 'pplx-icon-heart' },
        { label: 'Academic',     path: '/academic', icon: 'pplx-icon-school' },
        { label: 'Patents',      path: '/patents',  icon: 'pplx-icon-gavel' },
    ];

    const INJECTED_ATTR = 'data-simplexity-shortcut';
    let injecting = false;

    function injectSidebarLinks() {
        // Our own insertions retrigger the observer; without this the callback
        // recurses while the DOM is still being written.
        if (injecting) return;

        const nav = document.querySelector('nav[class*="group/sidebar"]');
        if (!nav) return;

        // Never clone one of our own items, or edits compound.
        const templateAnchor = [...nav.querySelectorAll('a[href^="/"][class*="absolute"]')]
            .find((a) => !a.closest('[' + INJECTED_ATTR + ']'));
        if (!templateAnchor) return;

        const template = templateAnchor.closest('[class*="collapsible-sidebar-section"]');
        if (!template || !template.parentElement) return;

        injecting = true;
        try {
            let after = template;
            // Keep our block together and in order, after whatever is already there.
            const existing = nav.querySelectorAll('[' + INJECTED_ATTR + ']');
            if (existing.length) after = existing[existing.length - 1];

            for (const link of SIDEBAR_LINKS) {
                if (nav.querySelector('[' + INJECTED_ATTR + '="' + link.path + '"]')) continue;

                const clone = template.cloneNode(true);
                clone.setAttribute(INJECTED_ATTR, link.path);

                const anchor = clone.querySelector('a[href]');
                if (!anchor) continue;
                anchor.setAttribute('href', link.path);
                anchor.setAttribute('aria-label', link.label);

                const use = clone.querySelector('svg use');
                if (use) {
                    use.setAttribute('xlink:href', '#' + link.icon);
                    use.setAttribute('href', '#' + link.icon);
                }

                // The label is the deepest text-bearing node in the cloned row.
                const labelEl = [...clone.querySelectorAll('div')]
                    .reverse()
                    .find((d) => d.children.length === 0 && d.textContent.trim().length > 0);
                if (labelEl) labelEl.textContent = link.label;

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
        injectSidebarLinks();
    }


    const observer = new MutationObserver(() => {
        if (isLabs) {
            removeNagScreens(labsSelectors);
        } else if (isMain) {
            removeNagScreens(mainSelectors);
            injectSidebarLinks();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
