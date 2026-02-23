import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Bell, Search, Settings, LayoutDashboard, Building2, CheckSquare,
    Calendar, BarChart3, FileText, UserCheck, LogOut, Plus, X, Heart, Share2,
    MessageSquare, ChevronDown, Smile, MoreHorizontal, Rocket, Clock
} from 'lucide-react';
import './App.css';

const API_URL = 'http://127.0.0.1:8000';

// --- Icon Mapping ---
const IconMap = {
    LayoutDashboard: <LayoutDashboard size={20} />,
    Building2: <Building2 size={20} />,
    CheckSquare: <CheckSquare size={20} />,
    Calendar: <Calendar size={20} />,
    BarChart3: <BarChart3 size={20} />,
    FileText: <FileText size={20} />,
    UserCheck: <UserCheck size={20} />,
};

// --- Components ---

const Sidebar = ({ config }) => {
    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="logo-container">
                <h1 className="logo">StafiO</h1>
            </div>
            <nav>
                {config.map((item, idx) => (
                    <div key={idx} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                        {item.path ? (
                            <Link to={item.path} className="nav-link">
                                <span className="icon">{IconMap[item.icon]}</span>
                                <span className="label">{item.name}</span>
                            </Link>
                        ) : (
                            <div className="nav-link">
                                <span className="icon">{IconMap[item.icon]}</span>
                                <span className="label">{item.name}</span>
                                {item.hasSub && <ChevronDown size={14} className="chevron" />}
                            </div>
                        )}
                    </div>
                ))}
                <div className="nav-item logout">
                    <div className="nav-link">
                        <span className="icon"><LogOut size={20} /></span>
                        <span className="label">Logout</span>
                    </div>
                </div>
            </nav>
            <div className="sidebar-footer-img">
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/man-marking-attendance-on-calendar-illustration-download-in-svg-png-gif-file-formats--schedule-event-day-pack-business-illustrations-4716127.png" alt="Illustration" />
            </div>
        </div>
    );
};

const Header = ({ user, onBellClick }) => (
    <header className="header">
        <div className="header-left">
            <div className="brand-logo-small">
                <div className="logo-dots">
                    <div className="dot blue"></div>
                    <div className="dot dark"></div>
                    <div className="dot blue"></div>
                </div>
            </div>
            <div className="search-container">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Quick Search..." />
            </div>
        </div>
        <div className="header-right">
            <div className="header-icon notification-bell" onClick={onBellClick}>
                <Bell size={22} fill="rgba(255, 77, 79, 0.1)" color="#ff4d4f" className="bell-svg" />
                <span className="notification-dot"></span>
            </div>
            <div className="header-icon"><Settings size={22} color="#26C6DA" /></div>
            <div className="user-profile">
                <img src={user.img} alt={user.name} />
                <div className="user-meta">
                    <span className="name">{user.name}</span>
                    <span className="role">{user.role}</span>
                </div>
            </div>
        </div>
    </header>
);

