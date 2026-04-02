import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import "../Style/Dashboard.css";




// ─── Mock Data ────────────────────────────────────────────────────────────────
const BALANCE_DATA = [
  { date: "Mar 2",  balance: 5000 },
  { date: "Mar 8",  balance: 4800 },
  { date: "Mar 12", balance: 4500 },
  { date: "Mar 18", balance: 5100 },
  { date: "Mar 25", balance: 4600 },
  { date: "Apr 1",  balance: 9700 },
  { date: "Apr 3",  balance: 9600 },
  { date: "Apr 5",  balance: 8400 },
  { date: "Apr 7",  balance: 8200 },
  { date: "Apr 9",  balance: 9500 },
  { date: "Apr 15", balance: 8530 },
];

const SPENDING_DATA = [
  { name: "Food",          value: 28, color: "#7c3aed" },
  { name: "Travel",        value: 26, color: "#f59e0b" },
  { name: "Shopping",      value: 22, color: "#ec4899" },
  { name: "Bills",         value: 15, color: "#3b82f6" },
  { name: "Entertainment", value: 7,  color: "#10b981" },
  { name: "Healthcare",    value: 2,  color: "#ef4444" },
];

const MOCK_TRANSACTIONS = [
  { id: 1,  date: "Apr 15", desc: "Grocery Store",        cat: "Food",          type: "expense", amount: 84.50  },
  { id: 2,  date: "Apr 14", desc: "Monthly Salary",       cat: "Income",        type: "income",  amount: 5100   },
  { id: 3,  date: "Apr 13", desc: "Netflix Subscription", cat: "Entertainment", type: "expense", amount: 15     },
  { id: 4,  date: "Apr 12", desc: "Flight to Dubai",      cat: "Travel",        type: "expense", amount: 420    },
  { id: 5,  date: "Apr 11", desc: "Electric Bill",        cat: "Bills",         type: "expense", amount: 120    },
  { id: 6,  date: "Apr 10", desc: "Amazon Order",         cat: "Shopping",      type: "expense", amount: 235    },
  { id: 7,  date: "Apr 9",  desc: "Freelance Payment",    cat: "Income",        type: "income",  amount: 950    },
  { id: 8,  date: "Apr 8",  desc: "Doctor Visit",         cat: "Healthcare",    type: "expense", amount: 60     },
  { id: 9,  date: "Apr 7",  desc: "Restaurant Dinner",    cat: "Food",          type: "expense", amount: 72     },
  { id: 10, date: "Apr 5",  desc: "Uber Rides",           cat: "Travel",        type: "expense", amount: 38     },
  { id: 11, date: "Apr 3",  desc: "Online Shopping",      cat: "Shopping",      type: "expense", amount: 185    },
  { id: 12, date: "Apr 1",  desc: "Dividend Income",      cat: "Income",        type: "income",  amount: 320    },
];

