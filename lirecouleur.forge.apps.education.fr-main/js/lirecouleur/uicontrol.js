
/*
 * uicontrol.js : gestion du sélecteur de profil
 * Ce module fait partie du projet LireCouleur - http://lirecouleur.arkaline.fr
 *
 * @author Marie-Pierre Brungard
 * @version 1.0
 * @since 2022
 *
 * GNU General Public Licence (GPL) version 3
 * 
 */


function isValidUrl(urlString) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+,]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}
var urlToMDdata = "";

const texteDefaut = `
_**LireCouleur**_ aide à rendre les textes plus faciles à lire. Chaque utilisateur peut choisir comment il veut que le texte soit présenté. Plusieurs profils de présentation sont proposés.

### Adapter un texte

_**LireCouleur**_ adapte des textes accessibles en ligne ou depuis des fichiers.

Par défaut, tout le texte est adapté. _Pour adapter seulement certaines parties du texte, il faut mettre le texte à adapter entre deux accents graves._

On peut ajouter des titres, des images ou des hyperliens dans le texte.
Les règles de formatage sont expliquées ici : [formatage Markdown](https://docs.forge.apps.education.fr/tutoriels/tutomd/).

### Exemple de texte adapté

#### La déclaration des droits de l'homme et du citoyen - Article premier

_Les hommes naissent et demeurent libres et égaux en droits. Les distinctions sociales ne peuvent être fondées que sur l'utilité commune._

![](img/image-declaration.jpg)
source image : [https://www.parismuseescollections.paris.fr/](https://www.parismuseescollections.paris.fr/)
`;

/// https://nhn.github.io/tui.editor/latest/tutorial-example03-editor-with-wysiwyg-mode

var edTexteBrut = new toastui.Editor({
    usageStatistics: false,
    language: 'fr-FR',
    // previewStyle: 'vertical',
    el: document.querySelector('#zone-texte-brut'),
    height: '500px',
    initialEditType: 'markdown',
    hideModeSwitch: true, // masquer le mode wysiswyg
    toolbarItems: [
        [{
            name: 'menu-open-file',
            tooltip: 'Ouvrir un fichier local',
            el: document.getElementById('menu-open-file'),
        }, {
            name: 'menu-www',
            tooltip: 'Lire un texte en ligne',
            el: document.getElementById('menu-www'),
        }, {
            name: 'menu-paste',
            tooltip: 'Coller depuis le presse-papier',
            el: document.getElementById('menu-paste'),
        }, 'code'/*, 'codeblock'*/],
        ['heading', 'bold', 'italic'/*, 'strike'*/],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
    ],
});

/*
 * profils par défaut d'adaptation du texte
 */
const listeProfils = new UserProfiles();

/** Initialise toutes les variables nécessaires et se positionne sur la zone de lecture */
var voices = [];
var dernierMotClique = undefined;

/**
 * Insère du texte Markdown dans l'éditeur
 * @param {*} md texte à inscrire dans l'éditeur 
 */
function setMarkdownContent(md) {
    const yamlRegex = /^---\n([\s\S]*?)\n---\n/;

    // élimination des paramètres YAML du texte
    md = md.replace(yamlRegex, "");

    // suppression de caractères indésirables
    md = md.replace(/\u00a0/g, ' ');

    if (md.length > 0) edTexteBrut.setMarkdown(md);
}

/**
 * Selectionne le profil à appliquer
 * @param {number} iProfil L'index du profil
 */
function selectionneProfil(iProfil) {
    listeProfils.selectProfile(iProfil);

    // Pour actualiser le style de la liste des profils
    miseAJourProfilsVisu();

    // Pour reafficher le texte a adapter
    affichePage("texte-adapte");
}

/**
 * Affiche ou masque le menu hamburger à gauche
 */
function toggleHamburgerMenu() {
    let hamenu = document.getElementById('menu-hamburger');
    if (hamenu.style.display.length == 0) hamenu.style.display = 'none';
    else {
        if (hamenu.style.display != 'none') hamenu.style.display = 'none';
        else hamenu.style.display = 'initial';
    }
}

/**
 * Retire un profil de la liste si ce n'est pas le profil appliqué
 * @param {number} iProfil L'index du profil à retirer
 */
function supprimeProfil(iProfil) {
    if (listeProfils.getSelectedProfileIndex() !== iProfil) {
        if (confirm("Confirmer la suppression de ce profil") == true) {
            listeProfils.removeProfile(iProfil);
            miseAJourProfilsVisu();
        }
    } else {
        alert("Le profil courant ne peut pas être supprimé")
    }
}

/**
 * Initialise le lecteur de fichier pour importer un profil
 */
function initialiseGestionnaireProfils() {
    const inputFichier = document.querySelector('#fichier-profil');
    const lecteur = new FileReader();

    // Quand on importe un nouveau fichier, on le lit
    inputFichier.onchange = () => {
        const selectedFile = inputFichier.files[0];
        lecteur.readAsText(selectedFile);
    }

    // Quand un nouveau fichier est lu
    lecteur.onload = (res) => {
        listeProfils.addProfile(JSON.parse(res.target.result));
        miseAJourProfilsVisu();
        inputFichier.value = "";
    };
    lecteur.onerror = err => console.log(err);
}

/**
 * Met à jour le menu déroulant des profils et la liste des profils
 */