const AttendanceChart = ({ attendance }) => {
    return (
        <div className="chart-card">
            <div className="chart-header">
                <h3>Monthly Attendance</h3>
                <Settings size={16} color="#999" />
            </div>
            <div className="chart-body">
                <div className="y-axis">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0</span>
                </div>
                <div className="bars-container">
                    {attendance.values.map((val, idx) => (
                        <div key={idx} className="bar-wrapper">
                            <div className="bar" style={{ height: `${val}%` }}>
                                {val === 95 && <span className="bar-label">86%</span>}
                            </div>
                            <span className="month-label">{attendance.months[idx]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Pages ---

const Dashboard = ({ announcements, user, stats, attendance, hero }) => {
    const latestAnn = announcements[0];

    return (
        <div className="dashboard-container">
            <h2 className="welcome-text">Hello, {user.name}!</h2>
            <div className="approval-alert">
                <span>You have <span className="highlight">{user.pending_approvals} Pending Approvals</span> & <span className="highlight">{user.leave_requests} Leave Requests</span></span>
                <X size={16} className="close-alert" />
            </div>

            <div className="main-featured-card">
                <div className="featured-content">
                    <div className="time-weather">
                        <div className="weather-icon"><Smile size={32} /></div>
                        <div className="current-time">9:01:09 AM, 10 Aug 2025</div>
                    </div>
                    <div className="event-tag">
                        <div className="event-info">
                            <span className="event-title">{hero.event_title}</span>
                            <span className="event-count">{hero.event_count}</span>
                        </div>
                        <div className="event-avatars">
                            {hero.avatars.map((url, i) => (
                                <img key={i} src={url} alt={`u${i}`} />
                            ))}
                            <div className="avatar-more">{hero.more_avatars}</div>
                        </div>
                    </div>
                    <button className="punch-btn">Punch In</button>
                </div>
                <div className="featured-illustration">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/marking-attendance-on-calendar-illustration-download-in-svg-png-gif-file-formats--appointment-event-day-pack-business-illustrations-4716127.png" alt="hero" />
                </div>
            </div>

            <div className="dashboard-bottom-grid">
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-header-row">
                                <span className="stat-value">{s.title}</span>
                                <div className="stat-icon-circle" style={{ backgroundColor: s.color + '20', color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                            <div className="stat-label">{s.sub}</div>
                            <div className="stat-footer">
                                <span className="status-dot"></span> {s.desc}
                            </div>
                        </div>
                    ))}
                </div>
                <AttendanceChart attendance={attendance} />
            </div>

            {latestAnn && (
                <div className="announcement-bar">
                    <div className="bar-icon"><Rocket size={20} color="#333" /></div>
                    <div className="bar-content">
                        <div className="bar-title">
                            <strong>{latestAnn.title}</strong>
                            <span className="bar-time">10 mins ago</span>
                        </div>
                        <p className="bar-desc">{latestAnn.message}</p>
                        <div className="bar-actions">
                            <button className="dismiss">Dismiss</button>
                            <Link to="/announcements" className="view-all">View All</Link>
                        </div>
                    </div>
                    <X size={16} className="bar-close" />
                </div>
            )}
        </div>
    );
};

const AnnouncementsPage = ({ announcements }) => {
    const navigate = useNavigate();

    return (
        <div className="announcements-page">
            <div className="ann-header">
                <div className="ann-title-section">
                    <div className="purple-dot"></div>
                    <h2>Announcemet <span>All <ChevronDown size={14} /></span></h2>
                </div>
                <div className="ann-actions">
                    <div className="date-picker">Today, 30 Sep 2025 <ChevronDown size={14} /></div>
                    <button className="add-new-btn" onClick={() => navigate('/add-announcement')}>
                        <div className="plus-circle"><Plus size={16} /></div> Add New
                    </button>
                </div>
            </div>

            <div className="announcements-list">
                {announcements.map((ann) => (
                    <div key={ann.id} className="ann-card">
                        <div className="ann-card-header">
                            <img src={ann.author_img} alt={ann.author} className="author-avatar" />
                            <div className="author-details">
                                <h4 className="author-name">{ann.author}</h4>
                                <span className="author-team">HR & Operations Team ; {ann.date}</span>
                            </div>
                        </div>
                        <h3 className="ann-card-title">{ann.title}</h3>
                        <p className="ann-card-body">{ann.message}</p>
                        <div className="ann-card-reactions">
                            <span className="reaction-text">{ann.reactions}</span>
                        </div>
                        <div className="ann-card-footer">
                            <button className="action-btn"><Smile size={18} /> React</button>
                            <button className="action-btn"><Share2 size={18} /> Share</button>
                            <button className="action-btn"><Calendar size={18} /> {ann.type}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AddAnnouncementPage = ({ onAnnouncementAdded }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        author: 'S.Santhana Lakshmi',
        date: 'August 22, 11:15 am',
        type: 'Event',
        eventDate: '',
        eventName: '',
        eventTime: '',
        eventType: 'Select',
        messageBody: '',
        mention: 'Select',
        userName: '',
        userEmail: '',
        userDesignation: 'Select'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/announcements`, {
                title: formData.eventName || formData.title || "New Event",
                message: formData.messageBody,
                author: formData.userName || "Admin",
                date: new Date().toLocaleString(),
                type: formData.eventType === 'Select' ? 'Event' : formData.eventType
            });
            onAnnouncementAdded(response.data);
            navigate('/announcements');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="purple-dot"></div>
                        <span>addannoncementform</span>
                    </div>
                    <div className="modal-blue-bar">
                        <h2>Add New Announcement</h2>
                        <X className="close-x" onClick={() => navigate('/announcements')} />
                    </div>
                </div>

                <form className="ann-form" onSubmit={handleSubmit}>
                    <div className="upload-box-row">
                        <div className="upload-circle">
                            <div className="user-icon-placeholder">👤</div>
                        </div>
                        <div className="upload-text">
                            <strong>Upload Image</strong>
                            <p>Image should be below 4 mb</p>
                            <button type="button" className="upload-btn-blue">Upload</button>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Event Date</label>
                            <div className="input-with-icon">
                                <input type="text" placeholder="dd/mm/yyyy" />
                                <Calendar size={18} className="field-icon" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Event Name</label>
                            <input type="text" placeholder="Enter name of event" value={formData.eventName} onChange={e => setFormData({ ...formData, eventName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Time Of The Event</label>
                            <input type="text" placeholder="Enter time" />
                        </div>
                        <div className="form-group">
                            <label>Event Type</label>
                            <div className="select-with-icon">
                                <select value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                                    <option>Select</option>
                                    <option>Event</option>
                                    <option>Birthday</option>
                                </select>
                                <ChevronDown size={18} className="field-icon" />
                            </div>
                        </div>
                        <div className="form-group col-span-2">
                            <label>Message</label>
                            <textarea placeholder="Type message" value={formData.messageBody} onChange={e => setFormData({ ...formData, messageBody: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Mention Any Employee</label>
                            <div className="select-with-icon">
                                <select><option>Select</option></select>
                                <ChevronDown size={18} className="field-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="your-details-section">
                        <h3>Your Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" placeholder="Enter your name" value={formData.userName} onChange={e => setFormData({ ...formData, userName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Enter your email" />
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <div className="select-with-icon">
                                    <select><option>Select</option></select>
                                    <ChevronDown size={18} className="field-icon" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="submit-btn-blue">Submit</button>
                        <button type="button" className="cancel-btn-white" onClick={() => navigate('/announcements')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- App Root ---

function App() {
    const [announcements, setAnnouncements] = useState([]);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [sidebarConfig, setSidebarConfig] = useState([]);
    const [heroData, setHeroData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            console.log("Attempting to fetch data from:", API_URL);
            const [annResp, userResp, statsResp, attResp, sideResp, heroResp] = await Promise.all([
                axios.get(`${API_URL}/announcements`),
                axios.get(`${API_URL}/user`),
                axios.get(`${API_URL}/stats`),
                axios.get(`${API_URL}/attendance`),
                axios.get(`${API_URL}/sidebar`),
                axios.get(`${API_URL}/hero`)
            ]);
            setAnnouncements(annResp.data);
            setUser(userResp.data);
            setStats(statsResp.data);
            setAttendance(attResp.data);
            setSidebarConfig(sideResp.data);
            setHeroData(heroResp.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            const msg = err.response
                ? `Server Error: ${err.response.status}`
                : (err.request ? "No Response from Backend" : err.message);
            setError(`Failed to load dashboard data. (${msg})`);
        }
    };

    const handleAdded = (newAnn) => {
        setAnnouncements([newAnn, ...announcements]);
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!user || !attendance || !heroData || sidebarConfig.length === 0)
        return <div className="loading">Loading dashboard configuration...</div>;

    return (
        <div className="app-layout">
            <Sidebar config={sidebarConfig} />
            <div className="main-content">
                <Header user={user} onBellClick={() => navigate('/announcements')} />
                <Routes>
                    <Route path="/" element={<Dashboard announcements={announcements} user={user} stats={stats} attendance={attendance} hero={heroData} />} />
                    <Route path="/announcements" element={<AnnouncementsPage announcements={announcements} />} />
                    <Route path="/add-announcement" element={<AddAnnouncementPage onAnnouncementAdded={handleAdded} />} />
                </Routes>
            </div>
        </div>
    );
}

export default function Root() {
    return (
        <Router>
            <App />
        </Router>
    );
}