const CAT_ICONS = {
  Food: "🍔", Travel: "✈️", Shopping: "🛍️", Bills: "⚡",
  Entertainment: "🎬", Healthcare: "💊", Income: "💼",
};

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, outerRadius, name, value }) {
  const r = outerRadius + 32;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill={SPENDING_DATA.find(d => d.name === name)?.color || "#666"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 600, fontFamily: "Nunito, sans-serif" }}
    >
      {name} {value}%
    </text>
  );
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ desc: "", cat: "Food", type: "expense", amount: "", date: new Date().toISOString().slice(0, 10) });
  const [err, setErr] = useState("");

  function submit() {
    if (!form.desc.trim()) { setErr("Description is required."); return; }
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) { setErr("Enter a valid amount."); return; }
    onAdd({ ...form, amount: parseFloat(form.amount), id: Date.now(), date: new Date(form.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add Transaction</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label>Description</label>
          <input className="modal-input" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="e.g. Grocery run" />
          <div className="modal-row">
            <div className="modal-field">
              <label>Amount ($)</label>
              <input className="modal-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="modal-field">
              <label>Type</label>
              <select className="modal-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Category</label>
              <select className="modal-input" value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>
                {["Food","Travel","Shopping","Bills","Entertainment","Healthcare","Income"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Date</label>
              <input className="modal-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          {err && <div className="modal-err">{err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={submit}>Add Transaction</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [role, setRole]           = useState("Admin");
  const [page, setPage]           = useState("Dashboard");
  const [txs, setTxs]             = useState(MOCK_TRANSACTIONS);
  const [search, setSearch]       = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [sortBy, setSortBy]       = useState("date-desc");
  const [showModal, setShowModal] = useState(false);
  const [roleOpen, setRoleOpen]   = useState(false);
  const [animate, setAnimate]     = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 30);
    return () => clearTimeout(t);
  }, [page]);

  // Close role dropdown on outside click
  useEffect(() => {
    function handler(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setRoleOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalIncome  = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;
  const isAdmin      = role === "Admin";

  // ── Filter + Sort transactions
  const filtered = txs
    .filter(t => {
      const q = search.toLowerCase();
      return (!q || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q))
          && (!filterType || t.type === filterType)
          && (!filterCat || t.cat === filterCat);
    })
    .sort((a, b) => {
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc")  return a.amount - b.amount;
      return sortBy === "date-asc" ? a.id - b.id : b.id - a.id;
    });

  function addTx(tx) {
    setTxs(prev => [tx, ...prev]);
  }

  // ── Custom tooltip for line chart
  function LineTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <div className="tt-label">{label}</div>
        <div className="tt-value">${payload[0].value.toLocaleString()}</div>
      </div>
    );
  }

  return (
    <div className="fp-app">
      {/* ── NAV ── */}
      <nav className="fp-nav">
        <div className="fp-logo">
          <span className="fp-logo-icon">💰</span>
          <span className="fp-logo-text">FinancePro</span>
        </div>
        <div className="fp-nav-links">
          {["Dashboard", "Transactions"].map(p => (
            <button key={p} className={`fp-nav-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
              <span className="fp-nav-icon">{p === "Dashboard" ? "⊞" : "☰"}</span>
              {p}
            </button>
          ))}
        </div>
        <div className="fp-role-wrap" ref={dropRef}>
          <span className="fp-role-label">Role:</span>
          <button className="fp-role-btn" onClick={() => setRoleOpen(o => !o)}>
            <span>{role === "Admin" ? "🔑" : "👁"}</span>
            <span>{role}</span>
            <span className="fp-caret">{roleOpen ? "▲" : "▼"}</span>
          </button>
          {roleOpen && (
            <div className="fp-role-drop">
              {["Admin", "Viewer"].map(r => (
                <button key={r} className={`fp-role-opt${role === r ? " selected" : ""}`}
                  onClick={() => { setRole(r); setRoleOpen(false); }}>
                  <span>{r === "Admin" ? "🔑" : "👁"}</span> {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── DASHBOARD PAGE ── */}
      {page === "Dashboard" && (
        <main className={`fp-main${animate ? " fade-in" : ""}`}>
          {/* Summary Cards */}
          <section className="fp-cards">
            <div className="fp-card fp-card-balance">
              <div className="fp-card-top">
                <span className="fp-card-label">Total Balance</span>
                <span className="fp-card-icon">💳</span>
              </div>
              <div className="fp-card-value">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              <div className="fp-card-sub">Current account balance</div>
            </div>
            <div className="fp-card fp-card-income">
              <div className="fp-card-top">
                <span className="fp-card-label">Total Income</span>
                <span className="fp-card-icon">⊕</span>
              </div>
              <div className="fp-card-value">${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              <div className="fp-card-sub">All time earnings</div>
            </div>
            <div className="fp-card fp-card-expense">
              <div className="fp-card-top">
                <span className="fp-card-label">Total Expenses</span>
                <span className="fp-card-icon">⊖</span>
              </div>
              <div className="fp-card-value">${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              <div className="fp-card-sub">All time spending</div>
            </div>
          </section>

          {/* Charts */}
          <section className="fp-charts">
            {/* Line Chart */}
            <div className="fp-chart-card">
              <h2 className="fp-chart-title"><span>📊</span> Balance Over Time</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={BALANCE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
                  <Tooltip content={<LineTooltip />} />
                  <Line type="monotone" dataKey="balance" stroke="#7c3aed" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="fp-chart-card">
              <h2 className="fp-chart-title"><span>🟠</span> Spending Breakdown</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={SPENDING_DATA}
                    cx="50%" cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={true}
                    label={<CustomLabel />}
                  >
                    {SPENDING_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Recent Transactions preview */}
          <section className="fp-recent">
            <div className="fp-recent-header">
              <h2 className="fp-chart-title">Recent Transactions</h2>
              <button className="fp-see-all" onClick={() => setPage("Transactions")}>See all →</button>
            </div>
            <div className="fp-tx-list">
              {txs.slice(0, 5).map(t => (
                <div key={t.id} className="fp-tx-row">
                  <div className="fp-tx-icon">{CAT_ICONS[t.cat] || "📦"}</div>
                  <div className="fp-tx-info">
                    <div className="fp-tx-desc">{t.desc}</div>
                    <div className="fp-tx-meta">{t.cat} · {t.date}</div>
                  </div>
                  <div className={`fp-tx-amount ${t.type}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ── TRANSACTIONS PAGE ── */}
      {page === "Transactions" && (
        <main className={`fp-main${animate ? " fade-in" : ""}`}>
          <div className="fp-tx-page">
            {/* Controls */}
            <div className="fp-tx-controls">
              <div className="fp-search-wrap">
                <span className="fp-search-icon">🔍</span>
                <input className="fp-search" placeholder="Search transactions…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="fp-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select className="fp-filter" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">All Categories</option>
                {["Food","Travel","Shopping","Bills","Entertainment","Healthcare","Income"].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
              <select className="fp-filter" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date-desc">Date ↓</option>
                <option value="date-asc">Date ↑</option>
                <option value="amount-desc">Amount ↓</option>
                <option value="amount-asc">Amount ↑</option>
              </select>
              {isAdmin && (
                <button className="fp-add-btn" onClick={() => setShowModal(true)}>+ Add</button>
              )}
            </div>

            {/* Table */}
            <div className="fp-table-wrap">
              <table className="fp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="fp-empty">No transactions found.</td></tr>
                  ) : filtered.map(t => (
                    <tr key={t.id}>
                      <td className="fp-td-date">{t.date}</td>
                      <td>
                        <div className="fp-td-desc-wrap">
                          <span className="fp-td-icon">{CAT_ICONS[t.cat] || "📦"}</span>
                          {t.desc}
                        </div>
                      </td>
                      <td><span className={`fp-cat-badge fp-cat-${t.cat.toLowerCase()}`}>{t.cat}</span></td>
                      <td><span className={`fp-type-badge ${t.type}`}>{t.type}</span></td>
                      <td className={`fp-td-amount ${t.type}`}>
                        {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fp-tx-footer">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </main>
      )}

      {/* ── MODAL ── */}
      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addTx} />}
    </div>
  );
}