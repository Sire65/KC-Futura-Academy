(()=>{
  'use strict';
  const catalog=window.KCAdaptiveQuizCatalog||(window.KCAdaptiveQuizCatalog={});
  const variant=(question,answers,correct,repeat,seconds)=>({question,answers,correct,repeat,estimatedSeconds:seconds,reviewStatus:'author_review'});
  Object.assign(catalog,{
    'academy:mantaplatte:1':{
      meta:{moduleId:'mantaplatte',moduleTitle:'Kalle und die Manta-Platte',sceneIndex:1,speaker:'Kalle',status:'author_review',source:'episode_23'},
      beginner:variant('Wie lässt sich Kalles Spruch am besten einordnen?',['Als freundlicher, humorvoller Hinweis – solange niemand abgewertet wird.','Als Beweis, dass das Team die eigenen Gerichte nicht mag.','Als Grund, den Mitgliedern fremdes Essen zu verbieten.'],0,'Richtig. Humor darf verbinden und sollte respektvoll bleiben.',20),
      advanced:variant('Wann stärkt eine humorvolle Bemerkung das Miteinander?',['Wenn sie freundlich bleibt, zur Situation passt und niemanden bloßstellt.','Wenn alle darüber lachen, auch wenn eine Person sich unwohl fühlt.','Wenn sie nur außerhalb der Arbeitszeit ausgesprochen wird.'],0,'Richtig. Wirkung, Respekt und Situation entscheiden über guten Humor.',30),
      expert:variant('Welche Bewertung berücksichtigt Humor und Teamkultur gleichermaßen?',['Kalles Neckerei kann verbinden, sofern sie erkennbar freundlich bleibt, keine Leistung abwertet und die Reaktion der Beteiligten respektiert.','Humor ist im Team grundsätzlich unproblematisch, wenn er von einem Stammgast kommt.','Die Bemerkung ist nur dann angemessen, wenn das Team vorher ausdrücklich zugestimmt hat.'],0,'Richtig. Guter Humor verbindet Freiheit mit Aufmerksamkeit für seine Wirkung.',45)
    },
    'academy:mantaplatte:2':{
      meta:{moduleId:'mantaplatte',moduleTitle:'Kalle und die Manta-Platte',sceneIndex:2,speaker:'Hannes',status:'author_review',source:'episode_23'},
      beginner:variant('Welche Aussage trifft den Kern der Situation?',['Wer auswärts isst, steht nicht hinter der eigenen Küche.','Abwechslung nach einer langen Schicht ist normal und mindert die Wertschätzung der eigenen Gerichte nicht.','Clubmitglieder sollten nur essen, was am eigenen Stand angeboten wird.'],1,'Genau. Abwechslung und Stolz auf die eigene Arbeit passen zusammen.',20),
      advanced:variant('Warum ist das andere Essen kein Widerspruch zur eigenen Arbeit?',['Weil die Mitglieder ihre Gerichte nur für Gäste kochen.','Weil häufiger Umgang mit denselben Speisen den Wunsch nach Abwechslung verständlich macht.','Weil Currywurst grundsätzlich besser für Beschäftigte geeignet ist.'],1,'Genau. Vertrautheit mit den eigenen Speisen kann den Wunsch nach Abwechslung auslösen.',30),
      expert:variant('Welche Schlussfolgerung beschreibt die Situation am treffendsten?',['Die private Essenswahl nach der Schicht erlaubt keine Aussage über die fachliche Überzeugung oder Wertschätzung der eigenen Küche.','Mitglieder sollten fremde Speisen nur außerhalb des Weihnachtsmarktes essen, um ein einheitliches Bild zu wahren.','Die Wahl einer anderen Speise ist nur dann unproblematisch, wenn am eigenen Stand nichts mehr verfügbar ist.'],0,'Richtig. Private Abwechslung und professionelle Identifikation sind voneinander zu unterscheiden.',45)
    }
  });
})();