function miseAJourProfilsVisu() {
    const menuElt = document.getElementById("liste-profils-menu");
    const iSel = listeProfils.getSelectedProfileIndex();
    let htmlMenu = "";

    for (let i = 0; i < listeProfils.getNbProfiles(); i++) {
        const elem = listeProfils.getProfileIndex(i);

        htmlMenu += `<div class="profil"><a href="#" title="Activer"`;
        if (elem.id === listeProfils.getSelectedProfile().id) {
            htmlMenu += `class="actif"`;
        }
        htmlMenu += `onclick="selectionneProfil(${i});"> ${elem.id} </a>`;
        htmlMenu += '<a href="#" title="Aperçu" class="profil-preview"><img src="img/preview.svg"/></a>';
        if (i != iSel) {
            htmlMenu += '<a href="#" title="Supprimer" class="profil" onclick="supprimeProfil(' + i + ')"><img src="img/poubelle.svg"/></a>';
        }
        htmlMenu += `</div>`;
    }

    menuElt.innerHTML = htmlMenu;

    /* Ajout des gestionnaires d'événements pour afficher une prévisualisation de texte adapté selon le profil */
    const profs = document.getElementsByClassName("profil-preview");
    const preview = document.getElementById('preview');
    const textPreview = document.getElementById('text-preview');
    for (let i = 0; i < profs.length; i++) {
        const profil = listeProfils.getProfileIndex(i);

        profs[i].addEventListener('click', function (event) {
            var x = window.matchMedia("(max-width: 600px)");
            if (x.matches) {
                // petit écran => prévisualisation
                textPreview.style = profil.style;
                textPreview.innerHTML = `Aperçu avec "${profil.id}"\n\n` + processText("Tous les êtres humains naissent libres et égaux en dignité et en droits.", profil, textPreview);
                profil.postProcessHTML(textPreview);
                preview.style.left = `5px`;
                preview.style.top = `${event.clientY + 10}px`;

                preview.style.display = 'block';
                event.stopPropagation();
            } else {
                // grand écran => sélectionne le profil
                selectionneProfil(i);
            }
        });
        profs[i].addEventListener('mouseover', function (event) {
            textPreview.style = profil.style;
            textPreview.innerHTML = `Aperçu avec "${profil.id}"\n\n` + processText("Tous les êtres humains naissent libres et égaux en dignité et en droits.", profil, textPreview);
            profil.postProcessHTML(textPreview);
            preview.style.left = `${event.clientX}px`;
            preview.style.top = `${event.clientY}px`;

            preview.style.display = 'block';
        });
        profs[i].addEventListener('mouseout', function (event) {
            preview.style.display = 'none';
        });
    }
}

/**
 * Affiche le menu en position initiale
 */
function resetMenus() {
    let i;

    /* masque tous les éléments de la classe "contenu" */
    const tabcontent = document.getElementsByClassName("contenu");
    const tabheadercontent = document.getElementsByClassName("entete-contenu");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabheadercontent[i].style.display = "none";
    }

    /* enlève la couleur de fond du menu */
    const tablinks = document.getElementsByClassName("item-menu");
    for (i = 0; i < tablinks.length; i++) {
        //tablinks[i].style.display = "inherit";
        tablinks[i].classList.remove("actif");
    }

    /* Adaptation de l'interface en fonction du niveau d'utilisation spécifié dans le profil */
    const profilSelectione = listeProfils.getSelectedProfile();
    const eltNav = document.getElementsByTagName("nav")[0];
    while (eltNav.classList.length > 0) eltNav.classList.remove(eltNav.classList[0]);
    if (!profilSelectione.json.params.hasOwnProperty("interface")) return;
    eltNav.classList.add(`interface-niveau-${profilSelectione.json.params.interface}`);
}

/**
 * Affiche une page donnée par son id et masque les autres pages.
 * Une page est un objet possedant l'attribut class "contenu"
 * @param {string} pageName L'id de la page
 */
async function affichePage(pageName) {
    /* arrête éventuellement le scanneur de QR code */
    stopHtml5QrCodeScanner();

    /* Réinitialise les menus */
    resetMenus();

    /* montre le contenu choisi */
    document.getElementById(pageName).style.display = "block";
    document.getElementById(`entete-contenu-${pageName}`).style.display = "block";

    let element = document.getElementById("menu-" + pageName);
    if (element !== null) {
        element.classList.add("actif");
    }

    if (pageName == "texte-qrcode") {
        scanneQRCode();
    }

    if (pageName == "texte-adapte") {
        /* adaptation du texte avant affichage */
        adapteTexteVisu();
    }

    /* fermer la barre de navigation latérale */
    closeNav();
}

async function initializeMenuPaste() {
    const cpElt = document.getElementById("menu-paste");
    const queryOpts = { name: 'clipboard-read', allowWithoutGesture: true };
    const permissionStatus = await navigator.permissions.query(queryOpts);
    // permissionStatus.state : 'granted', 'denied' or 'prompt'

    /* affiche la fonction de copie/collage du contenu dans le presse-papier */
    if (permissionStatus.state != 'denied') {
        cpElt.style.display = "initial";
        cpElt.title = 'Coller le texte du presse-papier';
    }
}

/**
 * Traitement du texte de la fenêtre de saisie
 * @param {*} text texte à traiter
 * @returns tableau du texte découpé en portions à traiter ou non
 */
