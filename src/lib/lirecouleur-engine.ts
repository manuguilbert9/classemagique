/**
 * LireCouleur Engine - TypeScript port
 * Based on LireCouleur by Marie-Pierre Brungard
 * http://lirecouleur.arkaline.fr
 * 
 * GNU General Public Licence (GPL) version 3
 */

// Types
interface Phoneme {
    phoneme: string | null;
    lettres: string;
}

interface Syllabe {
    phonemes: Phoneme[];
}

// Phoneme categories
const syllaphon = {
    v: ["a", "q", "q_caduc", "i", "o", "o_comp", "o_ouvert", "u", "y", "e", "e_comp", "e^", "e^_comp", "a~", "e~", "x~", "o~", "x", "x^", "wa", "w5"],
    c: ["p", "t", "k", "b", "d", "g", "f", "f_ph", "s", "s^", "v", "z", "z^", "l", "r", "m", "n", "k_qu", "z^_g", "g_u", "s_c", "s_t", "z_s", "ks", "gz"],
    s: ["j", "g~", "n~", "w"],
    "#": ["#", "#_h_muet", "verb_3p"]
};

// Exception lists
const verbes_ier = ["affilier", "allier", "amnistier", "amplifier", "anesthesier", "apparier", "approprier", "apprecier", "asphyxier", "associer", "atrophier", "authentifier", "autographier", "autopsier", "balbutier", "bonifier", "beatifier", "beneficier", "betifier", "calligraphier", "calomnier", "carier", "cartographier", "certifier", "charrier", "chier", "choregraphier", "chosifier", "chatier", "clarifier", "classifier", "cocufier", "codifier", "colorier", "communier", "conchier", "concilier", "confier", "congedier", "contrarier", "copier", "crier", "crucifier", "dactylographier", "differencier", "disgracier", "disqualifier", "dissocier", "distancier", "diversifier", "domicilier", "decrier", "dedier", "defier", "deifier", "delier", "demarier", "demultiplier", "demystifier", "denazifier", "denier", "deplier", "deprecier", "dequalifier", "devier", "envier", "estropier", "excommunier", "exemplifier", "exfolier", "expatrier", "expier", "exproprier", "expedier", "extasier", "falsifier", "fier", "fluidifier", "fortifier", "frigorifier", "fructifier", "gazeifier", "glorifier", "gracier", "gratifier", "horrifier", "humidifier", "humilier", "identifier", "incendier", "ingenier", "initier", "injurier", "intensifier", "inventorier", "irradier", "justifier", "licencier", "lier", "liquefier", "lubrifier", "magnifier", "maleficier", "manier", "marier", "mendier", "modifier", "momifier", "mortifier", "multiplier", "mystifier", "mythifier", "mefier", "nier", "notifier", "negocier", "obvier", "officier", "opacifier", "orthographier", "oublier", "pacifier", "pallier", "parier", "parodier", "personnifier", "photocopier", "photographier", "plagier", "planifier", "plastifier", "plier", "polycopier", "pontifier", "prier", "privilegier", "psalmodier", "publier", "purifier", "putrefier", "pepier", "petrifier", "qualifier", "quantifier", "radier", "radiographier", "rallier", "ramifier", "rapatrier", "rarefier", "rassasier", "ratifier", "razzier", "recopier", "rectifier", "relier", "remanier", "remarier", "remercier", "remedier", "renier", "renegocier", "replier", "republier", "requalifier", "revivifier", "reverifier", "rigidifier", "reconcilier", "recrier", "reexpedier", "refugier", "repertorier", "repudier", "resilier", "reunifier", "reedifier", "reetudier", "sacrifier", "salarier", "sanctifier", "scier", "signifier", "simplifier", "skier", "solidifier", "soucier", "spolier", "specifier", "statufier", "strier", "stupefier", "supplicier", "supplier", "serier", "terrifier", "tonifier", "trier", "tumefier", "typographier", "telegraphier", "unifier", "varier", "versifier", "vicier", "vitrifier", "vivifier", "verifier", "echographier", "ecrier", "edifier", "electrifier", "emulsifier", "epier", "etudier"];

const mots_ent = ["absent", "abstinent", "accent", "accident", "adhérent", "adjacent", "adolescent", "afférent", "agent", "ambivalent", "antécédent", "apparent", "arborescent", "ardent", "argent", "arpent", "astringent", "auvent", "avent", "cent", "chiendent", "client", "coefficient", "cohérent", "dent", "différent", "diligent", "dissident", "divergent", "dolent", "décadent", "décent", "déficient", "déférent", "déliquescent", "détergent", "excipient", "fervent", "flatulent", "fluorescent", "fréquent", "féculent", "gent", "gradient", "grandiloquent", "immanent", "imminent", "impatient", "impertinent", "impotent", "imprudent", "impudent", "impénitent", "incandescent", "incident", "incohérent", "incompétent", "inconscient", "inconséquent", "incontinent", "inconvénient", "indifférent", "indigent", "indolent", "indulgent", "indécent", "ingrédient", "inhérent", "inintelligent", "innocent", "insolent", "intelligent", "interférent", "intermittent", "iridescent", "lactescent", "latent", "lent", "luminescent", "malcontent", "mécontent", "occident", "omnipotent", "omniprésent", "omniscient", "onguent", "opalescent", "opulent", "orient", "paravent", "parent", "patent", "patient", "permanent", "pertinent", "phosphorescent", "polyvalent", "pourcent", "proéminent", "prudent", "précédent", "présent", "prévalent", "pschent", "purulent", "putrescent", "pénitent", "quotient", "relent", "récent", "récipient", "récurrent", "référent", "régent", "rémanent", "réticent", "sanguinolent", "sergent", "serpent", "somnolent", "souvent", "spumescent", "strident", "subconscient", "subséquent", "succulent", "tangent", "torrent", "transparent", "trident", "truculent", "tumescent", "turbulent", "turgescent", "urgent", "vent", "ventripotent", "violent", "virulent", "effervescent", "efficient", "effluent", "engoulevent", "entregent", "escient", "event", "excédent", "expédient", "éloquent", "éminent", "émollient", "évanescent", "évent"];

