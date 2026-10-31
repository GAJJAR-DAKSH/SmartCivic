const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const {
  departments,
  categories,
  users,
  initialIssues,
  initialAuditTrail,
  SLA_HOURS
} = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smartcivic_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database Persistence (JSON file backed)
const DB_FILE = path.join(__dirname, 'data', 'database.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: users,
      issues: initialIssues,
      auditTrail: initialAuditTrail,
      departments: departments,
      categories: categories
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file, resetting:', err);
    const initialData = { users, issues: initialIssues, auditTrail: initialAuditTrail, departments, categories };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Haversine Distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate SLA metrics for an issue
function computeSLA(issue) {
  const now = Date.now();
  const created = new Date(issue.created_at).getTime();
  const deadline = new Date(issue.sla_deadline).getTime();
  const totalWindow = deadline - created;
  const elapsed = now - created;

  const isResolvedOrClosed = ['DONE', 'VERIFIED', 'CLOSED'].includes(issue.status);
  const isBreached = !isResolvedOrClosed && now > deadline;

  let sla_status = 'ON_TRACK';
  let countdown_label = '';

  if (isResolvedOrClosed) {
    sla_status = 'COMPLETED';
    countdown_label = 'Resolved';
  } else if (isBreached) {
    sla_status = 'BREACHED';
    const diffMs = now - deadline;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      countdown_label = `Breached (-${days}d ${hours % 24}h)`;
    } else {
      countdown_label = `Breached (-${hours}h ${mins}m)`;
    }
  } else {
    const diffMs = deadline - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    countdown_label = `${hours}h ${mins}m remaining`;

    const ratio = elapsed / totalWindow;
    const warnRatio = issue.priority === 'CRITICAL' ? 0.75 : issue.priority === 'LOW' ? 0.85 : 0.80;
    if (ratio >= warnRatio) {
      sla_status = 'WARNING';
    }
  }

  return {
    ...issue,
    is_breached: isBreached,
    sla_status,
    countdown_label
  };
}

// Helper to record audit trail
function recordAudit(db, issue_id, actor, action, prev_status, new_status, remarks, req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const newAudit = {
    id: 'audit_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    issue_id,
    actor_id: actor ? actor.id : 'system',
    actor_name: actor ? actor.name : 'System',
    actor_role: actor ? actor.role : 'SYSTEM',
    action,
    previous_status: prev_status,
    new_status: new_status,
    remarks: remarks || '',
    ip_address: ip.replace('::ffff:', ''),
    timestamp: new Date().toISOString()
  };
  db.auditTrail.unshift(newAudit);
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ detail: 'Authentication token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ detail: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// Optional Auth (for public routes that can be enhanced with user context)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
}

// ======================= API ENDPOINTS =======================

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartCivic Backend is running!',
    status: 'OK'
  });
});

// 1. Auth: Obtain JWT Token (DRF /api/auth/token/ compatible)
app.post('/api/auth/token/', (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username === username || u.email === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    title: user.title,
    ward: user.ward
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    access: accessToken,
    refresh: refreshToken,
    user: payload
  });
});

// 1b. Auth: Google One-Click Direct Authentication
app.post('/api/auth/google/', (req, res) => {
  const { email, name, sub } = req.body;
  const userEmail = email || 'citizen.google@gmail.com';
  const userName = name || 'Google Verified Citizen';

  const db = loadDB();
  let user = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase() || u.username.toLowerCase() === userEmail.toLowerCase());

  if (!user) {
    const baseUsername = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    user = {
      id: 'user_google_' + Date.now(),
      username: baseUsername,
      password: 'google_oauth_verified_' + Math.random().toString(36),
      name: userName,
      email: userEmail,
      phone: '+91 98000 00000',
      ward: 'Ward 4 - Riverside',
      role: 'CITIZEN',
      department: null,
      title: 'Google Verified Citizen'
    };
    db.users.push(user);
    saveDB(db);
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    title: user.title,
    ward: user.ward
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    access: accessToken,
    refresh: refreshToken,
    user: payload
  });
});

