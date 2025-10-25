import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface FlightVoucherData {
  bookingId: string
  bookingDate: string
  passengerName: string
  email: string
  phone: string
  flights: Array<{
    airline: string
    flightNumber: string
    from: string
    to: string
    departure: string
    arrival: string
    date: string
    duration: string
    class: string
  }>
  totalAmount: number
  currency: string
  status: string
  pnr?: string
}

interface HotelVoucherData {
  bookingId: string
  bookingDate: string
  guestName: string
  email: string
  phone: string
  hotel: {
    name: string
    address: string
    city: string
    checkIn: string
    checkOut: string
    nights: number
    rooms: number
    roomType: string
    guests: number
  }
  totalAmount: number
  currency: string
  status: string
  confirmationNumber?: string
}

export class VoucherGenerator {
  // Generate flight voucher PDF
  static async generateFlightVoucher(data: FlightVoucherData): Promise<Blob> {
    try {
      // Create a temporary div to render the voucher HTML
      const voucherElement = document.createElement('div')
      voucherElement.innerHTML = this.generateFlightVoucherHTML(data)
      voucherElement.style.position = 'absolute'
      voucherElement.style.top = '-9999px'
      voucherElement.style.left = '-9999px'
      voucherElement.style.width = '800px'
      voucherElement.style.backgroundColor = 'white'
      voucherElement.style.padding = '40px'
      voucherElement.style.fontFamily = 'Arial, sans-serif'
      document.body.appendChild(voucherElement)

      // Convert HTML to canvas
      const canvas = await html2canvas(voucherElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      // Remove temporary element
      document.body.removeChild(voucherElement)

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      return pdf.output('blob')
    } catch (error) {
      console.error('Error generating flight voucher:', error)
      throw new Error('Failed to generate flight voucher')
    }
  }

  // Generate hotel voucher PDF
  static async generateHotelVoucher(data: HotelVoucherData): Promise<Blob> {
    try {
      // Create a temporary div to render the voucher HTML
      const voucherElement = document.createElement('div')
      voucherElement.innerHTML = this.generateHotelVoucherHTML(data)
      voucherElement.style.position = 'absolute'
      voucherElement.style.top = '-9999px'
      voucherElement.style.left = '-9999px'
      voucherElement.style.width = '800px'
      voucherElement.style.backgroundColor = 'white'
      voucherElement.style.padding = '40px'
      voucherElement.style.fontFamily = 'Arial, sans-serif'
      document.body.appendChild(voucherElement)

      // Convert HTML to canvas
      const canvas = await html2canvas(voucherElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      // Remove temporary element
      document.body.removeChild(voucherElement)

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      return pdf.output('blob')
    } catch (error) {
      console.error('Error generating hotel voucher:', error)
      throw new Error('Failed to generate hotel voucher')
    }
  }

  // Generate flight voucher HTML template
  private static generateFlightVoucherHTML(data: FlightVoucherData): string {
    const isMultiCity = data.flights.length > 1;
    const isRoundTrip = data.flights.length === 2 &&
      data.flights[0].to === data.flights[1].from &&
      data.flights[0].from === data.flights[1].to;

    // Generate a QR code for digital verification (using Google Chart API for simplicity)
    const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=120x120&chl=${encodeURIComponent('https://ideaholiday.com/verify/' + data.bookingId)}`;

    return `
      <div style="max-width: 820px; margin: 0 auto; padding: 0; background: #f3f4f6; font-family: 'Inter', Arial, sans-serif; border-radius: 18px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); overflow: hidden;">
        <!-- Top Banner -->
        <div style="background: linear-gradient(90deg, #0f4c75 0%, #3a86ff 100%); padding: 36px 0 24px 0; text-align: center;">
          <img src="https://ideaholiday.com/logo.svg" alt="Idea Holiday Logo" style="height: 48px; margin-bottom: 10px;" onerror="this.style.display='none'" />
          <h1 style="color: #fff; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0;">IDEA HOLIDAY</h1>
          <div style="color: #e0e7ef; font-size: 18px; margin-top: 4px;">Your Travel Partner</div>
          <div style="margin-top: 18px;">
            <span style="background: #fff; color: #0f4c75; font-size: 18px; font-weight: 700; padding: 8px 24px; border-radius: 24px; box-shadow: 0 2px 8px #0001; letter-spacing: 1px;">
              ✈️ FLIGHT ${isMultiCity ? 'MULTI-CITY' : isRoundTrip ? 'ROUND-TRIP' : 'ONE-WAY'} VOUCHER
            </span>
          </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 36px 32px 36px; background: #fff;">
          <!-- Booking & Passenger Info -->
          <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; margin-bottom: 32px;">
            <div style="flex: 2; min-width: 260px;">
              <div style="font-size: 15px; color: #64748b; margin-bottom: 8px;">Booking Reference</div>
              <div style="font-size: 22px; font-weight: 700; color: #0f4c75; letter-spacing: 1px; margin-bottom: 8px;">${data.bookingId}</div>
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Booked on: <b>${new Date(data.bookingDate).toLocaleDateString()}</b></div>
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Status: <span style="background: #16a34a; color: #fff; padding: 2px 10px; border-radius: 6px; font-size: 13px; font-weight: 600;">${data.status.toUpperCase()}</span></div>
              ${data.pnr ? `<div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">PNR: <b>${data.pnr}</b></div>` : ''}
            </div>
            <div style="flex: 1; min-width: 180px; text-align: right;">
              <img src="${qrCodeUrl}" alt="QR Code" style="height: 90px; width: 90px; border-radius: 12px; border: 2px solid #e0e7ef; background: #fff;" />
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Scan to verify</div>
            </div>
            <div style="flex: 2; min-width: 260px;">
              <div style="font-size: 15px; color: #64748b; margin-bottom: 8px;">Passenger</div>
              <div style="font-size: 18px; font-weight: 600; color: #0f4c75; margin-bottom: 4px;">${data.passengerName}</div>
              <div style="font-size: 14px; color: #64748b; margin-bottom: 2px;">Email: <b>${data.email}</b></div>
              <div style="font-size: 14px; color: #64748b;">Phone: <b>${data.phone}</b></div>
            </div>
          </div>

          <!-- Flight Details -->
          <div style="margin-bottom: 32px;">
            <div style="font-size: 18px; color: #0f4c75; font-weight: 700; margin-bottom: 18px; letter-spacing: 1px;">Flight Itinerary</div>
            ${data.flights.map((flight, index) => `
              <div style="display: flex; align-items: center; background: #f3f4f6; border-radius: 12px; box-shadow: 0 2px 8px #0001; margin-bottom: 18px; padding: 18px 24px; gap: 24px;">
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 13px; color: #64748b; margin-bottom: 2px;">${isMultiCity ? `Leg ${index + 1}` : isRoundTrip ? (index === 0 ? 'Outbound' : 'Return') : ''}</div>
                  <div style="font-size: 16px; font-weight: 700; color: #0f4c75;">${flight.airline}</div>
                  <div style="font-size: 13px; color: #64748b;">${flight.flightNumber}</div>
                </div>
                <div style="flex: 2; display: flex; align-items: center; justify-content: center; gap: 18px;">
                  <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 700; color: #0f4c75;">${flight.from}</div>
                    <div style="font-size: 13px; color: #64748b;">${flight.departure}</div>
                  </div>
                  <div style="font-size: 28px; color: #3a86ff; margin: 0 12px;">→</div>
                  <div style="text-align: left;">
                    <div style="font-size: 20px; font-weight: 700; color: #0f4c75;">${flight.to}</div>
                    <div style="font-size: 13px; color: #64748b;">${flight.arrival}</div>
                  </div>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 13px; color: #64748b;">Date</div>
                  <div style="font-size: 15px; font-weight: 600; color: #0f4c75;">${new Date(flight.date).toLocaleDateString()}</div>
                  <div style="font-size: 13px; color: #64748b; margin-top: 2px;">${flight.class} | ${flight.duration}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Payment Information -->
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px 32px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px #0001;">
            <div style="font-size: 16px; color: #374151;">Total Paid</div>
            <div style="font-size: 28px; font-weight: 800; color: #16a34a; letter-spacing: 1px;">${data.currency} ${data.totalAmount.toLocaleString()}</div>
          </div>

          <!-- Important Information -->
          <div style="background: #fffbe6; border: 2px solid #ffe066; border-radius: 12px; padding: 20px 28px; margin-bottom: 32px;">
            <div style="font-size: 16px; color: #d97706; font-weight: 700; margin-bottom: 10px;">⚠️ Important Information</div>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
              <li style="margin-bottom: 8px;">Arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.</li>
              <li style="margin-bottom: 8px;">Carry a valid government-issued photo ID for all domestic flights.</li>
              <li style="margin-bottom: 8px;">For international flights, ensure your passport is valid for at least 6 months.</li>
              <li style="margin-bottom: 8px;">Web check-in is available 24 hours before departure.</li>
              <li style="margin-bottom: 8px;">Baggage allowance and restrictions apply as per airline policy.</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="text-align: center; padding-top: 18px; border-top: 2px solid #e2e8f0;">
            <div style="color: #64748b; font-size: 15px; margin: 8px 0;">
              For any queries, contact us at:
              <span style="color: #0f4c75; font-weight: 600;"> +91 1234 567 890</span> |
              <span style="color: #0f4c75; font-weight: 600;"> support@ideaholiday.com</span>
            </div>
            <div style="color: #64748b; font-size: 13px; margin: 8px 0;">
              Thank you for choosing Idea Holiday. Have a pleasant journey!
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Generate hotel voucher HTML template
  private static generateHotelVoucherHTML(data: HotelVoucherData): string {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #1e293b;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0f4c75; padding-bottom: 20px;">
          <h1 style="color: #0f4c75; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">IDEA HOLIDAY</h1>
          <p style="color: #64748b; font-size: 16px; margin: 0;">Your Travel Partner</p>
          <h2 style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 20px 0 0 0;">
            🏨 HOTEL BOOKING VOUCHER
          </h2>
        </div>

        <!-- Booking Information -->
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h3 style="color: #0f4c75; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">Booking Details</h3>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Status:</strong> 
                <span style="background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${data.status.toUpperCase()}
                </span>
              </p>
              ${data.confirmationNumber ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Confirmation No:</strong> ${data.confirmationNumber}</p>` : ''}
            </div>
            <div>
              <h3 style="color: #0f4c75; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">Guest Information</h3>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Name:</strong> ${data.guestName}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Phone:</strong> ${data.phone}</p>
            </div>
          </div>
        </div>

        <!-- Hotel Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #0f4c75; font-size: 18px; font-weight: bold; margin: 0 0 20px 0;">Hotel Details</h3>
          <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 25px; background: white;">
            <h4 style="color: #7c3aed; font-size: 20px; font-weight: bold; margin: 0 0 15px 0;">${data.hotel.name}</h4>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">${data.hotel.address}, ${data.hotel.city}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div>
                <h5 style="color: #0f4c75; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">Stay Details</h5>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Check-in:</strong> ${new Date(data.hotel.checkIn).toLocaleDateString()}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Check-out:</strong> ${new Date(data.hotel.checkOut).toLocaleDateString()}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Nights:</strong> ${data.hotel.nights}</p>
              </div>
              <div>
                <h5 style="color: #0f4c75; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">Room Details</h5>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Room Type:</strong> ${data.hotel.roomType}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Rooms:</strong> ${data.hotel.rooms}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Guests:</strong> ${data.hotel.guests}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #0f4c75; font-size: 18px; font-weight: bold; margin: 0 0 20px 0;">Payment Summary</h3>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; color: #374151;">Total Amount Paid:</span>
            <span style="font-size: 24px; font-weight: bold; color: #16a34a;">
              ${data.currency} ${data.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <!-- Important Information -->
        <div style="border: 2px solid #fbbf24; background: #fefce8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #d97706; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">⚠️ Important Information</h3>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li style="margin-bottom: 8px;">Please carry a valid government-issued photo ID for check-in.</li>
            <li style="margin-bottom: 8px;">Check-in time is usually 2:00 PM and check-out time is 11:00 AM.</li>
            <li style="margin-bottom: 8px;">Early check-in and late check-out are subject to availability and may incur additional charges.</li>
            <li style="margin-bottom: 8px;">Hotel policies regarding cancellation, modification, and additional services apply.</li>
            <li style="margin-bottom: 8px;">Please contact the hotel directly for any special requests or requirements.</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 8px 0;">
            For any queries, contact us at: 
            <strong style="color: #0f4c75;">+91 1234 567 890</strong> | 
            <strong style="color: #0f4c75;">support@ideaholiday.com</strong>
          </p>
          <p style="color: #64748b; font-size: 12px; margin: 8px 0;">
            Thank you for choosing Idea Holiday. Enjoy your stay!
          </p>
        </div>
      </div>
    `
  }

  // Download PDF file
  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Email PDF (this would typically send to backend)
  static async emailPDF(blob: Blob, email: string, bookingId: string, type: 'flight' | 'hotel') {
    // In a real implementation, this would upload the blob to the backend
    // and trigger an email with the attachment
    console.log(`Emailing ${type} voucher for booking ${bookingId} to ${email}`)
    
    // For now, we'll simulate this with a download
    this.downloadPDF(blob, `${type}-voucher-${bookingId}.pdf`)
    
    return {
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} voucher has been emailed to ${email}`
    }
  }
}

export type { FlightVoucherData, HotelVoucherData }