const mots_s_final = ["abribus", "airbus", "autobus", "bibliobus", "bus", "nimbus", "gibus", "microbus", "minibus", "mortibus", "omnibus", "oribus", "pédibus", "quibus", "rasibus", "rébus", "syllabus", "trolleybus", "virus", "antivirus", "anus", "asparagus", "médius", "autofocus", "focus", "benedictus", "bonus", "campus", "cirrus", "citrus", "collapsus", "consensus", "corpus", "crochus", "crocus", "crésus", "cubitus", "humérus", "diplodocus", "eucalyptus", "erectus", "hypothalamus", "mordicus", "mucus", "stratus", "nimbostratus", "nodus", "modus", "opus", "ours", "papyrus", "plexus", "plus", "processus", "prospectus", "lapsus", "prunus", "quitus", "rétrovirus", "sanctus", "sinus", "solidus", "liquidus", "stimulus", "stradivarius", "terminus", "tonus", "tumulus", "utérus", "versus", "détritus", "ratus", "couscous", "burnous", "tous", "anis", "bis", "anubis", "albatros", "albinos", "calvados", "craignos", "mérinos", "rhinocéros", "tranquillos", "tétanos", "os", "alias", "atlas", "hélas", "madras", "sensas", "tapas", "trias", "vasistas", "hypocras", "gambas", "as", "biceps", "quadriceps", "chips", "relaps", "forceps", "schnaps", "laps", "oups", "triceps", "princeps", "tricératops"];

const mots_t_final = ["accessit", "cet", "but", "diktat", "kumquat", "prurit", "affidavit", "dot", "rut", "audit", "exeat", "magnificat", "satisfecit", "azimut", "exit", "mat", "scorbut", "brut", "fiat", "mazout", "sinciput", "cajeput", "granit", "net", "internet", "transat", "sept", "chut", "huit", "obit", "transit", "coït", "incipit", "occiput", "ut", "comput", "introït", "pat", "zut", "déficit", "inuit", "prétérit", "gadget", "kilt", "kit", "scout", "fret"];

