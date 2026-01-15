/*
 * functionlc6.js : ensemble des fonctions d'adaptation disponibles
 * Ce module fait partie du projet LireCouleur - http://lirecouleur.arkaline.fr
 *
 * @author Marie-Pierre Brungard
 * @version 1.0
 * @since 2022
 *
 * GNU General Public Licence (GPL) version 3
 */
function isArray(myobj) {
    return myobj.constructor === Array;
}

function isString(myobj) {
    return myobj.constructor === String;
}

function txtStyle(rule) {
    STYLE_CORRESPONDANCE = {
        color: function (val) {
            if (val != "#000000") return `color: ${val}; `;
        },
        height: function (val) {
            return `font-size: ${val}px; `;
        },
        page_width: function (val) {
            return `max-width:${val}rem;`;
        },
        weight: function (val) {
            if (val != 100) return `font-weight: ${val}; `;
        },
        bold: function (val) {
            if (val) return `font-weight: bold; `;
        },
        stroke: function (val) {
            if (val) return `font-weight: bold; -webkit-text-stroke: 0.03em black; `;
        },
        underline: function (val) {
            if (val) return `text-decoration: underline; `;
        },
        highlight: function (val) {
            if (val != "#ffffff") return `--highlight: ${val}; `;
        },
        background: function (val) {
            if (val != "#ffffff") return `background-color: ${val}; `;
        },
        shadow: function (val) {
            if (val)
                return `text-shadow: 1.2pt 1.2pt 0.5pt black;`;
        },
        word_spacing: function (val) {
            if (val) return `word-spacing: 1em; `;
        },
        emphasis: function (val) {
            return `font-style: italic; `;
        },
        italic: function (val) {
            if (val) return `font-style: italic; `;
        },
        scale_width: function (val) {
            return `letter-spacing: ${val * 0.01}px; word-spacing: 0.3em;`;
        },
        font_name: function (val) {
            if (val.trim().length > 0) return `font-family: '${val}'; `;
        },
        font_family: function (val) {
            if (val.trim().length > 0) return `font-family: '${val}'; `;
        },
        line_spacing: function (val) {
            return `line-height: ${val * 0.01}; `;
        },
    };

    let propStr = "";
    for (let element in rule) {
        let val = rule[element];
        if (typeof STYLE_CORRESPONDANCE[element] === "function") {
            let vs = STYLE_CORRESPONDANCE[element](rule[element]);
            if (typeof vs !== "undefined") propStr += vs;
        }
    }
    return propStr;
}

class FunctionLC6 {
    /**
     * Les différents niveaux d'intervention des fonctions
     */
    static TEXTE = 0;
    static MOT = 1;
    static SYLLABE = 2;
    static INTERMOTS = 3;
    static PHONEME = 4;
    static LETTRE = 5;

    constructor(struc) {
        this.name = struc.function;
        this.styles = new Array();
        this.mode = "style";
        if (struc.hasOwnProperty("format")) {
            if (isArray(struc.format)) {
                for (let i = 0; i < struc.format.length; i++) {
                    this.styles.push(txtStyle(struc.format[i]));
                }
            } else {
                //this.mode = 'class';
                this.mode = "style";
                //let nstysh = this.createStyleSheet();
                for (let sty in struc.format) {
                    //this.addStyle(nstysh, sty, struc.format[sty]);
                    //this.styles.push(sty);
                    this.styles.push(txtStyle(struc.format[sty]));
                }
            }
        }
        if (struc.hasOwnProperty("params")) {
            this.params = struc.params;
        } else {
            this.params = {};
        }
    }

    getLevel() {
        return FunctionLC6.TEXTE;
    }

    toHTML(txt, __) {
        return txt;
    }

    postProcessHTML(__) {
    }

    createStyleSheet() {
        const styleEl = document.createElement("style");

        // Append <style> element to <head>
        document.head.appendChild(styleEl);

        // Grab style element's sheet
        return styleEl.sheet;
    }

