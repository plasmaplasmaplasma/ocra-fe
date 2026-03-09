# Ocra Frontend

Small project I'm doing to learn **Nuxt** and **Vue**.

## About

Ocra is a real estate automation platform designed to streamline the workflow of real estate agents by matching:

- **Sellers** - Clients looking to sell their properties
- **Buyers** - Clients searching for their ideal home
- **Agent Portfolios** - Personal property listings managed by the agent

## Tech Stack

- **Nuxt** 
- **TypeScript** 
- **Tailwind CSS** 
- **Shadcn/Nuxt** 
- **Nuxt Auth Utils** 
- **Zod** 

## Project Structure

https://nuxt.com/docs/4.x/directory-structure

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```bash
NUXT_SESSION_PASSWORD=your-session-secret-key
OCRA_API_URL=http://localhost:8000
```

## Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Build

Build the application for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```