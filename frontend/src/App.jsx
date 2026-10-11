
import { useState } from "react";
import "./App.css";

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "report-missing":
        return <ReportMissing setActivePage={setActivePage} />;
      case "report-found":
        return <ReportFound setActivePage={setActivePage} />;
      case "search":
        return <SearchDocuments />;
      case "login":
        return <Login setActivePage={setActivePage} />;
      case "register":
        return <Register setActivePage={setActivePage} />;
      default:
        return <Home setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

/* ================= NAVBAR ================= */
function Navbar({ activePage, setActivePage }) {
  return (
    <nav className="navbar">
      <div className="logo" onClick={() => setActivePage("home")}>
        <span className="logo-icon">📄</span>
        <span>DocFind</span>
      </div>
      <div className="nav-links">
        <button className={activePage === "home"? "active" : ""} onClick={() => setActivePage("home")}>Home</button>
        <button className={activePage === "report-missing"? "active" : ""} onClick={() => setActivePage("report-missing")}>Report Missing</button>
        <button className={activePage === "report-found"? "active" : ""} onClick={() => setActivePage("report-found")}>Report Found</button>
        <button className={activePage === "search"? "active" : ""} onClick={() => setActivePage("search")}>Search</button>
      </div>
      <div className="auth-buttons">
        <button className="login-btn" onClick={() => setActivePage("login")}>Login</button>
        <button className="register-btn" onClick={() => setActivePage("register")}>Register</button>
      </div>
    </nav>
  );
}

/* ================= HOME ================= */
function Home({ setActivePage }) {
  return (
    <section className="home">
      <div className="hero">
        <div className="hero-content">
          <div className="badge">🔐 Secure • Cloud Based • Reliable</div>
          <h1>Find What You Lost.<br /><span>Report What You Found.</span></h1>
          <p>A secure cloud-based platform for reporting, searching and recovering missing documents.</p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => setActivePage("report-missing")}>Report Missing Document</button>
            <button className="secondary-btn" onClick={() => setActivePage("report-found")}>Report Found Document</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="document-icon">📄</div>
          <h3>Document Recovery</h3>
          <p>Your reports are securely stored and managed using cloud technology.</p>
          <div className="status"><span className="status-dot"></span>System Online</div>
        </div>
      </div>
      <div className="features">
        <Feature icon="🔍" title="Easy Search" text="Search for reported missing and found documents." />
        <Feature icon="☁️" title="Cloud Storage" text="Document information is securely stored in the cloud." />
        <Feature icon="🔔" title="Notifications" text="Receive notifications when a possible match is found." />
        <Feature icon="🛡️" title="Secure" text="Authentication and access control protect your information." />
      </div>
      <div className="how-section">
        <h2>How It Works</h2>
        <p className="section-description">Recovering a missing document is simple.</p>
        <div className="steps">
          <Step number="1" title="Report" text="Report your missing or found document." />
          <Step number="2" title="Search" text="The system searches available reports." />
          <Step number="3" title="Match" text="Possible missing and found documents are matched." />
          <Step number="4" title="Recover" text="Verify the match and recover your document." />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text }) {
  return (<div className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>);
}
function Step({ number, title, text }) {
  return (<div className="step"><div className="step-number">{number}</div><h3>{title}</h3><p>{text}</p></div>);
}

