import type { ServiceRequest } from '../data/types';

export function exportToCSV(data: ServiceRequest[], filename: string = 'service-requests') {
  const headers = [
    'Request ID',
    'Account Name',
    'Vertical',
    'Site Count',
    'Issue Category',
    'Request Date',
    'Status',
    'Urgency',
    'Priority',
    'Time to Respond (h)',
    'Time to Resolution (h)',
    'Resolution Date',
    'Account Health'
  ];

  const rows = data.map(item => [
    item.requestId,
    item.accountName,
    item.vertical,
    item.siteCount.toString(),
    item.issueCategory,
    item.requestDate,
    item.status,
    item.urgency,
    item.priority,
    item.timeToRespond.toString(),
    item.timeToResolution.toString(),
    item.resolutionDate,
    item.accountHealth
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: ServiceRequest[], filename: string = 'service-requests') {
  // Create XML-based Excel format (works without external libraries)
  const headers = [
    'Request ID',
    'Account Name',
    'Vertical',
    'Site Count',
    'Issue Category',
    'Request Date',
    'Status',
    'Urgency',
    'Priority',
    'Time to Respond (h)',
    'Time to Resolution (h)',
    'Resolution Date',
    'Account Health'
  ];

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headerRow = headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('');

  const dataRows = data.map(item => {
    const cells = [
      { value: item.requestId, type: 'String' },
      { value: item.accountName, type: 'String' },
      { value: item.vertical, type: 'String' },
      { value: item.siteCount.toString(), type: 'Number' },
      { value: item.issueCategory, type: 'String' },
      { value: item.requestDate, type: 'String' },
      { value: item.status, type: 'String' },
      { value: item.urgency, type: 'String' },
      { value: item.priority, type: 'String' },
      { value: item.timeToRespond.toString(), type: 'Number' },
      { value: item.timeToResolution.toString(), type: 'Number' },
      { value: item.resolutionDate, type: 'String' },
      { value: item.accountHealth, type: 'String' }
    ];
    return `<Row>${cells.map(c => `<Cell><Data ss:Type="${c.type}">${escapeXml(c.value)}</Data></Cell>`).join('')}</Row>`;
  }).join('\n');

  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Service Requests">
    <Table>
      <Row ss:StyleID="Header">${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
