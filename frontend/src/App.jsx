
import { useState, useEffect } from "react";
import "./App.css";
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

// =========================
// MAIN APP
// =========================

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState("home");

  const protectedPages = [
    "report-missing",
    "report-found",
    "search",
    "my-reports",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      },
      (error) => {
        console.error("Authentication state error:", error);
        setAuthLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Redirect visitors to login before opening protected pages.
  const navigate = (page) => {
    if (protectedPages.includes(page) && !currentUser) {
      setPendingPage(page);
      setActivePage("login");
    } else {
      setActivePage(page);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Called after login or registration succeeds.
  const handleAuthSuccess = () => {
    setActivePage(pendingPage);
    setPendingPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActivePage("home");
      setPendingPage("home");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "report-missing":
        return (
          <ReportMissing
            currentUser={currentUser}
            setActivePage={navigate}
          />
        );

      case "report-found":
        return (
          <ReportFound
            currentUser={currentUser}
            setActivePage={navigate}
          />
        );

      case "search":
        return <SearchDocuments />;

      case "my-reports":
        return (
          <MyReports
            currentUser={currentUser}
            setActivePage={navigate}
          />
        );

      case "login":
        return (
          <Login
            setActivePage={navigate}
            onAuthSuccess={handleAuthSuccess}
          />
        );

      case "register":
        return (
          <Register
            setActivePage={navigate}
            onAuthSuccess={handleAuthSuccess}
          />
        );

      default:
        return (
          <Home
            currentUser={currentUser}
            setActivePage={navigate}
          />
        );
    }
  };

  if (authLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Navbar
        currentUser={currentUser}
        setActivePage={navigate}
        onLogout={handleLogout}
      />

      <main>{renderPage()}</main>

      <Footer />
    </div>
  );
}

// =========================
// NAVBAR
// =========================

function Navbar({ currentUser, setActivePage, onLogout }) {
  return (
    <nav className="navbar">
      <div
        className="nav-logo"
        onClick={() => setActivePage("home")}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter") setActivePage("home");
        }}
      >
        <span className="logo-icon">📄</span>
        <span>MissingDoc</span>
      </div>

      <div className="nav-links">
        <button
          type="button"
          className="nav-link"
          onClick={() => setActivePage("home")}
        >
          Home
        </button>

        {currentUser && (
          <>
            <button
              type="button"
              className="nav-link"
              onClick={() => setActivePage("report-missing")}
            >
              Report Missing
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setActivePage("report-found")}
            >
              Report Found
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setActivePage("search")}
            >
              Search
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setActivePage("my-reports")}
            >
              My Reports
            </button>
          </>
        )}
      </div>

      <div className="nav-auth">
        {currentUser ? (
          <>
            <span className="nav-user">
              Hi, {currentUser.displayName || currentUser.email}
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setActivePage("login")}
            >
              Login
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActivePage("register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// =========================
// HOME PAGE
// =========================

function Home({ currentUser, setActivePage }) {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tag">LOST SOMETHING? FOUND SOMETHING?</p>

          <h1>
            Your documents matter.
            <br />
            <span>Let's get them back.</span>
          </h1>

          <p className="hero-description">
            A simple place to report missing documents, report documents
            you've found, and help reunite important documents with their
            owners.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActivePage("report-missing")}
            >
              Report a Missing Document
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setActivePage("report-found")}
            >
              I Found a Document
            </button>
          </div>

          {!currentUser && (
            <p className="auth-note">
              Please log in or register to report or search for documents.
            </p>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <h2>How can we help?</h2>
          <p>Three simple steps to help documents find their owners.</p>
        </div>

        <div className="features-grid">
          <Feature
            icon="🔎"
            title="Search Documents"
            description="Look for documents reported by other users using their type and location."
            onClick={() => setActivePage("search")}
          />

          <Feature
            icon="📢"
            title="Report Missing"
            description="Submit a report when an important document has been lost."
            onClick={() => setActivePage("report-missing")}
          />

          <Feature
            icon="🤝"
            title="Report Found"
            description="Let others know when you have found a document."
            onClick={() => setActivePage("report-found")}
          />
        </div>
      </section>

      <section className="steps-section">
        <div className="section-heading">
          <h2>Getting started is easy</h2>
        </div>

        <div className="steps-grid">
          <Step
            number="01"
            title="Create an account"
            description="Log in or register to access document services."
          />
          <Step
            number="02"
            title="Submit a report"
            description="Provide the document type, date, location, and details."
          />
          <Step
            number="03"
            title="Search and reconnect"
            description="Search reports to help a missing document reach its owner."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      className="feature-card"
      onClick={onClick}
    >
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="feature-action">Get started →</span>
    </button>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="step-card">
      <span className="step-number">{number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// =========================
// REPORT MISSING DOCUMENT
// =========================

function ReportMissing({ currentUser, setActivePage }) {
  const [formData, setFormData] = useState({
    documentType: "",
    documentName: "",
    documentNumber: "",
    lostDate: "",
    lostLocation: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] || null : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert("Please log in to report a missing document.");
      setActivePage("login");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "missingDocuments"), {
        documentType: formData.documentType,
        documentName: formData.documentName.trim(),
        documentNumber: formData.documentNumber.trim(),
        lostDate: formData.lostDate,
        lostLocation: formData.lostLocation.trim(),
        description: formData.description.trim(),
        image: formData.image ? formData.image.name : "",
        userId: currentUser.uid,
        status: "missing",
        createdAt: serverTimestamp(),
      });

      alert("Your missing document report was submitted successfully.");

      setFormData({
        documentType: "",
        documentName: "",
        documentNumber: "",
        lostDate: "",
        lostLocation: "",
        description: "",
        image: null,
      });

      setActivePage("my-reports");
    } catch (error) {
      console.error("Error submitting missing report:", error);
      alert("Unable to submit the report. Please check your connection and Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-card">
        <h1>Report a Missing Document</h1>
        <p className="form-description">
          Enter the details below to help others identify your missing document.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="missing-documentType">Document Type *</label>
            <select
              id="missing-documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
            >
              <option value="">Select document type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Driving Licence">Driving Licence</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="College ID">College ID</option>
              <option value="Certificate">Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="missing-documentName">Document Holder's Name *</label>
            <input
              id="missing-documentName"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
              placeholder="Enter the name on the document"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="missing-documentNumber">
              Document Number (optional)
            </label>
            <input
              id="missing-documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Enter only if necessary"
            />
          </div>

          <div className="form-group">
            <label htmlFor="missing-lostDate">Date Lost *</label>
            <input
              id="missing-lostDate"
              type="date"
              name="lostDate"
              value={formData.lostDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="missing-lostLocation">Location Lost *</label>
            <input
              id="missing-lostLocation"
              name="lostLocation"
              value={formData.lostLocation}
              onChange={handleChange}
              placeholder="Enter the area or location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="missing-description">Additional Details</label>
            <textarea
              id="missing-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add useful details about the document"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="missing-image">Document Image (optional)</label>
            <input
              id="missing-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            <small>
              This version records the selected filename; it does not upload
              the image itself.
            </small>
          </div>

          <button
            type="submit"
            className="btn-primary form-submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Missing Report"}
          </button>
        </form>
      </div>
    </section>
  );
}

// =========================
// REPORT FOUND DOCUMENT
// =========================

function ReportFound({ currentUser, setActivePage }) {
  const [formData, setFormData] = useState({
    documentType: "",
    documentName: "",
    foundDate: "",
    foundLocation: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] || null : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert("Please log in to report a found document.");
      setActivePage("login");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "foundDocuments"), {
        documentType: formData.documentType,
        documentName: formData.documentName.trim(),
        foundDate: formData.foundDate,
        foundLocation: formData.foundLocation.trim(),
        description: formData.description.trim(),
        image: formData.image ? formData.image.name : "",
        userId: currentUser.uid,
        status: "found",
        createdAt: serverTimestamp(),
      });

      alert("Your found document report was submitted successfully.");

      setFormData({
        documentType: "",
        documentName: "",
        foundDate: "",
        foundLocation: "",
        description: "",
        image: null,
      });

      setActivePage("my-reports");
    } catch (error) {
      console.error("Error submitting found report:", error);
      alert("Unable to submit the report. Please check your connection and Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-card">
        <h1>Report a Found Document</h1>
        <p className="form-description">
          Found a document? Submit its details to help reconnect it with its owner.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="found-documentType">Document Type *</label>
            <select
              id="found-documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
            >
              <option value="">Select document type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Driving Licence">Driving Licence</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="College ID">College ID</option>
              <option value="Certificate">Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="found-documentName">Name on Document (if visible)</label>
            <input
              id="found-documentName"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
              placeholder="Enter the name if visible"
            />
          </div>

          <div className="form-group">
            <label htmlFor="found-foundDate">Date Found *</label>
            <input
              id="found-foundDate"
              type="date"
              name="foundDate"
              value={formData.foundDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="found-foundLocation">Location Found *</label>
            <input
              id="found-foundLocation"
              name="foundLocation"
              value={formData.foundLocation}
              onChange={handleChange}
              placeholder="Enter the area or location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="found-description">Additional Details</label>
            <textarea
              id="found-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe where or how you found it"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="found-image">Document Image (optional)</label>
            <input
              id="found-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            <small>
              This version records the selected filename; it does not upload
              the image itself.
            </small>
          </div>

          <button
            type="submit"
            className="btn-primary form-submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Found Report"}
          </button>
        </form>
      </div>
    </section>
  );
}

// =========================
// SEARCH DOCUMENTS
// =========================

function SearchDocuments() {
  const [documentType, setDocumentType] = useState("");
  const [location, setLocation] = useState("");
  const [reportType, setReportType] = useState("all");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const allResults = [];

      if (reportType === "all" || reportType === "missing") {
        const snapshot = await getDocs(
          collection(db, "missingDocuments")
        );

        snapshot.forEach((documentSnapshot) => {
          allResults.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
            reportType: "missing",
          });
        });
      }

      if (reportType === "all" || reportType === "found") {
        const snapshot = await getDocs(
          collection(db, "foundDocuments")
        );

        snapshot.forEach((documentSnapshot) => {
          allResults.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
            reportType: "found",
          });
        });
      }

      const normalizedLocation = location.trim().toLowerCase();

      const filtered = allResults.filter((item) => {
        const matchesType =
          !documentType || item.documentType === documentType;

        const itemLocation =
          item.reportType === "missing"
            ? item.lostLocation
            : item.foundLocation;

        const matchesLocation =
          !normalizedLocation ||
          (itemLocation || "")
            .toLowerCase()
            .includes(normalizedLocation);

        return matchesType && matchesLocation;
      });

      setResults(filtered);
    } catch (error) {
      console.error("Error searching documents:", error);
      alert("Unable to search reports. Check your Firebase permissions.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="search-page">
      <div className="page-heading">
        <h1>Search Documents</h1>
        <p>Search reports by document type and location.</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="search-documentType">Document Type</label>
          <select
            id="search-documentType"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
          >
            <option value="">All document types</option>
            <option value="Aadhaar Card">Aadhaar Card</option>
            <option value="PAN Card">PAN Card</option>
            <option value="Driving Licence">Driving Licence</option>
            <option value="Passport">Passport</option>
            <option value="Voter ID">Voter ID</option>
            <option value="College ID">College ID</option>
            <option value="Certificate">Certificate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="search-location">Location</label>
          <input
            id="search-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Enter a location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="search-reportType">Report Type</label>
          <select
            id="search-reportType"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          >
            <option value="all">Missing and found</option>
            <option value="missing">Missing documents</option>
            <option value="found">Found documents</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && (
        <div className="search-results">
          <h2>
            {loading ? "Searching..." : `${results.length} report(s) found`}
          </h2>

          {!loading && results.length === 0 && (
            <p className="empty-state">
              No matching reports were found. Try changing your search filters.
            </p>
          )}

          <div className="reports-grid">
            {results.map((item) => {
              const isMissing = item.reportType === "missing";
              const itemLocation = isMissing
                ? item.lostLocation
                : item.foundLocation;
              const itemDate = isMissing
                ? item.lostDate
                : item.foundDate;

              return (
                <article className="report-card" key={`${item.reportType}-${item.id}`}>
                  <span
                    className={`status-badge ${
                      isMissing ? "status-missing" : "status-found"
                    }`}
                  >
                    {isMissing ? "Missing" : "Found"}
                  </span>

                  <h3>{item.documentType || "Document"}</h3>
                  <p>
                    <strong>Name:</strong>{" "}
                    {item.documentName || "Not provided"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {itemLocation || "Not provided"}
                  </p>
                  <p>
                    <strong>Date:</strong> {itemDate || "Not provided"}
                  </p>

                  {item.description && (
                    <p>
                      <strong>Details:</strong> {item.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// =========================
// MY REPORTS
// =========================

function MyReports({ currentUser, setActivePage }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      if (!currentUser) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        const allReports = [];

        const missingSnapshot = await getDocs(
          collection(db, "missingDocuments")
        );

        missingSnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();

          if (data.userId === currentUser.uid) {
            allReports.push({
              id: documentSnapshot.id,
              ...data,
              reportType: "missing",
            });
          }
        });

        const foundSnapshot = await getDocs(
          collection(db, "foundDocuments")
        );

        foundSnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();

          if (data.userId === currentUser.uid) {
            allReports.push({
              id: documentSnapshot.id,
              ...data,
              reportType: "found",
            });
          }
        });

        if (!cancelled) {
          setReports(allReports);
        }
      } catch (error) {
        console.error("Error loading your reports:", error);
        if (!cancelled) {
          alert("Unable to load your reports. Check your Firebase permissions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="empty-state">
        <h1>Please log in</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setActivePage("login")}
        >
          Login
        </button>
      </section>
    );
  }

  return (
    <section className="my-reports-page">
      <div className="page-heading">
        <h1>My Reports</h1>
        <p>View the missing and found document reports you submitted.</p>
      </div>

      {loading ? (
        <p className="loading-message">Loading your reports...</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <h2>No reports yet</h2>
          <p>You have not submitted any document reports.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActivePage("report-missing")}
          >
            Create a Report
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((item) => {
            const isMissing = item.reportType === "missing";
            const itemLocation = isMissing
              ? item.lostLocation
              : item.foundLocation;
            const itemDate = isMissing
              ? item.lostDate
              : item.foundDate;

            return (
              <article
                className="report-card"
                key={`${item.reportType}-${item.id}`}
              >
                <span
                  className={`status-badge ${
                    isMissing ? "status-missing" : "status-found"
                  }`}
                >
                  {isMissing ? "Missing" : "Found"}
                </span>

                <h3>{item.documentType || "Document"}</h3>
                <p>
                  <strong>Name:</strong>{" "}
                  {item.documentName || "Not provided"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {itemLocation || "Not provided"}
                </p>
                <p>
                  <strong>Date:</strong> {itemDate || "Not provided"}
                </p>
                {item.description && <p>{item.description}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// =========================
// LOGIN
// =========================

function Login({ setActivePage, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      onAuthSuccess();
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        alert("Incorrect email or password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Log in to access your document reports.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary form-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => setActivePage("register")}
          >
            Register
          </button>
        </p>
      </div>
    </section>
  );
}

// =========================
// REGISTER
// =========================

function Register({ setActivePage, onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Your password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      onAuthSuccess();
    } catch (error) {
      console.error("Registration failed:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("An account with this email already exists. Please log in.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Please choose a stronger password.");
      } else {
        alert(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create an Account</h1>
        <p>Register to report and search for documents.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary form-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => setActivePage("login")}
          >
            Login
          </button>
        </p>
      </div>
    </section>
  );
}

// =========================
// FOOTER
// =========================

function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} MissingDoc. Helping important documents
        find their way home.
      </p>
    </footer>
  );
}

