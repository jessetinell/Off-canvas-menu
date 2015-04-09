var offcanvasMenu = (function () {

    var htmlEl = document.querySelector('html'),
        body = document.querySelector('body'),
        hammer,
        navEl = document.getElementsByClassName('offcanvasmenu')[0],
        previousState = 'closed',
        navWidth,
        viewportWidth,
        currentNavPosition,
        isOpen = false,
        dragTarget = document.createElement('div'),
        touchEvents = 'panend panright panleft swiperight swipeleft',
        navOverlay,
        minVelocity = .9,
        settings;

    var init = function (s) {
        settings = s || {};
        viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        navWidth = navEl.offsetWidth;
        currentNavPosition = -navWidth;

        if (isOpen)
            setDragTargetWidth();

        if (!hammer) {
            hammer = new Hammer(htmlEl, {
                direction: Hammer.DIRECTION_HORIZONTAL
            });

            Hammer.on(dragTarget, "touchstart", function () {
                hammer.on(touchEvents, navTouched);
            });

            Hammer.on(window, "resize", function () {
                init(settings);
            });

            Hammer.on(dragTarget, "click", function () {
                if (isOpen)
                    toggle();
            });

        }

        dragTarget.id = 'offcanvas-menu-drag-target';
        body.appendChild(dragTarget);
    }


    var navTouched = function (ev) {

        handleOverlay();

        // Navigation is dragged (pan)
        if (ev.type === 'panright' || ev.type === 'panleft') {
            if (ev.pointers[0].clientX <= navWidth) {
                currentNavPosition = ev.pointers[0].clientX - navWidth;
                navOverlay.style.opacity = ((navWidth + currentNavPosition) / navWidth * 1);
                navEl.style.left = currentNavPosition + 'px';
            }
        }

        // Pan-end or swipe
        if (ev.type === 'panend' || ev.type === 'swiperight' || ev.type === 'swipeleft') {
            handleOpenOrClosedState(ev);
        }
    }

    var toggle = function () {
        if (isOpen) {
            currentNavPosition = -navWidth;
            handleOpenOrClosedState();

        } else {
            handleOverlay();

            currentNavPosition = 0;
            handleOpenOrClosedState();
        }
    }

    function handleOverlay() {
        if (!navOverlay) {
            navOverlay = document.createElement('div');
            navOverlay.id = 'nav-overlay';
            body.appendChild(navOverlay);
        }
    }

    function handleOpenOrClosedState(ev) {
        // Add state: animation
        body.className = body.className + ' nav-animate';

        isOpen = currentNavPosition > (-navWidth / 2);

        if (ev) {
            if (ev.type === 'swiperight' && (ev.velocityX < -minVelocity) && !isOpen)
                isOpen = true;
            if (ev.type === 'swipeleft' && (ev.velocityX > minVelocity) && isOpen)
                isOpen = false;
        }

        var navFinalPosition = isOpen ? 0 : '-105%';
        navEl.style.left = navFinalPosition;

        // Nav is closed
        if (!isOpen && previousState === 'open') {
            previousState = 'closed';
            dragTarget.style.width = ''; // remove width from style
            body.className = body.className.replace(/\bnav-open noscroll\b/, ''); // remove class from body
        }

        // Nav was slightly opened but slided back in
        if (navOverlay && !isOpen) {
            navOverlay.style.opacity = 0;
            setTimeout(function () {
                if (navOverlay) {
                    body.removeChild(navOverlay);
                }
                navOverlay = null;
            }, 200);

        }

        // Nav is opened
        if (isOpen && previousState === 'closed') {
            previousState = 'open';
            navOverlay.style.opacity = 1;
            body.className = 'nav-open noscroll' + body.className;
            setDragTargetWidth();
        }


        setTimeout(function () {
            body.className = body.className.replace(/\bnav-animate\b/, ''); // remove animate-class
        }, 250);

        // Unbind hammer-events
        hammer.off(touchEvents);
    }

    function setDragTargetWidth() {
        dragTarget.style.width = (viewportWidth - navWidth) + 20 + 'px';
    }

    function setData(content) {
        var dataEl = document.getElementById('data');
        dataEl.innerHTML = content;
    }

    return {
        Init: init,
        Toggle: toggle
    }
})();