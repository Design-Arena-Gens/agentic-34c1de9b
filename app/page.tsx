"use client";

import { useMemo, useState } from "react";

type Property = {
  id: string;
  name: string;
  address: string;
  units: number;
  occupiedUnits: number;
  rent: number;
  amenities: string[];
};

type Tenant = {
  id: string;
  name: string;
  unit: string;
  propertyId: string;
  phone: string;
  email: string;
  leaseEnd: string;
  status: "Current" | "Notice" | "Late";
  rentDue: number;
  dueDate: string;
  balance: number;
};

type Payment = {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: "Paid" | "Partial" | "Due";
  method: "ACH" | "Check" | "Cash" | "Card";
  note?: string;
};

type MaintenanceRequest = {
  id: string;
  propertyId: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "Scheduled" | "Completed";
  reportedOn: string;
  details: string;
  assignedTo?: string;
};

type LeaseReminder = {
  id: string;
  tenantId: string;
  message: string;
  due: string;
};

const initialProperties: Property[] = [
  {
    id: "p-1",
    name: "Maple Grove Residences",
    address: "2140 Maple Ave, Portland, OR",
    units: 32,
    occupiedUnits: 29,
    rent: 1850,
    amenities: ["Parking", "Gym", "Storage", "Pet Friendly"]
  },
  {
    id: "p-2",
    name: "Harborview Lofts",
    address: "88 Pier St, Seattle, WA",
    units: 18,
    occupiedUnits: 17,
    rent: 2350,
    amenities: ["Rooftop", "Co-working", "EV Charging"]
  },
  {
    id: "p-3",
    name: "Cedar Park Homes",
    address: "521 Cedar Ln, Boise, ID",
    units: 24,
    occupiedUnits: 21,
    rent: 1650,
    amenities: ["Playground", "Covered Parking"]
  }
];

const initialTenants: Tenant[] = [
  {
    id: "t-1",
    name: "Alex Johnson",
    unit: "3B",
    propertyId: "p-1",
    phone: "(503) 555-8812",
    email: "alex.johnson@email.com",
    leaseEnd: "2024-11-30",
    status: "Current",
    rentDue: 1850,
    dueDate: "2024-06-01",
    balance: 0
  },
  {
    id: "t-2",
    name: "Priya Singh",
    unit: "Loft 6",
    propertyId: "p-2",
    phone: "(206) 555-4421",
    email: "priya.singh@email.com",
    leaseEnd: "2025-02-28",
    status: "Current",
    rentDue: 2350,
    dueDate: "2024-06-01",
    balance: 2350
  },
  {
    id: "t-3",
    name: "Miguel Torres",
    unit: "1A",
    propertyId: "p-3",
    phone: "(208) 555-7102",
    email: "miguel.torres@email.com",
    leaseEnd: "2024-09-30",
    status: "Late",
    rentDue: 1650,
    dueDate: "2024-05-05",
    balance: 450
  },
  {
    id: "t-4",
    name: "Sasha Petrov",
    unit: "2D",
    propertyId: "p-1",
    phone: "(503) 555-4433",
    email: "sasha.petrov@email.com",
    leaseEnd: "2024-07-31",
    status: "Notice",
    rentDue: 1750,
    dueDate: "2024-06-01",
    balance: 1750
  }
];

const initialPayments: Payment[] = [
  {
    id: "pay-1",
    tenantId: "t-1",
    amount: 1850,
    date: "2024-05-01",
    status: "Paid",
    method: "ACH"
  },
  {
    id: "pay-2",
    tenantId: "t-2",
    amount: 1000,
    date: "2024-05-02",
    status: "Partial",
    method: "Card",
    note: "Partial payment, remainder scheduled"
  },
  {
    id: "pay-3",
    tenantId: "t-3",
    amount: 1200,
    date: "2024-04-29",
    status: "Paid",
    method: "Check"
  }
];

const initialMaintenance: MaintenanceRequest[] = [
  {
    id: "m-1",
    propertyId: "p-2",
    title: "HVAC not cooling",
    priority: "High",
    status: "Scheduled",
    reportedOn: "2024-05-25",
    details: "Unit Loft 6 reporting limited cooling, tech scheduled 05/28",
    assignedTo: "Breeze Mechanical"
  },
  {
    id: "m-2",
    propertyId: "p-1",
    title: "Hallway lighting upgrade",
    priority: "Medium",
    status: "Open",
    reportedOn: "2024-05-20",
    details: "LED retrofit requested for floors 2-3"
  },
  {
    id: "m-3",
    propertyId: "p-3",
    title: "Appliance replacement",
    priority: "Low",
    status: "Completed",
    reportedOn: "2024-05-11",
    details: "Range replaced unit 4C",
    assignedTo: "Northwest Homes"
  }
];

