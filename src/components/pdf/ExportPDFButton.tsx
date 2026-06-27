'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AttendanceReportPDF, EventDetails } from './AttendanceReportPDF';
import { FileText, Loader2 } from 'lucide-react';
import { getAttendanceReport } from '@/actions/attendance';
import Button from '@/components/ui/button/Button';

interface ExportPDFButtonProps {
  eventId: number;
  eventDetails: EventDetails;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ eventId, eventDetails }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePreview = async () => {
    try {
      setIsGenerating(true);
      
      // Fetch the attendance records dynamically on click (Optimized Fetching)
      const records = await getAttendanceReport(eventId);

      // Generate PDF blob
      const blob = await pdf(<AttendanceReportPDF eventDetails={eventDetails} records={records} />).toBlob();
      
      // Create Object URL and open in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Note: We don't revoke the URL immediately because the new tab needs time to load it.
      // The browser will clean it up when the document is unloaded.
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal menghasilkan PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handlePreview}
      disabled={isGenerating}
      size="sm"
      variant="primary"
      startIcon={isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
    >
      {isGenerating ? 'Menyiapkan...' : 'Preview PDF'}
    </Button>
  );
};

export default ExportPDFButton;
