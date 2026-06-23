import React, { useState, useRef } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const Create_Food = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    video: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "video") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, video: file }));

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Trigger hidden input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.video) {
      alert("Upload a video first");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("video", formData.video);

      const response = await axios.post(
        `${API}/api/food/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log(response.data);
      alert("Uploaded successfully 🚀");

      // reset
      setFormData({
        name: "",
        description: "",
        video: null,
      });
      setPreview(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Global CSS for seamless interactions */}
      <style>{`
        .input-focus-effect {
          transition: all 0.25s ease-in-out;
        }
        .input-focus-effect:focus {
          border-color: #ff6b35 !important;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.15);
        }
        .btn-hover-effect {
          transition: all 0.2s ease-in-out;
        }
        .btn-hover-effect:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(255, 107, 53, 0.35);
        }
        .dropzone-hover {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .dropzone-hover:hover {
          background: #161e30 !important;
          border-color: #ff6b35 !important;
        }
      `}</style>

      <div style={styles.card}>
        <h3 style={styles.title}>
          Upload Food Reel <span style={{ color: "#ff6b35" }}>🎥</span>
        </h3>

        <form onSubmit={handleSubmit} style={styles.formStructure}>
          
          {/* VIDEO PREVIEW BOX / DROPZONE */}
          <div 
            className="dropzone-hover" 
            style={styles.previewBox} 
            onClick={triggerFileInput}
          >
            {preview ? (
              <video src={preview} style={styles.videoStyle} controls />
            ) : (
              <div style={styles.placeholder}>
                <div style={styles.uploadIconContainer}>🎬</div>
                <p style={{ margin: "10px 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Choose video file</p>
                <p style={{ margin: 0, color: "#4b5563", fontSize: "12px" }}>MP4, MOV, or WebM format (9:16 aspect)</p>
              </div>
            )}
          </div>

          {/* Hidden Original File Input */}
          <input
            type="file"
            name="video"
            accept="video/*"
            ref={fileInputRef}
            onChange={handleChange}
            style={{ display: "none" }}
          />

          {/* INPUT FORM FIELDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            <div>
              <label style={styles.label}>Dish Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Crispy Peri Peri Loaded Fries"
                className="input-focus-effect"
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Captions / Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell food lovers what makes this special..."
                className="input-focus-effect"
                style={{ ...styles.input, ...styles.textarea }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-hover-effect"
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Publishing Video..." : "Publish Food Reel 🚀"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// COMPREHENSIVE STYLING ACCELERATOR
const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#070a13",
    padding: "40px 20px",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "850px", // Dual responsive split layout logic
    background: "#0e1322",
    padding: "32px",
    borderRadius: "20px",
    color: "#f3f4f6",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.03)",
  },

  title: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    margin: "0 0 28px 0",
    textAlign: "left",
  },

  formStructure: {
    display: "flex",
    flexDirection: "row",
    gap: "32px",
    alignItems: "flex-start",
    flexWrap: "wrap", // Forces vertical split natively down to mobile sizes
  },

  previewBox: {
    flex: "1 1 300px",
    maxWidth: "340px",
    width: "100%",
    aspectRatio: "9/16",
    background: "rgba(7, 10, 19, 0.6)",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed rgba(255, 255, 255, 0.08)",
    boxSizing: "border-box",
  },

  videoStyle: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  placeholder: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "20px",
  },

  uploadIconContainer: {
    fontSize: "36px",
    background: "rgba(255, 107, 53, 0.08)",
    color: "#ff6b35",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#9ca3af",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#070a13",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  textarea: {
    height: "120px",
    resize: "none",
    lineHeight: "1.5",
  },

  button: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#ff6b35",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    outline: "none",
    marginTop: "12px",
  },
};

export default Create_Food;