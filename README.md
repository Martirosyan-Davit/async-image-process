# Image Processing Service

This service allows uploading an image, splitting it into 4 equal parts, applying blur along the inner edges (cut lines), and combining them back into a single image. The result is saved and returned with metadata.

---

## 🛠️ Tech Stack

- **NestJS** — backend framework
- **Sharp** — high-performance image processing
- **TypeScript** — static typing
- **Node.js** — runtime

---# Parallel Image Processing with BullMQ

This implementation provides a solution for parallel image processing using NestJS, BullMQ, and Redis.

## Features

- Parallel image processing with multiple worker processes
- Non-blocking asynchronous operations
- Queue-based task management with BullMQ
- Error handling and retry mechanism
- Scalable architecture

## Components

1. **ImageProcessService**: Core service for image generation and processing
2. **ImageProcessQueueService**: Handles parallel processing using BullMQ queues and workers
3. **FileService**: Provides both synchronous and asynchronous image processing APIs
4. **FileController**: Exposes REST endpoints for image processing

## API Endpoints

- **POST /api/files**: Process images synchronously (blocking)
- **POST /api/files/async**: Process images asynchronously with parallel workers

## Environment Variables

```
# Application
PORT=3000
NODE_ENV=development
ENABLE_DOCUMENTATION=true

# Stable Diffusion API
SD_API_URL=http://localhost:7860

# Redis settings for BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## How It Works

1. When a request comes to the async endpoint, it's immediately added to a BullMQ queue
2. Multiple worker processes (default: 2) pick up jobs from the queue
3. Each worker processes an image independently and in parallel
4. Results are communicated back to the main process via callbacks
5. The main process isn't blocked and can handle additional requests

## Performance Benefits

- Parallel processing of multiple images simultaneously
- Non-blocking main thread allows handling more requests
- Queue-based approach prevents system overloading
- Built-in retry mechanism for failed jobs

## Scaling

You can adjust the number of workers by changing the `WORKERS_COUNT` constant in the `ImageProcessQueueService` class.