// 2. Auth: Register Citizen / Staff
app.post('/api/auth/register/', (req, res) => {
  const { username, password, name, email, phone, ward, role, department } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ detail: 'Username, password, and name are required.' });
  }

  const db = loadDB();
  if (db.users.some(u => u.username === username || (email && u.email === email))) {
    return res.status(400).json({ detail: 'User with this username or email already exists.' });
  }

  const newUser = {
    id: 'user_' + Date.now(),
    username,
    password,
    name,
    email: email || `${username}@example.com`,
    phone: phone || '+91 98000 00000',
    ward: ward || 'Ward 4 - Riverside',
    role: role || 'CITIZEN',
    department: department || null,
    title: role === 'CITIZEN' ? 'Registered Citizen' : 'Municipal Staff'
  };

  db.users.push(newUser);
  saveDB(db);

  const payload = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    title: newUser.title,
    ward: newUser.ward
  };
  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  res.status(201).json({
    message: 'User registered successfully',
    access,
    user: payload
  });
});

// 3. Auth: Current Profile
app.get('/api/auth/me/', authenticateToken, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ detail: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// 4. Metadata: Departments, Categories, Workers
app.get('/api/departments/', (req, res) => {
  const db = loadDB();
  res.json(db.departments);
});

app.get('/api/categories/', (req, res) => {
  const db = loadDB();
  res.json(db.categories);
});

app.get('/api/workers/', (req, res) => {
  const { department } = req.query;
  const db = loadDB();
  let workers = db.users.filter(u => u.role === 'WORKER');
  if (department && department !== 'ALL') {
    workers = workers.filter(u => u.department === department);
  }
  // Attach active load
  const workersWithLoad = workers.map(w => {
    const activeTasks = db.issues.filter(
      i => i.assigned_worker_id === w.id && ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(i.status)
    ).length;
    return {
      id: w.id,
      name: w.name,
      phone: w.phone,
      department: w.department,
      skills: w.skills || ['General maintenance'],
      ward: w.ward,
      activeTasks
    };
  });
  res.json(workersWithLoad);
});

// 5. Proximity Duplicate Detection Engine (50-meter radius)
app.post('/api/issues/check-duplicate/', (req, res) => {
  const { latitude, longitude, category_code } = req.body;
  if (!latitude || !longitude || !category_code) {
    return res.status(400).json({ detail: 'Latitude, longitude, and category_code are required' });
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const db = loadDB();

  // Find active issues in the same category within 50 meters
  const activeIssues = db.issues.filter(
    i => i.category_code === category_code && !['REJECTED', 'CLOSED'].includes(i.status)
  );

  const duplicates = [];
  for (const issue of activeIssues) {
    const dist = getDistanceMeters(lat, lon, issue.latitude, issue.longitude);
    if (dist <= 50) {
      duplicates.push({
        ...computeSLA(issue),
        distance_meters: Math.round(dist)
      });
    }
  }

  res.json({
    has_duplicate: duplicates.length > 0,
    count: duplicates.length,
    duplicates
  });
});

// 6. Issues: List & Filter
app.get('/api/issues/', optionalAuth, (req, res) => {
  const {
    department,
    status,
    priority,
    ward,
    category,
    search,
    my_issues,
    assigned_to_me
  } = req.query;

  const db = loadDB();
  let results = db.issues.map(computeSLA);

  // Filter by user role or query params
  if (my_issues === 'true' && req.user) {
    results = results.filter(i => i.citizen_id === req.user.id);
  }

  if (assigned_to_me === 'true' && req.user) {
    results = results.filter(i => i.assigned_worker_id === req.user.id);
  }

  if (department && department !== 'ALL') {
    results = results.filter(i => i.department_code === department);
  }

  if (status && status !== 'ALL') {
    if (status === 'IN_FIELD') {
      results = results.filter(i => ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(i.status));
    } else if (status === 'SLA_BREACHED') {
      results = results.filter(i => i.is_breached);
    } else if (status === 'ACTIVE') {
      results = results.filter(i => !['DONE', 'VERIFIED', 'CLOSED', 'REJECTED'].includes(i.status));
    } else if (status === 'RESOLVED') {
      results = results.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status));
    } else {
      results = results.filter(i => i.status === status);
    }
  }

  if (priority && priority !== 'ALL') {
    results = results.filter(i => i.priority === priority);
  }

  if (ward && ward !== 'ALL') {
    results = results.filter(i => i.ward === ward);
  }

  if (category && category !== 'ALL') {
    results = results.filter(i => i.category_code === category);
  }

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      i =>
        i.id.toLowerCase().includes(s) ||
        i.title.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        i.address.toLowerCase().includes(s)
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(results);
});

