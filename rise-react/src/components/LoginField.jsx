// Reusable login input — beginner friendly

export default function LoginField({ label, id, type, value, onChange, onEnter, error, icon, onToggle, showPass }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <i className={"bi " + icon + " field-icon"}></i>
        <input
          id={id}
          type={showPass ? "text" : type}
          value={value}
          onChange={onChange}
          onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
        />
        {onToggle && (
          <i className={"bi " + (showPass ? "bi-eye-slash" : "bi-eye") + " field-icon-right"} onClick={onToggle}></i>
        )}
      </div>
      {error && <div className="field-error visible"><span>{error}</span></div>}
    </div>
  );
}