// The complete phonetic automate (from LireCouleur)
const autom: { [key: string]: [string[], { [key: string]: any }] } = JSON.parse(`{"'":[[],{"*":[{},"#",1],"@":[{},"#",1]}],"@":[[],{"*":[{},"#",1],"@":[{},"#",1]}],"_":[[],{"*":[{},"#",1],"@":[{},"#",1]}],"a":[["u","il","in","nc_ai_fin","ai_fin","i","n","m","nm","y_except","y"],{"*":[{},"a",1],"ai_fin":[{"+":"i$"},"e_comp",2],"i":[{"+":"[iî]"},"e^_comp",2],"il":[{"+":"il($|l)"},"a",1],"in":[{"+":"i[nm]([bcçdfghjklnmpqrstvwxz]|$)"},"e~",3],"m":[{"+":"m[bp]"},"a~",2],"n":[{"+":"n[bcçdfgjklmpqrstvwxz]"},"a~",2],"nc_ai_fin":["regle_nc_ai_final","e^_comp",2],"nm":[{"+":"n(s?)$"},"a~",2],"u":[{"+":"u"},"o_comp",2],"y":[{"+":"y"},"e^_comp",1],"y_except":[{"+":"y","-":"(^b|cob|cip)"},"a",1]}],"b":[["b","plomb"],{"*":[{},"b",1],"b":[{"+":"b"},"b",2],"plomb":[{"+":"(s?)$","-":"plom"},"#",1]}],"c":[["eiy","choeur_1","choeur_2","chor","psycho","brachio","cheo","chest","chiro","chlo_chlam","chr","h","erc_orc","cisole","c_muet_fin","onc_donc","nc_muet_fin","_spect","_inct","cciey","cc","apostrophe"],{"*":[{},"k",1],"@":["","k",1],"_inct":[{"+":"t(s?)$","-":"in"},"#",1],"_spect":[{"+":"t(s?)$","-":"spe"},"#",1],"apostrophe":[{"+":"('|')"},"s",2],"brachio":[{"+":"hio","-":"bra"},"k",2],"c_muet_fin":[{"+":"(s?)$","-":"taba|accro"},"#",1],"cc":[{"+":"c"},"k",2],"cciey":[{"+":"c[eiyéèêëîï]"},"k",1],"cheo":[{"+":"héo"},"k",2],"chest":[{"+":"hest"},"k",2],"chiro":[{"+":"hiro[p|m]"},"k",2],"chlo_chlam":[{"+":"hl(o|am)"},"k",2],"choeur_1":[{"+":"hoe"},"k",2],"choeur_2":[{"+":"hœ"},"k",2],"chor":[{"+":"hor"},"k",2],"chr":[{"+":"hr"},"k",2],"cisole":[{"+":"$","-":"^"},"s_c",1],"eiy":[{"+":"[eiyéèêëîï]"},"s_c",1],"erc_orc":[{"+":"(s?)$","-":"[e|o]r"},"#",1],"h":[{"+":"h"},"s^",2],"nc_muet_fin":[{"+":"(s?)$","-":"n"},"#",1],"onc_donc":[{"-":"^on|^don"},"k",1],"psycho":[{"+":"ho","-":"psy"},"k",2]}],"d":[["d","aujourdhui","disole","except","dmuet","apostrophe"],{"*":[{},"d",1],"apostrophe":[{"+":"('|')"},"d",2],"aujourdhui":[{"-":"aujour"},"d",1],"d":[{"+":"d"},"d",2],"disole":[{"+":"$","-":"^"},"d",1],"dmuet":[{"+":"(s?)$"},"#",1],"except":[{"+":"(s?)$","-":"(aï|oue)"},"d",1]}],"e":[["conj_v_ier","uient","ien","ien_2","een","except_en_1","except_en_2","_ent","clef","hier","adv_emment_fin","ment","imparfait","verbe_3_pluriel","au","avoir","monsieur","jeudi","jeu_","eur","eu","eu_accent_circ","in","eil","y","iy","ennemi","enn_debut_mot","dessus_dessous","et","cet","t_final","eclm_final","est_1","est_2","es_1","es_2","drz_final","n","adv_emment_a","femme","lemme","em_gene","nm","tclesmesdes","que_isole","que_gue_final","jtcnslemede","jean","ge","eoi","ex","ef","reqquechose","except_evr","2consonnes","abbaye","e_muet","e_caduc","e_deb"],{"*":[{},"q",1],"except_evr":[{"+":"vr"},"q",1],"2consonnes":[{"+":"[bcçdfghjklmnpqrstvwxz]{2}"},"e^_comp",1],"@":["","q_caduc",1],"_ent":["regle_mots_ent","a~",2],"abbaye":[{"+":"(s?)$","-":"abbay"},"#",1],"adv_emment_a":[{"+":"mment"},"a",1],"adv_emment_fin":[{"+":"nt","-":"emm"},"a~",2],"au":[{"+":"au"},"o_comp",3],"avoir":["regle_avoir","y",2],"cet":[{"+":"[t]$","-":"^c"},"e^_comp",1],"clef":[{"+":"f","-":"cl"},"e_comp",2],"conj_v_ier":["regle_ient","#",3],"dessus_dessous":[{"+":"ss(o?)us","-":"d"},"q",1],"drz_final":[{"+":"[drz](s?)$"},"e_comp",2],"e_caduc":[{"+":"(s?)$","-":"[bcçdfghjklmnpqrstvwxzy]"},"q_caduc",1],"e_deb":[{"-":"^"},"q",1],"e_muet":[{"+":"(s?)$","-":"[aeiouéèêà]"},"#",1],"eclm_final":[{"+":"[clm](s?)$"},"e^_comp",1],"een":[{"+":"n(s?)$","-":"é"},"e~",2],"ef":[{"+":"[bf](s?)$"},"e^",1],"eil":[{"+":"il"},"e^_comp",1],"em_gene":[{"+":"m[bcçdfghjklmnpqrstvwxz]"},"a~",2],"enn_debut_mot":[{"+":"nn","-":"^"},"a~",2],"ennemi":[{"+":"nnemi","-":"^"},"e^_comp",1],"eoi":[{"+":"oi"},"#",1],"es_1":[{"+":"s$","-":"^"},"e^_comp",2],"es_2":[{"+":"s$","-":"@"},"e^_comp",2],"est_1":[{"+":"st$","-":"^"},"e^_comp",3],"est_2":[{"+":"st$","-":"@"},"e^_comp",3],"et":[{"+":"t$","-":"^"},"e_comp",2],"eu":[{"+":"u"},"x",2],"eu_accent_circ":[{"+":"û"},"x^",2],"eur":[{"+":"ur"},"x",2],"ex":[{"+":"x"},"e^",1],"except_en_1":[{"+":"n(s?)$","-":"exam|mino|édu"},"e~",2],"except_en_2":[{"+":"n(s?)$","-":"[ao]ï"},"e~",2],"femme":[{"+":"mm","-":"f"},"a",1],"ge":[{"+":"[aouàäôâ]","-":"g"},"#",1],"hier":["regle_er","e^_comp",1],"ien":[{"+":"n([bcçdfghjklpqrstvwxz]|$)","-":"[bcdlmrstvh]i"},"e~",2],"ien_2":[{"+":"n([bcçdfghjklpqrstvwxz]|$)","-":"ï"},"e~",2],"imparfait":[{"+":"nt$","-":"ai"},"verb_3p",3],"in":[{"+":"i[nm]([bcçdfghjklnmpqrstvwxz]|$)"},"e~",3],"iy":[{"+":"[iy]"},"e^_comp",2],"jean":[{"+":"an","-":"j"},"#",1],"jeu_":[{"+":"u","-":"j"},"x",2],"jeudi":[{"+":"udi","-":"j"},"x^",2],"jtcnslemede":[{"+":"$","-":"^[jtcnslmd]"},"q",1],"lemme":[{"+":"mm","-":"l"},"e^_comp",1],"ment":["regle_ment","a~",2],"monsieur":[{"+":"ur","-":"si"},"x^",2],"n":[{"+":"n[bcçdfghjklmpqrstvwxz]"},"a~",2],"nm":[{"+":"[nm]$"},"a~",2],"que_gue_final":[{"+":"(s?)$","-":"[gq]u"},"q_caduc",1],"que_isole":[{"+":"$","-":"^qu"},"q",1],"reqquechose":[{"+":"[bcçdfghjklmnpqrstvwxz](h|l|r)","-":"r"},"q",1],"t_final":[{"+":"[t]$"},"e^_comp",2],"tclesmesdes":[{"+":"s$","-":"^[tcslmd]"},"e_comp",2],"uient":[{"+":"nt$","-":"ui"},"#",3],"verbe_3_pluriel":[{"+":"nt$"},"q_caduc",1],"y":[{"+":"y[aeiouéèêààäôâ]"},"e^_comp",1]}],"f":[["f","oeufs"],{"*":[{},"f",1],"f":[{"+":"f"},"f",2],"oeufs":[{"+":"s","-":"(oeu|œu)"},"#",1]}],"g":[["g","ao","eiy","aiguille","u_consonne","u","n","vingt","g_muet_oin","g_muet_our","g_muet_an","g_muet_fin"],{"*":[{},"g",1],"aiguille":[{"+":"u","-":"ai"},"g",1],"ao":[{"+":"a|o"},"g",1],"eiy":[{"+":"[eéèêëïiy]"},"z^_g",1],"g":[{"+":"g"},"g",2],"g_muet_an":[{"+":"(s?)$","-":"(s|^ét|^r)an"},"#",1],"g_muet_fin":[{"-":"lon|haren"},"#",1],"g_muet_oin":[{"-":"oi(n?)"},"#",1],"g_muet_our":[{"-":"ou(r)"},"#",1],"n":[{"+":"n"},"n~",2],"u":[{"+":"u"},"g_u",2],"u_consonne":[{"+":"u[bcçdfghjklmnpqrstvwxz]"},"g",1],"vingt":[{"+":"t","-":"vin"},"#",1]}],"h":[["h1","h2","h3","h4","h5","h6","h7","h8"],{"*":[{},"#",1],"h1":[{"-":"^","+":"ô"},"#_h_muet",1],"h2":[{"-":"^","+":"y"},"#_h_muet",1],"h3":[{"-":"^","+":"a(rm|b|ll)"},"#_h_muet",1],"h4":[{"-":"^","+":"e([bclprx]|ur)"},"#_h_muet",1],"h5":[{"-":"^","+":"é([bcdfgjkmnpqstvwxz]|li|ra|ré|rit)"},"#_h_muet",1],"h6":[{"-":"^","+":"i([bv][^o]|st)"},"#_h_muet",1],"h7":[{"-":"^","+":"o(m[imo]|nne|no|r[^ds]|s[pt])"},"#_h_muet",1],"h8":[{"-":"^","+":"u(î|i[ls]|ma[in|ni|no]|mb|mec|meu|mér|mi|mor)"},"#_h_muet",1]}],"i":[["ing","n","m","nm","prec_2cons","lldeb","vill","mill","tranquille","ill","@ill","@il","ll","ui","ient_1","ient_2","ie"],{"*":[{},"i",1],"@il":[{"+":"l(s?)$","-":"[aeou]"},"j",2],"@ill":[{"+":"ll","-":"[aeo]"},"j",3],"ie":[{"+":"e(s)?$"},"i",1],"ient_1":["regle_ient","i",1],"ient_2":[{"+":"ent(s)?$"},"j",1],"ill":[{"+":"ll","-":"[bcçdfghjklmnpqrstvwxz](u?)"},"i",1],"ing":[{"+":"ng$","-":"[bcçdfghjklmnpqrstvwxz]"},"i",1],"ll":[{"+":"ll"},"j",3],"lldeb":[{"+":"ll","-":"^"},"i",1],"m":[{"+":"m[bcçdfghjklnpqrstvwxz]"},"e~",2],"mill":[{"+":"ll","-":"m"},"i",1],"n":[{"+":"n[bcçdfghjklmpqrstvwxz]"},"e~",2],"nm":[{"+":"[n|m]$"},"e~",2],"prec_2cons":[{"-":"[ptkcbdgfv][lr]"},"i",1],"tranquille":[{"+":"ll","-":"tranqu"},"i",1],"ui":[{"+":"ent","-":"u"},"i",1],"vill":[{"+":"ll","-":"v"},"i",1]}],"j":[[],{"*":[{},"z^",1]}],"k":[[],{"*":[{},"k",1]}],"l":[["vill","mill","tranquille","illdeb","ill","eil","ll","excep_il","apostrophe","lisole"],{"*":[{},"l",1],"apostrophe":[{"+":"('|')"},"l",2],"eil":[{"-":"e(u?)i"},"j",1],"excep_il":[{"+":"(s?)$","-":"fusi|outi|genti"},"#",1],"ill":[{"+":"l","-":".i"},"j",2],"illdeb":[{"+":"l","-":"^i"},"l",2],"lisole":[{"+":"$","-":"^"},"l",1],"ll":[{"+":"l"},"l",2],"mill":[{"+":"l","-":"^mi"},"l",2],"tranquille":[{"+":"l","-":"tranqui"},"l",2],"vill":[{"+":"l","-":"^vi"},"l",2]}],"m":[["m","damn","tomn","misole","apostrophe"],{"*":[{},"m",1],"apostrophe":[{"+":"('|')"},"m",2],"damn":[{"+":"n","-":"da"},"#",1],"m":[{"+":"m"},"m",2],"misole":[{"+":"$","-":"^"},"m",1],"tomn":[{"+":"n","-":"to"},"#",1]}],"n":[["ing","n","ment","urent","irent","erent","ent","nisole","apostrophe"],{"*":[{},"n",1],"apostrophe":[{"+":"('|')"},"n",2],"ent":[{"+":"t$","-":"e"},"verb_3p",2],"erent":[{"+":"t$","-":"ère"},"verb_3p",2],"ing":[{"+":"g$","-":"i"},"g~",2],"irent":[{"+":"t$","-":"ire"},"verb_3p",2],"ment":["regle_verbe_mer","verb_3p",2],"n":[{"+":"n"},"n",2],"nisole":[{"+":"$","-":"^"},"n",1],"urent":[{"+":"t$","-":"ure"},"verb_3p",2]}],"o":[["in","oignon","i","tomn","monsieur","n","m","nm","y1","y2","u","o","oe_0","oe_1","oe_2","oe_3","voeux","oeufs","noeud","oeu_defaut","oe_defaut"],{"*":[{},"o",1],"i":[{"+":"(i|î)"},"wa",2],"in":[{"+":"i[nm]([bcçdfghjklnmpqrstvwxz]|$)"},"w",1],"m":[{"+":"m[bcçdfgjklpqrstvwxz]"},"o~",2],"monsieur":[{"+":"nsieur","-":"m"},"q",2],"n":[{"+":"n[bcçdfgjklmpqrstvwxz]"},"o~",2],"nm":[{"+":"[nm]$"},"o~",2],"noeud":[{"+":"eud"},"x^",3],"o":[{"+":"o"},"o",2],"oe_0":[{"+":"ê"},"wa",2],"oe_1":[{"+":"e","-":"c"},"o",1],"oe_2":[{"+":"e","-":"m"},"wa",2],"oe_3":[{"+":"e","-":"f"},"e",2],"oe_defaut":[{"+":"e"},"x",2],"oeu_defaut":[{"+":"eu"},"x",3],"oeufs":[{"+":"eufs"},"x^",3],"oignon":[{"+":"ignon","-":"^"},"o",2],"tomn":[{"+":"mn","-":"t"},"o",1],"u":[{"+":"[uwûù]"},"u",2],"voeux":[{"+":"eux"},"x^",3],"y1":[{"+":"y$"},"wa",2],"y2":[{"+":"y"},"wa",1]}],"p":[["h","oup","drap","trop","sculpt","sirop","sgalop","rps","amp","compt","bapti","sept","p"],{"*":[{},"p",1],"amp":[{"+":"$","-":"c(h?)am"},"#",1],"bapti":[{"+":"ti","-":"ba"},"#",1],"compt":[{"+":"t","-":"com"},"#",1],"drap":[{"+":"$","-":"dra"},"#",1],"h":[{"+":"h"},"f_ph",2],"oup":[{"+":"$","-":"[cl]ou"},"#",1],"p":[{"+":"p"},"p",2],"rps":[{"+":"s$","-":"[rm]"},"#",1],"sculpt":[{"+":"t","-":"scul"},"#",1],"sept":[{"+":"t(s?)$","-":"^se"},"#",1],"sgalop":[{"+":"$","-":"[gs]alo"},"#",1],"sirop":[{"+":"$","-":"siro"},"#",1],"trop":[{"+":"$","-":"tro"},"#",1]}],"q":[["qu","k"],{"*":[{},"k",1],"k":[{"+":"u"},"k_qu",2],"qu":[{"+":"u[bcçdfgjklmnpqrstvwxz]"},"k",1]}],"r":[["monsieur","messieurs","gars","r"],{"*":[{},"r",1],"gars":[{"+":"s","-":"ga"},"#",2],"messieurs":[{"-":"messieu"},"#",1],"monsieur":[{"-":"monsieu"},"#",1],"r":[{"+":"r"},"r",2]}],"s":[["sch","h","s_final","parasit","para","mars","s","z","sisole","smuet","apostrophe"],{"*":[{},"s",1],"@":[{},"#",1],"apostrophe":[{"+":"('|')"},"s",2],"h":[{"+":"h"},"s^",2],"mars":[{"+":"$","-":"mar"},"s",1],"para":[{"-":"para"},"s",1],"parasit":[{"+":"it","-":"para"},"z_s",1],"s":[{"+":"s"},"s",2],"s_final":["regle_s_final","s",1],"sch":[{"+":"ch"},"s^",3],"sisole":[{"+":"$","-":"^"},"s",1],"smuet":[{"+":"$","-":"(e?)"},"#",1],"z":[{"+":"[aeiyouéèàüûùëöêîô]","-":"[aeiyouéèàüûùëöêîô]"},"z_s",1]}],"t":[["t","tisole","except_tien","_tien","cratie","vingt","tion","ourt","_inct","_spect","_ct","_est","t_final","tmuet","apostrophe"],{"*":[{},"t",1],"@":[{},"#",1],"_ct":[{"+":"(s?)$","-":"c"},"t",1],"_est":[{"+":"(s?)$","-":"es"},"t",1],"_inct":[{"+":"(s?)$","-":"inc"},"#",1],"_spect":[{"+":"(s?)$","-":"spec"},"#",1],"_tien":[{"+":"ien"},"s_t",1],"apostrophe":[{"+":"('|')"},"t",2],"cratie":[{"+":"ie","-":"cra"},"s_t",1],"except_tien":["regle_tien","t",1],"ourt":[{"+":"$","-":"(a|h|g)our"},"t",1],"t":[{"+":"t"},"t",2],"t_final":["regle_t_final","t",1],"tion":[{"+":"ion"},"s_t",1],"tisole":[{"+":"$","-":"^"},"t",1],"tmuet":[{"+":"(s?)$"},"#",1],"vingt":[{"+":"$","-":"ving"},"t",1]}],"u":[["um","n","nm","ueil"],{"*":[{},"y",1],"n":[{"+":"n[bcçdfghjklmpqrstvwxz]"},"x~",2],"nm":[{"+":"[nm]$"},"x~",2],"ueil":[{"+":"eil"},"x",2],"um":[{"+":"m$","-":"[^aefo]"},"o",1]}],"v":[[],{"*":[{},"v",1]}],"w":[["wurt","wisig","wag","wa","wi"],{"*":[{},"w",1],"wa":[{"+":"a"},"wa",2],"wag":[{"+":"ag"},"v",1],"wi":[{"+":"i"},"u",1],"wisig":[{"+":"isig"},"v",1],"wurt":[{"+":"urt"},"v",1]}],"x":[["six_dix","gz_1","gz_2","gz_3","gz_4","gz_5","_aeox","fix","_ix"],{"*":[{},"ks",1],"@":[{},"#",1],"_aeox":[{"-":"[aeo]"},"ks",1],"_ix":[{"-":"(remi|obéli|astéri|héli|phéni|féli)"},"ks",1],"fix":[{"-":"fi"},"ks",1],"gz_1":[{"+":"[aeiouéèàüëöêîôûù]","-":"^"},"gz",1],"gz_2":[{"+":"[aeiouéèàüëöêîôûù]","-":"^(h?)e"},"gz",1],"gz_3":[{"+":"[aeiouéèàüëöêîôûù]","-":"^coe"},"gz",1],"gz_4":[{"+":"[aeiouéèàüëöêîôûù]","-":"^ine"},"gz",1],"gz_5":[{"+":"[aeiouéèàüëöêîôûù]","-":"^(p?)rée"},"gz",1],"six_dix":[{"-":"(s|d)i"},"s_x",1]}],"y":[["m","n","nm","abbaye","y_voyelle"],{"*":[{},"i",1],"abbaye":[{"+":"e","-":"abba"},"i",1],"m":[{"+":"m[mpb]"},"e~",2],"n":[{"+":"n[bcçdfghjklmpqrstvwxz]"},"e~",2],"nm":[{"+":"[n|m]$"},"e~",2],"y_voyelle":[{"+":"[aeiouéèàüëöêîôûù]"},"j",1]}],"z":[["raz_riz"],{"*":[{},"z",1],"@":[{},"z",1],"raz_riz":[{"+":"$","-":"^r[ai]"},"#",1]}],"à":[[],{"*":[{},"a",1]}],"â":[[],{"*":[{},"a",1]}],"ç":[[],{"*":[{},"s",1]}],"è":[[],{"*":[{},"e^",1]}],"é":[[],{"*":[{},"e",1]}],"ê":[[],{"*":[{},"e^",1]}],"ë":[[],{"*":[{},"e^",1]}],"î":[[],{"*":[{},"i",1]}],"ï":[["thai","aie"],{"*":[{},"i",1],"aie":[{"+":"e","-":"[ao]"},"j",1],"thai":[{"-":"t(h?)a"},"j",1]}],"ô":[[],{"*":[{},"o",1]}],"ö":[[],{"*":[{},"o",1]}],"ù":[[],{"*":[{},"y",1]}],"û":[[],{"*":[{},"y",1]}],"œ":[["voeux","oeufs","noeud"],{"*":[{"+":"u"},"x^",2],"noeud":[{"+":"ud"},"x^",2],"oeufs":[{"+":"ufs"},"x^",2],"voeux":[{"+":"ux"},"x^",2]}]}`);