const leaseReminders: LeaseReminder[] = [
  {
    id: "lr-1",
    tenantId: "t-4",
    message: "Renewal decision needed",
    due: "2024-06-15"
  },
  {
    id: "lr-2",
    tenantId: "t-1",
    message: "Pre-inspection walkthrough",
    due: "2024-10-15"
  }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (input: string) =>
  new Date(input).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const priorityStyle = {
  High: "danger",
  Medium: "warning",
  Low: "success"
} as const;

const statusStyle = {
  Paid: "success",
  Partial: "warning",
  Due: "danger",
  Current: "success",
  Notice: "warning",
  Late: "danger"
} as const;

const tabs = ["Dashboard", "Properties", "Tenants", "Payments", "Maintenance"] as const;

type TabKey = (typeof tabs)[number];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");
  const [properties, setProperties] = useState(initialProperties);
  const [tenants, setTenants] = useState(initialTenants);
  const [payments, setPayments] = useState(initialPayments);
  const [maintenance, setMaintenance] = useState(initialMaintenance);

  const dashboardStats = useMemo(() => {
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
    const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
    const monthlyRent = tenants.reduce((sum, t) => sum + t.rentDue, 0);
    const overdueBalance = tenants
      .filter((t) => t.status !== "Current")
      .reduce((sum, t) => sum + t.balance + (t.status === "Notice" ? t.rentDue : 0), 0);
    const openWorkOrders = maintenance.filter((request) => request.status !== "Completed").length;

    return {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      monthlyRent,
      overdueBalance,
      openWorkOrders
    };
  }, [properties, tenants, maintenance]);

  const propertyMap = useMemo(
    () =>
      properties.reduce<Record<string, Property>>((acc, property) => {
        acc[property.id] = property;
        return acc;
      }, {}),
    [properties]
  );

  const tenantMap = useMemo(
    () =>
      tenants.reduce<Record<string, Tenant>>((acc, tenant) => {
        acc[tenant.id] = tenant;
        return acc;
      }, {}),
    [tenants]
  );

  const addMaintenance = (data: Omit<MaintenanceRequest, "id">) => {
    const timestamp = new Date().getTime();
    setMaintenance((prev) => [
      {
        id: `m-${timestamp}`,
        ...data
      },
      ...prev
    ]);
  };

  const recordPayment = (tenantId: string, amount: number, method: Payment["method"], note?: string) => {
    const timestamp = new Date().getTime();
    setPayments((prev) => [
      {
        id: `pay-${timestamp}`,
        tenantId,
        amount,
        date: new Date().toISOString(),
        status: amount >= (tenantMap[tenantId]?.rentDue ?? 0) ? "Paid" : "Partial",
        method,
        note
      },
      ...prev
    ]);

    setTenants((prev) =>
      prev.map((tenant) => {
        if (tenant.id !== tenantId) return tenant;
        const updatedBalance = Math.max(tenant.balance + tenant.rentDue - amount, 0);
        return {
          ...tenant,
          balance: updatedBalance,
          status: updatedBalance === 0 ? "Current" : tenant.status,
          dueDate: new Date(new Date(tenant.dueDate).setMonth(new Date(tenant.dueDate).getMonth() + 1)).toISOString().slice(0, 10)
        };
      })
    );
  };

  const scheduleRentIncrease = (propertyId: string, increasePercent: number) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === propertyId
          ? {
              ...property,
              rent: Math.round(property.rent * (1 + increasePercent / 100))
            }
          : property
      )
    );

    setTenants((prev) =>
      prev.map((tenant) =>
        tenant.propertyId === propertyId
          ? {
              ...tenant,
              rentDue: Math.round(tenant.rentDue * (1 + increasePercent / 100))
            }
          : tenant
      )
    );
  };

  return (
    <main className="container">
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 8 }}>HavenRent Manager</h1>
            <p style={{ color: "#475569", maxWidth: 540 }}>
              Real-time visibility into rent collection, occupancy performance, and maintenance workflows across your rental portfolio.
            </p>
          </div>
          <div className="tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === "Dashboard" && (
        <section className="grid" style={{ gap: 32 }}>
          <div className="stat-grid">
            <div className="stat-card">
              <h3>Total Units</h3>
              <strong>{dashboardStats.totalUnits}</strong>
              <span style={{ color: "#3b82f6", fontWeight: 600 }}>Portfolio</span>
            </div>
            <div className="stat-card">
              <h3>Occupancy</h3>
              <strong>{dashboardStats.occupancyRate}%</strong>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>{dashboardStats.occupiedUnits} occupied</span>
            </div>
            <div className="stat-card">
              <h3>Monthly Rent Roll</h3>
              <strong>{formatCurrency(dashboardStats.monthlyRent)}</strong>
              <span style={{ color: "#0ea5e9", fontWeight: 600 }}>Projection</span>
            </div>
            <div className="stat-card">
              <h3>Outstanding Balance</h3>
              <strong>{formatCurrency(dashboardStats.overdueBalance)}</strong>
              <span style={{ color: "#f97316", fontWeight: 600 }}>Past due</span>
            </div>
          </div>

          <div className="responsive-grid">
            <div className="card">
              <div className="section-title">
                <h2>Collections Health</h2>
                <span>{payments.length} recorded payments</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((payment) => {
                    const tenant = tenantMap[payment.tenantId];
                    const property = tenant ? propertyMap[tenant.propertyId] : undefined;
                    return (
                      <tr key={payment.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{tenant?.name ?? "Unknown"}</div>
                          <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{tenant?.unit}</div>
                        </td>
                        <td>{property?.name}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>
                          <span className={`badge ${statusStyle[payment.status]}`}>{payment.status}</span>
                        </td>
                        <td>{formatDate(payment.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">
                <h2>Upcoming Lease Actions</h2>
                <span>{leaseReminders.length} reminders</span>
              </div>
              <div className="timeline">
                {leaseReminders.map((reminder) => {
                  const tenant = tenantMap[reminder.tenantId];
                  const property = tenant ? propertyMap[tenant.propertyId] : undefined;
                  return (
                    <div key={reminder.id} className="timeline-item">
                      <h4>{tenant?.name}</h4>
                      <p>{reminder.message}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                        <span style={{ color: "#0f172a", fontWeight: 600 }}>{property?.name}</span>
                        <span style={{ color: "#2563eb" }}>{formatDate(reminder.due)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              <h2>Maintenance Pulse</h2>
              <span>{maintenance.filter((m) => m.status !== "Completed").length} active</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Property</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((item) => {
                  const property = propertyMap[item.propertyId];
                  return (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{property?.name}</td>
                      <td>
                        <span className={`badge ${priorityStyle[item.priority]}`}>{item.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.status === "Completed" ? "success" : "warning"}`}>{item.status}</span>
                      </td>
                      <td>{formatDate(item.reportedOn)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "Properties" && (
        <section className="grid" style={{ gap: 32 }}>
          <div className="card">
            <div className="section-title">
              <h2>Portfolio Snapshot</h2>
              <span>{properties.length} properties</span>
            </div>
            <div className="responsive-grid">
              {properties.map((property) => {
                const occupancy = Math.round((property.occupiedUnits / property.units) * 100);
                return (
                  <div key={property.id} className="timeline-item" style={{ background: "white" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{property.name}</h3>
                    <p style={{ color: "#64748b", marginBottom: 8 }}>{property.address}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8" }}>Occupancy</span>
                        <div style={{ fontWeight: 700 }}>{occupancy}%</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8" }}>Rent Avg</span>
                        <div style={{ fontWeight: 700 }}>{formatCurrency(property.rent)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8" }}>Units</span>
                        <div style={{ fontWeight: 700 }}>{property.occupiedUnits} / {property.units}</div>
                      </div>
                    </div>
                    <div className="tag-cloud">
                      {property.amenities.map((amenity) => (
                        <span key={amenity} className="tag">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                      {[5, 7.5].map((percent) => (
                        <button
                          key={percent}
                          className="link"
                          onClick={() => scheduleRentIncrease(property.id, percent)}
                        >
                          +{percent}% rent
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {activeTab === "Tenants" && (
        <section className="card">
          <div className="section-title">
            <h2>Tenant Directory</h2>
            <span>{tenants.length} active leases</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Rent</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Lease End</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tenant.name}</div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Unit {tenant.unit}</div>
                  </td>
                  <td>{propertyMap[tenant.propertyId]?.name}</td>
                  <td>{formatCurrency(tenant.rentDue)}</td>
                  <td>
                    <span className={`badge ${statusStyle[tenant.status]}`}>{tenant.status}</span>
                  </td>
                  <td>{formatCurrency(tenant.balance)}</td>
                  <td>{formatDate(tenant.leaseEnd)}</td>
                  <td>
                    <div>{tenant.phone}</div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{tenant.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "Payments" && (
        <PaymentsPanel tenants={tenants} propertyMap={propertyMap} onRecord={recordPayment} payments={payments} />
      )}

      {activeTab === "Maintenance" && (
        <MaintenancePanel properties={properties} requests={maintenance} onCreate={addMaintenance} />
      )}
    </main>
  );
}

type PaymentsPanelProps = {
  tenants: Tenant[];
  propertyMap: Record<string, Property>;
  payments: Payment[];
  onRecord: (tenantId: string, amount: number, method: Payment["method"], note?: string) => void;
};

function PaymentsPanel({ tenants, propertyMap, payments, onRecord }: PaymentsPanelProps) {
  const [formTenant, setFormTenant] = useState(tenants[0]?.id ?? "");
  const [formAmount, setFormAmount] = useState(tenants[0]?.rentDue ?? 0);
  const [formMethod, setFormMethod] = useState<Payment["method"]>("ACH");
  const [note, setNote] = useState("");

  return (
    <section className="grid" style={{ gap: 32 }}>
      <div className="card">
        <div className="section-title">
          <h2>Record Payment</h2>
          <span>Post rent collection entries</span>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!formTenant || formAmount <= 0) return;
            onRecord(formTenant, formAmount, formMethod, note);
            setNote("");
          }}
          className="grid"
          style={{ gap: 20 }}
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tenant">Tenant</label>
              <select
                id="tenant"
                value={formTenant}
                onChange={(event) => {
                  const tenantId = event.target.value;
                  setFormTenant(tenantId);
                  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
                  if (selectedTenant) {
                    setFormAmount(selectedTenant.rentDue);
                  }
                }}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} – {propertyMap[tenant.propertyId]?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min={0}
                value={formAmount}
                onChange={(event) => setFormAmount(Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label htmlFor="method">Method</label>
              <select id="method" value={formMethod} onChange={(event) => setFormMethod(event.target.value as Payment["method"]) }>
                <option value="ACH">ACH</option>
                <option value="Card">Card</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="note">Notes (optional)</label>
            <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Include memo, reference numbers, or adjustments" />
          </div>
          <button type="submit" className="primary">
            Record payment
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Payment History</h2>
          <span>{payments.length} entries</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const tenant = tenants.find((item) => item.id === payment.tenantId);
              return (
                <tr key={payment.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tenant?.name ?? "Unknown"}</div>
                    {payment.note ? <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{payment.note}</div> : null}
                  </td>
                  <td>{tenant ? propertyMap[tenant.propertyId]?.name : "-"}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`badge ${statusStyle[payment.status]}`}>{payment.status}</span>
                  </td>
                  <td>{formatDate(payment.date)}</td>
                  <td>{payment.method}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type MaintenancePanelProps = {
  properties: Property[];
  requests: MaintenanceRequest[];
  onCreate: (data: Omit<MaintenanceRequest, "id">) => void;
};

function MaintenancePanel({ properties, requests, onCreate }: MaintenancePanelProps) {
  const [form, setForm] = useState({
    propertyId: properties[0]?.id ?? "",
    title: "",
    priority: "Medium" as MaintenanceRequest["priority"],
    status: "Open" as MaintenanceRequest["status"],
    details: "",
    assignedTo: ""
  });

  return (
    <section className="grid" style={{ gap: 32 }}>
      <div className="card">
        <div className="section-title">
          <h2>Create Work Order</h2>
          <span>Schedule maintenance tasks</span>
        </div>
        <form
          className="grid"
          style={{ gap: 20 }}
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.propertyId || !form.title.trim()) return;
            onCreate({
              propertyId: form.propertyId,
              title: form.title,
              priority: form.priority,
              status: form.status,
              details: form.details,
              reportedOn: new Date().toISOString(),
              assignedTo: form.assignedTo || undefined
            });
            setForm({
              propertyId: properties[0]?.id ?? "",
              title: "",
              priority: "Medium",
              status: "Open",
              details: "",
              assignedTo: ""
            });
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="property">Property</label>
              <select
                id="property"
                value={form.propertyId}
                onChange={(event) => setForm((prev) => ({ ...prev, propertyId: event.target.value }))}
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: "span 2" }}>
              <label htmlFor="title">Issue</label>
              <input
                id="title"
                value={form.title}
                placeholder="Brief summary, e.g., Plumbing leak in 4B"
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as MaintenanceRequest["priority"] }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as MaintenanceRequest["status"] }))}
              >
                <option value="Open">Open</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="assignedTo">Vendor/Assignee</label>
              <input
                id="assignedTo"
                value={form.assignedTo}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                placeholder="Name or vendor"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="details">Details</label>
            <textarea
              id="details"
              value={form.details}
              onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              placeholder="Include troubleshooting, vendor instructions, or access notes"
            />
          </div>
          <button type="submit" className="primary">
            Create work order
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Active Requests</h2>
          <span>{requests.length} total</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Property</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{request.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{request.details}</div>
                </td>
                <td>{properties.find((property) => property.id === request.propertyId)?.name ?? "-"}</td>
                <td>
                  <span className={`badge ${priorityStyle[request.priority]}`}>{request.priority}</span>
                </td>
                <td>
                  <span className={`badge ${request.status === "Completed" ? "success" : request.status === "Scheduled" ? "warning" : "danger"}`}>
                    {request.status}
                  </span>
                </td>
                <td>{formatDate(request.reportedOn)}</td>
                <td>{request.assignedTo ?? "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
