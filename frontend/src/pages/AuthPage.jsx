import { useState } from "react";
import { api, setSession } from "../api";
import TiltCard from "../components/TiltCard";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      setSession(result.user, result.token);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-box">
      <TiltCard as="div" className="card">
        <h1>Campus Maintenance Tracker</h1>
        <p className="hint">Raise a maintenance complaint, track its status, and see updates from the maintenance team.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span>Full name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </label>
          )}
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          </label>
          {mode === "register" && (
            <label>
              <span>Role</span>
              <select value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
          <button disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        <p>
          {mode === "login" ? (
            <>No account yet? <button className="secondary" type="button" onClick={() => setMode("register")}>Register</button></>
          ) : (
            <>Already have an account? <button className="secondary" type="button" onClick={() => setMode("login")}>Log in</button></>
          )}
        </p>
        <div className="demo-box">
          Demo accounts — admin: <code>admin@demo.local / Admin123</code><br />
          Student: <code>student@demo.local / Student123</code>
        </div>
      </TiltCard>
    </div>
  );
}