// Rule testing function
function testeRegle(nomRegle: string, cle: any, mot: string, posMot: number): boolean {
    if (typeof cle === 'string') {
        // Special rule function
        return executeSpecialRule(cle, mot, posMot);
    }

    let trouveS = true;
    let trouveP = true;

    if (cle['+'] !== undefined) {
        const pattern = new RegExp(cle['+']);
        const res = pattern.exec(mot.slice(posMot));
        trouveS = res !== null && res.index === 0;
    }

    if (cle['-'] !== undefined) {
        const pattern = new RegExp(cle['-']);
        trouveP = false;

        if (pattern.source[0] === '^') {
            if (pattern.source.length === 1) {
                trouveP = posMot === 1;
            } else {
                const res = pattern.exec(mot.substring(0, posMot - 1));
                if (res !== null) {
                    trouveP = res[0].length === posMot - 1;
                }
            }
        } else {
            let k = posMot - 2;
            while (k > -1 && !trouveP) {
                const res = pattern.exec(mot.substring(k, posMot - 1));
                if (res !== null) {
                    trouveP = res[0].length === res.input.length;
                }
                k -= 1;
            }
        }
    }

    return trouveP && trouveS;
}

// Special rule execution
function executeSpecialRule(ruleName: string, mot: string, posMot: number): boolean {
    const motLower = mot.toLowerCase();

    switch (ruleName) {
        case 'regle_ient':
            if (motLower.slice(-5).match(/[bcçdfghjklnmpqrstvwxz]ient/) === null || posMot < mot.length - 4) {
                return false;
            }
            const pseudoInfinitif = removeAccents(mot).substring(0, mot.length - 2) + 'r';
            return verbes_ier.includes(pseudoInfinitif);

        case 'regle_mots_ent':
            if (motLower.match(/^[bcdfghjklmnpqrstvwxz]ent(s?)$/) !== null) {
                return true;
            }
            let comparateur = motLower;
            if (motLower[motLower.length - 1] === 's') {
                comparateur = motLower.substring(0, motLower.length - 1);
            }
            if (posMot + 2 < comparateur.length) {
                return false;
            }
            return mots_ent.includes(comparateur);

        case 'regle_s_final':
            return mots_s_final.includes(motLower);

        case 'regle_t_final':
            let mSing = motLower;
            if (motLower[motLower.length - 1] === 's') {
                mSing = motLower.substring(0, motLower.length - 1);
            }
            return mots_t_final.includes(mSing);

        case 'regle_ment':
            if (motLower.slice(-4).match(/ment/) === null || posMot < mot.length - 3) {
                return false;
            }
            return motLower.slice(-7) !== 'dorment';

        case 'regle_verbe_mer':
            if (motLower.slice(-4).match(/ment/) === null || posMot < mot.length - 3) {
                return false;
            }
            return !executeSpecialRule('regle_ment', mot, posMot);

        default:
            return false;
    }
}

