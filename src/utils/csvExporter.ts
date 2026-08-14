import { AttendanceSession, Classroom, AttendanceStatus } from '../types';

export interface ExportCSVOptions {
  sessions: AttendanceSession[];
  classrooms: Classroom[];
  selectedClassId: string;
  startDate: string;
  endDate: string;
}

export interface ExportCSVResult {
  success: boolean;
  message?: string;
  csvContent?: string;
  fileName?: string;
  sessionCount?: number;
  totalRecords?: number;
}

export function generateAttendanceCSV({
  sessions,
  classrooms,
  selectedClassId,
  startDate,
  endDate,
}: ExportCSVOptions): ExportCSVResult {
  // Filter sessions by selected class and date range
  const filtered = sessions.filter((session) => {
    if (selectedClassId !== 'ALL' && session.classId !== selectedClassId) {
      return false;
    }
    if (startDate && session.date < startDate) {
      return false;
    }
    if (endDate && session.date > endDate) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return {
      success: false,
      message: 'Không có dữ liệu điểm danh phù hợp để xuất.',
    };
  }

  // Sort sessions chronologically
  const sortedSessions = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  // Required CSV Headers:
  // - Ngày học
  // - Tên lớp
  // - Mã học sinh
  // - Họ tên học sinh
  // - Trạng thái
  // - Ghi chú
  const headers = ['Ngày học', 'Tên lớp', 'Mã học sinh', 'Họ tên học sinh', 'Trạng thái', 'Ghi chú'];

  const statusToVietnamese = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present':
        return 'Có mặt';
      case 'absent':
        return 'Vắng';
      case 'late':
        return 'Đi muộn';
      case 'excused':
        return 'Có phép';
      default:
        return status;
    }
  };

  const escapeCSVCell = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [];
  // Add Header Row
  rows.push(headers.map(escapeCSVCell).join(','));

  let totalRecordsCount = 0;

  sortedSessions.forEach((session) => {
    // Format date YYYY-MM-DD to DD/MM/YYYY for Vietnamese display
    const dateParts = session.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : session.date;

    session.records.forEach((record) => {
      totalRecordsCount++;
      const row = [
        formattedDate,
        session.className,
        record.studentCode,
        record.studentName,
        statusToVietnamese(record.status),
        record.note || '',
      ];
      rows.push(row.map(escapeCSVCell).join(','));
    });
  });

  // UTF-8 BOM byte prefix (\uFEFF) ensures Excel & Google Sheets render Vietnamese characters correctly
  const csvContent = '\uFEFF' + rows.join('\r\n');

  // Filename format: Diem_danh_TenLop_NgayBatDau_NgayKetThuc.csv
  let classNamePart = 'Tat_ca_cac_lop';
  if (selectedClassId !== 'ALL') {
    const matchedClass = classrooms.find((c) => c.id === selectedClassId);
    const rawClassName = matchedClass ? matchedClass.name : (sortedSessions[0]?.className || 'Lop');
    // Sanitize class name for valid filename
    classNamePart = rawClassName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
  }

  const startDatePart = startDate || (sortedSessions[0]?.date || 'TuDau');
  const endDatePart = endDate || (sortedSessions[sortedSessions.length - 1]?.date || 'DenNay');

  const fileName = `Diem_danh_${classNamePart}_${startDatePart}_${endDatePart}.csv`;

  return {
    success: true,
    csvContent,
    fileName,
    sessionCount: sortedSessions.length,
    totalRecords: totalRecordsCount,
  };
}

export function downloadCSVFile(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