// 7. Single Issue Details (Public & Authenticated)
app.get('/api/issues/:id/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const issue = db.issues.find(i => i.id.toUpperCase() === id.toUpperCase());
  if (!issue) return res.status(404).json({ detail: 'Grievance ticket not found' });

  const computed = computeSLA(issue);
  const audit = db.auditTrail.filter(a => a.issue_id.toUpperCase() === id.toUpperCase());

  res.json({
    ...computed,
    audit_trail: audit
  });
});

// 8. Submit New Grievance (Citizen - Must be logged in)
app.post('/api/issues/', authenticateToken, upload.single('photo'), (req, res) => {
  const {
    title,
    description,
    category_code,
    latitude,
    longitude,
    address,
    ward,
    priority
  } = req.body;

  if (!title || !description || !category_code || !latitude || !longitude) {
    return res.status(400).json({ detail: 'Title, description, category, and GPS coordinates are required.' });
  }

  const db = loadDB();
  const cat = db.categories.find(c => c.code === category_code);
  const finalPriority = priority || (cat ? cat.default_priority : 'MEDIUM');
  const finalDepartment = cat ? cat.default_department : 'ROADS';

  const issueCount = db.issues.length + 1;
  const issueId = `SC-2026-${String(issueCount).padStart(5, '0')}`;

  const slaHours = SLA_HOURS[finalPriority] || 48;
  const createdAt = new Date().toISOString();
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

  let initial_photo = null;
  if (req.file) {
    initial_photo = `/uploads/${req.file.filename}`;
  } else if (req.body.photo_url) {
    initial_photo = req.body.photo_url;
  } else {
    // Default category sample photo
    initial_photo = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
  }

  const citizenId = req.user ? req.user.id : 'user_citizen';
  const citizenName = req.user ? req.user.name : (req.body.citizen_name || 'Anonymous Resident');

  const newIssue = {
    id: issueId,
    title,
    description,
    category_code,
    department_code: finalDepartment,
    citizen_id: citizenId,
    citizen_name: citizenName,
    status: 'SUBMITTED',
    priority: finalPriority,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    address: address || 'Geolocated Municipal Street Coordinate',
    ward: ward || 'Ward 4 - Riverside',
    sla_deadline: slaDeadline,
    is_breached: false,
    assigned_worker_id: null,
    assigned_worker_name: null,
    initial_photo,
    resolution_photo: null,
    materials_deployed: [],
    resolution_notes: null,
    supervisor_notes: null,
    satisfaction_rating: null,
    citizen_feedback: null,
    upvotes_count: 1,
    upvoted_by: [citizenId],
    created_at: createdAt,
    updated_at: createdAt
  };

  db.issues.unshift(newIssue);

  // Audit entry
  recordAudit(
    db,
    issueId,
    req.user || { id: citizenId, name: citizenName, role: 'CITIZEN' },
    'GRIEVANCE_SUBMITTED',
    null,
    'SUBMITTED',
    `Initial intake logged with GPS (${latitude}, ${longitude}) in ${newIssue.ward}`,
    req
  );

  saveDB(db);

  res.status(201).json(computeSLA(newIssue));
});