// Remove accents helper
function removeAccents(str: string): string {
    const accents: { [key: string]: string } = {
        "à": "a", "á": "a", "â": "a", "ã": "a", "ä": "a", "å": "a",
        "ò": "o", "ó": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o",
        "è": "e", "é": "e", "ê": "e", "ë": "e",
        "ç": "c",
        "ì": "i", "í": "i", "î": "i", "ï": "i",
        "ù": "u", "ú": "u", "û": "u", "ü": "u",
        "ÿ": "y", "ñ": "n"
    };
    return str.replace(/[àáäâèéêëçìíîïòóôõöøùúûüÿñ]/gi, (match) => accents[match.toLowerCase()] || match).toLowerCase();
}

// Extract phonemes from a word
export function extrairePhonemes(mot: string): Phoneme[] {
    let pMot = 0;
    const codage: Phoneme[] = [];
    const motmin = mot.toLowerCase();

    while (pMot < mot.length) {
        const lettre = motmin[pMot];
        let trouve = false;

        if (lettre in autom) {
            const aut = autom[lettre][1];
            const rules = autom[lettre][0];
            let i = 0;

            while (!trouve && i < rules.length) {
                const k = rules[i];
                if (testeRegle(k, aut[k][0], motmin, pMot + 1)) {
                    const phoneme = aut[k][1];
                    const pas = aut[k][2];
                    codage.push({ phoneme, lettres: mot.substring(pMot, pMot + pas) });
                    pMot += pas;
                    trouve = true;
                }
                i += 1;
            }

            if (!trouve && pMot === mot.length - 1 && aut['@']) {
                const phoneme = aut['@'][1];
                codage.push({ phoneme, lettres: lettre });
                trouve = true;
                pMot += 1;
            }

            if (!trouve) {
                try {
                    const phoneme = aut['*'][1];
                    const pas = aut['*'][2];
                    codage.push({ phoneme, lettres: mot.substring(pMot, pMot + pas) });
                    pMot += pas;
                } catch (e) {
                    codage.push({ phoneme: null, lettres: lettre });
                    pMot += 1;
                }
            }
        } else {
            codage.push({ phoneme: null, lettres: lettre });
            pMot += 1;
        }
    }

    return codage;
}

