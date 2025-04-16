const express =require('express') 
require('dotenv').config();
const sqlite3=require('sqlite3').verbose()
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');

// Verbose is used to enable  more detailed logging of SQL statements executed by the SQLite database  for debugging 
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.json());

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Enable debug mode
    logger: true // Enable logging
});

// Function to send email notification
const sendBackupNotification = async (status, error = null) => {
    try {
        console.log('=== Email Configuration ===');
        console.log('From Email:', process.env.EMAIL_USER);
        console.log('To Email:', process.env.ADMIN_EMAIL);
        console.log('Password Length:', process.env.EMAIL_PASSWORD.length);
        console.log('Attempting to send email notification...');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Database Backup ${status}`,
            html: `
                <h2>Database Backup Status</h2>
                <p>Backup process completed with status: <strong>${status}</strong></p>
                ${error ? `<p>Error details: ${error}</p>` : ''}
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>This is an automated message from your database backup system.</p>
            `
        };

        console.log('Mail Options:', JSON.stringify(mailOptions, null, 2));

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        console.error('Error details:', {
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode
        });
        return false;
    }
};

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
}

// Function to create a backup
const createBackup = async () => {
    const dbPath = path.join(__dirname, 'db', 'database.sqlite');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, `database_backup_${timestamp}.sqlite`);
    
    try {
        console.log('=== Starting Backup Process ===');
        console.log('Database path:', dbPath);
        console.log('Backup path:', backupPath);
        
        // Check if database file exists
        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found');
        }
        
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Backup created successfully at ${backupPath}`);
        
        // Clean up old backups (keep only last 7 days)
        const files = fs.readdirSync(backupsDir);
        const now = new Date();
        console.log('Checking for old backups to clean up...');
        
        files.forEach(file => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24); // Age in days
            
            if (fileAge > 7) {
                fs.unlinkSync(filePath);
                console.log(`Deleted old backup: ${file}`);
            }
        });

        // Send success notification
        await sendBackupNotification('SUCCESS');
        console.log('=== Backup Process Completed Successfully ===');
    } catch (err) {
        console.error('Error creating backup:', err);
        // Send error notification
        await sendBackupNotification('FAILED', err.message);
    }
};

// Schedule daily backup at 6 PM
schedule.scheduleJob('0 18 * * *', async () => {
    console.log('Running scheduled backup at 6 PM...');
    await createBackup();
});

// Function to initialize database
const initializeDatabase = (db) => {
    return new Promise((resolve, reject) => {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute each statement
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error creating tables:', err);
                reject(err);
            } else {
                console.log('Database tables created successfully');
                
                // Check if data already exists
                db.get("SELECT COUNT(*) as count FROM students", [], (err, row) => {
                    if (err) {
                        console.error('Error checking existing data:', err);
                        reject(err);
                    } else if (row.count === 0) {
                        // Only load sample data if no data exists
                        const seedPath = path.join(__dirname, 'db', 'seed.sql');
                        const seedData = fs.readFileSync(seedPath, 'utf8');
                        
                        db.exec(seedData, (err) => {
                            if (err) {
                                console.error('Error loading sample data:', err);
                                reject(err);
                            } else {
                                console.log('Sample data loaded successfully');
                                resolve();
                            }
                        });
                    } else {
                        console.log('Data already exists, skipping sample data load');
                        resolve();
                    }
                });
            }
        });
    });
};

const db= new sqlite3.Database('db/database.sqlite', async (err) => {
    if(err){
        console.error(err.message);
    }
    else {
        console.log('Connected to the SQLite database.');
        try {
            await initializeDatabase(db);
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }
});

app.get('/api/data', (req, res) => {
    const sql = 'SELECT * FROM subject_master';
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.json(rows);
    });
  });

