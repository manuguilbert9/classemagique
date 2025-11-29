
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2, AlertTriangle, ListCollapse, Settings, Wrench, Sparkles, Trash2, Clock, Save, Archive, ArchiveRestore, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportAllData, importAllData } from '@/services/database';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getGloballyEnabledSkills, setGloballyEnabledSkills, getCurrentSchoolYear, setCurrentSchoolYear, getChatSettings, setChatSettings, type ChatSettings, setArchivedSkills } from '@/services/teacher';
import { skills, allSkillCategories, SkillLevel } from '@/lib/skills';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getStudents, updateStudent } from '@/services/students';
import { deleteDummyScores } from '@/services/scores';
import { Input } from '../ui/input';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function ChatSettingsManager() {
    const [settings, setSettings] = useState<ChatSettings>({
        enabled: true,
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
        startTime: '08:45',
        endTime: '16:45',
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getChatSettings().then(chatSettings => {
            setSettings(chatSettings);
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        const result = await setChatSettings(settings);
        if (result.success) {
            toast({ title: 'Réglages du chat enregistrés' });
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
        setIsLoading(false);
    }

    const handleDayToggle = (day: string) => {
        const newDays = settings.days.includes(day)
            ? settings.days.filter(d => d !== day)
            : [...settings.days, day];
        setSettings(prev => ({ ...prev, days: newDays }));
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock /> Réglages du Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock /> Réglages du Chat</CardTitle>
                <CardDescription>Définissez quand les élèves peuvent utiliser la messagerie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Switch id="chat-enabled" checked={settings.enabled} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))} />
                    <Label htmlFor="chat-enabled">Activer le chat pour les élèves</Label>
                </div>
                <div className="space-y-2">
                    <Label>Jours actifs</Label>
                    <ToggleGroup type="multiple" value={settings.days} onValueChange={(days) => setSettings(prev => ({ ...prev, days: days }))} className="flex-wrap justify-start gap-1">
                        {DAYS_OF_WEEK.map(day => (
                            <ToggleGroupItem key={day} value={day} aria-label={day} variant="outline">{day.substring(0, 3)}</ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Heure de début</Label>
                        <Input id="start-time" type="time" value={settings.startTime} onChange={e => setSettings(prev => ({ ...prev, startTime: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-time">Heure de fin</Label>
                        <Input id="end-time" type="time" value={settings.endTime} onChange={e => setSettings(prev => ({ ...prev, endTime: e.target.value }))} />
                    </div>
                </div>
                <div>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                        Enregistrer les réglages du chat
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function GeneralSettingsManager() {
    const [schoolYear, setSchoolYear] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getCurrentSchoolYear().then(year => {
            setSchoolYear(year);
            setIsLoading(false);
        });
    }, []);

    const handleYearChange = async (year: string) => {
        setSchoolYear(year);
        const result = await setCurrentSchoolYear(year);
        if (result.success) {
            toast({
                title: "Année scolaire mise à jour",
                description: `L'année de référence est maintenant ${year}-${parseInt(year) + 1}.`,
            });
        } else {
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de sauvegarder le réglage." });
        }
    };

    // Generate school year options (e.g., 2023-2024, 2024-2025, etc.)
    const currentYear = new Date().getFullYear();
    const schoolYearOptions = Array.from({ length: 5 }, (_, i) => {
        const startYear = currentYear - 2 + i;
        return { value: String(startYear), label: `${startYear}-${startYear + 1}` };
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> Réglages Généraux</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings /> Réglages Généraux</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-w-xs space-y-2">
                    <Label htmlFor="school-year">Année scolaire de référence</Label>
                    <Select value={schoolYear} onValueChange={handleYearChange}>
                        <SelectTrigger id="school-year">
                            <SelectValue placeholder="Choisir une année..." />
                        </SelectTrigger>
                        <SelectContent>
                            {schoolYearOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CardDescription>
                        Cette année est utilisée comme point de départ pour les exercices de calendrier.
                    </CardDescription>
                </div>
            </CardContent>
        </Card>
    );
}

function ExercisesManager({ archivedSkills }: { archivedSkills: Record<string, boolean> }) {
    const [enabledSkills, setEnabledSkills] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        getGloballyEnabledSkills().then(skills => {
            setEnabledSkills(skills);
            setIsLoading(false);
        });
    }, []);

    const handleToggleSkill = useCallback(async (skillSlug: string, isEnabled: boolean) => {
        const newEnabledSkills = { ...enabledSkills, [skillSlug]: isEnabled };
        setEnabledSkills(newEnabledSkills);
        const result = await setGloballyEnabledSkills(newEnabledSkills);

        if (result.success) {
            // Propagate change to all students
            const students = await getStudents();
            for (const student of students) {
                const studentEnabledSkills = student.enabledSkills || {};
                await updateStudent(student.id, { enabledSkills: { ...studentEnabledSkills, [skillSlug]: isEnabled } });
            }
            toast({
                title: 'Réglage sauvegardé',
                description: `L'exercice a été ${isEnabled ? 'activé' : 'désactivé'} pour tous les élèves.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder le réglage global.'
            });
            // Revert UI on failure
            setEnabledSkills(prev => ({ ...prev, [skillSlug]: !isEnabled }));
        }
    }, [enabledSkills, toast]);

    const toggleAll = async (enable: boolean) => {
        const newEnabledSkills: Record<string, boolean> = {};
        skills.forEach(skill => {
            // Only toggle if not archived
            if (!archivedSkills[skill.slug]) {
                newEnabledSkills[skill.slug] = enable;
            } else {
                // Keep existing state for archived skills
                newEnabledSkills[skill.slug] = enabledSkills[skill.slug] ?? false;
            }
        });

        setEnabledSkills(newEnabledSkills);
        await setGloballyEnabledSkills(newEnabledSkills);

        const students = await getStudents();
        for (const student of students) {
            await updateStudent(student.id, { enabledSkills: newEnabledSkills });
        }

        toast({
            title: 'Réglages sauvegardés',
            description: `Tous les exercices actifs ont été ${enable ? 'activés' : 'désactivés'} pour tous les élèves.`,
        });
    };

    const handleToggleArchive = async (skillSlug: string, archive: boolean) => {
        const newArchivedSkills = { ...archivedSkills, [skillSlug]: archive };
        const result = await setArchivedSkills(newArchivedSkills);

        if (result.success) {
            toast({
                title: archive ? 'Exercice archivé' : 'Exercice restauré',
                description: archive ? "L'exercice a été déplacé dans les archives." : "L'exercice est de nouveau disponible.",
            });
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de modifier l'état d'archivage." });
        }
    };

    const skillsByCategory = useMemo(() => {
        const grouped: Record<string, typeof skills> = {};
        const archivedGrouped: Record<string, typeof skills> = {};

        allSkillCategories.forEach(cat => {
            grouped[cat] = [];
            archivedGrouped[cat] = [];
        });

        skills.forEach(skill => {
            if (searchQuery && !skill.name.toLowerCase().includes(searchQuery.toLowerCase()) && !skill.category.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            if (archivedSkills[skill.slug]) {
                if (archivedGrouped[skill.category]) {
                    archivedGrouped[skill.category].push(skill);
                }
            } else {
                if (grouped[skill.category]) {
                    grouped[skill.category].push(skill);
                }
            }
        });
        return { active: grouped, archived: archivedGrouped };
    }, [archivedSkills, searchQuery]);


    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gestion des Exercices (Global)</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Exercices (Global)</CardTitle>
                <CardDescription>Activez ou désactivez des exercices pour <span className="font-bold">tous les élèves</span>. Cette action mettra à jour le profil de chaque élève pour refléter ce choix.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Button onClick={() => toggleAll(true)} variant="outline" size="sm">Tout activer</Button>
                    <Button onClick={() => toggleAll(false)} variant="outline" size="sm">Tout désactiver</Button>
                    <div className="relative flex-1 max-w-sm ml-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un exercice..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allSkillCategories.map(category => {
                        const skillsInCategory = skillsByCategory.active[category];
                        if (skillsInCategory.length === 0) return null;

                        return (
                            <div key={category} className="space-y-3">
                                <h3 className="font-semibold text-md border-b pb-2">{category}</h3>
                                <div className="space-y-2">
                                    {skillsInCategory.map(skill => (
                                        <div key={skill.slug} className="flex items-center justify-between p-2 bg-background rounded-lg group">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleToggleArchive(skill.slug, true)}
                                                    title="Archiver l'exercice"
                                                >
                                                    <Archive className="h-4 w-4" />
                                                </Button>
                                                <Label htmlFor={`global-skill-${skill.slug}`} className="text-sm font-medium cursor-pointer">
                                                    {skill.name}
                                                </Label>
                                            </div>
                                            <Switch
                                                id={`global-skill-${skill.slug}`}
                                                checked={enabledSkills[skill.slug] ?? false}
                                                onCheckedChange={(checked) => handleToggleSkill(skill.slug, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Archives Drawer */}
                <div className="mt-8 border-t pt-4">
                    <Button
                        variant="ghost"
                        className="w-full flex justify-between items-center text-muted-foreground hover:text-foreground"
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                    >
                        <span className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Exercices Archivés
                        </span>
                        {isArchiveOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    {isArchiveOpen && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/30 p-4 rounded-lg">
                            {allSkillCategories.map(category => {
                                const skillsInCategory = skillsByCategory.archived[category];
                                if (skillsInCategory.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-3">
                                        <h3 className="font-semibold text-md border-b pb-2 text-muted-foreground">{category}</h3>
                                        <div className="space-y-2">
                                            {skillsInCategory.map(skill => (
                                                <div key={skill.slug} className="flex items-center justify-between p-2 bg-background/50 rounded-lg opacity-75">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        {skill.name}
                                                    </Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => handleToggleArchive(skill.slug, false)}
                                                    >
                                                        <ArchiveRestore className="h-3 w-3 mr-1" />
                                                        Restaurer
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                            {Object.values(skillsByCategory.archived).every(arr => arr.length === 0) && (
                                <p className="col-span-full text-center text-sm text-muted-foreground py-4">
                                    Aucun exercice archivé.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function MaintenanceManager({ onDataRefresh }: { onDataRefresh: () => void }) {
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleSyncLevels = async () => {
        setIsSyncing(true);
        toast({ title: "Synchronisation en cours...", description: "Vérification des niveaux de compétence pour tous les élèves." });

        try {
            const allStudents = await getStudents();
            let studentsUpdated = 0;

            for (const student of allStudents) {
                let needsUpdate = false;
                const studentLevels = student.levels || {};
                const studentEnabledSkills = student.enabledSkills || {};

                for (const skill of skills) {
                    // Check if skill is enabled and has variable levels, but no level is set for the student
                    if (studentEnabledSkills[skill.slug] && !skill.isFixedLevel && !studentLevels[skill.slug]) {
                        studentLevels[skill.slug] = 'B'; // Assign default level 'B'
                        needsUpdate = true;
                    }
                }

                if (needsUpdate) {
                    await updateStudent(student.id, { levels: studentLevels });
                    studentsUpdated++;
                }
            }

            if (studentsUpdated > 0) {
                toast({ title: "Synchronisation terminée !", description: `${studentsUpdated} élève(s) ont été mis à jour avec des niveaux par défaut.` });
                onDataRefresh();
            } else {
                toast({ title: "Aucune mise à jour nécessaire", description: "Tous les élèves ont déjà des niveaux définis pour leurs exercices activés." });
            }

        } catch (error) {
            console.error("Error syncing student levels:", error);
            toast({ variant: 'destructive', title: "Erreur de synchronisation", description: "Une erreur est survenue." });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCleanDummyData = async () => {
        setIsConfirmOpen(false);
        setIsCleaning(true);
        toast({ title: "Nettoyage en cours...", description: "Suppression des scores de test." });

        try {
            const result = await deleteDummyScores();
            if (result.success) {
                toast({ title: "Nettoyage terminé !", description: `${result.deletedCount} score(s) de test ont été supprimés.` });
                onDataRefresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error cleaning dummy scores:", error);
            toast({ variant: 'destructive', title: "Erreur de nettoyage", description: "Une erreur est survenue." });
        } finally {
            setIsCleaning(false);
        }

    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Maintenance et Nettoyage</CardTitle>
                <CardDescription>
                    Utilisez ces outils pour assurer la cohérence et l'intégrité des données de l'application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 p-6 rounded-lg bg-secondary/50 items-start">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Wrench /> Niveaux des exercices</h3>
                    <p className="text-sm text-muted-foreground">
                        Si de nouveaux exercices à niveaux ont été ajoutés, cette action vérifiera que chaque élève a un niveau par défaut ('B') assigné pour cet exercice.
                    </p>
                    <Button onClick={handleSyncLevels} disabled={isSyncing}>
                        {isSyncing ? <Loader2 className="mr-2 animate-spin" /> : <Wrench className="mr-2" />}
                        Synchroniser les niveaux manquants
                    </Button>
                </div>
                <div className="flex flex-col gap-4 p-6 rounded-lg bg-secondary/50 items-start">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles /> Scores de test</h3>
                    <p className="text-sm text-muted-foreground">
                        Cette action supprimera tous les scores générés par les questions d'exemple (celles avec le texte "Ceci est un exemple de question...").
                    </p>
                    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" onClick={() => setIsConfirmOpen(true)} disabled={isCleaning}>
                                {isCleaning ? <Loader2 className="mr-2 animate-spin" /> : <Trash2 className="mr-2" />}
                                Supprimer les scores de test
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer tous les scores générés par les questions d'exemple ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCleanDummyData}>Confirmer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

export function DatabaseManager({ onDataRefresh, archivedSkills = {} }: { onDataRefresh: () => void, archivedSkills?: Record<string, boolean> }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState<File | null>(null);

    const handleExport = async () => {
        setIsLoading(true);
        toast({ title: "Préparation de l'exportation...", description: "Cela peut prendre quelques instants." });
        try {
            const data = await exportAllData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `backup-classe-magique-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({ title: "Exportation réussie !", description: "Le fichier de sauvegarde a été téléchargé." });
        } catch (error) {
            console.error("Export error:", error);
            toast({ variant: 'destructive', title: "Erreur d'exportation", description: "Impossible de générer le fichier de sauvegarde." });
        }
        setIsLoading(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/json') {
            setFileToImport(file);
            setIsImportAlertOpen(true);
        } else {
            toast({ variant: 'destructive', title: "Fichier invalide", description: "Veuillez sélectionner un fichier JSON valide." });
        }
        // Reset file input so the same file can be selected again
        event.target.value = '';
    };

    const handleImportConfirm = async () => {
        if (!fileToImport) return;

        setIsImportAlertOpen(false);
        setIsLoading(true);
        toast({ title: "Importation en cours...", description: "Veuillez ne pas fermer cette page." });

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== 'string') throw new Error("Le contenu du fichier est invalide.");

                    const data = JSON.parse(content);
                    const result = await importAllData(data);

                    if (result.success) {
                        toast({ title: "Importation terminée !", description: "Les données ont été restaurées. La page va se rafraîchir." });
                        setTimeout(() => onDataRefresh(), 2000);
                    } else {
                        throw new Error(result.error || 'Erreur inconnue lors de l\'importation.');
                    }
                } catch (parseError: any) {
                    toast({ variant: 'destructive', title: "Erreur d'importation", description: parseError.message || "Le format du fichier est incorrect." });
                } finally {
                    setIsLoading(false);
                    setFileToImport(null);
                }
            };
            reader.readAsText(fileToImport);
        } catch (error) {
            console.error("Import error:", error);
            toast({ variant: 'destructive', title: "Erreur d'importation", description: "Impossible de lire le fichier." });
            setIsLoading(false);
            setFileToImport(null);
        }
    };

    return (
        <div className="space-y-8">
            <GeneralSettingsManager />
            <ChatSettingsManager />
            <ExercisesManager archivedSkills={archivedSkills} />
            <MaintenanceManager onDataRefresh={onDataRefresh} />
            <Card>
                <CardHeader>
                    <CardTitle>Sauvegarde et Restauration</CardTitle>
                    <CardDescription>
                        Exportez toutes les données de l'application (élèves, scores, etc.) dans un fichier de sauvegarde, ou importez un fichier pour restaurer les données.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 p-6 rounded-lg bg-secondary/50 items-center">
                        <h3 className="font-semibold text-lg">Exporter les données</h3>
                        <p className="text-sm text-center text-muted-foreground">Téléchargez un fichier JSON contenant toutes les données actuelles de l'application.</p>
                        <Button onClick={handleExport} disabled={isLoading} className="mt-2">
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                            Exporter la sauvegarde
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4 p-6 rounded-lg bg-destructive/10 items-center border border-destructive/50">
                        <h3 className="font-semibold text-lg text-destructive">Importer des données</h3>
                        <p className="text-sm text-center text-muted-foreground">Restaurer les données depuis un fichier JSON. Attention, cette action est irréversible.</p>
                        <Button asChild variant="destructive" className="mt-2 cursor-pointer" disabled={isLoading}>
                            <label htmlFor="import-file">
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                                Choisir un fichier...
                            </label>
                        </Button>
                        <input id="import-file" type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive h-6 w-6" />
                            Êtes-vous absolument sûr ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="py-4">
                            Cette action est <span className="font-bold">irréversible</span> et va <span className="font-bold text-destructive">supprimer toutes les données actuelles</span> de la base de données (élèves, scores, devoirs, etc.).
                            <br /><br />
                            Elles seront remplacées par le contenu du fichier <code className="bg-muted px-1 py-0.5 rounded-sm">{fileToImport?.name}</code>. Êtes-vous certain de vouloir continuer ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setFileToImport(null)}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportConfirm} className="bg-destructive hover:bg-destructive/90">
                            Oui, importer et remplacer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