/* ================= REPORT MISSING - FIXED WITH FIREBASE ================= */
function ReportMissing({ setActivePage }) {
  const [formData, setFormData] = useState({
    documentType: "", documentName: "", documentNumber: "", lostDate: "", lostLocation: "", description: "", image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({...formData, [name]: files? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "missingDocuments"), {
       ...formData,
        image: formData.image? formData.image.name : "",
        status: "missing",
        createdAt: serverTimestamp()
      });
      alert("✅ Missing document report SAVED to Firebase successfully!");
      setActivePage("home");
    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-container">
        <div className="form-header"><div className="form-icon">🔎</div><h1>Report Missing Document</h1><p>Provide the details below to report your missing document.</p></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Document Type</label><select name="documentType" value={formData.documentType} onChange={handleChange} required><option value="">Select document type</option><option>Aadhaar Card</option><option>PAN Card</option><option>Driving License</option><option>Passport</option><option>Voter ID</option><option>College ID</option><option>Employee ID</option><option>Vehicle Registration</option><option>Other</option></select></div>
            <div className="form-group"><label>Document Name</label><input type="text" name="documentName" placeholder="Enter document name" value={formData.documentName} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Document Number</label><input type="text" name="documentNumber" placeholder="Enter document number" value={formData.documentNumber} onChange={handleChange} required /><small>Your complete document number should not be publicly displayed.</small></div>
            <div className="form-group"><label>Lost Date</label><input type="date" name="lostDate" value={formData.lostDate} onChange={handleChange} required /></div>
          </div>
          <div className="form-group"><label>Lost Location</label><input type="text" name="lostLocation" placeholder="Example: Belagavi Bus Stand" value={formData.lostLocation} onChange={handleChange} required /></div>
          <div className="form-group"><label>Description</label><textarea name="description" rows="5" placeholder="Describe where and how you lost the document..." value={formData.description} onChange={handleChange} required></textarea></div>
          <div className="form-group"><label>Upload Document Image</label><input type="file" name="image" accept="image/png,image/jpeg" onChange={handleChange} /><small>Accepted formats: JPG and PNG</small></div>
          <button type="submit" className="submit-btn" disabled={loading}>{loading? "Saving to Firebase..." : "Submit Missing Report"}</button>
        </form>
      </div>
    </section>
  );
}

/* ================= REPORT FOUND - FIXED WITH FIREBASE ================= */
function ReportFound({ setActivePage }) {
  const [formData, setFormData] = useState({
    documentType: "", documentName: "", foundDate: "", foundLocation: "", description: "", image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({...formData, [name]: files? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "foundDocuments"), {
       ...formData,
        image: formData.image? formData.image.name : "",
        status: "found",
        createdAt: serverTimestamp()
      });
      alert("✅ Found document report SAVED to Firebase successfully!");
      setActivePage("home");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-container">
        <div className="form-header"><div className="form-icon">📦</div><h1>Report Found Document</h1><p>Help someone recover their missing document.</p></div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Document Type</label><select name="documentType" value={formData.documentType} onChange={handleChange} required><option value="">Select document type</option><option>Aadhaar Card</option><option>PAN Card</option><option>Driving License</option><option>Passport</option><option>Voter ID</option><option>College ID</option><option>Employee ID</option><option>Vehicle Registration</option><option>Other</option></select></div>
            <div className="form-group"><label>Document Name</label><input type="text" name="documentName" placeholder="Enter document name" value={formData.documentName} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Found Date</label><input type="date" name="foundDate" value={formData.foundDate} onChange={handleChange} required /></div>
            <div className="form-group"><label>Found Location</label><input type="text" name="foundLocation" placeholder="Example: Belagavi Railway Station" value={formData.foundLocation} onChange={handleChange} required /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea name="description" rows="5" placeholder="Describe where you found the document..." value={formData.description} onChange={handleChange} required></textarea></div>
          <div className="form-group"><label>Upload Document Image</label><input type="file" name="image" accept="image/png,image/jpeg" onChange={handleChange} /></div>
          <button type="submit" className="submit-btn" disabled={loading}>{loading? "Saving to Firebase..." : "Submit Found Report"}</button>
        </form>
      </div>
    </section>
  );
}


/* ================= SEARCH ================= */

function SearchDocuments() {
  const [documentType, setDocumentType] = useState("");
  const [location, setLocation] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const snapshot = await getDocs(
        collection(db, "foundDocuments")
      );

      const documents = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      const filtered = documents.filter((doc) => {
        const matchesType =
          !documentType ||
          doc.documentType?.toLowerCase() ===
            documentType.toLowerCase();

        const matchesLocation =
          !location ||
          doc.foundLocation?.toLowerCase().includes(
            location.trim().toLowerCase()
          );

        return matchesType && matchesLocation;
      });

      setResults(filtered);
    } catch (err) {
      console.error("Search failed:", err);
      setError(
        "Unable to load reports. Check your internet connection and Firestore rules."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="search-page">
      <div className="search-container">
        <h1>Search Documents</h1>
        <p>Search reports of documents that have been found.</p>

        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">All Documents</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="College ID">College ID</option>
                <option value="Employee ID">Employee ID</option>
                <option value="Vehicle Registration">Vehicle Registration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Search"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {searched && !loading && !error && (
          <div className="search-result">
            <h2>Search Results ({results.length})</h2>

            {results.length === 0 ? (
              <p>No matching found-document reports were found.</p>
            ) : (
              results.map((doc) => (
                <div className="result-card" key={doc.id}>
                  <div>
                    <h3>{doc.documentName || doc.documentType}</h3>
                    <p>Document Type: {doc.documentType}</p>
                    <p>Found Location: {doc.foundLocation || "Not specified"}</p>
                    <p>Found Date: {doc.foundDate || "Not specified"}</p>
                    <p>Description: {doc.description || "No description"}</p>
                    <p>Status: {doc.status || "Under verification"}</p>
                  </div>
                  <span className="match-badge">Report Found</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
/* ================= LOGIN ================= */
function Login({ setActivePage }) {
  const handleSubmit = (e) => { e.preventDefault(); alert("Login will be connected to the backend later."); };
  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-icon">🔐</div><h1>Welcome Back</h1><p>Login to your DocFind account.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input type="email" placeholder="Enter your email" required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Enter your password" required /></div>
          <button className="submit-btn">Login</button>
        </form>
        <p className="switch-auth">Don't have an account? <button onClick={() => setActivePage("register")}>Register</button></p>
      </div>
    </section>
  );
}

/* ================= REGISTER ================= */
function Register({ setActivePage }) {
  const handleSubmit = (e) => { e.preventDefault(); alert("Registration will be connected to the backend later."); };
  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-icon">👤</div><h1>Create Account</h1><p>Register to report and recover documents.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="Enter your full name" required /></div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="Enter your email" required /></div>
          <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="Enter your phone number" required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Create a password" required /></div>
          <button className="submit-btn">Create Account</button>
        </form>
        <p className="switch-auth">Already have an account? <button onClick={() => setActivePage("login")}>Login</button></p>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */
function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div><h3>📄 DocFind</h3><p>A cloud-based missing document reporting and recovery system.</p></div>
        <div><h4>System</h4><p>Secure Reporting</p><p>Cloud Storage</p><p>Document Matching</p></div>
        <div><h4>Security</h4><p>Protected Accounts</p><p>Private Information</p><p>Secure Storage</p></div>
      </div>
      <div className="footer-bottom">© 2026 DocFind. Missing Document Reporting System.</div>
    </footer>
  );
}

export default App;