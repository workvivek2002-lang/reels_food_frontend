import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
const FoodPartnerProfile = () => {
  const { id } = useParams();

  // Navigation State
  const [activeTab, setActiveTab] = useState("grid");

  // Profile & Reels States
  const [profile, setProfile] = useState(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentReel, setCurrentReel] = useState(0);
  const [muted, setMuted] = useState(true);

  // Immersive Modal Comment State Managers
  const [comments, setComments] = useState([]);
  const [showCommentsFrame, setShowCommentsFrame] = useState(false);

  // Upload Form States
  const [formData, setFormData] = useState({ name: "", description: "", video: null });
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Refs
  const gridVideoRefs = useRef([]);
  const reelVideoRefs = useRef([]);
  const fileInputRef = useRef(null);

  // INITIAL FETCH
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/food-partner/${id}`);
      const partner = res.data.foodPartner;
      setProfile(partner);
      setReels(partner.foodItems || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Couldn't load this store right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  // --- REAL-TIME LIVE BACKGROUND METRICS POLLING ---
  useEffect(() => {
    if (!id) return;

    const pollLiveMetrics = async () => {
      try {
        const res = await axios.get(`${API}/api/food-partner/${id}`);
        const freshItems = res.data.foodPartner?.foodItems || [];

        setReels((prevReels) => {
          let hasChanges = false;
          const updatedReels = prevReels.map((oldItem) => {
            const newItem = freshItems.find((f) => f._id === oldItem._id);
            if (newItem && (newItem.likeCount !== oldItem.likeCount || newItem.commentCount !== oldItem.commentCount)) {
              hasChanges = true;
              return { ...oldItem, likeCount: newItem.likeCount, commentCount: newItem.commentCount };
            }
            return oldItem;
          });
          return hasChanges ? updatedReels : prevReels;
        });
      } catch (err) {
        console.error("Silent sync failed:", err);
      }
    };

    const intervalId = setInterval(pollLiveMetrics, 2500);
    return () => clearInterval(intervalId);
  }, [id]);

  // FETCH COMMENTS FOR ACTIVE SLIDE MULTIMEDIA WORKFLOWS
  useEffect(() => {
    if (activeIndex === null || !reels[currentReel]) {
      setComments([]);
      return;
    }

    const activeReelId = reels[currentReel]._id;

    const fetchActiveReelComments = async () => {
      try {
        const res = await axios.get(`${API}/api/food/comments/${activeReelId}`, {
          withCredentials: true,
        });
        setComments(res.data.comments || res.data || []);
      } catch (err) {
        console.error("Failed loading modal comments thread:", err);
      }
    };

    fetchActiveReelComments();
    const commentsInterval = setInterval(fetchActiveReelComments, 3500);

    return () => clearInterval(commentsInterval);
  }, [activeIndex, currentReel, reels]);

  // AUTO PLAY CONTROLLER
  useEffect(() => {
    if (activeIndex === null) return;

    reelVideoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === currentReel) {
        vid.muted = muted;
        vid.play().catch(() => {});
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [currentReel, activeIndex, muted]);

  // REEL DELETION MODULE HANDLER (FIXED ENDPOINT INTERACTIVE MAPPING)
  const handleDeleteReel = async (e, foodId) => {
    if (e) e.stopPropagation(); 
    if (!window.confirm("Are you absolutely sure you want to permanently delete this food reel?")) return;

    try {
      // 🎯 CORRECTED URL PATHWAY TARGETING THE DECOUPLED ROUTER
      await axios.delete(`${API}/api/food/${foodId}`, {
        withCredentials: true,
      });

      alert("Reel deleted successfully 🗑️");
      
      // If the item deleted is currently active inside fullscreen overlay slider viewports, escape modal state cleanly
      if (activeIndex !== null && reels[currentReel]?._id === foodId) {
        closeReel();
      }

      // Locally strip document reference array elements instantly
      setReels((prev) => prev.filter((item) => item._id !== foodId));
    } catch (err) {
      console.error("Error executing reel termination payload:", err);
      alert(err.response?.data?.message || "Failed to delete reel. Ensure you have the owner authorization credentials.");
    }
  };

  const openReel = (index) => {
    setCurrentReel(index);
    setActiveIndex(index);
    setShowCommentsFrame(false);
  };

  const closeReel = () => {
    reelVideoRefs.current.forEach((vid) => vid && vid.pause());
    setActiveIndex(null);
    setShowCommentsFrame(false);
  };

  const handleScroll = (e) => {
    const index = Math.round(e.currentTarget.scrollTop / window.innerHeight);
    if (index !== currentReel && index >= 0 && index < reels.length) {
      setCurrentReel(index);
    }
  };

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "video") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, video: file }));
      if (file) setUploadPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video) return alert("Please select or drop a video first");

    try {
      setUploading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("video", formData.video);

      await axios.post(`${API}/api/food/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("Uploaded successfully 🚀");
      setFormData({ name: "", description: "", video: null });
      setUploadPreview(null);
      setActiveTab("grid");
      fetchProfile();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  const initials = (name) =>
    (name || "F")
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");

  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div className="fp-spinner" style={styles.spinnerRing} />
        <p style={styles.centerText}>Loading store dashboard…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.centerScreen}>
        <p style={{ fontSize: "32px", margin: 0 }}>⚠️</p>
        <p style={styles.centerText}>{error || "Store not found."}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fp-spinner { animation: spin 0.8s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .fp-fade { animation: fadeIn 0.25s ease-out both; }
        .fp-tile { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; }
        .fp-tile:hover { transform: scale(0.97); filter: brightness(1.1); }
        .fp-tile:hover .tile-delete-overlay-btn { opacity: 1; }
        .fp-icon-btn { transition: transform 0.15s ease, background 0.15s ease; cursor: pointer; }
        .fp-icon-btn:hover { transform: scale(1.08); }
        .fp-feed::-webkit-scrollbar { display: none; }
        .input-focus-effect { transition: all 0.2s ease-in-out; border: 1px solid rgba(255,255,255,0.08) !important; }
        .input-focus-effect:focus { border-color: #ff7a1a !important; box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.15); }
        .tab-btn { flex: 1; text-align: center; padding: 12px 0; font-size: 14px; font-weight: 600; color: #9ba0b4; background: transparent; border: none; cursor: pointer; transition: all 0.2s ease; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #ff7a1a; border-bottom-color: #ff7a1a; background: rgba(255,122,26,0.04); }
        .dropzone { transition: all 0.25s ease; border: 2px dashed rgba(255, 255, 255, 0.1); cursor: pointer; }
        .dropzone:hover { border-color: #ff7a1a; background: rgba(255,122,26,0.02) !important; }
        
        .panel-comment-row { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .panel-comment-row:last-child { border: none; }
        
        .tile-delete-overlay-btn { position: absolute; top: 8px; left: 8px; width: 28px; height: 28px; background: rgba(239, 68, 68, 0.85); color: #fff; border: none; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; opacity: 0; transition: opacity 0.2s ease; zIndex: 10; border-radius: 50%; }
        .tile-delete-overlay-btn:hover { background: #ef4444; transform: scale(1.05); }
      `}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div style={styles.avatar}>{initials(profile.name)}</div>
          <div style={{ minWidth: 0 }}>
            <h4 style={styles.profileName}>{profile.name}</h4>
            <small style={styles.profileAddress}>📍 {profile.address || "Address unavailable"}</small>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <strong style={styles.statNum}>{reels.length}</strong>
            <span style={styles.statLabel}>Reels</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <strong style={styles.statNum}>{profile.contactName || "—"}</strong>
            <span style={styles.statLabel}>Contact</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <strong style={styles.statNum}>{profile.phone || "—"}</strong>
            <span style={styles.statLabel}>Phone</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabContainer}>
        <button className={`tab-btn ${activeTab === "grid" ? "active" : ""}`} onClick={() => setActiveTab("grid")}>
          🎬 Feed Grid
        </button>
        <button className={`tab-btn ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>
          ➕ Post Reel
        </button>
      </div>

      {/* CORE CONTENT LAYERS */}
      <div style={styles.contentBody} className="fp-fade" key={activeTab}>
        {activeTab === "grid" && (
          <div style={styles.grid}>
            {reels.length > 0 ? (
              reels.map((vid, index) => (
                <div key={vid._id} className="fp-tile" onClick={() => openReel(index)} style={styles.tile}>
                  
                  {/* Delete Button on Grid Element */}
                  <button 
                    className="tile-delete-overlay-btn"
                    onClick={(e) => handleDeleteReel(e, vid._id)}
                    title="Delete Reel video"
                  >
                    🗑️
                  </button>

                  <video
                    ref={(el) => (gridVideoRefs.current[index] = el)}
                    src={vid.video}
                    style={styles.gridVideo}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div style={styles.tileIcon}>🎬</div>
                  <div style={styles.tileFade} />
                  {vid.likeCount != null && (
                    <div style={styles.tileLikes}>❤️ {vid.likeCount}</div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p style={{ fontSize: "32px", margin: "0 0 10px 0" }}>🎥</p>
                <p style={{ margin: 0, color: "#8b90a3", fontSize: "14px" }}>No food reels uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div style={styles.uploadFormWrapper}>
            <form onSubmit={handleUploadSubmit} style={styles.formStructure}>
              <div className="dropzone" style={styles.previewBox} onClick={() => fileInputRef.current?.click()}>
                {uploadPreview ? (
                  <video src={uploadPreview} style={styles.videoStyle} controls />
                ) : (
                  <div style={styles.placeholder}>
                    <div style={styles.uploadIconContainer}>📤</div>
                    <p style={{ margin: "12px 0 4px 0", fontWeight: "600", fontSize: "14px", color: "#fff" }}>Select Reel Video</p>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "11px" }}>9:16 vertical ratio preferred</p>
                  </div>
                )}
              </div>

              <input type="file" name="video" accept="video/*" ref={fileInputRef} onChange={handleUploadChange} style={{ display: "none" }} />

              <div style={styles.inputGroup}>
                <div>
                  <label style={styles.label}>Dish Title</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleUploadChange}
                    placeholder="e.g., Signature Cheese Lava Burger"
                    className="input-focus-effect"
                    style={styles.input}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>Description / Caption</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleUploadChange}
                    placeholder="Describe seasonings, layers, or promotional deals..."
                    className="input-focus-effect"
                    style={{ ...styles.input, ...styles.textarea }}
                    required
                  />
                </div>

                <button type="submit" disabled={uploading} style={{ ...styles.button, opacity: uploading ? 0.6 : 1, cursor: uploading ? "not-allowed" : "pointer" }}>
                  {uploading ? "Uploading to Feed..." : "Publish Food Reel 🚀"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* FULLSCREEN REEL SLIDER OVERLAY */}
      {activeIndex !== null && (
        <div className="fp-fade" style={styles.viewerOverlay}>
          <button onClick={closeReel} style={styles.closeBtn} className="fp-icon-btn" aria-label="Close">✕</button>
          <button onClick={() => setMuted((m) => !m)} style={styles.muteBtn} className="fp-icon-btn" aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>

          {/* FLOATING ACTION SIDE SIDEBAR */}
          <div style={styles.immersiveSidebarActions}>
            <button 
              onClick={() => setShowCommentsFrame(p => !p)} 
              style={{ ...styles.floatingCircleItem, background: showCommentsFrame ? "#ff7a1a" : "rgba(0,0,0,0.5)", color: showCommentsFrame ? "#000" : "#fff", marginBottom: "12px" }}
            >
              💬
            </button>
            {/* Delete Button on Fullscreen Slide overlay context */}
            <button 
              onClick={(e) => handleDeleteReel(e, reels[currentReel]?._id)} 
              style={{ ...styles.floatingCircleItem, background: "rgba(239, 68, 68, 0.75)", color: "#fff" }}
              title="Delete Active Reel"
            >
              🗑️
            </button>
          </div>

          <div className="fp-feed" onScroll={handleScroll} style={styles.viewerFeed}>
            {reels.map((vid, index) => (
              <div key={vid._id} style={styles.viewerSlide}>
                <video
                  ref={(el) => (reelVideoRefs.current[index] = el)}
                  src={vid.video}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: vid.isVertical ? "cover" : "contain",
                    background: "#000",
                  }}
                  loop
                  playsInline
                />
                <div style={styles.viewerFade} />
                <div style={styles.viewerText}>
                  <div style={styles.viewerUserRow}>
                    <div style={styles.viewerAvatar}>{initials(profile.name)}</div>
                    <h6 style={styles.viewerUsername}>@{profile.name}</h6>
                    
                    <span style={styles.liveLikesIndicator}>
                      ❤️ {vid.likeCount || 0}
                    </span>
                    <span style={{ ...styles.liveLikesIndicator, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginLeft: "6px" }}>
                      💬 {vid.commentCount || 0}
                    </span>
                  </div>
                  <p style={styles.viewerDesc}>{vid.description || "No description"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* EXPANDABLE COMMENTS CONTAINER */}
          {showCommentsFrame && (
            <div style={styles.drawerSheetBody} className="fp-fade">
              <div style={styles.drawerHeaderLine}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>Public Feedback Thread</span>
                <button onClick={() => setShowCommentsFrame(false)} style={styles.drawerCloseCross}>✕</button>
              </div>

              <div style={styles.drawerScrollList}>
                {comments.length > 0 ? (
                  comments.map((item) => (
                    <div key={item._id} className="panel-comment-row">
                      <div style={{ fontWeight: "600", fontSize: "12.5px", color: "#ff7a1a" }}>
                        @{item.userId?.fullName || "anonymous_user"}
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#e4e4e7", lineHeight: "1.4" }}>
                        {item.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "40px 10px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                    No public reviews left on this reel item yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { background: "#080a11", color: "#f3f4f6", minHeight: "100vh", maxWidth: "480px", margin: "0 auto", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", boxShadow: "0 0 32px rgba(0,0,0,0.4)" },
  header: { padding: "24px 20px 16px 20px", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  headerRow: { display: "flex", gap: "16px", alignItems: "center" },
  avatar: { width: "68px", height: "68px", flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg, #ff7a1a, #ffb347)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "22px", color: "#0a0a0a" },
  profileName: { margin: "0 0 4px 0", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.4px" },
  profileAddress: { color: "#9ba0b4", fontSize: "13px", display: "block" },
  statsRow: { display: "flex", alignItems: "center", marginTop: "20px", background: "#0e1220", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "12px 6px" },
  statItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: 0 },
  statNum: { fontSize: "14px", fontWeight: "700", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  statLabel: { fontSize: "11px", color: "#6b7280", fontWeight: "500" },
  statDivider: { width: "1px", height: "24px", background: "rgba(255,255,255,0.08)" },
  tabContainer: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#090d16" },
  contentBody: { flex: 1, display: "flex", flexDirection: "column" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", padding: "2px" },
  tile: { width: "100%", aspectRatio: "9 / 16", overflow: "hidden", background: "#000" },
  gridVideo: { width: "100%", height: "100%", objectFit: "cover" },
  tileIcon: { position: "absolute", top: "8px", right: "8px", fontSize: "12px", zIndex: 2 },
  tileFade: { position: "absolute", bottom: 0, width: "100%", height: "40%", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", zIndex: 1 },
  tileLikes: { position: "absolute", bottom: "8px", left: "8px", fontSize: "11px", fontWeight: "600", color: "#fff", zIndex: 2 },
  emptyState: { padding: "80px 20px", textAlign: "center", width: "100%" },
  uploadFormWrapper: { padding: "20px" },
  formStructure: { display: "flex", flexDirection: "column", gap: "20px" },
  previewBox: { width: "100%", aspectRatio: "16 / 10", background: "rgba(255,255,255,0.02)", borderRadius: "14px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" },
  videoStyle: { width: "100%", height: "100%", objectFit: "cover" },
  placeholder: { textAlign: "center" },
  uploadIconContainer: { fontSize: "28px", color: "#ff7a1a", marginBottom: "4px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#9ca3af", marginBottom: "6px", letterSpacing: "0.2px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "10px", background: "#0e1220", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", border: "none" },
  textarea: { height: "90px", resize: "none", fontFamily: "inherit", lineHeight: "1.5" },
  button: { width: "100%", padding: "14px", background: "#ff7a1a", border: "none", color: "#000", fontWeight: "700", borderRadius: "10px", fontSize: "15px", marginTop: "6px" },
  
  viewerOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", background: "#000", zIndex: 1000 },
  viewerFeed: { width: "100%", height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory" },
  viewerSlide: { height: "100vh", scrollSnapAlign: "start", position: "relative" },
  viewerFade: { position: "absolute", bottom: 0, width: "100%", height: "35%", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" },
  viewerText: { position: "absolute", bottom: "30px", left: "16px", right: "70px" },
  viewerUserRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  viewerAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #ff7a1a, #ffb347)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "11px", color: "#000" },
  viewerUsername: { margin: 0, fontWeight: "700", fontSize: "14px", color: "#fff" },
  viewerDesc: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" },
  closeBtn: { position: "fixed", top: "18px", left: "16px", zIndex: 1001, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  muteBtn: { position: "fixed", top: "18px", right: "16px", zIndex: 1001, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  centerScreen: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "#080a11", color: "#9ca3af" },
  centerText: { fontSize: "14px", margin: 0 },
  spinnerRing: { width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#ff7a1a", borderRadius: "50%" },
  liveLikesIndicator: { fontSize: "12px", fontWeight: "700", color: "#ff4b5c", background: "rgba(255, 75, 92, 0.1)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255, 75, 92, 0.2)" },

  immersiveSidebarActions: { position: "absolute", right: "16px", bottom: "160px", zIndex: 1002, display: "flex", flexDirection: "column", gap: "16px" },
  floatingCircleItem: { border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", cursor: "pointer", transition: "all 0.2s ease", outline: "none" },
  drawerSheetBody: { position: "absolute", bottom: 0, left: 0, right: 0, height: "45vh", background: "#0e111a", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", zIndex: 1003, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box" },
  drawerHeaderLine: { display: "flex", justifyContent: "space-between", alignItem: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" },
  drawerCloseCross: { background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", cursor: "pointer" },
  drawerScrollList: { flex: 1, overflowY: "auto", margin: "10px 0 0 0" }
};

export default FoodPartnerProfile;