function parseMarkdownText(text) {
    const markdownCodeRegex = /(^|[^\`])\`(?:[^\`]+)\`/g;
    var regexes = [/\[(.*?)\]\((.*?)\s?(?:"(.*?)")?\)/g, /!\[(.*?)\]\((.*?)\s?(?:"(.*?)")?\)/g, /\[!\[(.*?)\]\((.*?)\s?(?:"(.*?)")?\)\]\((.*?)\s?(?:"(.*?)")?\)/g];
    let portions = [];
    let i = 0;

    for (const match of text.matchAll(markdownCodeRegex)) {
        let ppart = text.slice(i, match.index);
        let bpart = match[0].replaceAll('\`', '');
        portions = portions.concat(parseMarkdownIgnore(ppart, 'n', regexes));
        portions.push({ 'action': 'p', 'text': bpart });
        i = match.index + match[0].length;
    }
    if (i == 0) {
        // pas de balisage `...` qui indique des portions particulières à adapter
        portions = portions.concat(parseMarkdownIgnore(text.slice(i), 'p', regexes));
    } else {
        portions = portions.concat(parseMarkdownIgnore(text.slice(i), 'n', regexes));
    }

    return portions;
}

/**
 * Partitionnement du texte selon les images, les liens - traitement récursif
 * @param {*} text texte à traiter
 * @param {*} action action prévue sur le texte : i (ignorer), p (process), n (neutre)
 * @param {*} regexes expressions régulières à identifier
 * @returns 
 */
function parseMarkdownIgnore(text, action, regexes) {
    let portions = [];
    let i = 0;

    if (regexes.length == 0) {
        portions.push({ 'action': action, 'text': text });
    } else {
        let reg = regexes[regexes.length - 1];
        let nregexes = regexes.slice(0, -1);
        for (const match of text.matchAll(reg)) {
            let ppart = text.slice(i, match.index);
            portions = portions.concat(parseMarkdownIgnore(ppart, action, nregexes));
            portions.push({ 'action': 'i', 'text': match[0] });
            i = match.index + match[0].length;
        }
        portions = portions.concat(parseMarkdownIgnore(text.slice(i), action, nregexes));
        //portions.push({ 'action': action, 'text': text.slice(i) });
    }

    return portions;
}

/**
 * Traitement du texte de la fenêtre de saisie
 * @param {*} text texte à traiter
 * @param {*} profil profil utilisateur
 * @param {*} parentElt élément dom où accrocher le texte
 * @returns 
 */
function processText(text, profil, parentElt) {
    let i = 0;
    let rtext = "";

    /* traitement du texte au format Markdown */
    if (text.startsWith('# ')) text = '\n' + text;

    /* élimine les commandes YAML */
    const yamlRegex = /^---\n([\s\S]*?)\n---\n/;
    text = text.replace(yamlRegex, "");

    if (profil.getLevel() == FunctionLC6.TEXTE) {
        rtext = text.replaceAll('`', '');
    } else {
        let ptext = parseMarkdownText(text);
        for (const xtxt of ptext) {
            if (xtxt['action'] == 'p') {
                // portion de texte à adapter
                rtext += profil.toHTML(xtxt['text'], parentElt);
            } else {
                if (xtxt['action'] == 'i') {
                    // portion de texte à ignorer
                    rtext += xtxt['text'];
                } else {
                    // portion de texte à découper en mots
                    let stxt = new Texte(xtxt['text']);
                    stxt.decompose(FunctionLC6.MOT);
                    rtext += stxt.toHTML([]);
                }
            }
        }
    }

    // transformation du Markdown en HTML
    let converter = new showdown.Converter({
        emoji: true,
        parseImgDimensions: true,
        simplifiedAutoLink: true,
        simpleLineBreaks: true,
        tables: true,
    });
    return converter.makeHtml(rtext);
}


/**
 * Formate le texte en fonction du profil sélectioné
 */
async function adapteTexteVisu() {
    // affichage ou non du bouton de partage de l'URL
    if (urlToMDdata.length > 0) {
        document.getElementById("menu-partage").style.display = "block";
        document.getElementById("titre-texte-adapte").innerHTML = `Texte adapté de : <a href="${urlToMDdata}">${urlToMDdata}</a>`;
    } else {
        document.getElementById("menu-partage").style.display = "none";
        document.getElementById("titre-texte-adapte").innerHTML = "Texte adapté";
    }

    // récupération du profil courant
    const profilSelectione = listeProfils.getSelectedProfile();

    // affichage ou non du bouton de lecture du texte
    if (voices.length > 0) {
        document.getElementById("menu-lecteur").style.display = "block";
    } else {
        document.getElementById("menu-lecteur").style.display = "none";
    }

    // Zone de lecture
    const texteadapteElt = document.getElementById("zone-texte-adapte");

    let text = edTexteBrut.getMarkdown().replace(/\u00a0/g, ' ');
    localStorage.setItem("texte-lirecouleur", text);

    texteadapteElt.style = profilSelectione.style;
    texteadapteElt.innerHTML = processText(text, profilSelectione, texteadapteElt);

    /* adapte la présentation à la largeur de page choisie */
    let maxw = texteadapteElt.style.maxWidth;
    document.getElementById(`entetes-contenu`).style.maxWidth = maxw;
    for (let nd of document.getElementsByClassName("contenu")) {
        nd.style.maxWidth = maxw;
    }
    texteadapteElt.style.maxWidth = "98%";

    profilSelectione.postProcessHTML(texteadapteElt);
}

/**
 * Copie l'URL dans le presse-papier
 */
function copyUrlToClipboard() {
    /* Copie */
    var texteadapteElt = document.getElementById('texte-url');
    function listener(e) {
        let txt = texteadapteElt.innerHTML;
        e.clipboardData.setData('text/html', txt);
        e.clipboardData.setData('text/plain', txt);
        e.preventDefault();
    }
    document.oncopy = listener;
    document.execCommand('copy');
    document.oncopy = null;
}

/**
 * Copie du texte adapté dans le presse-papier
 */
function copyToClipboard() {
    /* Copie */
    var texteadapteElt = document.getElementById('zone-texte-adapte');
    function listener(e) {
        let txt = texteadapteElt.innerHTML;
        e.clipboardData.setData('text/html', txt);
        e.clipboardData.setData('text/plain', txt);
        e.preventDefault();
    }
    document.oncopy = listener;
    document.execCommand('copy');
    document.oncopy = null;

    //test : exportToDOCX(texteadapteElt.innerHTML, 'mon-document');
}

/**
 * Exporte le texte adapté pour l'imprimer
 */
function printDocument() {
    window.print();
}

/**
 * Efface le contenu du texte
 */
function eraseText() {
    setMarkdownContent('');
}

/**
 * Copie/colle du texte adapté dans le presse-papier
 */
async function pasteUrlFromClipboard() {
    /* Colle... mais pas avec tous les navigateurs */
    if (!navigator.clipboard) {
        // Clipboard API not available
        return
    }

    try {
        navigator.clipboard
            .readText()
            .then(
                (clipText) => {
                    document.getElementById('urlInput').value = clipText;
                },
            );
    } catch (error) {
        console.log(error, "Impossible de coller le texte du presse-papier");
    }
}

/**
 * Copie/colle du texte adapté dans le presse-papier
 */
async function pasteFromClipboard() {
    /* Colle... mais pas avec tous les navigateurs */
    if (!navigator.clipboard) {
        // Clipboard API not available
        return
    }

    try {
        navigator.clipboard
            .readText()
            .then(
                (clipText) => {
                    let text = clipText.replace(/\u00a0/g, ' ').trim();
                    if (text.length > 0) {
                        setMarkdownContent(text);
                        urlToMDdata = "";
                        affichePage('texte-adapte');
                    }
                },
            );
    } catch (error) {
        console.log(error, "Impossible de coller le texte du presse-papier");
    }
}

/**
 * Agrandir la taille de caractères
 */
function zoom() {
    var texteadapteElt = document.getElementById('zone-texte-adapte');
    if (texteadapteElt.style.fontSize.length > 0) {
        let val = parseFloat(texteadapteElt.style.fontSize);
        texteadapteElt.style.fontSize = (val * 1.08) + 'px';
    } else {
        let val = parseFloat(window.getComputedStyle(texteadapteElt).fontSize);
        texteadapteElt.style.fontSize = (val * 1.08) + 'px';
    }
}

/**
 * Réduire la taille de caractères
 */
function unzoom() {
    var texteadapteElt = document.getElementById('zone-texte-adapte');
    if (texteadapteElt.style.fontSize.length > 0) {
        let val = parseFloat(texteadapteElt.style.fontSize);
        texteadapteElt.style.fontSize = (val / 1.08) + 'px';
    } else {
        let val = parseFloat(window.getComputedStyle(texteadapteElt).fontSize);
        texteadapteElt.style.fontSize = (val / 1.08) + 'px';
    }
}

/**
 * création d'un scanneur de QR code
 */
const qrCodeScanner = new Html5Qrcode("reader");

/**
 * @summary Arrête le scanneur de QR code
 */
function stopHtml5QrCodeScanner() {
    if (qrCodeScanner.isScanning) {
        try {
            qrCodeScanner.stop().then((ignore) => {
                // QR Code scanning is stopped.
            }).catch((err) => {
                // Stop failed, handle it.
            });
        } catch (_error) {
        }
    }
}

async function onScanSuccess(decodedText, _decodedResult) {
    stopHtml5QrCodeScanner();

    // Handle on success condition with the decoded text or result.
    // console.log(`Scan result: ${decodedText}`, decodedResult);

    // masquer la zone de scan de qr code
    document.getElementById("texte-qrcode").style.display = "initial";
    document.getElementById("menu-texte-qrcode").classList.remove("actif");

    if (isValidUrl(decodedText)) {
        // le texte décodé est une url valide
        ouvrirUrl(decodedText);
        return null;
    }

    let ihash = decodedText.indexOf("#");
    if (ihash >= 0) {
        let baseUrl = decodedText.slice(ihash).substring(1).replace(/\?.*/, "");
        if (isValidUrl(baseUrl)) {
            // le texte décodé est une url valide
            ouvrirUrl(baseUrl);
            return null;
        }
    }

    // affectation du texte décodé dans la zone de saisie
    urlToMDdata = "";
    setMarkdownContent(decodedText);

    // affichage du texte adapté
    affichePage("texte-adapte");
}

async function onScanFailure() {
    stopHtml5QrCodeScanner();

    // affichage du texte adapté
    affichePage("texte-adapte");
}

/**
 * Scanne le texte contenu dans un QR code
 */
function scanneQRCode() {
    if (qrCodeScanner.isScanning) {
        // arrêter le scan de QR code
        stopHtml5QrCodeScanner();
        affichePage("texte-adapte");
    } else {
        // masquer les zones inutiles
        document.getElementById("texte-brut").style.display = "none";
        document.getElementById("texte-adapte").style.display = "none";

        // afficher la zone de scan de qr code
        document.getElementById("texte-qrcode").style.display = "block";

        const config = {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            showTorchButtonIfSupported: true,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            rememberLastUsedCamera: true
        };

        //var html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
        qrCodeScanner.start({ facingMode: "environment" }, config, onScanSuccess).catch(function (err) {
            console.warn(err);
            stopHtml5QrCodeScanner();
            affichePage("texte-adapte");
        });
    }
}

/**
 * Ouvre et lit un fichier texte
 */
function ouvrirFichier() {
    /* Réinitialise les menus */
    resetMenus();

    const inputFichier = document.querySelector('#fichier-texte');
    const lecteur = new FileReader();
    const selectedFile = inputFichier.files[0];

    // alternative pdf : https://gitlab.com/autokent/pdf-parse/
    // application/msword ???

    // Quand on importe un nouveau fichier, on le lit
    if ((selectedFile.type === 'text/plain') ||
        (selectedFile.type === 'text/markdown') ||
        (selectedFile.type === 'application/json') ||
        (selectedFile.type == '')) {
        lecteur.readAsText(selectedFile);
    } else {
        lecteur.readAsArrayBuffer(selectedFile);
    }

    // Quand un nouveau fichier est lu
    lecteur.onload = (res) => {

        switch (selectedFile.type) {
            case '':
                // inscription du texte dans la zone de saisie
                setMarkdownContent(res.target.result);

                // affichage du texte adapté
                affichePage("texte-adapte");

                break;
            case 'text/plain':
                // inscription du texte dans la zone de saisie
                setMarkdownContent(res.target.result);

                // affichage du texte adapté
                affichePage("texte-adapte");

                break;
            case 'text/markdown':
                // inscription du texte dans la zone de saisie
                setMarkdownContent(res.target.result);

                // affichage du texte adapté
                affichePage("texte-adapte");

                break;
            case 'application/json':
                // chargement d'un profil de présentation
                try {
                    listeProfils.addProfile(JSON.parse(res.target.result));
                    miseAJourProfilsVisu();
                } catch (error) {
                    console.log(error);
                    console.log(res.target.result);
                }
                break;
            case 'application/pdf':
                const loadingTask = pdfjsLib.getDocument(lecteur.result);
                loadingTask.promise.then(pdf => {
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        pdf.getPage(i).then(page => {
                            page.getTextContent().then(content => {
                                textContent += content.items.map(item => item.str + '@').join('') + '@@@@';
                                if (i === pdf.numPages) {
                                    const uint8array = new TextEncoder().encode(textContent);
                                    var ntxt = new TextDecoder().decode(uint8array);

                                    ntxt = ntxt.replace(/@@/g, '\n');
                                    ntxt = ntxt.replace(/@/g, ' ');

                                    // inscription du texte dans la zone de saisie
                                    setMarkdownContent(ntxt);

                                    // affichage du texte adapté
                                    affichePage("texte-adapte");
                                }
                            });
                        });
                    }
                });

                break;
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                JSZip.loadAsync(res.target.result).then(function (zip) {
                    zip.file("word/document.xml").async("string").then(function (data) {
                        // data is a string
                        const parser = new DOMParser();
                        let domdata = data.replaceAll('<w:p>', '\n\n<w:p>');
                        domdata = domdata.replaceAll('<w:p ', '\n\n<w:p ');
                        const doc = parser.parseFromString(domdata, "text/xml");
                        setMarkdownContent(doc.firstChild.textContent);
                        affichePage("texte-adapte");
                    });
                }).catch(function (err) {
                    setMarkdownContent(selectedFile.name + " je ne sais pas lire ce fichier (" + err + ")");
                });
                break;
            case 'application/vnd.oasis.opendocument.text':
                JSZip.loadAsync(res.target.result).then(function (zip) {
                    zip.file("content.xml").async("string").then(function (data) {
                        // data is a string
                        const parser = new DOMParser();
                        let domdata = data.replaceAll('<text:p', '\n<text:p');
                        domdata = domdata.replaceAll('<text:h', '\n<text:h');
                        const doc = parser.parseFromString(domdata, "text/xml");
                        setMarkdownContent(doc.firstChild.textContent);
                        affichePage("texte-adapte");
                    });
                }).catch(function (err) {
                    setMarkdownContent(selectedFile.name + " je ne sais pas lire ce fichier (" + err + ")");
                });
                break;
            default:
                // affichage du texte adapté*/
                setMarkdownContent(`${selectedFile.name} je ne sais pas lire ce fichier (${selectedFile.type})`);
        }

        // affichage du texte adapté
        urlToMDdata = "";
        affichePage("texte-adapte");
    };
    lecteur.onerror = err => console.log(err);
}

