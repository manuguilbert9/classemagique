/*
    EDITEUR WebLC6
*/
"use strict";

/////////////////  plugins  /////////////////
registerFieldColour();
registerFieldMultilineInput();

/////////////////  functions  /////////////////
function __unquoteList(str) {
    const uqstr = str.replace('"', "");
    return uqstr;
}

function __quoteList(str) {
    const lstr = __unquoteList(str).split(",");
    var lqstr = [];
    for (let i = 0; i < lstr.length; i++) lqstr.push(`"${lstr[i].trim()}"`);
    const qstr = lqstr.join(",");
    return qstr;
}

var theme = {
    "structure": "#4a235a",
    "parametrage": "#cc66ff",
    "format": "#804000",
    "adaptation": "#787746",
    "typo": "#727272",
    "objet": "#446980"
};
/*var couleurs = {
    "structure": "#5D0D6E",
    "parametrage": "#FED440",
    "format": "#0FAC71",
    "adaptation": "#ED4353",
    "typo": "#556C96",
    "objet": "#B1B3C7"
};*/

/////////////////  collecte voix synthèse  /////////////////
async function collecteVoixSynthese() {
    let listeVoix = [];
    if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices().forEach((v, i) => {
            if (v.lang.indexOf("fr") >= 0) {
                listeVoix.push([v.name, i.toString()]);
            }
        });
    } else {
        listeVoix.push(["Voix inconnue", ""]);
    }
    return listeVoix;
}

//////////////////////// STRUCTURE ////////////////////////
// EDLC6
Blockly.Blocks["edlc6"] = {
    init: function () {
        this.setTooltip("Structure d'un profil LireCouleur");
        this.jsonInit({
            message0:
                "nom du profil :%1 %2 paramétrage %3 %4 format général %5 %6 adaptations %7 %8",
            args0: [
                {
                    type: "field_input",
                    name: "name",
                    text: "abcd",
                },
                {
                    type: "input_dummy",
                },
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "params",
                    check: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC"],
                },
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "format",
                    check: ["font_name", "font_name", "line_spacing", "scale_width"],
                },
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "process",
                    check: ["altern", "phonemes"],
                },
            ],
            colour: theme["structure"],
        });
    },
};
jsonGenerator.forBlock["edlc6"] = function (block, generator) {
    var name = block.getFieldValue("name");
    var params = Blockly.json.statementToCode(block, "params").trim();
    var format = Blockly.json.statementToCode(block, "format").trim();
    var process = Blockly.json.statementToCode(block, "process").trim();
    if (params.charAt(params.length - 1) === ",") {
        params = params.slice(0, -1);
    }
    if (format.charAt(format.length - 1) === ",") {
        format = format.slice(0, -1);
    }
    if (process.charAt(process.length - 1) === ",") {
        process = process.slice(0, -1);
    }
    var code = `{"name":"${name ? name.trim() : ""}"`;
    if (params.length > 2) code += `,"params":{${params}}`;
    if (format.length > 2) code += `,"format":{${format}}`;
    if (process.length > 0) code += `,"process":[${process}]`;
    code += "}";
    return code;
};

// SYLLABES_ECRITES
Blockly.Blocks["SYLLABES_ECRITES"] = {
    init: function () {
        this.setTooltip("Syllabes é/cri/tes ou syllabes o/rales");
        this.jsonInit({
            message0: "type de syllabes : %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: [
                        ["écrites", "true"],
                        ["orales", "false"],
                    ],
                },
            ],
            colour: theme["parametrage"],
            previousStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
            nextStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
        });
    },
};
jsonGenerator.forBlock["SYLLABES_ECRITES"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"SYLLABES_ECRITES":${value},`;
    return code;
};

// novice_reader
Blockly.Blocks["novice_reader"] = {
    init: function () {
        this.setTooltip("Lecteur débutant : séparation des diphtongues");
        this.jsonInit({
            message0: "lecteur débutant : %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: [
                        ["oui", "true"],
                        ["non", "false"],
                    ],
                },
            ],
            colour: theme["parametrage"],
            previousStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
            nextStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
        });
    },
};
jsonGenerator.forBlock["novice_reader"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"novice_reader":${value},`;
    return code;
};

