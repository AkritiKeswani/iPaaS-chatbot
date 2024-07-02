import Link from "next/link";

const integrations = [
  { name: "Google Drive", path: "/integrations/google-drive", icon: "📁" },
  { name: "Slack", path: "/integrations/slack", icon: "💬" },
];

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Link
            key={integration.name}
            href={integration.path}
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
          >
            <div className="flex items-center">
              <span className="text-4xl mr-4">{integration.icon}</span>
              <h2 className="text-2xl font-bold">{integration.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