// Phoneme utility functions
function estVoyelle(phon: Phoneme): boolean {
    return phon.phoneme !== null && syllaphon.v.includes(phon.phoneme);
}

function estConsonne(phon: Phoneme): boolean {
    return phon.phoneme !== null && syllaphon.c.includes(phon.phoneme);
}

function estMuet(phon: Phoneme): boolean {
    return phon.phoneme !== null && syllaphon['#'].includes(phon.phoneme);
}

function estConsonneRedoublee(phon: Phoneme): boolean {
    return phon.phoneme !== null &&
        estConsonne(phon) &&
        phon.lettres.length === 2 &&
        phon.lettres[0] === phon.lettres[1];
}

// Extract syllables from phonemes
export function extraireSyllabes(phonemes: Phoneme[]): Syllabe[] {
    const nbPhon = phonemes.length;
    if (nbPhon < 2) {
        return [{ phonemes }];
    }

    // Duplicate double consonants
    const nphonemes: Phoneme[] = [];
    for (let i = 0; i < nbPhon; i++) {
        const phon = phonemes[i];
        if (estConsonneRedoublee(phon)) {
            const dedouble = { phoneme: phon.phoneme, lettres: phon.lettres[0] };
            nphonemes.push(dedouble);
            nphonemes.push({ phoneme: phon.phoneme, lettres: phon.lettres[1] });
        } else {
            nphonemes.push(phon);
        }
    }

    // Build syllable structure  
    const sylph: [string, number[]][] = [];
    for (let i = 0; i < nphonemes.length; i++) {
        const phon = nphonemes[i];
        if (phon.phoneme !== null) {
            if (estVoyelle(phon)) {
                sylph.push(['v', [i]]);
            } else if (estConsonne(phon)) {
                sylph.push(['c', [i]]);
            } else if (estMuet(phon)) {
                sylph.push(['#', [i]]);
            } else {
                sylph.push(['s', [i]]);
            }
        }
    }

    // Merge consonant clusters (bl, tr, cr, etc.)
    let i = 0;
    while (i < sylph.length - 1) {
        if (sylph[i][0] === 'c' && sylph[i + 1][0] === 'c') {
            const phon0 = nphonemes[sylph[i][1][0]];
            const phon1 = nphonemes[sylph[i + 1][1][0]];
            if ((phon1.phoneme === 'l' || phon1.phoneme === 'r') &&
                ['b', 'k', 'p', 't', 'g', 'd', 'f', 'v'].includes(phon0.phoneme || '')) {
                sylph[i][1].push(...sylph[i + 1][1]);
                sylph.splice(i + 1, 1);
            }
        }
        i += 1;
    }

    // Attach silent letters to preceding
    i = 0;
    while (i < sylph.length - 1) {
        if (sylph[i + 1][0] === '#') {
            sylph[i][1].push(...sylph[i + 1][1]);
            sylph.splice(i + 1, 1);
        }
        i += 1;
    }

    // Build syllables
    const sylls: Syllabe[] = [];
    let j = 0;
    i = 0;

    while (i < sylph.length) {
        j = i;
        while (i < sylph.length && sylph[i][0] !== 'v') {
            i += 1;
        }

        if (i < sylph.length && sylph[i][0] === 'v') {
            i += 1;
            const curSyl: Syllabe = { phonemes: [] };
            for (let k = j; k < i; k++) {
                for (const idx of sylph[k][1]) {
                    curSyl.phonemes.push(nphonemes[idx]);
                }
            }
            j = i;
            sylls.push(curSyl);
        }

        // Next consonant goes with preceding syllable if followed by another consonant
        if (i + 1 < sylph.length && sylls.length > 0) {
            const lettre1 = nphonemes[sylph[i][1][sylph[i][1].length - 1]].lettres;
            const lettre2 = nphonemes[sylph[i + 1][1][0]].lettres[0];
            const l1 = lettre1[lettre1.length - 1];
            if ('bcdfghjklmnpqrstvwxzç'.includes(l1) && 'bcdfghjklmnpqrstvwxzç'.includes(lettre2)) {
                for (const idx of sylph[i][1]) {
                    sylls[sylls.length - 1].phonemes.push(nphonemes[idx]);
                }
                i += 1;
                j = i;
            }
        }
    }

    if (sylls.length === 0) {
        return [{ phonemes: nphonemes }];
    }

    // Add remaining phonemes to last syllable
    for (let k = j; k < sylph.length; k++) {
        for (const idx of sylph[k][1]) {
            sylls[sylls.length - 1].phonemes.push(nphonemes[idx]);
        }
    }

    return sylls;
}