    addStyle(styleSheet, selector, rule) {
        let propStr = `.${selector} { `;
        for (let element in rule) {
            let val = rule[element].replace(/^0x00/g, "#");
            propStr += `${element}: ${val}; `;
        }
        propStr += `}\n`;
        //console.log(propStr);

        // Insert CSS Rule
        styleSheet.insertRule(
            `${selector}{${propStr}}`,
            styleSheet.cssRules.length
        );
    }
}

class Defaut extends FunctionLC6 {
    constructor(struc) {
        super(struc);
    }

    getLevel() {
        return FunctionLC6.MOT;
    }

    toHTML(txt, __) {
        return txt;
    }
}

class AlternanceLettres extends FunctionLC6 {
    static ilettr = 0;

    constructor(struc) {
        super(struc);
        AlternanceLettres.ilettr = 0;
    }

    getLevel() {
        return FunctionLC6.LETTRE;
    }

    toHTML(txt, __) {
        if (txt.trim().length > 0) {
            AlternanceLettres.ilettr += 1;
            AlternanceLettres.ilettr = AlternanceLettres.ilettr % this.styles.length;
            return `<span ${this.mode}="${this.styles[AlternanceLettres.ilettr]
                }">${txt}</span>`;
        }
        return txt;
    }
}

class AlternancePhonemes extends FunctionLC6 {
    static iphon = 0;

    constructor(struc) {
        super(struc);
        AlternancePhonemes.iphon = 0;
    }

    getLevel() {
        return FunctionLC6.PHONEME;
    }

    toHTML(txt, __) {
        if (txt.trim().length > 0) {
            AlternancePhonemes.iphon += 1;
            AlternancePhonemes.iphon = AlternancePhonemes.iphon % this.styles.length;
            return `<span ${this.mode}="${this.styles[AlternancePhonemes.iphon]
                }">${txt}</span>`;
        }
        return txt;
    }
}

class Lettres extends FunctionLC6 {
    static filtres = {
        a: /[aààâãäå]/gi,
        c: /[cç]/gi,
        e: /[eéèêë]/gi,
        i: /[iìíîï]/gi,
        o: /[oòóõöø]/gi,
        u: /[uùúûü]/gi,
        y: /[yÿ]/gi,
        n: /[nñ]/gi,
    };

    constructor(struc) {
        super(struc);
        this.stlettr = {};
        for (let sty in struc.format) {
            let stf = struc.format[sty];
            if (stf.hasOwnProperty("lettres")) {
                let txtsty = txtStyle(struc.format[sty]);
                for (let i in stf["lettres"]) {
                    let k = stf["lettres"][i];
                    if (k.length > 0) {
                        if (Lettres.filtres.hasOwnProperty(k)) {
                            this.stlettr[k] = {
                                reg: Lettres.filtres[k],
                                sty: txtsty,
                            };
                        } else {
                            this.stlettr[k] = {
                                reg: new RegExp(k, "gi"),
                                sty: txtsty,
                            };
                        }
                    }
                }
            }
        }
        this.elettr = Object.keys(this.stlettr);
    }

    getLevel() {
        return FunctionLC6.MOT;
    }

    recToHTML(txt, i) {
        if (txt.trim() == 0) return txt;

        let res;
        let k = 0;
        let rtxt = "";
        let regex = this.stlettr[this.elettr[i]].reg;
        let sty = this.stlettr[this.elettr[i]].sty;
        while ((res = regex.exec(txt)) !== null) {
            if (i == 0) {
                rtxt += txt.slice(k, res.index);
            } else {
                rtxt += this.recToHTML(txt.slice(k, res.index), i - 1);
            }
            rtxt += `<span ${this.mode}="${sty}">${res[0]}</span>`;
            k = regex.lastIndex;
        }
        // récupération du dernier morceau
        if (i == 0) {
            rtxt += txt.slice(k);
        } else {
            rtxt += this.recToHTML(txt.slice(k), i - 1);
        }
        return rtxt;
    }

    toHTML(txt, code, txtElt) {
        const rtxt = this.recToHTML(txt, this.elettr.length - 1);
        return rtxt;
    }
}

