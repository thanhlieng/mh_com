# File Storage Configuration Guide

This document explains how to configure file storage in the MH Logistics System after replacing AWS S3.

## Overview
The system now supports multiple storage providers:
- **Local Storage** (Default) - Files stored on server
- **AWS S3** - Amazon S3 (optional)
- **Cloudflare R2** - Cloudflare R2 (optional)
- **Backblaze B2** - Backblaze B2 (optional)

## Storage Providers

### 1. Local Storage (Default)
Files are stored locally on the server with Nginx serving static files.

**Configuration:**
```bash
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=/app/uploads
LOCAL_STORAGE_URL=https://yourdomain.com/uploads
```

**Benefits:**
✅ No external dependencies  
✅ Fast access (local disk)  
✅ No monthly costs  
✅ Full control over data  
✅ Easy backup  

**File Structure:**
```
uploads/
├── images/
│   ├── filename_abc123.jpg
│   └── document_def456.pdf
└── other/
    └── file_ghi789.xlsx
```

### 2. AWS S3 (Optional)
Use Amazon S3 for cloud storage.

**Configuration:**
```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=ap-southeast-1
```

### 3. Cloudflare R2 (Optional)
Use Cloudflare R2 for S3-compatible storage with no egress fees.

**Configuration:**
```bash
STORAGE_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_TOKEN=your_token
CLOUDFLARE_BUCKET=your_bucket_name
```

### 4. Backblaze B2 (Optional)
Use Backblaze B2 for affordable cloud storage.

**Configuration:**
```bash
STORAGE_PROVIDER=backblaze
BACKBLAZE_ENDPOINT=your_endpoint
BACKBLAZE_KEY_ID=your_key_id
BACKBLAZE_KEY=your_key
BACKBLAZE_BUCKET=your_bucket_name
```

## API Endpoints

### Upload File
```http
POST /api/file-storage/upload
Content-Type: multipart/form-data
Body: file
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "location": "https://yourdomain.com/uploads/images/filename_abc123.jpg",
    "key": "images/filename_abc123.jpg"
  }
}
```

### Delete File
```http
DELETE /api/file-storage/delete/images/filename_abc123.jpg
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "success": true
}
```

### Get File Stats
```http
GET /api/file-storage/stats/images/filename_abc123.jpg
```

**Response:**
```json
{
  "key": "images/filename_abc123.jpg",
  "size": 1024000,
  "exists": true
}
```

### Get Storage Config
```http
GET /api/file-storage/config
```

**Response:**
```json
{
  "config": {
    "provider": "local",
    "local": {
      "storagePath": "/app/uploads",
      "baseUrl": "https://yourdomain.com/uploads"
    }
  }
}
```

## Migration from AWS S3

### 1. Export Existing Files
Download all files from your S3 bucket:
```bash
aws s3 sync s3://your-bucket-name ./backup
```

### 2. Update Configuration
Change environment variables to use local storage:
```bash
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=/app/uploads
LOCAL_STORAGE_URL=https://yourdomain.com/uploads
```

### 3. Import Files to Local Storage
Copy files to the uploads directory:
```bash
cp -r ./backup/images ./uploads/
```

### 4. Update Database URLs
Update any database records that contain S3 URLs:
```sql
UPDATE your_table SET url = REPLACE(url, 'https://your-bucket.s3.amazonaws.com/', 'https://yourdomain.com/uploads/');
```

## Docker Configuration

### Volume Mounting
The docker-compose.yml automatically mounts the uploads directory:
```yaml
volumes:
  - mh_uploads:/app/uploads
```

### Static File Serving
Nginx container serves uploaded files:
```yaml
nginx-static:
  volumes:
    - mh_uploads:/usr/share/nginx/html/uploads:ro
```

### Traefik Configuration
Traefik routes `/uploads/*` to the Nginx static server:
```yaml
labels:
  - "traefik.http.routers.uploads.rule=Host(`${DOMAIN}` && PathPrefix(`/uploads`))"
```

## Backup and Recovery

### Local Storage Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads/

# Restore from backup
tar -xzf uploads_backup_20231201.tar.gz
```

### Database Backup
```bash
# Backup database with file references
docker-compose exec db pg_dump -U $DB_USER $DB_DATABASE > backup.sql
```

## Security Considerations

### File Upload Security
- File type validation
- File size limits
- Virus scanning (optional)
- Access control

### Directory Permissions
```bash
# Set proper permissions
chmod 755 ./uploads
chmod 644 ./uploads/images/*
```

### Nginx Security
Add to Nginx configuration:
```nginx
location /uploads/ {
    # Prevent script execution
    location ~* \.(php|jsp|asp|sh|pl|py)$ {
        deny all;
    }
    
    # Set reasonable file size limit
    client_max_body_size 50M;
}
```

## Performance Optimization

### Local Storage
- Use SSD storage for better performance
- Implement file caching
- Monitor disk space usage

### CDN Integration
For better performance, you can integrate a CDN:
```bash
# Cloudflare CDN
LOCAL_STORAGE_URL=https://yourdomain.cdn.com/uploads
```

## Troubleshooting

### File Not Found
1. Check if file exists in uploads directory
2. Verify file permissions
3. Check Nginx configuration

### Upload Failed
1. Check disk space
2. Verify directory permissions
3. Check file size limits

### Access Denied
1. Check file permissions
2. Verify Nginx user has read access
3. Check Traefik routing

## Monitoring

### Disk Usage
```bash
# Monitor uploads directory size
du -sh ./uploads/

# Find large files
find ./uploads -type f -size +10M -exec ls -lh {} \;
```

### Access Logs
```bash
# Check Nginx access logs
docker-compose logs nginx-static
```

## Cost Comparison

| Provider | Storage Cost | Egress Cost | Monthly Cost (100GB) |
|----------|--------------|-------------|---------------------|
| Local | $0 | $0 | $0 |
| AWS S3 | $2.3 | $0.09 | $2.3 + egress |
| Cloudflare R2 | $0.015 | $0 | $0.015 |
| Backblaze B2 | $0.006 | $0.01 | $0.6 + egress |

## Recommendations

### For Small to Medium Applications
Use **Local Storage** with regular backups.

### For Large Applications
Use **Cloudflare R2** for no egress fees and S3 compatibility.

### For Enterprise
Use **AWS S3** with proper backup and disaster recovery.

## Support

For issues:
1. Check storage configuration: `GET /api/file-storage/config`
2. Verify file permissions
3. Check disk space: `df -h`
4. Review logs: `docker-compose logs api nginx-static`