// 9. Department Officer Triage (Accept, Reject, Priority Change, Dept Reroute)
app.patch('/api/issues/:id/triage/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { action, priority, department_code, rejection_reason, remarks } = req.body;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);

  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const prevStatus = issue.status;

  if (action === 'ACCEPT') {
    issue.status = 'ACCEPTED';
    recordAudit(db, id, req.user, 'OFFICER_ACCEPTED', prevStatus, 'ACCEPTED', remarks || 'Issue verified and accepted for queue dispatch.', req);
  } else if (action === 'REJECT') {
    if (!rejection_reason) {
      return res.status(400).json({ detail: 'Mandatory rejection reason required.' });
    }
    issue.status = 'REJECTED';
    issue.rejection_reason = rejection_reason;
    recordAudit(db, id, req.user, 'OFFICER_REJECTED', prevStatus, 'REJECTED', `Rejected: ${rejection_reason}`, req);
  } else if (action === 'UNDER_REVIEW') {
    issue.status = 'UNDER_REVIEW';
    recordAudit(db, id, req.user, 'OFFICER_REVIEWING', prevStatus, 'UNDER_REVIEW', remarks || 'Officer opened ticket for evidence triage.', req);
  }

  // Handle Priority Adjustment
  if (priority && priority !== issue.priority) {
    const oldP = issue.priority;
    issue.priority = priority;
    const slaHours = SLA_HOURS[priority] || 48;
    issue.sla_deadline = new Date(new Date(issue.created_at).getTime() + slaHours * 60 * 60 * 1000).toISOString();
    recordAudit(db, id, req.user, 'PRIORITY_CHANGED', oldP, priority, `Priority adjusted from ${oldP} to ${priority}. SLA deadline updated.`, req);
  }

  // Handle Department Rerouting
  if (department_code && department_code !== issue.department_code) {
    const oldDept = issue.department_code;
    issue.department_code = department_code;
    recordAudit(db, id, req.user, 'DEPARTMENT_REROUTED', oldDept, department_code, `Jurisdiction rerouted from ${oldDept} to ${department_code}.`, req);
  }

  issue.updated_at = new Date().toISOString();
  saveDB(db);

  res.json(computeSLA(issue));
});

// 10. Dispatch Work Order to Field Technician
app.patch('/api/issues/:id/dispatch/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { worker_id, instructions } = req.body;
  if (!worker_id) return res.status(400).json({ detail: 'Technician worker_id is required' });

  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const worker = db.users.find(u => u.id === worker_id);
  if (!worker) return res.status(404).json({ detail: 'Worker not found' });

  const prevStatus = issue.status;
  issue.status = 'ASSIGNED';
  issue.assigned_worker_id = worker.id;
  issue.assigned_worker_name = worker.name;
  issue.updated_at = new Date().toISOString();

  recordAudit(
    db,
    id,
    req.user,
    'WORKER_ASSIGNED',
    prevStatus,
    'ASSIGNED',
    `Work order dispatched to ${worker.name} (${worker.phone}). Instructions: ${instructions || 'Immediate field redressal'}`,
    req
  );

  saveDB(db);
  res.json(computeSLA(issue));
});

// 11. Worker Lifecycle Transitions (ON_THE_WAY, IN_PROGRESS)
app.patch('/api/issues/:id/status/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const prevStatus = issue.status;
  issue.status = status;
  issue.updated_at = new Date().toISOString();

  const actionName = status === 'ON_THE_WAY'
    ? 'TECHNICIAN_ON_THE_WAY'
    : status === 'IN_PROGRESS'
    ? 'GROUND_REPAIRS_COMMENCED'
    : `STATUS_CHANGED_${status}`;

  recordAudit(db, id, req.user, actionName, prevStatus, status, remarks || `Status transitioned to ${status}`, req);

  saveDB(db);
  res.json(computeSLA(issue));
});