// Main export: syllabify a word and return syllable strings with silent letter info
export interface SyllabeResult {
    syllabe: string;
    muet: string;
}

export function syllabifier(mot: string): SyllabeResult[] {
    const phonemes = extrairePhonemes(mot);
    const syllabes = extraireSyllabes(phonemes);

    return syllabes.map((syl, index) => {
        // On doit garder l'ordre des lettres !
        // Les lettres muettes peuvent être au début (h), au milieu ou à la fin
        let result = '';
        let lastMuetIndex = -1;

        // Trouver la position de la dernière lettre muette (seulement à la fin)
        for (let i = syl.phonemes.length - 1; i >= 0; i--) {
            if (estMuet(syl.phonemes[i])) {
                lastMuetIndex = i;
            } else {
                break; // On arrête dès qu'on trouve une lettre non-muette
            }
        }

        let syllabeText = '';
        let muetText = '';

        for (let i = 0; i < syl.phonemes.length; i++) {
            const phon = syl.phonemes[i];
            if (i >= lastMuetIndex && lastMuetIndex !== -1) {
                // Lettres muettes finales
                muetText += phon.lettres;
            } else {
                // Lettres prononcées (y compris le h muet au début)
                syllabeText += phon.lettres;
            }
        }

        return {
            syllabe: syllabeText,
            muet: muetText
        };
    });
}

// Simple syllabify returning just strings
export function syllabifySimple(mot: string): string[] {
    const phonemes = extrairePhonemes(mot);
    const syllabes = extraireSyllabes(phonemes);

    return syllabes.map(syl => {
        return syl.phonemes.map(p => p.lettres).join('');
    });
}
