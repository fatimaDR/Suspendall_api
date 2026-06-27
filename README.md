# 🍔 Suspendall

<div align="center">

# Suspendall

### Une plateforme solidaire permettant d'offrir des repas aux personnes dans le besoin.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![Firebase](https://img.shields.io/badge/Firebase-Notifications-FFCA28?logo=firebase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)
![PayPal](https://img.shields.io/badge/PayPal-Payments-00457C?logo=paypal)
![License](https://img.shields.io/badge/License-MIT-green)

**Une application qui connecte les donateurs, les commerces et les bénéficiaires afin de lutter contre la précarité alimentaire.**

</div>

---

# 📖 Présentation

Suspendall app est une plateforme permettant aux utilisateurs de financer des repas qui seront ensuite récupérés gratuitement par des bénéficiaires auprès des commerces partenaires.

L'application met en relation plusieurs acteurs :

* ❤️ Les donateurs
* 🍔 Les commerces partenaires
* 🤝 Les bénéficiaires
* 👨‍💼 Les administrateurs

L'objectif est de simplifier les dons alimentaires tout en assurant une gestion sécurisée des paiements, des réservations et des notifications.

---

# ✨ Fonctionnalités

## 👤 Gestion des utilisateurs

* Inscription
* Authentification sécurisée
* Gestion des profils
* Modification des informations
* Suppression du compte
* Historique des commandes

---

## 🍔 Gestion des commerces

* Création de commerces
* Validation par l'administrateur
* Gestion des produits
* Gestion du stock
* Tableau de bord commerçant
* Statistiques des ventes
* Historique des commandes

---

## ❤️ Dons de repas

* Consultation des commerces
* Recherche par ville
* Recherche par catégorie
* Ajout au panier
* Panier multi-commerces
* Paiement sécurisé
* Confirmation automatique

---

## 🎁 Réservation des repas

Les bénéficiaires peuvent :

* Réserver un repas
* Consulter leurs réservations
* Annuler une réservation
* Suivre le temps restant
* Valider la récupération du repas
* Noter le commerce

---

## 💳 Paiements sécurisés

Le projet intègre plusieurs solutions de paiement :

* Stripe
* PayPal

Les paiements prennent en charge :

* Calcul HT / TVA / TTC
* Frais Stripe
* Dons complémentaires
* Historique des paiements

---

## 🔔 Notifications en temps réel

Grâce à Firebase Cloud Messaging :

* Notification lorsqu'un repas est disponible
* Notification lors d'une réservation
* Notification après récupération
* Notifications administrateur

---

## 📧 Gestion des emails

Envoi automatique de courriels :

* Confirmation d'inscription
* Vérification d'email
* Confirmation de paiement
* Confirmation de commande
* Validation des commerces
* Notifications diverses

---

## 📄 Génération de documents PDF

Le système permet de générer automatiquement :

* Factures
* Reçus de paiement
* Récapitulatifs des commandes
* Documents administratifs

---

## 📊 Dashboard Administrateur

* Gestion des utilisateurs
* Gestion des commerces
* Validation des comptes
* Gestion des campagnes
* Gestion des statistiques
* Export des données
* Visualisation des indicateurs

---

# 🛠️ Stack Technique

## Backend

* NestJS
* TypeScript
* REST API
* JWT Authentication
* Guards
* Validation Pipes

---

## Base de données

* MySQL

---

## Paiements

* Stripe API
* PayPal API

---

## Notifications

* Firebase Cloud Messaging (FCM)

---

## Emails

* Nodemailer

---

## Génération de PDF

* PDFKit / PDF Generator

---

## Authentification

* JWT
* Bcrypt

---

# 🏗️ Architecture

```text
                Client Mobile / Web
                        │
                        ▼
                 REST API (NestJS)
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 Authentication     Payments        Notifications
   JWT/Bcrypt    Stripe / PayPal      Firebase
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
                  Business Services
                        │
                        ▼
                    MySQL Database
                        │
                        ▼
          Emails • PDF • Reporting • Dashboard
```

---

# 📁 Structure du projet

```text
src/
│
├── auth/
├── users/
├── commerces/
├── beneficiaries/
├── donors/
├── orders/
├── payments/
├── notifications/
├── emails/
├── pdf/
├── dashboard/
├── common/
├── config/
└── main.ts
```

---

# 🚀 Fonctionnement

1. Un utilisateur crée un compte.
2. Il consulte les commerces partenaires.
3. Il choisit un ou plusieurs repas.
4. Il effectue son paiement via Stripe ou PayPal.
5. Le stock est automatiquement mis à jour.
6. Le bénéficiaire réserve le repas.
7. Le commerce valide la récupération.
8. Toutes les parties reçoivent les notifications appropriées.

---

# 🔒 Sécurité

* Authentification JWT
* Hash des mots de passe avec Bcrypt
* Validation des données
* Gestion des rôles
* Protection des routes
* Sécurisation des paiements

---

# 📊 Fonctionnalités administratives

* Gestion des utilisateurs
* Gestion des commerces
* Gestion des bénéficiaires
* Gestion des dons
* Gestion des campagnes solidaires
* Tableau de bord analytique
* Export CSV / Excel
* Statistiques globales

---

# 🌍 Évolutions prévues

* Application mobile
* Carte interactive
* Géolocalisation
* QR Code pour la récupération
* Tableau de bord analytique avancé
* Rapports PDF avancés
* Tableau de statistiques temps réel

---

# 🤝 Contribution

Les contributions sont les bienvenues.

1. Fork du projet
2. Créer une branche
3. Développer votre fonctionnalité
4. Commit
5. Pull Request

---

# 📄 Licence

Ce projet est distribué sous licence **MIT**.

---

<div align="center">

### ❤️ Développé avec NestJS, MySQL, Firebase, Stripe et PayPal.

**Ensemble, rendons les dons alimentaires plus simples, plus rapides et plus accessibles.**

</div>
