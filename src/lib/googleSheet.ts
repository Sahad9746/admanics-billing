import { google } from 'googleapis'

export async function appendRows(rows: any[][], targetSheetId?: string) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const sheetId = targetSheetId || process.env.SHEET_ID

    if (!clientEmail || !privateKey || !sheetId) {
      throw new Error('Google Sheets credentials are not fully configured or no Sheet ID was provided.')
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error appending to Google Sheets:', error)
    throw error
  }
}
