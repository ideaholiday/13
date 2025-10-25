# Testing Reviews API Integration

## ✅ Completed Setup

### Backend (ih-backend)
- ✅ Reviews table migration created and run
- ✅ Review model with relationships
- ✅ ReviewController with index, store, markHelpful methods
- ✅ API routes configured in routes/api.php
- ✅ Backend server running on http://localhost:8000

### Frontend (ih-frontend)
- ✅ useReviews hook updated to call real API
- ✅ useSubmitReview hook updated to call real API
- ✅ Environment variable NEXT_PUBLIC_API_URL configured

---

## 🧪 Test Checklist

### 1. Test Backend API Directly

#### Test GET Reviews (Empty initially)
```bash
curl -X GET "http://localhost:8000/api/v1/reviews?type=hotel&id=1"
```

Expected response:
```json
{
  "current_page": 1,
  "data": [],
  "total": 0
}
```

#### Test POST New Review
```bash
curl -X POST "http://localhost:8000/api/v1/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "bookable_type": "hotel",
    "bookable_id": 1,
    "rating": 5,
    "title": "Amazing hotel experience!",
    "content": "Had a wonderful stay. The staff was friendly and the room was spotless.",
    "photos": ["https://via.placeholder.com/400x300"]
  }'
```

Expected response:
```json
{
  "id": 1,
  "user_id": 1,
  "bookable_type": "hotel",
  "bookable_id": 1,
  "rating": 5,
  "title": "Amazing hotel experience!",
  "content": "Had a wonderful stay...",
  "photos": ["https://via.placeholder.com/400x300"],
  "verified": false,
  "helpful_count": 0,
  "created_at": "2025-10-16T...",
  "updated_at": "2025-10-16T..."
}
```

#### Test GET Reviews (Should return 1 review)
```bash
curl -X GET "http://localhost:8000/api/v1/reviews?type=hotel&id=1"
```

#### Test Mark as Helpful
```bash
curl -X POST "http://localhost:8000/api/v1/reviews/1/helpful"
```

Expected response:
```json
{
  "helpful_count": 1
}
```

---

### 2. Test Frontend Integration

#### Start Frontend Dev Server
```bash
cd ih-frontend
npm run dev
```

Frontend should be available at: http://localhost:3010

#### Test Review Display
1. Navigate to http://localhost:3010/demo/review-card
2. Reviews should load from the backend API
3. Check browser DevTools → Network → Should see request to `http://localhost:8000/api/v1/reviews`

#### Test Review Submission
1. Navigate to http://localhost:3010/demo/review-form
2. Fill out the form:
   - Rating: 5 stars
   - Title: "Great experience"
   - Content: "This was an amazing trip!"
3. Click Submit
4. Check browser DevTools → Network → Should see POST to `http://localhost:8000/api/v1/reviews`
5. Should see success toast notification
6. Navigate back to review-card demo → Should see your new review

---

### 3. Integration Tests

#### End-to-End Flow
1. Submit a review via the frontend form
2. Check that it appears in the review list
3. Click "Helpful" button on a review
4. Verify the helpful count increments
5. Submit another review with different rating
6. Verify both reviews appear in the list

#### Error Handling
1. Try submitting review with missing fields → Should see validation errors
2. Stop backend server → Should see error toast
3. Restart backend → Should work again

---

## 🐛 Troubleshooting

### Backend not accessible
- Check backend is running: `ps aux | grep artisan`
- Check port 8000 is free: `lsof -i :8000`
- Restart backend: `cd ih-backend && php artisan serve --host=127.0.0.1 --port=8000`

### CORS errors
- Backend should have CORS enabled in `config/cors.php`
- Check that `'supports_credentials' => true` is set
- Verify allowed origins include `http://localhost:3010`

### Database errors
- Check database connection in `ih-backend/.env`
- Run migrations: `php artisan migrate`
- Check SQLite file exists: `ls -la ih-backend/database/database.sqlite`

### Frontend API errors
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Restart frontend dev server after changing .env
- Clear browser cache and reload

---

## 📊 Success Criteria

- ✅ Backend API returns reviews for a given hotel/package
- ✅ Backend API accepts and stores new reviews
- ✅ Backend API increments helpful count
- ✅ Frontend successfully fetches reviews from backend
- ✅ Frontend successfully submits reviews to backend
- ✅ Reviews persist in database
- ✅ No CORS errors
- ✅ Proper error handling and user feedback

---

## 🎯 Next Steps After Testing

Once reviews API is fully tested and working:

1. **Add more API endpoints:**
   - Carbon emissions API
   - Forum posts API
   - Eco ratings API
   - VR tours API

2. **Enhance Reviews:**
   - Add user authentication
   - Add photo upload functionality
   - Add review moderation
   - Add review replies

3. **Frontend Integration:**
   - Integrate reviews into hotel detail pages
   - Integrate reviews into package detail pages
   - Add review statistics (average rating, count)
   - Add review filtering and sorting

4. **Testing:**
   - Write unit tests for ReviewController
   - Write integration tests for API
   - Add frontend component tests
   - Set up CI/CD pipeline

---

**Status**: Ready for testing  
**Last Updated**: October 16, 2025
