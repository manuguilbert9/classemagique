/*
 * userprofile.js : gestion du profil utilisateur
 * Ce module fait partie du projet LireCouleur - http://lirecouleur.arkaline.fr
 * 
 * @author Marie-Pierre Brungard
 * @version 1.0
 * @since 2022
 *
 * GNU General Public Licence (GPL) version 3
 */
const profilDefaut1 = `{"name":"Syllabes colorées","description":"Alternance de couleurs sur les syllabes et marquage des phonèmes muets","params":{"SYLLABES_ECRITES":true,"novice_reader":true,"SYLLABES_LC":true},"format":{"font_name":"   ","color":"#111111","background":"#ffffff","line_spacing":150,"scale_width":150,"height":20,"page_width":70},"process":[{"function":"alternsyllabes","format":[{"color":"#ea0000","background":"#ffffff"},{"color":"#0000e1","background":"#ffffff"}]},{"function":"phonemes","format":[{"selection":["#,#_h_muet,verb_3p"],"color":"#aaaaaa","background":"#ffffff","phonemes":["#","#_h_muet","verb_3p"]}]}]}`;
const profilDefaut2 = `{"name":"Syllabes N&B","params":{"SYLLABES_LC":true,"SYLLABES_ECRITES":true,"novice_reader":true},"format":{"height":20,"page_width":70,"scale_width":150,"line_spacing":150},"process":[{"function":"alternsyllabes","format":[{"color":"#000000","background":"#cccccc","bold":true},{"color":"#000000"}]},{"function":"phonemes","format":[{"color":"#999999","phonemes":["#","#_h_muet","verb_3p"]}]}]}`;
const profilDefaut3 = `{"name":"Graphèmes colorés","params":{"novice_reader":true},"format":{"height":24,"scale_width":150,"line_spacing":200,"page_width":70},"process":[{"function":"phonemes","format":[{"color":"#999999","phonemes":["#","#_h_muet","verb_3p"]},{"color":"#3333ff","phonemes":["a"]},{"color":"#ff0000","phonemes":["q","q_caduc","x"]},{"color":"#33cc00","phonemes":["i"]},{"color":"#cc6600","phonemes":["o","o_comp","o_ouvert"]},{"color":"#cc33cc","stroke":true,"shadow":true,"phonemes":["j"]},{"color":"#ffffff","stroke":true,"shadow":true,"phonemes":["wa"]},{"color":"#ffff00","stroke":true,"shadow":true,"phonemes":["w"]},{"color":"#ffcc33","bold":true,"phonemes":["u"]},{"color":"#006600","phonemes":["y"]},{"color":"#33ffff","bold":true,"phonemes":["e","e_comp"]},{"color":"#339999","bold":true,"phonemes":["e^","e^_comp"]},{"color":"#3333ff","stroke":true,"phonemes":["a~"]},{"color":"#33cc00","stroke":true,"phonemes":["e~","x~"]},{"color":"#990000","bold":true,"phonemes":["x^"]},{"color":"#cc6600","stroke":true,"phonemes":["o~"]}]}]}`;
const profilDefaut4 = `{"name":"Alternance lignes","description":"Alternance de couleurs sur les lignes","params":{"SYLLABES_ECRITES":true,"novice_reader":true,"SYLLABES_LC":true},"format":{"font_name":"   ","color":"#111111","background":"#ffffff","line_spacing":150,"scale_width":150,"height":20,"page_width":70},"process":[{"function":"alternlignes","format":[{"color":"#000000","background":"#b9ffb9"},{"color":"#000000","background":"#ffffcc"}]}]}`;
const profilDefaut5 = `{"name":"Mots colorés","params":{"SYLLABES_LC":true,"SYLLABES_ECRITES":true,"novice_reader":true},"format":{"height":20,"scale_width":150,"line_spacing":150},"process":[{"function":"phonemes","format":[{"color":"#aaaaaa","phonemes":["#","#_h_muet","verb_3p"]}]},{"function":"alternmots","format":[{"color":"#000000","background":"#80ff80"},{"color":"#000000","background":"#ffff80"}]}]}`;
const profilDefaut6 = `{"name":"Graphèmes pictogrammes","params":{"novice_reader":true},"format":{"height":32,"scale_width":120,"line_spacing":150},"process":[{"function":"phonemes","format":[{"color":"#999999","phonemes":["#","#_h_muet","verb_3p"]},{"color":"#0000ff","picto":"https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main/img/chat.png","phonemes":["a"]},{"color":"#0000ff","stroke":true,"picto":"https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main/img/panda.png","phonemes":["a~"]},{"color":"#339999","picto":"https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main/img/neige.png","phonemes":["e^","e^_comp"]},{"color":"#ff6600","picto":"https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main/img/ours.png","phonemes":["u"]},{"color":"#33ffff","picto":"https://forge.apps.education.fr/lirecouleur/lirecouleur.forge.apps.education.fr/-/raw/main/img/epee.png","phonemes":["e","e_comp"]}]}]}`;
const profilDefaut7 = `{"name":"Alphabet phonétique","params":{"accueil":"LireCouleur%20%C3%A9crit%20aussi%20les%20mots%20avec%20l'alphabet%20phon%C3%A9tique%20international.","SYLLABES_LC":true,"SYLLABES_ECRITES":true},"format":{"height":24,"scale_width":120,"line_spacing":200},"process":[{"function":"phonemes","format":[{"color":"#aaaaaa","phonemes":["#","#_h_muet","verb_3p"]},{"color":"#000000","signeapi":true,"phonemes":["a","q","q_caduc","i","o","o_comp","o_ouvert","u","y","e","e_comp","e^","e^_comp","a~","e~","x~","o~","x","x^","w","wa","w5","p","t","k","b","d","g","f","f_ph","s","s^","v","z","z^","l","r","m","n","k_qu","z^_g","g_u","s_c","s_t","z_s","ks","gz","j","g~","n~"]}]}]}`;

