# KURR - EXCHANGE ( A Currency Exchange Simulation API)

A Node.js/TypeScript-based API that simulates currency exchange operations with real-time progress tracking via WebSocket.

## Features

- Currency exchange simulation with multiple stages
- Real-time progress tracking via WebSocket
- Redis integration for data persistence
- Docker support for easy deployment
- Rate limiting and security middleware
- Comprehensive error handling
- Task retry mechanism

## Prerequisites

- Node.js (v19 or later)
- Redis
- Docker and Docker Compose (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Application

### Development Mode

Using npm:
```bash
npm run dev
```

Using Docker Compose:
```bash
docker-compose up
```

### Production Mode

Build and run:
```bash
npm run build
npm start
```

## API Endpoints

### 1. Simulate Currency Exchange

**POST** `/api/simulate-exchange`

Request body:
```json
{
  "baseCurrency": "USD",
  "targetCurrency": "EUR",
  "amount": 100
}
```

Response:
```json
{
  "taskId": "uuid-string"
}
```

### 2. Get Task Status

**GET** `/api/simulate-exchange/:taskId`

Response:
```json
{
  "status": "in_progress",
  "progress": 0.5,
  "result": {
    "conversionRate": 0.85,
    "exchangeAmount": 85
  }
}
```

### 3. Get All Tasks

**GET** `/api/simulate-exchange`

Response:
```json
[
  {
    "status": "completed",
    "progress": 1,
    "result": {
      "conversionRate": 0.85,
      "exchangeAmount": 85
    }
  }
]
```

## WebSocket Integration

Connect to the WebSocket endpoint and subscribe to task updates:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    taskId: 'your-task-id'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Task update:', data);
};
```

## Testing with Postman

1. Create a new request collection in Postman

2. Set up the following requests:

   a. **Simulate Exchange**
   - Method: POST
   - URL: `http://localhost:3000/api/simulate-exchange`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "baseCurrency": "USD",
     "targetCurrency": "EUR",
     "amount": 100
   }
   ```

   b. **Get Task Status**
   - Method: GET
   - URL: `http://localhost:3000/api/simulate-exchange/:taskId`
   (Replace `:taskId` with the actual task ID received from the simulation request)

   c. **Get All Tasks**
   - Method: GET
   - URL: `http://localhost:3000/api/simulate-exchange`

3. For WebSocket testing, use Postman's WebSocket Request:
   - URL: `ws://localhost:3000`
   - After connecting, send:
   ```json
   {
     "type": "subscribe",
     "taskId": "your-task-id"
   }
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Development Tools

- ESLint for code linting:
```bash
npm run eslint
```

- Prettier for code formatting (runs with ESLint)

## Docker Support

Build the image:
```bash
docker build -t currency-exchange-api .
```

Run the container:
```bash
docker run -p 3000:3000 currency-exchange-api
```

## Project Structure

```
src/
├── api/
│   ├── middleware/
│   └── simulate-exchange/
├── core/
│   ├── config/
│   ├── errors/
│   ├── infrastructure/
│   ├── lib/
│   ├── types/
│   └── utils/
└── index.ts
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


