import * as XLSX from 'xlsx'

export interface ImportedProduct {
  name: string
  description: string
  image_url: string
  price: string
  target_audience: string
}

export function parseProductFile(buffer: Buffer): ImportedProduct[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
  })

  return rows.map((row) => ({
    name: row['name'] || row['Name'] || row['product_name'] || row['Product Name'] || '',
    description:
      row['description'] || row['Description'] || row['desc'] || row['Desc'] || '',
    image_url:
      row['image_url'] || row['Image URL'] || row['image'] || row['Image'] || '',
    price: row['price'] || row['Price'] || '',
    target_audience:
      row['target_audience'] ||
      row['Target Audience'] ||
      row['audience'] ||
      row['Audience'] ||
      '',
  }))
}