var profilsParDefaut = `[${profilDefaut1},${profilDefaut2},${profilDefaut3},${profilDefaut4},${profilDefaut5},${profilDefaut6},${profilDefaut7}]`;

function setLocalStorageItem(key, value) {
    const d = new Date();
    d.setTime(d.getTime() + (10 * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";path=/;SameSite=Lax";

    /*if (window.location.protocol == 'file:') {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
    } else {
        localStorage.setItem(key, value);
    }*/
}

function getLocalStorageItem(key) {
    let name = key + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            let substr = c.substring(name.length, c.length);
            return decodeURIComponent(substr);
        }
    }
    return null;

    /*if (window.location.protocol == 'file:') {
        let name = key + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                let substr = c.substring(name.length, c.length);
                return decodeURIComponent(substr);
            }
        }
        return null;
    } else {
        return localStorage.getItem(key);
    }*/
}

class UserProfile {
    constructor(jsonProfil) {
        this.json = JSON.parse(JSON.stringify(jsonProfil));
        this.functions = new Array();
        this.style = "";
        this.std_lc = 'lc';
        this.oral_ecrit = 'ecrit';
        this.lecteur_deb = false;
        this.id = jsonProfil.name;
        this.level = 0;

        if (jsonProfil.hasOwnProperty("format")) {
            this.style = txtStyle(jsonProfil['format']);
        } else {
            this.json.format = new Object();
        }

        if (jsonProfil.hasOwnProperty("process")) {
            for (let i = 0; i < jsonProfil.process.length; i++) {
                let fct = jsonProfil.process[i];
                if ((fct.hasOwnProperty("function")) && (lc6classes.hasOwnProperty(fct.function))) {
                    let nfunc = new lc6classes[fct.function](fct);
                    this.level = Math.max(this.level, nfunc.getLevel());
                    this.functions.push(nfunc);
                }
            }
        } else {
            this.json.process = new Object();
        }

        if (jsonProfil.hasOwnProperty("params")) {
            if (jsonProfil.params.hasOwnProperty("novice_reader")) {
                this.lecteur_deb = jsonProfil.params.novice_reader;
            }

            if (jsonProfil.params.hasOwnProperty("SYLLABES_LC")) {
                if (!jsonProfil.params.SYLLABES_LC) {
                    this.std_lc = 'std';
                }
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_STD")) {
                if (jsonProfil.params.SYLLABES_STD) {
                    this.std_lc = 'std';
                }
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_ORALES")) {
                if (jsonProfil.params.SYLLABES_ORALES) {
                    this.oral_ecrit = 'oral';
                }
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_ECRITES")) {
                if (!jsonProfil.params.SYLLABES_ECRITES) {
                    this.oral_ecrit = 'oral';
                }
            }
        } else {
            this.json.params = new Object();
        }
    }

