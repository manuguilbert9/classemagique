/*
 * @class Class representing a EdLC6 instance, including all components.
 */
var listeProfils = new UserProfiles();
const elemldOptionsVal = elemldOptions.map(([, valeur]) => valeur);

class EdLC6 {
    /**
     * Generate an ID for a component
     *
     * @param {HTMLElement} object - The element to generate an ID for
     * @param {string} objectType - The name of the component
     * @returns {string}
     */
    static generateID(object, objectType) {
        return (
            object.id ||
            "edlc6-" + objectType + "-" + Math.floor(Math.random() * 10000)
        );
    }

    getSelectedProfile() {
        return listeProfils.getSelectedProfile();
    }

    selectProfile(i) {
        let prof = listeProfils.getProfileIndex(i);
        this.setJSON(prof.toJSONString());
        listeProfils.selectProfile(i);
    }

    /**
     * Inject the blockly editor (should be called first)
     *
     * @param {HTMLElement} frame - The frame to put the editor in
     * @param {HTMLElement} toolbox - The XML toolbox
     *
     * @param {string} theme - The name of the theme to initiate Blockly with.
     * @param {settingsDialogueType} [settings]
     *
     * @param {object} [options] - Custom options for the Blockly editor.
     * @returns {*}
     */
    renderBlockly(frame, toolbox, theme, settings, options) {
        // generate a random ID for the frame to avoid duplication
        frame.id = EdLC6.generateID(frame, "blockly");
        let editorOptions = {
            toolbox: toolbox,
            /*plugins: {
              connectionPreviewer: decoratePreviewer(
                Blockly.InsertionMarkerPreviewer
              ),
            },*/
        };
        if (options) {
            editorOptions = Object.assign(editorOptions, options);
        } else {
            editorOptions = Object.assign(editorOptions, {
                zoom: {
                    controls: true,
                    wheel: true,
                    startScale: 1.0,
                    maxScale: 2,
                    minScale: 0.3,
                    scaleSpeed: 1.2,
                },
                trashcan: true,
                sounds: false,
                media: "media/",
            });
        }
        // inject blockly
        this.workspace = Blockly.inject(frame.id, editorOptions);
        this.workspaceDiv = frame;
        this.toolboxDiv =
            this.workspaceDiv.getElementsByClassName("blocklyToolboxDiv")[0];
        // Return workspace info
        return this.workspace;
    }

    /**
     * Add the event listener for Blockly to generate a preview and code
     *
     * @param {function} customFunction - a function to execute at the end of the change event. Gets passed the scope as a parameter.
     */
    addEvent(customFunction) {
        // add listener to workspace
        this.workspace.addChangeListener(
            function () {
                //finalizeConnections();

                //"Dans mon ouvrage sur les ossements fossiles, je me suis proposé de reconnaître à quels animaux appartiennent les débris osseux, dont les couches superficielles du globe sont remplies. C'était chercher à parcourir une route où l'on n'avait encore hasardé que quelques pas. - Georges Cuvier";
                const texte_demo = `Maître corbeau, sur un arbre perché,\n\n
Tenait en son bec un fromage.\n\n
Maître renard, par l’odeur alléché,\n\n
Lui tint à peu près ce langage :\n\n
« Hé ! bonjour, Monsieur du Corbeau.\n\n
Que vous êtes joli ! que vous me semblez beau !\n\n
Sans mentir, si votre ramage\n\n
Se rapporte à votre plumage,\n\n
Vous êtes le phénix des hôtes de ces bois. »`;

                // generate the code using Blockly.json from generator_json.js
                try {
                    const code = Blockly.json.workspaceToCode(this.workspace);
                    //console.log(code);
                    const dprof = new UserProfile(JSON.parse(code.trim()));

                    const texteademoElt = document.getElementById("texte-adapte");
                    let converter = new showdown.Converter();
                    let rtext = converter.makeHtml(dprof.toHTML(texte_demo, texteademoElt));
                    texteademoElt.innerHTML = rtext;
                    texteademoElt.style = dprof.style;
                    dprof.postProcessHTML(texteademoElt);

                    /*var xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
                    //var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
                    var xmlText = Blockly.Xml.domToText(xmlDom);
                    console.log(xmlText);*/
                } catch (e) {
                    //console.error(e);
                }
            }.bind(this) /* bind parent scope */
        );
    }

