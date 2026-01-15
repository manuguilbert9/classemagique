/*
 * processlc6.js
 * Ce module fait partie du projet LireCouleur - http://lirecouleur.arkaline.fr
 * 
 * @author Marie-Pierre Brungard
 * @version 1.0
 * @since 2022
 *
 * GNU General Public Licence (GPL) version 3
  */

class Texte {
    static TEXTE = 0;
    static MOT = 1;
    static SYLLABE = 2;
    static INTERMOTS = 3;
    static PHONEME = 4;
    static LETTRE = 5;

    constructor(txt) {
        this.text = txt;
        this.level = Texte.TEXTE;
        this.portions = new Array();
        this.intercal = new Array();
    }

    /**
     * Prépare la structure de données pour le formatage typographique
     * @param {*} lfunc 
     */
    prepare(lfunc, lecteur_deb, std_lc, oral_ecrit) {
        // définition du niveau de décomposition maximal
        let maxlev = 0;
        lfunc.forEach(element => {
            maxlev = Math.max(maxlev, element.getLevel());
        });

        // décompositions
        this.decompose(maxlev, lecteur_deb, std_lc, oral_ecrit);
    }

    decompose(lev, lecteur_deb, std_lc, oral_ecrit) {
        if (lev > this.level) {
            let ntext = this.text;
            let i = 0;
            let intercal;
            const pat = /([a-z@àäâéèêëîïôöûùçœ'’0123456789]+)/gi;
            let motPrec;
            for (const match of ntext.matchAll(pat)) {
                // espace inter mots
                intercal = ntext.slice(i, match.index);

                // mot
                let nmot = new Mot(match[0]);
                nmot.decompose(lev, lecteur_deb, std_lc, oral_ecrit);

                if (intercal.length > 0) {
                    if ((typeof motPrec !== 'undefined') && motPrec.liaisonAval && nmot.liaisonAmont && (intercal.trim().length == 0)) {
                        this.portions.push(new InterMots(intercal, "liaison"));
                    } else {
                        this.portions.push(new InterMots(intercal));
                    }
                }
                this.portions.push(nmot);

                // portion entre mots
                //this.intercal.push(ntext.slice(i, match.index));
                i = match.index + match[0].length;
                motPrec = nmot;
            }
            intercal = ntext.slice(i);
            if (intercal.length > 0) this.portions.push(new InterMots(intercal));
            //this.intercal.push(ntext.slice(i));
        }
    }

    span(txt, cln) {
        if (typeof cln !== 'undefined') return (txt.length > 0 ? `<span class="${cln}">${txt}</span>` : "");
        //return (txt.length > 0 ? `<span class="_t_">${txt}</span>` : "");
        return (txt);
    }

    toHTML(lfunc, textElt) {
        let ntext = "";

        // appliquer les fonctions de transformation aux portions
        if (this.portions.length > 0) {
            for (let i = 0; i < this.portions.length; i++) {
                let portion = this.portions[i].toHTML(lfunc, textElt);
                //if (this.intercal.length > i) ntext += this.span(this.intercal[i], "_t_");
                //if (this.intercal.length > 0) ntext += this.intercal[i];
                ntext += portion;
            }
            //if (this.intercal.length > this.portions.length) ntext += this.span(this.intercal[this.portions.length], "_t_");
        } else {
            ntext = this.text;
        }

        // appliquer les fonctions de transformation globales
        for (let i = 0; i < lfunc.length; i++) {
            let func = lfunc[i];
            if (func.getLevel() == this.level) {
                ntext = func.toHTML(ntext, textElt);
            }
        }
        //console.log(ntext);
        return ntext;
    }

    toJSON() {
        let rst = [];
        for (let i = 0; i < this.portions.length; i++) {
            //if ((this.intercal.length > i) && (this.intercal[i].length > 0)) rst.push(this.intercal[i]);
            rst.push(this.portions[i].toJSON());
        }
        //if ((this.intercal.length > this.portions.length) && (this.intercal[this.portions.length].length > 0)) rst.push(this.intercal[this.portions.length]);

        return { type: "texte", parts: rst };
    }
}

class Mot extends Texte {
    constructor(txt) {
        super(txt);
        this.level = Texte.MOT;
        this.mot = /([a-zA-ZàäâéèêëîïôöûùçœÂÊÎÔÛÄËÏÖÜÀÇÉÈŒÙ'’]+)/.test(txt);
        //console.log("Mot:"+txt);
    }

    decompose(lev, lecteur_deb, std_lc, oral_ecrit) {
        if ((lev > this.level) && (this.mot)) {
            if (lev == Texte.LETTRE) {
                // décomposition du mot en lettres
                let ntext = this.text;
                if (ntext.length < 1) {
                    return;
                }
                for (let i = 0; i < ntext.length; i++) {
                    this.portions.push(new Lettre(ntext[i]));
                }
            } else {
                // décomposition du mots en phonèmes et syllabes
                try {
                    var phon = LireCouleur.extrairePhonemes(this.text, lecteur_deb);
                    if (phon === null) {
                        this.mot = false;
                    } else {
                        var sylls = LireCouleur.extraireSyllabes(phon, std_lc, oral_ecrit);
                        var nbsylls = sylls.length;
                        var isyll = 0;
                        sylls.forEach(element => {
                            var nsyll = new Syllabe("", isyll, nbsylls);
                            nsyll.compose(element, lev);
                            this.portions.push(nsyll);
                            isyll += 1;
                        });

                        // indicateur pour savoir si une liaison est possible ou non
                        this.liaisonAmont = LireCouleur.liaisonAmont(phon);
                        this.liaisonAval = LireCouleur.liaisonAval(this.text);
                    }
                } catch (error) {
                    console.error(error);
                    this.mot = false;
                }
            }
        }
    }

    span(txt, cln) {
        if (typeof cln !== 'undefined') return (txt.length > 0 ? `<span class="${cln}">${txt}</span>` : "");
        return (txt.length > 0 ? `<span class="_t_ mot">${txt}</span>` : "");
    }

    toHTML(lfunc, txtElt) {
        if (!this.mot) {
            // pas de transformation pour les non mots
            return this.span(this.text);
        }
        return this.span(super.toHTML(lfunc, txtElt));
    }

    toJSON() {
        if (!this.mot) {
            // pas de transformation pour les non mots
            return { type: "nonmot", txt: this.text };
        }
        if (this.portions.length > 0) {
            let rst = [];
            this.portions.forEach(element => {
                rst.push(element.toJSON());
            });
            return { type: "mot", txt: this.text, parts: rst };
        } else {
            return { type: "mot", txt: this.text };
        }
    }
}

class Syllabe extends Texte {
    constructor(txt, index, nbobj) {
        //console.log(lcs);
        super(txt);
        this.index = index;
        this.level = Texte.SYLLABE;
    }

    compose(lcs, lev) {
        if (lev > this.level) {
            lcs.phonemes.forEach(element => {
                let nphon = new Phoneme(element.lettres, element.phoneme);
                this.portions.push(nphon);
                this.text += element.lettres;
            });
        } else {
            lcs.phonemes.forEach(element => {
                this.text += element.lettres;
            });
        }
    }

    toHTML(lfunc, txtElt) {
        let ntext = "";
        // appliquer les fonctions de transformation aux portions
        if (this.portions.length > 0) {
            this.portions.forEach(element => {
                ntext += element.toHTML(lfunc, txtElt);
            });
        } else {
            ntext = this.text;
        }

        // appliquer les fonctions de transformation globales
        for (let i = 0; i < lfunc.length; i++) {
            let func = lfunc[i];
            if (func.getLevel() == this.level) {
                ntext = func.toHTML(ntext, this.index, txtElt);
            }
        }
        //console.log(ntext);
        return ntext;
    }

    toJSON() {
        if (this.portions.length > 0) {
            let rst = [];
            this.portions.forEach(element => {
                rst.push(element.toJSON());
            });
            return { type: "syllabe", txt: this.text, parts: rst };
        } else {
            return { type: "syllabe", txt: this.text };
        }
    }
}

class Phoneme extends Texte {
    constructor(txt, code) {
        super(txt);
        this.code = code;
        this.level = Texte.PHONEME;
    }

    toHTML(lfunc, txtElt) {
        let ntext = '';
        for (let i = 0; i < lfunc.length; i++) {
            let func = lfunc[i];
            if (func.getLevel() == this.level) {
                ntext = func.toHTML(this.text, this.code, txtElt);
            }
        }
        //console.log(ntext);
        return ntext;
    }

    toJSON() {
        return { type: "grapheme", txt: this.text, code: this.code };
    }
}

class Lettre extends Texte {
    constructor(txt, code) {
        super(txt);
        this.code = code;
        this.level = Texte.LETTRE;
    }

    toHTML(lfunc, txtElt) {
        let ntext = '';
        for (let i = 0; i < lfunc.length; i++) {
            let func = lfunc[i];
            if (func.getLevel() == this.level) {
                ntext = func.toHTML(this.text, this.code, txtElt);
            }
        }
        //console.log(ntext);
        return ntext;
    }
}

class InterMots extends Texte {
    constructor(txt, code) {
        super(txt);
        if (typeof code !== 'undefined') this.code = code;
        else this.code = "";
        this.level = Texte.INTERMOTS;
    }

    toHTML(lfunc, txtElt) {
        let ntext = '';
        if (this.code.length > 0) {
            // appliquer les fonctions de transformation globales
            for (let i = 0; i < lfunc.length; i++) {
                let func = lfunc[i];
                if (func.getLevel() == this.level) {
                    ntext = func.toHTML(this.text, this.index, txtElt);
                }
            }
        }
        //console.log(ntext);
        if (ntext.length > 0) return ntext;
        //return this.span(this.text, "_t_");
        return this.text;
    }

    toJSON() {
        return { type: "intermot", txt: this.text, code: this.code };
    }
}

/**
 * 
 * @param {*} txt texte à analyser
 * @returns structure json de décomposition du texte en mots, syllabes, graphèles
 */
function LireCouleurToJSON(txt) {
    let stxt = new Texte(txt);

    // décomposition du texte en syllabes
    stxt.decompose(3);

    // création d'une structure json
    return stxt.toJSON();
}
