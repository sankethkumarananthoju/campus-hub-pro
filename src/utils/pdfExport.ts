import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TimetableEntry, PeriodTiming } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function exportTimetableToPDF(
  timetableEntries: TimetableEntry[],
  periodTimings: PeriodTiming[],
  year: 1 | 2 | 3 | 4,
  classID?: string
) {
  const doc = new jsPDF('landscape');
  
  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('College Timetable', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const subtitle = classID 
    ? `Year ${year} - Class ${classID}` 
    : `Year ${year} - All Classes`;
  doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
  
  // Get teaching periods only (no breaks)
  const teachingPeriods = periodTimings.filter(p => !p.isBreak);
  
  // Filter entries for the selected year and class (if specified)
  const filteredEntries = timetableEntries.filter(entry => {
    const yearMatch = entry.year === year;
    const classMatch = classID ? entry.classID === classID : true;
    return yearMatch && classMatch;
  });
  
  // Create table headers
  const headers = ['Period', ...DAYS];
  
  // Create table body
  const tableBody = teachingPeriods.map(period => {
    const row = [
      `${period.label}\n${period.startTime} - ${period.endTime}`
    ];
    
    DAYS.forEach(day => {
      const entry = filteredEntries.find(
        e => e.dayOfWeek === day && e.periodNumber === period.periodNumber
      );
      
      if (entry) {
        const cellContent = classID 
          ? `${entry.subject}\n${entry.teacherName}`
          : `${entry.subject}\n${entry.teacherName}\n(${entry.classID})`;
        row.push(cellContent);
      } else {
        row.push('-');
      }
    });
    
    return row;
  });
  
  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: 30,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      valign: 'middle',
      halign: 'center',
      lineColor: [44, 62, 80],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [26, 188, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    columnStyles: {
      0: { 
        cellWidth: 35,
        fontStyle: 'bold',
        fillColor: [240, 240, 240]
      }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });
  
  // Add footer with generation date
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const footerText = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    doc.text(
      footerText,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Save the PDF
  const filename = classID 
    ? `Timetable_Year${year}_${classID}_${new Date().toISOString().split('T')[0]}.pdf`
    : `Timetable_Year${year}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
}