/**
 * Ouvre une page modale et charge une url
 */
function afficheModaleWWW() {
    // Récupérer les éléments
    const modal = document.getElementById("ouverture-url");
    const span = document.getElementById("close-open-url");
    const submitBtn = document.getElementById("submitUrl");

    // Ouvrir la modal lorsque l'utilisateur clique sur le bouton
    modal.style.display = "block";

    // Fermer la modal lorsque l'utilisateur clique sur <span> (x)
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Fermer la modal lorsque l'utilisateur clique en dehors de la modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Gérer le clic sur le bouton de validation
    submitBtn.onclick = function () {
        const url = document.getElementById("urlInput").value;
        if (isValidUrl(url)) {
            // une url a été collée dans la zone de saisie de texte
            ouvrirUrl(url);
        } else {
            let ihash = url.indexOf("#");
            if (ihash >= 0) {
                let baseUrl = url.slice(ihash).substring(1).replace(/\?.*/, "");
                if (isValidUrl(baseUrl)) {
                    // utilisation de l'url
                    ouvrirUrl(baseUrl);
                } else {
                    urlToMDdata = "";
                    setMarkdownContent(`[](${url}) n'est pas une adresse valide`);
                    affichePage("texte-adapte");
                }
            }
        }
        modal.style.display = "none"; // Fermer la modal après validation
    }
}

