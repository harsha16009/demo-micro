# Troubleshooting Guide

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports in .env
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
docker-compose logs mongo

# Verify connection string
mongodb://admin:admin123@mongo:27017/auth-db?authSource=admin

# Test connection
mongosh --authenticationDatabase admin -u admin -p admin123 localhost:27017
```

### Docker Build Issues
```bash
# Clear build cache
docker-compose build --no-cache

# Check logs
docker-compose logs <service-name>

# Rebuild specific service
docker-compose build --no-cache auth-service
```

### Network Issues
```bash
# Check network connectivity
docker-compose ps

# Verify service URLs in .env files
# Services should use container names as hosts

# Example:
AUTH_SERVICE_URL=http://auth-service:3001  # ✓ Correct
AUTH_SERVICE_URL=http://localhost:3001     # ✗ Wrong in Docker
```

### Memory Issues
```bash
# Check Docker resources
docker stats

# Increase Docker memory limit in Desktop settings
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Verify frontend is built
docker-compose exec frontend npm run build

# Check API gateway connectivity
curl http://localhost:3000/health
```

## Development Tips

### Hot Reload
Services use `nodemon` for hot reload during development:
```bash
npm run dev
```

### Database Management
```bash
# Access MongoDB shell
mongosh --authenticationDatabase admin -u admin -p admin123 localhost:27017

# List databases
show dbs

# Switch to database
use auth-db

# List collections
show collections

# Query data
db.users.find().pretty()
```

### API Testing
Use Postman or curl:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Products
curl http://localhost:3000/api/products
```

## Performance Optimization

1. **Database Indexing** - Add indexes for frequently queried fields
2. **Caching** - Implement Redis for caching
3. **Load Balancing** - Use Nginx for load distribution
4. **CDN** - Serve static assets from CDN
5. **Monitoring** - Use Prometheus & Grafana