// New endpoint to fetch marks data
app.post('/api/marks-data', (req, res) => {
    const { year, branch, semester, exam, pattern, subject } = req.body;
    
    // Basic validation
    if (!year || !branch || !semester || !exam || !pattern || !subject) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const sql = `
        SELECT 
            s.student_id,
            s.seat_no,
            s.student_name,
            m.credit,
            m.ese_marks,
            m.ia_marks
        FROM 
            students s
        JOIN 
            marks m ON s.student_id = m.student_id
        JOIN 
            exams e ON m.exam_id = e.exam_id
        WHERE 
            e.year = ? AND
            e.branch = ? AND
            e.semester = ? AND
            e.exam_type = ? AND
            e.pattern = ? AND
            m.subject = ?
    `;

    db.all(sql, [year, branch, semester, exam, pattern, subject], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Backup endpoint
app.get('/api/backup', async (req, res) => {
    const dbPath = path.join(__dirname, 'db', 'database.sqlite');
    
    try {
        // Check if the database file exists
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database file not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=database_backup_${new Date().toISOString().split('T')[0]}.sqlite`);

        // Stream the file to the response
        const fileStream = fs.createReadStream(dbPath);
        fileStream.pipe(res);

        // Send success notification
        await sendBackupNotification('MANUAL_BACKUP_SUCCESS');

        fileStream.on('error', (err) => {
            console.error('Error streaming database file:', err);
            // Send error notification
            sendBackupNotification('MANUAL_BACKUP_FAILED', err.message);
            res.status(500).json({ error: 'Error downloading database file' });
        });
    } catch (err) {
        console.error('Error creating backup:', err);
        // Send error notification
        await sendBackupNotification('MANUAL_BACKUP_FAILED', err.message);
        res.status(500).json({ error: 'Error creating backup' });
    }
});

// New endpoint to get backup history
app.get('/api/backup-history', (req, res) => {
    try {
        const files = fs.readdirSync(backupsDir);
        const backups = files.map(file => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            return {
                filename: file,
                size: stats.size,
                created: stats.mtime,
                path: filePath
            };
        });
        
        // Sort by creation date (newest first)
        backups.sort((a, b) => b.created - a.created);
        res.json(backups);
    } catch (err) {
        console.error('Error getting backup history:', err);
        res.status(500).json({ error: 'Error getting backup history' });
    }
});

// New endpoint to download specific backup
app.get('/api/backup/:filename', (req, res) => {
    const backupPath = path.join(backupsDir, req.params.filename);
    
    // Check if the backup file exists
    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: 'Backup file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(backupPath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
        console.error('Error streaming backup file:', err);
        res.status(500).json({ error: 'Error downloading backup file' });
    });
});

// Backup restore endpoint
app.post('/api/restore/:filename', async (req, res) => {
    const backupPath = path.join(backupsDir, req.params.filename);
    const dbPath = path.join(__dirname, 'db', 'database.sqlite');
    
    try {
        // Check if the backup file exists
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }

        // Create a backup of the current database before restoring
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const currentBackupPath = path.join(backupsDir, `pre_restore_backup_${timestamp}.sqlite`);
        fs.copyFileSync(dbPath, currentBackupPath);

        // Restore the database
        fs.copyFileSync(backupPath, dbPath);

        // Send success notification
        await sendBackupNotification('RESTORE_SUCCESS', `Database restored from ${req.params.filename}`);

        res.json({ success: true, message: 'Database restored successfully' });
    } catch (err) {
        console.error('Error restoring backup:', err);
        // Send error notification
        await sendBackupNotification('RESTORE_FAILED', err.message);
        res.status(500).json({ error: 'Error restoring backup' });
    }
});

// New endpoint to send PDF to students
app.post('/api/send-pdf-to-students', async (req, res) => {
    const { pdfData, subject, message } = req.body;

    if (!pdfData || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: pdfData, subject, or message' 
        });
    }

    try {
        // Get all students with email addresses
        const students = await new Promise((resolve, reject) => {
            db.all('SELECT student_id, name, email FROM student WHERE email IS NOT NULL', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (students.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No students found with email addresses' 
            });
        }

        // Convert base64 PDF to buffer
        const pdfBuffer = Buffer.from(pdfData, 'base64');

        // Send email to each student
        const sentEmails = [];
        const failedEmails = [];

        for (const student of students) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject: subject,
                    html: `
                        <h2>Dear ${student.name},</h2>
                        <p>${message}</p>
                        <p>Please find the attached document.</p>
                        <p>Best regards,<br>AcademiaSuite</p>
                    `,
                    attachments: [{
                        filename: 'notice.pdf',
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                };

                await transporter.sendMail(mailOptions);
                sentEmails.push(student.email);
            } catch (err) {
                console.error(`Failed to send email to ${student.email}:`, err);
                failedEmails.push(student.email);
            }
        }

        // Create a notification in the database
        const notification = {
            id: Date.now(),
            type: 'info',
            message: `PDF notice sent to ${sentEmails.length} students`,
            timestamp: new Date().toISOString()
        };

        // Save notification to database (you'll need to create a notifications table)
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO notifications (id, type, message, timestamp) VALUES (?, ?, ?, ?)',
                [notification.id, notification.type, notification.message, notification.timestamp],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            success: true,
            sentCount: sentEmails.length,
            failedCount: failedEmails.length,
            sentEmails,
            failedEmails,
            message: `Successfully sent to ${sentEmails.length} students, failed for ${failedEmails.length} students`
        });

    } catch (err) {
        console.error('Error sending PDF to students:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending PDF to students: ' + err.message 
        });
    }
});

// Get all notifications
app.get('/api/notifications', (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
      return;
    }
    res.json({ success: true, notifications: rows });
  });
});

// Mark notification as read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error marking notification as read:', err);
      res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    
    res.json({ success: true });
  });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  