/**
 * Ouvre une page modale et partage une url
 */
function afficheModaleShare() {
    // Récupérer les éléments
    const modal = document.getElementById("partage-url");
    const span = document.getElementById("close-share-url");
    const texteUrl = document.getElementById("texte-url");

    // afficher l'url
    let url = window.location.href;
    if (urlToMDdata.endsWith('download')) {
        urlToMDdata = urlToMDdata.slice(0, -"/download".length);
    }
    if (url.endsWith(urlToMDdata)) {
        texteUrl.textContent = url;
    } else {
        texteUrl.textContent = window.location.href + urlToMDdata;
    }

    // Ouvrir la modal lorsque l'utilisateur clique sur le bouton
    modal.style.display = "block";

    // Fermer la modal lorsque l'utilisateur clique sur <span> (x)
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Fermer la modal lorsque l'utilisateur clique en dehors de la modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

/**
 * Ouvre une page modale et charge une url
 */
function afficheModale(page) {
    // Récupérer les éléments
    const modal = document.getElementById(page);
    const span = document.getElementById(`close-open-${page}`);

    // Ouvrir la modal lorsque l'utilisateur clique sur le bouton
    modal.style.display = "block";

    // Fermer la modal lorsque l'utilisateur clique sur <span> (x)
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Fermer la modal lorsque l'utilisateur clique en dehors de la modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

/**
 * Débute la lecture du texte affiché
 */
function litTexte() {
    const profilSelectione = listeProfils.getSelectedProfile();
    const funcReader = profilSelectione.getFunction("lecteur");
    /*if (typeof funcReader === "undefined") {
        // profil qui n'inclut pas de lecture du texte
        return;
    }*/
    if (voices.length < 1) return;

    if (speechSynthesis.speaking) {
        // arrête la lecture en cours
        speechSynthesis.cancel();

        // désactiver la pastille de lecture
        document.getElementById("menu-lecteur").firstChild.src = "img/play.svg";
    } else {
        let utterThis;

        if (dernierMotClique !== undefined) {
            // mise en place de la structure de lecture sur un seul mot
            utterThis = new SpeechSynthesisUtterance(dernierMotClique.textContent);
            utterThis.voice = voices[0];
            utterThis.pitch = 1;
            utterThis.rate = 0.9;
            if (typeof funcReader !== "undefined") {
                let ivoice = 0;
                if (funcReader.params.hasOwnProperty("rate")) utterThis.rate = funcReader.params.rate * 0.1;
                if (funcReader.params.hasOwnProperty("voice")) ivoice = funcReader.params.voice;
                utterThis.voice = voices[Math.min(voices.length - 1, ivoice)];
            }
            speechSynthesis.speak(utterThis);
        } else {
            // activer la pastille de lecture
            document.getElementById("menu-lecteur").firstChild.src = "img/pause.svg";

            // initialisation du suiveur de mot
            let iterMot = new SuiveurMot();

            // mise en place de la structure de lecture
            utterThis = new SpeechSynthesisUtterance(iterMot.texteALire());
            utterThis.onerror = function (_event) {
                //console.error('SpeechSynthesisUtterance.onerror');
                iterMot.arretSuiveur();
            }
            utterThis.onend = function (_event) {
                //console.log('SpeechSynthesisUtterance.onend');
                iterMot.arretSuiveur();
            }
            if ('onboundary' in utterThis) {
                utterThis.onboundary = (event) => {
                    //console.log(`position onboundary : ${event.charIndex}`);
                    iterMot.surligneMotSuivant(event.charIndex);
                }
            } else {
                // surligne tout le paragraphe à lire
                iterMot.surligneTout();
            }

            utterThis.voice = voices[0];
            utterThis.pitch = 1;
            utterThis.rate = 0.9;
            if (typeof funcReader !== "undefined") {
                let ivoice = 0;
                if (funcReader.params.hasOwnProperty("rate")) utterThis.rate = funcReader.params.rate * 0.1;
                if (funcReader.params.hasOwnProperty("voice")) ivoice = funcReader.params.voice;
                utterThis.voice = voices[Math.min(voices.length - 1, ivoice)];
            }
            speechSynthesis.speak(utterThis);
        }
    }
}

/**
 * Suit les mots en cours de lecture
 */
class SuiveurMot {
    constructor() {
        let selection = window.getSelection();
        const lmots = document.getElementsByClassName("_t_");
        let premierMot = lmots[0];
        let dernierMot = lmots[lmots.length - 1];
        let i = 0;

        if (lmots.length == 0) return;

        // construction d'un tableau des mots à lire
        this.motsALire = new Array();
        this.stext = document.getElementById("zone-texte-adapte").textContent;
        if (!selection.isCollapsed && (selection.type == "Range")) {
            this.stext = selection.toString();

            premierMot = this.noeudMot(selection.anchorNode.parentElement);
            if (premierMot === null) {
                premierMot = lmots[0];
            }

            dernierMot = this.noeudMot(selection.focusNode.parentElement);
            if (dernierMot === null) {
                dernierMot = lmots[lmots.length - 1];
            }

            selection.collapseToStart();
        }

        // aller jusqu'au premier mot à lire
        while ((i < lmots.length) && (lmots[i] !== premierMot)) i += 1;

        // collecter les mots à lire
        // algorithme glouton mais qui permet de s'affranchir de la structure en arborescence des paragraphes
        while ((i < lmots.length) && (lmots[i] !== dernierMot)) {
            if (lmots[i].classList.contains("mot")) this.motsALire.push(lmots[i]);
            i += 1;
        }
        // ajouter le dernier mot
        if (i < lmots.length) {
            if (lmots[i].classList.contains("mot")) this.motsALire.push(lmots[i]);
        }

        // console.log(`<<${this.stext}>>`);
        this.icourant = 0;
    }

    /**
     * Recherche l'élément racine ayant la classe "_t_" dans lequel intervient la sélection
     * @param {*} motSelection élément sur lequel intervient la sélection
     * @returns l'élément "_t_" correspondant à la sélection
     */
    noeudMot(motSelection) {
        var noeud = motSelection;
        while (noeud !== null) {
            try {
                if (noeud.classList.contains("_t_")) {
                    return noeud;
                }
            } catch (_error) {
                return null;
            }
            noeud = noeud.parentNode;
        }
        return null;
    }

    /**
     * Retourne le texte à lire
     * @returns le texte à lire
     */
    texteALire() {
        return this.stext;
    }

    /**
     * Recherche le mot à la position indiquée et le passe en surlignage
     * @param {*} pos position de lecture
     */
    surligneMotSuivant(pos) {
        if (this.icourant >= this.motsALire.length) return;

        // annuler le surlignage du dernier mot lu
        this.motsALire[this.icourant].classList.replace("mot-lu", "_t_");

        // passer au mot suivant
        if (this.icourant < this.motsALire.length - 1) {
            let motSuiv = this.motsALire[this.icourant + 1].textContent;
            if (this.stext.slice(pos, pos + motSuiv.length) == motSuiv) this.icourant += 1;
            //console.log(`<<${this.stext.slice(pos, pos + 20)}>> this.motsALire[this.icourant].textContent`);

            // surligner le nouveau mot lu
            this.motsALire[this.icourant].classList.replace("_t_", "mot-lu");
        }
    }

    surligneTout() {
        for (let i = 0; i < this.motsALire.length; i++) {
            this.motsALire[i].classList.replace("_t_", "mot-lu");
        }
    }

    /**
     * Arrête le suiveur de mots à la fin de la lecture
     */
    arretSuiveur() {
        // annuler le surlignage
        for (let i = 0; i < this.motsALire.length; i++) {
            this.motsALire[i].classList.replace("mot-lu", "_t_");
        }
        delete this.motsALire;

        // désactiver la pastille de lecture
        document.getElementById("menu-lecteur").firstChild.src = "img/play.svg";
    }
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav(event) {
    document.getElementById("sidemenu").style.width = "300px";
    event.stopPropagation();
    //document.getElementById("main").style.marginRight = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("sidemenu").style.width = "0";
    //document.getElementById("main").style.marginRight = "0";
}

function activerHorsLigne() {
    /*
     * rendre la page index.html accessible hors ligne
     */
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    'serviceworker.js',
                    {
                        scope: './',
                    }
                );
                document.getElementById("btn-activation-hors-ligne").innerHTML = "L'application est maintenant disponible hors ligne.";
            } catch (error) {
                document.getElementById("btn-activation-hors-ligne").innerHTML = "Il n'a pas été possible d'enregistrer l'application pour une utilisation hors ligne.";
            }
        } else {
            document.getElementById("btn-activation-hors-ligne").innerHTML = "Il n'a pas été possible d'enregistrer l'application pour une utilisation hors ligne.";
        }
    };
    if (!navigator.onLine) {
        document.getElementById("btn-activation-hors-ligne").innerHTML = "Le navigateur est hors-ligne.";
    } else {
        registerServiceWorker();
    }
}

