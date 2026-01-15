/**
 * https://lesdieuxducode.com/blog/2018/8/rendre-un-site-disponible-hors-ligne-avec-le-service-worker
 * https://github.com/mdn/dom-examples/tree/main/service-worker/simple-service-worker
 * voir aussi : https://www.ankursheel.com/blog/programmatically-remove-service-worker
 * http://mobibot.io/blog/1162/cest-quoi-un-service-worker-petite-definition.html
 */

const addResourcesToCache = async (resources) => {
    const cache = await caches.open('cachelc6');
    for (const resource of resources) {
        try {
            const response = await fetch(resource);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${resource}: ${response.status}`);
            }
            await cache.put(resource, response);
        } catch (error) {
            console.error('Failed to add resource to cache:', error);
        }
    }
};

const putInCache = async (request, response) => {
    const cache = await caches.open('cachelc6');
    await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        // console.info('using preload response', preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
};

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
        // self.clients.claim();
        // console.log("service worker activated");
    }
};

self.addEventListener('activate', (event) => {
    event.waitUntil(enableNavigationPreload());
});

const loc = 'https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main';
self.addEventListener('install', (event) => {
    event.waitUntil(
        addResourcesToCache([
            `${loc}/LICENSE`,
            `${loc}/index.html`,
            `${loc}/css/lirecouleur/entete-contenu.css`,
            `${loc}/css/lirecouleur/page-ecrire.css`,
            `${loc}/css/lirecouleur/page-lire.css`,
            `${loc}/css/lirecouleur/sidemenu.css`,
            `${loc}/css/globals.css`,
            `${loc}/css/lirecouleur.css`,
            `${loc}/css/navbar.css`,
            `${loc}/fonts/Accessible DfA Regular.ttf`,
            `${loc}/fonts/Andika-Regular.woff`,
            `${loc}/fonts/Luciole-Regular.ttf`,
            `${loc}/fonts/OpenDyslexic-Regular.woff`,
            `${loc}/img/favicon.ico`,
            `${loc}/img/arc.png`,
            `${loc}/img/chat.png`,
            `${loc}/img/epee.png`,
            `${loc}/img/icon.png`,
            `${loc}/img/image-declaration.png`,
            `${loc}/img/neige.png`,
            `${loc}/img/ours.png`,
            `${loc}/img/panda.png`,
            `${loc}/img/serpent.png`,
            `${loc}/img/about.svg`,
            `${loc}/img/arc.svg`,
            `${loc}/img/bug-dark.svg`,
            `${loc}/img/clear.svg`,
            `${loc}/img/copy.svg`,
            `${loc}/img/copy-dark.svg`,
            `${loc}/img/download.svg`,
            `${loc}/img/edit.svg`,
            `${loc}/img/favicon.ico`,
            `${loc}/img/gear.svg`,
            `${loc}/img/hamburger.svg`,
            `${loc}/img/help-dark.svg`,
            `${loc}/img/icon.svg`,
            `${loc}/img/image_declaration.jpg`,
            `${loc}/img/lc6.svg`,
            `${loc}/img/minus.svg`,
            `${loc}/img/offline.svg`,
            `${loc}/img/offline-dark.svg`,
            `${loc}/img/open.svg`,
            `${loc}/img/open-dark.svg`,
            `${loc}/img/paste.svg`,
            `${loc}/img/paste-dark.svg`,
            `${loc}/img/pause.svg`,
            `${loc}/img/play.svg`,
            `${loc}/img/plus.svg`,
            `${loc}/img/poubelle.svg`,
            `${loc}/img/preview_lc6.svg`,
            `${loc}/img/print.svg`,
            `${loc}/img/qrcode.svg`,
            `${loc}/img/share.svg`,
            `${loc}/img/source-code.svg`,
            `${loc}/img/www.svg`,
            `${loc}/img/www-dark.svg`,
            `${loc}/js/lirecouleur/functionlc6.js`,
            `${loc}/js/lirecouleur/module.js`,
            `${loc}/js/lirecouleur/processlc6.js`,
            `${loc}/js/lirecouleur/uicontrol.js`,
            `${loc}/js/lirecouleur/userprofile.js`,
            `${loc}/libs/css/bootstrap.min.3.3.6.css`,
            `${loc}/libs/css/fontawesome.css`,
            `${loc}/libs/css/toastui-editor.min.css`,
            `${loc}/libs/fonts/fontawesome.woff`,
            `${loc}/libs/js/fr-fr.js`,
            `${loc}/libs/js/html2odt.js`,
            `${loc}/libs/js/html5-qrcode.min.js`,
            `${loc}/libs/js/jszip.min.js`,
            `${loc}/libs/js/pdf.min.js`,
            `${loc}/libs/js/pdf.sandbox.min.js`,
            `${loc}/libs/js/pdf.worker.entry.min.js`,
            `${loc}/libs/js/pdf.worker.min.js`,
            `${loc}/libs/js/showdown.min.js`,
            `${loc}/libs/js/showdown.min.js.map`,
            `${loc}/libs/js/toastui-editor-all.min.js`,
        ])
    );
    // console.log("service worker installed");
});


self.addEventListener('fetch', (event) => {
    event.respondWith(
        (async () => {
            // Attendez que la promesse preloadResponse se résolve
            const preloadResponse = await event.preloadResponse;

            return cacheFirst({
                request: event.request,
                preloadResponsePromise: preloadResponse,
                fallbackUrl: `${loc}/img/icon.png`,
            });
        })()
    );
});
