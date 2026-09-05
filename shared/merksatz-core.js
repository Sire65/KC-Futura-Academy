// Kernlogik des Lösungssatz-Systems, Version 2 (Kreuzworträtsel-Prinzip).
// Buchstaben (nicht Wörter) werden an ZUFÄLLIGEN, nicht-fortlaufenden Stellen freigeschaltet,
// damit ein Teil-Fortschritt nicht auf den Rest schließen lässt. Auslöser: abgeschlossene Kapitel
// der Kassenschulung (Teil 1, 19 Kapitel) UND abgeschlossene Academy-Folgen (Teil 2, 35 Folgen) -
// zusammen 54 mögliche Auslöser. Liest ausschließlich aus den BESTEHENDEN Fortschritts-Speichern
// (kc_training_profile_v0254, kcAcademyCompleted), keine eigene zweite Fortschrittsspur.
(function () {
  const SPEICHER_SCHLUESSEL = 'kcMerksatzZuordnungV2';
  const ACADEMY_MODUL_IDS = ['reklamation','jugend','konflikt','rechenfehler','gas','fundsache','mettwurst','probierschluck','hund','allergene','hygiene','vegetarisch','wechselgeld','geldboerse','leo','kind','nachbarstand','anlieferung','vorplatz','parkgenehmigung','kalleblick','mantaplatte','rueckstellprobe','gemeinsam','koslowski_geruch','kinderbetreuung','wasserschlauch','freundliches_wort','zwei_euro','bereitschaft','barzahlung','panne','verbandskasten','papiertuete','finale'];
  const ANZAHL_KASSENSCHULUNG_KAPITEL = 19;

  function alleMoeglichenAusloeser() {
    const training = Array.from({ length: ANZAHL_KASSENSCHULUNG_KAPITEL }, (_, i) => `training-${i + 1}`);
    return [...training, ...ACADEMY_MODUL_IDS];
  }

  function mische(liste) {
    const kopie = [...liste];
    for (let i = kopie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
  }

  function neueZuordnungErzeugen() {
    const pool = window.KC_MERKSATZ_POOL || [];
    const satz = pool[Math.floor(Math.random() * pool.length)] || '';
    const buchstabenPositionen = [];
    for (let i = 0; i < satz.length; i++) { if (satz[i] !== ' ') buchstabenPositionen.push(i); }
    const gemischtePositionen = mische(buchstabenPositionen);
    const gemischteAusloeser = mische(alleMoeglichenAusloeser()).slice(0, gemischtePositionen.length);
    const zuordnung = {};
    gemischteAusloeser.forEach((ausloeserId, index) => { zuordnung[ausloeserId] = gemischtePositionen[index]; });
    return { satz, zuordnung, erstelltAm: new Date().toISOString() };
  }

  function eigeneZuordnung() {
    try {
      const gespeichert = JSON.parse(localStorage.getItem(SPEICHER_SCHLUESSEL) || 'null');
      if (gespeichert && gespeichert.satz && gespeichert.zuordnung) return gespeichert;
    } catch {}
    const neu = neueZuordnungErzeugen();
    try { localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(neu)); } catch {}
    return neu;
  }

  function abgeschlosseneAcademyModule() {
    try { return JSON.parse(localStorage.getItem('kcAcademyCompleted') || '{}'); } catch { return {}; }
  }

  function abgeschlosseneKassenschulungKapitel() {
    try {
      const profil = JSON.parse(localStorage.getItem('kc_training_profile_v0254') || '{}');
      return (profil.quickDone || []).length + (profil.advancedDone || []).length;
    } catch { return 0; }
  }

  function ausloeserErfuellt(ausloeserId) {
    if (ausloeserId.startsWith('training-')) {
      const noetig = Number(ausloeserId.split('-')[1]);
      return abgeschlosseneKassenschulungKapitel() >= noetig;
    }
    return !!abgeschlosseneAcademyModule()[ausloeserId];
  }

  function fortschritt() {
    const zuordnung = eigeneZuordnung();
    const positionenFrei = new Set();
    Object.keys(zuordnung.zuordnung).forEach(ausloeserId => {
      if (ausloeserErfuellt(ausloeserId)) positionenFrei.add(zuordnung.zuordnung[ausloeserId]);
    });
    const anzeige = zuordnung.satz.split('').map((zeichen, index) => {
      if (zeichen === ' ') return { zeichen: ' ', sichtbar: true };
      return { zeichen, sichtbar: positionenFrei.has(index) };
    });
    const gesamtBuchstaben = zuordnung.satz.replace(/ /g, '').length;
    return { anzeige, anzahlFrei: positionenFrei.size, gesamt: gesamtBuchstaben, vollstaendig: positionenFrei.size === gesamtBuchstaben, satz: zuordnung.satz };
  }

  function feierBereitsGezeigt() { return localStorage.getItem('kcMerksatzFeierGezeigt') === '1'; }
  function feierAlsGezeigtMarkieren() { try { localStorage.setItem('kcMerksatzFeierGezeigt', '1'); } catch {} }

  window.KCMerksatz = { fortschritt, eigeneZuordnung, feierBereitsGezeigt, feierAlsGezeigtMarkieren };
})();
