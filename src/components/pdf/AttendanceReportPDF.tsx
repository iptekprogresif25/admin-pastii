import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Font registration (optional, but good practice for ensuring consistent rendering)
// Here we just use the default fonts for simplicity, but you can register fonts like Inter or Roboto.

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    backgroundColor: '#ffffff',
  },
  // Kop Surat Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  logoImage: {
    width: 75,
    height: 75,
    position: 'absolute',
    left: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 90, // Make room for logo
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  headerSubtitle2: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  headerAddress: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 1,
  },
  headerLineContainer: {
    marginBottom: 20,
  },
  headerLineThick: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
    marginBottom: 1,
  },
  headerLineThin: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },

  // Document Title
  docTitle: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 15,
    textDecoration: 'underline',
  },

  // Event Info
  eventInfoContainer: {
    marginBottom: 15,
  },
  eventInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventInfoLabel: {
    width: 80,
    fontFamily: 'Times-Bold',
  },
  eventInfoValue: {
    flex: 1,
  },

  // Table Styles
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontFamily: 'Times-Bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  // Column Widths
  colNo: { width: '5%', textAlign: 'center' },
  colName: { width: '25%' },
  colDiv: { width: '15%' },
  colTime: { width: '15%', textAlign: 'center' },
  colStatus: { width: '15%', textAlign: 'center' },
  colNotes: { width: '25%' },

  // Signatures
  signatureContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBox: {
    width: 200,
    alignItems: 'center',
  },
  signatureDate: {
    marginBottom: 10,
  },
  signatureRole: {
    fontFamily: 'Times-Bold',
    marginBottom: 60, // Space for physical signature
  },
  signatureName: {
    fontFamily: 'Times-Bold',
  },
});

export interface AttendanceRecord {
  id: string;
  name: string;
  division: string;
  timeIn: string;
  status: string;
  notes?: string;
}

export interface EventDetails {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface AttendanceReportPDFProps {
  eventDetails: EventDetails;
  records: AttendanceRecord[];
}

export const AttendanceReportPDF: React.FC<AttendanceReportPDFProps> = ({ eventDetails, records }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* KOP SURAT */}
        <View style={styles.header}>
          <Image src="/logo-hima.png" style={styles.logoImage} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>HIMPUNAN MAHASISWA TEKNIK INFORMATIKA</Text>
            <Text style={styles.headerSubtitle}>FAKULTAS ILMU KOMPUTER</Text>
            <Text style={styles.headerSubtitle2}>UNIVERSITAS KUNINGAN</Text>
            <Text style={styles.headerAddress}>Sekretariat : Gedung Fakultas Ilmu Komputer Universitas Kuningan</Text>
            <Text style={styles.headerAddress}>Jl. Pramuka No.67, Purwawinangun, Kuningan 45512</Text>
            <Text style={styles.headerAddress}>E-Mail : hima.ti@uniku.ac.id</Text>
          </View>
        </View>

        {/* GARIS KOP SURAT */}
        <View style={styles.headerLineContainer}>
          <View style={styles.headerLineThick}></View>
          <View style={styles.headerLineThin}></View>
        </View>

        {/* JUDUL DOKUMEN */}
        <Text style={styles.docTitle}>REKAPITULASI KEHADIRAN KEGIATAN</Text>

        {/* INFORMASI KEGIATAN */}
        <View style={styles.eventInfoContainer}>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Nama Kegiatan</Text>
            <Text style={styles.eventInfoValue}>: {eventDetails.title}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Tanggal</Text>
            <Text style={styles.eventInfoValue}>: {eventDetails.date}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Waktu</Text>
            <Text style={styles.eventInfoValue}>: {eventDetails.time}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoLabel}>Lokasi</Text>
            <Text style={styles.eventInfoValue}>: {eventDetails.location}</Text>
          </View>
        </View>

        {/* TABEL KEHADIRAN */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.colNo]}><Text>No</Text></View>
            <View style={[styles.tableColHeader, styles.colName]}><Text>Nama Lengkap</Text></View>
            <View style={[styles.tableColHeader, styles.colDiv]}><Text>Divisi / Unit</Text></View>
            <View style={[styles.tableColHeader, styles.colTime]}><Text>Waktu Hadir</Text></View>
            <View style={[styles.tableColHeader, styles.colStatus]}><Text>Status</Text></View>
            <View style={[styles.tableColHeader, styles.colNotes]}><Text>Keterangan</Text></View>
          </View>

          {/* Table Body */}
          {/* Table Body */}
          {records.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%', textAlign: 'center' }]}>
                <Text>Belum ada data</Text>
              </View>
            </View>
          ) : (
            records.map((record, index) => (
              <View style={styles.tableRow} key={record.id}>
                <View style={[styles.tableCol, styles.colNo]}>
                  <Text>{index + 1}</Text>
                </View>
                <View style={[styles.tableCol, styles.colName]}>
                  <Text>{record.name}</Text>
                </View>
                <View style={[styles.tableCol, styles.colDiv]}>
                  <Text>{record.division}</Text>
                </View>
                <View style={[styles.tableCol, styles.colTime]}>
                  <Text>{record.timeIn || '-'}</Text>
                </View>
                <View style={[styles.tableCol, styles.colStatus]}>
                  <Text>{record.status}</Text>
                </View>
                <View style={[styles.tableCol, styles.colNotes]}>
                  <Text>{record.notes || '-'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* BAGIAN TANDA TANGAN */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>Kuningan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <Text style={styles.signatureRole}>Ketua Pelaksana / Mengetahui,</Text>
            <Text style={styles.signatureName}>(..........................................................)</Text>
            <Text>...............................................</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default AttendanceReportPDF;
