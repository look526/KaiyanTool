# Model Preference API Documentation

## Overview

The Model Preference API provides endpoints for managing AI model preferences, usage tracking, and configuration history. This API allows users to:

- Set default models for different content types
- Record model usage for analytics
- Configure model parameters
- Test model availability
- View configuration history and analytics

## Base URL

```
/api/model-preferences
```

## Authentication

All endpoints require Bearer token authentication in the Authorization header:

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Get User Preferences

Returns the current user's model preferences including default models, last used models, and parameters.

**Endpoint:** `GET /api/model-preferences`

**Response:**
```json
{
  "defaultModels": {
    "text": "model-id-1",
    "image": "model-id-2"
  },
  "lastUsedModels": {
    "text": "model-id-1",
    "script": "model-id-3"
  },
  "modelParameters": {
    "text": {
      "temperature": 0.7,
      "maxTokens": 1000
    }
  }
}
```

### 2. Set Default Models

Sets the default AI models for one or more content types.

**Endpoint:** `POST /api/model-preferences/default`

**Request Body:**
```json
{
  "defaultModels": {
    "text": "model-id-1",
    "image": "model-id-2",
    "video": "model-id-3"
  }
}
```

**Valid Content Types:**
- `text`
- `image`
- `video`
- `audio`
- `script`
- `novel`
- `storyline`
- `outline`

**Response:**
```json
{
  "defaultModels": {
    "text": "model-id-1",
    "image": "model-id-2",
    "video": "model-id-3"
  }
}
```

### 3. Record Model Usage

Records when a model is used for generating content. This is automatically called by the ModelSelector component.

**Endpoint:** `POST /api/model-preferences/usage`

**Request Body:**
```json
{
  "modelId": "model-id-1",
  "contentType": "text",
  "success": true,
  "duration": 1500,
  "tokensUsed": 256
}
```

**Fields:**
- `modelId` (required): ID of the model used
- `contentType` (required): Type of content generated
- `success` (optional, default: true): Whether the generation succeeded
- `duration` (optional): Duration in milliseconds
- `tokensUsed` (optional): Number of tokens used

**Response:**
```json
{
  "lastUsedModels": {
    "text": "model-id-1"
  }
}
```

### 4. Get Model Parameters

Retrieves the configured parameters for a specific content type.

**Endpoint:** `GET /api/model-preferences/parameters/:contentType`

**URL Parameters:**
- `contentType`: Content type to get parameters for

**Response:**
```json
{
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "topP": 0.9
  }
}
```

### 5. Set Model Parameters

Configures parameters for a specific content type.

**Endpoint:** `POST /api/model-preferences/parameters`

**Request Body:**
```json
{
  "contentType": "text",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "topP": 0.9
  }
}
```

**Response:**
```json
{
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "topP": 0.9
  }
}
```

### 6. Test Model

Tests whether a model is accessible and ready to use.

**Endpoint:** `POST /api/model-preferences/test`

**Request Body:**
```json
{
  "modelId": "model-id-1",
  "testPrompt": "Hello, world!"
}
```

**Fields:**
- `modelId` (required): ID of the model to test
- `testPrompt` (optional): Prompt to use for testing

**Response (Success):**
```json
{
  "success": true,
  "message": "Model is accessible",
  "model": {
    "id": "model-id-1",
    "name": "gpt-4",
    "type": "text",
    "capabilities": ["text-generation", "code"]
  }
}
```

**Response (Error):**
```json
{
  "error": "Model not found"
}
```

### 7. Get Usage Statistics

Returns usage statistics and model distribution.

**Endpoint:** `GET /api/model-preferences/stats`

**Response:**
```json
{
  "defaultModels": {
    "text": "model-id-1"
  },
  "lastUsedModels": {
    "text": "model-id-1",
    "image": "model-id-2"
  },
  "modelCount": 15,
  "modelsByType": {
    "text": 5,
    "image": 4,
    "video": 3,
    "audio": 2,
    "script": 1
  }
}
```

### 8. Get Configuration History

Returns a paginated list of configuration changes.

**Endpoint:** `GET /api/model-preferences/history`

