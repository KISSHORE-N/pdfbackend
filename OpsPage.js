import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFiles, transferFile, addFile } from '../../api/BackendApi'; // Ensure addFile is imported
import '../subscriber_main_page/CommonStyles.css';
import Logo from '../subscriber_main_page/assets/logo.png';

// Static User Info for the Header
const opsUser = {
  name: 'Welcome Ops',
  email: 'ops123@standardchartered.com',
};

// Icon Components (locally defined for this file)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const TransferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 17 5 21 5"></polyline><path d="M18.5 22.5A2.5 2.5 0 0 0 21 20V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14.5a2.5 2.5 0 0 0 2.5-2.5z"></path></svg>
);
const CompleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

// Mock Data Generation (Remains the same)
const destinations = ['Client Folder A', 'Client Folder B', 'Compliance_Review', 'Archive_Backup'];
const typeOptions = ['Quarterly', 'Daily', 'Audit', 'Summary'];

const generateRemoteFiles = (count) => {
    // ... (Your mock data generation logic remains here)
    const files = [];
    for (let i = 0; i < count; i++) {
        files.push({
            id: `FILE-${1000 + i}`,
            fileName: `Report_${typeOptions[i % 4]}_${i + 1}.pdf`,
            destinationFolder: destinations[i % 4],
            status: 'Ready to transfer',
            isTransferred: false,
        });
    }
    return files;
};

// Static Data for New File Notifications (FIXED TO PDF EXTENSION)
const notificationFolders = ['Compliance', 'Finance', 'Ops'];
const notificationFiles = [
    { id: 'NEW-1', fileName: 'Q4_Financial_Summary.pdf', destinationFolder: notificationFolders[1], status: 'New' },
    { id: 'NEW-2', fileName: 'Daily_Risk_Log_T1.pdf', destinationFolder: notificationFolders[0], status: 'New' },
    { id: 'NEW-3', fileName: 'Compliance_Check_Oct.pdf', destinationFolder: notificationFolders[0], status: 'New' },
];

// File Status constants (for robust comparison)
const STATUS_TRANSFERRED = 'Transferred';
const STATUS_PROCESSING = 'Processing';

