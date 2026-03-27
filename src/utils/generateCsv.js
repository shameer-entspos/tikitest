// utils/generateCsv.js
export function downloadCSV(data, filename = 'data.csv') {
  // Convert array of objects to CSV string
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(value => 
      `"${String(value).replace(/"/g, '""')}"`
    ).join(',')
  ).join('\n');
  
  const csvContent = [headers, rows].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



