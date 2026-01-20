# Postcode Data Management

This document describes how the postcode data system works after replacing Google Sheets API.

## Overview
The system now uses local CSV files instead of Google Sheets API to store and retrieve postcode data, making it Docker-friendly.

## Features
- **Local Data Storage**: Uses CSV files instead of external API calls
- **Automatic Sample Data**: Creates sample postcode data if file doesn't exist
- **Import/Export**: Manage postcode data via web interface
- **Database Sync**: Sync local data to database
- **Docker Compatible**: No external dependencies needed

## Data Structure
The CSV file follows this format:
```
Country Name
Country Name,City Name,Town Name,Postcode,Display Name
```

Example:
```
Japan
Japan,Tokyo,Shibuya,150-0001,Shibuya
Japan,Tokyo,Shinjuku,160-0022,Shinjuku
USA
USA,California,Los Angeles,90210,Beverly Hills
```

## API Endpoints

### Export Postcode Data
```
GET /api/postcode-data/export
```
Returns: CSV file with all postcode data

### Import Postcode Data
```
POST /api/postcode-data/import
Content-Type: multipart/form-data
Body: file (CSV or Excel file)
```
Returns: Import status with row count

### Sync Postcode Data
```
GET /api/postcode-data/sync
```
Returns: Sync status message

### Get Postcode Data
```
GET /api/postcode-data/data
```
Returns: JSON with postcode data and row count

## Usage in Application

The original postcode service now uses the local data service:

```typescript
// Before (Google Sheets)
const data = await this.getDataFromGoogleSheet();

// After (Local Data Service)
const data = await this.postcodeDataService.getPostcodeData();
```

## Initial Setup

### 1. Data Directory
The system creates a `/data` directory automatically with sample data.

### 2. File Location
Default file location: `./data/postcode.csv`

### 3. Environment Variables
```bash
POSTCODE_DATA_PATH=./data
POSTCODE_FILE_NAME=postcode.csv
```

## Sample Data
The system automatically creates sample data for:
- Japan (Tokyo, Osaka)
- United States (California, New York)
- Vietnam (Ho Chi Minh, Hanoi)

## Migration from Google Sheets

### Export from Google Sheets
1. Go to your Google Sheet
2. File → Download → CSV
3. Use the import endpoint to upload

### Manual CSV Creation
Create a CSV file with the format mentioned above and place it in the data directory.

## Benefits over Google Sheets

✅ **No External Dependencies**: Works offline in Docker
✅ **Faster Response**: Local file access vs API calls
✅ **Better Control**: Data stored locally
✅ **Easier Testing**: Mock data easily created
✅ **Lower Costs**: No API calls or premium features
✅ **More Reliable**: No rate limits or API issues

## File Management

### Adding New Postcodes
1. Use the import endpoint
2. Or manually edit the CSV file
3. Run sync endpoint to update database

### Backup
Simply backup the CSV file located at:
`./data/postcode.csv`

### Recovery
Restore the CSV file and run sync to rebuild the database.

## Troubleshooting

### File Not Found
The system automatically creates sample data if no file exists.

### Permission Issues
Ensure the application has read/write permissions to the data directory.

### Format Errors
CSV must follow the exact format with proper column ordering.

### Large Files
For very large postcode datasets, consider:
1. Batch processing
2. Database indexing
3. Memory optimization

## Docker Integration

### Volume Mounting
Mount the data directory as a volume:
```yaml
volumes:
  - ./data:/app/data
```

### Environment
Set the data path environment variable:
```yaml
environment:
  - POSTCODE_DATA_PATH=/app/data
```