// 12. Worker Completion Proof Upload (DONE)
app.post('/api/issues/:id/evidence/', upload.single('resolution_photo'), authenticateToken, (req, res) => {
  const { id } = req.params;
  const { resolution_notes, materials_deployed } = req.body;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  let photoUrl = issue.resolution_photo;
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.photo_url) {
    photoUrl = req.body.photo_url;
  } else {
    photoUrl = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80';
  }

  let materials = [];
  if (typeof materials_deployed === 'string') {
    try {
      materials = JSON.parse(materials_deployed);
    } catch {
      materials = materials_deployed.split(',').map(m => m.trim());
    }
  } else if (Array.isArray(materials_deployed)) {
    materials = materials_deployed;
  }

  const prevStatus = issue.status;
  issue.status = 'DONE';
  issue.resolution_photo = photoUrl;
  issue.resolution_notes = resolution_notes || 'Physical repair completed and verified on site.';
  issue.materials_deployed = materials;
  issue.updated_at = new Date().toISOString();

  recordAudit(
    db,
    id,
    req.user,
    'EVIDENCE_SUBMITTED_DONE',
    prevStatus,
    'DONE',
    `Repair completed. Materials deployed: ${materials.join(', ')}. Notes: ${issue.resolution_notes}`,
    req
  );

  saveDB(db);
  res.json(computeSLA(issue));
});

// 13. Quality Supervisor Audit (Approve -> VERIFIED -> CLOSED, or Reject -> IN_PROGRESS)
app.patch('/api/issues/:id/verify/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { approved, remarks, rework_notes } = req.body;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const prevStatus = issue.status;

  if (approved) {
    issue.status = 'VERIFIED';
    issue.supervisor_notes = remarks || 'Quality standard approved. Certified compliant.';
    issue.closed_at = new Date().toISOString();
    issue.updated_at = new Date().toISOString();

    recordAudit(
      db,
      id,
      req.user,
      'SUPERVISOR_AUDIT_VERIFIED',
      prevStatus,
      'VERIFIED',
      issue.supervisor_notes,
      req
    );
  } else {
    // Rejected back to field technician for immediate rework
    issue.status = 'IN_PROGRESS';
    issue.supervisor_notes = rework_notes || remarks || 'Work substandard. Sent back for immediate rework.';
    issue.updated_at = new Date().toISOString();

    recordAudit(
      db,
      id,
      req.user,
      'SUPERVISOR_REWORK_REJECTED',
      prevStatus,
      'IN_PROGRESS',
      `Audit rejected: ${issue.supervisor_notes}`,
      req
    );
  }

  saveDB(db);
  res.json(computeSLA(issue));
});

// 14. Citizen Reopen (48h Window Guarantee)
app.post('/api/issues/:id/reopen/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ detail: 'Reason for reopening is mandatory.' });

  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const prevStatus = issue.status;
  issue.status = 'REOPENED';
  issue.reopened_at = new Date().toISOString();
  issue.updated_at = new Date().toISOString();

  recordAudit(
    db,
    id,
    req.user,
    'CITIZEN_REOPENED_48H',
    prevStatus,
    'REOPENED',
    `Citizen reopened ticket: "${reason}"`,
    req
  );

  saveDB(db);
  res.json(computeSLA(issue));
});

// 15. Citizen Rating & Feedback
app.post('/api/issues/:id/rate/', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  issue.satisfaction_rating = rating;
  issue.citizen_feedback = feedback;
  issue.updated_at = new Date().toISOString();

  recordAudit(
    db,
    id,
    req.user,
    'CITIZEN_RATED_RESOLUTION',
    issue.status,
    issue.status,
    `Citizen submitted satisfaction rating: ${rating}/5. Feedback: "${feedback || 'None'}"`,
    req
  );

  saveDB(db);
  res.json(computeSLA(issue));
});