class Phonemes extends FunctionLC6 {
    constructor(struc) {
        super(struc);
        this.stphon = {};
        this.pictophon = {};
        this.signesAPI = {};
        for (let sty in struc.format) {
            let stf = struc.format[sty];
            if (stf.hasOwnProperty("phonemes")) {
                let txtsyt = txtStyle(struc.format[sty]);
                for (let i in stf["phonemes"]) {
                    this.stphon[stf["phonemes"][i]] = txtsyt;
                    if (stf.hasOwnProperty("picto")) {
                        this.pictophon[stf["phonemes"][i]] = stf.picto;
                    }
                    if (stf.hasOwnProperty("signeapi")) this.signesAPI[stf["phonemes"][i]] = true;
                }
            }
        }
    }

    getLevel() {
        return FunctionLC6.PHONEME;
    }

    toHTML(txt, code, textNode) {
        if (this.stphon.hasOwnProperty(code)) {
            let nspan = `<span ${this.mode}="${this.stphon[code]}">${txt}</span>`;
            if (this.signesAPI.hasOwnProperty(code)) {
                let sapi = `[${code}]`;
                if (alphabetPhonetique.hasOwnProperty(code)) sapi = alphabetPhonetique[code];

                let e = document.createElement("span");
                e.style.position = 'absolute'; // position absolue pour éviter les problèmes de layout
                e.style.visibility = 'hidden'; // masquer l'élément pour éviter les problèmes de layout
                e.style.width = 'auto'; // permettre à l'élément de prendre sa largeur naturelle
                e.style.whiteSpace = 'nowrap'; // empêcher les sauts de ligne
                if (sapi.length > txt.length) e.innerHTML = sapi;
                else e.innerHTML = nspan;
                textNode.appendChild(e); // insertion dans le corps de la page pour obtenir la largeur
                let cs = window.getComputedStyle(e, null);
                let www = cs.getPropertyValue("width");
                e.remove();

                let signe = `<span style="font-family:Andika;width:auto;margin:0 auto;display:block; margin-bottom:0; font-size: 80%;">${sapi}</span>`;
                return `<span style="width: ${www}; display: inline-block; text-align: center;">${signe}${nspan}</span>`;
            } else {
                if (this.pictophon.hasOwnProperty(code)) {
                    let e = document.createElement("span");
                    e.style.position = 'absolute'; // position absolue pour éviter les problèmes de layout
                    e.style.visibility = 'hidden'; // masquer l'élément pour éviter les problèmes de layout
                    e.style.width = 'auto'; // permettre à l'élément de prendre sa largeur naturelle
                    e.style.whiteSpace = 'nowrap'; // empêcher les sauts de ligne
                    e.innerHTML = "e";
                    textNode.appendChild(e); // insertion dans le corps de la page pour obtenir la largeur
                    let width = e.getBoundingClientRect().width;
                    let cote = Math.min(width, e.getBoundingClientRect().height);
                    width = width * txt.length;
                    e.remove();

                    let img = `<img src="${this.pictophon[code]}" style="width:${cote}px;height:${cote}px;margin:0 auto;display:block; margin-bottom:-${cote / 2}px;"/>`;
                    return `<span style="width: ${width}px; display: inline-block; text-align: center;">${img}${nspan}</span>`;
                } else {
                    return nspan;
                }
            }
        }
        return txt;
    }
}

class Syllabes extends FunctionLC6 {
    constructor(struc) {
        super(struc);
        this.sep = "⁞"; // alt : ˎ˔˛˰⁞▫
        if (struc.hasOwnProperty("separator")) {
            this.sep = struc.separator;
        }
    }

    getLevel() {
        return FunctionLC6.SYLLABE;
    }

    toHTML(txt, pos, __) {
        if (txt.trim().length > 0) {
            if (pos > 0) {
                // traitement uniquement de syllabes 1 à n-2 d'un mot
                return `${this.sep}${txt}`;
            }
            return txt;
        }
        return txt;
    }
}

class SyllArc extends FunctionLC6 {
    constructor(struc) {
        super(struc);
    }

