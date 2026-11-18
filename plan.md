# Plan — Refonte Cartes scolaires

## Produit et périmètre

Refondre la base Next.js extraite de `idcards.rar` en un prototype SaaS cohérent et montrable, livré en ZIP. La base a déjà une landing, les pages de tableau de bord/import/élèves/génération/école, les six gabarits recto/verso et deux classeurs exemples. Réutiliser l’existant plutôt que repartir de zéro.

### Import, d’après les classeurs utilisateurs

- Format 1 : onglets `Instructions` et `Eleves`; colonnes `matricule, nom, prenoms, date_naissance, lieu_naissance, sexe, classe, annee_scolaire, photo, telephone_parent`. Champs obligatoires (en-têtes bleu foncé) : matricule, nom, prenoms, date_naissance, sexe et classe; lieu_naissance, annee_scolaire, photo et telephone_parent sont facultatifs (en-têtes gris).
- Format 2 : même schéma sans `classe` dans `Eleves`; les champs obligatoires sont matricule, nom, prenoms, date_naissance et sexe. Onglet `Classe` avec `classe` en A1/B1 et `annee_scolaire` en A2/B2. Plusieurs classeurs peuvent être déposés en une seule fois.
- Interpréter les rangées d’exemple dont le matricule commence par `EX-` comme exemples (et les signaler), pas comme élèves réels. Le modèle prévoit jusqu’à 1000 élèves par fichier.
- Les photos restent séparées, dans un ZIP, et sont associées par le nom indiqué en colonne `photo` (normalement `matricule.jpg`). Prévisualiser les correspondances et signaler les photos manquantes/orphelines avant de confirmer.
- Valider les dates obligatoires, champs requis, doublons de matricule, feuilles et colonnes obligatoires selon le modèle. Montrer chaque erreur avec fichier et ligne. Le téléphone du parent ne s’affiche jamais sur les cartes par défaut; le consentement et la conformité mineurs nécessitent une revue avant production.

### Parcours d’application

Landing page → connexion/démo → tableau de bord → import par format → aperçu/rapport → répertoire filtrable → sélection classe et modèle → aperçu recto/verso → réglages école → génération/impression. Inclure état vide, erreurs et transitions lisibles. La démonstration persiste localement côté navigateur; ne pas simuler la persistance serveur ni présenter les routes d’authentification comme production-ready.

### Cartes et exports

Conserver six directions visuelles distinctes et les améliorer : Classique, Moderne, Premium, Minimal, Coloré, Institutionnel. Séparer apparence, portrait/paysage CR80, classeur scolaire et format papier. Afficher au minimum identité élève, matricule, classe et année scolaire; le nom/date/lieu de naissance restent des champs optionnels. Remplacer les QR de vérification non implémentés par un matricule visible; ne jamais imprimer la date de naissance ni le téléphone parent. Fournir une impression HTML calibrée / export à imprimer depuis le navigateur, avec indication de limites si un PDF serveur n’est pas implémenté.

## Mise en œuvre

- Réutiliser les routes, composants et styles existants extraits du projet utilisateur et les migrer dans le projet Webdev initialisé en TypeScript/Next.js.
- Ajouter un lecteur XLSX limité aux modèles joints, basé sur JSZip et le parseur XML natif du navigateur, ainsi que l’extraction ZIP des portraits; aucun téléchargement d’image n’est nécessaire pour les portraits de démonstration. Éviter toute transmission réelle de données personnelles dans une API inexistante.
- Conserver les fichiers officiels comme téléchargements publics de l’application. Le tableau de bord peut exploiter les exemples fictifs existants et sauvegarder les imports en localStorage pour le prototype.
- Ajouter les routes statiques publiques `/manus-routes.json` synchronisées avec les routes de pages existantes.
- Fournir README français : installation, lancement, limitations actuelles et évolution ultérieure vers authentification, PostgreSQL/MySQL, stockage objet et PDF serveur. Le projet initial contient déjà schéma Prisma/PostgreSQL et Docker; le prototype n’installe pas de stockage externe.

## Structure

- `src/app/` : landing, auth de démonstration et pages d’espace école.
- `src/components/cards/` : six modèles de carte, preview et outils partagés.
- `src/components/app/` et `src/components/landing/` : navigation/tableau de bord et sections publiques.
- `src/lib/` : types de cartes, données démo, normalisation et validation des imports.
- `public/modeles/` : les deux classeurs fournis, sans modification de structure.
- `prisma/`, `Dockerfile`, `docker-compose.yml` : assets de démarrage à conserver comme orientation, en indiquant que l’authentification et la persistance ne sont pas implémentées dans cette itération.

## Design

Styles considérés : atelier scolaire contemporain (0,07), institutionnel éditorial (0,06), SaaS pastel illustratif (0,05). Choix : atelier scolaire contemporain.

- **Mouvement** : design de produit B2B contemporain, réchauffé par les codes d’un atelier d’impression scolaire.
- **Principes** : hiérarchie claire; données vérifiables; identité chaleureuse sans infantiliser; états d’action explicites.
- **Couleurs** : encre bleu nuit pour stabilité, jade comme accent reconnaissable pour progression/action, papier cassé et gris ardoise pour calmer l’interface; couleurs vives réservées aux classes et aux modèles.
- **Mise en page** : navigation latérale compacte, large zone de travail, composition asymétrique et panneau d’aperçu pour l’import et les cartes; responsive mobile avec navigation horizontale.
- **Signatures** : indicateur d’étapes numérotées; ruban de progression de dossier/import; repères de coupe subtils dans l’espace d’impression.
- **Interactions** : les actions principales montrent leur état et leur effet; erreurs affichent ligne et correction attendue; sélection de modèle met à jour l’aperçu directement.
- **Animation** : transitions de 150–220 ms sur survol, sélection et ouverture; aucune animation décorative permanente; respect de `prefers-reduced-motion`.
- **Typographie** : système de police locale/native, titres sobres et grands, données/tableaux en sans-serif très lisible avec chiffres tabulaires.
- **Essence de marque** : des listes d’école aux cartes prêtes à imprimer, sans ressaisie; caractères : précis, rassurant, pratique.
- **Voix** : directives concrètes, jamais prétendre qu’une étape est terminée si elle ne l’est pas. Exemples : « Vérifiez les portraits avant de valider. » « Chaque ligne correspond à un élève; les erreurs restent modifiables. »
- **Logo** : monogramme original de deux cartes superposées avec un coin en découpe évoquant à la fois fiche d’école et badge.
- **Couleur de marque** : jade profond (accent) associé au bleu encre.

## Dépendances

Next.js/React/TypeScript/Tailwind existants, `xlsx` pour classeurs Excel, `jszip` pour photos ZIP, JSZip assure la lecture sécurisée des classeurs ZIP/XLSX et des ZIP de photos; les tableaux XML natifs du navigateur évitent une dépendance Excel plus risquée. Aucun QR fictif, PDF serveur ou stockage base de données n’est intégré; l’implémentation immédiate reste locale au navigateur.
