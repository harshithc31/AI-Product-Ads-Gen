# AI-Product-Ads-Gen

An AI-powered tool to generate high-quality product ad images and short product videos from a user-uploaded product image and a short description. The backend uses ImageKit for image hosting, Google Gemini (Gemini text models) for prompt generation, Imagen for image generation, and Imagen Video (if available) for video generation. Firestore is used to track user requests and store metadata. The project is built with Next.js (App Router) and TypeScript.

## Features

Upload a product image and description.

Generate a stylized product ad image using Google's Imagen model.

Generate a short product video (image → video) using Imagen Video (if enabled for your API key).

Stores original and generated assets on ImageKit.

Stores request metadata in Firestore (user-ads collection).

Basic rate/plan handling via Firestore user records (fallback defaults included).

## Tech stack

Next.js (App Router)

TypeScript

Node.js

Firebase Firestore

ImageKit (image hosting)

Google @google/generative-ai (Gemini, Imagen, Imagen Video)

ImageKit SDK

Axios / fetch

## How it works (high level)

Frontend uploads an image + description to /api/generate-product-image (multipart/form-data).

Server uploads the original image to ImageKit to get a stable URL.

Server calls Gemini (text model) to generate JSON prompts { textToImage, imageToVideo }.

Server calls Imagen (image model) with textToImage to generate a final ad image (base64).

Server uploads generated image to ImageKit and updates Firestore (user-ads doc) with URLs, status.

Optionally call imagen-video-001 / Veo (if available) to convert the generated image → short video using imageToVideo prompt.

## Prerequisites

Node.js v18+

NPM or Yarn

Google account with access to Google AI Studio / Generative AI API (Gemini + Imagen + Imagen Video access)

ImageKit account (public & private keys + URL endpoint)

Firebase project with Firestore enabled

Git and GitHub account

(Optional) Vercel account for easy Next.js deployment

## Quickstart (local development)

### 1. Clone the repository:

git clone https://github.com/{your-username}/{your-repo}.git
cd {your-repo}

### 2. Install dependencies:

npm install
or
pnpm install
yarn

### 3. Copy .env.example (or create .env.local) and add your secrets.

### 4. Start dev server:

npm run dev
default: http://localhost:3000

### 5. Test the main endpoint locally (example using curl):
curl -X POST "http://localhost:3000/api/generate-product-image" \
-F "file=@/path/to/product.png" \
-F "description=Fresh citrus hand wash" \
-F "size=1024x1024" \
-F "userEmail=you@example.com"

## HAPPY CODING!