    getLevel() {
        return FunctionLC6.SYLLABE;
    }

    toHTML(txt, pos, textNode) {
        let lh = textNode.style.lineHeight;
        if (txt.trim().length > 0) {
            let e = document.createElement("span");
            e.style.position = 'absolute'; // position absolue pour éviter les problèmes de layout
            e.style.visibility = 'hidden'; // masquer l'élément pour éviter les problèmes de layout
            e.style.width = 'auto'; // permettre à l'élément de prendre sa largeur naturelle
            e.style.whiteSpace = 'nowrap'; // empêcher les sauts de ligne
            e.innerHTML = txt;
            textNode.appendChild(e); // insertion dans la structure pour obtenir la largeur
            var cs = window.getComputedStyle(e, null);
            let hhh = cs.getPropertyValue("height");
            let www = cs.getPropertyValue("width");

            e.remove();

            let img = `<img src="img/arc.png" style="width:${www};height:5px;margin-bottom:${hhh};background-position: center;"/>`;
            return `<span style="width:${www}; display: inline-block; text-align: center; vertical-align: top;">${txt}${img}</span>`;
        }
        return txt;
    }
}

class Liaisons extends FunctionLC6 {
    constructor(struc) {
        super(struc);
    }

    getLevel() {
        return FunctionLC6.INTERMOTS;
    }

    toHTML(txt, pos, textNode) {
        let lh = textNode.style.lineHeight;
        if (txt.length > 0) {
            let e = document.createElement("span");
            e.classList.add("_t_");
            e.style.position = 'absolute'; // position absolue pour éviter les problèmes de layout
            e.style.visibility = 'hidden'; // masquer l'élément pour éviter les problèmes de layout
            e.style.width = 'auto'; // permettre à l'élément de prendre sa largeur naturelle
            e.style.whiteSpace = 'pre';
            e.innerHTML = txt;
            textNode.appendChild(e); // insertion dans la structure pour obtenir la largeur

            var cs = window.getComputedStyle(e, null);
            let hhh = cs.getPropertyValue("height");
            let www = cs.getPropertyValue("width");

            e.remove();

            let img = `<img src="img/arc2.png" style="width:${www};height:5px;margin-top:${hhh};background-position: center;"/>`;
            return `<span style="width:${www}; display: inline-block; text-align: center; vertical-align: bottom;">${txt}${img}</span>`;
        }
        return txt;
    }
}

class AlternanceSyllabes extends FunctionLC6 {
    static isyll = 0;

    constructor(struc) {
        super(struc);
        AlternanceSyllabes.isyll = 0;
    }

    getLevel() {
        return FunctionLC6.SYLLABE;
    }

    toHTML(txt, __) {
        if (txt.trim().length > 0) {
            AlternanceSyllabes.isyll += 1;
            AlternanceSyllabes.isyll = AlternanceSyllabes.isyll % this.styles.length;
            return `<span ${this.mode}="${this.styles[AlternanceSyllabes.isyll]
                }">${txt}</span>`;
        }
        return txt;
    }
}

class AlternanceMots extends FunctionLC6 {
    static imot = 0;

    constructor(struc) {
        super(struc);
        AlternanceMots.imot = 0;
    }

    getLevel() {
        return FunctionLC6.MOT;
    }

    toHTML(txt, __) {
        if (txt.trim().length > 0) {
            AlternanceMots.imot += 1;
            AlternanceMots.imot = AlternanceMots.imot % this.styles.length;
            return `<span ${this.mode}="${this.styles[AlternanceMots.imot]
                }">${txt}</span>`;
        }
        return txt;
    }
}

class AlternanceLignes extends FunctionLC6 {
    static ilig = 0;

    constructor(struc) {
        super(struc);
        AlternanceLignes.ilig = 0;
    }

    getLevel() {
        return FunctionLC6.TEXTE;
    }

