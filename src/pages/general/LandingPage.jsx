import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToSection = (id) => {
        setMenuOpen(false);
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                .fade-up { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .delay-1 { animation-delay: 0.08s; }
                .delay-2 { animation-delay: 0.16s; }
                .delay-3 { animation-delay: 0.24s; }
                .float { animation: floatSlow 6s ease-in-out infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .fade-up, .float { animation: none !important; }
                }

                @media (max-width: 968px) {
                    .hero-container { flex-direction: column !important; text-align: center; padding: 56px 6% 64px !important; }
                    .hero-left { order: 2; align-items: center !important; }
                    .hero-right { order: 1; margin-bottom: 8px !important; }
                    .hero-title { font-size: 40px !important; }
                    .hero-btns, .stats-container { justify-content: center !important; }
                    .nav-links-desktop { display: none !important; }
                    .steps-container { flex-direction: column !important; gap: 28px !important; }
                    .partner-split { flex-direction: column !important; gap: 48px !important; text-align: center; }
                    .partner-left { max-width: 100% !important; align-items: center !important; }
                    .benefit-list { align-items: center !important; }
                    .section-pad { padding: 72px 6% !important; }
                    .phone-frame { width: 230px !important; height: 460px !important; }
                }
                @media (max-width: 640px) {
                    .hero-title { font-size: 32px !important; letter-spacing: -0.5px !important; }
                    .hero-btns { flex-direction: column; width: 100%; }
                    .hero-btns button { width: 100%; }
                    .stats-container { gap: 18px !important; justify-content: space-between !important; width: 100%; }
                    .auth-buttons-desktop { display: none !important; }
                    .cta-title { font-size: 28px !important; }
                }

                .hover-card { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.35s, background 0.35s, box-shadow 0.35s; }
                .hover-card:hover { transform: translateY(-6px); border-color: rgba(255, 122, 26, 0.35) !important; background: #161c30 !important; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.5); }
                .btn-transition { transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease; }
                .btn-transition:hover { transform: translateY(-2px); }
                .btn-transition:active { transform: translateY(0); }
                .nav-anchor { background: none; border: none; color: #a3a9bd; font-size: 14.5px; font-weight: 500; cursor: pointer; transition: color 0.2s; font-family: inherit; padding: 8px 4px; position: relative; }
                .nav-anchor::after { content: ""; position: absolute; left: 4px; right: 4px; bottom: 0; height: 2px; background: #ff7a1a; transform: scaleX(0); transition: transform 0.25s ease; }
                .nav-anchor:hover { color: #f3f4f6; }
                .nav-anchor:hover::after { transform: scaleX(1); }

                .menu-btn { display: none; background: none; border: 1px solid rgba(255,255,255,0.12); color: #f3f4f6; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; align-items: center; justify-content: center; }
                @media (max-width: 968px) { .menu-btn { display: flex; } }

                .mobile-menu { animation: fadeUp 0.25s ease both; }

                a, button { font-family: inherit; }
                ::selection { background: rgba(255,122,26,0.35); }
            `}</style>

            <div style={styles.page}>
                {/* NAVBAR */}
                <nav style={{ ...styles.navbar, background: scrolled ? "rgba(8, 10, 17, 0.88)" : "rgba(8, 10, 17, 0.4)", borderBottomColor: scrolled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0)" }}>
                    <div style={{ ...styles.logo, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        Food<span style={{ color: "#ff7a1a" }}>Reels</span>
                    </div>

                    <div className="nav-links-desktop" style={styles.navLinks}>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="nav-anchor">Home</button>
                        <button onClick={() => navigate("/home")} className="nav-anchor">Explore</button>
                        <button onClick={() => scrollToSection("features")} className="nav-anchor">Features</button>
                        <button onClick={() => scrollToSection("partners")} className="nav-anchor">Partners</button>
                        <button onClick={() => scrollToSection("how")} className="nav-anchor">How it works</button>
                    </div>

                    <div className="auth-buttons-desktop" style={styles.authButtons}>
                        <button className="btn-transition" style={styles.userBtn} onClick={() => navigate("/user/login")}>Log in</button>
                        <button className="btn-transition" style={styles.partnerBtn} onClick={() => navigate("/food-partner/register")}>Become a Partner</button>
                    </div>

                    <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </nav>

                {menuOpen && (
                    <div className="mobile-menu" style={styles.mobileMenu}>
                        <button className="nav-anchor" style={styles.mobileLink} onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Home</button>
                        <button className="nav-anchor" style={styles.mobileLink} onClick={() => { setMenuOpen(false); navigate("/home"); }}>Explore</button>
                        <button className="nav-anchor" style={styles.mobileLink} onClick={() => scrollToSection("features")}>Features</button>
                        <button className="nav-anchor" style={styles.mobileLink} onClick={() => scrollToSection("partners")}>Partners</button>
                        <button className="nav-anchor" style={styles.mobileLink} onClick={() => scrollToSection("how")}>How it works</button>
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                            <button className="btn-transition" style={{ ...styles.userBtn, flex: 1 }} onClick={() => { setMenuOpen(false); navigate("/user/login"); }}>Log in</button>
                            <button className="btn-transition" style={{ ...styles.partnerBtn, flex: 1 }} onClick={() => { setMenuOpen(false); navigate("/food-partner/register"); }}>Partner</button>
                        </div>
                    </div>
                )}

                {/* HERO */}
                <section className="hero-container" style={styles.hero}>
                    <div className="hero-left fade-up" style={styles.heroLeft}>
                        <span style={styles.badge}>🔥 India's fastest growing food reel platform</span>

                        <h1 className="hero-title" style={styles.heroTitle}>
                            Taste it before
                            <br />
                            you <span style={styles.heroAccent}>order it</span>
                        </h1>

                        <p style={styles.heroDesc}>
                            Browse real, unscripted food reels from kitchens near you — find the
                            dish, find the place, and book a table in the same swipe.
                        </p>

                        <div className="hero-btns" style={styles.heroBtns}>
                            <button className="btn-transition" style={styles.exploreBtn} onClick={() => navigate("/home")}>
                                Explore Reels →
                            </button>
                            <button className="btn-transition" style={styles.joinBtn} onClick={() => scrollToSection("partners")}>
                                List Your Restaurant
                            </button>
                        </div>

                        <div className="stats-container" style={styles.stats}>
                            <div style={styles.statItem}>
                                <h3 style={styles.statNumber}>50K+</h3>
                                <p style={styles.statLabel}>Active users</p>
                            </div>
                            <div style={{ ...styles.statItem, borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "0 28px" }}>
                                <h3 style={styles.statNumber}>10K+</h3>
                                <p style={styles.statLabel}>Reels uploaded</p>
                            </div>
                            <div style={styles.statItem}>
                                <h3 style={styles.statNumber}>2K+</h3>
                                <p style={styles.statLabel}>Partner kitchens</p>
                            </div>
                        </div>
                    </div>

                    <div className="hero-right fade-up delay-2" style={styles.heroRight}>
                        <div className="float" style={styles.phoneWrapper}>
                            <div className="phone-frame" style={styles.phone}>
                                <img
                                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                                    alt="Trending food reel"
                                    style={styles.phoneImg}
                                />
                                <div style={styles.phoneTopFade} />
                                <div style={styles.phoneBottomFade} />
                                <div style={styles.overlay}>❤️ 24.5K · Butter Chicken, Karim's</div>
                            </div>
                            <div style={styles.floatingBadge1}>📍 0.8 km away</div>
                            <div style={styles.floatingBadge2}>⭐ 4.8 rating</div>
                        </div>
                    </div>
                </section>

                {/* LOGO / TRUST STRIP */}
                <div style={styles.trustStrip}>
                    <span style={styles.trustText}>Trusted by food lovers across</span>
                    <div style={styles.trustCities}>
                        {["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Hyderabad", "Pune"].map((c) => (
                            <span key={c} style={styles.trustCity}>{c}</span>
                        ))}
                    </div>
                </div>

                {/* FEATURES SECTION */}
                <section id="features" className="section-pad" style={styles.section}>
                    <span style={styles.sectionAccent}>WHY FOODREELS</span>
                    <h2 className="fade-up" style={styles.sectionTitle}>Built for people who eat with their eyes first</h2>
                    <p style={styles.sectionSubtitle}>Four things FoodReels does well — nothing more, nothing wasted.</p>

                    <div style={styles.grid}>
                        {[
                            { icon: "🎬", color: "#ff7a1a", bg: "rgba(255, 122, 26, 0.1)", title: "Cinematic feeds", desc: "Ultra-HD vertical clips, ranked by location and the cravings you actually act on." },
                            { icon: "📍", color: "#4cc9f0", bg: "rgba(76, 201, 240, 0.1)", title: "Hyperlocal radar", desc: "Tap any reel for exact directions, walking time, and live seating status." },
                            { icon: "🔖", color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)", title: "Smart collections", desc: "Save reels into private boards — date night, family dinner, late-night cravings." },
                            { icon: "🎙️", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)", title: "Creator ecosystem", desc: "Follow verified local critics and home chefs for unscripted, honest takes." },
                        ].map((f, i) => (
                            <div key={f.title} className={`hover-card fade-up ${i % 2 === 0 ? "delay-1" : "delay-2"}`} style={styles.card}>
                                <div style={{ ...styles.iconContainer, background: f.bg, color: f.color }}>{f.icon}</div>
                                <h3 style={styles.cardTitle}>{f.title}</h3>
                                <p style={styles.cardDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PARTNERS SECTION */}
                <section id="partners" className="section-pad" style={styles.partnerSection}>
                    <div className="partner-split" style={styles.partnerSplit}>
                        <div className="partner-left fade-up" style={styles.partnerLeft}>
                            <span style={styles.badgeLine}>FOR RESTAURANTS</span>
                            <h2 style={styles.partnerTitle}>Your food deserves more than a static photo</h2>
                            <p style={styles.partnerSubtitle}>
                                Turn your best dishes into vertical video that travels — and convert
                                that attention into reservations the same day.
                            </p>

                            <div className="benefit-list" style={styles.benefitList}>
                                <div style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Zero-cost distribution to thousands of nearby diners</div>
                                <div style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Menu links embedded directly under every clip</div>
                                <div style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Live audience and conversion analytics dashboard</div>
                            </div>

                            <button className="btn-transition" style={styles.partnerBtnLarge} onClick={() => navigate("/food-partner/register")}>
                                Claim Your Partner Account
                            </button>
                        </div>

                        <div className="fade-up delay-2" style={styles.partnerRight}>
                            <div style={styles.partnerMiniGrid}>
                                {[
                                    { label: "Reach boost", val: "+420%" },
                                    { label: "Conversion", val: "3.8×" },
                                    { label: "Retention", val: "84%" },
                                    { label: "ROI tracking", val: "Live" },
                                ].map((m) => (
                                    <div key={m.label} className="hover-card" style={styles.partnerMetricsCard}>
                                        <span style={styles.metricTitle}>{m.label}</span>
                                        <span style={styles.metricVal}>{m.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how" className="section-pad" style={styles.section}>
                    <span style={styles.sectionAccent}>THREE STEPS</span>
                    <h2 className="fade-up" style={styles.sectionTitle}>From scroll to seat in minutes</h2>
                    <p style={styles.sectionSubtitle}>No clutter, no extra steps — just discovery that ends in a real meal.</p>

                    <div className="steps-container" style={styles.steps}>
                        {[
                            { num: "1", title: "Set up your profile", desc: "Register as a diner or a merchant in under 60 seconds." },
                            { num: "2", title: "Swipe & explore", desc: "Browse high-quality local food clips, tuned to your taste." },
                            { num: "3", title: "Dine & grow", desc: "Visit the place, or track conversions if you're a partner." },
                        ].map((s) => (
                            <div key={s.num} className="fade-up" style={styles.step}>
                                <span style={styles.stepNum}>{s.num}</span>
                                <h3 style={styles.stepTitle}>{s.title}</h3>
                                <p style={styles.stepDesc}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={styles.cta}>
                    <h2 className="cta-title fade-up" style={styles.ctaTitle}>Hungry for something new?</h2>
                    <p style={styles.ctaDesc}>Join thousands of food lovers and restaurant owners already on FoodReels.</p>

                    <div className="hero-btns" style={styles.heroBtns}>
                        <button className="btn-transition" style={styles.ctaPrimaryBtn} onClick={() => navigate("/user/login")}>
                            Join as a User
                        </button>
                        <button className="btn-transition" style={styles.ctaSecondaryBtn} onClick={() => navigate("/food-partner/register")}>
                            Become a Partner
                        </button>
                    </div>
                </section>

                {/* FOOTER */}
                <footer style={styles.footer}>
                    <div style={styles.footerTop}>
                        <h3 style={{ margin: 0, fontSize: "20px" }}>Food<span style={{ color: "#ff7a1a" }}>Reels</span></h3>
                        <div style={styles.footerLinks}>
                            <button className="nav-anchor" onClick={() => scrollToSection("features")}>Features</button>
                            <button className="nav-anchor" onClick={() => scrollToSection("partners")}>Partners</button>
                            <button className="nav-anchor" onClick={() => navigate("/food-partner/login")}>Partner login</button>
                        </div>
                    </div>
                    <p style={styles.footerCopy}>
                        © {new Date().getFullYear()} FoodReels Inc. Discover · Watch · Save · Grow
                    </p>
                </footer>
            </div>
        </>
    );
};

const styles = {
    page: {
        background: "#080a11",
        minHeight: "100vh",
        color: "#f3f4f6",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "hidden",
    },

    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 6%",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid",
        transition: "background 0.3s ease, border-color 0.3s ease",
    },

    logo: { fontSize: "23px", fontWeight: "800", letterSpacing: "-0.5px" },

    navLinks: { display: "flex", gap: "8px", alignItems: "center" },

    authButtons: { display: "flex", gap: "12px", alignItems: "center" },

    userBtn: {
        background: "transparent",
        color: "#f3f4f6",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        padding: "10px 18px",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
    },

    partnerBtn: {
        background: "#ff7a1a",
        color: "#0a0a0a",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(255, 122, 26, 0.28)",
    },

    mobileMenu: {
        position: "sticky",
        top: "65px",
        zIndex: 999,
        background: "#0b0e17",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "12px 6% 20px",
        gap: "4px",
    },

    mobileLink: { textAlign: "left", padding: "12px 4px", fontSize: "16px" },

    hero: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "96px 6% 90px",
        gap: "60px",
        maxWidth: "1320px",
        margin: "0 auto",
    },

    heroLeft: { flex: 1.15, textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start" },

    badge: {
        background: "rgba(255,122,26, 0.1)",
        color: "#ff9a4d",
        padding: "8px 16px",
        borderRadius: "100px",
        display: "inline-block",
        marginBottom: "26px",
        fontSize: "13.5px",
        fontWeight: "600",
        border: "1px solid rgba(255, 122, 26, 0.2)",
    },

    heroTitle: {
        fontSize: "58px",
        fontWeight: "800",
        lineHeight: 1.1,
        letterSpacing: "-2px",
        color: "#ffffff",
        margin: "0 0 22px 0",
    },

    heroAccent: {
        background: "linear-gradient(95deg, #ff7a1a, #ffb347)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    heroDesc: {
        color: "#9ba0b4",
        fontSize: "17px",
        lineHeight: "1.65",
        maxWidth: "480px",
        margin: "0 0 34px 0",
    },

    heroBtns: { display: "flex", gap: "14px", flexWrap: "wrap" },

    exploreBtn: {
        background: "#ff7a1a",
        color: "#0a0a0a",
        border: "none",
        padding: "15px 30px",
        borderRadius: "10px",
        fontSize: "15.5px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(255,122,26, 0.32)",
    },

    joinBtn: {
        background: "rgba(255,255,255,0.04)",
        color: "#f3f4f6",
        border: "1px solid rgba(255,255,255,0.14)",
        padding: "15px 30px",
        borderRadius: "10px",
        fontSize: "15.5px",
        fontWeight: "600",
        cursor: "pointer",
    },

    stats: { display: "flex", gap: "0", marginTop: "56px" },

    statItem: { display: "flex", flexDirection: "column" },

    statNumber: { fontSize: "30px", fontWeight: "800", margin: 0, color: "#ffffff", letterSpacing: "-0.5px" },

    statLabel: { margin: "4px 0 0 0", color: "#6b7280", fontSize: "13.5px", fontWeight: "500" },

    heroRight: { flex: 0.85, display: "flex", justifyContent: "center" },

    phoneWrapper: { position: "relative" },

    phone: {
        width: "270px",
        height: "540px",
        borderRadius: "34px",
        overflow: "hidden",
        position: "relative",
        border: "6px solid #11141f",
        boxShadow: "0 30px 60px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
    },

    phoneImg: { width: "100%", height: "100%", objectFit: "cover" },

    phoneTopFade: {
        position: "absolute", top: 0, left: 0, right: 0, height: "90px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
    },

    phoneBottomFade: {
        position: "absolute", bottom: 0, left: 0, right: 0, height: "160px",
        background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
    },

    overlay: {
        position: "absolute",
        bottom: "20px",
        left: "16px",
        right: "16px",
        background: "rgba(10, 12, 19, 0.55)",
        backdropFilter: "blur(8px)",
        padding: "10px 16px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: "600",
        border: "1px solid rgba(255,255,255,0.12)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
    },

    floatingBadge1: {
        position: "absolute",
        top: "60px",
        left: "-36px",
        background: "#11141f",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "9px 14px",
        borderRadius: "12px",
        fontSize: "12.5px",
        fontWeight: "600",
        boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
    },

    floatingBadge2: {
        position: "absolute",
        bottom: "120px",
        right: "-30px",
        background: "#11141f",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "9px 14px",
        borderRadius: "12px",
        fontSize: "12.5px",
        fontWeight: "600",
        boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
    },

    trustStrip: {
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "26px 6%",
        display: "flex",
        flexWrap: "wrap",
        gap: "18px",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "1320px",
        margin: "0 auto",
    },

    trustText: { color: "#5b6072", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },

    trustCities: { display: "flex", gap: "26px", flexWrap: "wrap", justifyContent: "center" },

    trustCity: { color: "#7b8094", fontSize: "14.5px", fontWeight: "600" },

    section: { padding: "100px 6%", maxWidth: "1320px", margin: "0 auto" },

    sectionAccent: {
        color: "#ff7a1a",
        fontSize: "12.5px",
        fontWeight: "700",
        letterSpacing: "1.8px",
        display: "block",
        textAlign: "center",
        marginBottom: "12px",
    },

    sectionTitle: {
        textAlign: "center",
        fontSize: "34px",
        fontWeight: "800",
        letterSpacing: "-1px",
        margin: "0 0 12px 0",
        color: "#ffffff",
        maxWidth: "640px",
        marginLeft: "auto",
        marginRight: "auto",
    },

    sectionSubtitle: {
        textAlign: "center",
        color: "#8b90a3",
        fontSize: "15.5px",
        maxWidth: "520px",
        margin: "0 auto 56px auto",
        lineHeight: "1.6",
    },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" },

    card: { background: "#10131f", padding: "36px 26px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.04)" },

    iconContainer: {
        fontSize: "22px",
        marginBottom: "22px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
    },

    cardTitle: { fontSize: "18.5px", fontWeight: "700", margin: "0 0 10px 0", color: "#ffffff" },

    cardDesc: { color: "#8b90a3", fontSize: "14px", lineHeight: "1.65", margin: 0 },

    partnerSection: {
        padding: "100px 6%",
        background: "linear-gradient(180deg, #080a11 0%, #0d1018 100%)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
    },

    partnerSplit: { display: "flex", alignItems: "center", gap: "80px", maxWidth: "1180px", margin: "0 auto" },

    partnerLeft: { flex: 1.15, maxWidth: "540px", display: "flex", flexDirection: "column", alignItems: "flex-start" },

    badgeLine: { color: "#ff7a1a", fontSize: "12.5px", fontWeight: "700", letterSpacing: "2px", display: "block", marginBottom: "14px" },

    partnerTitle: {
        fontSize: "36px",
        fontWeight: "800",
        margin: "0 0 18px 0",
        color: "#fff",
        letterSpacing: "-1px",
        lineHeight: "1.2",
    },

    partnerSubtitle: { color: "#8b90a3", margin: "0 0 30px 0", fontSize: "15.5px", lineHeight: "1.65" },

    benefitList: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px", alignItems: "flex-start" },

    benefitItem: { fontSize: "14.5px", color: "#c8cbd9", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px" },

    checkIcon: {
        width: "20px", height: "20px", borderRadius: "50%",
        background: "rgba(74, 222, 128, 0.12)", color: "#4ade80",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: "800", flexShrink: 0,
    },

    partnerRight: { flex: 0.8, width: "100%" },

    partnerMiniGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },

    partnerMetricsCard: {
        background: "#10131f",
        padding: "28px 20px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    },

    metricTitle: { fontSize: "12.5px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },

    metricVal: { fontSize: "26px", color: "#fff", fontWeight: "800" },

    partnerBtnLarge: {
        background: "#ff7a1a",
        border: "none",
        color: "#0a0a0a",
        padding: "16px 34px",
        borderRadius: "10px",
        fontSize: "15.5px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 10px 28px rgba(255,122,26, 0.3)",
    },

    steps: { display: "flex", justifyContent: "space-between", gap: "30px", marginTop: "12px" },

    step: { textAlign: "center", flex: 1, padding: "12px" },

    stepNum: {
        width: "46px",
        height: "46px",
        background: "rgba(255,122,26, 0.1)",
        color: "#ff7a1a",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        fontSize: "17px",
        fontWeight: "800",
        marginBottom: "20px",
        border: "1px solid rgba(255,122,26, 0.22)",
    },

    stepTitle: { fontSize: "17.5px", fontWeight: "700", margin: "0 0 8px 0" },

    stepDesc: { color: "#8b90a3", fontSize: "14px", lineHeight: "1.65", margin: 0 },

    cta: {
        padding: "96px 6%",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(255,122,26,0.12), transparent 60%), linear-gradient(135deg, #0e1018 0%, #160f0a 100%)",
        borderTop: "1px solid rgba(255,122,26, 0.14)",
    },

    ctaTitle: { fontSize: "34px", fontWeight: "800", margin: "0 0 14px 0", letterSpacing: "-1px" },

    ctaDesc: { color: "#9ba0b4", fontSize: "15.5px", maxWidth: "520px", margin: "0 auto 34px auto", lineHeight: "1.6" },

    ctaPrimaryBtn: {
        background: "#ffffff",
        color: "#080a11",
        border: "none",
        padding: "15px 30px",
        borderRadius: "10px",
        fontSize: "15.5px",
        fontWeight: "700",
        cursor: "pointer",
    },

    ctaSecondaryBtn: {
        background: "transparent",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.18)",
        padding: "15px 30px",
        borderRadius: "10px",
        fontSize: "15.5px",
        fontWeight: "600",
        cursor: "pointer",
    },

    footer: { padding: "44px 6% 36px", borderTop: "1px solid rgba(255,255,255,0.05)", maxWidth: "1320px", margin: "0 auto" },

    footerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "18px" },

    footerLinks: { display: "flex", gap: "8px", flexWrap: "wrap" },

    footerCopy: { color: "#5b6072", fontSize: "13.5px", margin: 0 },
};

export default LandingPage;