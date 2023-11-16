# Entity model
All entity will have these common field
```json
{
  "id": String,
  "created_at": Date,
  "updated_at": Date
}
```
## Authentication
- `UserRequest`
```json
{
  "name": String,
  "birthday": Date,
  "is_verified_email": true || false,
  "avatar_url": String
}
```
- `UserModel`
```json
{
  "email": Email,
  "name": String,
  "birthday": Date,
  "is_verified_email": true || false,
  "avatar_url": String
}
```
#### Login (POST /auth/login)
- Request (application/json)
```json
{
  "email": Email,
  "password": String
}
```
- Response (application/json): `UserModel` and `"token": String`
#### Register (POST /auth/register)
- Request (application/json):
```json
{
  "email": Email,
  "name": String,
  "birthday": Date,
  "password": String
}
```
- Response (application/json): `UserModel` and `"token": String`

## API
**Required header**: `Authorization: Bearer ...`
### Image
#### Upload (POST /api/v1/image)
- Request (application/x-www-form-urlencoded)
```json
{
  "image": File
}
```
- Response (application/json)
```json
{
  "link": String
}
```


### Me
#### Get user info (GET /api/v1/me)
- Request (application/json): `None`
- Response (application/json): `UserModel`

#### Edit user info (PUT /api/v1/me)
- Request (application/json): `UserRequest`
- Response (application/json): `UserModel`


### Question
- `QuestionRequest`
```json
{
  "question_text": String,
  "question_image_url": String,
  "question_raw_image_url": String,
  "answer": String,
  "difficulty": Number,
  "type": "image_answer" || "text_answer"
}
```
- `QuestionModel`
```json
{
  "id": String,
  "user_id": String,
  "question_text": String,
  "question_image_url": String,
  "question_raw_image_url": String,
  "answer": String,
  "difficulty": Number,
  "type": "image_answer" || "text_answer"
}
```

#### List user question (GET /api/v1/question)
- Request (application/json): `None`
- Response (application/json): `Array(QuestionModel)`

#### Create user question (POST /api/v1/question)
- Request (application/json): `QuestionRequest`
- Response (application/json): `QuestionModel`

#### Get user question detail (GET /api/v1/question/:questionId)
- Request (application/json): `None`
- Response (application/json): `QuestionModel`

#### Edit user question (PUT /api/v1/question/:questionId)
- Request (application/json): `QuestionRequest`
- Response (application/json): `QuestionModel`

#### Delete user question (DELETE /api/v1/question/:questionId)
- Request (application/json): `None`
- Response (application/json):
```json
{
  "success": true
}
```

### Play
#### Get next question (GET /api/v1/play/next_question)
- Request (url query):
```js
exclude_unanswered=<true|false>
```
- Response (application/json):
```json
{
  "finished": true || false,
  "question": QuestionModel
}
```

#### Save answer (POST /api/v1/play/save_answer)
- Request (application/json):
```json
{
  "question_id": String,
  "know_answer": true || false,
  "answer_correct": true || false
}
```
- Response (application/json):
```json
{
  "success": true
}
```

#### Get learning history (GET /api/v1/play/history)
- Request (application/json): `None`
- Response (application/json):
```json
{
  "total": Number,
  "correct": Number,
  "incorrect": Number,
  "wrong_questions": Array<Question>
}
```

#### Reset learning history (POST /api/v1/play/reset)
- Request (application/json): `None`
- Response (application/json):
```json
{
  "success": true
}
```

### Notification
- `NotificationRequest`
```json
{
  "time": String,
  "hour": Number,
  "min": Number,
  "type": "days_of_week" || "date",
  "is_active": true || false,
}
```
- `NotificationModel`
```json
{
  "id": String,
  "user_id": String,
  "time": String,
  "hour": Number,
  "min": Number,
  "type": "days_of_week" || "date",
  "is_active": true || false,
}
```

#### List user notification (GET /api/v1/notification)
- Request (application/json): `None`
- Response (application/json): `Array(NotificationModel)`

#### Create user notification (POST /api/v1/notification)
- Request (application/json): `NotificationRequest`
- Response (application/json): `NotificationModel`

#### Get user notification detail (GET /api/v1/notification/:notificationId)
- Request (application/json): `None`
- Response (application/json): `NotificationModel`

#### Edit user notification (PUT /api/v1/notification/:notificationId)
- Request (application/json): `NotificationRequest`
- Response (application/json): `NotificationModel`

#### Delete user notification (DELETE /api/v1/notification/:notificationId)
- Request (application/json): `None`
- Response (application/json):
```json
{
  "success": true
}
```
