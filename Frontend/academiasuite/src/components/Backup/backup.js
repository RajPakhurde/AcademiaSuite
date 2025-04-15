import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';
import { format } from 'date-fns';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

const Backup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchBackupHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/backup-history');
      setBackups(response.data);
    } catch (err) {
      setError('Failed to fetch backup history');
      console.error('Error fetching backup history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setError(null);
      setBackupStatus(null);

      const response = await api.get('/api/backup', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `database_backup_${new Date().toISOString().split('T')[0]}.sqlite`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setBackupStatus('Backup downloaded successfully!');
      fetchBackupHistory(); // Refresh the backup history
    } catch (err) {
      setError('An error occurred during backup. Please try again.');
      console.error('Backup error:', err);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      const response = await api.get(`/api/backup/${backup.filename}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download backup');
      console.error('Download error:', err);
    }
  };

  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    try {
      setIsRestoring(true);
      setError(null);
      setBackupStatus(null);

      const response = await api.post(`/api/restore/${selectedBackup.filename}`);
      
      if (response.data.success) {
        setBackupStatus('Database restored successfully!');
        fetchBackupHistory(); // Refresh the backup list
      } else {
        setError('Failed to restore backup');
      }
    } catch (err) {
      setError('An error occurred during restore. Please try again.');
      console.error('Restore error:', err);
    } finally {
      setIsRestoring(false);
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setSelectedBackup(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Database Backup
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isBackingUp ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? 'Preparing Backup...' : 'Create New Backup'}
          </Button>
          <Tooltip title="Refresh backup history">
            <IconButton onClick={fetchBackupHistory} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Typography variant="body1" paragraph>
        Automatic backups are created daily at 6 PM. You can also create manual backups at any time.
      </Typography>

      {backupStatus && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {backupStatus}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 3}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Backup Date</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : backups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No backups available
                </TableCell>
              </TableRow>
            ) : (
              backups.map((backup) => (
                <TableRow key={backup.filename}>
                  <TableCell>
                    {format(new Date(backup.created), 'PPpp')}
                  </TableCell>
                  <TableCell>{backup.filename}</TableCell>
                  <TableCell>{formatFileSize(backup.size)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download backup">
                      <IconButton onClick={() => handleDownloadBackup(backup)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore from this backup">
                      <IconButton 
                        onClick={() => handleRestoreClick(backup)}
                        color="warning"
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={handleRestoreCancel}
      >
        <DialogTitle>Confirm Database Restore</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore the database from this backup?
            <br />
            <strong>Warning:</strong> This will replace your current database with the backup version.
            <br />
            A backup of your current database will be created before the restore.
          </DialogContentText>
          {selectedBackup && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Backup Details:</Typography>
              <Typography>Date: {format(new Date(selectedBackup.created), 'PPpp')}</Typography>
              <Typography>File: {selectedBackup.filename}</Typography>
              <Typography>Size: {formatFileSize(selectedBackup.size)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestoreCancel} disabled={isRestoring}>
            Cancel
          </Button>
          <Button 
            onClick={handleRestoreConfirm} 
            color="warning"
            disabled={isRestoring}
            startIcon={isRestoring ? <CircularProgress size={20} /> : <RestoreIcon />}
          >
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Backup;
