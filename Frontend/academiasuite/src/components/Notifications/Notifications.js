import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' });
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        // Add read status to each notification
        const notificationsWithReadStatus = data.notifications.map(notification => ({
          ...notification,
          read: false // Initially all notifications are unread
        }));
        
        setNotifications(notificationsWithReadStatus);
        setUnreadCount(notificationsWithReadStatus.length);
      } else {
        toast.error('Failed to fetch notifications', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications: ' + error.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read in the database
      const response = await fetch(`http://localhost:5000/api/notifications/${notification.id}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update local state
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setEmailStatus({
        type: 'error',
        message: 'Please upload a PDF file'
      });
    }
  };

  const handleSendEmails = async () => {
    if (!selectedFile || !emailSubject || !emailMessage) {
      toast.error('Please fill all fields and upload a PDF', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    // Close dialog immediately
    setShowEmailDialog(false);
    setSendingEmails(true);
    setProgress({ current: 0, total: 0, status: 'Preparing to send emails...' });
    
    try {
      // Convert PDF to base64
      const base64PDF = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to convert PDF'));
        reader.readAsDataURL(selectedFile);
      });

      // Update progress for API call
      setProgress(prev => ({
        ...prev,
        status: 'Sending emails to students...'
      }));
      
      // Send to backend
      const response = await fetch('http://localhost:5000/api/send-pdf-to-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfData: base64PDF,
          subject: emailSubject,
          message: emailMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update progress
        setProgress(prev => ({
          ...prev,
          current: data.sentCount,
          total: data.sentCount + data.failedCount,
          status: `Successfully sent ${data.sentCount} emails`
        }));

        // Add success notification
        setNotifications(prev => [{
          id: Date.now(),
          type: 'success',
          message: `PDF "${selectedFile.name}" sent to ${data.sentCount} students`,
          timestamp: new Date().toISOString(),
          read: false
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show success toast
        toast.success(`Successfully sent PDF to ${data.sentCount} students`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        // Reset states
        setSelectedFile(null);
        setEmailSubject('');
        setEmailMessage('');
        setEmailStatus({ type: '', message: '' });
      } else {
        setProgress(prev => ({
          ...prev,
          status: 'Failed to send emails'
        }));
        toast.error(data.message || 'Failed to send emails', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        status: 'Error occurred while sending emails'
      }));
      toast.error('Error sending emails: ' + error.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setSendingEmails(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Loading overlay when sending emails */}
      {sendingEmails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex flex-col items-center space-y-4">
              <CircularProgress size={40} />
              <Typography variant="h6" className="text-center">
                {progress.status}
              </Typography>
              {progress.total > 0 && (
                <Typography variant="body2" color="textSecondary">
                  {progress.current} / {progress.total} emails sent
                </Typography>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" component="h1" className="text-gray-800">
            Send Notice to Students
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => setShowEmailDialog(true)}
          >
            Send PDF
          </Button>
        </div>

        {emailStatus.message && (
          <Alert severity={emailStatus.type} className="mb-4">
            {emailStatus.message}
          </Alert>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" component="h1" className="text-gray-800">
            Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <>
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    className={!notification.read ? 'bg-blue-50' : ''}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={formatTimestamp(notification.timestamp)}
                      className={!notification.read ? 'font-semibold' : ''}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            {notifications.length === 0 && (
              <Typography variant="body1" className="text-center text-gray-500 py-4">
                No notifications available
              </Typography>
            )}
          </>
        )}
      </div>

      <Dialog 
        open={showEmailDialog} 
        onClose={() => !sendingEmails && setShowEmailDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Send Notice to Students</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
                disabled={sendingEmails}
              />
              <label htmlFor="pdf-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                  disabled={sendingEmails}
                >
                  {selectedFile ? selectedFile.name : 'Upload PDF'}
                </Button>
              </label>
            </div>

            <TextField
              label="Email Subject"
              fullWidth
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
              disabled={sendingEmails}
            />

            <TextField
              label="Email Message"
              fullWidth
              multiline
              rows={4}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              required
              disabled={sendingEmails}
            />

            {sendingEmails && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body2" color="textSecondary">
                    {progress.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {progress.current} / {progress.total}
                  </Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={(progress.current / (progress.total || 1)) * 100} 
                />
                <Typography variant="caption" color="textSecondary" className="mt-2 block text-center">
                  Please wait while we send the emails...
                </Typography>
              </div>
            )}

            {emailStatus.message && (
              <Alert 
                severity={emailStatus.type} 
                className="mt-4"
                onClose={() => setEmailStatus({ type: '', message: '' })}
              >
                {emailStatus.message}
              </Alert>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowEmailDialog(false)} 
            disabled={sendingEmails}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmails}
            variant="contained"
            startIcon={sendingEmails ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={sendingEmails}
          >
            {sendingEmails ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Notifications; 