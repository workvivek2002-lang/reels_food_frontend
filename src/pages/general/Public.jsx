import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
const Public = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [reels, setReels] = useState([]);
  const [selectedReel, setSelectedReel] = useState(null);
  
  // Fully synced comment & interaction states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likedItems, setLikedItems] = useState({});
  
  // Responsive Layout Watcher State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Synchronize comment system safely whenever a specific reel is clicked open
  useEffect(() => {
    if (selectedReel) {
      fetchReelComments(selectedReel._id);
    }
  }, [selectedReel]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/public/${id}`);
      const fetchedPartner = res.data.foodPartner || res.data || null;
      const fetchedReels = res.data.reels || [];
      
      setProfile(fetchedPartner);
      setReels(fetchedReels);

      // Initialize base state for likes map safely
      const initialLikes = {};
      fetchedReels.forEach((reel) => {
        initialLikes[reel._id] = false; 
      });
      setLikedItems(initialLikes);
    } catch (err) {
      console.error("Error fetching partner profile infrastructure:", err);
    }
  };

  const fetchReelComments = async (reelId) => {
    try {
      const res = await axios.get(`${API}/api/food/comments/${reelId}`, {
        withCredentials: true,
      });
      setComments(res.data.comments || res.data || []);
    } catch (err) {
      console.error("Dynamic comment loading failed:", err);
      setComments([]);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedReel) return;

    try {
      const res = await axios.post(
        `${API}/api/food/comment`,
        {
          foodId: selectedReel._id,
          comment: commentText,
        },
        {
          withCredentials: true,
        }
      );

      const freshComment = res.data.comment;
      
      setComments((prev) => [freshComment, ...prev]);
      setCommentText("");

      // --- REAL-TIME UPDATES FOR MAIN DATA LOOP & SELECTED ITEM ---
      setReels((prev) =>
        prev.map((item) =>
          item._id === selectedReel._id
            ? { ...item, commentCount: (item.commentCount || 0) + 1 }
            : item
        )
      );

      setSelectedReel((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));

    } catch (err) {
      console.error("Comment delivery engine failure:", err.response?.data || err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment permanently?")) return;

    try {
      await axios.delete(`${API}/api/food/comment/${commentId}`, {
        withCredentials: true,
      });

      setComments((prev) => prev.filter((c) => c._id !== commentId));

      // --- REAL-TIME COUNTS CLEANUP ---
      setReels((prev) =>
        prev.map((item) =>
          item._id === selectedReel._id
            ? { ...item, commentCount: Math.max(0, (item.commentCount || 1) - 1) }
            : item
        )
      );

      setSelectedReel((prev) => ({
        ...prev,
        commentCount: Math.max(0, (prev.commentCount || 1) - 1)
      }));

    } catch (err) {
      console.error("Failed authorization cleanup:", err.response?.data || err.message);
      alert("Not authorized to remove this item.");
    }
  };

  const handleLikeToggle = async (reelId) => {
    const isCurrentlyLiked = likedItems[reelId];
    
    setLikedItems((prev) => ({ ...prev, [reelId]: !isCurrentlyLiked }));
    
    // --- REAL-TIME LIKE COUNTER CALCULATIONS ---
    setReels((prev) =>
      prev.map((item) =>
        item._id === reelId
          ? { ...item, likeCount: (item.likeCount || 0) + (isCurrentlyLiked ? -1 : 1) }
          : item
      )
    );

    if (selectedReel && selectedReel._id === reelId) {
      setSelectedReel((prev) => ({
        ...prev,
        likeCount: (prev.likeCount || 0) + (isCurrentlyLiked ? -1 : 1)
      }));
    }

    try {
      await axios.post(`${API}/api/food/like`, { foodId: reelId }, { withCredentials: true });
    } catch (err) {
      console.error("API tracking failed for profile like sync:", err);
    }
  };

  // Dynamically re-calculates aggregate appreciation metrics instantly on state mutations
  const totalLikes = reels.reduce((acc, reel) => acc + (reel.likeCount || 0), 0);

  if (!profile) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: "16px", color: "#71717a", fontSize: "14px" }}>Assembling brand registry analytics...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageLayout}>
      <div style={styles.heroBanner} />

      <div style={styles.container}>
        <div style={styles.brandProfileCard}>
          <div style={styles.avatarWrapper}>
            <div style={styles.brandAvatar}>{profile.name?.charAt(0).toUpperCase()}</div>
          </div>

          <h1 style={styles.brandName}>{profile.name}</h1>
          <p style={styles.brandLocation}>📍 {profile.address || "Location Unspecified"}</p>

          <div style={styles.statsRow}>
            <div style={styles.statGlassCard}>
              <span style={styles.statNumber}>{reels.length}</span>
              <span style={styles.statLabel}>Food Stories</span>
            </div>
            <div style={styles.statGlassCard}>
              <span style={styles.statNumber}>{totalLikes}</span>
              <span style={styles.statLabel}>Appreciations</span>
            </div>
          </div>

          <div style={styles.metaDirectory}>
            <div style={styles.directoryItem}>
              <span style={styles.directoryLabel}>Contact Ambassador</span>
              <span style={styles.directoryValue}>{profile.contactName || "N/A"}</span>
            </div>
            <div style={styles.directoryItem}>
              <span style={styles.directoryLabel}>Secure Email</span>
              <span style={styles.directoryValue}>{profile.email}</span>
            </div>
            <div style={styles.directoryItem}>
              <span style={styles.directoryLabel}>Direct Line</span>
              <span style={styles.directoryValue}>{profile.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        <div style={styles.mediaSection}>
          <div style={styles.sectionHeaderLine}>
            <h2 style={styles.sectionTitle}>Signature Reels Gallery</h2>
            <div style={styles.titleAccent} />
          </div>

          <div style={styles.mediaGrid}>
            {reels.map((reel) => (
              <div
                key={reel._id}
                style={styles.mediaWrapperCard}
                onClick={() => setSelectedReel(reel)}
              >
                <video src={reel.video || reel.videoUrl} style={styles.gridVideoPreview} muted playsInline />
                <div style={styles.gridInteractionOverlay}>
                  <div style={styles.overlayMetric}>{likedItems[reel._id] ? "❤️" : "🤍"} {reel.likeCount || 0}</div>
                  <div style={styles.overlayMetric}>💬 {reel.commentCount || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TWO-PANE PRO INTERACTIVE MODAL LIGHTBOX */}
      {selectedReel && (
        <div style={styles.cinematicLightbox} onClick={() => setSelectedReel(null)}>
          <div 
            style={{ 
              ...styles.lightboxContainer, 
              flexDirection: isMobile ? "column" : "row",
              height: isMobile ? "95vh" : "85vh",
              maxHeight: isMobile ? "100%" : "680px"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Left Frame: Video */}
            <div style={{ ...styles.videoPaneFrame, flex: isMobile ? "0 0 45%" : "1 1 50%" }}>
              <video src={selectedReel.video || selectedReel.videoUrl} controls autoPlay loop style={styles.modalImmersiveVideo} />
            </div>

            {/* Right Frame: Comments Engine */}
            <div style={{ ...styles.socialInteractionsPanel, flex: isMobile ? "1 1 55%" : "1 1 50%", borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
              <div style={styles.panelHeader}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={styles.panelTitle}>{selectedReel.name || "Chef's Selection Feature"}</h3>
                  <button onClick={() => setSelectedReel(null)} style={styles.closeBtn}>✕</button>
                </div>
                <p style={styles.panelDescription}>{selectedReel.description || "No recipe notes provided."}</p>
              </div>

              {/* Dynamic Comments Window */}
              <div style={styles.commentListContainer}>
                <span style={styles.innerLabelSmall}>Discussions ({comments.length})</span>
                {comments.length === 0 ? (
                  <p style={styles.emptyCommentsText}>No thoughts shared yet. Start the thread below...</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} style={styles.singleCommentBubble}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={styles.commentAuthorName}>
                          @{comment.userId?.fullName || "community_user"}
                        </span>
                        <button 
                          style={styles.trashIconBtn} 
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          🗑️
                        </button>
                      </div>
                      <p style={styles.commentBodyText}>{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Interaction Input Deck */}
              <div style={styles.actionEngagementDeck}>
                <div style={styles.likeRowMetricLine}>
                  <button 
                    onClick={() => handleLikeToggle(selectedReel._id)} 
                    style={{ ...styles.likeActionButton, color: likedItems[selectedReel._id] ? "#ff6b35" : "#94a3b8" }}
                  >
                    {likedItems[selectedReel._id] ? "❤️ Appreciated" : "🤍 Support Item"}
                  </button>
                  <span style={styles.realtimeLikeCounter}>
                    {selectedReel.likeCount || 0} likes
                  </span>
                </div>

                <form onSubmit={handleCommentSubmit} style={styles.commentInputFormWrapper}>
                  <input
                    type="text"
                    placeholder="Write an open comment review…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={styles.premiumInteractiveInput}
                  />
                  <button type="submit" style={styles.sendCommentButton}>Post</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Stylesheet Architecture
const styles = {
  pageLayout: { minHeight: "100vh", backgroundColor: "#05070c", color: "#f4f4f5", fontFamily: "system-ui, sans-serif", paddingBottom: "60px" },
  loadingContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#05070c" },
  spinner: { width: "36px", height: "36px", border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #ff6b35", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
  heroBanner: { height: "240px", background: "linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%)", position: "relative" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 },
  brandProfileCard: { backgroundColor: "#12141c", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", textAlign: "center", marginTop: "-80px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" },
  avatarWrapper: { display: "inline-block", position: "relative", marginTop: "-80px" },
  brandAvatar: { width: "110px", height: "110px", borderRadius: "50%", background: "linear-gradient(135deg, #ff6b35, #ff9f1c)", fontSize: "44px", fontWeight: "800", color: "#000", display: "flex", justifyContent: "center", alignItems: "center", border: "6px solid #12141c" },
  brandName: { fontSize: "28px", fontWeight: "800", marginTop: "16px", color: "#fff", letterSpacing: "-0.02em" },
  brandLocation: { color: "#9ca3af", fontSize: "14px", marginTop: "4px" },
  statsRow: { display: "flex", justifyContent: "center", gap: "24px", marginTop: "24px" },
  statGlassCard: { backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "12px 24px", minWidth: "140px" },
  statNumber: { display: "block", fontSize: "22px", fontWeight: "700", color: "#ff6b35" },
  statLabel: { fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" },
  metaDirectory: { marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "left" },
  directoryItem: { display: "flex", flexDirection: "column", gap: "2px" },
  directoryLabel: { fontSize: "11px", color: "#6b7280", textTransform: "uppercase" },
  directoryValue: { fontSize: "14px", color: "#e5e7eb", fontWeight: "600" },
  mediaSection: { marginTop: "48px" },
  sectionHeaderLine: { marginBottom: "24px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: "#fff" },
  titleAccent: { width: "36px", height: "3px", backgroundColor: "#ff6b35", borderRadius: "2px", marginTop: "6px" },
  mediaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  mediaWrapperCard: { position: "relative", borderRadius: "16px", overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#000", aspectRatio: "9/16" },
  gridVideoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  gridInteractionOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: "16px", gap: "16px" },
  overlayMetric: { fontSize: "14px", fontWeight: "600", color: "#fff" },
  cinematicLightbox: { position: "fixed", inset: 0, backgroundColor: "rgba(5, 7, 12, 0.9)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "10px" },
  lightboxContainer: { width: "100%", maxWidth: "920px", backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", display: "flex", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)" },
  videoPaneFrame: { backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" },
  modalImmersiveVideo: { width: "100%", height: "100%", objectFit: "contain" },
  socialInteractionsPanel: { display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#12141c", width: "100%" },
  panelHeader: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  panelTitle: { fontSize: "16px", fontWeight: "700", color: "#fff", margin: 0 },
  panelDescription: { fontSize: "13px", color: "#9ca3af", marginTop: "4px", lineHeight: "1.4" },
  closeBtn: { background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px" },
  commentListContainer: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
  innerLabelSmall: { fontSize: "11px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em" },
  emptyCommentsText: { fontSize: "13px", color: "#4b5563", fontStyle: "italic", textAlign: "center", marginTop: "16px" },
  singleCommentBubble: { backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: "12px" },
  commentAuthorName: { fontSize: "12px", fontWeight: "700", color: "#ff6b35" },
  trashIconBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "12px", opacity: 0.4 },
  commentBodyText: { fontSize: "13px", color: "#d1d5db", marginTop: "2px", lineHeight: "1.4" },
  actionEngagementDeck: { padding: "16px 20px", backgroundColor: "#090a0f", borderTop: "1px solid rgba(255,255,255,0.06)" },
  likeRowMetricLine: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  likeActionButton: { background: "none", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: 0 },
  realtimeLikeCounter: { fontSize: "12px", color: "#9ca3af", fontWeight: "500" },
  commentInputFormWrapper: { display: "flex", gap: "10px" },
  premiumInteractiveInput: { flex: 1, backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none" },
  sendCommentButton: { backgroundColor: "#ff6b35", color: "#fff", border: "none", borderRadius: "10px", padding: "0 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }
};

export default Public;