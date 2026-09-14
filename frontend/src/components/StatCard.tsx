interface StatCardProps {
  title: string;
  value: string;
  change: string;
}

function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
      <p className="stat-change">{change}</p>
    </div>
  );
}

export default StatCard;