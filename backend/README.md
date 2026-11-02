# ToolLoop Backend API

Node.js + Express REST API for **ToolLoop — Community Equipment-Sharing Network**.

### Environment:
Preconfigured in `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=NewRootPassword123!
DB_NAME=toolloop
```

### Running Backend:
```powershell
npm install
npm run seed     # (Optional) Populates initial sample records into MySQL
npm run dev      # Starts API server on http://localhost:5000
```
