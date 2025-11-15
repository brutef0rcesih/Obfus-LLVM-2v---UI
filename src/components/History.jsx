function History() {
  const historyData = [
    { file: "application.o", date: "2025-11-13 14:23", profile: "Balanced", status: "Complete" },
    { file: "server.exe", date: "2025-11-12 09:15", profile: "Maximum", status: "Complete" },
    { file: "libcore.dll", date: "2025-11-11 16:42", profile: "Fast", status: "Complete" },
    { file: "module.bc", date: "2025-11-10 11:05", profile: "Balanced", status: "Complete" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border-2 border-gray-400">
        <div className="px-3 py-2 bg-gray-200 border-b-2 border-gray-400">
          <h3 className="text-xs font-bold text-gray-900 uppercase">Obfuscation History</h3>
          <p className="text-xs text-gray-700 mt-0.5">View past obfuscation operations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-400">
                <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-900 border-r-2 border-gray-400 uppercase">File Name</th>
                <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-900 border-r-2 border-gray-400 uppercase">Date</th>
                <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-900 border-r-2 border-gray-400 uppercase">Profile</th>
                <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-900 border-r-2 border-gray-400 uppercase">Status</th>
                <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, index) => (
                <tr key={index} className="border-b border-gray-400 hover:bg-gray-100">
                  <td className="px-2 py-1.5 border-r-2 border-gray-400">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-900">{item.file}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-r-2 border-gray-400">
                    <span className="text-xs text-gray-700">{item.date}</span>
                  </td>
                  <td className="px-2 py-1.5 border-r-2 border-gray-400">
                    <span className={`px-1.5 py-0.5 text-xs font-bold border-2 ${
                      item.profile === "Fast" ? "bg-green-200 text-green-900 border-gray-600" :
                      item.profile === "Balanced" ? "bg-blue-200 text-blue-900 border-gray-600" :
                      "bg-red-200 text-red-900 border-gray-600"
                    }`}>
                      {item.profile}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 border-r-2 border-gray-400">
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-green-200 text-green-900 border-2 border-gray-600">
                      ✓ {item.status}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <button className="text-gray-700 hover:text-gray-900 border-2 border-gray-400 bg-gray-200 px-1.5 py-0.5 text-xs font-bold hover:bg-gray-300">
                      ↓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default History;

