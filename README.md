# 🏠 Real Estate Communication Platform

A comprehensive real estate management system that allows you to import property data from Excel files and manage client communications through WhatsApp and phone calls with full tracking capabilities.

## 🌟 Features

### 📊 Excel Data Management
- **Excel File Upload**: Import property data from Excel files (.xlsx, .xls)
- **Data Validation**: Automatic validation of required columns
- **Instant Processing**: Real-time parsing and storage in MongoDB
- **Bulk Operations**: Upload hundreds of properties at once

### 🏠 Property Management
- **Beautiful Listings**: Professional property cards with all details
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant property list refresh after uploads
- **Search & Filter**: Easy property browsing

### 📱 Communication Hub
- **WhatsApp Integration**: One-click WhatsApp messaging with pre-filled professional messages
- **Direct Calling**: Phone call initiation with tracking
- **Call Recording Preparation**: Built-in infrastructure for call recording
- **Post-Call Management**: Add remarks and track requirement status

### 📈 Analytics & Tracking
- **Call History**: Complete record of all communications
- **Requirement Tracking**: Track client requirements (requirement/no requirement/future requirement)
- **Remarks System**: Add detailed notes after each interaction
- **Property-wise Reports**: View all communications for specific properties

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-platform
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   yarn install
   ```

4. **Environment Setup**
   
   Create `/backend/.env`:
   ```env
   MONGO_URL=mongodb://localhost:27017/realestatedb
   ```
   
   Create `/frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

5. **Start the Services**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Start Backend (in backend directory)
   python server.py
   
   # Start Frontend (in frontend directory)
   yarn start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

## 📋 Excel File Format

Your Excel file must contain these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `name` | Property name | "Luxury Villa" |
| `number` | Contact phone number | "+91-9876543210" |
| `location` | Property location | "Mumbai Bandra" |
| `pricing` | Property price | "₹5.5 Cr" |
| `requirements` | Property specifications | "3 BHK Premium" |
| `remarks` | Additional notes | "Sea facing with balcony" |

### Sample Excel Template
```csv
name,number,location,pricing,requirements,remarks
Luxury Villa,+91-9876543210,Mumbai Bandra,₹5.5 Cr,3 BHK Premium,Sea facing with balcony
Modern Apartment,+91-9876543211,Delhi NCR Gurgaon,₹1.2 Cr,2 BHK Ready to move,Near metro station
```

## 📱 WhatsApp Integration

### How it works:
1. Click the "WhatsApp" button on any property card
2. System generates a professional message with property details
3. Opens WhatsApp web/app with pre-filled message
4. Contact the property owner directly

### Message Format:
```
Hi! I'm interested in the property: [Property Name] located at [Location]. 
Price: [Pricing]. Can we discuss this?
```

### Supported Phone Number Formats:
- +91-9876543210
- +919876543210
- 9876543210
- +1-555-123-4567

## 📞 Call Management

### Call Process:
1. **Initiate Call**: Click "Call" button to start tracking
2. **Make Call**: System opens phone dialer (mobile) or shows call interface
3. **Call Recording**: Built-in infrastructure for recording (extensible)
4. **Post-Call**: Add remarks and update requirement status
5. **Save**: All data saved to database for future reference

### Requirement Status Options:
- **Has Requirement**: Client is interested and has specific needs
- **No Requirement**: Client not interested at this time
- **Future Requirement**: Client may be interested in the future

## 🔧 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Endpoints

#### Properties
- `GET /properties` - Get all properties
- `POST /upload-excel` - Upload Excel file with property data
- `DELETE /properties` - Clear all properties

#### Communication
- `POST /initiate-contact` - Start WhatsApp or call contact
- `POST /update-call` - Update call with remarks and status
- `GET /calls` - Get all call records
- `GET /calls/{property_id}` - Get calls for specific property

### Example API Usage

#### Upload Excel File
```bash
curl -X POST "http://localhost:8001/api/upload-excel" \
  -F "file=@properties.xlsx"
```

#### Get Properties
```bash
curl -X GET "http://localhost:8001/api/properties"
```

#### Initiate WhatsApp Contact
```bash
curl -X POST "http://localhost:8001/api/initiate-contact" \
  -H "Content-Type: application/json" \
  -d '{"property_id": "123", "contact_type": "whatsapp"}'
```

## 🏗️ Architecture

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **File Upload**: HTML5 File API
- **Communication**: Fetch API

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with PyMongo
- **File Processing**: Pandas + OpenPyXL
- **Authentication**: Ready for JWT implementation
- **CORS**: Configured for cross-origin requests

### Database Schema

#### Properties Collection
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  name: String,
  number: String,
  location: String,
  pricing: String,
  requirements: String,
  remarks: String,
  created_at: DateTime
}
```

#### Calls Collection
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  property_id: String,
  contact_type: String, // 'whatsapp' or 'call'
  duration: String,
  remarks: String,
  requirement_status: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

## 🔒 Security Considerations

### Current Implementation
- Input validation on Excel uploads
- CORS protection
- SQL injection prevention (using MongoDB)
- File type validation

### Recommended Enhancements
- JWT authentication
- Rate limiting
- API key management
- Data encryption at rest

## 📦 Deployment

### Production Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb://production-mongo-url/realestatedb
ENVIRONMENT=production
DEBUG=false
```

#### Frontend (.env.production)
```env
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment Options
- **AWS**: EC2 + RDS + S3
- **Google Cloud**: App Engine + Cloud MongoDB
- **Azure**: App Service + Cosmos DB
- **Heroku**: Web + MongoDB Atlas

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
yarn test
```

### Manual Testing Checklist
- [ ] Excel file upload works
- [ ] Properties display correctly
- [ ] WhatsApp links open properly
- [ ] Call tracking functions
- [ ] Post-call remarks save
- [ ] Data persists across sessions

## 🐛 Troubleshooting

### Common Issues

#### WhatsApp Not Opening
- Check if phone number format is correct
- Ensure WhatsApp is installed on device
- Try different browsers

#### Excel Upload Fails
- Verify all required columns are present
- Check file format (.xlsx or .xls)
- Ensure file size is under 10MB

#### Call Tracking Not Working
- Check backend API connectivity
- Verify MongoDB connection
- Review browser console for errors

#### Database Connection Issues
- Verify MongoDB is running
- Check connection string in .env
- Ensure database permissions

### Error Codes
- `400`: Bad request (missing data or invalid format)
- `404`: Resource not found
- `500`: Server error (check logs)

## 📞 Support

### Getting Help
- Review this README thoroughly
- Check the troubleshooting section
- Look at example files in `/examples` directory
- Review API documentation

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Future Enhancements

### Planned Features
- [ ] Advanced call recording with Twilio
- [ ] Email integration and notifications
- [ ] Property image uploads
- [ ] Advanced search and filtering
- [ ] Customer relationship management
- [ ] Analytics dashboard
- [ ] Multi-user support with roles
- [ ] Property visit scheduling
- [ ] Document management
- [ ] Integration with external property APIs

### Integration Possibilities
- **Payment Gateways**: Stripe, PayPal
- **Communication**: Twilio, SendGrid
- **Storage**: AWS S3, Google Cloud Storage
- **Analytics**: Google Analytics, Mixpanel
- **CRM**: Salesforce, HubSpot

---

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB
- **Network**: Broadband internet

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: High-speed internet

---

*Built with ❤️ for real estate professionals*