
'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type Group } from '@/services/groups';
import { type Student } from '@/services/students';
import { skills, getSkillBySlug, type Skill } from '@/lib/skills';
import { saveHomework, type Homework, type Assignment, HomeworkResult } from '@/services/homework';
import { getSpellingLists, SpellingList } from '@/services/spelling';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, CheckCircle, XCircle, Users, BrainCircuit, Wand2, Calendar as CalendarIcon, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HomeworkManagerProps {
  students: Student[];
  groups: Group[];
  allHomework: Homework[];
  allHomeworkResults: HomeworkResult[];
}

const frenchSkills = skills.filter(s => ['Phonologie', 'Lecture / compréhension', 'Ecriture', 'Grammaire', 'Conjugaison', 'Vocabulaire', 'Orthographe'].includes(s.category));
const mathSkills = skills.filter(s => ['Nombres et calcul', 'Grandeurs et mesures', 'Espace et géométrie', 'Problèmes', 'Organisation et gestion de données'].includes(s.category));


export function HomeworkManager({ students, groups, allHomework, allHomeworkResults }: HomeworkManagerProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [spellingLists, setSpellingLists] = useState<SpellingList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  // Bulk mode states
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [bulkConfig, setBulkConfig] = useState<{
    startDate: string;
    weeks: number;
    days: number[];
    francais: string[];
    maths: string[];
    orthographe: string;
    weeksPerList: number;
    notes: string;
    groupIds: string[];
  }>({
    startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    weeks: 1,
    days: [1, 2, 4, 5], // Lundi, Mardi, Jeudi, Vendredi
    francais: [],
    maths: [],
    orthographe: 'none',
    weeksPerList: 2,
    notes: '',
    groupIds: []
  });

  useEffect(() => {
    getSpellingLists().then(lists => {
      setSpellingLists(lists);
      setIsLoadingLists(false);
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateId = format(selectedDate, 'yyyy-MM-dd');
      const existingHomework = allHomework.find(h => h.id === dateId);
      setAssignments(existingHomework?.assignments || {});
    }
  }, [selectedDate, allHomework]);

  const handleAssignmentChange = (groupId: string, type: 'francais' | 'maths' | 'orthographe' | 'notes', value: string) => {
    setAssignments(prev => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] || { francais: null, maths: null, orthographe: null, notes: null }),
        [type]: value === '' || value === 'none' ? null : value,
      },
    }));
  };

  const handleNotesChange = (groupId: string, value: string) => {
    handleAssignmentChange(groupId, 'notes', value);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    setIsSaving(true);

    const dateId = format(selectedDate, 'yyyy-MM-dd');
    const result = await saveHomework(dateId, assignments);

    if (result.success) {
      toast({ title: 'Devoirs enregistrés', description: 'Les devoirs pour le jour sélectionné ont été mis à jour.' });
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer les devoirs." });
    }
    setIsSaving(false);
  };
  
  const handleBulkSave = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    const start = new Date(bulkConfig.startDate);
    
    // Find starting index for orthographe list
    let startOrthoIndex = -1;
    if (bulkConfig.orthographe !== 'none') {
      startOrthoIndex = spellingLists.findIndex(l => l.id === bulkConfig.orthographe);
    }
    
    let mathRotationIndex = 0;
    const validMaths = bulkConfig.maths.filter(m => m && m !== 'none');

    let francaisRotationIndex = 0;
    const validFrancais = bulkConfig.francais.filter(f => f && f !== 'none');
    
    // We iterate through each week
    for (let w = 0; w < bulkConfig.weeks; w++) {
      // Find the Monday of that week
      const weekStart = addWeeks(startOfWeek(start, { weekStartsOn: 1 }), w);
      
      // Determine the orthographe list for this week
      let currentOrthoList = null;
      if (startOrthoIndex !== -1) {
        const listIndex = startOrthoIndex + Math.floor(w / bulkConfig.weeksPerList);
        if (listIndex < spellingLists.length) {
          currentOrthoList = spellingLists[listIndex];
        }
      }
      
      // For each selected day (1=Mon, 2=Tue, 4=Thu, 5=Fri)
      for (const dayIndex of bulkConfig.days) {
        const targetDate = addDays(weekStart, dayIndex - 1);
        const dateId = format(targetDate, 'yyyy-MM-dd');
        
        let orthoAssignment = null;
        if (currentOrthoList) {
           if (dayIndex === 1 || dayIndex === 2) {
             orthoAssignment = `${currentOrthoList.id}-lundi`;
           } else if (dayIndex === 4 || dayIndex === 5) {
             orthoAssignment = `${currentOrthoList.id}-jeudi`;
           }
        }
        
        let mathAssignment = null;
        if (validMaths.length > 0) {
          mathAssignment = validMaths[mathRotationIndex % validMaths.length];
          mathRotationIndex++;
        }

        let francaisAssignment = null;
        if (validFrancais.length > 0) {
          francaisAssignment = validFrancais[francaisRotationIndex % validFrancais.length];
          francaisRotationIndex++;
        }
        
        const existingHomework = allHomework.find(h => h.id === dateId);
        const bulkAssignments: Record<string, Assignment> = { ...(existingHomework?.assignments || {}) };
        
        bulkConfig.groupIds.forEach(groupId => {
          bulkAssignments[groupId] = {
            ...bulkAssignments[groupId],
            francais: francaisAssignment,
            maths: mathAssignment,
            notes: bulkConfig.notes || null,
            ...(bulkConfig.orthographe !== 'none' ? { orthographe: orthoAssignment } : {})
          };
        });

        const res = await saveHomework(dateId, bulkAssignments);
        if (res.success) successCount++;
        else errorCount++;
      }
    }

    if (errorCount === 0) {
      toast({ title: 'Programmation terminée', description: `${successCount} jours ont été programmés avec succès.` });
      setShowBulkMode(false);
    } else {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur partielle', 
        description: `${successCount} jours programmés, mais ${errorCount} échecs.` 
      });
    }
    setIsSaving(false);
  };

  const getCompletionStatus = (studentId: string, assignedSkillSlug: string | null): { status: 'completed' | 'pending' | 'not-assigned', completedAt?: Date } => {
    if (!assignedSkillSlug) return { status: 'not-assigned' };

    const dateId = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    if (!dateId) return { status: 'not-assigned' };

    const isOrtho = assignedSkillSlug.startsWith('D'); // e.g. D1-lundi

    const result = allHomeworkResults.find(res => {
      if (res.userId !== studentId || res.date !== dateId) return false;
      if (isOrtho) {
        return res.skillSlug.includes(assignedSkillSlug);
      }
      return res.skillSlug === assignedSkillSlug;
    });

    if (result) {
      return { status: 'completed', completedAt: result.createdAt ? new Date(result.createdAt as any) : undefined };
    }

    return { status: 'pending' };
  };


  const toggleBulkMode = () => {
    if (!showBulkMode) {
      // Pre-fill with current selection from first group if available
      const firstGroupId = groups[0]?.id;
      if (firstGroupId && assignments[firstGroupId]) {
        const current = assignments[firstGroupId];
        setBulkConfig(prev => ({
          ...prev,
          francais: current.francais && current.francais !== 'none' ? [current.francais] : [],
          maths: current.maths && current.maths !== 'none' ? [current.maths] : [],
          notes: current.notes || '',
          groupIds: groups.map(g => g.id),
          days: [1, 4], // Default to Lundi, Jeudi 
          weeksPerList: 2
        }));
      } else {
        setBulkConfig(prev => ({
          ...prev,
          francais: [],
          maths: [],
          groupIds: groups.map(g => g.id),
          days: [1, 4], // Default to Lundi, Jeudi
          weeksPerList: 2
        }));
      }
      if (selectedDate) {
        setBulkConfig(prev => ({ ...prev, startDate: format(selectedDate, 'yyyy-MM-dd') }));
      }
    }
    setShowBulkMode(!showBulkMode);
  };

  return (
    <div className="space-y-8">
      {/* Header with Magic Mode toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CalendarIcon className="text-primary h-6 w-6" /> Gestion des Devoirs
          </h2>
          <p className="text-sm text-muted-foreground">Planifiez les activités et suivez les résultats en un clin d'œil.</p>
        </div>
        <Button 
          variant={showBulkMode ? "default" : "outline"} 
          onClick={toggleBulkMode}
          className={cn("gap-2 shadow-sm h-12 px-6 rounded-xl transition-all", !showBulkMode && "hover:bg-primary/5")}
        >
          <Wand2 className={cn("h-5 w-5", showBulkMode ? "animate-pulse" : "text-primary")} />
          <span className="font-semibold">
            {showBulkMode ? "Retour au calendrier" : "Programmation Rapide"}
          </span>
        </Button>
      </div>

      {showBulkMode ? (
        <Card className="border-primary/30 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Programmer pour plusieurs semaines
            </CardTitle>
            <CardDescription>
              Assignez les mêmes devoirs sur plusieurs jours en un seul clic.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Schedule */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date de début (Lundi de la première semaine)</Label>
                  <Input 
                    type="date" 
                    value={bulkConfig.startDate} 
                    onChange={(e) => setBulkConfig({...bulkConfig, startDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nombre de semaines</Label>
                  <div className="flex items-center gap-4">
                    <Select 
                      value={String(bulkConfig.weeks)} 
                      onValueChange={(v) => setBulkConfig({...bulkConfig, weeks: parseInt(v)})}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} {n > 1 ? 'semaines' : 'semaine'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Jours concernés</Label>
                  <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-lg border">
                    {[
                      { id: 1, label: 'Lundi' },
                      { id: 2, label: 'Mardi' },
                      { id: 4, label: 'Jeudi' },
                      { id: 5, label: 'Vendredi' }
                    ].map(day => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day.id}`} 
                          checked={bulkConfig.days.includes(day.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkConfig({...bulkConfig, days: [...bulkConfig.days, day.id]});
                            } else {
                              setBulkConfig({...bulkConfig, days: bulkConfig.days.filter(d => d !== day.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`day-${day.id}`} className="cursor-pointer">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Groupes concernés</Label>
                  <div className="flex flex-col gap-2 p-4 bg-secondary/30 rounded-lg border">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bulk-group-${group.id}`} 
                          checked={bulkConfig.groupIds.includes(group.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkConfig({...bulkConfig, groupIds: [...bulkConfig.groupIds, group.id]});
                            } else {
                              setBulkConfig({...bulkConfig, groupIds: bulkConfig.groupIds.filter(id => id !== group.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`bulk-group-${group.id}`} className="cursor-pointer">{group.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Exercises */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exercices de Français (Rotation)</Label>
                  <div className="flex flex-col gap-2">
                    {bulkConfig.francais.map((francaisId, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select
                          value={francaisId}
                          onValueChange={(v) => {
                            const newFrancais = [...bulkConfig.francais];
                            newFrancais[index] = v;
                            setBulkConfig({...bulkConfig, francais: newFrancais});
                          }}
                        >
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Choisir un exercice..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun</SelectItem>
                            {frenchSkills.map(skill => (
                              <SelectItem key={skill.slug} value={skill.slug}>{skill.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setBulkConfig({...bulkConfig, francais: bulkConfig.francais.filter((_, i) => i !== index)});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-dashed h-9 justify-start text-muted-foreground hover:text-primary"
                      onClick={() => setBulkConfig({...bulkConfig, francais: [...bulkConfig.francais, 'none']})}
                    >
                      <Plus className="h-4 w-4 mr-2" /> 
                      Ajouter un exercice à la rotation
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Exercices de Mathématiques (Rotation)</Label>
                  <div className="flex flex-col gap-2">
                    {bulkConfig.maths.map((mathId, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select
                          value={mathId}
                          onValueChange={(v) => {
                            const newMaths = [...bulkConfig.maths];
                            newMaths[index] = v;
                            setBulkConfig({...bulkConfig, maths: newMaths});
                          }}
                        >
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Choisir un exercice..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun</SelectItem>
                            {mathSkills.map(skill => (
                              <SelectItem key={skill.slug} value={skill.slug}>{skill.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setBulkConfig({...bulkConfig, maths: bulkConfig.maths.filter((_, i) => i !== index)});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-dashed h-9 justify-start text-muted-foreground hover:text-primary"
                      onClick={() => setBulkConfig({...bulkConfig, maths: [...bulkConfig.maths, 'none']})}
                    >
                      <Plus className="h-4 w-4 mr-2" /> 
                      Ajouter un exercice à la rotation
                    </Button>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground mt-1">
                    Les exercices sélectionnés s'alterneront à chaque nouveau jour de devoirs programmé.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Dictée / Orthographe</Label>
                  <div className="flex gap-2">
                    <Select
                      value={bulkConfig.orthographe}
                      onValueChange={(v) => setBulkConfig({...bulkConfig, orthographe: v})}
                    >
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Choisir une liste de départ..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {spellingLists.map(list => (
                          <SelectItem key={list.id} value={list.id}>{list.id} - {list.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={String(bulkConfig.weeksPerList)}
                      onValueChange={(v) => setBulkConfig({...bulkConfig, weeksPerList: parseInt(v)})}
                      disabled={bulkConfig.orthographe === 'none'}
                    >
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Durée..." /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} sem. / liste</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground mt-1">
                    La liste avancera d'un cran selon le rythme choisi (ex: toutes les 2 semaines).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notes / Consignes communes</Label>
                  <Textarea
                    placeholder="Ex: Apporter les affaires de piscine..."
                    value={bulkConfig.notes}
                    onChange={(e) => setBulkConfig({...bulkConfig, notes: e.target.value})}
                    className="h-24"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 flex justify-between border-t mt-6">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Sera appliqué à <strong>{bulkConfig.groupIds.length} groupe(s)</strong> sur <strong>{bulkConfig.weeks * bulkConfig.days.length} jours</strong>.
            </p>
            <Button onClick={handleBulkSave} disabled={isSaving || bulkConfig.days.length === 0 || bulkConfig.groupIds.length === 0} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lancer la programmation
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="md:col-span-1">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Calendrier</CardTitle>
                <CardDescription>Sélectionnez un jour pour voir ou modifier les devoirs.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                  showOutsideDays={false}
                  className="p-0"
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Détails du jour
                    <span className="text-sm font-normal text-muted-foreground">
                      • {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : '...'}
                    </span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs gap-2 text-primary hover:bg-primary/10 rounded-full"
                        onClick={toggleBulkMode}
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        Propager...
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Appliquer ces exercices sur plusieurs semaines</TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Direct
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {groups.length > 0 ? (
                  groups.map(group => {
                    const groupStudents = students.filter(s => s.groupId === group.id);
                    const groupAssignment = assignments[group.id] || {};

                    const francaisIcon = getSkillBySlug(groupAssignment.francais || '')?.icon;
                    const mathsIcon = getSkillBySlug(groupAssignment.maths || '')?.icon;
                    const isOrthoAssigned = groupAssignment.orthographe;

                    return (
                      <div key={group.id} className="p-5 bg-secondary/30 rounded-xl border border-secondary relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-xl flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Users className="h-5 w-5" />
                            </div>
                            {group.name}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Français</Label>
                            <Select
                              value={groupAssignment.francais || 'none'}
                              onValueChange={(value) => handleAssignmentChange(group.id, 'francais', value)}
                            >
                              <SelectTrigger className="bg-background"><SelectValue placeholder="Choisir un exercice..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Aucun</SelectItem>
                                {frenchSkills.map(skill => (
                                  <SelectItem key={skill.slug} value={skill.slug}>{skill.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Mathématiques</Label>
                            <Select
                              value={groupAssignment.maths || 'none'}
                              onValueChange={(value) => handleAssignmentChange(group.id, 'maths', value)}
                            >
                              <SelectTrigger className="bg-background"><SelectValue placeholder="Choisir un exercice..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Aucun</SelectItem>
                                {mathSkills.map(skill => (
                                  <SelectItem key={skill.slug} value={skill.slug}>{skill.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Dictée / Orthographe</Label>
                            <Select
                              value={groupAssignment.orthographe || 'none'}
                              onValueChange={(value) => handleAssignmentChange(group.id, 'orthographe', value)}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Choisir une liste et une session..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Aucune</SelectItem>
                                {spellingLists.map(list => (
                                  <Fragment key={list.id}>
                                    <SelectItem value={`${list.id}-lundi`}>{list.id} (Lundi) - {list.title}</SelectItem>
                                    <SelectItem value={`${list.id}-jeudi`}>{list.id} (Jeudi) - {list.title}</SelectItem>
                                  </Fragment>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Notes / Consignes</Label>
                            <Textarea
                              placeholder="Notes spécifiques pour ce jour..."
                              value={groupAssignment.notes || ''}
                              onChange={(e) => handleNotesChange(group.id, e.target.value)}
                              className="resize-none h-20 bg-background"
                            />
                          </div>
                        </div>

                        {groupStudents.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-secondary">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progression</span>
                              <div className="flex gap-3 text-xs text-muted-foreground font-semibold">
                                <span className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-green-500" /> Fait</span>
                                <span className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-red-500" /> En attente</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {groupStudents.map(student => {
                                const francaisStatus = getCompletionStatus(student.id, groupAssignment.francais);
                                const mathsStatus = getCompletionStatus(student.id, groupAssignment.maths);
                                const orthoStatus = getCompletionStatus(student.id, groupAssignment.orthographe ?? null);

                                return (
                                  <div key={student.id} className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-secondary/50 hover:border-primary/20 transition-colors">
                                    <span className="font-medium text-xs flex-grow truncate">{student.name}</span>
                                    <div className="flex gap-1">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={cn(
                                            "h-5 w-5 rounded flex items-center justify-center transition-colors",
                                            francaisStatus.status === 'completed' ? "bg-green-100 text-green-700" : francaisStatus.status === 'pending' ? "bg-red-50 text-red-400" : "bg-secondary/50 text-muted-foreground opacity-20"
                                          )}>
                                            {francaisIcon ? <div className="h-3 w-3">{francaisIcon}</div> : <div className="h-1 w-1 rounded-full bg-current" />}
                                          </div>
                                        </TooltipTrigger>
                                        {francaisStatus.status === 'completed' && francaisStatus.completedAt && (
                                          <TooltipContent><p>Français fait le {format(francaisStatus.completedAt, "d MMM, HH:mm", { locale: fr })}</p></TooltipContent>
                                        )}
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={cn(
                                            "h-5 w-5 rounded flex items-center justify-center transition-colors",
                                            mathsStatus.status === 'completed' ? "bg-green-100 text-green-700" : mathsStatus.status === 'pending' ? "bg-red-50 text-red-400" : "bg-secondary/50 text-muted-foreground opacity-20"
                                          )}>
                                            {mathsIcon ? <div className="h-3 w-3">{mathsIcon}</div> : <div className="h-1 w-1 rounded-full bg-current" />}
                                          </div>
                                        </TooltipTrigger>
                                        {mathsStatus.status === 'completed' && mathsStatus.completedAt && (
                                          <TooltipContent><p>Maths fait le {format(mathsStatus.completedAt, "d MMM, HH:mm", { locale: fr })}</p></TooltipContent>
                                        )}
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={cn(
                                            "h-5 w-5 rounded flex items-center justify-center transition-colors",
                                            orthoStatus.status === 'completed' ? "bg-green-100 text-green-700" : orthoStatus.status === 'pending' ? "bg-red-50 text-red-400" : "bg-secondary/50 text-muted-foreground opacity-20"
                                          )}>
                                            <BrainCircuit className="h-3 w-3" />
                                          </div>
                                        </TooltipTrigger>
                                        {orthoStatus.status === 'completed' && orthoStatus.completedAt && (
                                          <TooltipContent><p>Dictée faite le {format(orthoStatus.completedAt, "d MMM, HH:mm", { locale: fr })}</p></TooltipContent>
                                        )}
                                      </Tooltip>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 px-4 border-2 border-dashed rounded-2xl bg-secondary/10">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Veuillez d'abord créer des groupes d'élèves pour assigner des devoirs.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-secondary/5 p-6 rounded-b-xl">
                <Button onClick={handleSave} disabled={isSaving} className="px-8 shadow-md hover:shadow-lg transition-all gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer les modifications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