/**
 * Collecte le texte de l'URL donnée
 * @param {*} url url donnée
 * @returns texte de la page correspondant à l'url
 */
async function ouvrirUrl(inputUrl) {
    let url = handleURL(inputUrl);

    try {
        // Requête d'une URL.
        const response = await fetch(url);
        if (response.ok) {
            // Récupération du texte de la page.
            let txt = await response.text();
            let jsonProf = null;

            if (response.headers.get("content-type").startsWith("text/plain")) {
                try {
                    jsonProf = JSON.parse(txt);
                } catch (_) {
                    jsonProf = null;
                }
            }

            if (jsonProf !== null) {
                // probablement un profil de présentation
                try {
                    listeProfils.addProfile(JSON.parse(txt));
                    miseAJourProfilsVisu();
                } catch (error) {
                    console.log(error);
                    console.log(txt);
                }
            } else {
                if (response.headers.get("content-type").startsWith("text/html")) {
                    // Si le contenu est en HTML, on le convertit en texte Markdown.

                    /* récupération de l'url de base de inputUrl */
                    const nurl = new URL(inputUrl);
                    const baseUrl = nurl.origin;

                    /* nettoyage du code HTML */
                    let cleanHTML = DOMPurify.sanitize(txt);

                    /* transformation du code HTML en DOM */
                    cleanHTML = cleanHTML.replaceAll('href="/', `href="${baseUrl}/`);
                    cleanHTML = cleanHTML.replaceAll('"//', `"https://`);
                    const doc = new DOMParser().parseFromString(cleanHTML, 'text/html');

                    /* simplification avec Readability (Mozilla) */
                    const article = new Readability(doc).parse();

                    /* transformation du HTML simplifié en Markdown */
                    let turndownService = new TurndownService();
                    txt = turndownService.turndown(article.content);
                }

                // inscription du texte dans la zone de saisie
                setMarkdownContent(txt);

                // rendre accessible l'url du texte
                urlToMDdata = inputUrl;
            }

            // affichage du texte adapté
            affichePage("texte-adapte");
        } else {
            throw new Error("Erreur sur la page à lire.");
        }
    }
    catch (err) {
        console.log(err);

        // rendre inaccessible l'url du texte
        urlToMDdata = "";

        setMarkdownContent("Une erreur est survenue lors de la récupération de l'url fournie.")
        affichePage("texte-adapte");
    }
}