function OpsPage() {
    const navigate = useNavigate();
    const initialFiles = useMemo(() => generateRemoteFiles(50), []);
    const [files, setFiles] = useState(initialFiles);
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState(notificationFiles);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // NEW STATE: To hold the file selected by the user for upload
    const [fileToUpload, setFileToUpload] = useState(null);
    const [uploadMetadata, setUploadMetadata] = useState(null);

    useEffect(() => {
        // Fetch files logic
        const fetchFiles = async () => {
            try {
                const data = await getFiles();
                setFiles(data);
            } catch (err) {
                console.error("error fetching files", err);
            }
        };

        fetchFiles();
    }, []);

    const toggleNotifications = () => {
        setShowNotifications(prev => !prev);
    };

    const handleLogout = () => {
        console.log("Operator Logged out");
        navigate('/');
    };

    const handleTransfer = async (fileId) => {
        const fileToUpdate = files.find(f => f.id === fileId);
        if (!fileToUpdate || fileToUpdate.status === STATUS_TRANSFERRED || fileToUpdate.status === STATUS_PROCESSING) return;

        // Optimistically set status to processing
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: STATUS_PROCESSING } : f));

        try {
            await transferFile(fileId);
            const updateFiles = await getFiles();
            setFiles(updateFiles.map(f => f.id === fileId ? { ...f, status: STATUS_TRANSFERRED } : f));
            alert("File transferred successfully!");
        } catch (err) {
            console.error(err);
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Ready to transfer' } : f)); // Revert status on failure
            alert("Failed to transfer file");
        }
    };

    // NEW LOGIC: This function now prepares the metadata for upload
    const handleGetFile = (notification) => {
        // 1. Remove notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));

        // 2. Set the metadata from the notification. We wait for the user to select the file.
        setUploadMetadata({
            fileName: notification.fileName,
            destinationFolder: notification.destinationFolder,
            status: 'New', // Default status for new upload
            isTransferred: false,
        });
        
        // 3. Open file input window programmatically
        document.getElementById('hiddenFileInput').click();
    };
    
    // NEW LOGIC: Handles the actual file selection and initiates the API call
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        
        if (!file || !uploadMetadata) {
            // Handle case where file selection is cancelled or metadata is missing
            setUploadMetadata(null);
            return;
        }

        // 1. Create FormData object
        const formData = new FormData();
        // Backend keys: 'file', 'destinationFolder', 'status'
        formData.append('file', file);
        formData.append('destinationFolder', uploadMetadata.destinationFolder);
        formData.append('status', uploadMetadata.status);

        // 2. Initiate upload
        try {
            // We can optionally use the file name from the selected file or from the metadata
            console.log(`Uploading file: ${file.name}`);
            await addFile(formData);

            // 3. Clear state and refresh table
            setFileToUpload(null);
            setUploadMetadata(null);
            
            const updateFiles = await getFiles();
            setFiles(updateFiles);
            alert(`File ${file.name} uploaded and routed successfully!`);
            
        } catch (err) {
            console.error("Upload failed:", err);
            alert(`File upload failed: ${err.message || 'Check console for details'}`);
        }
    };


    const filteredFiles = files.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            {/* HIDDEN FILE INPUT: Used for programmatically triggering file selection */}
            <input 
                type="file" 
                id="hiddenFileInput" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
                // Reset file input value after selection to allow uploading the same file twice
                onClick={(event)=> { event.target.value = null }}
                accept=".pdf" // Restrict to PDF files
            />

            {/* NAVBAR / HEADER */}
            <header className="main-header" style={{ justifyContent: 'space-between' }}>
                <div className="header-left-content">
                    <img src={Logo} alt="Standard Chartered SC Logo" className="sc-logo" />
                </div>
                
                {/* User Profile and Actions */}
                <div className="user-profile-actions">
                    <div className="user-profile">
                        <h1 className="user-name">{opsUser.name}</h1>
                        <p className="user-email">{opsUser.email}</p>
                    </div>

                    {/* RIGHT SIDE: Notification Toggle & Logout (Group 2) */}
                    <div className="header-actions">
                        {/* Notification Toggle Button */}
                        <button className={`notification-toggle-button ${showNotifications ? 'active' : ''}`} onClick={toggleNotifications}>
                            <NotificationIcon />
                            {notifications.length > 0 && 
                                <span className="notification-badge">{notifications.length}</span>
                            }
                        </button>

                        {/* Logout Button */}
                        <button className="action-button logout-button" onClick={handleLogout} title="Logout Operator">
                            <LogoutIcon /> 
                            <span className="button-text">Logout Operator</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN DASHBOARD CONTENT AREA */}
            <div className="dashboard-content ops-page-container" style={{ gridTemplateColumns: showNotifications ? '3fr 1fr' : '1fr' }}>
                {/* MAIN CONTENT: Search and Table (100% width) */}
                <div className="ops-main-content">
                    <div className="search-input-group">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search File ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="sc-search-input"
                        />
                    </div>

                    {/* Transfer Table */}
                    <div className="reports-area transfer-table-card">
                        <h2 className="table-subtitle">Files Ready for Action ({filteredFiles.length} found)</h2>
                        
                        <div className="data-table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>File ID</th>
                                        <th style={{ width: '35%' }}>File Name</th>
                                        <th style={{ width: '25%' }}>Destination Folder</th>
                                        <th style={{ width: '10%' }}>Status</th>
                                        <th style={{ width: '15%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.length > 0 ? (
                                        filteredFiles.map(file => (
                                            <tr key={file.id}>
                                                <td>{file.id}</td>
                                                <td title={file.fileName} className="report-description">{file.fileName}</td>
                                                <td>
                                                    <span className="destination-tag" title={file.destinationFolder}>{file.destinationFolder}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-tag status-${file.status.toLowerCase().replace(/ /g, '-')}`}>{file.status}</span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="action-button transfer-button"
                                                        onClick={() => handleTransfer(file.id)}
                                                        disabled={file.status === STATUS_TRANSFERRED || file.status === STATUS_PROCESSING}
                                                    >
                                                        {file.status === STATUS_TRANSFERRED && <CompleteIcon />}
                                                        {file.status === STATUS_PROCESSING ? 'Moving...' : 'Transfer'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-reports">No files found matching the criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Notification Panel (Fixed Position, Controlled by JS) */}
                <div className={`ops-notification-panel ${showNotifications ? 'visible' : ''}`}>
                    <div className="notification-panel-header">
                        <h3 className="notification-title">New File Arrivals ({notifications.length})</h3>
                        <button className="notification-action-button close-sidebar-button" onClick={toggleNotifications}>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="notification-list-scroll">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className="ops-notification-item">
                                    <div className="item-details">
                                        <strong className="item-file-name">{n.fileName}</strong>
                                        <span className="item-destination">To: {n.destinationFolder}</span>
                                    </div>
                                    <button onClick={() => handleGetFile(n)} className="action-button get-file-button">
                                        <AddIcon /> Get File
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-reports">No new files waiting.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OpsPage;
// Note: LogoutIcon and LogoutButton are not defined in the images but are used in the JSX.
// Assuming they are imported/defined elsewhere, or I'm using a placeholder 'LogoutIcon'.
// I'll define LogoutIcon for completeness.
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