// SYLLABES_LC
Blockly.Blocks["SYLLABES_LC"] = {
    init: function () {
        this.setTooltip(
            "Deux modes de découpage possibles :\n- LireCouleur : avant les consonnes doubles\n- standard : entre les consonnes redoublées"
        );
        this.jsonInit({
            message0: "découpage des syllabes : %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: [
                        ["LireCouleur", "true"],
                        ["standard", "false"],
                    ],
                },
            ],
            colour: theme["parametrage"],
            previousStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
            nextStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
        });
    },
};
jsonGenerator.forBlock["SYLLABES_LC"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"SYLLABES_LC":${value},`;
    return code;
};

// niveau d'interface
Blockly.Blocks["interface"] = {
    init: function () {
        this.setTooltip(
            "Selon le niveau choisi, l'interface inclut plus ou moins de fonctions"
        );
        this.jsonInit({
            message0: "niveau interface : %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: [
                        ["débutant", "1"],
                        ["novice", "2"],
                        ["standard", "3"],
                        ["éditeur", "4"],
                    ],
                },
            ],
            colour: theme["parametrage"],
            previousStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
            nextStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
        });
    },
};
jsonGenerator.forBlock["interface"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"interface":${value},`;
    return code;
};

// texte d'accueil
Blockly.Blocks["accueil"] = {
    init: function () {
        this.setTooltip(
            "Texte d'accueil de l'application"
        );
        this.jsonInit({
            message0: "texte d'accueil : %1",
            args0: [
                {
                    type: "field_multilinetext",
                    name: "content",
                    text: "Bonjour LireCouleur !",
                },
            ],
            colour: theme["parametrage"],
            previousStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
            nextStatement: ["SYLLABES_ECRITES", "novice_reader", "SYLLABES_LC", "accueil", "interface"],
        });
    },
};
jsonGenerator.forBlock["accueil"] = function (block, generator) {
    const value = encodeURIComponent(block.getFieldValue("content").trim().replace(/\n/g, "\\n\\n"));
    const code = `"accueil":"${value}",`;
    return code;
};

// police
Blockly.Blocks["font_name"] = {
    init: function () {
        this.jsonInit({
            message0: "police de caractères : %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: [
                        ["Luciole", "Luciole"],
                        ["Accessible Dfa", "Accessible Dfa"],
                        ["OpenDyslexic", "OpenDyslexic"],
                        ["Andika", "Andika"],
                    ],
                },
            ],
            colour: theme["format"],
            previousStatement: [
                "page_width",
                "font_name",
                "font_size",
                "line_spacing",
                "scale_width",
            ],
            nextStatement: ["font_name", "font_size", "page_width", "line_spacing", "scale_width"],
        });
    },
};
jsonGenerator.forBlock["font_name"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"font_name":"${value}",`;
    return code;
};

// largeur de page
Blockly.Blocks["page_width"] = {
    init: function () {
        this.jsonInit({
            message0: "largeur de page : %1 %",
            args0: [
                {
                    type: "field_slider",
                    name: "content",
                    value: 50,
                    min: 20,
                    max: 100,
                },
            ],
            colour: theme["format"],
            previousStatement: [
                "page_width",
                "font_name",
                "font_size",
                "line_spacing",
                "scale_width",
            ],
            nextStatement: ["font_name", "font_size", "page_width", "line_spacing", "scale_width"],
        });
    },
};
jsonGenerator.forBlock["page_width"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"page_width":${value},`;
    return code;
};

// taille de caractères
Blockly.Blocks["font_size"] = {
    init: function () {
        this.jsonInit({
            message0: "taille des caractères : %1 px",
            args0: [
                {
                    type: "field_slider",
                    name: "content",
                    value: 16,
                    min: 12,
                    max: 150,
                },
            ],
            colour: theme["format"],
            previousStatement: [
                "page_width",
                "font_name",
                "font_size",
                "line_spacing",
                "scale_width",
            ],
            nextStatement: ["font_name", "font_size", "page_width", "line_spacing", "scale_width"],
        });
    },
};
jsonGenerator.forBlock["font_size"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"height":${value},`;
    return code;
};

// interligne
Blockly.Blocks["line_spacing"] = {
    init: function () {
        this.jsonInit({
            message0: "interligne : %1 %",
            args0: [
                {
                    type: "field_slider",
                    name: "content",
                    value: 150,
                    min: 100,
                    max: 300,
                },
            ],
            colour: theme["format"],
            previousStatement: [
                "page_width",
                "font_name",
                "font_size",
                "line_spacing",
                "scale_width",
            ],
            nextStatement: ["font_name", "font_size", "page_width", "line_spacing", "scale_width"],
        });
    },
};
jsonGenerator.forBlock["line_spacing"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"line_spacing":${value},`;
    return code;
};