/**
 * Source : https://forge.apps.education.fr/eyssette/chatMD
 * Merci Monsieur Eyssette !
 * @param {*} url 
 * @returns 
 */
function handleURL(url) {
    if (url !== "") {
        let corsProxy = "https://corsproxy.io/?url=";
        let addCorsProxy = true;
        // Gestion des fichiers hébergés sur la forge et publiés sur une page web
        if (url.includes(".forge")) {
            addCorsProxy = false;
        }
        // Gestion des fichiers hébergés sur github
        if (url.startsWith("https://github.com")) {
            addCorsProxy = false;
            url = url.replace(
                "https://github.com",
                "https://raw.githubusercontent.com",
            );
            url = url.replace("/blob/", "/");
        }
        // gestion des fichiers hébergés sur codiMD / le pad gouv / hedgedoc / digipage
        if (
            url.startsWith("https://codimd") ||
            url.startsWith("https://pad.numerique.gouv.fr/") ||
            url.includes("hedgedoc") ||
            url.includes("digipage")
        ) {
            addCorsProxy = false;
            url = url
                .replace("?edit", "")
                .replace("?both", "")
                .replace("?view", "")
                .replace(/#$/, "")
                .replace(/\/$/, "");
            url = url.indexOf("download") === -1 ? url + "/download" : url;
        }
        // gestion des fichiers hébergés sur framapad ou digidoc
        if (url.includes("framapad") || url.includes("digidoc")) {
            addCorsProxy = false;
            if (!url.endsWith("/export/txt")) {
                url = url.replace(/\?.*/, "") + "/export/txt";
            }
        }
        url = addCorsProxy ? corsProxy + encodeURIComponent(url) : url;
    }
    return url;
}

/**
 * Initialisation de l'application
 */
document.addEventListener("DOMContentLoaded", () => {
    // choix de la langue de synthèse vocale
    if ("speechSynthesis" in window) {
        let allVoices = window.speechSynthesis.getVoices();
        for (i = 0; i < allVoices.length; i++) {
            if (allVoices[i].lang.indexOf("fr") >= 0) {
                voices.push(allVoices[i]);
            }
        }
        if (voices.length == 0) voices.push(allVoices[0]);
    }

    /* Affichage du texte d'accueil du profil courant s'il y a */
    let prof = listeProfils.getSelectedProfile();
    let archtxt = null;
    try {
        archtxt = localStorage.getItem("texte-lirecouleur");
    } catch (_) {
    }
    if ((archtxt === null) && (prof.json.params.hasOwnProperty("accueil"))) {
        archtxt = decodeURI(prof.json.params["accueil"]);
    }
    if (archtxt !== null) setMarkdownContent(archtxt);
    else setMarkdownContent(texteDefaut.replaceAll('_', '`'));

    /* masquer la barre de navigation de l'éditeur */
    for (let nd of document.getElementsByClassName("toastui-editor-md-tab-container")) {
        nd.style.display = 'none';
    }

    /* mise à jour de la liste des profils disponible et affichage du texte adapté */
    miseAJourProfilsVisu();
    affichePage("texte-adapte");

    /* contrôle pour voir si une URL est passée en paramètre */
    const url = window.location.hash.substring(1).replace(/\?.*/, "");
    if (isValidUrl(url)) {
        // le texte décodé est une url valide
        ouvrirUrl(url);
    }
});

const tabcontent = document.getElementsByClassName("contenu");
for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].addEventListener('click', function (__) {
        document.getElementById("preview").style.display = 'none';
        document.getElementById("sidemenu").style.width = "0";
        event.stopPropagation();
    });
}

