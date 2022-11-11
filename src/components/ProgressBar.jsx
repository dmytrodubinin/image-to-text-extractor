function ProgressBar({ status }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar__inner"
        style={{
          width: `${status.progress * 100}%`,
        }}
      >
        {status.progress !== 0
          ? `${Math.round(status.progress.toFixed(2) * 100)}%`
          : ""}
      </div>
      <div>
        {status.status === "recognizing text" && status.progress === 1
          ? "Text recognized"
          : status.status}
      </div>
    </div>
  );
}

export default ProgressBar;
