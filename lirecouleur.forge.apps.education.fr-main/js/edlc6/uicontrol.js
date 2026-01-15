var edlc6 = new EdLC6();
function initEdLC6() {
    edlc6.workspace.clear();

    const prof = edlc6.getSelectedProfile();
    let xml = '<block type="edlc6"></block>';
    if (prof !== undefined) {
        xml = Blockly.utils.xml.textToDom(edlc6.jsonToBlockly(prof.json));
    } else {
        xml = Blockly.utils.xml.textToDom(
            '<xml xmlns="https://developers.google.com/blockly/xml"><block type="edlc6"><field name="name">Profil exemple</field><comment pinned="false" h="89" w="244">Ce profil peut être adapté ou remplacé comme tous les blocs qui le composent.</comment><statement name="params"><block type="SYLLABES_LC"><field name="content">true</field><next><block type="SYLLABES_ECRITES"><field name="content">true</field><next><block type="novice_reader"><field name="content">true</field></block></next></block></next></block></statement><statement name="format"><block type="font_size"><field name="content">16</field><next><block type="scale_width"><field name="content">120</field><next><block type="line_spacing"><field name="content">150</field></block></next></block></next></block></statement><statement name="process"><block type="altern"><field name="nature">alternsyllabes</field><statement name="content"><block type="typo"><field name="fgcolor">#ea0000</field><field name="bgcolor">#ffffff</field><next><block type="typo"><field name="fgcolor">#0000e1</field><field name="bgcolor">#ffffff</field></block></next></block></statement><next><block type="phonemes"><statement name="content"><block type="typo"><field name="fgcolor">#aaaaaa</field><field name="bgcolor">#ffffff</field><value name="suite"><block type="elemld"><field name="content">#,verb_3p,#_amb</field></block></value></block></statement></block></next></block></statement></block></xml>'
        );
    }
    Blockly.Xml.appendDomToWorkspace(xml, edlc6.workspace);

    /*var rootBlock = edlc6.workspace.newBlock("edlc6");
    rootBlock.initSvg();
    rootBlock.render();*/
}

window.addEventListener("load", function load(event) {
    //window.localStorage.contentHTML = "on";
    $("#btn_search").addClass("hidden");
    edlc6.renderBlockly(
        document.getElementById("blocklyDiv"),
        document.getElementById("toolbox")
    );
    edlc6.addEvent();
    initEdLC6();
    $("#btn_redo").on("click", function () {
        edlc6.redo();
    });
    $("#btn_undo").on("click", function () {
        edlc6.undo();
    });
    $("#btn_new").on("click", function () {
        // nettoyage de l'espace de travail
        edlc6.clearWorkspace();

        // création du nouveau profil
        let nbProfils = listeProfils.getNbProfiles();
        let nprof = listeProfils.addProfile({ "name": "abcd" });
        edlc6.selectProfile(nprof);

        // ajout du profil à la liste des profils existants
        if (nbProfils < listeProfils.getNbProfiles()) {
            let prof = listeProfils.getSelectedProfile();
            let el = document.createElement("li");
            el.innerHTML = `<a href="#" onclick="edlc6.selectProfile(${nprof})">${prof.id}</a>`;
            document.getElementById("liste-profils").appendChild(el);
        }
    });
    $("#btn_open").on("click", function () {
        $("#loadText").click();
    });
    $("#btn_delete").on("click", function () {
        let prof = listeProfils.getSelectedProfile();
        if (confirm(`Êtes-vous sûr de vouloir supprimer le profil ${prof.id} ?`)) {
            let iprof = listeProfils.getSelectedProfileIndex();
            edlc6.deleteProfile(iprof);
            window.location.reload();
        }
    });
    $("#loadText").on("change", function () {
        var input = document.getElementById("loadText");
        var fileReader = new FileReader();
        fileReader.onload = () => {
            edlc6.setJSON(fileReader.result);
            input.value = null;
        };
        fileReader.readAsText(input.files[0]);
    });
    for (let i = 0; i < listeProfils.getNbProfiles(); i++) {
        let prof = listeProfils.getProfileIndex(i);
        let el = document.createElement("li");
        el.innerHTML = `<a href="#" onclick="edlc6.selectProfile(${i})">${prof.id}</a>`;
        document.getElementById("liste-profils").appendChild(el);
    }
    $("#btn_doc").on("click", function () {
        window.open('https://lirecouleur.forge.apps.education.fr/doc/pages/editeur/');
    });
});
