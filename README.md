# StudyHub Backend — Premier University Chittagong (CSE)

Peer notes & resource sharing platform backend, built for PUC CSE students.
Course code format: `CSE-201` (letters-dash-3digits). Semester range: 1-8.

## Setup

```bash
cd server
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # requires nodemon, or use: npm start
```

## API Endpoints

### Auth
| Method | Route | Body | Auth |
|---|---|---|---|
| POST | /api/auth/register | name, email, password, studentId, semester | No |
| POST | /api/auth/login | email, password | No |
| GET | /api/auth/me | - | Yes |

### Resources
| Method | Route | Body / Query | Auth |
|---|---|---|---|
| POST | /api/resources | multipart: file, title, courseCode, courseName, semester, type, tags | Yes |
| GET | /api/resources | ?courseCode=&semester=&type=&search=&sort=rating\|downloads | No |
| GET | /api/resources/:id | - | No |
| POST | /api/resources/:id/download | - | No |
| POST | /api/resources/:id/rate | rating (1-5) | Yes |
| DELETE | /api/resources/:id | - | Yes (owner/admin) |

### Comments
| Method | Route | Body | Auth |
|---|---|---|---|
| GET | /api/comments/:resourceId | - | No |
| POST | /api/comments/:resourceId | text | Yes |
| DELETE | /api/comments/:id | - | Yes (owner) |

## Notes
- File uploads stored in `server/uploads/` (local storage, ~15MB limit per file).
- Contribution points (+10) auto-awarded on upload — foundation for leaderboard feature.
- Resource model has text index on title/courseName/tags for `search` query param.
- Next steps: build React frontend, then add AI-summary or exam-mode feature for differentiation.
