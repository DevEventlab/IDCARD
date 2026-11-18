# TODO — Refonte Cartes scolaires

## 1. Landing page et identité visuelle

- [x] Remplacer l’apparence générique par la direction « atelier scolaire contemporain » validée : bleu encre, jade, papier clair, hiérarchie typographique nette, monogramme dédié.
- [x] Expliquer en français le fonctionnement réel : import → vérification → aperçu → impression.
- [x] Présenter les deux formats Excel, l’association séparée des photos et les six modèles.
- [x] Rendre la navigation, les appels à l’action, les états focus et la mise en page responsive cohérents.

## 2. Import des modèles Excel et photos

- [x] Respecter le format 1 fourni : feuilles `Instructions` et `Eleves`; en-têtes `matricule`, `nom`, `prenoms`, `date_naissance`, `lieu_naissance`, `sexe`, `classe`, `annee_scolaire`, `photo`, `telephone_parent`.
- [x] Respecter le format 2 fourni : feuilles `Instructions`, `Eleves`, `Classe`; dans `Eleves`, mêmes en-têtes sauf `classe`; dans `Classe`, lire `classe` en A1/B1 et `annee_scolaire` en A2/B2.
- [x] Pour le format 1 accepter un classeur pour toute l’école; pour le format 2 accepter plusieurs classeurs, un par classe, dans un lot.
- [x] Lire réellement le classeur avant d’afficher les lignes/erreurs; ne pas afficher de faux rapports de validation.
- [x] Traiter les matricules d’exemple `EX-...` comme des exemples à exclure et signaler; ne pas les importer comme de vrais élèves.
- [x] Associer les photos du ZIP sur la valeur exacte de la colonne `photo`, afficher la correspondance de chaque photo et signaler les fichiers manquants ou non utilisés.
- [x] Valider les colonnes et feuilles requises, les dates et les matricules en doublon; indiquer fichier + numéro de ligne + correction attendue.
- [x] Ne pas exposer le téléphone du parent sur les cartes; minimiser les données visibles et ne pas envoyer les fichiers à un serveur non implémenté.

## 3. Répertoire et contrôle des élèves

- [x] Présenter les élèves importés avec recherche, filtres par classe et indicateurs de photo/carte.
- [x] Rendre explicites l’état vide et le traitement des imports locaux dans ce prototype.
- [x] Permettre de sélectionner une classe / l’ensemble de l’école et un sous-ensemble d’élèves pour la génération.

## 4. Six modèles et génération

- [x] Conserver six gabarits : Classique, Moderne, Premium, Minimal, Coloré et Institutionnel; différencier réellement composition et hiérarchie.
- [x] Améliorer leur lisibilité, le contraste, le rendu photo, logo, matricule et classe; gérer données optionnelles sans débordement.
- [x] Proposer sélection du modèle, aperçus recto/verso et aperçu réactif.
- [ ] Valider le calibrage physique sur imprimantes d’école et ajouter les repères de coupe; l’impression navigateur A4/CR80 est présente, mais le PDF serveur et l’impression recto-verso restent à développer.
- [x] Ne pas prétendre qu’un PDF serveur ou qu’un QR de vérification réel est généré si ce n’est pas le cas.

## 5. Espace école et qualité des données

- [x] Améliorer le tableau de bord, la navigation, la page élèves, les paramètres école, les messages, les badges et les états d’action.
- [x] Gérer correctement noms/lieux/date optionnels et champs d’élève issus des deux modèles.
- [x] Ajouter un avertissement de périmètre : authentification, base multi-écoles et stockage sécurisé restent à implémenter avant exploitation SaaS publique.

## 6. Livraison du code

- [x] Inclure les deux fichiers Excel joints sans casser leurs onglets ou colonnes.
- [x] Ajouter README français et instructions d’installation/démarrage, limitations et prochaines étapes production.
- [x] Tenir `/manus-routes.json` cohérent avec les routes de pages.
- [x] Vérifier installation, diagnostics TypeScript, build de production, audit de dépendances; retirer les artefacts locaux `.next`/`node_modules` de l’archive.
- [x] Remettre le projet source et les modèles joints sous forme d’une archive ZIP téléchargeable.