    postProcessHTML(elt) {
        let paras = elt.querySelectorAll('p');

        // décomposition des paragraphes en mots si nécessaire
        paras.forEach((para) => {
            let rtxt = "";
            for (let i = 0; i < para.childNodes.length; i++) {
                if (para.childNodes[i].nodeType == 3) {
                    let stxt = new Texte(para.childNodes[i].textContent);
                    stxt.decompose(FunctionLC6.MOT);
                    rtxt += stxt.toHTML([]);
                } else {
                    rtxt += para.childNodes[i].outerHTML;
                }
            }
            para.innerHTML = rtxt;

            // coloriage des lignes du paragraphe
            let ymin = 10000, ymax = 0;
            for (let i = 0; i < para.childNodes.length; i++) {
                let mot = para.childNodes[i];
                try {
                    let mbr = mot.getBoundingClientRect();
                    let milieu = mbr.y + mbr.height / 2;
                    if ((ymin > milieu) || (milieu > ymax)) {
                        AlternanceLignes.ilig += 1;
                        AlternanceLignes.ilig = AlternanceLignes.ilig % this.styles.length;
                        ymin = mbr.y;
                        ymax = mbr.y + mbr.height;
                    }
                } catch (_) { }
                mot.style = this.styles[AlternanceLignes.ilig];
            }
        });
    }
}

class RegleLecture extends FunctionLC6 {
    constructor(struc) {
        super(struc);
    }

    getLevel() {
        return FunctionLC6.TEXTE;
    }

    postProcessHTML(elt) {
        let paras = elt.querySelectorAll('p');
        paras.forEach((para) => {
            let t_lignes = extractLinesFromTextNode(para);
            //console.log(t_lignes);
            let rtxt = "";

            t_lignes.forEach(
                function iterator(ligne) {
                    rtxt += `<div class="ligne">${ligne}</div>`;
                });
            // console.log(rtxt);
            para.innerHTML = rtxt;
        });

        // changement de la couleur de surbrillance en fonction du paramètre de formatage
        let obj = this;
        if (obj.styles.length > 0) {
            const lignes = elt.getElementsByClassName('ligne');
            for (let ligne of lignes) {
                ligne.style = obj.styles[0];
            }
        }
    }
}

class Lecteur extends FunctionLC6 {
    constructor(struc) {
        super(struc);
    }

    getLevel() {
        return FunctionLC6.TEXTE;
    }
}

/*
* Extract the visually rendered lines of text from the given textNode as seen by the user.
*/
function extractLinesFromTextNode(textNode) {

    let e = document.createElement("span");
    e.style.position = 'absolute'; // position absolue pour éviter les problèmes de layout
    e.style.visibility = 'hidden'; // masquer l'élément pour éviter les problèmes de layout
    e.style.width = 'auto'; // permettre à l'élément de prendre sa largeur naturelle
    e.style.whiteSpace = 'nowrap'; // empêcher les sauts de ligne
    e.textContent = "";
    textNode.appendChild(e); // insertion dans le corps de la page pour obtenir la largeur
    let maxWidth = textNode.getBoundingClientRect().width;
    var lines = [];

    for (let cnode of textNode.childNodes) {
        let oldTextContent = e.innerHTML;
        let addTextContent = cnode.outerHTML;
        if (cnode.nodeType == 3) {
            addTextContent = cnode.textContent;
        }
        e.innerHTML += addTextContent;
        let width = e.getBoundingClientRect().width;
        if (width >= maxWidth) {
            lines.push(oldTextContent);
            e.innerHTML = addTextContent;
        }
    }
    lines.push(e.innerHTML);
    e.remove();
    return lines;
}

/*
 * association des fonctions à leurs noms
 */
var lc6classes = {
    defaut: Defaut,
    lettres: Lettres,
    phonemes: Phonemes,
    syllabes: Syllabes,
    syllarc: SyllArc,
    liaisons: Liaisons,
    alternphonemes: AlternancePhonemes,
    alternlettres: AlternanceLettres,
    alternsyllabes: AlternanceSyllabes,
    alternmots: AlternanceMots,
    alternlignes: AlternanceLignes,
    reglelecture: RegleLecture,
    lecteur: Lecteur,
};
