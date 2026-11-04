# PFMEA workspace

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Custom enterprise application for manufacturing process documentation and risk analysis. The requested surfaces are the employee login and the authenticated module launcher.

## Capabilities and Constraints

Existing React, TypeScript, Vite application. Preserve login, email password recovery, six-digit recovery code, Spanish/English localization, and existing module destinations: process flows, PFMEA, products and auxiliary catalogs. Preserve existing authentication and route authorization.

## Brand Commitments

Adler Pelzer Group is the organization displayed in the existing login. The user requested a modern, minimal, practical enterprise design and confirmed a light ground with corporate blue, retaining dark-mode compatibility.

## Evidence on Hand

Product capabilities and existing organization name are evidenced in src/pages/LoginPage.tsx, src/pages/WelcomePage.tsx and src/routes/AppRoutes.tsx. No supplied marketing photography or performance statistics; do not invent either.

## Product Principles

- Put the employee's next task first.
- Keep form states and recovery actions understandable.
- Use the existing product's terminology in both supported languages.
- Scope the redesign to login and welcome; preserve surrounding application behavior.
