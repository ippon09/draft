document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.querySelector('.tab__titles');
    const tabBg = document.querySelector('.tab-background');
    
    // Получаем все кнопки и контент
    const tabs = Array.from(document.querySelectorAll('[class*="tabTitle"]'));
    const tabContents = Array.from(document.querySelectorAll('[class*="animation-card__item"]'));
    
    // Сохраняем исходные размеры SVG
    const tabSvgData = tabs.map(tab => {
        const svg = tab.querySelector('svg');
        return {
            element: svg,
            originalWidth: svg.getAttribute('width')
        };
    });

    function isDesktop() {
        if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
            return false;
        }
        return true;
    }

    let currentIsDesktop = isDesktop();

    function updateURL(tabName) {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabName);
        window.history.pushState({}, "", url.toString());
    }

    // Получить индекс вкладки из className (tabTitle1 -> 0, tabTitle2 -> 1, и т.д.)
    function getTabIndex(element) {
        const match = element.className.match(/tabTitle(\d+)/);
        return match ? parseInt(match[1]) - 1 : -1;
    }

    // Получить элемент SVG path для заливки
    function getTabColor(tab) {
        return tab.querySelector('svg path[fill]');
    }

    // Сбросить все вкладки
    function resetAllTabs() {
        tabs.forEach(tab => {
            tab.classList.remove('opened', 'lections-animation');
            const colorPath = getTabColor(tab);
            if (colorPath) colorPath.setAttribute('fill', '#E9EAFF');
        });
        
        tabContents.forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('lections-animation');
        });
        
        tabBg.classList.remove('active', 'lections-animation');
        tabBg.style.backgroundColor = "";
    }

    // Активировать вкладку
    function activateTab(index, skipAnimation = false) {
        const tab = tabs[index];
        const content = tabContents[index];
        const colorPath = getTabColor(tab);
        
        if (!tab || !content) return;

        // Скрываем все контенты
        tabContents.forEach(c => c.classList.add('hidden'));
        
        // Убираем opened у всех кнопок
        tabs.forEach(t => t.classList.remove('opened'));
        
        // Сбрасываем цвета всех кнопок
        tabs.forEach(t => {
            const path = getTabColor(t);
            if (path) path.setAttribute('fill', '#E9EAFF');
        });

        // Активируем нужную вкладку
        tab.classList.add('opened');
        content.classList.remove('hidden');
        
        if (colorPath) {
            colorPath.setAttribute('fill', '#f7f8fc');
        }

        if (!skipAnimation) {
            tab.classList.add('lections-animation');
        }

        // URL для разных вкладок
        const urlNames = ['upcoming', 'past', 'articles'];
        updateURL(urlNames[index] || 'upcoming');
    }

    // Desktop: hover
    function handleHover(e) {
        if (!currentIsDesktop) return;
        
        const tab = e.target.closest('[class*="tabTitle"]');
        if (!tab || tab.classList.contains('opened')) return;
        
        const index = getTabIndex(tab);
        if (index === -1) return;

        const content = tabContents[index];
        
        if (e.type === 'mouseover') {
            // Проверяем, что никакая другая вкладка не анимируется
            const hasAnimation = tabs.some(t => t.classList.contains('lections-animation'));
            if (hasAnimation) return;
            
            tab.classList.add('lections-animation');
            content.classList.add('lections-animation');
            tabBg.classList.add('lections-animation');
        } else if (e.type === 'mouseout') {
            tab.classList.remove('lections-animation');
            content.classList.remove('lections-animation');
            tabBg.classList.remove('lections-animation');
        }
    }

    // Desktop: click
    function handleClickDesktop(index) {
        const tab = tabs[index];
        const content = tabContents[index];
        
        // Убираем анимацию hover
        setTimeout(() => {
            tabs.forEach(t => t.classList.remove('lections-animation'));
            tabContents.forEach(c => c.classList.remove('lections-animation'));
            tabBg.classList.remove('lections-animation');
        }, 0);

        activateTab(index);
        tab.classList.add('lections-animation');
    }

    // Mobile: click
    function handleClickMobile(index) {
        const tab = tabs[index];
        const content = tabContents[index];
        
        if (tab.classList.contains('opened')) return;
        
        // Проверяем, идёт ли анимация
        const hasAnimation = tabs.some(t => t.classList.contains('lections-animation'));
        if (hasAnimation) return;

        tabBg.classList.add('active', 'lections-animation');
        tab.classList.add('lections-animation');
        content.classList.add('lections-animation');

        const currentOpenedIndex = tabs.findIndex(t => t.classList.contains('opened'));
        if (currentOpenedIndex !== -1) {
            tabBg.style.background = '#E9EAFF';
            const currentColorPath = getTabColor(tabs[currentOpenedIndex]);
            if (currentColorPath) {
                currentColorPath.setAttribute('fill', '#F7F8FC');
            }
        }

        setTimeout(() => {
            activateTab(index, true);
            tabBg.classList.remove('lections-animation', 'active');
            content.classList.remove('lections-animation');
        }, 500);

        setTimeout(() => {
            tab.classList.remove('lections-animation');
            tabBg.style.backgroundColor = '#fff';
            
            // Восстанавливаем цвета
            tabs.forEach((t, i) => {
                const path = getTabColor(t);
                if (path && i !== index) {
                    path.setAttribute('fill', '#E9EAFF');
                }
            });
        }, 600);
    }

    // Делегирование событий
    function handleTabClick(e) {
        const tab = e.target.closest('[class*="tabTitle"]');
        if (!tab) return;
        
        const index = getTabIndex(tab);
        if (index === -1) return;

        if (currentIsDesktop) {
            handleClickDesktop(index);
        } else {
            handleClickMobile(index);
        }
    }

    // Изменение размеров SVG
    function resizeSvgs() {
        const newWidth = window.innerWidth <= 560 ? '180' : null;
        
        tabSvgData.forEach((data, index) => {
            if (newWidth) {
                data.element.setAttribute('width', newWidth);
            } else {
                data.element.setAttribute('width', data.originalWidth);
            }
        });
    }

    // Восстановить визуальное состояние активной вкладки
    function restoreActiveTabVisualState() {
        const activeIndex = tabContents.findIndex(content => !content.classList.contains('hidden'));
        
        if (activeIndex !== -1) {
            const activeTab = tabs[activeIndex];
            const colorPath = getTabColor(activeTab);
            
            activeTab.classList.add('opened');
            if (colorPath) colorPath.setAttribute('fill', '#f7f8fc');
            
            tabs.forEach((tab, i) => {
                if (i !== activeIndex) {
                    tab.classList.remove('opened');
                    const path = getTabColor(tab);
                    if (path) path.setAttribute('fill', '#E9EAFF');
                }
            });
        }
    }

    // Переключение между desktop/mobile
    function handleResize() {
        resizeSvgs();
        const newIsDesktop = isDesktop();
        
        if (newIsDesktop !== currentIsDesktop) {
            resetAllTabs();
            restoreActiveTabVisualState();
            currentIsDesktop = newIsDesktop;
        }
    }

    // Установка слушателей событий
    tabsContainer.addEventListener('click', handleTabClick);
    
    if (currentIsDesktop) {
        tabsContainer.addEventListener('mouseover', handleHover);
        tabsContainer.addEventListener('mouseout', handleHover);
    }

    window.addEventListener('resize', handleResize);

    // Инициализация из URL
    const params = new URLSearchParams(window.location.search);
    const tabFromURL = params.get("tab");
    
    let initialTabIndex = 0;
    const urlToIndex = {
        'upcoming': 0,
        'past': 1,
        'articles': 2
    };
    
    if (tabFromURL && urlToIndex.hasOwnProperty(tabFromURL)) {
        initialTabIndex = urlToIndex[tabFromURL];
    }
    
    activateTab(initialTabIndex);
    resizeSvgs();
});
