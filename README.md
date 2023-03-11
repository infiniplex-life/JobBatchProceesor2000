# Intro

Folder `ai-tool` for frontend
Folder `backend` for backend

## Installation

Currently, develop with nodejs v14.17.0

Install package for `ai-tool`

```bash
cd ai-tool
npm install
```
Install package for `backend`

```bash
cd backend
npm install
```
## Usage
Default backend connect with RabbitMq with port 5672,
If you want to change port or url connection to rabbitMq, please change `RABBITMQ_URL` in /backend/config.js

Run `ai-tool`
```
cd ai-tool
npm run build
npm run start
```

Run `backend`
```
cd backend
npm run start
```