// 16. Upvote Issue
app.post('/api/issues/:id/upvote/', optionalAuth, (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ detail: 'Grievance not found' });

  const userId = req.user ? req.user.id : (req.body.user_id || 'anon_' + req.ip);
  if (!issue.upvoted_by) issue.upvoted_by = [];

  const idx = issue.upvoted_by.indexOf(userId);
  if (idx === -1) {
    issue.upvoted_by.push(userId);
    issue.upvotes_count = (issue.upvotes_count || 0) + 1;
  } else {
    issue.upvoted_by.splice(idx, 1);
    issue.upvotes_count = Math.max(0, (issue.upvotes_count || 1) - 1);
  }

  saveDB(db);
  res.json({ upvotes_count: issue.upvotes_count, has_upvoted: issue.upvoted_by.includes(userId) });
});

// 17. Forensic Audit Ledger
app.get('/api/audit/', (req, res) => {
  const { issue_id, action, limit = 100 } = req.query;
  const db = loadDB();
  let audit = db.auditTrail;

  if (issue_id) {
    audit = audit.filter(a => a.issue_id.toUpperCase() === issue_id.toUpperCase());
  }
  if (action) {
    audit = audit.filter(a => a.action === action);
  }

  res.json(audit.slice(0, parseInt(limit)));
});

// 18. Executive Citywide Analytics
app.get('/api/analytics/', (req, res) => {
  const db = loadDB();
  const issues = db.issues.map(computeSLA);

  const total = issues.length;
  const active = issues.filter(i => !['DONE', 'VERIFIED', 'CLOSED', 'REJECTED'].includes(i.status)).length;
  const critical = issues.filter(i => i.priority === 'CRITICAL' && !['DONE', 'VERIFIED', 'CLOSED'].includes(i.status)).length;
  const resolved = issues.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status)).length;
  const breached = issues.filter(i => i.is_breached).length;
  const reopened = issues.filter(i => i.status === 'REOPENED').length;

  // Departmental Caseload & Resolution
  const deptStats = db.departments.map(d => {
    const deptIssues = issues.filter(i => i.department_code === d.code);
    const deptResolved = deptIssues.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status)).length;
    const rate = deptIssues.length ? Math.round((deptResolved / deptIssues.length) * 100) : 100;
    return {
      department: d.name,
      code: d.code,
      total: deptIssues.length,
      resolved: deptResolved,
      active: deptIssues.length - deptResolved,
      rate
    };
  });

  // Lifecycle State Distribution
  const statusCounts = {};
  const allStates = [
    'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED',
    'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'DONE',
    'VERIFIED', 'CLOSED', 'REOPENED'
  ];
  allStates.forEach(s => { statusCounts[s] = 0; });
  issues.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  const stateDistribution = Object.keys(statusCounts).map(status => ({
    name: status.replace(/_/g, ' '),
    value: statusCounts[status]
  }));

  // SLA Compliance by Ward
  const wards = ['Ward 4 - Riverside', 'Ward 7 - West Zone', 'Ward 12 - Suburb', 'Ward 2 - Deccan'];
  const wardCompliance = wards.map(ward => {
    const wardIssues = issues.filter(i => i.ward === ward);
    const compliant = wardIssues.filter(i => !i.is_breached).length;
    const rate = wardIssues.length ? Math.round((compliant / wardIssues.length) * 100) : 100;
    return {
      ward,
      total: wardIssues.length,
      compliant,
      rate
    };
  });

  res.json({
    metrics: {
      total,
      active,
      critical,
      resolved,
      breached,
      reopened,
      resolution_rate: total ? Math.round((resolved / total) * 100) : 0
    },
    department_load: deptStats,
    state_distribution: stateDistribution,
    ward_compliance: wardCompliance
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` SmartCivic Full-Stack REST API running on port ${PORT}`);
  console.log(` Ready to handle municipal grievances with SLA Matrix`);
  console.log(`=======================================================`);
});