// espacement des caractères
Blockly.Blocks["scale_width"] = {
    init: function () {
        this.jsonInit({
            message0: "espacement : %1 %",
            args0: [
                {
                    type: "field_slider",
                    name: "content",
                    value: 120,
                    min: 100,
                    max: 300,
                },
            ],
            colour: theme["format"],
            previousStatement: [
                "page_width",
                "font_name",
                "font_size",
                "line_spacing",
                "scale_width",
            ],
            nextStatement: ["font_name", "font_size", "page_width", "line_spacing", "scale_width"],
        });
    },
};
jsonGenerator.forBlock["scale_width"] = function (block, generator) {
    const value = block.getFieldValue("content");
    const code = `"scale_width":${value},`;
    return code;
};

// typo
Blockly.Blocks["typo"] = {
    init: function () {
        this.setTooltip(
            "Typographie\n[texte] : couleur du texte,\n[fond] : couleur de l'arrière plan"
        );
        this.jsonInit({
            message0: "texte : %1 -- fond : %2 %3",
            args0: [
                {
                    type: "field_colour",
                    name: "fgcolor",
                    colour: "#000000",
                },
                {
                    type: "field_colour",
                    name: "bgcolor",
                    colour: "#ffffff",
                },
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            previousStatement: ["typo", "picto"],
            nextStatement: ["typo", "picto"],
        });
    },
};
jsonGenerator.forBlock["typo"] = function (block, generator) {
    const fgcolor = block.getFieldValue("fgcolor");
    const bgcolor = block.getFieldValue("bgcolor");
    var suite = "";

    try {
        suite = generator.statementToCode(block, "suite", generator.ORDER_NONE).trim();
    } catch (e) { }
    if (suite.length == 0) {
        try {
            suite = generator.valueToCode(block, "suite", Order.ATOMIC).trim();
        } catch (e) { }
    }
    /*if (suite.charAt(suite.length - 1) === ",") {
      suite = suite.slice(0, -1);
    }*/

    var code = `{"color":"${fgcolor}"`;
    if (bgcolor !== "#ffffff") code += `,"background":"${bgcolor}"`;
    if (suite.length > 0) {
        code += `,${suite}`;
    }
    code += "},";
    return code;
};

// alternance couleurs
Blockly.Blocks["altern"] = {
    init: function () {
        this.setTooltip(
            "Applique une alternance de typographie aux objets.\nLes blocs internes de la fonction définissent les typographies à appliquer."
        );
        this.jsonInit({
            message0: "alterner les couleurs sur les %1 %2 %3",
            args0: [
                {
                    type: "field_dropdown",
                    name: "nature",
                    options: [
                        ["lettres", "alternlettres"],
                        ["graphèmes", "alternphonemes"],
                        ["syllabes", "alternsyllabes"],
                        ["mots", "alternmots"],
                        ["lignes", "alternlignes"],
                    ],
                },
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "content",
                    check: "typo",
                },
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["altern"] = function (block, generator) {
    const nat = block.getFieldValue("nature");
    var statements_content = Blockly.json
        .statementToCode(block, "content")
        .trim();
    if (statements_content.charAt(statements_content.length - 1) === ",") {
        statements_content = statements_content.slice(0, -1);
    }
    var code = `{"function":"${nat}","format":[${statements_content}]},`;
    return code;
};

// syllabes séparées par un caractère
Blockly.Blocks["syllabes"] = {
    init: function () {
        this.setTooltip("Sépare les syllabes par un caractère.");
        this.jsonInit({
            message0: "séparer les syllabes par %1",
            args0: [
                {
                    type: "field_input",
                    name: "sep",
                    text: "˰",
                },
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["syllabes"] = function (block, generator) {
    var sep = block.getFieldValue("sep");

    var code = `{"function":"syllabes","separator":"${sep}"},`;
    return code;
};

// syllabes soulignées
Blockly.Blocks["syllarc"] = {
    init: function () {
        this.setTooltip("Souligne les syllabes");
        this.jsonInit({
            message0: "souligner les syllabes",
            args0: [
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["syllarc"] = function (block, generator) {
    var code = `{"function":"syllarc"},`;
    return code;
};

// marquer les liaisons
Blockly.Blocks["liaisons"] = {
    init: function () {
        this.setTooltip("Marquer les liaisons");
        this.jsonInit({
            message0: "marquer les liaisons",
            args0: [
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["liaisons"] = function (block, generator) {
    var code = `{"function":"liaisons"},`;
    return code;
};

// phonèmes
Blockly.Blocks["phonemes"] = {
    init: function () {
        this.setTooltip(
            "Applique les typographies aux graphèmes sélectionnés.\nChaque typographie doit être complétée par le graphème ou la liste de graphèmes concernés."
        );
        this.jsonInit({
            message0: "mettre en évidence les graphèmes %1 %2",
            args0: [
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "content",
                    check: "typo",
                },
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["phonemes"] = function (block, generator) {
    var statements_content = Blockly.json
        .statementToCode(block, "content")
        .trim();
    if (statements_content.charAt(statements_content.length - 1) === ",") {
        statements_content = statements_content.slice(0, -1);
    }
    statements_content = statements_content.replace(/LISTE/g, "phonemes");
    var code = `{"function":"phonemes","format":[${statements_content}]},`;
    return code;
};

// lettres
Blockly.Blocks["lettres"] = {
    init: function () {
        this.setTooltip(
            "Applique les typographies aux successions de lettres.\nChaque typographie doit être complétée par la lettre concernée ou la succession de lettres à mettre en évidence."
        );
        this.jsonInit({
            message0: "mettre en évidence les lettres %1 %2",
            args0: [
                {
                    type: "input_dummy",
                },
                {
                    type: "input_statement",
                    name: "content",
                    check: "typo",
                },
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["lettres"] = function (block, generator) {
    var statements_content = Blockly.json
        .statementToCode(block, "content")
        .trim();
    if (statements_content.charAt(statements_content.length - 1) === ",") {
        statements_content = statements_content.slice(0, -1);
    }
    statements_content = statements_content.replace(/LISTE/g, "lettres");
    var code = `{"function":"lettres","format":[${statements_content}]},`;
    return code;
};

// règle de lecture
Blockly.Blocks["reglelecture"] = {
    init: function () {
        this.setTooltip(
            "Surligne la ligne en cours de lecture."
        );
        this.jsonInit({
            message0: "règle de lecture %1",
            args0: [
                {
                    type: "field_colour",
                    name: "hlcolor",
                    colour: "#8cffbc",
                },
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        });
    },
};
jsonGenerator.forBlock["reglelecture"] = function (block, generator) {
    const hlcolor = block.getFieldValue("hlcolor");
    var code = `{"function":"reglelecture","format":[{"highlight":"${hlcolor}"}]},`;
    return code;
};

// outil de synthèse vocale
Blockly.Blocks["lecteur"] = {
    init: async function () {
        this.setTooltip(
            "Lit le texte courant"
        );
        let listeVoix = await collecteVoixSynthese();
        let json = {
            message0: "lire le texte -- vitesse : %1 -- voix : %2",
            args0: [
                {
                    type: "field_slider",
                    name: "rate",
                    value: 8,
                    min: 5,
                    max: 10,
                },
                {
                    type: "field_dropdown",
                    name: "voice",
                    options: listeVoix,
                }
            ],
            previousStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            nextStatement: ["altern", "phonemes", "syllabes", "lettres", "syllarc", "reglelecture", "lecteur", "liaisons"],
            colour: theme["adaptation"],
        };
        try {
            this.jsonInit(json);
        } catch (_) {
        }
    },
};
jsonGenerator.forBlock["lecteur"] = function (block, generator) {
    const rate = block.getFieldValue("rate");
    const voice = parseInt(block.getFieldValue("voice"));
    var code = `{"function":"lecteur","params":{"rate":${rate},"voice":${voice}}},`;
    return code;
};

// liste de quelque chose
jsonGenerator.forBlock["lists_create_with"] = function (block, generator) {
    const values = [];
    for (let i = 0; i < block.itemCount_; i++) {
        const valueCode = generator.valueToCode(block, "ADD" + i, Order.ATOMIC);
        if (valueCode) {
            values.push(valueCode.trim());
        }
    }
    const valueString = values.join(",");
    return `"LISTE":[${valueString}]`;
};

// elemld
const elemldOptions = [
    ["lettres muettes", "#,#_h_muet,verb_3p"],
    ["son [a]", "a"],
    ["son [e]", "q,q_caduc,x"],
    ["son [i]", "i"],
    ["son [o]", "o,o_comp,o_ouvert"],
    ["son [ou]", "u"],
    ["son [u]", "y"],
    ["son [é]", "e,e_comp"],
    ["son [è]", "e^,e^_comp"],
    ["son [an]", "a~"],
    ["son [on]", "o~"],
    ["sons [in] ou [un]", "e~,x~"],
    ["son [eu] (2)", "x^"],
    ["son [oi]", "wa"],
    ["son [oin]", "w5"],
    ["son [w]", "w"],
    ["son [j]", "j"],
    [
        "graphèmes voyelles",
        "a,q,q_caduc,i,o,o_comp,o_ouvert,u,y,e,e_comp,e^,e^_comp,a~,e~,x~,o~,x,x^,wa,w5",
    ],
    [
        "graphèmes consonnes",
        "p,t,k,b,d,g,f,f_ph,s,s^,v,z,z^,l,r,m,n,k_qu,z^_g,g_u,s_c,s_t,z_s,ks,gz",
    ],
    ["son [un]", "x~"],
    ["h muet", "#_h_muet"],
    ["e caduc", "q_caduc"],
    ["lettres ambigues", "#_amb"],
    ["terminaisons verbes 'ent'", "verb_3p"],
    ["toutes lettres muettes", "#,#_h_muet,verb_3p,#_amb"],
    [
        "tous graphèmes",
        "a,q,q_caduc,i,o,o_comp,o_ouvert,u,y,e,e_comp,e^,e^_comp,a~,e~,x~,o~,x,x^,w,wa,w5,p,t,k,b,d,g,f,f_ph,s,s^,v,z,z^,l,r,m,n,k_qu,z^_g,g_u,s_c,s_t,z_s,ks,gz,j,g~,n~",
    ],
];

Blockly.Blocks["elemld"] = {
    init: function () {
        this.jsonInit({
            message0: "appliqué à %1",
            args0: [
                {
                    type: "field_dropdown",
                    name: "content",
                    options: elemldOptions,
                },
            ],
            colour: theme["objet"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["elemld"] = function (block, generator) {
    var text_content = block.getFieldValue("content").trim();
    return `"LISTE":[${__quoteList(text_content)}]`;
};

// elem
Blockly.Blocks["elem"] = {
    init: function () {
        this.jsonInit({
            message0: "appliqué à %1",
            args0: [
                {
                    type: "field_input",
                    name: "content",
                    text: "a",
                },
            ],
            colour: theme["objet"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["elem"] = function (block, generator) {
    var text_content = block.getFieldValue("content").trim();
    return `"LISTE":[${__quoteList(text_content)}]`;
};

// typo_b
Blockly.Blocks["typo_b"] = {
    init: function () {
        this.jsonInit({
            message0: "gras %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["typo_b"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"bold":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};

// picto
Blockly.Blocks["picto"] = {
    init: function () {
        this.jsonInit({
            message0: "pictogramme :%1 %2",
            args0: [
                {
                    type: "field_input",
                    name: "fpicto",
                    text: "img/arc.png",
                },
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["picto"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var fpicto = block.getFieldValue("fpicto");
    var code = `"picto":"${fpicto}"`;
    if (suite.length > 0) code += "," + suite;
    return code;
};

// signe api
Blockly.Blocks["signeapi"] = {
    init: function () {
        this.jsonInit({
            message0: "signe API %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["signeapi"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"signeapi":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};

// typo_i
Blockly.Blocks["typo_i"] = {
    init: function () {
        this.jsonInit({
            message0: "italique %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["typo_i"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"italic":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};

// typo_u
Blockly.Blocks["typo_u"] = {
    init: function () {
        this.jsonInit({
            message0: "souligné %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["typo_u"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"underline":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};

// typo_o
Blockly.Blocks["typo_o"] = {
    init: function () {
        this.jsonInit({
            message0: "ombre %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["typo_o"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"shadow":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};

// typo_s
Blockly.Blocks["typo_s"] = {
    init: function () {
        this.jsonInit({
            message0: "contour %1",
            args0: [
                {
                    type: "input_value",
                    name: "suite",
                },
            ],
            colour: theme["typo"],
            output: "string",
        });
    },
};
jsonGenerator.forBlock["typo_s"] = function (block, generator) {
    var suite = jsonGenerator.statementToCode(
        block,
        "suite",
        jsonGenerator.ORDER_NONE
    ).trim();
    if (suite.charAt(suite.length - 1) === ",") {
        suite = suite.slice(0, -1);
    }

    var code = '"stroke":true';
    if (suite.length > 0) code += "," + suite;
    return code;
};
