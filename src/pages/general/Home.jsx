import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
const Home = () => {
  const [reels, setReels] = useState([]);
  const [likedItems, setLikedItems] = useState({});
  const [savedItems, setSavedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mutedMap, setMutedMap] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [heartBurst, setHeartBurst] = useState(null);

  // Comments Engine States
  const [showComments, setShowComments] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const videoRefs = useRef({});
  const containerRef = useRef(null);

  // FETCH COMMENTS SAFELY ONLY ON ACTIVE INDEX ROTATION (KILLS RE-RENDER LOOP)
  useEffect(() => {
    if (reels.length > 0 && reels[activeIndex]) {
      const activeReelId = reels[activeIndex]._id;
      setSelectedFoodId(activeReelId);
      
      axios.get(`${API}/api/food/comments/${activeReelId}`, {
        withCredentials: true,
      })
      .then(res => {
        setComments(res.data.comments || res.data || []);
      })
      .catch(err => console.error("Desktop comments sync error:", err));
    }
  }, [activeIndex, reels.length]); // Added reels.length safety dependency

  // OPEN COMMENTS MODULE
  const openComments = async (foodId) => {
    setSelectedFoodId(foodId);
    setShowComments(true);
    setComments([]); 
    
    try {
      const res = await axios.get(`${API}/api/food/comments/${foodId}`, {
        withCredentials: true,
      });
      setComments(res.data.comments || res.data || []);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  // ADD COMMENT SUBMISSION (FIXED REAL-TIME COUNT)
  const handleComment = async () => {
    if (!commentText.trim() || !selectedFoodId) return;

    try {
      const res = await axios.post(
        `${API}/api/food/comment`,
        { foodId: selectedFoodId, comment: commentText },
        { withCredentials: true }
      );

      const freshComment = res.data.comment;

      // Update local comment list instantly
      setComments((prev) => [freshComment, ...prev]);
      
      // Update comment count instantly in the reels state
      setReels((prevReels) =>
        prevReels.map((item) =>
          item._id === selectedFoodId
            ? { ...item, commentCount: (item.commentCount || 0) + 1 }
            : item
        )
      );

      setCommentText("");
    } catch (err) {
      console.error("COMMENT ERROR:", err.response?.data);
    }
  };

  // DELETE COMMENT METHOD (FIXED REAL-TIME COUNT)
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axios.delete(`${API}/api/food/comment/${commentId}`, {
        withCredentials: true,
      });

      setComments((prev) => prev.filter((c) => c._id !== commentId));

      setReels((prevReels) =>
        prevReels.map((item) =>
          item._id === selectedFoodId
            ? { ...item, commentCount: Math.max(0, (item.commentCount || 1) - 1) }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to delete comment:", err.response?.data || err.message);
    }
  };

  // FETCH CORE REELS DATA
  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API}/api/food/`, {
          withCredentials: true,
        });

        const data = response.data.foodItem || [];
        setReels(data);

        const likes = {};
        const saves = {};
        const muted = {};

        data.forEach((item) => {
          // If your backend handles persistent user authentications, fall back to API states here
          likes[item._id] = item.isLiked || false; 
          saves[item._id] = item.isSaved || false;
          muted[item._id] = true;
        });

        setLikedItems(likes);
        setSavedItems(saves);
        setMutedMap(muted);
      } catch (err) {
        console.error("Error fetching reels:", err);
        setError("Couldn't load reels right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // OBSERVE VISIBLE REELS FOR AUTO-PLAY
  useEffect(() => {
    if (!reels.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const id = video.dataset.id;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            const idx = reels.findIndex((r) => r._id === id);
            if (idx !== -1) setActiveIndex(idx);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(videoRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  // LIKE SYSTEM (FIXED ASYNC MUTATION MISMATH)
  const handleLike = async (foodId) => {
    const isCurrentlyLiked = likedItems[foodId];

    // 1. Optimistically update local active true/false maps
    setLikedItems((prev) => ({ ...prev, [foodId]: !isCurrentlyLiked }));

    // 2. Adjust counter instantly based on the correct previous dynamic status
    setReels((prevReels) =>
      prevReels.map((item) =>
        item._id === foodId
          ? { ...item, likeCount: Math.max(0, (item.likeCount || 0) + (isCurrentlyLiked ? -1 : 1)) }
          : item
      )
    );

    try {
      await axios.post(`${API}/api/food/like`, { foodId }, { withCredentials: true });
    } catch (err) {
      console.error("Like error:", err);
      // Revert if API fails completely
      setLikedItems((prev) => ({ ...prev, [foodId]: isCurrentlyLiked }));
      setReels((prevReels) =>
        prevReels.map((item) =>
          item._id === foodId
            ? { ...item, likeCount: (item.likeCount || 0) + (isCurrentlyLiked ? 1 : -1) }
            : item
        )
      );
    }
  };

  const handleDoubleTapLike = (foodId) => {
    if (!likedItems[foodId]) {
      handleLike(foodId);
    }
    setHeartBurst(foodId);
    setTimeout(() => setHeartBurst(null), 700);
  };

  // SAVE SYSTEM (FIXED REAL-TIME UPDATES)
  const handleSave = async (foodId) => {
    const isCurrentlySaved = savedItems[foodId];
    
    setSavedItems((prev) => ({ ...prev, [foodId]: !isCurrentlySaved }));
    setReels((prevReels) =>
      prevReels.map((item) =>
        item._id === foodId
          ? { ...item, saveCount: Math.max(0, (item.saveCount || 0) + (isCurrentlySaved ? -1 : 1)) }
          : item
      )
    );

    try {
      await axios.post(`${API}/api/food/save`, { foodId }, { withCredentials: true });
    } catch (err) {
      console.error("Save error:", err);
      // Revert if API fails completely
      setSavedItems((prev) => ({ ...prev, [foodId]: isCurrentlySaved }));
      setReels((prevReels) =>
        prevReels.map((item) =>
          item._id === foodId
            ? { ...item, saveCount: (item.saveCount || 0) + (isCurrentlySaved ? 1 : -1) }
            : item
        )
      );
    }
  };

  const toggleMute = (foodId) => {
    setMutedMap((prev) => ({ ...prev, [foodId]: !prev[foodId] }));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#05070c" }}>
      <style>{`
        .reel-feed::-webkit-scrollbar { display: none; }
        
        @media (min-width: 992px) {
          .reel-slide-wrapper { padding: 0 !important; }
          .reel-card-frame {
            max-width: 440px !important;
            height: 90vh !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255,255,255,0.06);
          }
        }

        @keyframes heartPop {
          0% { transform: scale(0.3); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          65% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .heart-burst { animation: heartPop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .like-pulse { animation: pulseHeart 0.35s ease-out; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.9s linear infinite; }
        .side-action { transition: all 0.2s ease; cursor: pointer; }
        .side-action:hover { transform: scale(1.08); }
        .comment-item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .comment-trash-btn { background: transparent; border: none; color: #ef4444; opacity: 0.5; cursor: pointer; transition: opacity 0.2s; font-size: 12px; padding: 2px 6px; }
        .comment-trash-btn:hover { opacity: 1; }
        .interactive-input-box { pointer-events: auto !important; user-select: text !important; }
      `}</style>

      {loading && (
        <div style={styles.centerScreen}>
          <div style={styles.spinnerRing} className="spinner" />
          <p style={styles.centerText}>Assembling feed framework…</p>
        </div>
      )}

      {error && <div style={styles.centerScreen}><p style={{ fontSize: "32px" }}>⚠️</p><p style={styles.centerText}>{error}</p></div>}

      {/* Progress Tracks */}
      {!loading && reels.length > 0 && (
        <div style={styles.progressRail}>
          {reels.map((_, i) => (
            <div key={i} style={{ ...styles.progressDot, background: i === activeIndex ? "#ff6b35" : "rgba(255,255,255,0.2)", height: i === activeIndex ? "24px" : "8px" }} />
          ))}
        </div>
      )}

      {/* CORE SCROLL FEED */}
      <div ref={containerRef} style={styles.feed} className="reel-feed">
        {reels.map((reel) => {
          const isMuted = mutedMap[reel._id] !== false;
          return (
            <div key={reel._id} style={styles.slide} className="reel-slide-wrapper">
              <div style={styles.card} className="reel-card-frame">
                
                <video
                  ref={(el) => (videoRefs.current[reel._id] = el)}
                  data-id={reel._id}
                  src={reel.video || reel.videoUrl}
                  style={styles.video}
                  loop
                  muted={isMuted}
                  playsInline
                  onDoubleClick={() => handleDoubleTapLike(reel._id)}
                />

                {heartBurst === reel._id && <div style={styles.heartOverlay} className="heart-burst">❤️</div>}

                <div style={styles.topFade} />
                <button className="side-action" onClick={() => toggleMute(reel._id)} style={styles.muteBtn}>
                  {isMuted ? "🔇" : "🔊"}
                </button>

                <div style={styles.bottomFade} />

                {/* BOTTOM CONTENT INFO ROW OVERLAY */}
                <div style={styles.bottomContent}>
                  <div style={styles.userRow}>
                    <div style={styles.avatar}>{(reel.username || "F").charAt(0).toUpperCase()}</div>
                    <h6 style={styles.username}>@{reel.username || "food_user"}</h6>
                  </div>
                  <p style={styles.description}>{reel.description || "No description provided"}</p>
                  <Link to={`/public/${reel.foodPartner?._id || reel.foodPartner}`} style={styles.visitBtn}>
                    Visit Hub Store →
                  </Link>
                </div>

                {/* ACTIONS SIDEBAR */}
                <div style={styles.sidebar}>
                  <div className="side-action" style={styles.sideItem} onClick={() => handleLike(reel._id)}>
                    <div className={likedItems[reel._id] ? "like-pulse" : ""} style={styles.sideIcon}>
                      {likedItems[reel._id] ? "❤️" : "🤍"}
                    </div>
                    <small style={styles.sideCount}>{reel.likeCount || 0}</small>
                  </div>

                  <div className="side-action" style={styles.sideItem} onClick={() => handleSave(reel._id)}>
                    <div style={styles.sideIcon}>{savedItems[reel._id] ? "🔖" : "📑"}</div>
                    <small style={styles.sideCount}>{reel.saveCount || 0}</small>
                  </div>

                  <div className="side-action" style={styles.sideItem} onClick={() => openComments(reel._id)}>
                    <div style={styles.sideIcon}>💬</div>
                    <small style={styles.sideCount}>{reel.commentCount || 0}</small>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* UNIFIED GLOBAL COMMENT DRAWER MODAL OVERLAY */}
      {showComments && (
        <div style={styles.commentOverlay} onClick={() => setShowComments(false)}>
          <div style={styles.commentBox} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} onKeyDown={(e) => e.stopPropagation()}>
            <div style={styles.modalTopBar}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#fff" }}>Comments Thread</h3>
              <button onClick={() => setShowComments(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.commentList}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item-row">
                    <div style={{ paddingRight: "10px" }}>
                      <strong style={{ fontSize: "13px", color: "#ff6b35" }}>
                        @{comment.userId?.fullName || comment.username || "user"}
                      </strong>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13.5px", color: "#e4e4e7", lineHeight: "1.4" }}>
                        {comment.comment}
                      </p>
                    </div>
                    <button className="comment-trash-btn" onClick={() => handleDeleteComment(comment._id)}>🗑️</button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "60px 10px", color: "#71717a", fontSize: "13.5px" }}>
                  Be the first to share your thoughts!
                </div>
              )}
            </div>

            <div style={styles.commentInputRow} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="interactive-input-box"
                placeholder="Write an open comment review…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={styles.textInputStyle}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleComment();
                }}
                tabIndex={1}
                autoFocus
              />
              <button onClick={handleComment} style={styles.postBtnStyle}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  feed: { height: "100vh", width: "100vw", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none", background: "#05070c" },
  slide: { height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", scrollSnapAlign: "start", position: "relative", padding: "16px 0", boxSizing: "border-box" },
  card: { position: "relative", width: "100%", maxWidth: "430px", height: "100%", maxHeight: "880px", overflow: "hidden", backgroundColor: "#000", borderRadius: "16px", boxShadow: "0 24px 60px rgba(0,0,0,0.85)" },
  video: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heartOverlay: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "95px", zIndex: 5, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))", pointerEvents: "none" },
  topFade: { position: "absolute", top: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)", zIndex: 1 },
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent, rgba(0,0,0,0.95))", zIndex: 1 },
  muteBtn: { position: "absolute", top: "18px", right: "18px", zIndex: 3, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
  bottomContent: { position: "absolute", bottom: "24px", left: 0, width: "100%", padding: "0 24px 0 20px", zIndex: 2, color: "#fff", boxSizing: "border-box" },
  userRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #ff6b35, #ff9f1c)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "14px", flexShrink: 0, color: "#000" },
  username: { margin: 0, fontWeight: "700", fontSize: "15px" },
  description: { fontSize: "13.5px", lineHeight: "1.5", maxWidth: "80%", margin: "0 0 16px 0", color: "rgba(255,255,255,0.85)" },
  visitBtn: { display: "block", width: "100%", textAlign: "center", background: "#ff6b35", color: "#fff", fontWeight: "700", fontSize: "14px", padding: "13px 0", borderRadius: "12px", textDecoration: "none" },
  sidebar: { position: "absolute", right: "16px", bottom: "160px", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", color: "#fff" },
  sideItem: { textAlign: "center" },
  sideIcon: { fontSize: "24px", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px", backdropFilter: "blur(12px)" },
  sideCount: { fontWeight: "700", fontSize: "12px", color: "rgba(255,255,255,0.7)" },
  progressRail: { position: "fixed", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "8px", zIndex: 10 },
  progressDot: { width: "5px", borderRadius: "4px", transition: "all 0.25s ease" },
  centerScreen: { height: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", color: "#9ca3af", background: "#05070c" },
  centerText: { fontSize: "14px", margin: 0 },
  spinnerRing: { width: "36px", height: "36px", border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#ff6b35", borderRadius: "50%" },

  commentOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  commentBox: { width: "100%", maxWidth: "440px", height: "75vh", background: "#12141c", color: "#fff", borderRadius: "20px", padding: "22px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" },
  modalTopBar: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  closeBtn: { background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  commentList: { flex: 1, overflowY: "auto", margin: "14px 0", paddingRight: "4px" },
  commentInputRow: { display: "flex", gap: "10px", alignItems: "center", background: "#090a0f", padding: "6px 12px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "auto" },
  textInputStyle: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", padding: "10px 0" },
  postBtnStyle: { background: "transparent", border: "none", color: "#ff6b35", fontWeight: "700", fontSize: "14px", cursor: "pointer", padding: "0 8px" }
};

export default Home;