**Query Parameters:**
- `limit` (optional, default: 50): Number of entries to return
- `offset` (optional, default: 0): Number of entries to skip

**Response:**
```json
{
  "history": [
    {
      "id": "history-id-1",
      "userId": "user-id-1",
      "changeType": "default_models",
      "changeDetails": {
        "contentType": "all"
      },
      "previousValue": {
        "text": "old-model-id"
      },
      "newValue": {
        "text": "new-model-id"
      },
      "createdAt": "2024-02-23T10:30:00.000Z"
    }
  ],
  "total": 50
}
```

**Change Types:**
- `default_models`: Default model configuration changes
- `model_parameters`: Model parameter changes

### 9. Get Detailed Analytics

Returns comprehensive analytics including summary, type distribution, top models, and recent activity.

**Endpoint:** `GET /api/model-preferences/analytics`

**Response:**
```json
{
  "summary": {
    "totalModels": 15,
    "configuredDefaults": 8,
    "activeUsage": 6,
    "totalChanges": 42
  },
  "byType": {
    "distribution": {
      "text": 5,
      "image": 4,
      "video": 3,
      "audio": 2,
      "script": 1
    },
    "usage": {
      "text": 120,
      "image": 85,
      "video": 45
    }
  },
  "models": {
    "topUsed": [
      {
        "id": "model-id-1",
        "name": "gpt-4",
        "type": "text",
        "count": 85
      }
    ],
    "details": [
      {
        "id": "model-id-1",
        "name": "gpt-4",
        "type": "text",
        "provider": "openai",
        "capabilities": ["text-generation", "code"],
        "isDefault": true,
        "isLastUsed": true,
        "usageCount": 85
      }
    ]
  },
  "history": {
    "summary": {
      "default_models": 12,
      "model_parameters": 30
    },
    "recent": [
      {
        "id": "history-id-1",
        "type": "default_models",
        "timestamp": "2024-02-23T10:30:00.000Z",
        "details": {
          "contentType": "all"
        }
      }
    ]
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Validation failed"
}
```

### 404 Not Found
```json
{
  "error": "Model not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit:** 100 requests per minute per user
- **Burst Limit:** 200 requests per minute per user
- **Headers Returned:**
  - `X-RateLimit-Limit`: Rate limit per minute
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Timestamp when rate limit resets

## Caching

The client-side implements localStorage caching with the following characteristics:

- **Cache Duration:** 5 minutes (300,000ms)
- **Cache Keys:**
  - `model_cache_models`: Model list and providers
  - `model_cache_preferences`: User preferences
- **Auto-Refresh:** Data is refreshed automatically when cache expires
- **Manual Refresh:** Users can force refresh via refresh button

## Best Practices

1. **Use Default Models:** Always check for and use user-configured default models before prompting for selection
2. **Record Usage:** Call the usage endpoint after every successful model invocation
3. **Handle Errors Gracefully:** Implement retry logic for failed model tests or API calls
4. **Leverage Caching:** Use the client-side cache to reduce API calls
5. **Batch Operations:** When possible, batch multiple operations to reduce network overhead
6. **Validate Content Types:** Always validate content types against the supported list
7. **Handle Pagination:** Use the limit and offset parameters for history and analytics endpoints

## Example Usage

### Setting Default Models
```javascript
const response = await fetch('/api/model-preferences/default', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    defaultModels: {
      text: 'gpt-4',
      image: 'dall-e-3'
    }
  })
});
```

### Recording Usage
```javascript
const response = await fetch('/api/model-preferences/usage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    modelId: 'gpt-4',
    contentType: 'text',
    success: true,
    duration: 1500
  })
});
```

### Getting Analytics
```javascript
const response = await fetch('/api/model-preferences/analytics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const analytics = await response.json();
console.log(`Total models: ${analytics.summary.totalModels}`);
console.log(`Top model: ${analytics.models.topUsed[0].name}`);
```

## Version History

- **v1.0.0** (2024-02-23): Initial release with basic preference management
- **v1.1.0** (2024-02-23): Added configuration history and detailed analytics
- **v1.2.0** (2024-02-23): Added model testing and batch operations
