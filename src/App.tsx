    background: "#22c55e",
    color: "white",
    cursor: "pointer",
  },

  installButton: {
    marginLeft: "5px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#059669",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 3px 10px rgba(5,150,105,0.3)",
  },

  player: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    boxSizing: "border-box" as const,
    boxShadow: "0 -5px 20px rgba(0,0,0,0.2)",
    flexWrap: "wrap" as const,
  },

  playerInfo: {
    flex: "1 1 180px",
    minWidth: "160px",
  },

  reciter: {
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "3px",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  controlButton: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "50%",
    background: "#475569",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "17px",
  },

  playButton: {
    width: "52px",
    height: "52px",
    border: "none",
    borderRadius: "50%",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "20px",
  },

  volumeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "120px",
  },

  volume: {
    width: "90px",
    cursor: "pointer",
  },

  progressContainer: {
    flex: "1 1 100%",
    width: "100%",
    minWidth: 0,
    marginTop: "2px",
  },

  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontVariantNumeric: "tabular-nums" as const,
    marginBottom: "5px",
  },

  nowPlaying: {
    opacity: 0.75,
    textAlign: "center" as const,
  },

  progressSlider: {
    display: "block",
    width: "100%",
    height: "6px",
    borderRadius: "999px",
    appearance: "none" as const,
    cursor: "pointer",
    accentColor: "#22c55e",
  },
};