    /**
     * Downloads a txt file containing the JSON data of the project, which can be used to save it locally.
     *
     * @param {string} [fileName=profil.json] - The name of the json file
     * @returns {string} - The XML data as a string
     */
    downloadJSON(fileName) {
        const data = Blockly.json.workspaceToCode(this.workspace);
        const element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(data)
        );
        element.setAttribute("download", fileName || "profil.json");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        return data;
    }

    /**
     * Delete one profile from the lis of profiles
     * @param {*} index index of the profile to be deleted
     */
    deleteProfile(index) {
        if (listeProfils.getNbProfiles() > 0) {
            listeProfils.removeProfile(index);
            this.selectProfile(0);
        }
    }

    /**
     * Save the JSON data as a LC6 profile
     */
    saveProfile() {
        const data = Blockly.json.workspaceToCode(this.workspace);
        if (listeProfils.getSelectedProfileIndex() >= 0) {
            listeProfils.replaceProfile(
                listeProfils.getSelectedProfileIndex(),
                JSON.parse(data)
            );
            //listeProfils.selectProfile(listeProfils.getSelectedProfileIndex());
        } else {
            listeProfils.addProfile(JSON.parse(data));
        }
    }

    /**
     * Export the JSON data as a LC6 profile and opens WebLC6
     */
    exportToLC6() {
        this.saveProfile();
        window.open("index.html", "_self").focus();
    }

    /**
     * Internal function - build an xml string for a Blockly block chain
     *
     * @param {Array} tparams - The block set to chain
     */
    __linkBlocksToXmlString(tparams) {
        var xmlString = "";
        if (tparams.length > 0) {
            xmlString = tparams[0] + "</block>";
            for (let i = 1; i < tparams.length; i++) {
                xmlString = `${tparams[i]}<next>${xmlString}</next></block>`;
            }
        }
        return xmlString;
    }

    /**
     * Internal function - build an xml string for a list of format details
     *
     * @param {Array} jsonProcess - The json structure to use
     */
    __typosToXmlString(jsonProcess) {
        var xmlString = "";
        if (jsonProcess.hasOwnProperty("format")) {
            var ttypos = [];
            for (let i = 0; i < jsonProcess["format"].length; i++) {
                const json = jsonProcess.format[i];
                var tmpXmlString = '<block type="typo">';
                if (json.hasOwnProperty("color")) {
                    tmpXmlString += `<field name="fgcolor">${json.color}</field>`;
                }
                if (json.hasOwnProperty("background")) {
                    tmpXmlString += `<field name="bgcolor">${json.background}</field>`;
                }

                var suiteXmlString = "";

                if (json.hasOwnProperty("phonemes")) {
                    const lphons = json.phonemes.join(",");
                    if (elemldOptionsVal.indexOf(lphons) >= 0) {
                        suiteXmlString += `<block type="elemld"><field name="content">${lphons}</field></block>`;
                    } else {
                        suiteXmlString += `<block type="elem"><field name="content">${lphons}</field></block>`;
                    }
                }
                if (json.hasOwnProperty("lettres")) {
                    const llettres = json.lettres.join(",");
                    suiteXmlString += `<block type="elem"><field name="content">${llettres}</field></block>`;
                }
                const suiteModK = ["bold", "underline", "italic", "shadow", "stroke"];
                const suiteModV = ["typo_b", "typo_u", "typo_i", "typo_o", "typo_s"];
                for (let k = 0; k < suiteModK.length; k++) {
                    if (json.hasOwnProperty(suiteModK[k])) {
                        if (json[suiteModK[k]]) {
                            suiteXmlString = `<block type="${suiteModV[k]}"><value name="suite">${suiteXmlString}</value></block>`;
                        }
                    }
                }
                if (json.hasOwnProperty("picto")) {
                    suiteXmlString += `<block type="picto"><field name="fpicto">${json.picto}</field><value name="suite">${suiteXmlString}</value></block>`;
                }
                if (json.hasOwnProperty("signeapi")) {
                    suiteXmlString += `<block type="signeapi"><value name="suite">${suiteXmlString}</value></block>`;
                }

                if (suiteXmlString.length > 0) {
                    tmpXmlString += `<value name="suite">${suiteXmlString}</value>`;
                }

                ttypos.push(tmpXmlString);
            }
            if (ttypos.length > 0) {
                xmlString =
                    '<statement name="content">' +
                    this.__linkBlocksToXmlString(ttypos) +
                    "</statement>";
            }
        }
        return xmlString;
    }

    /**
     * Set the Blockly workspace to a specified JSON profile
     *
     * @param {JSON} jsonProfil - The JSON profile to use
     */
    jsonToBlockly(jsonProfil) {
        const pname = jsonProfil["name"];
        var paramsXmlString = "";
        var formatXmlString = "";
        var processXmlString = "";

        if (jsonProfil.hasOwnProperty("params")) {
            var tparams = [];
            if (jsonProfil.params.hasOwnProperty("novice_reader")) {
                tparams.push(
                    `<block type="novice_reader"><field name="content">true</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_ECRITES")) {
                tparams.push(
                    `<block type="SYLLABES_ECRITES"><field name="content">true</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_ORALES")) {
                tparams.push(
                    `<block type="SYLLABES_ECRITES"><field name="content">false</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_LC")) {
                tparams.push(
                    `<block type="SYLLABES_LC"><field name="content">true</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("SYLLABES_STD")) {
                tparams.push(
                    `<block type="SYLLABES_LC"><field name="content">false</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("interface")) {
                tparams.push(
                    `<block type="interface"><field name="content">${jsonProfil.params.interface}</field>`
                );
            }
            if (jsonProfil.params.hasOwnProperty("accueil")) {
                tparams.push(
                    `<block type="accueil"><field name="content">${decodeURIComponent(jsonProfil.params.accueil)}</field>`
                );
            }
            if (tparams.length > 0) {
                paramsXmlString =
                    '<statement name="params">' +
                    this.__linkBlocksToXmlString(tparams) +
                    "</statement>";
            }
        }

        if (jsonProfil.hasOwnProperty("format")) {
            var tparams = [];
            if (jsonProfil.format.hasOwnProperty("font_name")) {
                if (jsonProfil.format["font_name"].trim().length > 0) {
                    tparams.push(
                        `<block type="font_name"><field name="content">${jsonProfil.format["font_name"]}</field>`
                    );
                }
            }
            if (jsonProfil.format.hasOwnProperty("page_width")) {
                tparams.push(
                    `<block type="page_width"><field name="content">${jsonProfil.format["page_width"]}</field>`
                );
            }
            if (jsonProfil.format.hasOwnProperty("line_spacing")) {
                tparams.push(
                    `<block type="line_spacing"><field name="content">${jsonProfil.format["line_spacing"]}</field>`
                );
            }
            if (jsonProfil.format.hasOwnProperty("scale_width")) {
                tparams.push(
                    `<block type="scale_width"><field name="content">${jsonProfil.format["scale_width"]}</field>`
                );
            }
            if (jsonProfil.format.hasOwnProperty("height")) {
                tparams.push(
                    `<block type="font_size"><field name="content">${jsonProfil.format["height"]}</field>`
                );
            }
            if (tparams.length > 0) {
                formatXmlString =
                    '<statement name="format">' +
                    this.__linkBlocksToXmlString(tparams) +
                    "</statement>";
            }
        }

        if (jsonProfil.hasOwnProperty("process")) {
            var tparams = [];
            for (let i = 0; i < jsonProfil.process.length; i++) {
                let jsonProcess = jsonProfil.process[i];
                let xmlString = "";
                if (jsonProcess.hasOwnProperty("function")) {
                    switch (jsonProcess["function"]) {
                        case "lettres":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(`<block type="lettres">${tmpXmlString}`);
                            break;
                            break;
                        case "phonemes":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(`<block type="phonemes">${tmpXmlString}`);
                            break;
                        case "syllabes":
                            tparams.push(
                                `<block type="syllabes"><field name="sep">${jsonProcess["separator"]}</field>`
                            );
                            break;
                        case "syllarc":
                            tparams.push(
                                `<block type="syllarc">`
                            );
                            break;
                        case "liaisons":
                            tparams.push(
                                `<block type="liaisons">`
                            );
                            break;
                        case "alternphonemes":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(
                                `<block type="altern"><field name="nature">alternphonemes</field>${tmpXmlString}`
                            );
                            break;
                        case "alternlettres":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(
                                `<block type="altern"><field name="nature">alternlettres</field>${tmpXmlString}`
                            );
                            break;
                        case "alternsyllabes":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(
                                `<block type="altern"><field name="nature">alternsyllabes</field>${tmpXmlString}`
                            );
                            break;
                        case "alternmots":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(
                                `<block type="altern"><field name="nature">alternmots</field>${tmpXmlString}`
                            );
                            break;
                        case "alternlignes":
                            var tmpXmlString = this.__typosToXmlString(jsonProcess);
                            tparams.push(
                                `<block type="altern"><field name="nature">alternlignes</field>${tmpXmlString}`
                            );
                            break;
                        case "reglelecture":
                            if (jsonProcess.hasOwnProperty("format")) {
                                if (jsonProcess.format.length >= 0) {
                                    const json = jsonProcess.format[0];
                                    if (json.hasOwnProperty("highlight")) {
                                        xmlString += `<field name="hlcolor">${json.highlight}</field>`;
                                    }
                                }
                            }
                            tparams.push(
                                `<block type="reglelecture">${xmlString}`
                            );
                            break;
                        case "lecteur":
                            if (jsonProcess.hasOwnProperty("params")) {
                                const json = jsonProcess.params;
                                if (json.hasOwnProperty("rate")) {
                                    xmlString += `<field name="rate">${json.rate}</field>`;
                                }
                                if (json.hasOwnProperty("voice")) {
                                    xmlString += `<field name="voice">${json.voice}</field>`;
                                }
                            }
                            tparams.push(
                                `<block type="lecteur">${xmlString}`
                            );
                            break;
                        default:
                            break;
                    }
                }
            }
            if (tparams.length > 0) {
                processXmlString =
                    '<statement name="process">' +
                    this.__linkBlocksToXmlString(tparams) +
                    "</statement>";
            }
        }

        var xmlString = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="edlc6"><field name="name">${pname}</field>${paramsXmlString}${formatXmlString}${processXmlString}</block></xml>`;

        return xmlString;
    }

    /**
     * Set the Blockly workspace to a specified JSON profile
     *
     * @param {string} jsonString - The JSON string to use
     */
    setJSON(jsonString) {
        // change the json string to xml
        const pjson = JSON.parse(jsonString);
        const xmlString = this.jsonToBlockly(pjson);

        // change the text to dom
        const dom = Blockly.utils.xml.textToDom(xmlString);
        // clear the workspace to avoid adding code on top
        this.clearWorkspace();
        // set the dom into the workspace
        Blockly.Xml.domToWorkspace(dom, this.workspace);
    }

    /**
     * Clears all blocks from the workspace without further confirmation
     */
    clearWorkspace() {
        this.workspace.clear();
    }

    /**
     * To reverse the last action
     */
    undo() {
        this.workspace.undo(0);
    }

    /**
     *  To reverse the last Undo
     */
    redo() {
        this.workspace.undo(1);
    }
}
