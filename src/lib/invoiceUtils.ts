import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

function convertTens(num: number): string {
  if (num < 10) return ones[num]
  if (num >= 10 && num < 20) return teens[num - 10]
  const tenUnit = Math.floor(num / 10)
  const oneUnit = num % 10
  return tens[tenUnit] + (oneUnit > 0 ? " " + ones[oneUnit] : "")
}

function convertHundreds(num: number): string {
  if (num > 99) {
    const hundredUnit = Math.floor(num / 100)
    const remainder = num % 100
    return ones[hundredUnit] + " Hundred" + (remainder > 0 ? " and " + convertTens(remainder) : "")
  } else {
    return convertTens(num)
  }
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num))
  
  let words = ""
  
  const crore = Math.floor(num / 10000000)
  num -= crore * 10000000
  if (crore > 0) words += convertHundreds(crore) + " Crore "
  
  const lakh = Math.floor(num / 100000)
  num -= lakh * 100000
  if (lakh > 0) words += convertHundreds(lakh) + " Lakh "
  
  const thousand = Math.floor(num / 1000)
  num -= thousand * 1000
  if (thousand > 0) words += convertHundreds(thousand) + " Thousand "
  
  if (num > 0) words += convertHundreds(num)
  
  return words.trim() + ' Only'
}

export async function downloadPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = await html2canvas(element, { 
      scale: 2.5, // High resolution print scale
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Reset body margins to ensure coordinate system starts at absolute 0
        clonedDoc.body.style.margin = '0'
        clonedDoc.body.style.padding = '0'
        
        const clonedElement = clonedDoc.getElementById(elementId)
        if (clonedElement) {
          clonedElement.style.transform = 'none'
          clonedElement.style.position = 'absolute'
          clonedElement.style.left = '0'
          clonedElement.style.top = '0'
          clonedElement.style.margin = '0'
          clonedElement.style.width = '210mm'
          clonedElement.style.boxShadow = 'none'
          clonedElement.style.borderRadius = '0'
          
          // Traverse up and remove transforms and hidden overflow to prevent cropping
          let parent = clonedElement.parentElement
          while (parent && parent !== clonedDoc.body) {
            parent.style.transform = 'none'
            parent.style.overflow = 'visible'
            parent.style.width = 'auto'
            parent.style.height = 'auto'
            parent.style.maxHeight = 'none'
            parent.style.margin = '0'
            parent.style.padding = '0'
            parent = parent.parentElement
          }
        }
      }
    })
    
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Handle subsequent pages if content overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error('Failed to generate PDF', error)
  }
}