document.getElementById('preview').addEventListener('click', function (event) {
    // faire disparaitre la fenêtre de prévisualisation lorsqu'on clique dessus
    document.getElementById('preview').style.display = 'none';
    event.stopPropagation();
});

document.getElementById('texte-adapte').addEventListener('click', function (event) {
    // récupération du profil courant pour voir s'il faut prendre en compte le clic
    /*const profilSelectione = listeProfils.getSelectedProfile();
    if (!profilSelectione.hasFunction("lecteur")) {
        return;
    }*/

    // Obtenir la position du clic
    const x = event.clientX;
    const y = event.clientY;

    if (dernierMotClique !== undefined) dernierMotClique.classList.replace("mot-lu", "_t_");

    let selection = window.getSelection();
    if (!selection.isCollapsed || (selection.type !== "Caret")) return;

    // Obtenir le mot le plus proche
    let closestDistance = Infinity;

    let lmots = document.getElementsByClassName("mot");
    for (let index in lmots) {
        let wordSpan = lmots[index];
        if (wordSpan.nodeType == 1) {
            const rect = wordSpan.getBoundingClientRect();
            let distance = Infinity;
            if ((x <= rect.right) && (x >= rect.left) && (y <= rect.bottom) && (y >= rect.top)) {
                distance = 0;
            } else {
                const dtl = Math.sqrt(Math.pow(rect.left - x, 2) + Math.pow(rect.top - y, 2));
                const dtr = Math.sqrt(Math.pow(rect.right - x, 2) + Math.pow(rect.top - y, 2));
                const dbl = Math.sqrt(Math.pow(rect.left - x, 2) + Math.pow(rect.bottom - y, 2));
                const dbr = Math.sqrt(Math.pow(rect.right - x, 2) + Math.pow(rect.bottom - y, 2));
                distance = Math.min(dtl, dtr, dbl, dbr);
            }

            if (distance < closestDistance) {
                closestDistance = distance;
                dernierMotClique = wordSpan;
            }
        }
    }

    //console.log(closestDistance);
    if (closestDistance < 10) {
        dernierMotClique.classList.replace("_t_", "mot-lu");
    } else {
        dernierMotClique = undefined;
    }
});

function resizeWindow() {
    affichePage("texte-adapte");
}
window.onresize = resizeWindow;


function exportToDOCX(htmlContent, fileName) {
    const styleHTML = `body {font-family: Arial,sans-serif;
    padding: 10mm;
    font-size: 14px;}`
    /**
            const htmlContent = document.getElementById('texte-adapte').innerHTML;
            const styleHTML = `body {font-family: Arial,sans-serif;
            padding: 10mm;
            font-size: 14px;}`
            exportToDOCX(`<html><head><title>Texte adapté par LireCouleur</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><style>${styleHTML}</style></head><body>${htmlContent}</body></html>`,
                'mon-document');
         */
    var blob = htmlDocx.asBlob(`<html><head><title>Texte adapté par LireCouleur</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><style>${styleHTML}</style></head><body>${htmlContent}</body></html>`);

    /**
    // Créer un nouvel objet Blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    */
    // Créer un lien de téléchargement
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName + '.docx';

    // Ajouter le lien de téléchargement au document
    document.body.appendChild(downloadLink);

    // Déclencher le téléchargement
    downloadLink.click();

    // Supprimer le lien de téléchargement
    document.body.removeChild(downloadLink);
}