    getLevel() {
        return this.level;
    }

    toJSONString() {
        return JSON.stringify(this.json);
    }

    toHTML(text, textElt) {
        /*
        for (let i = 0; i < this.functions.length; i++) {
            text = this.functions[i].execute(text);
        }
        */
        this.txt = new Texte(text);
        this.txt.prepare(this.functions, this.lecteur_deb, this.std_lc, this.oral_ecrit);
        return this.txt.toHTML(this.functions, textElt);
    }

    postProcessHTML(textElt) {
        // appliquer les fonctions de transformation globales
        for (let i = 0; i < this.functions.length; i++) {
            let func = this.functions[i];
            if (func.getLevel() == FunctionLC6.TEXTE) {
                func.postProcessHTML(textElt);
            }
        }
    }

    hasFunction(functionName) {
        let func = lc6classes[functionName];
        for (let i = 0; i < this.functions.length; i++) {
            if (this.functions[i] instanceof func) {
                return true;
            }
        }
        return false;
    }

    getFunction(functionName) {
        let func = lc6classes[functionName];
        for (let i = 0; i < this.functions.length; i++) {
            if (this.functions[i] instanceof func) {
                return this.functions[i];
            }
        }
        return undefined;
    }
}

class UserProfiles {
    constructor() {
        let lc = getLocalStorageItem('lirecouleur6');
        let i = getLocalStorageItem('lirecouleur-index-profil');
        let cook = null;
        if (lc !== null) {
            try {
                cook = JSON.parse(lc);
            } catch (error) {
                console.log(error);
                cook = null;
            }
        }
        if (cook === null) {
            cook = JSON.parse(profilsParDefaut);
        }
        if (i !== null) {
            this.index = parseInt(i);
        } else {
            this.index = 0;
        }

        this.profiles = new Array();
        for (let j = 0; j < cook.length; j++) {
            let elem = cook[j];
            this.profiles.push(new UserProfile(elem));
        }
    }

    toJSONString() {
        let txt = '[';
        let sep = '';
        for (let i = 0; i < this.profiles.length; i++) {
            txt += sep + this.profiles[i].toJSONString();
            sep = ',';
        }
        txt += ']';
        return txt;
    }

    replaceProfile(index, json) {
        if (this.profiles.length > 1) {
            if ((index > -1) && (index < this.profiles.length)) {
                delete this.profiles[index];
                this.profiles[index] = new UserProfile(json);
                setLocalStorageItem('lirecouleur6', this.toJSONString());
            }
        }
    }

    addProfile(json) {
        // recherche s'il existe déjà un profil de même nom
        var nProfil = this.profiles.length;
        let cpt = 0;
        let i;
        let nProfils = [];

        // construction d'une liste des noms de profils déja répertoriés
        for (let i = 0; i < nProfil; i++) nProfils.push(this.profiles[i].id);

        // ajustement du nom du nouveau profil si nécessaire
        json.name = json.name.trim();
        while (nProfils.indexOf(json.name) >= 0) {
            json.name += ' (1)';
        }

        // ajout à la liste des profils
        this.profiles.push(new UserProfile(json));
        setLocalStorageItem('lirecouleur6', this.toJSONString());

        // changement de profil courant
        this.selectProfile(nProfil);

        return nProfil;
    }

    removeProfile(index) {
        if (this.profiles.length > 1) {
            if ((index > -1) && (index < this.profiles.length)) {
                if (this.index >= index) {
                    // le profil sélectionné est après le profil courant
                    this.selectProfile(this.index - 1);
                }
                this.profiles.splice(index, 1);
                setLocalStorageItem('lirecouleur6', this.toJSONString());
            }
        }
    }

    getNbProfiles() {
        return this.profiles.length;
    }

    getProfileIndex(i) {
        return this.profiles[i];
    }

    getSelectedProfile() {
        if ((this.index < 0) || (this.index > this.profiles.length - 1)) {
            this.index = this.profiles.length - 1;
        }
        return this.profiles[this.index];
    }

    getSelectedProfileIndex() {
        return this.index;
    }

    selectProfile(i) {
        this.index = i;
        setLocalStorageItem('lirecouleur-index-profil', i.toString());
    }
}
